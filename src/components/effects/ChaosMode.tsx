"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function ChaosMode() {
  const [chaos, setChaos] = useState(false);
  const clickCount = useRef(0);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);
  const animations = useRef<{ el: HTMLElement; anim: Animation }[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    // Instantly reset chaos state on navigation
    setChaos(false);
    animations.current.forEach(({ anim }) => anim.cancel());
    animations.current = [];
  }, [pathname]);

  useEffect(() => {
    const handleClick = () => {
      clickCount.current += 1;
      if (clickTimer.current) clearTimeout(clickTimer.current);

      if (clickCount.current >= 3) {
        clickCount.current = 0;
        setChaos((prev) => !prev);
      } else {
        clickTimer.current = setTimeout(() => {
          clickCount.current = 0;
        }, 500);
      }
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const els = document.querySelectorAll("[data-chaos-item]");
      els.forEach((el) => {
        const hEl = el as HTMLElement;
        hEl.style.transition = "opacity 0.5s";
        hEl.style.opacity = chaos ? "0.5" : "1";
        if (!chaos) {
          setTimeout(() => { hEl.style.transition = ""; }, 500);
        }
      });
      return;
    }

    if (chaos) {
      const els = document.querySelectorAll("[data-chaos-item]");
      
      els.forEach((el, i) => {
        const hEl = el as HTMLElement;
        const rect = hEl.getBoundingClientRect();
        
        // Physics values
        const aboveViewportY = -rect.bottom - 100 - (Math.random() * 200);
        
        const pileOffset = Math.random() * 150; 
        const bottomY = window.innerHeight - rect.bottom - pileOffset;
        
        const maxSpread = Math.min(window.innerWidth * 0.35, 400); 
        const endX = (Math.random() - 0.5) * maxSpread * 2;
        
        const r = (Math.random() - 0.5) * 40; 
        const endR = (Math.random() - 0.5) * 60; 
        
        const delay = i * 80;
        
        hEl.style.zIndex = "9999";
        hEl.style.position = "relative";
        
        const anim = hEl.animate([
          { transform: `translate3d(0px, 0px, 0px) rotate(0deg) scale(1)`, offset: 0, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' },
          { transform: `translate3d(0px, ${aboveViewportY}px, 0px) rotate(${r * 0.5}deg) scale(0.95)`, offset: 0.2, easing: 'ease-in' },
          { transform: `translate3d(${endX * 0.5}px, ${aboveViewportY}px, 0px) rotate(${r}deg) scale(0.95)`, offset: 0.4, easing: 'cubic-bezier(0.5, 0, 0.75, 0)' },
          { transform: `translate3d(${endX}px, ${bottomY}px, 0px) rotate(${endR}deg) scale(1)`, offset: 0.85, easing: 'ease-out' },
          { transform: `translate3d(${endX}px, ${bottomY - 40}px, 0px) rotate(${endR * 1.05}deg) scale(1.02)`, offset: 0.93, easing: 'ease-in' },
          { transform: `translate3d(${endX}px, ${bottomY}px, 0px) rotate(${endR}deg) scale(1)`, offset: 1 }
        ], {
          duration: 1800,
          delay: delay,
          fill: 'forwards'
        });
        
        animations.current.push({ el: hEl, anim });
      });
      
    } else {
      if (animations.current.length > 0) {
        const total = animations.current.length;
        animations.current.forEach(({ el, anim }, i) => {
          const reverseStagger = (total - 1 - i) * 60;
          
          setTimeout(() => {
            anim.reverse();
            anim.onfinish = () => {
              el.style.zIndex = "";
              el.style.position = "";
              anim.cancel();
            };
          }, reverseStagger);
        });
        animations.current = [];
      }
    }
  }, [chaos]);

  return null;
}
