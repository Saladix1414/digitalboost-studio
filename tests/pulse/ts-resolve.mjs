import { pathToFileURL, fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { resolve as pathResolve, dirname, extname } from "node:path";
export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("./") || specifier.startsWith("../")) {
    const parentPath = context.parentURL ? fileURLToPath(context.parentURL) : process.cwd() + "/";
    const base = dirname(parentPath);
    const raw = specifier;
    const candidates = extname(raw) ? [pathResolve(base, raw)] : [pathResolve(base, raw + ".ts"), pathResolve(base, raw + ".tsx"), pathResolve(base, raw + ".js")];
    for (const candidate of candidates) {
      if (existsSync(candidate)) return { url: pathToFileURL(candidate).href, shortCircuit: true };
    }
  }
  return nextResolve(specifier, context);
}
