import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { CustomEase } from 'gsap/CustomEase';

// Register plugins
gsap.registerPlugin(CustomEase, SplitText, ScrambleTextPlugin);

const KineticIntro: React.FC<KineticIntroProps> = ({ onComplete, isExiting }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize animation after component mounts
    const initTimer = setTimeout(() => {
      initializeAnimation();
    }, 100);

    return () => clearTimeout(initTimer);

    function initializeAnimation() {

      CustomEase.create("customEase", "0.86, 0, 0.07, 1");
      CustomEase.create("mouseEase", "0.25, 0.1, 0.25, 1");

      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const backgroundTextItems = wrapper.querySelectorAll(".text-item");
      const backgroundImages = {
        default: wrapper.querySelector("#bg-1"),
        donot: wrapper.querySelector("#bg-2"),
        unleash: wrapper.querySelector("#bg-3"),
        thelion: wrapper.querySelector("#bg-4")
      };

      function switchBackgroundImage(id: string) {
        Object.values(backgroundImages).forEach((bg) => {
          if (bg) {
            gsap.to(bg, {
              opacity: 0,
              duration: 0.8,
              ease: "customEase"
            });
          }
        });

        // @ts-ignore
        if (backgroundImages[id]) {
          // @ts-ignore
          gsap.to(backgroundImages[id], {
            opacity: 1, 
            duration: 0.8,
            ease: "customEase",
            delay: 0.2
          });
        } else {
          gsap.to(backgroundImages.default, {
            opacity: 1, 
            duration: 0.8,
            ease: "customEase",
            delay: 0.2
          });
        }
      }

      // Updated Vocabulary for Max Verstappen Theme
      const alternativeTexts: any = {
        donot: {
          MAX: "NO MERCY",
          VERSTAPPEN: "STOP HIM",
          "RED BULL": "WARNING",
          "RB22": "MECHANICAL",
          "RBPT": "ENGINE FAIL",
          "4X WDC": "HISTORY",
          "UNSTOPPABLE": "RESIST",
          "33": "TARGET",
          "3": "CHASE",
          DOMINANCE: "THEIRS",
          CHAMPION: "RIVAL",
          TELEMETRY: "NOISE",
          APEX: "MISS",
          "SECTOR PURPLE": "YELLOW FLAG",
          "RAIN MASTER": "SLIP",
          "RECORDS": "FORGOTTEN",
          "ORANGE ARMY": "SILENCE",
          "SIMPLY LOVELY": "LUCKY",
          "FULL SEND": "CRASH",
          "POLE POSITION": "GRID PENALTY",
          VICTORY: "LOSS",
          "FASTEST LAP": "SLOW",
          "TIRE WHISPERER": "GRAINING",
          "GP LAMBIASE": "RADIO OFF",
          GAP: "CLOSE",
          "SUPER MAX": "BOO",
          STRATEGY: "PIT ERROR",
          "BOX BOX": "STAY OUT",
          RELENTLESS: "TIRED",
          PRECISION: "SLOPPY",
          AGGRESSION: "PASSIVE",
          DEFENDING: "YIELDING"
        },
        unleash: {
          MAX: "ATTACK",
          VERSTAPPEN: "DESTROY",
          "RED BULL": "CHARGE",
          "RB22": "ROCKET",
          "RBPT": "MAX POWER",
          "4X WDC": "MORE",
          "UNSTOPPABLE": "FORCE",
          "33": "SPEED",
          "3": "LEAD",
          DOMINANCE: "EXPAND",
          CHAMPION: "FIGHT",
          TELEMETRY: "DIALED IN",
          APEX: "HIT",
          "SECTOR PURPLE": "FASTEST",
          "RAIN MASTER": "GRIP",
          "RECORDS": "BROKEN",
          "ORANGE ARMY": "SCREAM",
          "SIMPLY LOVELY": "CLINICAL",
          "FULL SEND": "MAXIMUM",
          "POLE POSITION": "START",
          VICTORY: "TAKE",
          "FASTEST LAP": "PURPLE",
          "TIRE WHISPERER": "MANAGEMENT",
          "GP LAMBIASE": "PUSH",
          GAP: "BUILD",
          "SUPER MAX": "LOUD",
          STRATEGY: "UNDERCUT",
          "BOX BOX": "PIT NOW",
          RELENTLESS: "PUSHING",
          PRECISION: "SURGICAL",
          AGGRESSION: "ATTACK",
          DEFENDING: "WALL"
        },
        thelion: {
          MAX: "SUPREME",
          VERSTAPPEN: "LEGEND",
          "RED BULL": "FAMILY",
          "RB22": "WEAPON",
          "RBPT": "HEART",
          "4X WDC": "5X WDC",
          "UNSTOPPABLE": "ETERNAL",
          "33": "ORIGIN",
          "3": "NUMBER 3",
          DOMINANCE: "ERA",
          CHAMPION: "KING",
          TELEMETRY: "PERFECT",
          APEX: "OWNED",
          "SECTOR PURPLE": "OWNED",
          "RAIN MASTER": "GODLIKE",
          "RECORDS": "LEGACY",
          "ORANGE ARMY": "LOYALTY",
          "SIMPLY LOVELY": "TRADEMARK",
          "FULL SEND": "NATURE",
          "POLE POSITION": "ROUTINE",
          VICTORY: "HABIT",
          "FASTEST LAP": "POINT",
          "TIRE WHISPERER": "MAGIC",
          "GP LAMBIASE": "BROTHER",
          GAP: "MANAGED",
          "SUPER MAX": "ANTHEM",
          STRATEGY: "GENIUS",
          "BOX BOX": "IN LAP",
          RELENTLESS: "NATURE",
          PRECISION: "FOCUS",
          AGGRESSION: "INSTINCT",
          DEFENDING: "TERRITORY"
        }
      };

      backgroundTextItems.forEach((item: any) => {
        item.dataset.originalText = item.textContent;
        item.dataset.text = item.textContent;
        gsap.set(item, { opacity: 1 });
      });

      const typeLines = wrapper.querySelectorAll(".type-line");
      typeLines.forEach((line, index) => {
        if (index % 2 === 0) {
          line.classList.add("odd");
        } else {
          line.classList.add("even");
        }
      });

      const oddLines = wrapper.querySelectorAll(".type-line.odd");
      const evenLines = wrapper.querySelectorAll(".type-line.even");
      const TYPE_LINE_OPACITY = 0.015;

      const state: any = {
        activeRowId: null,
        kineticAnimationActive: false,
        activeKineticAnimation: null,
        textRevealAnimation: null,
        transitionInProgress: false
      };

      const textRows = wrapper.querySelectorAll(".text-row");
      const splitTexts: any = {};

      textRows.forEach((row: any, index) => {
        const textElement = row.querySelector(".text-content") as HTMLElement;
        const text = textElement.dataset.text;
        const rowId = row.dataset.rowId;

        splitTexts[rowId] = new SplitText(textElement, {
          type: "chars",
          charsClass: "char",
          mask: true,
          reduceWhiteSpace: false,
          propIndex: true
        });

        textElement.style.visibility = "visible";
      });

      function updateCharacterWidths() {
        const isMobile = window.innerWidth < 1024;

        textRows.forEach((row: any, index) => {
          const rowId = row.dataset.rowId;
          const textElement = row.querySelector(".text-content");
          const computedStyle = window.getComputedStyle(textElement);
          const currentFontSize = computedStyle.fontSize;
          const chars = splitTexts[rowId].chars;

          chars.forEach((char: any, i: number) => {
            const charText =
              char.textContent ||
              (char.querySelector(".char-inner")
                ? char.querySelector(".char-inner").textContent
                : "");
            if (!charText && i === 0) return;

            let charWidth;

            if (isMobile) {
              const fontSizeValue = parseFloat(currentFontSize);
              const standardCharWidth = fontSizeValue * 0.6;
              charWidth = standardCharWidth;

              if (!char.querySelector(".char-inner") && charText) {
                char.textContent = "";
                const innerSpan = document.createElement("span");
                innerSpan.className = "char-inner";
                innerSpan.textContent = charText;
                char.appendChild(innerSpan);
                innerSpan.style.transform = "translate3d(0, 0, 0)";
              }

              char.style.width = `${charWidth}px`;
              char.style.maxWidth = `${charWidth}px`;
              char.dataset.charWidth = charWidth;
              char.dataset.hoverWidth = charWidth;

              if (charText === ' ') {
                char.style.overflow = 'visible';
              }
            } else {
              const tempSpan = document.createElement("span");
              tempSpan.style.position = "absolute";
              tempSpan.style.visibility = "hidden";
              tempSpan.style.fontSize = currentFontSize;
              tempSpan.style.fontFamily = "Longsile, sans-serif";
              tempSpan.textContent = charText;
              document.body.appendChild(tempSpan);

              const actualWidth = tempSpan.offsetWidth;
              document.body.removeChild(tempSpan);

              const fontSizeValue = parseFloat(currentFontSize);
              const fontSizeRatio = fontSizeValue / 160;
              const padding = 10 * fontSizeRatio;

              charWidth = Math.max(actualWidth + padding, 30 * fontSizeRatio);

              if (!char.querySelector(".char-inner") && charText) {
                char.textContent = "";
                const innerSpan = document.createElement("span");
                innerSpan.className = "char-inner";
                innerSpan.textContent = charText;
                char.appendChild(innerSpan);
                innerSpan.style.transform = "translate3d(0, 0, 0)";
              }

              char.style.width = `${charWidth}px`;
              char.style.maxWidth = `${charWidth}px`;
              char.dataset.charWidth = charWidth;

              const hoverWidth = Math.max(charWidth * 1.8, 85 * fontSizeRatio);
              char.dataset.hoverWidth = hoverWidth;

              if (charText === ' ') {
                char.style.overflow = 'visible';
              }
            }

            char.style.setProperty("--char-index", i);
          });
        });
      }

      updateCharacterWidths();

      window.addEventListener("resize", function () {
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(function () {
          updateCharacterWidths();
        }, 250);
      });

      textRows.forEach((row: any, rowIndex) => {
        const rowId = row.dataset.rowId;
        const chars = splitTexts[rowId].chars;

        gsap.set(chars, {
          opacity: 0,
          filter: "blur(15px)"
        });

        gsap.to(chars, {
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.8,
          stagger: 0.09,
          ease: "customEase",
          delay: 0.15 * rowIndex
        });
      });

      function forceResetKineticAnimation() {
        if (state.activeKineticAnimation) {
          state.activeKineticAnimation.kill();
          state.activeKineticAnimation = null;
        }

        const kineticType = wrapper?.querySelector("#kinetic-type") as HTMLElement;
        if (!kineticType) return;
        
        gsap.killTweensOf([kineticType, typeLines, oddLines, evenLines]);

        gsap.set(kineticType, {
          display: "grid",
          scale: 1,
          rotation: 0,
          opacity: 1,
          visibility: "visible"
        });

        gsap.set(typeLines, {
          opacity: TYPE_LINE_OPACITY,
          x: "0%"
        });

        state.kineticAnimationActive = false;
      }

      function startKineticAnimation(text: string) {
        forceResetKineticAnimation();
        const kineticType = wrapper?.querySelector("#kinetic-type") as HTMLElement;
        if (!kineticType) return;

        kineticType.style.display = "grid";
        kineticType.style.opacity = "1";
        kineticType.style.visibility = "visible";

        const repeatedText = `${text} ${text} ${text}`;

        typeLines.forEach((line) => {
          line.textContent = repeatedText;
        });

        setTimeout(() => {
          const timeline = gsap.timeline({
            onComplete: () => {
              state.kineticAnimationActive = false;
            }
          });

          timeline.to(kineticType, {
            duration: 1.4,
            ease: "customEase",
            scale: 2.7,
            rotation: -90
          });

          timeline.to(
            oddLines,
            {
              keyframes: [
                { x: "20%", duration: 1, ease: "customEase" },
                { x: "-200%", duration: 1.5, ease: "customEase" }
              ],
              stagger: 0.08
            },
            0
          );

          timeline.to(
            evenLines,
            {
              keyframes: [
                { x: "-20%", duration: 1, ease: "customEase" },
                { x: "200%", duration: 1.5, ease: "customEase" }
              ],
              stagger: 0.08
            },
            0
          );

          timeline.to(
            typeLines,
            {
              keyframes: [
                { opacity: 1, duration: 1, ease: "customEase" },
                { opacity: 0, duration: 1.5, ease: "customEase" }
              ],
              stagger: 0.05
            },
            0
          );

          state.kineticAnimationActive = true;
          state.activeKineticAnimation = timeline;
        }, 20);
      }

      function fadeOutKineticAnimation() {
        if (!state.kineticAnimationActive) return;

        if (state.activeKineticAnimation) {
          state.activeKineticAnimation.kill();
          state.activeKineticAnimation = null;
        }

        const kineticType = wrapper?.querySelector("#kinetic-type") as HTMLElement;
        if (!kineticType) return;

        const fadeOutTimeline = gsap.timeline({
          onComplete: () => {
            gsap.set(kineticType, {
              scale: 1,
              rotation: 0,
              opacity: 1
            });

            gsap.set(typeLines, {
              opacity: TYPE_LINE_OPACITY,
              x: "0%"
            });

            state.kineticAnimationActive = false;
          }
        });

        fadeOutTimeline.to(kineticType, {
          opacity: 0,
          scale: 0.8,
          duration: 0.5,
          ease: "customEase"
        });
      }

      function transitionBetweenRows(fromRow: any, toRow: any) {
        if (state.transitionInProgress) return;

        state.transitionInProgress = true;

        const fromRowId = fromRow.dataset.rowId;
        const toRowId = toRow.dataset.rowId;

        fromRow.classList.remove("active");
        const fromChars = splitTexts[fromRowId].chars;
        const fromInners = fromRow.querySelectorAll(".char-inner");

        gsap.killTweensOf(fromChars);
        gsap.killTweensOf(fromInners);

        toRow.classList.add("active");
        state.activeRowId = toRowId;

        const toText = toRow.querySelector(".text-content").dataset.text;
        const toChars = splitTexts[toRowId].chars;
        const toInners = toRow.querySelectorAll(".char-inner");

        forceResetKineticAnimation();
        switchBackgroundImage(toRowId);
        startKineticAnimation(toText);

        if (state.textRevealAnimation) {
          state.textRevealAnimation.kill();
        }
        state.textRevealAnimation = createTextRevealAnimation(toRowId);

        gsap.set(fromChars, {
          maxWidth: (i: any, target: any) => parseFloat(target.dataset.charWidth)
        });

        gsap.set(fromInners, {
          x: 0
        });

        const timeline = gsap.timeline({
          onComplete: () => {
            state.transitionInProgress = false;
          }
        });

        timeline.to(
          toChars,
          {
            maxWidth: (i: any, target: any) => parseFloat(target.dataset.hoverWidth),
            duration: 0.64,
            stagger: 0.04,
            ease: "customEase"
          },
          0
        );

        timeline.to(
          toInners,
          {
            x: -35,
            duration: 0.64,
            stagger: 0.04,
            ease: "customEase"
          },
          0.05
        );
      }

      function createTextRevealAnimation(rowId: string) {
        const timeline = gsap.timeline();

        timeline.to(backgroundTextItems, {
          opacity: 0.3,
          duration: 0.5,
          ease: "customEase"
        });

        timeline.call(() => {
          backgroundTextItems.forEach((item: any) => {
            item.classList.add("highlight");
          });
        });

        timeline.call(
          () => {
            backgroundTextItems.forEach((item: any) => {
              const originalText = item.dataset.text;
              if (
                alternativeTexts[rowId] &&
                alternativeTexts[rowId][originalText]
              ) {
                item.textContent = alternativeTexts[rowId][originalText];
              }
            });
          },
          null,
          "+=0.5"
        );

        timeline.call(() => {
          backgroundTextItems.forEach((item: any) => {
            item.classList.remove("highlight");
            item.classList.add("highlight-reverse");
          });
        });

        timeline.call(
          () => {
            backgroundTextItems.forEach((item: any) => {
              item.classList.remove("highlight-reverse");
            });
          },
          null,
          "+=0.5"
        );

        return timeline;
      }

      function resetBackgroundTextWithAnimation() {
        const timeline = gsap.timeline();

        timeline.call(() => {
          backgroundTextItems.forEach((item: any) => {
            item.classList.add("highlight");
          });
        });

        timeline.call(
          () => {
            backgroundTextItems.forEach((item: any) => {
              item.textContent = item.dataset.originalText;
            });
          },
          null,
          "+=0.5"
        );

        timeline.call(() => {
          backgroundTextItems.forEach((item: any) => {
            item.classList.remove("highlight");
            item.classList.add("highlight-reverse");
          });
        });

        timeline.call(
          () => {
            backgroundTextItems.forEach((item: any) => {
              item.classList.remove("highlight-reverse");
            });
          },
          null,
          "+=0.5"
        );

        timeline.to(backgroundTextItems, {
          opacity: 1,
          duration: 0.5,
          ease: "customEase"
        });

        return timeline;
      }

      function activateRow(row: any) {
        const rowId = row.dataset.rowId;
        if (state.activeRowId === rowId) return;
        if (state.transitionInProgress) return;

        const activeRow = wrapper?.querySelector(".text-row.active");

        if (activeRow) {
          transitionBetweenRows(activeRow, row);
        } else {
          row.classList.add("active");
          state.activeRowId = rowId;

          const text = row.querySelector(".text-content").dataset.text;
          const chars = splitTexts[rowId].chars;
          const innerSpans = row.querySelectorAll(".char-inner");

          switchBackgroundImage(rowId);
          startKineticAnimation(text);

          if (state.textRevealAnimation) {
            state.textRevealAnimation.kill();
          }
          state.textRevealAnimation = createTextRevealAnimation(rowId);

          const timeline = gsap.timeline();

          timeline.to(
            chars,
            {
              maxWidth: (i: any, target: any) => parseFloat(target.dataset.hoverWidth),
              duration: 0.64,
              stagger: 0.04,
              ease: "customEase"
            },
            0
          );

          timeline.to(
            innerSpans,
            {
              x: -35,
              duration: 0.64,
              stagger: 0.04,
              ease: "customEase"
            },
            0.05
          );
        }
      }

      function deactivateRow(row: any) {
        const rowId = row.dataset.rowId;
        if (state.activeRowId !== rowId) return;
        if (state.transitionInProgress) return;

        state.activeRowId = null;
        row.classList.remove("active");

        switchBackgroundImage("default");
        fadeOutKineticAnimation();

        if (state.textRevealAnimation) {
          state.textRevealAnimation.kill();
        }
        state.textRevealAnimation = resetBackgroundTextWithAnimation();

        const chars = splitTexts[rowId].chars;
        const innerSpans = row.querySelectorAll(".char-inner");

        const timeline = gsap.timeline();

        timeline.to(
          innerSpans,
          {
            x: 0,
            duration: 0.64,
            stagger: 0.03,
            ease: "customEase"
          },
          0
        );

        timeline.to(
          chars,
          {
            maxWidth: (i: any, target: any) => parseFloat(target.dataset.charWidth),
            duration: 0.64,
            stagger: 0.03,
            ease: "customEase"
          },
          0.05
        );
      }

      function initializeParallax() {
        if (!wrapper) return;
        const backgroundElements = [
          ...Array.from(wrapper.querySelectorAll("[id$='-bg']")),
          ...Array.from(wrapper.querySelectorAll(".bg-text-container"))
        ];

        const parallaxLayers = [0.02, 0.03, 0.04, 0.05];
        backgroundElements.forEach((el: any, index) => {
          el.dataset.parallaxSpeed =
            parallaxLayers[index % parallaxLayers.length];

          gsap.set(el, {
            transformOrigin: "center center",
            force3D: true
          });
        });

        let lastParallaxTime = 0;
        const throttleParallax = 20;

        const mouseMoveHandler = (e: MouseEvent) => {
          const now = Date.now();
          if (now - lastParallaxTime < throttleParallax) return;
          lastParallaxTime = now;

          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          const offsetX = (e.clientX - centerX) / centerX;
          const offsetY = (e.clientY - centerY) / centerY;

          backgroundElements.forEach((el: any) => {
            const speed = parseFloat(el.dataset.parallaxSpeed);

            if (el.id && el.id.endsWith("-bg") && el.style.opacity === "0") {
              return;
            }

            const moveX = offsetX * 100 * speed;
            const moveY = offsetY * 50 * speed;

            gsap.to(el, {
              x: moveX,
              y: moveY,
              duration: 1.0,
              ease: "mouseEase",
              overwrite: "auto"
            });
          });
        };

        wrapper.addEventListener("mousemove", mouseMoveHandler);

        wrapper.addEventListener("mouseleave", () => {
          backgroundElements.forEach((el) => {
            gsap.to(el, {
              x: 0,
              y: 0,
              duration: 1.5,
              ease: "customEase"
            });
          });
        });

        backgroundElements.forEach((el, index) => {
          const delay = index * 0.2;
          const floatAmount = 5 + (index % 3) * 2;

          gsap.to(el, {
            y: `+=${floatAmount}`,
            duration: 3 + (index % 2),
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: delay
          });
        });
      }

      textRows.forEach((row: any) => {
        const interactiveArea = row.querySelector(".interactive-area");

        interactiveArea.addEventListener("mouseenter", () => {
          activateRow(row);
        });

        interactiveArea.addEventListener("mouseleave", () => {
          if (state.activeRowId === row.dataset.rowId) {
            deactivateRow(row);
          }
        });

        row.addEventListener("click", () => {
          activateRow(row);
        });
      });

      function scrambleRandomText() {
        const randomIndex = Math.floor(
          Math.random() * backgroundTextItems.length
        );
        const randomItem = backgroundTextItems[randomIndex] as HTMLElement;
        const originalText = randomItem.dataset.text;

        gsap.to(randomItem, {
          duration: 1,
          scrambleText: {
            text: originalText,
            chars: "■▪▌▐▬",
            revealDelay: 0.5,
            speed: 0.3
          },
          ease: "none"
        });

        const delay = 0.5 + Math.random() * 2;
        setTimeout(scrambleRandomText, delay * 1000);
      }

      setTimeout(scrambleRandomText, 1000);

      const simplicity = wrapper.querySelector(
        '.text-item[data-text="RECORDS"]'
      );
      if (simplicity) {
        const splitSimplicity = new SplitText(simplicity, {
          type: "chars",
          charsClass: "simplicity-char"
        });

        gsap.from(splitSimplicity.chars, {
          opacity: 0,
          scale: 0.5,
          duration: 1,
          stagger: 0.015,
          ease: "customEase",
          delay: 1
        });
      }

      backgroundTextItems.forEach((item: any, index: number) => {
        const delay = index * 0.1;
        gsap.to(item, {
          opacity: 0.85,
          duration: 2 + (index % 3),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: delay
        });
      });

      initializeParallax();
    }
  }, []);

  return (
    <div 
      className={`kinetic-intro-wrapper ${isExiting ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'}`} 
      ref={wrapperRef}
    >
        <div className="background-frame"></div>

        <div className="background-image default" id="bg-1" style={{ backgroundImage: 'url(1.jpg)' }}></div>
        <div className="background-image donot" id="bg-2" style={{ backgroundImage: 'url(2.jpg)' }}></div>
        <div className="background-image unleash" id="bg-3" style={{ backgroundImage: 'url(3.jpg)' }}></div>
        <div className="background-image thelion" id="bg-4" style={{ backgroundImage: 'url(4.jpg)' }}></div>

        <div className="bottom-gradient"></div>

        <div className="text-background">
        <div className="text-item" style={{top: '5%', left: '8%'}} data-text="MAXIMUM">MAXIMUM</div>
        <div className="text-item" style={{top: '5%', left: '15%'}} data-text="VON DUTCH">VON DUTCH</div>
        <div className="text-item" style={{top: '5%', left: '28%'}} data-text="RED BULL">RED BULL</div>
        <div className="text-item" style={{top: '5%', left: '42%'}} data-text="RB22">RB22</div>
        <div className="text-item" style={{top: '5%', left: '55%'}} data-text="RBPT">RBPT</div>
        <div className="text-item" style={{top: '5%', left: '75%'}} data-text="4X WDC">4X WDC</div>
        <div className="text-item" style={{top: '5%', left: '85%'}} data-text="UNSTOPPABLE">UNSTOPPABLE</div>

        <div className="text-item" style={{top: '10%', left: '12%'}} data-text="33">33</div>
        <div className="text-item" style={{top: '10%', left: '45%'}} data-text="3">3</div>
        <div className="text-item" style={{top: '10%', right: '20%'}} data-text="DOMINANCE">DOMINANCE</div>

        <div className="text-item" style={{top: '15%', left: '8%'}} data-text="CHAMPION">CHAMPION</div>
        <div className="text-item" style={{top: '15%', left: '30%'}} data-text="TELEMETRY">TELEMETRY</div>
        <div className="text-item" style={{top: '15%', left: '55%'}} data-text="APEX">APEX</div>
        <div className="text-item" style={{top: '15%', right: '20%'}} data-text="SECTOR PURPLE">SECTOR PURPLE</div>
        <div className="text-item" style={{top: '15%', right: '5%'}} data-text="RAIN MASTER">RAIN MASTER</div>

        <div className="text-item" style={{top: '25%', left: '5%'}} data-text="RELENTLESS">RELENTLESS</div>
        <div className="text-item" style={{top: '25%', left: '20%'}} data-text="PRECISION">PRECISION</div>
        <div className="text-item" style={{top: '25%', left: '35%'}} data-text="AGGRESSION">AGGRESSION</div>
        <div className="text-item" style={{top: '25%', left: '50%'}} data-text="DEFENDING">DEFENDING</div>
        <div className="text-item" style={{top: '25%', right: '5%'}} data-text="RECORDS">RECORDS</div>

        <div className="text-item" style={{top: '35%', left: '25%'}} data-text="ORANGE ARMY">ORANGE ARMY</div>
        <div className="text-item" style={{top: '35%', left: '65%'}} data-text="SIMPLY LOVELY">SIMPLY LOVELY</div>

        <div className="text-item" style={{top: '50%', left: '5%'}} data-text="FULL SEND">FULL SEND</div>
        <div className="text-item" style={{top: '50%', right: '5%'}} data-text="POLE POSITION">POLE POSITION</div>

        <div className="text-item" style={{top: '75%', left: '20%'}} data-text="VICTORY">VICTORY</div>
        <div className="text-item" style={{top: '75%', right: '20%'}} data-text="FASTEST LAP">FASTEST LAP</div>

        <div className="text-item" style={{top: '80%', left: '10%'}} data-text="TIRE WHISPERER">TIRE WHISPERER</div>
        <div className="text-item" style={{top: '80%', left: '35%'}} data-text="GP LAMBIASE">GP LAMBIASE</div>
        <div className="text-item" style={{top: '80%', left: '65%'}} data-text="GAP">GAP</div>
        <div className="text-item" style={{top: '80%', right: '10%'}} data-text="SUPER MAX">SUPER MAX</div>

        <div className="text-item" style={{top: '85%', left: '25%'}} data-text="STRATEGY">STRATEGY</div>
        <div className="text-item" style={{top: '85%', right: '25%'}} data-text="BOX BOX">BOX BOX</div>
        </div>

        <div className="main-content">
        <div className="sliced-container">
            <div className="text-row" data-row-id="donot">
            <div className="text-content" data-text="DO NOT">DO NOT</div>
            <div className="interactive-area"></div>
            </div>

            <div className="text-row" data-row-id="unleash">
            <div className="text-content" data-text="UNLEASH">UNLEASH</div>
            <div className="interactive-area"></div>
            </div>

            <div className="text-row" data-row-id="thelion">
            <div className="text-content" data-text="THE LION">THE LION</div>
            <div className="interactive-area"></div>
            </div>
        </div>
        </div>

        <div className="type" id="kinetic-type" aria-hidden="true">
        <div className="type-line odd">do not do not do not</div>
        <div className="type-line even">unleash unleash unleash</div>
        <div className="type-line odd">the lion the lion the lion</div>
        <div className="type-line even">do not do not do not</div>
        <div className="type-line odd">unleash unleash unleash</div>
        <div className="type-line even">do not do not do not</div>
        <div className="type-line odd">do not do not do not</div>
        <div className="type-line even">unleash unleash unleash</div>
        <div className="type-line odd">the lion the lion the lion</div>
        <div className="type-line even">do not do not do not</div>
        <div className="type-line odd">unleash unleash unleash</div>
        <div className="type-line even">do not do not do not</div>
        </div>

        <div className="absolute bottom-14 left-0 w-full flex justify-center z-[200]">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onComplete();
                }}
                className="group relative px-6 py-2 bg-transparent border-none outline-none cursor-pointer"
            >
                <span className="text-[#cd0429] font-['Rajdhani'] text-xl md:text-2xl tracking-[0.2em] font-bold uppercase transition-transform duration-300 group-hover:scale-150 inline-block">
                    ENTER 2026 SEASON
                </span>
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#cd0429] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></span>
            </button>
        </div>
    </div>
  );
};

export default KineticIntro;