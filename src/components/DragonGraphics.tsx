// 1. Logo del Dragón de DigitalBoost
export const DragonLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="dbLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#c084fc" />
      </linearGradient>
      <filter id="glowLogo" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <path 
      d="M50 8 C30 18 18 38 20 62 C22 78 36 90 52 90 C72 90 86 74 84 54 C82 36 68 24 50 8 Z" 
      stroke="url(#dbLogoGrad)" 
      strokeWidth="4" 
      fill="#050512"
      filter="url(#glowLogo)"
    />
    <path 
      d="M48 22 C38 30 32 44 34 58 C36 70 46 78 56 78 C68 78 76 68 74 54 C72 42 62 32 48 22 Z" 
      fill="url(#dbLogoGrad)" 
      opacity="0.3"
    />
    <path 
      d="M32 48 L44 38 L42 50 L56 42 L52 56 L68 46 L58 64 L72 62 C64 74 48 76 38 68 C32 62 30 54 32 48 Z" 
      fill="url(#dbLogoGrad)"
    />
    <circle cx="58" cy="40" r="3" fill="#38bdf8" filter="url(#glowLogo)" />
  </svg>
);

// 2. Dragón en Portal Circular Neón (Hero de la Página Principal)
export const HeroDragonCircle = ({ className = "w-72 h-72" }: { className?: string }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_50px_rgba(56,189,248,0.35)]">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="40%" stopColor="#6366f1" />
          <stop offset="80%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="dragonSkin" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="50%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <linearGradient id="cyberNeon" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
        <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur1" />
          <feGaussianBlur stdDeviation="15" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx="200" cy="200" r="170" fill="#030712" />
      <circle cx="200" cy="200" r="160" stroke="url(#ringGrad)" strokeWidth="3" opacity="0.3" strokeDasharray="12 8" />
      <circle cx="200" cy="200" r="150" stroke="url(#ringGrad)" strokeWidth="6" filter="url(#neonGlow)" />
      <circle cx="200" cy="200" r="142" stroke="#38bdf8" strokeWidth="1.5" opacity="0.8" />

      <path d="M70 200 A130 130 0 0 1 330 200" stroke="#a855f7" strokeWidth="2" strokeDasharray="6 14" opacity="0.6" />
      <path d="M80 200 A120 120 0 0 0 320 200" stroke="#38bdf8" strokeWidth="2" strokeDasharray="10 20" opacity="0.6" />

      <g transform="translate(45, 45) scale(0.78)">
        <path d="M120 110 C80 30 140 -20 230 10 C210 50 190 80 170 110 Z" fill="url(#dragonSkin)" stroke="url(#cyberNeon)" strokeWidth="2.5" />
        <path d="M150 120 C140 50 200 10 290 30 C250 80 220 100 190 125 Z" fill="url(#dragonSkin)" stroke="#a855f7" strokeWidth="2" />
        <path d="M90 150 C40 100 70 50 140 60 C130 90 120 120 110 150 Z" fill="url(#dragonSkin)" stroke="#38bdf8" strokeWidth="1.5" />

        <path 
          d="M110 140 C140 120 210 125 240 160 C265 190 290 220 330 230 C310 250 270 260 230 250 C200 270 170 300 120 310 C140 280 150 250 140 230 C120 225 95 200 90 175 Z" 
          fill="url(#dragonSkin)" 
          stroke="url(#ringGrad)" 
          strokeWidth="3.5" 
          filter="url(#neonGlow)"
        />

        <path d="M140 160 L180 155 L210 175 L170 185 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
        <path d="M180 185 L225 180 L250 205 L205 215 Z" fill="#0f172a" stroke="#818cf8" strokeWidth="1.5" />
        <path d="M130 195 L170 190 L195 220 L150 230 Z" fill="#0f172a" stroke="#a855f7" strokeWidth="1.5" />
        <path d="M170 225 L215 220 L235 245 L190 255 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />

        <path d="M130 140 Q 180 160 260 210" stroke="#38bdf8" strokeWidth="2.5" filter="url(#neonGlow)" />
        <path d="M115 175 Q 165 200 240 240" stroke="#c084fc" strokeWidth="2" filter="url(#neonGlow)" />
        <path d="M140 235 Q 180 260 220 275" stroke="#38bdf8" strokeWidth="2.5" />

        <polygon points="210,165 235,170 225,180 200,175" fill="#38bdf8" filter="url(#neonGlow)" />
        <circle cx="218" cy="172" r="3" fill="#ffffff" />

        <path d="M90 160 L105 135 L115 165 L130 140 L140 170" stroke="url(#ringGrad)" strokeWidth="3" fill="none" />
      </g>

      <circle cx="200" cy="200" r="180" stroke="url(#ringGrad)" strokeWidth="1" opacity="0.2" />
    </svg>
  </div>
);

