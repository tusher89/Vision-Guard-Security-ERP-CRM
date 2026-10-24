import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

interface ClickRipple {
  id: number;
  x: number;
  y: number;
}

interface CyberCursorProps {
  enabled?: boolean;
}

export const CyberCursor: React.FC<CyberCursorProps> = ({ enabled = true }) => {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: -100, y: -100 });
  const [followerPosition, setFollowerPosition] = useState<{ x: number; y: number }>({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isInputHovered, setIsInputHovered] = useState<boolean>(false);
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [ripples, setRipples] = useState<ClickRipple[]>([]);

  const requestRef = useRef<number | null>(null);
  const currentPosRef = useRef<{ x: number; y: number }>({ x: -100, y: -100 });
  const followerPosRef = useRef<{ x: number; y: number }>({ x: -100, y: -100 });
  const lastParticleTime = useRef<number>(0);
  const particleIdCounter = useRef<number>(0);
  const rippleIdCounter = useRef<number>(0);

  // Check for touch device on mount
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;
    setIsTouchDevice(isTouch);
  }, []);

  // Smooth lerp loop for outer follower
  const updateFollower = useCallback(() => {
    const targetX = currentPosRef.current.x;
    const targetY = currentPosRef.current.y;
    
    // Smooth interpolation (lerp factor: 0.18 for smooth responsive cyber gliding)
    followerPosRef.current.x += (targetX - followerPosRef.current.x) * 0.2;
    followerPosRef.current.y += (targetY - followerPosRef.current.y) * 0.2;

    setFollowerPosition({
      x: followerPosRef.current.x,
      y: followerPosRef.current.y
    });

    requestRef.current = requestAnimationFrame(updateFollower);
  }, []);

  useEffect(() => {
    if (!enabled || isTouchDevice) return;

    requestRef.current = requestAnimationFrame(updateFollower);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [enabled, isTouchDevice, updateFollower]);

  // Mouse event listeners
  useEffect(() => {
    if (!enabled || isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      currentPosRef.current = { x: e.clientX, y: e.clientY };
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Check hovered element
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = Boolean(
          target.closest('button') ||
          target.closest('a') ||
          target.closest('input') ||
          target.closest('textarea') ||
          target.closest('select') ||
          target.closest('[role="button"]') ||
          target.closest('.cursor-pointer') ||
          target.classList.contains('cursor-pointer')
        );

        const isInput = Boolean(
          target.closest('input') ||
          target.closest('textarea') ||
          target.closest('[contenteditable="true"]')
        );

        setIsHovered(isInteractive);
        setIsInputHovered(isInput);
      }

      // Generate subtle cyber spark trail particles on movement
      const now = performance.now();
      if (now - lastParticleTime.current > 45) { // every 45ms
        lastParticleTime.current = now;
        const newParticle: Particle = {
          id: particleIdCounter.current++,
          x: e.clientX + (Math.random() * 6 - 3),
          y: e.clientY + (Math.random() * 6 - 3),
          size: Math.random() * 3 + 2,
          color: Math.random() > 0.4 ? 'rgba(6, 182, 212, 0.85)' : 'rgba(59, 130, 246, 0.85)'
        };

        setParticles(prev => [...prev.slice(-12), newParticle]);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsMouseDown(true);
      // Spawn click shockwave ripple
      const newRipple: ClickRipple = {
        id: rippleIdCounter.current++,
        x: e.clientX,
        y: e.clientY
      };
      setRipples(prev => [...prev.slice(-4), newRipple]);
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [enabled, isTouchDevice, isVisible]);

  // Clean up particles
  useEffect(() => {
    if (particles.length === 0) return;
    const timer = setTimeout(() => {
      setParticles(prev => prev.slice(1));
    }, 400);
    return () => clearTimeout(timer);
  }, [particles]);

  // Clean up ripples
  useEffect(() => {
    if (ripples.length === 0) return;
    const timer = setTimeout(() => {
      setRipples(prev => prev.slice(1));
    }, 600);
    return () => clearTimeout(timer);
  }, [ripples]);

  if (!enabled || isTouchDevice || !isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden no-print">
      {/* Dynamic Trail Particles */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0.9, scale: 1 }}
          animate={{ opacity: 0, scale: 0.2, y: p.y + 12 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: '50%',
            boxShadow: `0 0 8px ${p.color}`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Click Shockwave Ripples */}
      {ripples.map(r => (
        <motion.div
          key={r.id}
          initial={{ width: 10, height: 10, opacity: 0.9, scale: 0.5 }}
          animate={{ width: 68, height: 68, opacity: 0, scale: 1.8 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: r.x,
            top: r.y,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: '2px solid rgba(6, 182, 212, 0.9)',
            boxShadow: '0 0 16px rgba(6, 182, 212, 0.7), inset 0 0 8px rgba(59, 130, 246, 0.5)',
          }}
        />
      ))}

      {/* Smooth Outer Follower Reticle */}
      <motion.div
        animate={{
          x: followerPosition.x,
          y: followerPosition.y,
          width: isInputHovered ? 24 : isHovered ? 52 : isMouseDown ? 28 : 36,
          height: isInputHovered ? 34 : isHovered ? 52 : isMouseDown ? 28 : 36,
          borderRadius: isInputHovered ? '4px' : '50%',
          borderColor: isHovered ? 'rgba(6, 182, 212, 0.95)' : 'rgba(56, 189, 248, 0.45)',
          backgroundColor: isHovered ? 'rgba(6, 182, 212, 0.08)' : 'rgba(6, 182, 212, 0.02)',
          boxShadow: isHovered
            ? '0 0 20px rgba(6, 182, 212, 0.45), inset 0 0 12px rgba(6, 182, 212, 0.2)'
            : '0 0 10px rgba(6, 182, 212, 0.2)',
          rotate: isHovered ? 45 : 0
        }}
        transition={{
          type: 'spring',
          stiffness: 450,
          damping: 28,
          mass: 0.4
        }}
        style={{
          position: 'absolute',
          transform: 'translate(-50%, -50%)',
          borderWidth: isInputHovered ? '1.5px' : '1.5px',
          borderStyle: isInputHovered ? 'dashed' : 'solid',
        }}
      >
        {/* Futuristic HUD Corner Crosshairs on Hover */}
        {isHovered && !isInputHovered && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Top tick */}
            <span className="absolute -top-1 w-1.5 h-0.5 bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
            {/* Bottom tick */}
            <span className="absolute -bottom-1 w-1.5 h-0.5 bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
            {/* Left tick */}
            <span className="absolute -left-1 h-1.5 w-0.5 bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
            {/* Right tick */}
            <span className="absolute -right-1 h-1.5 w-0.5 bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
          </div>
        )}
      </motion.div>

      {/* Core Precision Laser Dot */}
      <motion.div
        animate={{
          x: mousePosition.x,
          y: mousePosition.y,
          scale: isMouseDown ? 0.7 : isHovered ? 1.4 : 1,
        }}
        transition={{
          duration: 0.04,
          ease: 'linear'
        }}
        style={{
          position: 'absolute',
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: '#38bdf8',
          boxShadow: '0 0 10px #06b6d4, 0 0 20px #0284c7',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Micro glow ping */}
        <span className="absolute -inset-1 rounded-full bg-cyan-400/40 animate-ping opacity-60" />
      </motion.div>
    </div>
  );
};
