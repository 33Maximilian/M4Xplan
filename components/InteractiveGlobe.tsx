import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { COLORS, LOCATIONS } from '../constants';
import { WorldAtlasData } from '../types';

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

  // Animation reference for auto-rotation
  const requestRef = useRef<number>(0);

  // Load map data - 50m for better resolution
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json')
      .then((response) => response.json())
      .then((data: WorldAtlasData) => {
        const countries = topojson.feature(data as any, data.objects.countries as any);
        setGeoData((countries as any).features);
      });
  }, []);

  // Handle resize
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

  // Target Location Logic based on ID
  const targetLocation = useMemo(() => {
    if (!activeLocationId) return null;
    return LOCATIONS.find(l => l.id === activeLocationId);
  }, [activeLocationId]);

  // Derived Active Country Name for Highlighting
  const activeCountryGeoName = useMemo(() => {
    return targetLocation?.geoJsonName || null;
  }, [targetLocation]);

  // Rotation Logic
  useEffect(() => {
    if (targetLocation && !isDragging) {
      const targetLon = -targetLocation.coordinates.lng;
      const targetLat = -targetLocation.coordinates.lat;
      
      const animate = () => {
        setRotation(prev => {
          const [currLon, currLat] = prev;
          let dLon = targetLon - currLon;
          if (dLon > 180) dLon -= 360;
          if (dLon < -180) dLon += 360;
          const dLat = targetLat - currLat;
          
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

  // Projection
  const projection = useMemo(() => {
    // 0.9 scale factor applied
    return d3.geoOrthographic()
      .scale((dimensions.width / 2.6) * 0.9 * zoom) 
      .translate([dimensions.width / 2, dimensions.height / 2])
      .rotate(rotation);
  }, [dimensions, rotation, zoom]);

  const pathGenerator = useMemo(() => {
    return d3.geoPath().projection(projection);
  }, [projection]);

  // Helper to check if a coordinate is on the front side of the globe
  const isVisible = (lng: number, lat: number) => {
    const center = projection.invert?.([dimensions.width / 2, dimensions.height / 2]);
    if (!center) return false;
    const d = d3.geoDistance([lng, lat], center);
    return d < 1.57; // < 90 degrees (approx PI/2)
  };

  // Drag Handlers
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
    onLocationHover(null);
  };
  const handleMouseUp = () => {
    setIsDragging(false);
    lastDragPos.current = null;
  };

  // Zoom Handler
  const handleWheel = (e: React.WheelEvent) => {
    const scaleFactor = 1.05;
    const direction = e.deltaY > 0 ? 1 / scaleFactor : scaleFactor;
    setZoom(z => Math.max(0.5, Math.min(4, z * direction)));
  };

  const globeRadius = (dimensions.width / 2.6) * 0.9 * zoom;
  const atmosphereRadius = globeRadius * 1.2;

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
          {/* Expanded Black Core Gradient */}
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

        {/* Atmosphere Halo */}
        <circle 
          cx={dimensions.width / 2} 
          cy={dimensions.height / 2} 
          r={atmosphereRadius} 
          fill="url(#atmosphereHalo)"
        />

        {/* Ocean Base */}
        <circle 
          cx={dimensions.width / 2} 
          cy={dimensions.height / 2} 
          r={globeRadius} 
          fill="url(#oceanGradient)"
        />

        {/* Countries */}
        <g>
          {geoData.map((d, i) => {
            const isHighlighted = d.properties.name === activeCountryGeoName;
            const isRaceCountry = LOCATIONS.some(l => l.geoJsonName === d.properties.name);
            
            let fill = COLORS.LAND;
            if (isHighlighted) fill = COLORS.HIGHLIGHT;
            
            return (
              <path
                key={i}
                d={pathGenerator(d) || undefined}
                fill={fill}
                stroke={isHighlighted ? COLORS.STROKE_HIGHLIGHT : (isRaceCountry ? COLORS.STROKE_NORMAL : 'none')}
                strokeWidth={isHighlighted ? 2 : 0.5}
                style={{
                   transition: 'fill 0.3s, stroke 0.3s',
                   cursor: isRaceCountry ? 'pointer' : 'default',
                   filter: isHighlighted ? 'url(#active-glow)' : 'none'
                }}
                onMouseMove={(e) => {
                  if (!isRaceCountry) return;
                  
                  // Get all races in this country (e.g., USA has Miami, Austin, Vegas)
                  const countryLocations = LOCATIONS.filter(l => l.geoJsonName === d.properties.name);
                  
                  if (countryLocations.length === 1) {
                    // Simple case: only one race
                    if (activeLocationId !== countryLocations[0].id) {
                       onLocationHover(countryLocations[0].id);
                    }
                  } else {
                    // Complex case: Multiple races (Proximity Detection)
                    // This handles distinguishing Miami vs Austin vs Vegas
                    const [mx, my] = d3.pointer(e, svgRef.current);
                    const inverted = projection.invert?.([mx, my]);
                    
                    if (inverted) {
                      const [lon, lat] = inverted;
                      let closestLoc = countryLocations[0];
                      let minDist = Infinity;

                      countryLocations.forEach(loc => {
                        const dist = d3.geoDistance([lon, lat], [loc.coordinates.lng, loc.coordinates.lat]);
                        if (dist < minDist) {
                          minDist = dist;
                          closestLoc = loc;
                        }
                      });

                      if (activeLocationId !== closestLoc.id) {
                        onLocationHover(closestLoc.id);
                      }
                    }
                  }
                }}
                onMouseLeave={() => {
                   // Handled by wrapper mouseleave mostly, but good to have
                }}
              />
            );
          })}
        </g>

        {/* Markers Layer */}
        <g>
          {LOCATIONS.map((loc) => {
             if (!isVisible(loc.coordinates.lng, loc.coordinates.lat)) return null;

             const [cx, cy] = projection([loc.coordinates.lng, loc.coordinates.lat]) || [-999, -999];
             const isActive = activeLocationId === loc.id;
             
             // Show glowing dot for ANY active location.
             // This visually confirms the specific selection (Miami vs Austin) even though
             // the whole US plate is highlighted.
             const showVisualDot = isActive;

             return (
               <g key={loc.id} style={{ pointerEvents: 'all', cursor: 'pointer' }}
                  onMouseEnter={() => onLocationHover(loc.id)}
               >
                 {/* Invisible Hit Target for easier hovering of small points */}
                 <circle cx={cx} cy={cy} r={12} fill="transparent" />

                 {/* Visible Dot */}
                 {showVisualDot && (
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
        
        {/* Inner Rim Highlight */}
        <circle 
          cx={dimensions.width / 2} 
          cy={dimensions.height / 2} 
          r={globeRadius} 
          fill="none"
          stroke={COLORS.HIGHLIGHT}
          strokeWidth="1"
          opacity="0.2"
        />
      </svg>
    </div>
  );
};

export default InteractiveGlobe;