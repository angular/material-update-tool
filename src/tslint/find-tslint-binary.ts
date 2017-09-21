import {resolve} from 'path';
import {existsSync} from 'fs';

// This import lacks of type definitions.
const resolveBin = require('resolve-bin').sync;

/** Finds the path to the TSLint CLI binary. */
export function findTslintBinaryPath() {
  const defaultPath = resolve(__dirname, '..', 'node_modules', 'tslint', 'bin', 'tslint');
  const resolvedPath = resolveBin('tslint', 'tslint');

  if (existsSync(defaultPath)) {
    return defaultPath;
  } else {
    return resolvedPath;
  }
}