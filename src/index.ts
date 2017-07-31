import * as ts from 'typescript';
import {writeFileSync} from 'fs';
import {createProgramFromConfig} from './typescript/load-project';
import {IdentifierSwitcher} from './typescript/identifier-switcher';
import {updateSourceFileText} from './typescript/replacements';

export class MatSwitcher {

  readonly program: ts.Program;

  constructor(project: string) {
    this.program = createProgramFromConfig(project);
  }

  /** Walks through every source file and updates the outdated prefixes inside. */
  updateSourceFiles() {
    for (let sourceFile of this.getSourceFiles()) {
      this.updateSourceFile(sourceFile);
    }
  }

  /** Updates the outdated Material prefix in the source file updates it. */
  updateSourceFile(sourceFile: ts.SourceFile) {
    const replacements = new IdentifierSwitcher(sourceFile, this.program.getTypeChecker())
      .createReplacements();

    const newSourceContent = updateSourceFileText(sourceFile.getFullText(), replacements);

    writeFileSync(sourceFile.fileName, newSourceContent);
  }

  /** Returns all source files of the current project. */
  getSourceFiles() {
    return this.program.getSourceFiles().filter(sourceFile => !sourceFile.isDeclarationFile);
  }

}
