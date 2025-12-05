import React, { useLayoutEffect, useRef } from 'react';

interface RevealTextProps {
  text: string;
  className?: string;
  start?: boolean;
}

const RevealText: React.FC<RevealTextProps> = ({ text, className = "", start = false }) => {
  const elRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!start || !elRef.current || !window.gsap || !window.SplitText) return;

    const el = elRef.current;
    const gsap = window.gsap;
    const SplitText = window.SplitText;

    // Create a GSAP context for easy cleanup
    const ctx = gsap.context(() => {
      // Reset content and visibility
      el.textContent = text;
      gsap.set(el, { opacity: 1 });

      // Split text into lines
      const split = new SplitText(el, {
        type: "lines",
        linesClass: "split-line"
      });

      // Manually wrap inner content of each line to create the mask effect
      // This ensures compatibility even if the specific 'mask' feature version is not perfectly matched
      split.lines.forEach((line: HTMLElement) => {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'block';
        wrapper.style.willChange = 'transform';
        
        // Move all child nodes (text) into the wrapper
        while (line.firstChild) {
          wrapper.appendChild(line.firstChild);
        }
        
        line.appendChild(wrapper);
        
        // Set mask on the line element
        line.style.overflow = 'hidden';
      });

      // Animate the wrappers from bottom up
      const wrappers = split.lines.map((l: HTMLElement) => l.firstElementChild);

      gsap.fromTo(wrappers, 
        { yPercent: 100 }, 
        {
          yPercent: 0,
          duration: 2,
          stagger: 0.1,
          ease: "expo.out"
        }
      );
    }, elRef);

    return () => ctx.revert();
  }, [text, start]);

  return (
    <div 
      ref={elRef} 
      className={className}
      style={{ opacity: 0, position: 'relative' }} // Initially hidden to prevent FOUC
    >
      {text}
    </div>
  );
};

export default RevealText;