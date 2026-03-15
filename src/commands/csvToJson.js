import fs from 'fs';
import path from 'path';
import { Transform } from 'stream';
import { pipeline } from 'stream/promises';
import { resolvePath } from '../utils/pathResolver.js';

export async function csvToJson(cwd, args) {
    const inputPath = resolvePath(cwd, args['--input']);
    const outputPath = path.isAbsolute(args['--output'])
        ? args['--output']
        : path.resolve(cwd, args['--output']);

    if (!inputPath) {
        console.log('Invalid input');
        return;
    }

    try {
        const readStream = fs.createReadStream(inputPath, { encoding: 'utf-8' });
        const writeStream = fs.createWriteStream(outputPath, { encoding: 'utf-8' });

        let headers = null;
        let firstChunk = true;
        let isFirstObject = true;

        const transformStream = new Transform({
            transform(chunk, encoding, callback) {
                const lines = chunk.toString().split(/\r?\n/);
                let jsonOutput = '';

                for (const line of lines) {
                    if (!line.trim()) continue;

                    if (!headers) {
                        headers = line.split(',');
                        continue;
                    }

                    const values = line.split(',');
                    const obj = headers.reduce((acc, key, i) => {
                        acc[key] = values[i] || '';
                        return acc;
                    }, {});

                    if (firstChunk) {
                        jsonOutput += '[';
                        firstChunk = false;
                    }

                    if (!isFirstObject) jsonOutput += ',';
                    jsonOutput += JSON.stringify(obj);
                    isFirstObject = false;
                }

                callback(null, jsonOutput);
            },
            flush(callback) {
                callback(null, ']');
            }
        });

        await pipeline(readStream, transformStream, writeStream);

        console.log('CSV successfully converted to JSON');
    } catch {
        console.log('Operation failed');
    }
}