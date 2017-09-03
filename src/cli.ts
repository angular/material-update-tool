import {option, help, argv} from 'yargs';
import {red, green, yellow} from 'chalk';
import {statSync, existsSync} from 'fs';
import {join} from 'path';
import {spawnSync} from 'child_process';
import {EXTRA_STYLESHEETS_GLOB_KEY} from './rules/switchStylesheetsRule';

// This import lacks of type definitions.
const resolveBin = require('resolve-bin').sync;

// Register a help page in yargs.
help();

// Register the project option in yargs.
option('project', {
  alias: 'p',
  describe: 'Path to the tsconfig.json file of the project',
  string: true,
  required: true
});

option('extra-stylesheets', {
  alias: ['es', 'extra-css'],
  describe: 'Glob that matches additional stylesheets that should be migrated',
  string: true,
  array: true,
  required: false
});

/** Path to the TypeScript project. */
let projectPath: string = argv.project;

// Exit the process if the specified project does not exist.
if (!existsSync(projectPath)) {
  console.error(red('Specified project path is not valid. File or directory does not exist!'));
  process.exit(1);
}

// If the project path links to a directory, automatically reference the "tsconfig.json" file.
if (statSync(projectPath).isDirectory()) {
  projectPath = `${projectPath}/tsconfig.json`;
}

if (projectPath) {
  const tslintBin = resolveBin('tslint');
  const migrationConfig = join(__dirname, 'rules', 'tslint-migration.json');

  // Command line arguments for dispatching the TSLint executable.
  const tslintArgs = ['-c', migrationConfig, '-p', projectPath, '--fix'];
  const childProcessEnv = { ...process.env };

  if (argv.extraStylesheets) {
    // Since TSLint runs in another node process and we want to apply the fixes for extra
    // stylesheets through TSLint we need to transfer the glob of stylesheets to the child
    // process.
    childProcessEnv[EXTRA_STYLESHEETS_GLOB_KEY] = argv.extraStylesheets.join(' ');
  }

  // Run the TSLint CLI with the configuration file from the migration tool.
  const output = spawnSync('node', [tslintBin, ...tslintArgs], {env: childProcessEnv});

  if (output.status !== 0 || output.stderr.toString().trim()) {
    console.error();
    console.error(output.output.join('\n').trim());
    console.error();
    console.error(red('Errors occurred while migrating the Angular Material project.'));
  } else {
    console.info();
    console.info(output.stdout.toString().trim());
    console.info();
    console.info(green('Successfully updated the project source files.'))
  }
}
