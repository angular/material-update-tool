import * as ts from 'typescript';
import {createReplacementForNode, Replacement} from '../common/replacements';
import {includesAngularMaterialPrefix, materialModulePathSegment} from '../common/material-module';
import {getOriginalSymbolFromIdentifier} from '../typescript/identifiers';

export function replaceTypeScriptIdentifiers(sourceFile: ts.SourceFile,
                                             program: ts.Program): Replacement[] {

  // Replacements that can be applied to switch all Material identifiers to the new prefix.
  const replacements = new Set<Replacement>();

  // Walk through every TypeScript node recursively and visit all identifiers.
  ts.forEachChild(sourceFile, node => {
    visitTypeScriptNode(node, replacements, program.getTypeChecker());
  });

  return Array.from(replacements);
}

/** Method that is used to recursively walk through all nodes of the current source file. */
function visitTypeScriptNode(node: ts.Node, replacements: Set<Replacement>,
                             checker: ts.TypeChecker) {

  if (node.kind === ts.SyntaxKind.Identifier) {
    visitTypeScriptIdentifier(node as ts.Identifier, replacements, checker);
  }

  ts.forEachChild(node, child => visitTypeScriptNode(child, replacements, checker));
}

/** Method that is called whenever an identifier has been found. */
function visitTypeScriptIdentifier(node: ts.Identifier, replacements: Set<Replacement>,
                                   checker: ts.TypeChecker) {

  if (!includesAngularMaterialPrefix(node.text)) {
    return;
  }

  const originalSymbol = getOriginalSymbolFromIdentifier(node, checker);
  const valueDeclaration = originalSymbol.valueDeclaration;
  const valueSourceFile = valueDeclaration.getSourceFile();

  if (valueSourceFile.isDeclarationFile &&
    valueSourceFile.fileName.indexOf(materialModulePathSegment) !== -1) {

    replacements.add(createReplacementForNode(node, originalSymbol.name.replace(/^Md/, 'Mat')))
  }
}
