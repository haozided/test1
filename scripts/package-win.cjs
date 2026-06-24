const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const builderCache = path.join(rootDir, ".electron-builder-cache");
const builderBin = path.join(
  rootDir,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "electron-builder.cmd" : "electron-builder"
);

fs.mkdirSync(builderCache, { recursive: true });

const result = spawnSync(builderBin, ["--win", "portable"], {
  cwd: rootDir,
  env: {
    ...process.env,
    ELECTRON_BUILDER_CACHE: builderCache
  },
  stdio: "inherit",
  shell: process.platform === "win32"
});

process.exit(result.status || 0);
