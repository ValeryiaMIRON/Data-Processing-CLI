import path from 'path';
import fs from 'fs';

export function resolvePath(cwd, inputPath) {
  if (!inputPath) return null;
  const fullPath = path.isAbsolute(inputPath)
    ? inputPath
    : path.resolve(cwd, inputPath);

  console.log('Trying path:', fullPath);

  try {
    fs.accessSync(fullPath);
    return fullPath;
  } catch {
    return null;
  }
}