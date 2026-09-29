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

  const commerceSyncClients = new Set();
  app.get("/api/commerce/sync", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();
    res.write("event: hello\ndata: {}\n\n");
    commerceSyncClients.add(res);
    const ping = setInterval(() => {
      try { res.write("event: ping\ndata: {}\n\n"); } catch {}
    }, 15000);
    req.on("close", () => {
      clearInterval(ping);
      commerceSyncClients.delete(res);
    });
  });
  app.post("/api/commerce/sync/ping", (_req, res) => {
    for (const client of commerceSyncClients) {
      try { client.write("event: commerce\ndata: {\"reason\":\"peer\"}\n\n"); } catch {}
    }
    res.json({ ok: true, peers: commerceSyncClients.size });
  });

  app.post('/api/websites-builder/brief', async (req, res) => {
    try {
      const {
        prompt,
        kind = "web",
        preferredDesignLanguage,
      } = req.body || {};

      if (typeof prompt !== "string" || !prompt.trim()) {
        return res.status(400).json({
          error: "Prompt requerido.",
        });
      }

      if (prompt.length > 6000) {
        return res.status(400).json({
          error: "Prompt demasiado largo.",
        });
      }

      const allowedLanguages = [
        "Digital Editorial",
        "Dark Intelligence",
        "Commerce Luxury",
        "Neo-Brutalist",
        "Soft Precision",
        "Experimental",
        "Commerce Native",
        "Data Native",
      ];

      const safeKind =
        kind === "landing" ? "landing" : "web";

      const preferred =
        allowedLanguages.includes(preferredDesignLanguage)
          ? preferredDesignLanguage
          : "Soft Precision";

      const ai = getGeminiClient();

      if (!ai) {
        return res.status(503).json({
          error: "Gemini no configurado.",
          fallbackAllowed: true,
        });
      }

      const instruction = `
You are DigitalBoost Web Operator.

AUTHORITY:
- Proposal only.
- Do not mutate files.
- Do not deploy.
- Return JSON only.
- Do not return HTML.

DATA INTEGRITY:
- Never invent production metrics.
- Never invent customers, awards, revenue,
  conversion rates, testimonials or social proof.
- If evidence was not supplied, proof MUST be
  exactly "Por definir".

Avoid generic SaaS composition.

Allowed design languages:
${allowedLanguages.join(", ")}

Preferred design language:
${preferred}

Return:
{
  "brief": {
    "kind": "${safeKind}",
    "projectName": "...",
    "audience": "...",
    "offer": "...",
    "goal": "...",
    "tone": "...",
    "designLanguage": "${preferred}",
    "headline": "...",
    "subheadline": "...",
    "primaryCta": "...",
    "proof": "Por definir"
  },
  "tokens": {
    "background": "#000000",
    "surface": "#000000",
    "foreground": "#ffffff",
    "muted": "#999999",
    "accent": "#000000",
    "accentForeground": "#ffffff",
    "border": "#000000"
  }
}

USER INTENT:
${prompt.trim()}
`;

      const response =
        await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: instruction,
        });

      const raw =
        typeof response.text === "string"
          ? response.text
          : "";

      const clean = raw
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      let parsed;

      try {
        parsed = JSON.parse(clean);
      } catch {
        return res.status(502).json({
          error: "Respuesta no estructurada.",
          fallbackAllowed: true,
        });
      }

      if (!parsed?.brief) {
        return res.status(502).json({
          error: "Brief inválido.",
          fallbackAllowed: true,
        });
      }

      parsed.brief.kind = safeKind;

      if (
        !allowedLanguages.includes(
          parsed.brief.designLanguage
        )
      ) {
        parsed.brief.designLanguage = preferred;
      }

      if (
        typeof parsed.brief.proof !== "string" ||
        !parsed.brief.proof.trim()
      ) {
        parsed.brief.proof = "Por definir";
      }

      return res.json({
        authority: "proposal-only",
        dataPolicy:
          "no-invented-production-metrics",
        brief: parsed.brief,
        tokens: parsed.tokens || {},
      });

    } catch (error) {
      console.error(
        "Web Operator error:",
        error
      );

      return res.status(500).json({
        error:
          "No se pudo generar el website brief.",
        fallbackAllowed: true,
      });
    }
  });

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
