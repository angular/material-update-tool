import * as ts from 'typescript';
import {getExportDeclaration, getImportDeclaration} from '../typescript/imports';

/** Name of the Angular Material module specifier. */
export const materialModuleSpecifier = '@angular/material';

/** Whether the specified node is part of an Angular Material import declaration. */
export function isMaterialImportDeclaration(node: ts.Node) {
  return getImportDeclaration(node).moduleSpecifier.getText() === `'${materialModuleSpecifier}'`;
}

/** Whether the specified node is part of an Angular Material export declaration. */
export function isMaterialExportDeclaration(node: ts.Node) {
  return getExportDeclaration(node).moduleSpecifier.getText() === `'${materialModuleSpecifier}'`;
}
