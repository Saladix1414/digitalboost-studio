import StoreBuilderWorkspace from "./StoreBuilderWorkspace";
import DigitalBoostMainPage from './DigitalBoostMainPage';
import { useState, useEffect } from 'react';
import {

  Menu, X, ArrowRight, Check, ChevronDown, Moon,
  Users, ShoppingCart, 
  Code, Palette, Type,
  Terminal, Hexagon,
  Square, AppWindow,
  FolderGit2, Sparkles,
  MessageSquare,
  ArrowLeft, Sparkle, Smartphone, Tablet, Monitor,
  Download, Copy, CheckCircle2, Bot,
  ExternalLink, Layers
} from 'lucide-react';
import CommerceOSBoot from "./CommerceOSBoot";


import "./commerce-os-vibrant-global.css";
// Nombres de assets locales y de respaldo
const ASSETS = {
  splashBg: "/splash-bg.webp",
  heroDragon: "/hero-dragon.png",
  logo: "/logo.jpg",
  ctaDragon: "/cta-dragon.webp"
};

// =========================================================================
// 1. GRÁFICOS VECTORIALES DE RESPALDO Y LOGOS SVG
// =========================================================================
export const DragonLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="dbLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#c084fc" />
      </linearGradient>
    </defs>
    <path 
      d="M50 8 C30 18 18 38 20 62 C22 78 36 90 52 90 C72 90 86 74 84 54 C82 36 68 24 50 8 Z" 
      stroke="url(#dbLogoGrad)" 
      strokeWidth="4" 
      fill="#050512"
    />
    <path 
      d="M48 22 C38 30 32 44 34 58 C36 70 46 78 56 78 C68 78 76 68 74 54 C72 42 62 32 48 22 Z" 
      fill="url(#dbLogoGrad)" 
      opacity="0.35"
    />
    <path 
      d="M32 48 L44 38 L42 50 L56 42 L52 56 L68 46 L58 64 L72 62 C64 74 48 76 38 68 C32 62 30 54 32 48 Z" 
      fill="url(#dbLogoGrad)"
    />
    <circle cx="58" cy="40" r="3" fill="#38bdf8" />
  </svg>
);

export const HeroDragonCircle = ({ className = "w-72 h-72" }: { className?: string }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_50px_rgba(56,189,248,0.45)]">
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
      </defs>

      <circle cx="200" cy="200" r="170" fill="#030712" />
      <circle cx="200" cy="200" r="160" stroke="url(#ringGrad)" strokeWidth="3" opacity="0.4" strokeDasharray="12 8" />
      <circle cx="200" cy="200" r="150" stroke="url(#ringGrad)" strokeWidth="6" />
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
        />

        <path d="M140 160 L180 155 L210 175 L170 185 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
        <path d="M180 185 L225 180 L250 205 L205 215 Z" fill="#0f172a" stroke="#818cf8" strokeWidth="1.5" />
        <path d="M130 195 L170 190 L195 220 L150 230 Z" fill="#0f172a" stroke="#a855f7" strokeWidth="1.5" />
        <path d="M170 225 L215 220 L235 245 L190 255 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />

        <polygon points="210,165 235,170 225,180 200,175" fill="#38bdf8" />
        <circle cx="218" cy="172" r="3" fill="#ffffff" />
      </g>
    </svg>
  </div data-commerce-os="true">
);

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
      </defs>

      <rect width="1000" height="1200" fill="url(#bgGlow)" />
      
      <circle cx="500" cy="480" r="320" stroke="url(#splashNeon)" strokeWidth="3" opacity="0.35" strokeDasharray="16 12" />
      <circle cx="500" cy="480" r="280" stroke="url(#splashNeon)" strokeWidth="5" opacity="0.7" />
      <circle cx="500" cy="480" r="250" stroke="#38bdf8" strokeWidth="2" opacity="0.5" />

      {/* Alas */}
      <path 
        d="M450 420 C320 250 120 200 40 320 C120 400 220 480 320 540 C220 560 140 600 80 680 C200 680 340 640 420 580 Z" 
        fill="url(#dragonBody)" 
        stroke="url(#splashNeon)" 
        strokeWidth="3.5" 
      />
      <path 
        d="M550 420 C680 250 880 200 960 320 C880 400 780 480 680 540 C780 560 860 600 920 680 C800 680 660 640 580 580 Z" 
        fill="url(#dragonBody)" 
        stroke="url(#splashNeon)" 
        strokeWidth="3.5" 
      />

      {/* Cabeza y Torso */}
      <path 
        d="M480 340 C430 260 460 180 520 140 C560 170 550 220 530 260 C560 270 580 290 600 320 C560 340 530 360 490 380 Z" 
        fill="url(#dragonBody)" 
        stroke="url(#splashNeon)" 
        strokeWidth="4" 
      />
      <polygon points="535,185 550,190 545,198 530,193" fill="#38bdf8" />

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
    </svg>
  </div>
);

// Logo con soporte de imagen local o vector de respaldo
const AppLogo = ({ className = "w-7 h-7" }: { className?: string }) => {
  const [error, setError] = useState(false);
  if (!error) {
    return (
      <img 
        src={ASSETS.logo} 
        alt="DigitalBoost Logo" 
        className={`${className} object-contain rounded-md`}
        onError={() => setError(true)} 
      />
    );
  }
  return <DragonLogo className={className} />;
};

export type ToolMode = 'web' | 'store' | 'landing' | 'nft' | 'pro';
type CopilotRole = 'designer' | 'coder' | 'copywriter' | 'seo' | 'marketing' | 'ecommerce' | 'nft' | 'ux';
type ViewportMode = 'mobile' | 'tablet' | 'desktop';

