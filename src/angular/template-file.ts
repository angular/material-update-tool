import * as ts from 'typescript';

export type ExternalTemplate = ts.SourceFile;

export function createTemplateFile(filePath: string, content: string): ExternalTemplate {
  const sourceFile = ts.createSourceFile(filePath, `\`${content}\``, ts.ScriptTarget.ES5);
  const _getFullText = sourceFile.getFullText;

  sourceFile.getFullText = function() {
    const text = _getFullText.apply(sourceFile);
    return text.substring(1, text.length - 1);
  }.bind(sourceFile);

  return sourceFile;
}
