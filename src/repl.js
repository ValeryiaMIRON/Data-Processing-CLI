import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { up, cd, ls } from './navigation.js';
import { count } from './commands/count.js';
import { csvToJson } from './commands/csvToJson.js';
import { jsonToCsv } from './commands/jsonToCsv.js';
import { hash } from './commands/hash.js';
import { hashCompare } from './commands/hashCompare.js';
import { encrypt } from './commands/encrypt.js';
import { decrypt } from './commands/decrypt.js';

function parseArgs(args) {
    const parsed = {};

    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            if (args[i + 1] && !args[i + 1].startsWith('--')) {
                parsed[args[i]] = args[i + 1];
                i++;
            } else {
                parsed[args[i]] = true;
            }
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
                case 'count':
                    const inputIndex = args.indexOf('--input');
                    if (inputIndex === -1 || !args[inputIndex + 1]) {
                        console.log('Invalid input');
                        rl.prompt();
                        return;
                    }

                    const inputFile = args[inputIndex + 1];
                    await count(state.cwd, { input: inputFile });
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
                case 'hash':
                    const hashArgs = parseArgs(args);
                    if (!hashArgs['--input']) {
                        console.log('Invalid input');
                        rl.prompt();
                        return;
                    }

                    await hash(state.cwd, hashArgs);
                    break;
                case 'hash-compare':
                    const compareArgs = parseArgs(args);
                    if (!compareArgs['--input'] || !compareArgs['--hash']) {
                        console.log('Invalid input');
                        rl.prompt();
                        return;
                    }
                    await hashCompare(state.cwd, compareArgs);
                    break;

                case 'encrypt':
                    const encryptArgs = parseArgs(args);
                    if (!encryptArgs['--input'] || !encryptArgs['--output'] || !encryptArgs['--password']) {
                        console.log('Invalid input');
                        rl.prompt();
                        return;
                    }
                    await encrypt(state.cwd, encryptArgs);
                    break;
                case 'decrypt':
                    const decryptArgs = parseArgs(args);
                    if (!decryptArgs['--input'] || !decryptArgs['--output'] || !decryptArgs['--password']) {
                        console.log('Invalid input');
                        rl.prompt();
                        return;
                    }
                    await decrypt(state.cwd, decryptArgs);
                    break;
                case 'diff':
                    if (args.length < 2) {
                        console.log('Invalid input');
                        rl.prompt();
                        return;
                    }
                    try {
                        const path1 = path.resolve(state.cwd, args[0]);
                        const path2 = path.resolve(state.cwd, args[1]);
                        const content1 = fs.readFileSync(path1, 'utf-8');
                        const content2 = fs.readFileSync(path2, 'utf-8');
                        console.log(content1 === content2 ? 'Files are identical' : 'Files differ');
                    } catch {
                        console.log('Operation failed');
                    }
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