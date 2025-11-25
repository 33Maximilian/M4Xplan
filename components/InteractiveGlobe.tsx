import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { COLORS, LOCATIONS } from '../constants';

interface InteractiveGlobeProps {
  activeLocationId: number | null;
  onLocationHover: (id: number | null) => void;
}

const InteractiveGlobe: React.FC<InteractiveGlobeProps> = ({ activeLocationId, onLocationHover }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [geoData, setGeoData] = useState<any[]>([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 800 });
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const lastDragPos = useRef<{ x: number; y: number } | null>(null);
  const requestRef = useRef<number>(0);

  // Load Map Data
  useEffect(() => {
    fetch('./map/world.json')
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        let features: any[] = [];
        // Handle TopoJSON
        if (data.type === 'Topology' && data.objects) {
             const key = Object.keys(data.objects).find(k => ['world', 'countries', 'land', 'states'].includes(k)) || Object.keys(data.objects)[0];
             const object = data.objects[key];
             if (object) {
                 features = (topojson.feature(data as any, object as any) as any).features;
             }
        } 
        // Handle GeoJSON
        else if (data.type === 'FeatureCollection') {
             features = data.features;
        } else if (data.type === 'Feature') {
             features = [data];
        }

        // Robust winding order fix using geoArea
        // If a feature's area is larger than a hemisphere (2*PI), it is defined "inside-out" 
        // (wrapping the ocean instead of the land). We must reverse it.
        const fixedFeatures = features
          .filter(f => f.geometry) 
          .map(f => {
            const feature = JSON.parse(JSON.stringify(f)); // Deep clone
            
            // Helper to reverse rings in a polygon coordinate array
            const reversePolygon = (coords: any[][]) => coords.map((ring) => [...ring].reverse());

            // Check spherical area
            // 2 * Math.PI is the area of a hemisphere. No country is larger than that.
            // If area > 2PI, the geometry is inverted.
            const area = d3.geoArea(feature);
            const isAntarctica = feature.properties?.name === 'Antarctica';
            
            // Antarctica is special because it wraps the pole, but usually geoArea handles it if defined correctly.
            // We mainly care about "hole in the world" artifacts for other countries.
            let shouldReverse = false;
            
            if (area > 2 * Math.PI) {
                shouldReverse = true;
            }

            if (shouldReverse) {
                 const geometry = feature.geometry;
                 if (geometry.type === 'Polygon') {
                     geometry.coordinates = reversePolygon(geometry.coordinates);
                 } else if (geometry.type === 'MultiPolygon') {
                     geometry.coordinates = geometry.coordinates.map((coords: any[][]) => reversePolygon(coords));
                 }
            }
            
            return feature;
        });

        setGeoData(fixedFeatures);
      }).catch(err => {
        console.error("Error loading map data:", err);
      });
  }, []);

  // Handle window resize
  useEffect(() => {
    const updateSize = () => {
      if (wrapperRef.current) {
        const { clientWidth, clientHeight } = wrapperRef.current;
        const size = Math.min(clientWidth, clientHeight);
        setDimensions({ width: size, height: size });
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Identify target location
  const targetLocation = useMemo(() => {
    if (!activeLocationId) return null;
    return LOCATIONS.find(l => l.id === activeLocationId);
  }, [activeLocationId]);

  // Identify active country name for highlighting
  const activeCountryGeoName = useMemo(() => {
    return targetLocation?.geoJsonName || null;
  }, [targetLocation]);

  // Rotation Animation Logic
  useEffect(() => {
    if (targetLocation && !isDragging) {
      const targetLon = -targetLocation.coordinates.lng;
      const targetLat = -targetLocation.coordinates.lat;
      
      const animate = () => {
        setRotation(prev => {
          const [currLon, currLat] = prev;
          let dLon = targetLon - currLon;
          // Normalize longitude diff to take shortest path
          if (dLon > 180) dLon -= 360;
          if (dLon < -180) dLon += 360;
          
          const dLat = targetLat - currLat;
          
          // Stop if close enough
          if (Math.abs(dLon) < 0.5 && Math.abs(dLat) < 0.5) {
             return [targetLon, targetLat, 0];
          }
          const ease = 0.08;
          return [currLon + dLon * ease, currLat + dLat * ease, 0];
        });
        requestRef.current = requestAnimationFrame(animate);
      };
      requestRef.current = requestAnimationFrame(animate);
    } else if (!isDragging && !activeLocationId) {
       // Idle rotation
       const spin = () => {
         setRotation(r => [r[0] + 0.15, r[1], r[2]]);
         requestRef.current = requestAnimationFrame(spin);
       };
       requestRef.current = requestAnimationFrame(spin);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [targetLocation, isDragging, activeLocationId]);

  // Projection Setup
  const projection = useMemo(() => {
    return d3.geoOrthographic()
      .scale((dimensions.width / 2.6) * 0.9 * zoom) 
      .translate([dimensions.width / 2, dimensions.height / 2])
      .rotate(rotation)
      // CRITICAL FIX: Use 89.9 instead of 90. 
      // This prevents boundary singularities where polygons touch the exact clipping horizon,
      // which often causes the "whole world red" inversion glitch.
      .clipAngle(89.9) 
      // Adjusted precision to optimize performance and reduce edge clipping artifacts
      .precision(0.5);
  }, [dimensions, rotation, zoom]);

  const pathGenerator = useMemo(() => {
    return d3.geoPath().projection(projection);
  }, [projection]);

  // Visibility Check (Front vs Back of Globe)
  const isVisible = (lng: number, lat: number) => {
    const center = projection.invert?.([dimensions.width / 2, dimensions.height / 2]);
    if (!center) return false;
    const d = d3.geoDistance([lng, lat], center);
    return d < 1.57; // slightly less than PI/2 to hide markers exactly on edge
  };

  // Input Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastDragPos.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !lastDragPos.current) return;
    const dx = e.clientX - lastDragPos.current.x;
    const dy = e.clientY - lastDragPos.current.y;
    setRotation(prev => [prev[0] + dx * 0.5, prev[1] - dy * 0.5, prev[2]]);
    lastDragPos.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseLeave = () => {
    setIsDragging(false);
    lastDragPos.current = null;
  };
  const handleMouseUp = () => {
    setIsDragging(false);
    lastDragPos.current = null;
  };
  const handleWheel = (e: React.WheelEvent) => {
    const scaleFactor = 1.05;
    const direction = e.deltaY > 0 ? 1 / scaleFactor : scaleFactor;
    setZoom(z => Math.max(0.5, Math.min(4, z * direction)));
  };

  const globeRadius = (dimensions.width / 2.6) * 0.9 * zoom;
  const atmosphereRadius = globeRadius * 1.2;

  // Pre-filter countries that have races
  const raceCountries = useMemo(() => {
      const locationNames = new Set(LOCATIONS.map(l => l.geoJsonName));
      return geoData.filter(d => locationNames.has(d.properties?.name));
  }, [geoData]);

  return (
    <div 
      ref={wrapperRef} 
      className="w-full h-full flex items-center justify-center relative cursor-move"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
    >
      <svg width={dimensions.width} height={dimensions.height} ref={svgRef} style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="oceanGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" />
            <stop offset="55%" stopColor="#000000" /> 
            <stop offset="75%" stopColor="#030e20" /> 
            <stop offset="100%" stopColor={COLORS.OCEAN} />
          </radialGradient>
          
          <radialGradient id="atmosphereHalo" cx="50%" cy="50%" r="50%">
             <stop offset="0%" stopColor="#FF1801" stopOpacity="0" />
             <stop offset="82%" stopColor="#FF1801" stopOpacity="0" />
             <stop offset="83.3%" stopColor="#FF1801" stopOpacity="0.5" />
             <stop offset="100%" stopColor="#FF1801" stopOpacity="0" />
          </radialGradient>

           <filter id="active-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Atmosphere */}
        <circle 
          cx={dimensions.width / 2} 
          cy={dimensions.height / 2} 
          r={atmosphereRadius} 
          fill="url(#atmosphereHalo)"
          style={{ pointerEvents: 'none' }}
        />

        {/* Ocean (Background) */}
        <circle 
          cx={dimensions.width / 2} 
          cy={dimensions.height / 2} 
          r={globeRadius} 
          fill="url(#oceanGradient)"
        />

        {/* Layer 1: All Land Base (Passive) */}
        <g style={{ pointerEvents: 'none' }}>
          {geoData.map((d, i) => (
             <path
                key={`base-${i}`}
                d={pathGenerator(d) || undefined}
                fill={COLORS.LAND}
                stroke={COLORS.STROKE_NORMAL}
                strokeWidth={0.5}
                strokeLinejoin="round"
              />
          ))}
        </g>

        {/* Layer 2: Active Highlight (Only draws the active country) */}
        {activeCountryGeoName && (
            <g style={{ pointerEvents: 'none', filter: 'url(#active-glow)' }}>
                {geoData
                   .filter(d => d.properties?.name === activeCountryGeoName)
                   .map((d, i) => (
                     <path
                        key={`highlight-${i}`}
                        d={pathGenerator(d) || undefined}
                        fill={COLORS.HIGHLIGHT}
                        stroke={COLORS.STROKE_HIGHLIGHT}
                        strokeWidth={1.5}
                        strokeLinejoin="round"
                      />
                   ))
                }
            </g>
        )}

        {/* Layer 3: Interaction Layer (Transparent Hit Targets for Race Countries) */}
        <g>
          {raceCountries.map((d, i) => {
            const countryName = d.properties?.name;
            return (
              <path
                key={`hit-${i}`}
                d={pathGenerator(d) || undefined}
                fill="transparent"
                stroke="none"
                style={{ cursor: 'pointer', pointerEvents: 'all' }}
                onMouseEnter={() => {
                    const countryLocations = LOCATIONS.filter(l => l.geoJsonName === countryName);
                    if (countryLocations.length === 1) {
                        onLocationHover(countryLocations[0].id);
                    } else if (countryLocations.length > 1) {
                        if (!countryLocations.some(l => l.id === activeLocationId)) {
                           onLocationHover(countryLocations[0].id);
                        }
                    }
                }}
                onMouseLeave={() => {
                   // Optional: logic to clear hover
                }}
              />
            );
          })}
        </g>

        {/* Layer 4: Race Locations Markers (Cities) */}
        <g>
          {LOCATIONS.map((loc) => {
             if (!isVisible(loc.coordinates.lng, loc.coordinates.lat)) return null;

             const [cx, cy] = projection([loc.coordinates.lng, loc.coordinates.lat]) || [-999, -999];
             const isActive = activeLocationId === loc.id;
             
             return (
               <g key={loc.id} style={{ pointerEvents: 'all', cursor: 'pointer' }}
                  onMouseEnter={() => onLocationHover(loc.id)}
               >
                 {/* Hit area */}
                 <circle cx={cx} cy={cy} r={12} fill="transparent" />
                 {/* Visible marker */}
                 {isActive && (
                   <circle 
                     cx={cx} 
                     cy={cy} 
                     r={4} 
                     fill={COLORS.HIGHLIGHT}
                     stroke={COLORS.STROKE_HIGHLIGHT}
                     strokeWidth={1}
                     style={{ filter: 'url(#active-glow)' }}
                   />
                 )}
               </g>
             );
          })}
        </g>
        
        {/* Rim Highlight */}
        <circle 
          cx={dimensions.width / 2} 
          cy={dimensions.height / 2} 
          r={globeRadius} 
          fill="none"
          stroke={COLORS.HIGHLIGHT}
          strokeWidth="1"
          opacity="0.2"
          style={{ pointerEvents: 'none' }}
        />
      </svg>
    </div>
  );
};

export default InteractiveGlobe;