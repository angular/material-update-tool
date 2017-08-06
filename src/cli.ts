import {option, help, argv} from 'yargs';
import {red, green} from 'chalk';
import {statSync, existsSync} from 'fs';
import {MatSwitcher} from './index';

// Register a help page in yargs.
help();

// Register the project option in yargs.
option('project', {
  alias: 'p',
  describe: 'Path to the tsconfig.json file of the project',
  string: true,
  required: true
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
  const switcher = new MatSwitcher(projectPath);

  // Update all source files in the project by replacing the Mat prefix.
  switcher.updateProject();

  console.log(green('Successfully updated the project source files.'))
}
