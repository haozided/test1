const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { downloadArtifact } = require("@electron/get");

const rootDir = path.resolve(__dirname, "..");
const electronDir = path.join(rootDir, "node_modules", "electron");
const electronPackage = path.join(electronDir, "package.json");
const cacheDir = path.join(rootDir, ".electron-cache");
const distDir = path.join(electronDir, "dist");
const pathFile = path.join(electronDir, "path.txt");
const mirror = process.env.ELECTRON_MIRROR || "https://npmmirror.com/mirrors/electron/";

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  if (!fs.existsSync(electronPackage)) {
    console.warn("[electron] node_modules/electron/package.json was not found; skipping repair.");
    return;
  }

  const { version } = require(electronPackage);
  const platform = process.env.npm_config_platform || os.platform();
  const arch = process.env.npm_config_arch || os.arch();
  const platformPath = getPlatformPath(platform);
  const electronExecutable = path.join(distDir, platformPath);

  fs.mkdirSync(cacheDir, { recursive: true });

  console.log(`[electron] Version: ${version}`);
  console.log(`[electron] Target: ${platform}-${arch}`);
  console.log(`[electron] Using mirror: ${mirror}`);
  console.log(`[electron] Using cache: ${cacheDir}`);

  if (isElectronInstalled(electronExecutable, platformPath)) {
    console.log("[electron] Electron binary is already ready.");
    return;
  }

  cleanPartialInstall();

  const zipPath = await downloadArtifact({
    version,
    artifactName: "electron",
    platform,
    arch,
    cacheRoot: cacheDir,
    mirrorOptions: {
      mirror
    },
    checksums: require(path.join(electronDir, "checksums.json"))
  });

  console.log(`[electron] Extracting ${zipPath}`);
  extractZip(zipPath, distDir);

  const typeDefinition = path.join(distDir, "electron.d.ts");
  if (fs.existsSync(typeDefinition)) {
    fs.renameSync(typeDefinition, path.join(electronDir, "electron.d.ts"));
  }

  fs.writeFileSync(pathFile, platformPath);

  if (!isElectronInstalled(electronExecutable, platformPath)) {
    throw new Error("[electron] Electron repair finished, but the binary or path.txt is still missing.");
  }

  console.log("[electron] Electron binary is ready.");
}

function cleanPartialInstall() {
  fs.rmSync(distDir, { recursive: true, force: true });
  fs.rmSync(pathFile, { force: true });
  fs.mkdirSync(distDir, { recursive: true });
}

function extractZip(zipPath, destination) {
  const result = spawnSync("tar", ["-xf", zipPath, "-C", destination], {
    cwd: rootDir,
    stdio: "inherit"
  });

  if (result.status !== 0) {
    throw new Error("[electron] Failed to extract Electron zip with tar.");
  }
}

function isElectronInstalled(executablePath, expectedPlatformPath) {
  if (!fs.existsSync(executablePath) || !fs.existsSync(pathFile)) {
    return false;
  }

  return fs.readFileSync(pathFile, "utf8") === expectedPlatformPath;
}

function getPlatformPath(platform) {
  switch (platform) {
    case "mas":
    case "darwin":
      return "Electron.app/Contents/MacOS/Electron";
    case "freebsd":
    case "openbsd":
    case "linux":
      return "electron";
    case "win32":
      return "electron.exe";
    default:
      throw new Error(`Electron builds are not available on platform: ${platform}`);
  }
}
