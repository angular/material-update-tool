import * as ts from 'typescript';
import {Replacement} from '../common/replacements';
import {includesAngularMaterialPrefix} from '../common/material-module';

export function replaceStringLiterals(sourceFile: ts.SourceFile): Replacement[] {

  // Replacements that can be applied to switch all string literals to the new prefix.
  const replacements = new Set<Replacement>();

  // Walk through every TypeScript node recursively and visit all string literals.
  ts.forEachChild(sourceFile, node => {
    visitTypeScriptNode(node, replacements);
  });

  return Array.from(replacements);
}

/** Method that is used to recursively walk through all nodes of the current source file. */
function visitTypeScriptNode(node: ts.Node, replacements: Set<Replacement>) {

  if (node.kind === ts.SyntaxKind.StringLiteral) {
    visitTypeScriptStringLiteral(node as ts.StringLiteral, replacements);
  }

  ts.forEachChild(node, child => visitTypeScriptNode(child, replacements));
}

/** Method that is called whenever a string literal has been found. */
function visitTypeScriptStringLiteral(node: ts.StringLiteral, replacements: Set<Replacement>) {

  if (node.parent.kind !== ts.SyntaxKind.CallExpression) {
    return;
  }

  if (!includesAngularMaterialPrefix(node.text)) {
    return;
  }

  // For the replacement the quotation character of the string literal needs to be ignored.
  // Because of that we need to adjust the start and end position of the replacement.
  replacements.add({
    start: node.getStart() + 1,
    end: node.getEnd() - 1,
    text: node.text.replace(/^md/i, 'mat') // TODO(devversion): case specific changes
  });
}
