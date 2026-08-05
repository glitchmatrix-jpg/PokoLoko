import { spawn } from 'node:child_process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const electron = process.platform === 'win32' ? 'node_modules/.bin/electron.cmd' : 'node_modules/.bin/electron';
let electronProcess;
const vite = spawn(npm, ['exec', 'vite', '--', '--host', '127.0.0.1'], { stdio: 'inherit', env: process.env });
const compiler = spawn(npm, ['exec', 'tsc', '--', '-p', 'tsconfig.electron.json', '--watch', '--preserveWatchOutput'], { stdio: 'inherit', env: process.env });

function launchElectron() {
  electronProcess?.kill();
  electronProcess = spawn(electron, ['.'], { stdio: 'inherit', env: { ...process.env, VITE_DEV_SERVER_URL: 'http://127.0.0.1:5173/' } });
}
setTimeout(launchElectron, 2500);
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { vite.kill(); compiler.kill(); electronProcess?.kill(); process.exit(0); });
