import React, { useState, useEffect } from 'react';
import InteractiveGlobe from './components/InteractiveGlobe';
import { LOCATIONS } from './constants';

const App: React.FC = () => {
  // Now tracking ID instead of just country name to distinguish multiple races in one country
  const [activeLocationId, setActiveLocationId] = useState<number | null>(null);

  // Track if user is interacting with the list directly to prevent fighting over scroll control
  const [isHoveringList, setIsHoveringList] = useState(false);

  const [audioTipVisible, setAudioTipVisible] = useState(true);

  // Background Music Logic
  useEffect(() => {
    const audio = new Audio('alive.mp3');
    audio.loop = true;
    audio.volume = 0.6; // Set a reasonable volume

    // Set start time to 5 seconds
    audio.currentTime = 5;

    // Attempt to play immediately
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.log('Autoplay prevented by browser policy. Waiting for user interaction to start music.');
        
        // If blocked, add listeners to play on first interaction
        const enableAudio = () => {
          audio.currentTime = 5;
          audio.play().then(() => setAudioTipVisible(false));
          setAudioTipVisible(false);
          // Remove listeners once played
          document.removeEventListener('click', enableAudio);
          document.removeEventListener('keydown', enableAudio);
          document.removeEventListener('scroll', enableAudio);
          document.removeEventListener('touchstart', enableAudio);
        };

        document.addEventListener('click', enableAudio);
        document.addEventListener('keydown', enableAudio);
        document.addEventListener('scroll', enableAudio);
        document.addEventListener('touchstart', enableAudio);
      });
    } else {
      setAudioTipVisible(false);
    }

    // Cleanup on unmount
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);
  
  // Auto-scroll functionality
  useEffect(() => {
    // Only auto-scroll if we have an active location AND the user is NOT hovering the list.
    // If they are hovering the list, they are manually exploring, so we shouldn't hijack the scroll.
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
  
  return (
    <div className="w-screen h-screen relative bg-[#061D42] overflow-hidden text-white font-sans">
      
      {/* Tips */}
      {audioTipVisible && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',zIndex:9999,background:'rgba(0,0,0,0.5)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',cursor:'pointer'}}>
          CLICK OR TAP TO ENABLE MUSIC
        </div>
      )}

      {/* Background Texture (Base) */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        background: `radial-gradient(circle at center, transparent 0%, #061D42 80%),
                     url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDYxRDQyIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wOCkiLz4KPC9zdmc+')`,
      }}></div>

      {/* Background Image Overlay (Multiply Mode) */}
      <img 
        src="background1.jpg"
        alt="Background Overlay"
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />

      {/* Right Sidebar List (F1 World Tour) - Overlay on Desktop */}
      <aside className="absolute bottom-0 md:top-0 md:right-0 w-full h-1/3 md:h-full md:w-80 bg-slate-900/80 border-t md:border-t-0 md:border-l border-red-900/50 flex flex-col z-30 shadow-2xl backdrop-blur-sm">
        <div className="hidden md:block p-6 border-b border-red-900/20 bg-gradient-to-b from-slate-900/90 to-slate-900/80 relative z-20">
          <h1 className="text-3xl font-black tracking-tighter italic text-white uppercase font-['Rajdhani']">
            F1  <span className="text-[#d11100]">RACE CALENDAR</span>
          </h1>
          <div className="h-1 w-20 bg-[#d11100] mt-2 rounded-full"></div>
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
              return (
                <li 
                  key={loc.id}
                  id={`loc-item-${loc.id}`}
                  onMouseEnter={() => setActiveLocationId(loc.id)}
                  className={`
                    group relative cursor-pointer transition-all duration-300 ease-out font-['Space_Grotesk']
                    ${isActive 
                        ? 'bg-[#0a1624] border-l-4 border-l-[#d11100] scale-105 z-50 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] border-y border-r border-[#d11100]/20 rounded-r-lg my-2 origin-left md:origin-center md:-ml-2 md:w-[105%]' 
                        : 'bg-transparent border-b border-slate-800/50 border-l-4 border-l-transparent hover:bg-slate-800/40'
                    }
                  `}
                >
                  <div className="p-4 flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-4">
                      <span className={`
                        font-black italic w-8 text-right transition-all duration-300 font-['Rajdhani']
                        ${isActive ? 'text-3xl text-[#d11100]' : 'text-xl text-slate-700 group-hover:text-slate-500'}
                      `}>
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
                          <span className="text-[#d11100] text-xs font-bold w-16 shrink-0 pt-0.5">CIRCUIT:</span>
                          <span className="text-slate-200 leading-snug">{loc.circuit}</span>
                       </div>
                       <div className="flex items-center space-x-2">
                          <span className="text-[#d11100] text-xs font-bold w-16 shrink-0">DATE:</span>
                          <span className="text-slate-200">{loc.date}</span>
                       </div>
                       <div className="flex items-center space-x-2">
                          <span className="text-[#d11100] text-xs font-bold w-16 shrink-0">RESULT:</span>
                          <span className="text-white font-mono font-bold">{loc.qualifyingResult} &rarr; {loc.raceResult}</span>
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
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20 p-8 md:p-16 flex flex-col justify-center">
         {/* Logo */}
         <div className="absolute top-8 left-8 md:top-12 md:left-16 font-['Rajdhani'] font-extrabold text-[5rem] italic text-white">
             MV<span className="text-[#d11100]">33</span>
         </div>

         {/* Hero Text */}
         <div className="relative transform -translate-y-1/2 top-1/2 max-w-xl">
             <div className="bg-[#d11100] text-white px-4 py-1 font-bold text-[0.9rem] inline-block transform -skew-x-[15deg] mb-5 shadow-[0_0_20px_rgba(255,24,1,0.5)] font-['Space_Grotesk']">
                 2025 SEASON
             </div>
             <h1 className="font-['Rajdhani'] text-[3rem] md:text-[5rem] leading-[0.9] uppercase m-0 text-white font-bold">
                 Global<br />
                 <span 
                   className="text-transparent text-stroke-red"
                   style={{ textShadow: "0 0 30px rgba(255, 24, 1, 0.3)" }}
                 >
                     Domination
                 </span>
             </h1>
             <div className="mt-8 border-l-4 border-[#d11100] pl-5 text-[#aabce0] leading-relaxed font-['Space_Grotesk'] text-sm md:text-base bg-slate-900/30 backdrop-blur-sm p-4 pointer-events-auto">
                Drag the globe to rotate. Scroll to zoom.<br />
                Hover list or globe to view race schedule & results.
             </div>
         </div>
      </div>

      {/* Globe Layer - Centered in Viewport */}
      <main className="absolute inset-0 w-full h-full flex items-center justify-center z-10">
         <InteractiveGlobe 
            activeLocationId={activeLocationId}
            onLocationHover={setActiveLocationId}
         />
      </main>
    </div>
  );
};

export default App;