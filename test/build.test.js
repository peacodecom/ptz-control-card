import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { Window } from "happy-dom";

test("release build has license, metadata and a usable standalone custom element", () => {
  const result = spawnSync(process.execPath, ["scripts/build.mjs"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const source = readFileSync("dist/ptz-control-card.js", "utf8");
  const license = readFileSync("LICENSE", "utf8");
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  const hacs = JSON.parse(readFileSync("hacs.json", "utf8"));
  assert.ok(source.includes(license));
  assert.ok(source.includes(`PTZ Control Card v${pkg.version}`));
  assert.ok(source.includes("Published by peacode"));
  assert.equal(hacs.filename, "ptz-control-card.js");
  const window = new Window();
  window.eval(source);
  assert.ok(window.customElements.get("ptz-control-card"));
  const card = window.document.createElement("ptz-control-card");
  card.setConfig({ ptz_up: "button.up", ptz_down: "button.down", ptz_left: "button.left", ptz_right: "button.right", ptz_stop: "button.stop" });
  window.document.body.append(card);
  assert.equal(card.shadowRoot.querySelectorAll(".dir-btn").length, 4);
  window.eval(source);
  assert.equal(window.customCards.length, 1);
  window.close();
});

test("release build rejects a mismatched tag", () => {
  const result = spawnSync(process.execPath, ["scripts/build.mjs"], { encoding: "utf8", env: { ...process.env, RELEASE_TAG: "v999.0.0" } });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /does not match/);
});