// =========================================================================
// PLANTILLAS INICIALES DEL BUILDER
// =========================================================================
const TEMPLATES: Record<string, { name: string; category: string; description: string; html: string }> = {
  agency: {
    name: "Agencia Marketing Digital",
    category: "Agencia",
    description: "Diseño tecnológico y elegante para agencias de alto impacto.",
    html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AURA - Agencia de Crecimiento y Marketing Digital</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #030712; color: #f8fafc; }
    .glow-cyan { text-shadow: 0 0 25px rgba(56,189,248,0.5); }
  </style>
</head>
<body class="antialiased min-h-screen">
  <!-- Nav -->
  <nav class="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center font-bold text-black text-lg">A</div>
        <span class="font-extrabold text-xl tracking-tight text-white">AURA<span class="text-sky-400">.AGENCY</span></span>
      </div>
      <div class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
        <a href="#servicios" class="hover:text-white transition">Servicios</a>
        <a href="#casos" class="hover:text-white transition">Casos de Éxito</a>
        <a href="#metodo" class="hover:text-white transition">Metodología</a>
        <a href="#contacto" class="bg-sky-400 hover:bg-sky-300 text-slate-950 px-4 py-2 rounded-lg font-bold transition">Agendar Llamada</a>
      </div>
    </div>
  </nav>

  <!-- Hero -->
  <section class="relative pt-20 pb-24 px-6 max-w-6xl mx-auto text-center">
    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-sky-500/30 text-sky-400 text-xs font-bold uppercase tracking-widest mb-6">
      🚀 Marketing con IA de Nueva Generación
    </div>
    <h1 class="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6 max-w-4xl mx-auto">
      Escalamos tu negocio con estrategias de <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 glow-cyan">alto rendimiento</span>
    </h1>
    <p class="text-base md:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
      Creamos embudos de conversión, automatización con IA y campañas publicitarias rentables que multiplican tus ingresos mes a mes.
    </p>
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
      <a href="#contacto" class="w-full sm:w-auto bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-950 px-8 py-3.5 rounded-xl font-extrabold text-base hover:opacity-95 shadow-lg shadow-sky-500/25 transition transform hover:-translate-y-0.5">
        Solicitar Auditoría Gratis
      </a>
      <a href="#servicios" class="w-full sm:w-auto border border-slate-700 hover:border-slate-500 text-white px-8 py-3.5 rounded-xl font-bold text-base transition">
        Ver Casos Reales
      </a>
    </div>

    <!-- Metric Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-12 border-t border-slate-800/80">
      <div class="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
        <div class="text-3xl font-extrabold text-white mb-1">+340%</div>
        <div class="text-xs text-slate-400 font-medium">ROAS Promedio</div>
      </div>
      <div class="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
        <div class="text-3xl font-extrabold text-sky-400 mb-1">$12M+</div>
        <div class="text-xs text-slate-400 font-medium">Generados a Clientes</div>
      </div>
      <div class="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
        <div class="text-3xl font-extrabold text-indigo-400 mb-1">98.4%</div>
        <div class="text-xs text-slate-400 font-medium">Retención Anual</div>
      </div>
      <div class="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
        <div class="text-3xl font-extrabold text-purple-400 mb-1">15 Días</div>
        <div class="text-xs text-slate-400 font-medium">Time-to-Market</div>
      </div>
    </div>
  </section>

  <!-- Servicios -->
  <section id="servicios" class="py-20 bg-slate-900/40 border-y border-slate-800/60 px-6">
    <div class="max-w-6xl mx-auto">
      <div class="text-center max-w-xl mx-auto mb-16">
        <h2 class="text-2xl md:text-3xl font-bold text-white mb-3">Soluciones diseñadas para conversión</h2>
        <p class="text-slate-400 text-sm">Cada componente está optimizado para capturar leads y maximizar tu ticket promedio.</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-sky-500/50 transition">
          <div class="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-xl mb-4">🎯</div>
          <h3 class="text-lg font-bold text-white mb-2">Paid Media & Ads</h3>
          <p class="text-xs text-slate-400 leading-relaxed">Campañas hipersegmentadas en Meta, Google y TikTok con creativos basados en psicología de compra.</p>
        </div>
        <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition">
          <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xl mb-4">⚡</div>
          <h3 class="text-lg font-bold text-white mb-2">Landing Pages Ultra Rápidas</h3>
          <p class="text-xs text-slate-400 leading-relaxed">Páginas de aterrizaje con tasas de conversión superiores al 12% gracias a copywriting de alto impacto.</p>
        </div>
        <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-purple-500/50 transition">
          <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xl mb-4">🤖</div>
          <h3 class="text-lg font-bold text-white mb-2">Automatización con IA</h3>
          <p class="text-xs text-slate-400 leading-relaxed">Chatbots de venta 24/7 y flujos automatizados de email y WhatsApp para calificar leads al instante.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section id="contacto" class="py-20 px-6 max-w-4xl mx-auto text-center">
    <div class="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-10 relative overflow-hidden">
      <h2 class="text-3xl font-extrabold text-white mb-4">¿Listo para duplicar tus ventas?</h2>
      <p class="text-slate-400 text-sm max-w-md mx-auto mb-8">Agenda una sesión estratégica de 20 minutos con nuestros directores de crecimiento.</p>
      <form class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onsubmit="event.preventDefault(); alert('¡Gracias! Nos pondremos en contacto contigo de inmediato.');">
        <input type="email" required placeholder="tu@empresa.com" class="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-400" />
        <button type="submit" class="bg-sky-400 hover:bg-sky-300 text-slate-950 font-extrabold px-6 py-3 rounded-xl text-sm transition">Agendar Ahora</button>
      </form>
    </div>
  </section>

  <!-- Footer -->
  <footer class="py-8 border-t border-slate-800/80 text-center text-xs text-slate-500">
    © 2025 AURA Growth Agency. Potenciado con DigitalBoost AI.
  </footer>
</body>
</html>`
  },

  landing: {
    name: "Landing Page de Alta Conversión",
    category: "Landing",
    description: "Hero + Propuesta de valor + Beneficios + FAQ + Formulario CTA.",
    html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NexusApp - Optimiza tus Finanzas con IA</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #060913; color: #f1f5f9; font-family: system-ui, sans-serif; }
  </style>
</head>
<body class="min-h-screen">
  <div class="max-w-5xl mx-auto px-6 py-12">
    <!-- Header -->
    <header class="flex justify-between items-center pb-12">
      <div class="text-xl font-bold tracking-tight text-white flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-emerald-400"></span> NexusApp
      </div>
      <a href="#cta" class="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition">Acceso Anticipado</a>
    </header>

    <!-- Hero -->
    <div class="text-center py-12 max-w-3xl mx-auto">
      <div class="inline-block bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1 rounded-full font-semibold mb-4">
        ✨ Ahorra hasta un 40% mensual automáticamente
      </div>
      <h1 class="text-4xl sm:text-6xl font-black text-white tracking-tight mb-6">
        El control total de tu dinero, <span class="text-emerald-400">sin esfuerzo manual.</span>
      </h1>
      <p class="text-base sm:text-lg text-slate-400 mb-8 max-w-xl mx-auto">
        Conecta tus cuentas bancarias y deja que nuestro copiloto financiero detecte fugas de dinero, reduzca suscripciones y haga crecer tus ahorros.
      </p>
      
      <div id="cta" class="max-w-md mx-auto bg-slate-900/90 border border-slate-800 p-2 rounded-2xl flex flex-col sm:flex-row gap-2 shadow-2xl mb-4">
        <input type="email" placeholder="Ingresa tu correo electrónico..." class="flex-1 bg-transparent px-4 py-3 text-sm text-white focus:outline-none" />
        <button class="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-6 py-3 rounded-xl text-sm transition">
          Probar Gratis
        </button>
      </div>
      <p class="text-[11px] text-slate-500">Sin tarjeta de crédito requerida • 14 días de prueba gratis</p>
    </div>

    <!-- Beneficios Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
      <div class="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
        <div class="text-2xl mb-3">📊</div>
        <h3 class="font-bold text-white mb-2">Visión 360° en Tiempo Real</h3>
        <p class="text-xs text-slate-400">Todos tus bancos, tarjetas y criptomonedas consolidados en un panel ultra intuitivo.</p>
      </div>
      <div class="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
        <div class="text-2xl mb-3">🛡️</div>
        <h3 class="font-bold text-white mb-2">Seguridad Bancaria 256-bit</h3>
        <p class="text-xs text-slate-400">Encriptación de nivel militar con permisos de solo lectura para máxima tranquilidad.</p>
      </div>
      <div class="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
        <div class="text-2xl mb-3">⚡</div>
        <h3 class="font-bold text-white mb-2">Alertas Inteligentes</h3>
        <p class="text-xs text-slate-400">Recibe notificaciones antes de cobros duplicados o comisiones ocultas.</p>
      </div>
    </div>

    <!-- FAQ -->
    <div class="py-12 border-t border-slate-800">
      <h2 class="text-2xl font-bold text-center text-white mb-8">Preguntas Frecuentes</h2>
      <div class="space-y-4 max-w-2xl mx-auto text-sm">
        <div class="p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
          <h4 class="font-bold text-white mb-1">¿Cómo protege NexusApp mis datos bancarios?</h4>
          <p class="text-xs text-slate-400">Utilizamos protocolos OAuth certificados y nunca almacenamos tus contraseñas.</p>
        </div>
        <div class="p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
          <h4 class="font-bold text-white mb-1">¿Puedo cancelar en cualquier momento?</h4>
          <p class="text-xs text-slate-400">Sí, con un solo clic desde tu perfil sin preguntas ni penalizaciones.</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`
  },

  restaurant: {
    name: "Restaurante Gourmet & Reservas",
    category: "Gastronomía",
    description: "Carta digital moderna, ambientación estética y reservas en línea.",
    html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>L'Olivier - Cocina de Autor</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #0b0c10; color: #e2e8f0; font-family: serif; }
    .sans { font-family: system-ui, sans-serif; }
  </style>
</head>
<body>
  <div class="max-w-4xl mx-auto px-6 py-12 text-center">
    <div class="sans text-xs tracking-[0.3em] uppercase text-amber-400 mb-2">Experiencia Culinaria Única</div>
    <h1 class="text-5xl font-normal text-white mb-4">L'Olivier</h1>
    <p class="text-slate-400 italic max-w-md mx-auto mb-8 text-sm">Ingredientes de estación, fuego vivo y pasión mediterránea en cada plato.</p>
    
    <div class="sans flex justify-center gap-4 mb-16">
      <button class="bg-amber-500 hover:bg-amber-400 text-black px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition">Reservar Mesa</button>
      <button class="border border-slate-700 text-white px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-white/5 transition">Ver Menú</button>
    </div>

    <!-- Menú Destacado -->
    <div class="sans text-left bg-slate-900/60 border border-slate-800 rounded-3xl p-8 max-w-2xl mx-auto">
      <h3 class="text-xs font-bold uppercase tracking-widest text-amber-400 mb-6 text-center">Platos del Chef</h3>
      <div class="space-y-6">
        <div class="flex justify-between items-baseline border-b border-slate-800 pb-3">
          <div>
            <h4 class="font-bold text-white text-sm">Risotto de Hongos Silvestres y Trufa</h4>
            <p class="text-xs text-slate-400">Arroz carnaroli, queso parmesano 24 meses y aceite de trufa blanca.</p>
          </div>
          <span class="text-amber-400 font-bold text-sm ml-4">$28</span>
        </div>
        <div class="flex justify-between items-baseline border-b border-slate-800 pb-3">
          <div>
            <h4 class="font-bold text-white text-sm">Salmón Glaseado con Miso y Cítricos</h4>
            <p class="text-xs text-slate-400">Acompañado de espárragos grillados y puré de coliflor trufado.</p>
          </div>
          <span class="text-amber-400 font-bold text-sm ml-4">$34</span>
        </div>
        <div class="flex justify-between items-baseline border-b border-slate-800 pb-3">
          <div>
            <h4 class="font-bold text-white text-sm">Volcán de Chocolate Belga 70%</h4>
            <p class="text-xs text-slate-400">Centro fluido servido con helado artesanal de vainilla Bourbon.</p>
          </div>
          <span class="text-amber-400 font-bold text-sm ml-4">$16</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`
  },

  ecommerce: {
    name: "Tienda Virtual / Ecommerce",
    category: "Tienda",
    description: "Catálogo de productos, carrito dinámico y pasarela de checkout.",
    html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CYBERWEAR - Streetwear Futurista</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #05050c; color: #ffffff; font-family: system-ui, sans-serif; }
  </style>
</head>
<body class="min-h-screen pb-16">
  <!-- Nav -->
  <header class="border-b border-slate-800 bg-[#070714] sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <div class="font-extrabold text-xl tracking-wider text-sky-400">CYBER<span class="text-white">WEAR</span></div>
      <div class="flex items-center gap-4">
        <button class="text-xs bg-sky-500 hover:bg-sky-400 text-black px-4 py-2 rounded-lg font-bold">Carrito (0)</button>
      </div>
    </div>
  </header>

  <!-- Catálogo -->
  <div class="max-w-6xl mx-auto px-6 pt-10">
    <h2 class="text-2xl font-bold mb-6">Colección Drop 01 // 2025</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      
      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-sky-400 transition">
        <div class="h-48 rounded-xl bg-gradient-to-tr from-sky-900 to-indigo-900 flex items-center justify-center font-mono text-xs text-sky-300 mb-4">
          [FOTO: HOODIE NEON OVERSIZED]
        </div>
        <h3 class="font-bold text-white text-base">Cyber Hoodie v2</h3>
        <p class="text-xs text-slate-400 mb-4">Algodón pesado 450 GSM con detalles reflectivos.</p>
        <div class="flex justify-between items-center">
          <span class="font-extrabold text-sky-400">$89.00</span>
          <button class="bg-white/10 hover:bg-sky-400 hover:text-black text-white px-4 py-1.5 rounded-lg text-xs font-bold transition">Añadir</button>
        </div>
      </div>

      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-sky-400 transition">
        <div class="h-48 rounded-xl bg-gradient-to-tr from-purple-900 to-indigo-900 flex items-center justify-center font-mono text-xs text-purple-300 mb-4">
          [FOTO: PANTALÓN CARGO TECH]
        </div>
        <h3 class="font-bold text-white text-base">Cargo Pants Modular</h3>
        <p class="text-xs text-slate-400 mb-4">Tela impermeable con bolsillos magnéticos desmontables.</p>
        <div class="flex justify-between items-center">
          <span class="font-extrabold text-sky-400">$115.00</span>
          <button class="bg-white/10 hover:bg-sky-400 hover:text-black text-white px-4 py-1.5 rounded-lg text-xs font-bold transition">Añadir</button>
        </div>
      </div>

      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-sky-400 transition">
        <div class="h-48 rounded-xl bg-gradient-to-tr from-emerald-900 to-slate-900 flex items-center justify-center font-mono text-xs text-emerald-300 mb-4">
          [FOTO: GORRA TECHWEAR]
        </div>
        <h3 class="font-bold text-white text-base">Cap Reflective Black</h3>
        <p class="text-xs text-slate-400 mb-4">Ajuste micrométrico y protección UV 50+.</p>
        <div class="flex justify-between items-center">
          <span class="font-extrabold text-sky-400">$45.00</span>
          <button class="bg-white/10 hover:bg-sky-400 hover:text-black text-white px-4 py-1.5 rounded-lg text-xs font-bold transition">Añadir</button>
        </div>
      </div>

    </div>
  </div>
</body>
</html>`
  }
};

