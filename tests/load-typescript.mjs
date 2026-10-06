import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// Compile local pure modules with the already-installed compiler; no test dependency.
const cache = new Map();
export function loadTypeScript(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  const exports = {};
  cache.set(file, exports);
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  new Function("exports", "require", code)(exports, id => {
    if (!id.startsWith(".")) throw new Error(`Unexpected nonlocal test import: ${id}`);
    return loadTypeScript(path.resolve(path.dirname(file), `${id}.ts`));
  });
  return exports;
}
