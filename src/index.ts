import * as ts from 'typescript';
import {createProgramFromConfig} from './typescript/create-program';
import {TransformerPipeline} from './common/transformer-pipeline';
import {replaceTypeScriptIdentifiers} from './transformers/replace-typescript-identifiers';

export class MatSwitcher {

  /** TypeScript program that will be transformed. */
  readonly program: ts.Program;

  /** Pipeline of TypeScript source file transformers */
  readonly pipeline: TransformerPipeline;

  constructor(project: string) {
    this.program = createProgramFromConfig(project);

    this.pipeline = new TransformerPipeline([
      replaceTypeScriptIdentifiers
    ]);
  }

  /** Walks through every source file and updates the outdated prefixes inside. */
  updateProject() {
    this.pipeline.execute(this.program);
  }
}
