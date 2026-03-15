import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { pipeline } from 'stream/promises';
import { resolvePath } from '../utils/pathResolver.js';

const SUPPORTED = ['sha256', 'md5', 'sha512'];

export async function hashCompare(cwd, args) {
    try {
        const input = args['--input'];
        const hashFile = args['--hash'];
        const algorithm = args['--algorithm'] || 'sha256';

        if (!input || !hashFile) {
            console.log('Invalid input');
            return;
        }

        if (!SUPPORTED.includes(algorithm)) {
            console.log('Operation failed');
            return;
        }

        const inputPath = resolvePath(cwd, input);
        const hashPath = resolvePath(cwd, hashFile);

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

        let expected = fs.readFileSync(hashPath, 'utf-8').trim();

        if (digest.toLowerCase() === expected.toLowerCase()) {
            console.log('OK');
        } else {
            console.log('MISMATCH');
        }

    } catch {
        console.log('Operation failed');
    }
}