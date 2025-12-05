import React, { useState, useEffect, useRef } from 'react';
import VariableProximity from '../components/VariableProximity';
import InteractiveGlobe from '../components/InteractiveGlobe';
import KineticIntro from '../components/KineticIntro';
import RevealText from '../components/RevealText';
import { LOCATIONS } from '../constants';

const App: React.FC = () => {
  // Now tracking ID instead of just country name to distinguish multiple races in one country
  const [activeLocationId, setActiveLocationId] = useState<number | null>(null);

  // Track if user is interacting with the list directly to prevent fighting over scroll control
  const [isHoveringList, setIsHoveringList] = useState(false);

  // Intro Screen State
  const [introVisible, setIntroVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // Audio Instance
  const [audio] = useState(() => {
    const a = new Audio('alive.mp3');
    a.loop = true;
    a.volume = 0.8;
    return a;
  });

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audio]);
  
  // Handle user interaction to start the experience
  const handleStart = () => {
    if (isExiting) return;
    setIsExiting(true);
    audio.currentTime = 5;
    audio.play().catch((e) => console.log("Audio play failed:", e));
    // Wait for the slide-up/fade animation to complete before unmounting
    setTimeout(() => {
      setIntroVisible(false);
    }, 800); // Matched CSS transition time
  };

  // Auto-scroll functionality
  useEffect(() => {
    if (activeLocationId && !isHoveringList) {
      const element = document.getElementById(`loc-item-${activeLocationId}`);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  }, [activeLocationId, isHoveringList]);

  const dominationContainerRef = useRef(null);
  const globalContainerRef = useRef(null);
  const raceCalendarContainerRef = useRef(null);
  const logoContainerRef = useRef(null);

  return (
    <div className="w-screen h-screen relative bg-[#061D42] overflow-hidden text-white font-sans">
      
      {/* Intro / Opening Screen */}
      {introVisible && (
        <KineticIntro onComplete={handleStart} isExiting={isExiting} />
      )}

      {/* Main App Content (Behind Intro) */}
      
      {/* Background Image (Base - Opaque as requested) */}
      <img 
        src="QTR.jpg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />

      {/* Grid overlay removed */}

      {/* Right Sidebar List (F1 World Tour) - Overlay on Desktop */}
      <aside className={`absolute bottom-0 md:top-0 md:right-0 w-full h-1/3 md:h-full md:w-80 bg-slate-900/80 border-t md:border-t-0 md:border-l border-red-900/50 flex flex-col z-30 shadow-2xl backdrop-blur-sm transition-transform duration-1000 delay-500 ${introVisible ? 'translate-x-full md:translate-x-full translate-y-full md:translate-y-0' : 'translate-x-0 translate-y-0'}`}>
        <div className="hidden md:block p-6 border-b border-red-900/20 bg-gradient-to-b from-slate-900/90 to-slate-900/80 relative z-20">
          <div ref={raceCalendarContainerRef} style={{position: 'relative'}}>
            <h1 className="text-3xl font-black tracking-tighter italic text-white uppercase font-['Rajdhani']">
              <VariableProximity
                label={'F1'}
                className={''}
                fromFontVariationSettings="'wght' 400, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                containerRef={raceCalendarContainerRef}
                radius={100}
                falloff='linear'
              />{' '}
              <VariableProximity
                label={'RACE CALENDAR'}
                className={'text-[rgba(205,4,41,1)]'}
                fromFontVariationSettings="'wght' 400, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                containerRef={raceCalendarContainerRef}
                radius={100}
                falloff='linear'
              />
            </h1>
          </div>
          <div className="h-1 w-20 bg-[rgba(205,4,41,1)] mt-2 rounded-full"></div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-transparent px-2 md:px-0 pb-10">
          <ul 
            className="p-0" 
            onMouseEnter={() => setIsHoveringList(true)}
            onMouseLeave={() => {
              setIsHoveringList(false);
              setActiveLocationId(null);
            }}
          >
            {LOCATIONS.map((loc, index) => {
              const isActive = loc.id === activeLocationId;
              // Stagger the animation: Wait for sidebar slide (approx 1s) + index based stagger
              const staggerDelay = 0.8 + (index * 0.05);

              return (
                <li 
                  key={loc.id}
                  id={`loc-item-${loc.id}`}
                  onMouseEnter={() => setActiveLocationId(loc.id)}
                  className={`
                    group relative cursor-pointer transition-all duration-300 ease-out font-['Space_Grotesk']
                    ${isActive 
                        ? 'bg-[#0a1624] border-l-4 border-l-[rgba(205,4,41,1)] scale-105 z-50 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] border-y border-r border-[rgba(205,4,41,0.2)] rounded-r-lg my-2 origin-left md:origin-center md:-ml-2 md:w-[105%]' 
                        : 'bg-transparent border-b border-slate-800/50 border-l-4 border-l-transparent hover:bg-slate-800/40'
                    }
                  `}
                >
                  <div className="p-4 flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-4">
                      <span className={`
                        font-black italic w-8 text-right transition-all duration-300 font-['Rajdhani']
                        ${isActive ? 'text-3xl text-[rgba(205,4,41,1)]' : 'text-xl text-slate-700 group-hover:text-slate-500'}
                      `}>
                         {/* Only animating the number might be too much movement, keep static or simple */}
                         {index + 1}
                      </span>
                      <div>
                        <h3 className={`font-bold transition-all duration-300 ${isActive ? 'text-2xl text-white mb-1 leading-none' : 'text-base text-slate-300'}`}>
                          {loc.city}
                        </h3>
                        <p className={`uppercase tracking-widest font-semibold transition-all duration-300 ${isActive ? 'text-xs text-[#ff5555]' : 'text-[10px] text-slate-500'}`}>
                          {loc.country}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expandable Info Section */}
                  <div className={`
                    overflow-hidden transition-all duration-500 ease-in-out bg-[#050b14]/50
                    ${isActive ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}
                  `}>
                    <div className="p-4 pt-0 pl-16 text-sm text-slate-400 space-y-2">
                       <div className="flex items-start space-x-2">
                          <span className="text-[rgba(205,4,41,1)] text-xs font-bold w-16 shrink-0 pt-0.5">CIRCUIT:</span>
                          <span className="text-slate-200 leading-snug w-full">
                            <RevealText 
                              text={loc.circuit}
                              start={isActive}
                            />
                          </span>
                       </div>
                       <div className="flex items-center space-x-2">
                          <span className="text-[rgba(205,4,41,1)] text-xs font-bold w-16 shrink-0">DATE:</span>
                          <span className="text-slate-200 w-full">
                            <RevealText 
                              text={loc.date}
                              start={isActive}
                            />
                          </span>
                       </div>
                       <div className="flex items-center space-x-2">
                          <span className="text-[rgba(205,4,41,1)] text-xs font-bold w-16 shrink-0">RESULT:</span>
                          <span className="text-white font-mono font-bold w-full">
                            <RevealText 
                              text={`${loc.qualifyingResult} → ${loc.raceResult}`}
                              start={isActive}
                            />
                          </span>
                       </div>
                       <div className="mt-2 text-[10px] text-slate-600 italic text-right pr-2">
                          (Quali &rarr; Race)
                       </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* Left/Center Overlay UI */}
      <div className={`absolute top-0 left-0 w-full h-full pointer-events-none z-20 p-8 md:p-16 flex flex-col justify-center transition-opacity duration-1000 delay-300 ${introVisible ? 'opacity-0' : 'opacity-100'}`}>
         {/* Logo */}
         <div ref={logoContainerRef} className="absolute top-8 left-8 md:top-12 md:left-16 font-['Rajdhani'] font-extrabold text-[5rem] italic text-white leading-none pointer-events-auto">
            <VariableProximity
                label={'MV'}
                className={''}
                fromFontVariationSettings="'wght' 400, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                containerRef={logoContainerRef}
                radius={100}
                falloff='linear'
            />
            <VariableProximity
                label={'33'}
                className={'text-[rgba(238,31,69,1)]'}
                fromFontVariationSettings="'wght' 400, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                containerRef={logoContainerRef}
                radius={100}
                falloff='linear'
            />
         </div>

         {/* Hero Text */}
         <div className="relative transform -translate-y-1/2 top-1/2 max-w-xl">
             <div className="bg-[rgba(205,4,41,1)] text-white px-4 py-1 font-bold text-[0.9rem] inline-block transform -skew-x-[15deg] mb-5 shadow-[0_0_20px_rgba(205,4,41,0.5)] font-['TheGoodMonolith'] tracking-widest">
                 2025 SEASON
             </div>
             <div ref={dominationContainerRef} style={{position: 'relative'}}>
               <h1 className="font-['Rajdhani'] text-[3rem] md:text-[5rem] leading-[0.9] uppercase m-0 text-white font-bold">
                 <div ref={globalContainerRef} style={{position: 'relative', display: 'inline-block'}}>
                   <VariableProximity
                     label={'Global'}
                     className={''}
                     fromFontVariationSettings="'wght' 400, 'opsz' 9"
                     toFontVariationSettings="'wght' 1000, 'opsz' 40"
                     containerRef={globalContainerRef}
                     radius={100}
                     falloff='linear'
                   />
                 </div>
                 <br />
                 <VariableProximity
                   label={'Domination'}
                   className={'text-[rgba(238,31,69,1)]'}
                   fromFontVariationSettings="'wght' 400, 'opsz' 9"
                   toFontVariationSettings="'wght' 1000, 'opsz' 40"
                   containerRef={dominationContainerRef}
                   radius={100}
                   falloff='linear'
                   style={{ textShadow: "0 0 8px rgba(238,31,69,0.95), 0 0 40px rgba(238,31,69,0.45)" }}
                 />
               </h1>
             </div>
             <div className="mt-8 border-l-4 border-[rgba(205,4,41,1)] pl-5 text-[#aabce0] leading-relaxed font-['Space_Grotesk'] text-sm md:text-base bg-slate-900/30 backdrop-blur-sm p-4 pointer-events-auto max-w-[45ch]">
                Drag the globe to rotate. Scroll to zoom.
                <br />
                Hover list or globe to view race schedule & results.
             </div>
         </div>
      </div>

      {/* Globe Layer - Centered in Viewport */}
      <main className={`absolute inset-0 w-full h-full flex items-center justify-center z-10 transition-transform duration-1000 ${introVisible ? 'scale-50 opacity-0' : 'scale-100 opacity-100'}`}>
         <InteractiveGlobe 
            activeLocationId={activeLocationId}
            onLocationHover={setActiveLocationId}
         />
      </main>
    </div>
  );
};

export default App;