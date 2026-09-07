import { spawn } from "node:child_process";

type OpenClawTaskRequest = {
  task?: string;
  prompt?: string;
  model?: string;
};

type OpenClawTaskResult = {
  ok: boolean;
  provider: "openclaw";
  model?: string;
  response?: string;
  error?: string;
  durationMs?: number;
};

const MAX_PROMPT_LENGTH = 8000;
const MAX_TASK_LENGTH = 80;

const ALLOWED_TASKS = new Set([
  "reason",
  "analyze",
  "explain",
  "plan",
  "propose",
]);

function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function allowedModel(value: unknown): string | undefined {
  const model = cleanText(value, 160);

  if (!model) return undefined;

  // Nunca aceptamos comandos ni argumentos arbitrarios.
  // El modelo debe tener formato provider/model.
  if (!/^[a-zA-Z0-9._:-]+\/[a-zA-Z0-9._:-]+$/.test(model)) {
    return undefined;
  }

  return model;
}

function runOpenClaw(
  model: string,
  prompt: string,
): Promise<OpenClawTaskResult> {
  return new Promise((resolve) => {
    const started = Date.now();

    const args = [
      "infer",
      "model",
      "run",
      "--local",
      "--json",
      "--model",
      model,
      "--prompt",
      prompt,
    ];

    console.error("[DB_OPENCLAW_DIAGNOSTIC_START]", {
      command: "openclaw",
      args,
      cwd: process.cwd(),
      path: process.env.PATH,
      nodeCompileCache:
        process.env.NODE_COMPILE_CACHE || "/var/tmp/openclaw-compile-cache",
      noRespawn:
        process.env.OPENCLAW_NO_RESPAWN || "1",
      startedAt: new Date().toISOString(),
    });

    const child = spawn("openclaw", args, {
      shell: false,
      env: {
        ...process.env,
        NODE_COMPILE_CACHE:
          process.env.NODE_COMPILE_CACHE || "/var/tmp/openclaw-compile-cache",
        OPENCLAW_NO_RESPAWN:
          process.env.OPENCLAW_NO_RESPAWN || "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    console.error("[DB_OPENCLAW_DIAGNOSTIC_SPAWNED]", {
      pid: child.pid,
      spawnedAt: new Date().toISOString(),
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      console.error(
        "[DB_OPENCLAW_DIAGNOSTIC_STDOUT]",
        {
          pid: child.pid,
          bytes: chunk.length,
          at: new Date().toISOString(),
        }
      );
    });

    child.stderr.on("data", (chunk) => {
      console.error(
        "[DB_OPENCLAW_DIAGNOSTIC_STDERR]",
        {
          pid: child.pid,
          bytes: chunk.length,
          at: new Date().toISOString(),
          preview: chunk.toString().slice(0, 500),
        }
      );
    });

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
      if (stdout.length > 50000) {
        child.kill("SIGTERM");
      }
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      if (stderr.length > 12000) {
        stderr = stderr.slice(-12000);
      }
    });

    const timeout = setTimeout(() => {
      console.error("[DB_OPENCLAW_DIAGNOSTIC_TIMEOUT]", {
        pid: child.pid,
        timeoutMs: 480000,
        at: new Date().toISOString(),
      });

      child.kill("SIGTERM");

      resolve({
        ok: false,
        provider: "openclaw",
        model,
        error: "OpenClaw inference timeout",
        durationMs: Date.now() - started,
      });
    }, 480000);

    child.on("error", (error) => {
      console.error("[DB_OPENCLAW_DIAGNOSTIC_ERROR]", {
        pid: child.pid,
        message: error.message,
        code: (error as any).code,
        errno: (error as any).errno,
        syscall: (error as any).syscall,
        at: new Date().toISOString(),
      });

      clearTimeout(timeout);

      resolve({
        ok: false,
        provider: "openclaw",
        model,
        error: error.message,
        durationMs: Date.now() - started,
      });
    });

    child.on("close", (code) => {
      console.error("[DB_OPENCLAW_DIAGNOSTIC_CLOSE]", {
        pid: child.pid,
        code,
        stdoutBytes: stdout.length,
        stderrBytes: stderr.length,
        stdoutPreview: stdout.slice(0, 1000),
        stderrPreview: stderr.slice(0, 2000),
        closedAt: new Date().toISOString(),
      });

      clearTimeout(timeout);

      if (code !== 0) {
        resolve({
          ok: false,
          provider: "openclaw",
          model,
          error: "OpenClaw inference failed",
          durationMs: Date.now() - started,
        });
        return;
      }

      const raw = stdout.trim();

      let response = "";

      try {
        const parsed = JSON.parse(raw);

        response =
          parsed?.response ??
          parsed?.output ??
          parsed?.message?.content ??
          parsed?.outputs?.[0]?.content ??
          parsed?.outputs?.[0]?.text ??
          "";
      } catch {
        // Algunas versiones pueden devolver texto aunque --json esté activo.
        response = raw;
      }

      if (!response) {
        resolve({
          ok: false,
          provider: "openclaw",
          model,
          error: "OpenClaw returned an empty response",
          durationMs: Date.now() - started,
        });
        return;
      }

      resolve({
        ok: true,
        provider: "openclaw",
        model,
        response: String(response).trim(),
        durationMs: Date.now() - started,
      });
    });
  });
}

