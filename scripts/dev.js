// Strip ELECTRON_RUN_AS_NODE inherited from VS Code's integrated terminal.
// VS Code is an Electron app and sets this internally; it leaks to child processes.
delete process.env.ELECTRON_RUN_AS_NODE;

const path = require('path');
const { spawn } = require('child_process');

// Use electron-vite CLI directly — npx/.cmd won't resolve in spawn on Windows.
const cli = path.join(__dirname, '..', 'node_modules', '.bin', 'electron-vite');
const child = spawn(process.platform === 'win32' ? cli + '.cmd' : cli, ['dev'], {
  stdio: 'inherit',
  env: process.env
});
child.on('exit', code => process.exit(code));
