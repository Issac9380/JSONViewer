// Strip ELECTRON_RUN_AS_NODE inherited from VS Code's integrated terminal.
// VS Code is an Electron app and sets this internally; it leaks to child processes.
delete process.env.ELECTRON_RUN_AS_NODE;

const path = require('path');
const { spawn } = require('child_process');

// Spawn electron-vite CLI via node directly — avoids .cmd/shell issues on Windows.
const cli = path.join(__dirname, '..', 'node_modules', 'electron-vite', 'bin', 'electron-vite.js');
const child = spawn(process.execPath, [cli, 'dev'], {
  stdio: 'inherit',
  env: process.env
});
child.on('exit', code => process.exit(code));
