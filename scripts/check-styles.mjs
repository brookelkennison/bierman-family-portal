// Fails if a component hard-codes a color or a pixel size instead of using
// the theme in app/globals.css. Runs in `pnpm check`, so CI enforces it.
//
// Caught:   text-[#004c97], bg-[rgb(...)], p-[13px], style={{ color: "#fff" }}
// Allowed:  theme classes (text-navy, p-4), and arbitrary values that aren't
//           a color or a px size, like w-[calc(100%-2rem)].
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = ["app", "components"];
const rules = [
  { name: "hex color", pattern: /#[0-9a-fA-F]{3,8}\b/g },
  { name: "rgb/hsl color", pattern: /\b(?:rgba?|hsla?)\(/g },
  { name: "arbitrary px value", pattern: /-\[[^\]]*\d+px[^\]]*\]/g },
];

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.(tsx|ts)$/.test(name) ? [path] : [];
  });
}

const problems = [];
for (const file of roots.flatMap(files)) {
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      // Skip comments and in-page anchors like href="#main".
      if (/^\s*(\/\/|\*)/.test(line)) return;
      const code = line.replace(/href="#[\w-]*"/g, "");
      for (const { name, pattern } of rules) {
        for (const match of code.matchAll(pattern)) {
          problems.push(`${file}:${i + 1}  ${name}: ${match[0]}`);
        }
      }
    });
}

if (problems.length > 0) {
  console.error("Use theme tokens from app/globals.css instead:\n");
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("Styles: no hard-coded colors or pixel sizes.");
