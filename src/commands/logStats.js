import fs from 'fs';
import path from 'path';
import os from 'os';
import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { resolvePath } from '../utils/pathResolver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function logStats(cwd, args) {
    try {
        const input = args['--input'];
        const output = args['--output'];

        if (!input || !output) {
            console.log('Invalid input');
            return;
        }

        const inputPath = resolvePath(cwd, input);
        const outputPath = path.isAbsolute(output) ? output : path.resolve(cwd, output);

        if (!inputPath) {
            console.log('Operation failed');
            return;
        }

        const data = fs.readFileSync(inputPath, 'utf-8');
        const lines = data.split('\n');

        const numWorkers = os.cpus().length;
        const chunkSize = Math.ceil(lines.length / numWorkers);

        const promises = [];

        for (let i = 0; i < numWorkers; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, lines.length);
            const chunkLines = lines.slice(start, end);

            promises.push(new Promise((resolve, reject) => {
                const worker = new Worker(path.resolve(__dirname, '../workers/logWorker.mjs'));
                worker.on('message', resolve);
                worker.on('error', reject);
                worker.postMessage(chunkLines);
            }));
        }

        const partialStats = await Promise.all(promises);

        const finalStats = {
            total: 0,
            levels: {},
            status: {},
            paths: {},
            responseTimeSum: 0
        };

        for (const ps of partialStats) {
            finalStats.total += ps.total;
            finalStats.responseTimeSum += ps.responseTimeSum;

            for (const [level, count] of Object.entries(ps.levels)) {
                finalStats.levels[level] = (finalStats.levels[level] || 0) + count;
            }

            for (const [status, count] of Object.entries(ps.status)) {
                finalStats.status[status] = (finalStats.status[status] || 0) + count;
            }

            for (const [pathKey, count] of Object.entries(ps.paths)) {
                finalStats.paths[pathKey] = (finalStats.paths[pathKey] || 0) + count;
            }
        }

        const topPaths = Object.entries(finalStats.paths)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([p, count]) => ({ path: p, count }));

        const result = {
            total: finalStats.total,
            levels: finalStats.levels,
            status: finalStats.status,
            topPaths,
            avgResponseTimeMs: finalStats.total ? finalStats.responseTimeSum / finalStats.total : 0
        };

        fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

        console.log('Log stats computed successfully');

    } catch (err) {
        console.log('Operation failed:', err.message);
    }
}