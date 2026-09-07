import { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Laptop, Tablet, Smartphone, Code, Eye, 
  Sparkles, Send, Download, ShoppingCart, 
  AppWindow, Square, Terminal, Check, RefreshCw,
  Plus, ShieldCheck, Zap,
  Palette, ArrowRight, Hexagon, Undo2
} from 'lucide-react';

import {
  parseCopilotInstruction,
  type CopilotAction
} from '../services/ai/copilotActions';

export type ToolMode = 'web' | 'store' | 'landing' | 'nft' | 'pro';

interface ToolWorkspaceProps {
  initialMode: ToolMode;
  onBack: () => void;
}

export const ToolWorkspace = ({ initialMode, onBack }: ToolWorkspaceProps) => {
  const [currentMode, setCurrentMode] = useState<ToolMode>(initialMode);
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [viewTab, setViewTab] = useState<'preview' | 'code'>('preview');
  
  // AI Copilot state
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string; time: string }[]>([
    {
      role: 'ai',
      text: getWelcomeMessage(initialMode),
      time: 'Ahora'
    }
  ]);
  
  // Dynamic Project Customization State
  const [siteTitle, setSiteTitle] = useState('Mi Proyecto DigitalBoost');
  const [siteSubtitle, setSiteSubtitle] = useState('Construido con inteligencia artificial y optimizado para máxima conversión.');
  const [hasPricing, setHasPricing] = useState(true);
  const [hasFaq, setHasFaq] = useState(true);
  
  const chatBottomRef = useRef<HTMLDivElement>(null);

  type ProjectSnapshot = {
    mode: ToolMode;
    title: string;
    subtitle: string;
    pricing: boolean;
    faq: boolean;
  };

  const [history, setHistory] = useState<ProjectSnapshot[]>([]);

  const pushSnapshot = () => {
    setHistory(prev => [
      ...prev.slice(-19),
      {
        mode: currentMode,
        title: siteTitle,
        subtitle: siteSubtitle,
        pricing: hasPricing,
        faq: hasFaq
      }
    ]);
  };

  const undoLastAction = () => {
    const previous = history[history.length - 1];

    if (!previous) return;

    setCurrentMode(previous.mode);
    setSiteTitle(previous.title);
    setSiteSubtitle(previous.subtitle);
    setHasPricing(previous.pricing);
    setHasFaq(previous.faq);

    setHistory(prev => prev.slice(0, -1));

    setMessages(prev => [
      ...prev,
      {
        role: 'ai',
        text: 'Deshice el último cambio y restauré el estado anterior del proyecto.',
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    ]);
  };

  const applyCopilotActions = (actions: CopilotAction[]) => {
    pushSnapshot();

    for (const action of actions) {
      switch (action.type) {
        case 'set_title':
          if (action.value) {
            setSiteTitle(action.value);
          }
          break;

        case 'set_subtitle':
          if (action.value) {
            setSiteSubtitle(action.value);
          }
          break;

        case 'toggle_pricing':
          if (action.value === 'on') {
            setHasPricing(true);
          }

          if (action.value === 'off') {
            setHasPricing(false);
          }
          break;

        case 'toggle_faq':
          setHasFaq(prev => !prev);
          break;

        case 'set_mode':
          if (action.mode) {
            setCurrentMode(action.mode);
          }
          break;

        case 'modernize':
          setSiteTitle(prev =>
            prev === 'Mi Proyecto DigitalBoost'
              ? 'Experiencias Digitales de Próxima Generación'
              : prev
          );
          break;

        case 'seo_audit':
          break;
      }
    }
  };

  useEffect(() => {
    setCurrentMode(initialMode);
    setMessages([
      {
        role: 'ai',
        text: getWelcomeMessage(initialMode),
        time: 'Ahora'
      }
    ]);
  }, [initialMode]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  function getWelcomeMessage(mode: ToolMode) {
    switch (mode) {
      case 'web':
        return '¡Hola! He preparado el entorno para tu Sitio Web con IA. Puedo modificar textos, crear secciones, ajustar la paleta o añadir funcionalidades. ¿Qué deseas hacer?';
      case 'store':
        return '¡Bienvenido a Tiendas Virtuales! He configurado tu catálogo base estilo Shopify. ¿Quieres añadir nuevos productos, cupones o configurar pagos?';
      case 'landing':
        return '¡Entorno de Landing Page listo! Enfocado 100% en conversión. Puedo optimizar el Hero, ajustar el llamado a la acción (CTA) o auditar el SEO.';
      case 'nft':
        return '¡Lienzo Web3 & NFTs activo! Puedes mintear colecciones, configurar smart contracts en Solana/Ethereum y exportar metadatos a IPFS.';
      case 'pro':
        return '¡Consola de Herramientas Pro lista! Terminal interactiva, auditor de rendimiento Lighthouse, generador de APIs y exportador de código.';
    }
  }

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputPrompt;

    if (!text.trim() || isGenerating) return;

    const now = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    setMessages(prev => [
      ...prev,
      {
        role: 'user',
        text,
        time: now
      }
    ]);

    if (!textToSend) {
      setInputPrompt('');
    }

    setIsGenerating(true);

    window.setTimeout(() => {
      const result = parseCopilotInstruction(text);

      applyCopilotActions(result.actions);

      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text: result.reply,
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      ]);

      setIsGenerating(false);
    }, 450);
  };

  const getDeviceWidthClass = () => {
    if (device === 'mobile') return 'max-w-[375px] shadow-[0_0_50px_rgba(0,0,0,0.8)] border-x border-[#1e293b] rounded-2xl my-4';
    if (device === 'tablet') return 'max-w-[768px] shadow-[0_0_50px_rgba(0,0,0,0.8)] border-x border-[#1e293b] rounded-xl my-4';
    return 'w-full';
  };

  return (
    <div className="fixed inset-0 bg-[#020204] flex flex-col font-sans z-[100] text-slate-300 overflow-hidden select-none animate-in fade-in duration-300">
      
      {/* 1. TOP HEADER DEL WORKSPACE */}
      <header className="h-[64px] border-b border-[#1e293b] bg-[#05050A] flex items-center justify-between px-4 sm:px-6 shrink-0 z-30">
        
        {/* Izquierda: Volver y Switcher de herramientas */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-300 hover:text-white bg-[#0A0A14] hover:bg-white/10 px-3 py-2 rounded-lg border border-slate-800 transition-colors text-xs font-bold"
            title="Volver a la Página Principal"
          >
            <ArrowLeft size={16} className="text-[#38bdf8]"/>
            <span className="hidden md:inline">Volver a DigitalBoost</span>
          </button>

          <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

          {/* Selector de modo de herramienta */}
          <div className="flex items-center bg-[#020204] p-1 rounded-lg border border-[#1e293b] overflow-x-auto max-w-[280px] sm:max-w-none">
            {[
              { id: 'web', label: 'Web con IA', icon: Code },
              { id: 'store', label: 'Tienda Virtual', icon: ShoppingCart },
              { id: 'landing', label: 'Landing Page', icon: AppWindow },
              { id: 'nft', label: 'NFTs & Web3', icon: Square },
              { id: 'pro', label: 'Pro Tools', icon: Terminal },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCurrentMode(tab.id as ToolMode)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
                  currentMode === tab.id 
                    ? 'bg-gradient-to-r from-[#6366f1] to-[#3b82f6] text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon size={13} />
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Centro: Responsive Switcher */}
        <div className="hidden md:flex items-center bg-[#020204] border border-[#1e293b] p-1 rounded-lg">
          <button 
            onClick={() => setDevice('desktop')}
            className={`p-1.5 rounded transition-colors ${device === 'desktop' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
            title="Vista Desktop"
          >
            <Laptop size={16}/>
          </button>
          <button 
            onClick={() => setDevice('tablet')}
            className={`p-1.5 rounded transition-colors ${device === 'tablet' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
            title="Vista Tablet"
          >
            <Tablet size={16}/>
          </button>
          <button 
            onClick={() => setDevice('mobile')}
            className={`p-1.5 rounded transition-colors ${device === 'mobile' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
            title="Vista Móvil"
          >
            <Smartphone size={16}/>
          </button>
        </div>

        {/* Derecha: Selector de vista & Exportar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center bg-[#020204] border border-[#1e293b] p-1 rounded-lg">
            <button
              onClick={() => setViewTab('preview')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold ${viewTab === 'preview' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Eye size={13}/> <span className="hidden sm:inline">Preview</span>
            </button>
            <button
              onClick={() => setViewTab('code')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold ${viewTab === 'code' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Code size={13}/> <span className="hidden sm:inline">Código</span>
            </button>
          </div>

          <button 
            onClick={() => alert('¡Proyecto exportado con éxito en formato HTML/React + Tailwind!')}
            className="bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] text-white px-3.5 sm:px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 hover:opacity-90 shadow-md transition-transform hover:scale-105"
          >
            <Download size={14}/>
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </header>

      {/* 2. ÁREA DE TRABAJO PRINCIPAL */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* LIENZO DE DISEÑO Y PREVIEW */}
        <main className="flex-1 bg-[#020204] overflow-y-auto flex flex-col items-center p-2 sm:p-6 relative">
          
          <div className={`${getDeviceWidthClass()} bg-[#06060c] border border-[#1e293b] transition-all duration-300 min-h-full flex flex-col relative`}>
            
            {viewTab === 'code' ? (
              /* PESTAÑA DE CÓDIGO FUENTE */
              <div className="p-6 font-mono text-xs text-slate-300 bg-[#040408] min-h-[600px] overflow-x-auto leading-relaxed">
                <div className="text-slate-500 mb-4">// Código generado por DigitalBoost AI Engine v2.6</div>
                <div className="text-[#f472b6]">&lt;!DOCTYPE html&gt;</div>
                <div className="text-[#38bdf8]">&lt;html lang="es" class="dark"&gt;</div>
                <div className="pl-4 text-slate-400">&lt;head&gt;</div>
                <div className="pl-8 text-[#a855f7]">&lt;title&gt;{siteTitle}&lt;/title&gt;</div>
                <div className="pl-8 text-slate-400">&lt;meta name="viewport" content="width=device-width, initial-scale=1.0" /&gt;</div>
                <div className="pl-8 text-slate-400">&lt;script src="https://cdn.tailwindcss.com"&gt;&lt;/script&gt;</div>
                <div className="pl-4 text-slate-400">&lt;/head&gt;</div>
                <div className="pl-4 text-slate-400">&lt;body class="bg-black text-white"&gt;</div>
                <div className="pl-8 text-[#38bdf8]">&lt;header class="border-b border-white/10 p-6 flex justify-between"&gt;</div>
                <div className="pl-12 text-[#fde047]">&lt;div class="font-bold"&gt;DIGITALBOOST APP&lt;/div&gt;</div>
                <div className="pl-8 text-[#38bdf8]">&lt;/header&gt;</div>
                <div className="pl-8 text-[#38bdf8]">&lt;main class="max-w-6xl mx-auto px-6 py-20"&gt;</div>
                <div className="pl-12 text-[#a855f7]">&lt;h1 class="text-5xl font-extrabold"&gt;{siteTitle}&lt;/h1&gt;</div>
                <div className="pl-12 text-slate-400">&lt;p class="text-lg text-slate-300 mt-4"&gt;{siteSubtitle}&lt;/p&gt;</div>
                <div className="pl-8 text-[#38bdf8]">&lt;/main&gt;</div>
                <div className="pl-4 text-slate-400">&lt;/body&gt;</div>
                <div className="text-[#38bdf8]">&lt;/html&gt;</div>
              </div>
            ) : (
              /* PESTAÑA DE PREVIEW VISUAL */
              <div className="flex-1 flex flex-col text-slate-200">
                
                {/* BARRA DE NAVEGACIÓN DEL PROYECTO */}
                <nav className="h-16 border-b border-[#1e293b] px-6 flex items-center justify-between bg-[#040408]/90 backdrop-blur-sm sticky top-0 z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center font-bold text-white text-xs">
                      DB
                    </div>
                    <span className="font-bold text-sm tracking-wide text-white">Mi Sitio</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-6 text-xs font-medium text-slate-400">
                    <span className="hover:text-white cursor-pointer transition-colors">Inicio</span>
                    <span className="hover:text-white cursor-pointer transition-colors">Servicios</span>
                    {hasPricing && <span className="hover:text-white cursor-pointer transition-colors">Precios</span>}
                    {hasFaq && <span className="hover:text-white cursor-pointer transition-colors">FAQ</span>}
                  </div>
                  <button className="bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white text-xs font-bold px-4 py-1.5 rounded-md hover:opacity-90">
                    Contactar
                  </button>
                </nav>

                {/* CONTENIDO SEGÚN LA HERRAMIENTA SELECCIONADA */}
                {currentMode === 'web' && (
                  <div className="p-6 sm:p-12 space-y-16">
                    {/* Hero Section */}
                    <div className="text-center max-w-3xl mx-auto py-8">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 text-blue-400 text-xs font-semibold mb-6 bg-blue-500/10">
                        <Sparkles size={13}/> Potenciado por Inteligencia Artificial
                      </div>
                      <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-4 tracking-tight">
                        {siteTitle}
                      </h1>
                      <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8 max-w-xl mx-auto">
                        {siteSubtitle}
                      </p>
                      <div className="flex flex-wrap justify-center gap-4">
                        <button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 transition-all">
                          Empezar Ahora <ArrowRight size={16}/>
                        </button>
                        <button className="border border-slate-700 hover:bg-white/5 text-slate-300 text-xs sm:text-sm font-bold px-6 py-3 rounded-lg transition-all">
                          Ver Demostración
                        </button>
                      </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { title: 'Velocidad Extrema', desc: 'Optimizado para cargar en menos de 0.8s en cualquier dispositivo.', icon: Zap },
                        { title: 'Arquitectura Segura', desc: 'Protección SSL, encriptación moderna y aislamiento de datos.', icon: ShieldCheck },
                        { title: 'Diseño Inteligente', desc: 'Composiciones dinámicas que se ajustan al comportamiento del usuario.', icon: Palette }
                      ].map((feat, i) => (
                        <div key={i} className="bg-[#0b0b14] border border-[#1e293b] p-6 rounded-xl hover:border-[#38bdf8]/40 transition-all">
                          <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/30 flex items-center justify-center text-[#38bdf8] mb-4">
                            <feat.icon size={20}/>
                          </div>
                          <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                          <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                        </div>
                      ))}
                    </div>

                    {/* Pricing Section */}
                    {hasPricing && (
                      <div className="border-t border-[#1e293b] pt-12">
                        <h2 className="text-2xl font-bold text-center text-white mb-2">Planes a tu medida</h2>
                        <p className="text-xs text-center text-slate-400 mb-8">Elige el plan ideal para tu proyecto</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                          <div className="bg-[#080811] border border-slate-800 p-6 rounded-xl flex flex-col">
                            <span className="text-xs font-bold text-slate-400">PLAN INICIAL</span>
                            <div className="text-3xl font-extrabold text-white my-3">$29<span className="text-xs font-normal text-slate-400">/mes</span></div>
                            <ul className="text-xs text-slate-300 space-y-2 mb-6 flex-1">
                              <li className="flex items-center gap-2"><Check size={14} className="text-[#3b82f6]"/> 1 Sitio Web completo</li>
                              <li className="flex items-center gap-2"><Check size={14} className="text-[#3b82f6]"/> Dominio personalizado</li>
                              <li className="flex items-center gap-2"><Check size={14} className="text-[#3b82f6]"/> Soporte 24/7</li>
                            </ul>
                            <button className="w-full py-2.5 rounded-lg border border-slate-700 text-xs font-bold hover:bg-white/5">Elegir Inicial</button>
                          </div>
                          <div className="bg-[#0a0c1a] border border-[#3b82f6]/60 p-6 rounded-xl flex flex-col relative shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                            <div className="absolute -top-3 right-6 bg-[#3b82f6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">POPULAR</div>
                            <span className="text-xs font-bold text-[#38bdf8]">PLAN PRO IA</span>
                            <div className="text-3xl font-extrabold text-white my-3">$79<span className="text-xs font-normal text-slate-400">/mes</span></div>
                            <ul className="text-xs text-slate-300 space-y-2 mb-6 flex-1">
                              <li className="flex items-center gap-2"><Check size={14} className="text-[#38bdf8]"/> Sitios Ilimitados</li>
                              <li className="flex items-center gap-2"><Check size={14} className="text-[#38bdf8]"/> Copilot IA Avanzado</li>
                              <li className="flex items-center gap-2"><Check size={14} className="text-[#38bdf8]"/> Integración Ecommerce</li>
                            </ul>
                            <button className="w-full py-2.5 rounded-lg bg-[#3b82f6] text-white text-xs font-bold hover:bg-[#2563eb] shadow-md">Comenzar Pro</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TIENDA VIRTUAL MODE */}
                {currentMode === 'store' && (
                  <div className="p-6 sm:p-10 space-y-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#080812] border border-[#1e293b] p-6 rounded-xl">
                      <div>
                        <span className="text-xs text-[#c084fc] font-bold tracking-widest uppercase">TIENDA VIRTUAL SHOPIFY-STYLE</span>
                        <h2 className="text-2xl font-bold text-white mt-1">Catálogo de Productos</h2>
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-md">
                          <Plus size={14}/> Añadir Producto
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {[
                        { name: 'Auriculares Pro Wireless', price: '$189.00', category: 'Audio', status: 'En Stock', tag: 'Bestseller' },
                        { name: 'Smartwatch Titan Neo', price: '$249.00', category: 'Wearables', status: 'En Stock', tag: 'Nuevo' },
                        { name: 'Teclado Mecánico RGB', price: '$129.00', category: 'Gaming', status: '5 Disponibles', tag: 'Oferta' }
                      ].map((prod, i) => (
                        <div key={i} className="bg-[#080812] border border-[#1e293b] rounded-xl overflow-hidden group hover:border-[#8b5cf6]/50 transition-all flex flex-col">
                          <div className="h-40 bg-[#0d0f20] flex items-center justify-center relative p-4">
                            <ShoppingCart size={40} className="text-slate-600 group-hover:text-[#8b5cf6] transition-colors"/>
                            <span className="absolute top-3 right-3 bg-black/60 border border-white/10 text-white text-[10px] px-2 py-0.5 rounded font-semibold">{prod.tag}</span>
                          </div>
                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <span className="text-[11px] text-slate-500 font-medium">{prod.category}</span>
                              <h4 className="text-sm font-bold text-white mt-1">{prod.name}</h4>
                            </div>
                            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800">
                              <span className="text-base font-extrabold text-[#38bdf8]">{prod.price}</span>
                              <button className="bg-white/10 hover:bg-[#8b5cf6] text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors">
                                Comprar
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* LANDING PAGE MODE */}
                {currentMode === 'landing' && (
                  <div className="p-6 sm:p-12 space-y-12">
                    <div className="text-center max-w-2xl mx-auto">
                      <div className="inline-block bg-[#f472b6]/10 border border-[#f472b6]/30 text-[#f472b6] text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                        🎯 Landing Page de Alta Conversión
                      </div>
                      <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
                        Multiplica tus Ventas con Automatización Inteligente
                      </h1>
                      <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                        Captura clientes potenciales, automatiza respuestas y cierra tratos en piloto automático.
                      </p>
                      <div className="bg-[#080812] border border-[#1e293b] p-6 rounded-2xl max-w-md mx-auto shadow-2xl">
                        <h4 className="text-sm font-bold text-white mb-3 text-left">Comienza tu prueba de 14 días</h4>
                        <div className="space-y-3">
                          <input type="text" placeholder="Tu nombre" className="w-full bg-[#020204] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#f472b6]" />
                          <input type="email" placeholder="Tu correo electrónico" className="w-full bg-[#020204] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#f472b6]" />
                          <button className="w-full bg-gradient-to-r from-[#f472b6] to-[#8b5cf6] text-white text-xs font-bold py-2.5 rounded-lg shadow-lg hover:opacity-90 transition-all">
                            Acceso Inmediato Gratis
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* NFT & WEB3 MODE */}
                {currentMode === 'nft' && (
                  <div className="p-6 sm:p-10 space-y-8">
                    <div className="bg-gradient-to-r from-[#170a2b] to-[#080812] border border-[#a855f7]/40 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <span className="text-xs text-[#a855f7] font-bold tracking-widest uppercase">WEB3 & NFT GENERATOR</span>
                        <h2 className="text-2xl font-bold text-white mt-1">Colección CyberDragon #001</h2>
                        <p className="text-xs text-slate-400 mt-1">Desplegado en Solana & IPFS Storage</p>
                      </div>
                      <button className="bg-[#a855f7] hover:bg-[#9333ea] text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                        Mintear NFT (0.5 SOL)
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map(idx => (
                        <div key={idx} className="bg-[#080812] border border-slate-800 rounded-xl p-3 text-center">
                          <div className="aspect-square bg-[#0d0f24] rounded-lg flex items-center justify-center text-[#a855f7] mb-2 border border-slate-800">
                            <Hexagon size={32}/>
                          </div>
                          <div className="text-xs font-bold text-white">Dragon #{idx}042</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Rareza: Legendario</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PRO TOOLS MODE */}
                {currentMode === 'pro' && (
                  <div className="p-6 sm:p-8 space-y-6">
                    <div className="bg-[#020204] border border-[#1e293b] rounded-xl p-4 font-mono text-xs text-slate-300">
                      <div className="flex items-center gap-2 text-slate-500 mb-3 border-b border-slate-800 pb-2">
                        <Terminal size={14} className="text-[#38bdf8]"/>
                        <span>DigitalBoost CLI Engine Terminal</span>
                      </div>
                      <div className="space-y-1 text-[11px]">
                        <p className="text-emerald-400">$ digitalboost audit --performance --seo</p>
                        <p className="text-slate-400">✓ Rendimiento Core Web Vitals: 99/100</p>
                        <p className="text-slate-400">✓ Accesibilidad WCAG 2.1 AA: 100/100</p>
                        <p className="text-slate-400">✓ Mejores Prácticas de Seguridad: 100/100</p>
                        <p className="text-slate-400">✓ Optimización de Imágenes WebP: Activa</p>
                        <p className="text-cyan-400 mt-2">$ ready to build & deploy.</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </main>

        {/* 3. ASIDE: AI COPILOT INTERACTIVO */}
        <aside className="w-full lg:w-[350px] border-t lg:border-t-0 lg:border-l border-[#1e293b] bg-[#05050A] flex flex-col shrink-0 h-[380px] lg:h-auto z-20">
          
          {/* Header del Copilot */}
          <div className="h-14 border-b border-[#1e293b] px-4 flex items-center justify-between bg-[#070712] shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#8b5cf6] to-[#3b82f6] flex items-center justify-center text-white">
                <Sparkles size={14}/>
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">DigitalBoost Copilot</h3>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Activo
                </span>
              </div>
            </div>
          </div>

          <div className="absolute right-4 top-[72px] z-30">
            <button
              onClick={undoLastAction}
              disabled={history.length === 0}
              className="p-2 rounded-lg border border-slate-800 bg-[#0a0a14] text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Deshacer último cambio"
            >
              <Undo2 size={14} />
            </button>
          </div>

          {/* Quick Action Prompt Chips */}
          <div className="p-3 border-b border-[#1e293b] bg-[#040409] flex gap-2 overflow-x-auto shrink-0">
            {[
              '✨ Hazlo más moderno',
              '🚀 Optimizar SEO',
              '💰 Añadir precios',
              '❓ Añadir FAQ',
              '📱 Versión móvil'
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="text-[10px] whitespace-nowrap bg-[#0b0c1c] hover:bg-[#3b82f6]/20 border border-slate-800 hover:border-[#3b82f6]/50 text-slate-300 hover:text-white px-2.5 py-1 rounded-full transition-all"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Mensajes del Chat */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
              >
                <div 
                  className={`p-3 rounded-xl max-w-[88%] text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#6366f1] to-[#3b82f6] text-white shadow-md'
                      : 'bg-[#0b0c1c] border border-slate-800 text-slate-200'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-600 mt-1 px-1">{msg.time}</span>
              </div>
            ))}

            {isGenerating && (
              <div className="flex items-center gap-2 p-3 bg-[#0b0c1c] border border-slate-800 rounded-xl w-max text-xs text-slate-400">
                <RefreshCw size={14} className="animate-spin text-[#8b5cf6]"/>
                <span>Aplicando cambios con IA...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input del Chat */}
          <div className="p-3 border-t border-[#1e293b] bg-[#040409] shrink-0">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Pídele un cambio a la IA..."
                className="flex-1 bg-[#0a0a14] border border-slate-800 focus:border-[#38bdf8]/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={isGenerating || !inputPrompt.trim()}
                className="bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-40 text-white p-2 rounded-lg transition-colors shrink-0"
              >
                <Send size={14}/>
              </button>
            </form>
          </div>

        </aside>

      </div>
    </div>
  );
};