// =========================================================================
// =========================================================================
// PANTALLA 1: CARGA / BOOT
// =========================================================================
const BootScreen = ({ onDone }: { onDone: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onDone, 2200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(70,100,180,0.13),transparent_34%),#000]" />
      <div className="relative z-10 text-center px-6">
        <h1 className="font-extrabold tracking-[0.18em] text-[34px] sm:text-[48px] leading-tight">
          BIENVENIDO A<br />DIGITAL<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9d65ff] to-[#6e4bdb]">BOOST</span>
        </h1>
        <p className="mt-3 text-[10px] sm:text-[12px] tracking-[0.28em] text-slate-500 uppercase">TU SISTEMA OPERATIVO CREATIVO</p>
        <div className="mt-7 mx-auto w-28 h-[2px] bg-gradient-to-r from-transparent via-[#6f75ff] to-transparent animate-pulse" />
      </div>
    </div>
  );
};

// =========================================================================
// PANTALLA 2: SPLASH DRAGÓN CON ACCESOS RÁPIDOS
// =========================================================================
const SplashScreen = ({ onContinue }: { onContinue: () => void }) => {
  const cards: { icon: typeof Code; title: string; desc: string; accent: 'cyan' | 'purple'; mode: ToolMode }[] = [
    { icon: Code, title: 'DESARROLLO WEB', desc: 'Crea sin límites. Construye el futuro.', accent: 'cyan', mode: 'web' },
    { icon: Hexagon, title: 'NFTs & MARKETPLACE', desc: 'Crea. Colecciona. Intercambia valor.', accent: 'purple', mode: 'nft' },
    { icon: ShoppingCart, title: 'TIENDAS VIRTUALES', desc: 'Vende en cualquier lugar. Haz crecer tu marca.', accent: 'cyan', mode: 'store' },
    { icon: Bot, title: 'IA INTEGRADA', desc: 'Automatiza. Optimiza. Multiplica tu potencial.', accent: 'purple', mode: 'web' },
    { icon: AppWindow, title: 'LANDING PAGES', desc: 'Impacta. Convierte. Escala tu negocio.', accent: 'cyan', mode: 'landing' },
    { icon: Terminal, title: 'HERRAMIENTAS DEV', desc: 'Potentes. Flexibles. Sin límites.', accent: 'purple', mode: 'pro' },
  ];

  return (
    <div className="fixed inset-0 z-[95] bg-black text-white overflow-hidden">
      <div className="absolute inset-0">
        <img src={ASSETS.splashBg} alt="DigitalBoost cyber dragon" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/55" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,transparent_22%,rgba(0,0,0,0.42)_82%)]" />
      </div>

      <div className="absolute inset-0 z-10 hidden md:block pointer-events-none">
        <div className="absolute left-[3%] top-[49%] w-[29%] max-w-[350px] space-y-3 pointer-events-auto">
          {[cards[0], cards[2], cards[4]].map((card) => { const Icon = card.icon; return (
            <button key={card.title} onClick={onContinue} className="w-full text-left rounded-xl border border-[#123755] bg-[#060913]/70 backdrop-blur-md px-4 py-3.5 hover:border-[#38bdf8]/70 hover:bg-[#071324]/90 transition-all shadow-[0_0_20px_rgba(0,0,0,.45)]">
              <div className="flex items-center gap-3"><Icon size={19} className={card.accent==='cyan' ? 'text-[#28b8ff]' : 'text-[#a96eff]'} /><div><div className="text-[12px] font-bold tracking-wide text-white">{card.title}</div><div className="mt-1 text-[9px] text-slate-400">{card.desc}</div></div></div>
            </button>
          ); })}
        </div>
        <div className="absolute right-[3%] top-[49%] w-[29%] max-w-[350px] space-y-3 pointer-events-auto">
          {[cards[1], cards[3], cards[5]].map((card) => { const Icon = card.icon; return (
            <button key={card.title} onClick={onContinue} className="w-full text-left rounded-xl border border-[#123755] bg-[#060913]/70 backdrop-blur-md px-4 py-3.5 hover:border-[#9d5cff]/70 hover:bg-[#0a0716]/90 transition-all shadow-[0_0_20px_rgba(0,0,0,.45)]">
              <div className="flex items-center gap-3"><Icon size={19} className={card.accent==='cyan' ? 'text-[#28b8ff]' : 'text-[#a96eff]'} /><div><div className="text-[12px] font-bold tracking-wide text-white">{card.title}</div><div className="mt-1 text-[9px] text-slate-400">{card.desc}</div></div></div>
            </button>
          ); })}
        </div>
      </div>

      <div className="absolute left-4 right-4 bottom-20 z-10 md:hidden">
        <div className="grid grid-cols-2 gap-2.5">
          {cards.map((card) => { const Icon = card.icon; return (
            <button key={card.title} onClick={onContinue} className="rounded-xl border border-[#153250] bg-[#040812]/80 backdrop-blur-md p-3 text-left shadow-xl">
              <Icon size={16} className={card.accent==='cyan' ? 'text-[#28b8ff]' : 'text-[#a96eff]'} />
              <div className="mt-2 text-[9px] font-bold tracking-wide leading-tight">{card.title}</div>
              <div className="mt-1 text-[8px] leading-relaxed text-slate-400">{card.desc}</div>
            </button>
          ); })}
        </div>
      </div>

      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        <AppLogo className="w-8 h-8 drop-shadow-[0_0_18px_rgba(56,189,248,.55)]" />
        <div className="font-extrabold text-xl tracking-wider">DIGITAL<span className="text-[#8f58ff]">BOOST</span></div>
      </div>
      <button onClick={onContinue} className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-[10px] uppercase tracking-[0.24em] text-slate-300/90 hover:text-white transition-colors">Toca para continuar</button>
    </div>
  );
};

