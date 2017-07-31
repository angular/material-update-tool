import * as ts from 'typescript';

/** Checks whether the given node is a import specifier node. */
export function isImportSpecifierNode(node: ts.Node) {
  if (node.kind === ts.SyntaxKind.ImportSpecifier) {
    return true;
  }

  if (node.kind === ts.SyntaxKind.SourceFile) {
    return false;
  }

  return isImportSpecifierNode(node.parent);
}

/** Finds the parent import declaration of a given TypeScript node. */
export function getImportDeclaration(node: ts.Node) {
  while (node.kind !== ts.SyntaxKind.ImportDeclaration) {
    node = node.parent;
  }

  return node as ts.ImportDeclaration;
}
