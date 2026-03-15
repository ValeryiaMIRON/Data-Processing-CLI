import fs from 'fs';
import path from 'path';
import { resolvePath } from '../utils/pathResolver.js';

export async function jsonToCsv(cwd, args) {
    const inputPath = resolvePath(cwd, args['--input']);
    const outputPath = path.isAbsolute(args['--output'])
        ? args['--output']
        : path.resolve(cwd, args['--output']);

    if (!inputPath) {
        console.log('Operation failed');
        return;
    }

    try {
        const data = await fs.promises.readFile(inputPath, 'utf-8');
        const jsonArray = JSON.parse(data);

        if (!Array.isArray(jsonArray) || jsonArray.length === 0) {
            throw new Error('Invalid JSON array');
        }

        const headers = Object.keys(jsonArray[0]);
        const csvLines = [headers.join(',')];

        for (const obj of jsonArray) {
            const row = headers.map(h => obj[h] || '').join(',');
            csvLines.push(row);
        }

        await fs.promises.writeFile(outputPath, csvLines.join('\n') + '\n');
        console.log('JSON successfully converted to CSV');
    } catch {
        console.log('Operation failed');
    }
}