import readline from 'readline';

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

    console.log('Invalid input');

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