// =========================================================================
// PANTALLA 3: INTRO / PRESENTACIÓN ANTES DE LA WEB PRINCIPAL
// =========================================================================
const IntroScreen = ({ onStart }: { onStart: () => void }) => (
  <div className="fixed inset-0 z-[90] bg-[#020206] text-white overflow-y-auto">
    <div className="min-h-screen max-w-6xl mx-auto px-5 sm:px-8 py-6 sm:py-8 flex flex-col">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <AppLogo className="w-8 h-8" />
          <div className="font-extrabold tracking-wider">DIGITAL<span className="text-[#7f55ff]">BOOST</span></div>
        </div>
        <button onClick={onStart} className="text-xs font-semibold text-slate-300 hover:text-white transition-colors">
          Entrar a la plataforma <ArrowRight size={14} className="inline ml-1" />
        </button>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center py-12 sm:py-16">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/5 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">
            Todo en uno • Potenciado por IA
          </div>
          <h1 className="mt-5 text-[42px] sm:text-[60px] font-extrabold leading-[1.03] tracking-tight">
            Crea. Impulsa.<br/>
            <span className="text-sky-400">Escala.</span> <span className="text-[#ae68ff]">Innova.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[15px] sm:text-[17px] leading-relaxed text-slate-300">
            DigitalBoost reúne creación web con IA, tiendas virtuales, landing pages, NFTs y herramientas profesionales en un solo sistema creativo.
          </p>
          <div className="mt-8">
            <button onClick={onStart} className="rounded-xl bg-gradient-to-r from-[#8b3dff] to-[#2e9eff] px-7 py-3.5 font-bold shadow-[0_0_30px_rgba(98,81,255,.35)] hover:scale-[1.02] transition-transform">
              Comenzar gratis <ArrowRight size={16} className="inline ml-1" />
            </button>
          </div>
          <div className="mt-6 flex flex-wrap gap-5 text-xs text-slate-400">
            <span>✓ IA integrada</span><span>✓ Sin límites creativos</span><span>✓ Diseño responsive</span>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end min-h-[330px] sm:min-h-[480px] items-center">
          <div className="absolute inset-0 bg-[#3b82f6]/10 blur-[90px] rounded-full" />
          <img src={ASSETS.heroDragon} alt="DigitalBoost Dragon" className="relative w-[300px] sm:w-[460px] object-contain drop-shadow-[0_0_70px_rgba(40,144,255,.28)]" />
        </div>
      </div>

      <div className="border-t border-white/5 pt-5 text-[10px] tracking-[0.2em] uppercase text-slate-500 text-center">
        CREA • IMPULSA • ESCALA • INNOVA
      </div>
    </div>
  </div>
);

