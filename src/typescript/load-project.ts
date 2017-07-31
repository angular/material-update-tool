import * as ts from 'typescript';
import {dirname, resolve} from 'path';

/** Creates a TypeScript program instance from the specified tsconfig file. */
export function createProgramFromConfig(tsconfigPath: string): ts.Program {
  const parsed = parseProjectConfig(tsconfigPath);
  return ts.createProgram(parsed.fileNames, parsed.options);
}

/** Parses the specified TypeScript project configuration and overwrites options if specified. */
export function parseProjectConfig(project: string, extraOptions: ts.CompilerOptions = {}) {
  const config = ts.readConfigFile(project, ts.sys.readFile).config;
  const basePath = resolve(dirname(project));

  const host = {
    useCaseSensitiveFileNames: true,
    fileExists: ts.sys.fileExists,
    readDirectory: ts.sys.readDirectory,
    readFile: ts.sys.readFile
  };

  return ts.parseJsonConfigFileContent(config, host, basePath, extraOptions);
}
