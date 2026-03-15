import path from 'path';
import { startRepl } from './repl.js';

console.log('Welcome to Data Processing CLI!');

const state = {
  cwd: path.resolve('./') // текущая директория, откуда запустила npm run start
};

console.log(`You are currently in ${state.cwd}`);

startRepl(state);