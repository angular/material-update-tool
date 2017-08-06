import * as ts from 'typescript';
import {getImportDeclaration, isImportSpecifierNode} from './imports';

/** Name of the Angular Material module specifier. */
const MATERIAL_MODULE_SPECIFIER = '@angular/material';

/** Whether the given node is a import specifier from the Angular Material module. */
export function isAngularMaterialImportSpecifier(node: ts.Node) {
  return isImportSpecifierNode(node) &&
    getImportDeclaration(node).moduleSpecifier.getText() === `'${MATERIAL_MODULE_SPECIFIER}'`;
}

/** Whether the given TypeScript symbol includes the Material prefix. */
export function includesAngularMaterialPrefix(node: string) {
  return node.match(/^Md/);
}
