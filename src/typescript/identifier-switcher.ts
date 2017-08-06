import * as ts from 'typescript';
import {Replacement} from './replacements';
import {getOriginalSymbolFromIdentifier} from './identifier';
import {includesAngularMaterialPrefix} from './material-module';

export class IdentifierSwitcher {

  /** Replacements that can be applied to switch all Material identifiers to the new prefix. */
  private replacements: Replacement[] = [];


  constructor(private sourceFile: ts.SourceFile,
              private checker: ts.TypeChecker) {}

  /** Method that walks through every node in the source file and creates replacements. */
  createReplacements(): Replacement[] {
    ts.forEachChild(this.sourceFile, node => this.visitNode(node));
    return this.replacements;
  }

  /** Method that is used to recursively walk through all nodes of the current source file. */
  private visitNode(node: ts.Node) {
    if (node.kind === ts.SyntaxKind.Identifier) {
      this.visitIdentifier(node as ts.Identifier);
    }

    ts.forEachChild(node, child => this.visitNode(child));
  }

  /** Method that is called whenever an identifier has been found. */
  private visitIdentifier(node: ts.Identifier) {
    if (!includesAngularMaterialPrefix(node.text)) {
      return;
    }

    const originalSymbol = getOriginalSymbolFromIdentifier(node, this.checker);
    const valueDeclaration = originalSymbol.valueDeclaration;
    const valueSourceFile = valueDeclaration.getSourceFile();


    if (valueSourceFile.isDeclarationFile &&
        valueSourceFile.fileName.indexOf('node_modules/@angular/material') !== -1) {


     this.createReplacement(node, originalSymbol.name.replace(/^Md/, 'Mat'));
    }
  }

  /** Method that creates a new replacement at the given node. */
  private createReplacement(node: ts.Node, newText: string) {
    this.replacements.push({start: node.getStart(), end: node.getEnd(), text: newText });
  }

}
