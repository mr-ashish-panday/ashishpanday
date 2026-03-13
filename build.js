// Build script for Vercel deployment
// Copies static site to output/ and builds 3D React app to output/3d/
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'output');

// Clean and create output directory
if (fs.existsSync(OUTPUT_DIR)) {
  fs.rmSync(OUTPUT_DIR, { recursive: true });
}
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Copy static site files to output root
const staticFiles = ['index.html', 'style.css', 'script.js', 'favicon.png'];
staticFiles.forEach(file => {
  const src = path.join(__dirname, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(OUTPUT_DIR, file));
    console.log(`Copied ${file}`);
  }
});

// Update the 3D toggle link in the output index.html to point to /3d/
const indexPath = path.join(OUTPUT_DIR, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');
indexContent = indexContent.replace('href="/3d/"', 'href="/3d/"'); // already correct
fs.writeFileSync(indexPath, indexContent);

// Build the 3D React app
console.log('Building 3D site...');
execSync('npm install && npm run build', {
  cwd: path.join(__dirname, '3d'),
  stdio: 'inherit'
});

// Copy 3D build output to output/3d/
const dist3d = path.join(__dirname, '3d', 'dist');
const out3d = path.join(OUTPUT_DIR, '3d');
fs.mkdirSync(out3d, { recursive: true });

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

copyDir(dist3d, out3d);
console.log('Copied 3D build to output/3d/');

console.log('Build complete!');
