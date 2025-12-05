import React, { MouseEvent, useEffect, useRef, useState } from "react";

interface CouplesBadgeProps {
  className?: string;
}

const identityMatrix =
  "1, 0, 0, 0, " +
  "0, 1, 0, 0, " +
  "0, 0, 1, 0, " +
  "0, 0, 0, 1";

const maxRotate = 0.15;
const minRotate = -0.15;
const maxScale = 1;
const minScale = 0.98;

export const CouplesBadge = ({ className = "" }: CouplesBadgeProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [firstOverlayPosition, setFirstOverlayPosition] = useState<number>(0);
  const [matrix, setMatrix] = useState<string>(identityMatrix);
  const [currentMatrix, setCurrentMatrix] = useState<string>(identityMatrix);
  const [disableInOutOverlayAnimation, setDisableInOutOverlayAnimation] = useState<boolean>(true);
  const [disableOverlayAnimation, setDisableOverlayAnimation] = useState<boolean>(false);
  const [isTimeoutFinished, setIsTimeoutFinished] = useState<boolean>(false);
  const enterTimeout = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeout1 = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeout2 = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeout3 = useRef<NodeJS.Timeout | null>(null);

  const getDimensions = () => {
    const left = ref?.current?.getBoundingClientRect()?.left || 0;
    const right = ref?.current?.getBoundingClientRect()?.right || 0;
    const top = ref?.current?.getBoundingClientRect()?.top || 0;
    const bottom = ref?.current?.getBoundingClientRect()?.bottom || 0;

    return { left, right, top, bottom };
  };

  const getMatrix = (clientX: number, clientY: number) => {
    const { left, right, top, bottom } = getDimensions();
    const xCenter = (left + right) / 2;
    const yCenter = (top + bottom) / 2;

    const scale = [
      maxScale - (maxScale - minScale) * Math.abs(xCenter - clientX) / (xCenter - left),
      maxScale - (maxScale - minScale) * Math.abs(yCenter - clientY) / (yCenter - top),
      maxScale - (maxScale - minScale) * (Math.abs(xCenter - clientX) + Math.abs(yCenter - clientY)) / (xCenter - left + yCenter - top)
    ];

    const rotate = {
      x1: 0.15 * ((yCenter - clientY) / yCenter - (xCenter - clientX) / xCenter),
      x2: maxRotate - (maxRotate - minRotate) * Math.abs(right - clientX) / (right - left),
      x3: 0,
      y0: 0,
      y2: maxRotate - (maxRotate - minRotate) * (top - clientY) / (top - bottom),
      y3: 0,
      z0: -(maxRotate - (maxRotate - minRotate) * Math.abs(right - clientX) / (right - left)),
      z1: (0.15 - (0.15 + 0.3) * (top - clientY) / (top - bottom)),
      z3: 0
    };
    return `${scale[0]}, ${rotate.y0}, ${rotate.z0}, 0, ` +
      `${rotate.x1}, ${scale[1]}, ${rotate.z1}, 0, ` +
      `${rotate.x2}, ${rotate.y2}, ${scale[2]}, 0, ` +
      `${rotate.x3}, ${rotate.y3}, ${rotate.z3}, 1`;
  };

  const getOppositeMatrix = (_matrix: string, clientY: number, onMouseEnter?: boolean) => {
    const { top, bottom } = getDimensions();
    const oppositeY = bottom - clientY + top;
    const weakening = onMouseEnter ? 0.7 : 4;
    const multiplier = onMouseEnter ? -1 : 1;

    return _matrix.split(", ").map((item, index) => {
      if (index === 2 || index === 4 || index === 8) {
        return (-parseFloat(item) * multiplier / weakening).toString();
      } else if (index === 0 || index === 5 || index === 10) {
        return "1";
      } else if (index === 6) {
        return (multiplier * (maxRotate - (maxRotate - minRotate) * (top - oppositeY) / (top - bottom)) / weakening).toString();
      } else if (index === 9) {
        return ((maxRotate - (maxRotate - minRotate) * (top - oppositeY) / (top - bottom)) / weakening).toString();
      }
      return item;
    }).join(", ");
  };

  const onMouseEnter = (e: MouseEvent<HTMLDivElement>) => {
    if (leaveTimeout1.current) {
      clearTimeout(leaveTimeout1.current);
    }
    if (leaveTimeout2.current) {
      clearTimeout(leaveTimeout2.current);
    }
    if (leaveTimeout3.current) {
      clearTimeout(leaveTimeout3.current);
    }
    setDisableOverlayAnimation(true);

    const { left, right, top, bottom } = getDimensions();
    const xCenter = (left + right) / 2;
    const yCenter = (top + bottom) / 2;

    setDisableInOutOverlayAnimation(false);
    enterTimeout.current = setTimeout(() => setDisableInOutOverlayAnimation(true), 350);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFirstOverlayPosition((Math.abs(xCenter - e.clientX) + Math.abs(yCenter - e.clientY)) / 1.5);
      });
    });

    const matrix = getMatrix(e.clientX, e.clientY);
    const oppositeMatrix = getOppositeMatrix(matrix, e.clientY, true);

    setMatrix(oppositeMatrix);
    setIsTimeoutFinished(false);
    setTimeout(() => {
      setIsTimeoutFinished(true);
    }, 200);
  };

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { left, right, top, bottom } = getDimensions();
    const xCenter = (left + right) / 2;
    const yCenter = (top + bottom) / 2;

    setTimeout(() => setFirstOverlayPosition((Math.abs(xCenter - e.clientX) + Math.abs(yCenter - e.clientY)) / 1.5), 150);

    if (isTimeoutFinished) {
      setCurrentMatrix(getMatrix(e.clientX, e.clientY));
    }
  };

  const onMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
    const oppositeMatrix = getOppositeMatrix(matrix, e.clientY);

    if (enterTimeout.current) {
      clearTimeout(enterTimeout.current);
    }

    setCurrentMatrix(oppositeMatrix);
    setTimeout(() => setCurrentMatrix(identityMatrix), 200);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setDisableInOutOverlayAnimation(false);
        leaveTimeout1.current = setTimeout(() => setFirstOverlayPosition(-firstOverlayPosition / 4), 150);
        leaveTimeout2.current = setTimeout(() => setFirstOverlayPosition(0), 300);
        leaveTimeout3.current = setTimeout(() => {
          setDisableOverlayAnimation(false);
          setDisableInOutOverlayAnimation(true);
        }, 500);
      });
    });
  };

  useEffect(() => {
    if (isTimeoutFinished) {
      setMatrix(currentMatrix);
    }
  }, [currentMatrix, isTimeoutFinished]);

  const overlayAnimations = [...Array(6).keys()].map((e) => (
    `
    @keyframes couplesOverlayAnimation${e + 1} {
      0% {
        transform: rotate(${e * 15}deg);
      }
      50% {
        transform: rotate(${(e + 1) * 15}deg);
      }
      100% {
        transform: rotate(${e * 15}deg);
      }
    }
    `
  )).join(" ");

  return (
    <div
      ref={ref}
      className={`block w-full h-auto cursor-pointer min-h-[60px] sm:min-h-[75px] ${className}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
    >
      <style>
        {overlayAnimations}
      </style>
      <div
        style={{
          transform: `perspective(700px) matrix3d(${matrix})`,
          transformOrigin: "center center",
          transition: "transform 200ms ease-out"
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 90" className="w-full h-auto min-w-[280px] sm:min-w-[320px] md:min-w-[350px] lg:min-w-[380px]">
          <defs>
            <linearGradient id="couplesBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.15" />
              <stop offset="30%" stopColor="hsl(var(--primary))" stopOpacity="0.08" />
              <stop offset="70%" stopColor="hsl(var(--accent))" stopOpacity="0.12" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="couplesBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.4" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.4" />
            </linearGradient>
            <filter id="couplesShadow">
              <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="hsl(var(--primary))" floodOpacity="0.25"/>
            </filter>
            <mask id="couplesMask">
              <rect width="350" height="90" fill="white" rx="20" />
            </mask>
          </defs>
          
          {/* Background */}
          <rect width="350" height="90" rx="20" fill="url(#couplesBg)" filter="url(#couplesShadow)" />
          
          {/* Border */}
          <rect x="3" y="3" width="344" height="84" rx="17" fill="transparent" stroke="url(#couplesBorder)" strokeWidth="2" />
          

          
          {/* Main text with animated emoji */}
          <text 
            fontFamily="system-ui, -apple-system, sans-serif" 
            fontSize="20" 
            fontWeight="700" 
            fill="hsl(var(--foreground))" 
            x="175" 
            y="35" 
            textAnchor="middle"
          >
            <tspan fontSize="24">
              💑
              <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="scale"
                values="1;1.15;1"
                dur="2s"
                repeatCount="indefinite"
              />
            </tspan>
            <tspan dx="6">Perfeito para casais</tspan>
          </text>
          
          {/* Subtitle */}
          <text 
            fontFamily="system-ui, -apple-system, sans-serif" 
            fontSize="13" 
            fill="hsl(var(--foreground))" 
            fillOpacity="0.75" 
            x="175" 
            y="55" 
            textAnchor="middle"
          >
            Acesso total para você, colaboração ilimitada
          </text>
          
          <text 
            fontFamily="system-ui, -apple-system, sans-serif" 
            fontSize="13" 
            fill="hsl(var(--foreground))" 
            fillOpacity="0.75" 
            x="175" 
            y="72" 
            textAnchor="middle"
          >
            com quem você ama.
          </text>
          
          {/* Animated overlays */}
          <g style={{ mixBlendMode: "overlay" }} mask="url(#couplesMask)">
            <g style={{
              transform: `rotate(${firstOverlayPosition}deg)`,
              transformOrigin: "175px 45px",
              transition: !disableInOutOverlayAnimation ? "transform 300ms ease-out" : "none",
              animation: disableOverlayAnimation ? "none" : "couplesOverlayAnimation1 6s infinite ease-in-out",
              willChange: "transform"
            }}>
              <polygon points="0,0 350,90 350,0 0,90" fill="hsl(var(--primary))" opacity="0.12" />
            </g>
            <g style={{
              transform: `rotate(${firstOverlayPosition + 20}deg)`,
              transformOrigin: "175px 45px",
              transition: !disableInOutOverlayAnimation ? "transform 300ms ease-out" : "none",
              animation: disableOverlayAnimation ? "none" : "couplesOverlayAnimation2 6s infinite ease-in-out",
              willChange: "transform"
            }}>
              <polygon points="0,0 350,90 350,0 0,90" fill="hsl(var(--accent))" opacity="0.12" />
            </g>
            <g style={{
              transform: `rotate(${firstOverlayPosition + 40}deg)`,
              transformOrigin: "175px 45px",
              transition: !disableInOutOverlayAnimation ? "transform 300ms ease-out" : "none",
              animation: disableOverlayAnimation ? "none" : "couplesOverlayAnimation3 6s infinite ease-in-out",
              willChange: "transform"
            }}>
              <polygon points="0,0 350,90 350,0 0,90" fill="rgba(255,255,255,0.15)" opacity="0.4" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};