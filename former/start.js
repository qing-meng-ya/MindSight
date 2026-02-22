const { spawn } = require('child_process');
const path = require('path');

const port = process.env.PORT || 3000;

const server = spawn('npx', ['react-scripts', 'start'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT: port,
    SKIP_PREFLIGHT_CHECK: 'true',
    BROWSER: 'none',
    FAST_REFRESH: 'true',
    TSC_COMPILE_ON_ERROR: 'true',
    ESLINT_NO_DEV_ERRORS: 'true',
    DANGEROUSLY_DISABLE_HOST_CHECK: 'true'
  }
});

server.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
});