import readline from 'readline';
import { up, cd, ls } from './navigation.js';

export function startRepl(state) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
  });

  rl.prompt();

  rl.on('line', async (line) => {
  const input = line.trim();

  if (input === '.exit') {
    exit(rl);
    return;
  }

  const [command, arg] = input.split(' ');

  try {
    switch (command) {
      case 'up':
        up(state);
        break;

      case 'cd':
        if (!arg) throw new Error();
        await cd(state, arg);
        break;

      case 'ls':
        await ls(state);
        break;

      default:
        console.log('Invalid input');
        rl.prompt();
        return;
    }

    console.log(`You are currently in ${state.cwd}`);
  } catch {
    console.log('Operation failed');
  }

  rl.prompt();
});

  rl.on('SIGINT', () => {
    exit(rl);
  });
}

function exit(rl) {
  console.log('Thank you for using Data Processing CLI!');
  rl.close();
  process.exit(0);
}