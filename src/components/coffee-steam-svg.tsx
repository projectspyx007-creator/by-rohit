export function CoffeeSteamSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id="fractal" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" />
        </filter>
        <linearGradient id="steamGradient" gradientTransform="rotate(90)">
          <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0.2" />
          <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g filter="url(#fractal)" opacity="0.3">
        <rect width="100%" height="100%" fill="url(#steamGradient)">
          <animate attributeName="y" from="-100%" to="0%" dur="15s" repeatCount="indefinite" />
        </rect>
      </g>
    </svg>
  );
}
