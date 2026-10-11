const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceDir = path.resolve(__dirname, '..');
const tempDir = path.resolve(__dirname, '../../MediFlow-Web-Clean');
const zipPath = path.resolve(__dirname, '../../MediFlow-Web-Submission.zip');

console.log('Staging clean project files...');
if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

fs.mkdirSync(tempDir, { recursive: true });

function copyFiltered(src, dst) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    const base = path.basename(src);
    if (base === 'node_modules' || base === '.git' || base === 'dist' || base === '.system_generated' || base === 'scripts') {
      return;
    }
    fs.mkdirSync(dst, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyFiltered(path.join(src, child), path.join(dst, child));
    }
  } else {
    const base = path.basename(src);
    // Explicitly exclude .env and temporary logs
    if (base === '.env' || base.endsWith('.log') || base.endsWith('.tmp')) {
      return;
    }
    fs.copyFileSync(src, dst);
  }
}

copyFiltered(sourceDir, tempDir);

// Double check .env does not exist
if (fs.existsSync(path.join(tempDir, '.env'))) {
  throw new Error('SECURITY VIOLATION: .env detected in staging directory!');
}

console.log('Building ZIP archive with PowerShell Compress-Archive...');
const psCommand = `Compress-Archive -Path '${tempDir}\\*' -DestinationPath '${zipPath}' -Force`;
execSync(`powershell -NoProfile -Command "${psCommand}"`, { stdio: 'inherit' });


console.log('Removing staging directory...');
fs.rmSync(tempDir, { recursive: true, force: true });

const zipStats = fs.statSync(zipPath);
console.log('========================================================');
console.log('📦 CLEAN PORTABLE ZIP PACKAGE CREATED SUCCESSFULLY!');
console.log(`   Path: ${zipPath}`);
console.log(`   Size: ${(zipStats.size / (1024 * 1024)).toFixed(2)} MB`);
console.log('========================================================');