// 3. Ilustración Completa de Fondo para Splash Screen
export const FullSplashDragonGraphic = () => (
  <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden pointer-events-none">
    <svg viewBox="0 0 1000 1200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover opacity-90">
      <defs>
        <linearGradient id="bgGlow" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#08081a" />
          <stop offset="50%" stopColor="#0d0824" />
          <stop offset="100%" stopColor="#020206" />
        </linearGradient>
        <linearGradient id="splashNeon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
        <linearGradient id="dragonBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="50%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <filter id="bigGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="15" result="b1" />
          <feGaussianBlur stdDeviation="30" result="b2" />
          <feMerge>
            <feMergeNode in="b2" />
            <feMergeNode in="b1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="1000" height="1200" fill="url(#bgGlow)" />
      
      <circle cx="500" cy="480" r="320" stroke="url(#splashNeon)" strokeWidth="3" opacity="0.35" strokeDasharray="16 12" />
      <circle cx="500" cy="480" r="280" stroke="url(#splashNeon)" strokeWidth="5" opacity="0.7" filter="url(#bigGlow)" />
      <circle cx="500" cy="480" r="250" stroke="#38bdf8" strokeWidth="2" opacity="0.5" />

      {/* Alas */}
      <path 
        d="M450 420 C320 250 120 200 40 320 C120 400 220 480 320 540 C220 560 140 600 80 680 C200 680 340 640 420 580 Z" 
        fill="url(#dragonBody)" 
        stroke="url(#splashNeon)" 
        strokeWidth="3.5"
        filter="url(#bigGlow)"
      />
      <path d="M450 420 Q 220 300 60 330" stroke="#38bdf8" strokeWidth="3" />
      <path d="M430 480 Q 260 420 110 500" stroke="#818cf8" strokeWidth="2" />
      <path d="M410 540 Q 280 560 120 660" stroke="#c084fc" strokeWidth="2" />

      <path 
        d="M550 420 C680 250 880 200 960 320 C880 400 780 480 680 540 C780 560 860 600 920 680 C800 680 660 640 580 580 Z" 
        fill="url(#dragonBody)" 
        stroke="url(#splashNeon)" 
        strokeWidth="3.5"
        filter="url(#bigGlow)"
      />
      <path d="M550 420 Q 780 300 940 330" stroke="#38bdf8" strokeWidth="3" />
      <path d="M570 480 Q 740 420 890 500" stroke="#818cf8" strokeWidth="2" />
      <path d="M590 540 Q 720 560 880 660" stroke="#c084fc" strokeWidth="2" />

      {/* Cabeza y Torso */}
      <path 
        d="M480 340 C430 260 460 180 520 140 C560 170 550 220 530 260 C560 270 580 290 600 320 C560 340 530 360 490 380 Z" 
        fill="url(#dragonBody)" 
        stroke="url(#splashNeon)" 
        strokeWidth="4" 
        filter="url(#bigGlow)"
      />
      <polygon points="535,185 550,190 545,198 530,193" fill="#38bdf8" filter="url(#bigGlow)" />

      <path 
        d="M430 380 C470 360 530 360 570 380 C600 460 610 560 580 660 C540 700 460 700 420 660 C390 560 400 460 430 380 Z" 
        fill="url(#dragonBody)" 
        stroke="url(#splashNeon)" 
        strokeWidth="3.5" 
      />

      {/* Pedestal */}
      <path 
        d="M260 760 L740 760 L790 840 L210 840 Z" 
        fill="#080c18" 
        stroke="url(#splashNeon)" 
        strokeWidth="3" 
      />
      <line x1="280" y1="790" x2="720" y2="790" stroke="#38bdf8" strokeWidth="2" strokeDasharray="10 8" filter="url(#bigGlow)" />
    </svg>
  </div>
);
