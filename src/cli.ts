#! /usr/bin/env node

import {red, yellow} from 'chalk';
import {spawn} from 'child_process';
import {existsSync, statSync} from 'fs';
import * as ora from 'ora';
import {resolve} from 'path';
import {argv, help, option} from 'yargs';
import {EXTRA_STYLESHEETS_GLOB_KEY} from './material/extra-stylsheets';
import {findTslintBinaryPath} from './tslint/find-tslint-binary';

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
  const migrationConfig = resolve(__dirname, 'rules', 'tslint-migration.json');

  // Command line arguments for dispatching the TSLint executable.
  const tslintArgs = ['-c', migrationConfig, '-p', projectPath];
  const childProcessEnv = { ...process.env };

  if (argv.extraStylesheets) {
    // Since TSLint runs in another node process and we want to apply the fixes for extra
    // stylesheets through TSLint we need to transfer the glob of stylesheets to the child
    // process.
    childProcessEnv[EXTRA_STYLESHEETS_GLOB_KEY] = argv.extraStylesheets.join(' ');
  }

  migrateProject(tslintArgs, childProcessEnv);
}

/** Starts the migration of the specified project in the TSLint arguments. */
function migrateProject(tslintArgs: string[], env?: any) {
  const tslintBin = findTslintBinaryPath();
  const spinner = ora('Migrating the specified Angular Material project').start();

  // Run the TSLint CLI with the configuration file from the migration tool.
  const tslintProcess = spawn('node', [tslintBin, ...tslintArgs], {env});

  let stderr = '';

  tslintProcess.stderr.on('data', data => stderr += data.toString());

  tslintProcess.stdout.pipe(process.stdout);
  tslintProcess.stderr.pipe(process.stderr);

  tslintProcess.on('close', () => {
    // Clear the spinner output before printing messages, because Ora is not able to clear the
    // spinner properly if there is console output after the previous spinner output.
    spinner.clear();

    if (stderr.trim()) {
      console.error(yellow('Make sure the following things are done correctly:'));
      console.error(yellow(' • Angular Material is installed in the project (for type checking)'));
      console.error(yellow(' • The Angular Material version is not higher than "5.2.4"'));
      console.error(yellow(' • Project "tsconfig.json" configuration matches the desired files'));
      console.error();
      spinner.fail('Errors occurred while migrating the Angular Material project.');
    } else {
      spinner.succeed(`Successfully migrated the project source files. Please check above output ` +
          `for issues that couldn't be automatically fixed.`);
    }
  });
}
