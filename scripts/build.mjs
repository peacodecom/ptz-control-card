import { readFile, mkdir, writeFile } from "node:fs/promises";
import { build } from "esbuild";

const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url)));
const license = await readFile(new URL("../LICENSE", import.meta.url), "utf8");
const tag = process.env.RELEASE_TAG;
if (tag && tag !== `v${pkg.version}`) {
  throw new Error(`Release tag ${tag} does not match v${pkg.version}`);
}
await mkdir("dist", { recursive: true });
await build({
  entryPoints: ["src/ptz-control-card.js"],
  outfile: "dist/ptz-control-card.js",
  bundle: true,
  format: "iife",
  target: ["es2022"],
  minify: true,
  banner: { js: `/*! PTZ Control Card v${pkg.version}\nPublished by peacode — https://peacode.com\n\n${license}*/` },
});
await writeFile("dist/LICENSE", license);
console.log(`Built PTZ Control Card v${pkg.version}`);
