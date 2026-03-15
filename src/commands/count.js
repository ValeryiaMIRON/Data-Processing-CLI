import fs from 'fs';
import { resolvePath } from '../utils/pathResolver.js';

export async function count(cwd, args) {
    const inputPath = args.input;
    if (!inputPath) {
        console.log('Invalid input');
        return;
    }

    const fullPath = await resolvePath(cwd, inputPath);
    if (!fullPath) {
        console.log('Operation failed');
        return;
    }

    let lines = 0;
    let words = 0;
    let chars = 0;

    const readable = fs.createReadStream(fullPath, 'utf8');

    readable.on('data', chunk => {
        lines += chunk.split('\n').length - 1;
        words += chunk.split(/\s+/).filter(Boolean).length;
        chars += chunk.length;
    });

    return new Promise((resolve, reject) => {
        readable.on('end', () => {
            console.log(`Lines: ${lines}`);
            console.log(`Words: ${words}`);
            console.log(`Characters: ${chars}`);
            resolve();
        });
        readable.on('error', () => {
            console.log('Operation failed');
            reject();
        });
    });
}