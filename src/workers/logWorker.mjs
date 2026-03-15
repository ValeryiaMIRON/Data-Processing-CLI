import { parentPort } from 'worker_threads';

parentPort.on('message', (chunkLines) => {
    const stats = {
        total: 0,
        levels: {},
        status: {},
        paths: {},
        responseTimeSum: 0
    };

    for (const line of chunkLines) {
        if (!line.trim()) continue;
        const [timestamp, level, service, statusCode, responseTime, method, path] = line.split(' ');
        stats.total++;
        stats.levels[level] = (stats.levels[level] || 0) + 1;

        const statusClass = statusCode[0] + 'xx';
        stats.status[statusClass] = (stats.status[statusClass] || 0) + 1;

        stats.paths[path] = (stats.paths[path] || 0) + 1;
        stats.responseTimeSum += Number(responseTime);
    }

    parentPort.postMessage(stats);
});