import path from 'path';
import fs from 'fs/promises';

export function up(state) {
    const parent = path.dirname(state.cwd);
    if (parent !== state.cwd) {
        state.cwd = parent;
    }
}

export async function cd(state, target) {
    const newPath = path.isAbsolute(target) ? target : path.resolve(state.cwd, target);

    try {
        const stat = await fs.stat(newPath);
        if (!stat.isDirectory()) throw new Error();
        state.cwd = newPath;
    } catch {
        throw new Error('Operation failed');
    }
}

export async function ls(state) {
    try {
        const entries = await fs.readdir(state.cwd, { withFileTypes: true });

        const folders = [];
        const files = [];

        for (const entry of entries) {
            if (entry.isDirectory()) folders.push(entry.name);
            else files.push(entry.name);
        }

        folders.sort();
        files.sort();

        for (const folder of folders) console.log(`${folder}    [folder]`);
        for (const file of files) console.log(`${file}    [file]`);
    } catch {
        throw new Error('Operation failed');
    }
}