async function discoverModels(): Promise<string[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch("http://127.0.0.1:11434/api/tags", {
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    const models = Array.isArray(data?.models)
      ? data.models
          .map((item: any) => {
            const name =
              typeof item?.name === "string"
                ? item.name.trim()
                : "";

            return name ? `ollama/${name}` : "";
          })
          .filter(Boolean)
      : [];

    return [...new Set(models)];
  } catch {
    return [];
  }
}

async function discoverDefaultModel(): Promise<string | undefined> {
  const models = await discoverModels();

  if (models.length === 0) {
    return undefined;
  }

  // Preferencia estable: Qwen si está disponible.
  const qwen = models.find((model) =>
    /qwen/i.test(model),
  );

  return qwen || models[0];
}

let inferBusy = false;

export function registerOpenClawRoutes(app: any) {
  app.get("/api/openclaw/status", async (_req: any, res: any) => {
    try {
      const models = await discoverModels();

      res.json({
        ok: models.length > 0,
        provider: "openclaw",
        local: true,
        ollama: models.length > 0,
        models,
      });
    } catch {
      res.status(500).json({
        ok: false,
        provider: "openclaw",
        local: true,
        ollama: false,
        models: [],
      });
    }
  });

  app.get("/api/openclaw/models", async (_req: any, res: any) => {
    try {
      const models = await discoverModels();

      res.json({
        ok: true,
        models,
      });
    } catch {
      res.status(500).json({
        ok: false,
        models: [],
      });
    }
  });

  app.post("/api/openclaw/task", async (req: any, res: any) => {
    if (inferBusy) {
      res.status(429).json({ ok: false, error: "OpenClaw ocupado" });
      return;
    }
    inferBusy = true;
    try {
      const body = (req.body || {}) as OpenClawTaskRequest;

      const task = cleanText(body.task, MAX_TASK_LENGTH).toLowerCase();
      const prompt = cleanText(body.prompt, MAX_PROMPT_LENGTH);

      if (!ALLOWED_TASKS.has(task)) {
        res.status(400).json({
          ok: false,
          error: "Unsupported task type",
        });
        return;
      }

      if (!prompt) {
        res.status(400).json({
          ok: false,
          error: "Prompt is required",
        });
        return;
      }

      const requestedModel = allowedModel(body.model);
      const discoveredModels = await discoverModels();

      const model =
        requestedModel &&
        discoveredModels.includes(requestedModel)
          ? requestedModel
          : await discoverDefaultModel();

      if (!model) {
        res.status(503).json({
          ok: false,
          error: "No local Ollama model available through OpenClaw",
        });
        return;
      }

      const systemInstruction = [
        "You are an AI reasoning component inside DigitalBoost.",
        "PULSE remains the decision-making brain.",
        "You must analyze, explain, reason, or propose.",
        "Do not execute actions.",
        "Do not request shell commands.",
        "Do not claim that an action was executed.",
        "Return concise, useful reasoning for PULSE.",
        `Task: ${task}`,
      ].join("\n");

      const finalPrompt =
        `${systemInstruction}\n\nUser/context request:\n${prompt}`;

      const result = await runOpenClaw(model, finalPrompt);

      if (!result.ok) {
        res.status(502).json(result);
        return;
      }

      res.json(result);
    } catch {
      res.status(500).json({
        ok: false,
        provider: "openclaw",
        error: "Internal OpenClaw bridge error",
      });
    } finally {
      inferBusy = false;
    }
  });
}
