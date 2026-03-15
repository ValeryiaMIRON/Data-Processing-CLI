import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { pipeline } from 'stream/promises';
import { resolvePath } from '../utils/pathResolver.js';

export async function decrypt(cwd, args) {
    try {
        const input = args['--input'];
        const output = args['--output'];
        const password = args['--password'];

        if (!input || !output || !password) {
            console.log('Invalid input');
            return;
        }

        const inputPath = resolvePath(cwd, input);
        const outputPath = path.isAbsolute(output) ? output : path.resolve(cwd, output);

        const stats = await fs.promises.stat(inputPath);
        if (stats.size < 44) {
            console.log('Operation failed');
            return;
        }

        const header = Buffer.alloc(28);
        const fd = await fs.promises.open(inputPath, 'r');
        await fd.read(header, 0, 28, 0);
        const salt = header.slice(0, 16);
        const iv = header.slice(16, 28);

        const authTag = Buffer.alloc(16);
        await fd.read(authTag, 0, 16, stats.size - 16);

        const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');

        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);

        const readStream = fs.createReadStream(inputPath, { start: 28, end: stats.size - 17 });
        const writeStream = fs.createWriteStream(outputPath);

        await pipeline(readStream, decipher, writeStream);

        console.log('File decrypted successfully');
        await fd.close();

    } catch (err) {
        console.log('Operation failed:', err.message);
    }
}