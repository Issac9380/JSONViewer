// Strip ELECTRON_RUN_AS_NODE inherited from VS Code's integrated terminal.
// VS Code is an Electron app and sets this internally; it leaks to child processes.
delete process.env.ELECTRON_RUN_AS_NODE;

const { spawn } = require('child_process');
const child = spawn('npx', ['electron-vite', 'dev'], { stdio: 'inherit' });
child.on('exit', code => process.exit(code));
