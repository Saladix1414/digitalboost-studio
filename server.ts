import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { registerOpenClawRoutes } from './src/server/DigitalBoostOpenClawServer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // DigitalBoost OpenClaw API debe registrarse antes de Vite/Spa fallback.
  registerOpenClawRoutes(app);

  app.post('/api/generate', async (req, res) => {
    try {
      const { prompt, type, currentHtml } = req.body;
      const ai = getGeminiClient();
      
      if (!ai) {
        return res.status(500).json({ error: "Falta la API Key de Gemini." });
      }

      const systemInstruction = `Eres el "AI Copilot" de DigitalBoost, un entorno avanzado de desarrollo visual.
Tu trabajo es generar código HTML válido estructurado para aplicaciones web.
Usa clases de Tailwind CSS para todos los estilos.
Tus diseños deben ser de nivel mundial (World-Class).
Si el tipo de proyecto es "ecommerce", incluye componentes de tienda.
Si es "nft", incluye un diseño oscuro tipo Web3.
Si el usuario adjunta un "HTML Actual", significa que quiere MODIFICAR ese código. Mantén lo que sirve y aplica el cambio pedido.
IMPORTANTE: Devuelve SOLAMENTE el código HTML puro. No uses Markdown (\`\`\`html) y no escribas texto adicional.`;
      
      const userMessage = currentHtml 
        ? `HTML Actual del proyecto:\n${currentHtml}\n\nInstrucción del usuario para modificarlo: ${prompt}`
        : `Instrucción del usuario para un nuevo proyecto tipo ${type}: ${prompt}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userMessage,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      let html = response.text || '';
      html = html.replace(/```html\n?/gi, '').replace(/```\n?/g, '');
      
      res.json({ html: html.trim() });
    } catch (error: any) {
      console.error("Error generating code:", error);
      res.status(500).json({ error: error.message || "Error interno generando con IA" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: process.cwd(),
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Middleware global de Express 5 para servir el HTML
    app.use(async (req, res, next) => {
      const url = req.originalUrl;
      // 1. Ignorar la API
      if (url.startsWith('/api')) return next();
      // 2. CRÍTICO: Ignorar peticiones de archivos estáticos (como main.tsx o .css)
      // Solo servimos index.html si el navegador nos dice "Quiero HTML"
      if (req.headers.accept && !req.headers.accept.includes('text/html')) {
        return next();
      }
      
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        console.error(e);
        res.status(500).end(e.message);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }


  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor backend y frontend corriendo en el puerto ${PORT}`);
  });
}

startServer();
