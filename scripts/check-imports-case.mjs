import fs from "node:fs";
import path from "node:path";

const roots = ["src", "."]; // önce src, yoksa kök
const exts = [".ts", ".tsx", ".js", ".jsx"];

function listFiles(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name === ".next" || ent.name === ".git") continue;
      out.push(...listFiles(p));
    } else if (exts.includes(path.extname(ent.name))) {
      out.push(p);
    }
  }
  return out;
}

function existsExact(p) {
  const parts = p.split(path.sep);
  let cur = parts[0] === "" ? path.sep : "";
  for (const part of parts) {
    if (!part) continue;
    const dir = cur || ".";
    if (!fs.existsSync(dir)) return false;
    const entries = fs.readdirSync(dir);
    const hit = entries.find((e) => e === part);
    if (!hit) return false;
    cur = path.join(dir, hit);
  }
  return true;
}

function tryResolve(aliasPath) {
  // "@/x/y" => "x/y"
  const rel = aliasPath.replace(/^@\//, "");
  for (const r of roots) {
    for (const ext of ["", ...exts]) {
      const p1 = path.join(r, rel + ext);
      const p2 = path.join(r, rel, "index" + ext);
      if (existsExact(p1) || existsExact(p2)) return null;
    }
  }
  return rel;
}

const files = listFiles(process.cwd());
let bad = 0;

const re = /from\s+["'](@\/[^"']+)["']|require\(\s*["'](@\/[^"']+)["']\s*\)/g;

for (const f of files) {
  const txt = fs.readFileSync(f, "utf8");
  let m;
  while ((m = re.exec(txt))) {
    const imp = m[1] || m[2];
    const miss = tryResolve(imp);
    if (miss) {
      bad++;
      console.log(`❌ ${f}  ->  ${imp}  (not found exact)`);
    }
  }
}

if (bad) {
  console.log(`\nFound ${bad} missing/case-mismatched imports.\n`);
  process.exit(1);
} else {
  console.log("✅ All @/ imports resolve with exact casing.");
}
