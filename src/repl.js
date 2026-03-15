import readline from 'readline';
import { up, cd, ls } from './navigation.js';
import { count } from './commands/count.js';
import { csvToJson } from './commands/csvToJson.js';
import { jsonToCsv } from './commands/jsonToCsv.js';

function parseArgs(args) {
    const parsed = {};
    for (let i = 0; i < args.length; i += 2) {
        if (args[i] && args[i].startsWith('--') && args[i + 1]) {
            parsed[args[i]] = args[i + 1];
        }
    }
    return parsed;
}

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

        const [command, ...args] = input.split(' ');

        try {
            switch (command) {
                case 'up':
                    up(state);
                    break;

                case 'cd':
                    if (!args[0]) {
                        console.log('Invalid input');
                        rl.prompt();
                        return;
                    }
                    await cd(state, args[0]);
                    break;

                case 'ls':
                    await ls(state);
                    break;

                // case 'count':
                //     if (!args.includes('--input')) {
                //         console.log('Invalid input');
                //         rl.prompt();
                //         return;
                //     }
                //     await count(state.cwd, args);
                //     break;
                case 'count':
                    const inputIndex = args.indexOf('--input');
                    if (inputIndex === -1 || !args[inputIndex + 1]) {
                        console.log('Invalid input');
                        rl.prompt();
                        return;
                    }

                    const inputFile = args[inputIndex + 1];
                    await count(state.cwd, { input: inputFile }); // <-- передаём объект с input
                    break;

                case 'csv-to-json':
                    const csvArgs = parseArgs(args);
                    if (!csvArgs['--input'] || !csvArgs['--output']) {
                        console.log('Invalid input');
                        rl.prompt();
                        return;
                    }
                    await csvToJson(state.cwd, csvArgs);
                    break;

                case 'json-to-csv':
                    const jsonArgs = parseArgs(args);
                    if (!jsonArgs['--input'] || !jsonArgs['--output']) {
                        console.log('Invalid input');
                        rl.prompt();
                        return;
                    }
                    await jsonToCsv(state.cwd, jsonArgs);
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