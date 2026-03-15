import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { pipeline } from 'stream/promises';
import { resolvePath } from '../utils/pathResolver.js';

export async function encrypt(cwd, args) {
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

        const salt = crypto.randomBytes(16);
        const iv = crypto.randomBytes(12);
        const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');

        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
        const readStream = fs.createReadStream(inputPath);
        const writeStream = fs.createWriteStream(outputPath);

        // Записываем header вручную
        writeStream.write(salt);
        writeStream.write(iv);

        // Шифруем поток
        await pipeline(readStream, cipher, writeStream);

        // Добавляем authTag после завершения pipeline
        const authTag = cipher.getAuthTag();
        await fs.promises.appendFile(outputPath, authTag);

        console.log('File encrypted successfully');

    } catch (err) {
        console.log('Operation failed:', err.message);
    }
}