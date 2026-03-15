import os from 'os';
import { startRepl } from './repl.js';

console.log('Welcome to Data Processing CLI!');

const state = {
  cwd: os.homedir()
};

console.log(`You are currently in ${state.cwd}`);

startRepl(state);