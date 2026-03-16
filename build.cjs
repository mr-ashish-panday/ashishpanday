// Build script for Vercel deployment
// Builds the 3D React app and outputs it as the main site.
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const OUTPUT_DIR = path.join(__dirname, "output");

if (fs.existsSync(OUTPUT_DIR)) {
  fs.rmSync(OUTPUT_DIR, { recursive: true });
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

console.log("Building 3D site...");
execSync("npm install && npm run build", {
  cwd: path.join(__dirname, "3d"),
  stdio: "inherit",
});

const dist3d = path.join(__dirname, "3d", "dist");

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(dist3d, OUTPUT_DIR);
console.log("Build complete!");