// =========================================================================
// PÁGINA PRINCIPAL DEFINITIVA: REFERENCIA VISUAL DEL USUARIO
// =========================================================================
const LandingPage = ({ onSelectTool }: { onSelectTool: (mode: ToolMode) => void }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroImgError, setHeroImgError] = useState(false);
  const [ctaImgError, setCtaImgError] = useState(false);

  const goToTools = () => {
    setMobileMenuOpen(false);
    document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
  };

  const tools = [
    { id: 'web' as ToolMode, icon: Code, title: 'Desarrollo Web con IA', desc: 'Crea sitios web completos con inteligencia artificial.' },
    { id: 'store' as ToolMode, icon: ShoppingCart, title: 'Tiendas Virtuales', desc: 'Crea tu tienda online profesional al estilo Shopify.' },
    { id: 'landing' as ToolMode, icon: AppWindow, title: 'Landing Pages', desc: 'Diseña landing pages que convierten con IA.' },
    { id: 'nft' as ToolMode, icon: Hexagon, title: 'NFTs & Marketplace', desc: 'Crea, vende y gestiona tus NFTs con facilidad.' },
    { id: 'pro' as ToolMode, icon: Terminal, title: 'Herramientas Pro', desc: 'Herramientas avanzadas para desarrolladores.' },
  ];

  const stats = [
    ['15K+', 'Usuarios activos'],
    ['2.5K+', 'Proyectos creados'],
    ['850+', 'Tiendas online'],
    ['1.2K+', 'NFTs generados'],
    ['99.9%', 'Uptime garantizado'],
  ];

  const integrations = ['OpenAI', 'stripe', 'PayPal', 'MongoDB', '▲ Vercel', 'Cloudflare', 'IPFS', 'solana'];

  return (
    <div className="min-h-screen bg-[#030308] text-slate-200 selection:bg-[#3b82f6]/30 overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-[#030308]/90 backdrop-blur-xl border-b border-white/10 z-40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-[70px] flex items-center justify-between">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5">
            <AppLogo className="w-8 h-8" />
            <span className="font-bold text-xl text-white tracking-tight">DIGITAL<span className="text-[#6366f1]">BOOST</span></span>
          </button>

          <div className="hidden lg:flex items-center gap-7 text-[14px] font-medium text-slate-300">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-[#38bdf8] font-semibold">Inicio</button>
            <button onClick={goToTools} className="hover:text-white transition-colors flex items-center gap-1">Herramientas <ChevronDown size={14} className="text-slate-500" /></button>
            <button onClick={goToTools} className="hover:text-white transition-colors">Precios</button>
            <button onClick={goToTools} className="hover:text-white transition-colors flex items-center gap-1">Recursos <ChevronDown size={14} className="text-slate-500" /></button>
            <button onClick={() => onSelectTool('pro')} className="hover:text-white transition-colors">Docs</button>
            <button onClick={() => onSelectTool('pro')} className="hover:text-white transition-colors flex items-center gap-1">Empresa <ChevronDown size={14} className="text-slate-500" /></button>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition" aria-label="Modo oscuro"><Moon size={16} /></button>
            <button onClick={goToTools} className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition">Iniciar sesión</button>
            <button onClick={goToTools} className="bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] text-white px-5 py-2.5 rounded-lg text-[13px] font-bold shadow-[0_0_15px_rgba(99,102,241,0.35)]">Comenzar ahora</button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button onClick={goToTools} className="bg-[#3b82f6] text-white px-3 py-1.5 rounded-md text-xs font-bold">Comenzar</button>
            <button onClick={() => setMobileMenuOpen(v => !v)} className="text-white p-2" aria-label="Abrir menú">
              {mobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#050510] border-b border-slate-800 px-6 py-4 space-y-3">
            <button onClick={goToTools} className="block w-full text-left py-2 text-sm font-semibold text-sky-400">Herramientas</button>
            <button onClick={() => { onSelectTool('web'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-sm text-slate-300">Desarrollo Web con IA</button>
            <button onClick={() => { onSelectTool('landing'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-sm text-slate-300">Landing Pages</button>
            <button onClick={() => { onSelectTool('store'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-sm text-slate-300">Tiendas Virtuales</button>
            <button onClick={() => { onSelectTool('nft'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-sm text-slate-300">NFTs & Marketplace</button>
            <button onClick={() => { onSelectTool('pro'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-sm text-slate-300">Herramientas Pro</button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="pt-28 sm:pt-32 pb-12 px-5 sm:px-8 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-center min-h-[600px]">
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#07101b] border border-sky-500/30 text-[10px] font-bold text-sky-300 uppercase tracking-[0.18em]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" /> TODO EN UNO • POTENCIADO POR IA
            </div>
            <h1 className="mt-5 text-[42px] sm:text-[62px] xl:text-[66px] font-extrabold text-white leading-[1.02] tracking-tight">
              Crea. Impulsa.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] to-[#3b82f6]">Escala.</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c084fc] to-[#f472b6]">Innova.</span>
            </h1>
            <p className="mt-6 max-w-[640px] text-[14px] sm:text-[16px] leading-relaxed text-slate-300">
              DigitalBoost es la plataforma todo en uno para desarrolladores, <strong className="text-white">emprendedores</strong> y creadores.
            </p>
            <p className="mt-2 max-w-[640px] text-[14px] sm:text-[16px] leading-relaxed text-slate-300">
              Desarrolla web con IA, tiendas virtuales, landing pages, NFTs y <strong className="text-white">herramientas</strong> profesionales para llevar tus ideas al siguiente nivel.
            </p>
            <div className="mt-8 mb-6">
              <button onClick={goToTools} className="bg-gradient-to-r from-[#8b5cf6] to-[#2498ff] text-white px-7 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-[0_0_25px_rgba(99,102,241,0.45)] hover:scale-[1.02] transition-transform">
                Comenzar gratis <ArrowRight size={16}/>
              </button>
            </div>
            <div className="flex flex-wrap gap-5 text-[12px] sm:text-[13px] text-slate-400">
              <span>✓ No se requiere tarjeta</span><span>✓ IA integrada</span><span>✓ Sin límites creativos</span>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center relative min-h-[390px] sm:min-h-[520px] items-center">
            <div className="absolute w-[360px] sm:w-[540px] h-[360px] sm:h-[540px] bg-[#1d4ed8]/20 blur-[100px] rounded-full" />
            <HeroDragonCircle className="relative z-10 w-[320px] sm:w-[500px]" />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="px-5 sm:px-8 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 border border-[#1d2940] rounded-xl bg-[#04060d]/80 overflow-hidden">
          {stats.map(([number, label]) => (
            <div key={label} className="px-5 py-6 border-b md:border-b-0 border-[#1d2940] last:border-b-0 md:border-r last:md:border-r-0 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl border border-sky-400/30 bg-sky-400/5 flex items-center justify-center text-sky-300"><Users size={20}/></div>
              <div><div className="text-xl sm:text-2xl font-semibold text-white">{number}</div><div className="text-xs text-slate-400">{label}</div></div>
            </div>
          ))}
        </div>
      </section>

      {/* TOOL SECTION */}
      <section id="tools" className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-16 sm:pt-20 pb-10">
        <div className="text-center mb-10">
          <div className="text-[13px] uppercase tracking-[0.26em] text-slate-300">TODO LO QUE NECESITAS EN <span className="text-sky-400">UN SOLO LUGAR</span></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {tools.map(({ id, icon: Icon, title, desc }) => (
            <button key={id} onClick={() => onSelectTool(id)} className="text-left bg-[#040711] border border-[#1a2940] rounded-xl p-5 min-h-[220px] hover:border-sky-400/50 hover:-translate-y-1 transition-all group">
              <div className="w-11 h-11 rounded-lg border border-sky-500/30 bg-sky-500/5 flex items-center justify-center text-sky-300 mb-8"><Icon size={22}/></div>
              <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
              <p className="text-xs leading-relaxed text-slate-400 mb-5">{desc}</p>
              <span className="text-xs font-semibold text-sky-400 group-hover:text-white">Explorar →</span>
            </button>
          ))}
        </div>
      </section>

      {/* AI FEATURE */}
      <section className="max-w-[1400px] mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-center">
          <div className="xl:col-span-4">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white leading-tight">IA QUE IMPULSA TU<br/><span className="text-[#a855f7]">CREATIVIDAD</span></h2>
            <p className="mt-5 text-sm leading-relaxed text-slate-400">Nuestra IA entiende tus ideas y las convierte en soluciones reales. Desde código hasta diseño, contenido y automatización.</p>
            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-3"><Sparkles size={16} className="text-violet-400"/> Generación de código y sitios web</div>
              <div className="flex items-center gap-3"><Palette size={16} className="text-violet-400"/> Diseño UI/UX inteligente</div>
              <div className="flex items-center gap-3"><MessageSquare size={16} className="text-violet-400"/> Contenido y copys que convierten</div>
            </div>
            <button onClick={() => onSelectTool('web')} className="mt-8 border border-sky-500/40 rounded-lg px-5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-sky-500/10 transition-colors">Conocer más sobre IA</button>
          </div>

          <button onClick={() => onSelectTool('web')} className="xl:col-span-8 text-left bg-[#03060d] border border-[#1b2a43] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,.55)] hover:border-sky-400/50 transition-colors">
            <div className="h-11 border-b border-[#1b2a43] bg-[#050817] flex items-center justify-between px-4">
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-300 font-mono"><Sparkles size={13} className="text-[#a855f7]"/> AI WEB BUILDER</div>
              <div className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800">EN VIVO</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 min-h-[360px]">
              <div className="border-b md:border-b-0 md:border-r border-[#1b2a43] bg-[#02040a] p-5 font-mono text-[11px] text-slate-400 leading-7 overflow-hidden">
                <div className="text-[10px] text-slate-500 font-bold mb-2 pb-2 border-b border-slate-900 flex justify-between"><span>index.html</span><span>UTF-8</span></div>
                {['<!DOCTYPE html>', '<html lang="es">', '<head>', '  <meta charset="UTF-8" />', '  <title>Mi Proyecto</title>', '</head>', '<body>', '  <header class="hero">', '    <h1>Impulsa tu negocio</h1>', '    <p>Diseñado y optimizado con IA</p>', '  </header>', '</body>'].map((line, i) => (
                  <div key={line + i}><span className="text-slate-700 inline-block w-6">{i + 1}</span><span>{line}</span></div>
                ))}
              </div>
              <div className="bg-[#040711] p-6 sm:p-8 flex flex-col justify-between min-h-[300px]">
                <div className="flex items-center justify-between pb-4 border-b border-white/5"><div className="flex items-center gap-2"><AppLogo className="w-5 h-5"/><span className="text-xs font-bold text-white">DIGITAL<span className="text-[#6366f1]">BOOST</span></span></div><Menu size={16} className="text-slate-400"/></div>
                <div className="py-8"><h3 className="text-2xl font-bold text-white leading-tight">Impulsa tu negocio<br/>al siguiente nivel</h3><p className="mt-3 text-xs text-slate-400 max-w-sm">Herramientas digitales para crear, escalar e innovar sin límites.</p><span className="inline-flex mt-6 bg-[#7d4cf7] text-white px-5 py-2.5 rounded-md text-xs font-bold">Comenzar ahora</span></div>
                <div className="text-[10px] text-sky-400 font-mono">✨ Clic para abrir el editor completo</div>
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* INTEGRATIONS */}
      <section className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-12">
        <h3 className="text-center text-xs uppercase tracking-[0.25em] text-slate-400 mb-6">INTEGRACIONES CON LO MEJOR</h3>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {integrations.map((brand) => <div key={brand} className="px-5 py-3 rounded-lg border border-[#1e2b42] bg-[#040711] text-sm font-semibold text-slate-300">{brand}</div>)}
        </div>
      </section>

      {/* SECOND STATS */}
      <section className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-5 border border-[#1d2940] rounded-xl bg-[#04060d]/80 overflow-hidden">
          {stats.map(([number, label], i) => <div key={label + i} className="px-5 py-6 border-b md:border-b-0 border-[#1d2940] md:border-r last:md:border-r-0"><div className="text-2xl text-white font-semibold">{number}</div><div className="text-xs text-slate-400 mt-1">{label}</div></div>)}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-20">
        <div className="rounded-2xl border border-[#1e2b42] bg-gradient-to-r from-[#070b18] via-[#0b0b1b] to-[#14072a] p-8 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 overflow-hidden relative">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white leading-tight">¿Listo para llevar tus ideas al siguiente nivel?</h2>
            <p className="mt-4 text-sm text-slate-400">Únete a miles de creadores, desarrolladores y emprendedores que ya están construyendo el futuro con DigitalBoost.</p>
            <button onClick={goToTools} className="mt-7 bg-gradient-to-r from-[#8b5cf6] to-[#2498ff] text-white px-7 py-3.5 rounded-lg text-sm font-bold inline-flex items-center gap-2">Comenzar ahora gratis <ArrowRight size={16}/></button>
            <div className="mt-3 text-[11px] text-slate-500">No se requiere tarjeta de crédito</div>
          </div>
          <div className="relative w-52 h-52 sm:w-64 sm:h-64 shrink-0 flex items-center justify-center">
            {!ctaImgError ? <img src={ASSETS.ctaDragon} alt="DigitalBoost dragon" className="w-full h-full object-contain drop-shadow-[0_0_35px_rgba(56,189,248,.35)]" onError={() => setCtaImgError(true)} /> : <DragonLogo className="w-32 h-32 text-sky-400" />}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#1e293b] bg-[#020205] pt-14 pb-10">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4"><AppLogo className="w-7 h-7"/><span className="font-bold text-lg text-white">DIGITAL<span className="text-[#6366f1]">BOOST</span></span></div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">El sistema creativo impulsado por IA para diseñar, programar, optimizar y escalar productos digitales de alto impacto.</p>
          </div>
          <div><h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Producto</h4><div className="space-y-2.5 text-xs text-slate-400"><button onClick={() => onSelectTool('web')} className="block hover:text-white">Herramientas</button><button onClick={() => onSelectTool('store')} className="block hover:text-white">Tiendas</button><button onClick={() => onSelectTool('landing')} className="block hover:text-white">Landing Pages</button><button onClick={() => onSelectTool('nft')} className="block hover:text-white">NFTs</button></div></div>
          <div><h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Recursos</h4><div className="space-y-2.5 text-xs text-slate-400"><button onClick={() => onSelectTool('pro')} className="block hover:text-white">Dev Tools</button><button onClick={() => onSelectTool('web')} className="block hover:text-white">Copilot IA</button><button onClick={goToTools} className="block hover:text-white">Comunidad</button></div></div>
          <div><h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Empresa</h4><div className="space-y-2.5 text-xs text-slate-400"><span className="block">Sobre nosotros</span><span className="block">Contacto</span><span className="block">Trabaja con nosotros</span><span className="block">© 2026 DigitalBoost</span></div></div>
        </div>
      </footer>
    </div>
  );
};

// =========================================================================
const InternalWorkspace = ({ initialMode, onBack }: { initialMode: ToolMode; onBack: () => void }) => {
  if (initialMode === "store") {
    return <StoreBuilderWorkspace onBack={onBack} />;
  }

  const [activeTab, setActiveTab] = useState<ToolMode>(initialMode);
  const [userPrompt, setUserPrompt] = useState('');
  const [activeRole, setActiveRole] = useState<CopilotRole>('designer');
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  
  // HTML Inicial basado en la categoría
  const [htmlCode, setHtmlCode] = useState<string>(() => {
    if (initialMode === 'store') return TEMPLATES.ecommerce.html;
    if (initialMode === 'landing') return TEMPLATES.landing.html;
    return TEMPLATES.agency.html;
  });

  const [aiHistory, setAiHistory] = useState<Array<{ role: string; message: string; timestamp: string }>>([
    {
      role: "Copilot",
      message: "¡Hola! Soy tu AI Copilot de DigitalBoost. Puedo crear tu sitio web desde cero, optimizar el diseño, cambiar el hero, añadir secciones de precios o mejorar la conversión. ¿Qué deseas hacer?",
      timestamp: "Ahora"
    }
  ]);

  // Actualizar plantilla según pestaña
  const handleSelectTemplate = (templateKey: string) => {
    if (TEMPLATES[templateKey]) {
      setHtmlCode(TEMPLATES[templateKey].html);
      setAiHistory(prev => [
        ...prev,
        {
          role: "Copilot",
          message: `Plantilla cargada: "${TEMPLATES[templateKey].name}". Lista para personalizar con IA.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  // Manejador del Copilot
  const handleCopilotAction = (instruction: string) => {
    setIsGenerating(true);
    
    setTimeout(() => {
      let updatedHtml = htmlCode;
      const lower = instruction.toLowerCase();

      // Transformaciones controladas e inteligentes
      if (lower.includes("moderno") || lower.includes("tecnológico") || lower.includes("neón")) {
        updatedHtml = updatedHtml.replace(/bg-slate-950/g, 'bg-[#050512]')
          .replace(/text-sky-400/g, 'text-cyan-400')
          .replace(/from-sky-400/g, 'from-cyan-400 to-fuchsia-500');
      } else if (lower.includes("precios") || lower.includes("planes")) {
        if (!updatedHtml.includes("id=\"precios\"")) {
          const pricingSection = `
  <!-- Sección Precios Generada por IA -->
  <section id="precios" class="py-16 px-6 max-w-5xl mx-auto border-t border-slate-800">
    <div class="text-center mb-10">
      <h2 class="text-2xl sm:text-3xl font-bold text-white mb-2">Planes Transparentes</h2>
      <p class="text-slate-400 text-xs sm:text-sm">Elige el plan ideal para escalar tu negocio sin comisiones ocultas.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <h3 class="font-bold text-white text-lg mb-1">Starter</h3>
        <div class="text-3xl font-extrabold text-white my-3">$29<span class="text-xs text-slate-400 font-normal">/mes</span></div>
        <ul class="text-xs text-slate-300 space-y-2 mb-6">
          <li>✓ 1 Dominio personalizado</li>
          <li>✓ Hosting ultra rápido</li>
          <li>✓ Copilot IA básico</li>
        </ul>
        <button class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition">Elegir Starter</button>
      </div>
      <div class="p-6 bg-slate-900 border-2 border-sky-500 rounded-2xl relative shadow-xl shadow-sky-500/10">
        <div class="absolute -top-3 right-6 bg-sky-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">POPULAR</div>
        <h3 class="font-bold text-white text-lg mb-1">Professional</h3>
        <div class="text-3xl font-extrabold text-sky-400 my-3">$79<span class="text-xs text-slate-400 font-normal">/mes</span></div>
        <ul class="text-xs text-slate-300 space-y-2 mb-6">
          <li>✓ Dominios ilimitados</li>
          <li>✓ Automatizaciones de venta</li>
          <li>✓ AI Copilot Pro 24/7</li>
          <li>✓ Soporte prioritario</li>
        </ul>
        <button class="w-full py-2.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-extrabold rounded-xl text-xs transition">Comenzar Pro</button>
      </div>
      <div class="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <h3 class="font-bold text-white text-lg mb-1">Enterprise</h3>
        <div class="text-3xl font-extrabold text-white my-3">$199<span class="text-xs text-slate-400 font-normal">/mes</span></div>
        <ul class="text-xs text-slate-300 space-y-2 mb-6">
          <li>✓ Infraestructura dedicada</li>
          <li>✓ Integraciones API a medida</li>
          <li>✓ SLA 99.99%</li>
        </ul>
        <button class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition">Contactar Ventas</button>
      </div>
    </div>
  </section>
`;
          updatedHtml = updatedHtml.replace('</body>', `${pricingSection}\n</body>`);
        }
      } else if (lower.includes("cta") || lower.includes("botón")) {
        updatedHtml = updatedHtml.replace(/Comenzar ahora/g, '¡Quiero Empezar Gratis Hoy! 🚀')
          .replace(/Solicitar Auditoría Gratis/g, '🚀 Obtener Diagnóstico Gratuito');
      } else if (lower.includes("tienda") || lower.includes("ecommerce")) {
        updatedHtml = TEMPLATES.ecommerce.html;
      } else {
        // Enriquecer el contenido general con el prompt del usuario
        updatedHtml = updatedHtml.replace(/<h1>.*?<\/h1>/i, `<h1>${instruction}</h1>`)
          .replace(/<title>.*?<\/title>/i, `<title>${instruction} - DigitalBoost</title>`);
      }

      setHtmlCode(updatedHtml);
      setAiHistory(prev => [
        ...prev,
        {
          role: "Usuario",
          message: instruction,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          role: "Copilot (" + activeRole.toUpperCase() + ")",
          message: `He aplicado los cambios solicitados con enfoque en [${activeRole}]. El código y la vista previa han sido actualizados en tiempo real.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      setIsGenerating(false);
      setUserPrompt('');
    }, 600);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([htmlCode], {type: 'text/html'});
    element.href = URL.createObjectURL(file);
    element.download = "index.html";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-[#030308] text-white flex flex-col">
      
      {/* Top Header */}
      <header className="h-14 border-b border-[#1e293b] bg-[#05050e] flex items-center justify-between px-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
            title="Volver a la portada"
          >
            <ArrowLeft size={16} /> Volver
          </button>
          <div className="h-4 w-px bg-slate-800"></div>
          <AppLogo className="w-6 h-6" />
          <span className="font-bold text-sm tracking-wide hidden sm:inline">DigitalBoost Studio</span>
        </div>
        
        {/* Modos Rápidos */}
        <div className="flex items-center gap-1 sm:gap-2">
          {(['web', 'landing', 'store', 'nft', 'pro'] as ToolMode[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setActiveTab(t);
                if (t === 'store') handleSelectTemplate('ecommerce');
                else if (t === 'landing') handleSelectTemplate('landing');
                else if (t === 'web') handleSelectTemplate('agency');
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === t ? 'bg-[#3b82f6] text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {t === 'web' ? 'Web IA' : t === 'store' ? 'Tienda' : t === 'landing' ? 'Landing' : t === 'nft' ? 'NFT' : 'Dev'}
            </button>
          ))}
        </div>

        {/* Acciones de exportación */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowCode(!showCode)}
            className={`p-2 rounded-lg text-xs font-mono border transition-colors ${
              showCode ? 'bg-sky-500/20 border-sky-500 text-sky-300' : 'border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Alternar vista de código"
          >
            <Code size={15}/>
          </button>
          <button 
            onClick={handleCopyCode}
            className="p-2 rounded-lg text-xs border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Copiar HTML"
          >
            {copied ? <CheckCircle2 size={15} className="text-emerald-400"/> : <Copy size={15}/>}
          </button>
          <button 
            onClick={handleDownload}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download size={14}/> <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </header>

      {/* Selector de Plantillas Rápidas */}
      <div className="bg-[#050612] border-b border-slate-800/80 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-400 font-semibold shrink-0 flex items-center gap-1">
          <Layers size={13} className="text-sky-400"/> Plantillas:
        </span>
        <button 
          onClick={() => handleSelectTemplate('agency')}
          className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-3 py-1 rounded-md border border-slate-800 shrink-0 transition"
        >
          🚀 Agencia Marketing
        </button>
        <button 
          onClick={() => handleSelectTemplate('landing')}
          className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-3 py-1 rounded-md border border-slate-800 shrink-0 transition"
        >
          🎯 Landing Finanzas
        </button>
        <button 
          onClick={() => handleSelectTemplate('restaurant')}
          className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-3 py-1 rounded-md border border-slate-800 shrink-0 transition"
        >
          🍕 Restaurante Gourmet
        </button>
        <button 
          onClick={() => handleSelectTemplate('ecommerce')}
          className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-3 py-1 rounded-md border border-slate-800 shrink-0 transition"
        >
          🛍️ Tienda Streetwear
        </button>
      </div>

      {/* Cuerpo Principal del Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        
        {/* Panel Izquierdo: AI Copilot & Controles */}
        <div className="w-full lg:w-[420px] xl:w-[460px] border-r border-[#1e293b] flex flex-col bg-[#030308] shrink-0">
          
          {/* Selector de Rol del Copilot */}
          <div className="p-3 border-b border-slate-800 bg-[#060714]">
            <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1.5">
              <Bot size={13} className="text-purple-400"/> ROL DEL AI COPILOT:
            </div>
            <div className="grid grid-cols-4 gap-1 text-[10px] font-semibold">
              {[
                { id: 'designer' as CopilotRole, label: 'Diseñador', icon: '🎨' },
                { id: 'coder' as CopilotRole, label: 'Programador', icon: '💻' },
                { id: 'copywriter' as CopilotRole, label: 'Copywriter', icon: '✍️' },
                { id: 'seo' as CopilotRole, label: 'SEO', icon: '🔍' },
                { id: 'marketing' as CopilotRole, label: 'Marketing', icon: '📈' },
                { id: 'ux' as CopilotRole, label: 'Analista UX', icon: '🎯' },
                { id: 'ecommerce' as CopilotRole, label: 'Ecommerce', icon: '🛍️' },
                { id: 'nft' as CopilotRole, label: 'Web3 / NFT', icon: '💎' },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setActiveRole(r.id)}
                  className={`py-1 px-1.5 rounded text-center transition-all ${
                    activeRole === r.id 
                      ? 'bg-purple-600 text-white font-bold shadow-sm' 
                      : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="mr-1">{r.icon}</span>{r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Historial de Conversación con el Copilot */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs bg-[#020206]">
            {aiHistory.map((item, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-xl ${
                  item.role === 'Usuario' 
                    ? 'bg-sky-950/60 border border-sky-800/60 ml-4 text-sky-100' 
                    : 'bg-slate-900/80 border border-slate-800 mr-4 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-center mb-1 text-[10px] text-slate-400 font-mono font-bold">
                  <span className={item.role === 'Usuario' ? 'text-sky-400' : 'text-purple-400'}>{item.role}</span>
                  <span>{item.timestamp}</span>
                </div>
                <p className="leading-relaxed whitespace-pre-wrap">{item.message}</p>
              </div>
            ))}
            {isGenerating && (
              <div className="p-3 bg-purple-950/40 border border-purple-800/60 rounded-xl text-purple-300 flex items-center gap-2 text-xs">
                <Sparkles size={15} className="animate-spin text-purple-400"/>
                <span>DigitalBoost AI está analizando y rediseñando los componentes...</span>
              </div>
            )}
          </div>

          {/* Sugerencias Rápidas de Edición */}
          <div className="p-3 border-t border-slate-800 bg-[#050612] space-y-2">
            <div className="text-[10px] font-bold text-slate-400 tracking-wider font-mono">ACCIONES CONVERSACIONALES RÁPIDAS:</div>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Hazlo más moderno",
                "Agrega sección de precios",
                "Haz el CTA más claro",
                "Mejora el SEO",
                "Convierte en tienda",
                "Optimiza para móvil"
              ].map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => handleCopilotAction(cmd)}
                  disabled={isGenerating}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-sky-400/60 text-slate-300 hover:text-white px-2.5 py-1 rounded-md text-[11px] transition-all disabled:opacity-50"
                >
                  ⚡ {cmd}
                </button>
              ))}
            </div>
          </div>

          {/* Caja de Entrada de Prompt */}
          <div className="p-3 border-t border-slate-800 bg-[#070818]">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (userPrompt.trim()) handleCopilotAction(userPrompt);
              }}
              className="flex gap-2"
            >
              <input 
                type="text"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder={`Pídele al ${activeRole}: ej. "Cambia el hero..."`}
                disabled={isGenerating}
                className="flex-1 bg-[#090a1a] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
              />
              <button 
                type="submit"
                disabled={!userPrompt.trim() || isGenerating}
                className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-90 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition"
              >
                <Sparkle size={14}/> Enviar
              </button>
            </form>
          </div>

        </div>

        {/* Panel Derecho: Preview en Vivo y Código */}
        <div className="flex-1 flex flex-col bg-[#020205] min-w-0">
          
          {/* Barra de Controles de la Vista Previa */}
          <div className="h-11 border-b border-slate-800 bg-[#050612] px-4 flex items-center justify-between">
            
            {/* Switch de Viewports (Responsive) */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button 
                onClick={() => setViewport('desktop')}
                className={`p-1.5 rounded ${viewport === 'desktop' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Vista Desktop (100%)"
              >
                <Monitor size={14}/>
              </button>
              <button 
                onClick={() => setViewport('tablet')}
                className={`p-1.5 rounded ${viewport === 'tablet' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Vista Tablet (768px)"
              >
                <Tablet size={14}/>
              </button>
              <button 
                onClick={() => setViewport('mobile')}
                className={`p-1.5 rounded ${viewport === 'mobile' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Vista Mobile (375px)"
              >
                <Smartphone size={14}/>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400 hidden sm:inline">RESOLUCIÓN:</span>
              <span className="text-sky-400 font-bold">
                {viewport === 'desktop' ? '100% FLUIDO' : viewport === 'tablet' ? '768px (TABLET)' : '375px (MOBILE)'}
              </span>
            </div>

            <button 
              onClick={() => {
                const blob = new Blob([htmlCode], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
              }}
              className="text-slate-400 hover:text-white text-xs flex items-center gap-1 hover:underline"
            >
              <ExternalLink size={13}/> <span className="hidden sm:inline">Abrir pestaña</span>
            </button>
          </div>

          {/* Área Central: Preview vs Código */}
          <div className="flex-1 flex flex-col min-h-0 bg-[#020206] p-2 sm:p-4 items-center justify-center overflow-hidden">
            {showCode ? (
              <div className="w-full h-full flex flex-col bg-[#050614] border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-400">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800 text-slate-400">
                  <span>EDITOR DE CÓDIGO FUENTE (HTML5 + TAILWIND)</span>
                  <button onClick={() => setShowCode(false)} className="text-xs text-sky-400 hover:underline">
                    Ver resultado visual
                  </button>
                </div>
                <textarea 
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  className="flex-1 w-full bg-transparent text-emerald-400 font-mono text-xs leading-relaxed focus:outline-none resize-none"
                  spellCheck="false"
                />
              </div>
            ) : (
              <div 
                className={`h-full bg-white transition-all duration-300 rounded-xl border border-slate-800 overflow-hidden shadow-2xl ${
                  viewport === 'mobile' 
                    ? 'w-[375px] max-w-full my-auto' 
                    : viewport === 'tablet' 
                    ? 'w-[768px] max-w-full my-auto' 
                    : 'w-full'
                }`}
              >
                <iframe 
                  srcDoc={htmlCode}
                  title="DigitalBoost Preview"
                  className="w-full h-full border-0 bg-white"
                  sandbox="allow-scripts allow-forms allow-modals"
                />
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

// =========================================================================
// COMPONENTE PRINCIPAL
// =========================================================================
export default function App() {
  type AppScreen = 'boot' | 'splash' | 'intro' | 'main' | 'workspace' | 'commerceBoot';

  const [currentScreen, setCurrentScreen] = useState<AppScreen>(() => {
    try {
      const saved = localStorage.getItem("digitalboost_current_screen");

      if (
        saved === "boot" ||
        saved === "splash" ||
        saved === "intro" ||
        saved === "main" ||
        saved === "workspace"
      ) {
        return saved as AppScreen;
      }

      return "boot";
    } catch {
      return "boot";
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "digitalboost_current_screen",
      currentScreen
    );
  }, [currentScreen]);
  const [selectedTool, setSelectedTool] = useState<ToolMode>(() => {
    try {
      const saved = localStorage.getItem("digitalboost_selected_tool");
      return saved ? (saved as ToolMode) : "web";
    } catch {
      return "web";
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "digitalboost_selected_tool",
      selectedTool
    );
  }, [selectedTool]);

  const handleSelectTool = (mode: ToolMode) => {
    setSelectedTool(mode);
    setCurrentScreen('commerceBoot');
  };

  return (
    <div className="bg-[#030308] min-h-screen text-white">
      {currentScreen === 'boot' && (
        <BootScreen
          onDone={() => setCurrentScreen('splash')}
        />
      )}

      {currentScreen === 'splash' && (
        <SplashScreen
          onContinue={() => setCurrentScreen('intro')}
        />
      )}

      {currentScreen === 'intro' && (
        <IntroScreen
          onStart={() => setCurrentScreen('main')}
        />
      )}

      {currentScreen === 'main' && (
        <DigitalBoostMainPage
          onSelectTool={(mode) => {
            setSelectedTool(mode as ToolMode);
            setCurrentScreen('workspace');
          }}
        />
      )}

      {currentScreen === 'commerceBoot' && (
        <CommerceOSBoot
          onComplete={() => setCurrentScreen('workspace')}
        />
      )}

      {currentScreen === 'workspace' && (
        <InternalWorkspace
          initialMode={selectedTool}
          onBack={() => setCurrentScreen('main')}
        />
      )}
    </div>
  );
}
