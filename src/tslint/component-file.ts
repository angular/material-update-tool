import * as ts from 'typescript';

export type ExternalResource = ts.SourceFile;

export function createComponentFile(filePath: string, content: string): ExternalResource {
  const sourceFile = ts.createSourceFile(filePath, `\`${content}\``, ts.ScriptTarget.ES5);
  const _getFullText = sourceFile.getFullText;

  sourceFile.getFullText = function() {
    const text = _getFullText.apply(sourceFile);
    return text.substring(1, text.length - 1);
  }.bind(sourceFile);

  return sourceFile;
}
