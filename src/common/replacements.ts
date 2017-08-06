import {SourceFile, Node} from 'typescript';
import {writeFileSync} from 'fs';

/** Interface that describes a replacement for a source file. */
export interface Replacement {
  start: number;
  end: number;
  text: string;
}

/** Applies the given replacements in the specified source file. */
export function applyReplacements(sourceFileText: string, replacements: Replacement[]) {
  for (const {start, end, text} of replacements.reverse()) {
    sourceFileText = sourceFileText.slice(0, start) + text + sourceFileText.slice(end)
  }

  return sourceFileText;
}

/** Applies the given replacements and writes the new file to the file system. */
export function applyAndWriteReplacements(sourceFile: SourceFile, replacements: Replacement[]) {
  const newSourceContent = applyReplacements(sourceFile.getFullText(), replacements);

  writeFileSync(sourceFile.fileName, newSourceContent);
}

/** Method that creates a new replacement at the given node. */
export function createReplacementForNode(node: Node, newText: string): Replacement {
  return {start: node.getStart(), end: node.getEnd(), text: newText };
}
