import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

// Register the plugin
gsap.registerPlugin(ScrambleTextPlugin);

interface ScrambleTextProps {
  text: string;
  className?: string;
  start?: boolean; // 控制动画何时开始
  delay?: number;  // 动画延迟
  speed?: number;  // 动画持续时间
  chars?: string;  // 解码字符集
  revealDelay?: number; // 开始显示真实文本前的乱码时间
}

const ScrambleText: React.FC<ScrambleTextProps> = ({ 
  text, 
  className = "", 
  start = true, 
  delay = 0, 
  speed = 0.8,
  chars = "■▪▌▐▬01XY#", // 保持与 KineticIntro 一致的科技感字符
  revealDelay = 0.2
}) => {
  const elRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<any>(null);

  useEffect(() => {
    // 确保 GSAP 和 插件 已加载
    if (!elRef.current) return;

    // 如果未开始，显示为空或保持初始状态（这里选择显示空，等待数据流入的效果）
    if (!start) {
        elRef.current.innerText = ""; 
        return;
    }

    // 杀死旧动画
    if (animationRef.current) {
        animationRef.current.kill();
    }

    // 创建新动画
    animationRef.current = gsap.to(elRef.current, {
      duration: speed,
      scrambleText: {
        text: text,
        chars: chars,
        revealDelay: revealDelay,
        speed: 0.3, // 字符变化速度
        tweenLength: false // 允许长度变化，看起来更像数据传输
      },
      delay: delay,
      ease: "power2.out", // 使用稍平滑的缓动
    });

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [text, start, delay, speed, chars, revealDelay]);

  return <span ref={elRef} className={className} style={{ display: 'inline-block', minWidth: '1em' }}></span>;
};

export default ScrambleText;