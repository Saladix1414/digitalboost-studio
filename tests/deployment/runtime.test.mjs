import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import test from "node:test";

const root = fileURLToPath(new URL("../../", import.meta.url));
const loader = import.meta.resolve("tsx");
function launch(port, cwd = root) {
  const child = spawn(process.execPath, ["--import", loader, resolve(root, "server.ts")], {
    cwd,
    env: {
      ...process.env, NODE_ENV: "production", PORT: String(port), GEMINI_API_KEY: "",
      DIGITALBOOST_INFRA_DATABASE_PROVIDER: "disabled",
      DIGITALBOOST_INFRA_CACHE_PROVIDER: "disabled",
      DIGITALBOOST_INFRA_OBJECT_STORAGE_PROVIDER: "disabled",
      DIGITALBOOST_INFRA_QUEUE_PROVIDER: "disabled",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", data => { output += data; });
  child.stderr.on("data", data => { output += data; });
  const exited = once(child, "exit");
  return { child, exited, output: () => output };
}
async function freePort() {
  const socket = createServer();
  socket.listen(0, "127.0.0.1");
  await once(socket, "listening");
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  return port;
}
async function stop(run) {
  if (run.child.exitCode !== null || run.child.signalCode !== null) return;
  run.child.kill("SIGTERM");
  await Promise.race([run.exited, delay(12000)]);
  if (run.child.exitCode === null && run.child.signalCode === null) {
    run.child.kill("SIGKILL");
    await run.exited;
    assert.fail("Server failed to stop: " + run.output());
  }
}
async function waitForHttp(run, base) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (run.child.exitCode !== null) assert.fail(run.output());
    try {
      const response = await fetch(base + "/api/health/live", { signal: AbortSignal.timeout(400) });
      if (response.ok) { await response.text(); return; }
    } catch {}
    await delay(100);
  }
  assert.fail("HTTP startup timed out: " + run.output());
}

test("production serves SPA, assets, health and API errors on a custom port", { timeout: 25000 }, async t => {
  const port = await freePort();
  assert.notEqual(port, 3000);
  const run = launch(port);
  t.after(() => stop(run));
  const base = "http://127.0.0.1:" + port;
  await waitForHttp(run, base);

  const live = await fetch(base + "/api/health/live");
  assert.equal(live.status, 200);
  assert.equal(live.headers.get("cache-control"), "no-store");
  assert.deepEqual(await live.json(), { status: "alive" });

  for (const path of ["/api/health/ready", "/api/health/infrastructure"]) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200);
    const health = await response.json();
    assert.equal(health.database, "disabled");
    assert.equal(health.authoritative, false);
  }
  const home = await fetch(base + "/");
  assert.equal(home.status, 200);
  const html = await home.text();
  assert.match(html, /<html/i);
  const deep = await fetch(base + "/studio/websites");
  assert.equal(await deep.text(), html);
  const asset = html.match(/src="([^"]+\.js)"/)?.[1];
  assert.ok(asset, "Built JS entry exists");
  const script = await fetch(new URL(asset, base));
  assert.equal(script.status, 200);
  assert.doesNotMatch(script.headers.get("content-type") || "", /html/);
  await script.arrayBuffer();

  for (const method of ["GET", "POST"]) {
    const response = await fetch(base + "/api/not-a-real-route", { method });
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: "api_not_found" });
  }
  for (const path of ["/assets/missing.js", "/missing.png"]) {
    const response = await fetch(base + path);
    assert.equal(response.status, 404);
    assert.notEqual(await response.text(), html);
  }

  // Long-lived Commerce streams must not prevent graceful shutdown.
  const stream = await fetch(base + "/api/commerce/sync");
  assert.equal(stream.status, 200);
  const reader = stream.body.getReader();
  await reader.read();
  run.child.kill("SIGTERM");
  const [code, signal] = await run.exited;
  assert.equal(code, 0, run.output());
  assert.equal(signal, null);
  await reader.cancel();
});

test("invalid PORT fails before listening", { timeout: 10000 }, async t => {
  const run = launch("not-a-port");
  t.after(() => stop(run));
  const [code] = await run.exited;
  assert.equal(code, 1);
  assert.match(run.output(), /PORT must be an integer/);
});

test("missing frontend build fails explicitly", { timeout: 10000 }, async t => {
  const cwd = await mkdtemp(join(tmpdir(), "digitalboost-no-build-"));
  t.after(() => rm(cwd, { recursive: true, force: true }));
  const run = launch(3000, cwd);
  t.after(() => stop(run));
  const [code] = await run.exited;
  assert.equal(code, 1);
  assert.match(run.output(), /Missing dist\/index.html/);
});
