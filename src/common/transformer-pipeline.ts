import {Program, SourceFile} from 'typescript';
import {applyAndWriteReplacements, Replacement} from './replacements';

/** Transformer Functions can be used as an alternative to a transformer instance. */
export type TransformerFunction = (sourceFile: SourceFile, program: Program) => Replacement[];

/** Transformers can be used to modify TypeScript source files. */
export type Transformer = TransformerFunction;

export class TransformerPipeline {

  constructor(public transformers: Transformer[]) {}

  /** Executes the transformer pipeline for the specified TypeScript project. */
  execute(program: Program) {
    for (let sourceFile of this.getSourceFiles(program)) {
      this.runTransformers(sourceFile, program);
    }
  }

  /** Runs all transformers against the specified source file. */
  private runTransformers(sourceFile: SourceFile, program: Program) {
    const replacements: Replacement[] = [];

    for (let transformer of this.transformers) {
      replacements.push(...transformer(sourceFile, program));
    }

    applyAndWriteReplacements(sourceFile, replacements);
  }

  /** Returns all source files of the current project. */
  private getSourceFiles(program: Program) {
    return program.getSourceFiles().filter(sourceFile => !sourceFile.isDeclarationFile);
  }
}
