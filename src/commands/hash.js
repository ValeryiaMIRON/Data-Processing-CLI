import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { pipeline } from 'stream/promises';
import { resolvePath } from '../utils/pathResolver.js';

const SUPPORTED = ['sha256', 'md5', 'sha512'];

export async function hash(cwd, args) {
    try {
        const input = args['--input'];
        const algorithm = args['--algorithm'] || 'sha256';
        const save = args['--save'];

        if (!input) {
            console.log('Invalid input');
            return;
        }

        if (!SUPPORTED.includes(algorithm)) {
            console.log('Operation failed');
            return;
        }

        const inputPath = resolvePath(cwd, input);

        const hash = crypto.createHash(algorithm);

        const readStream = fs.createReadStream(inputPath);

        await pipeline(
            readStream,
            async function (source) {
                for await (const chunk of source) {
                    hash.update(chunk);
                }
            }
        );

        const digest = hash.digest('hex');

        console.log(`${algorithm}: ${digest}`);

        if (save) {
            const outputPath = `${inputPath}.${algorithm}`;
            await fs.promises.writeFile(outputPath, digest);
        }

    } catch {
        console.log('Operation failed');
    }
}