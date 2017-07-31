import * as ts from 'typescript';
import {Replacement} from './replacements';
import {getSymbolOfIdentifier} from './identifier';
import {includesAngularMaterialPrefix, isAngularMaterialImportSpecifier} from './material-module';

export class IdentifierSwitcher {

  /** Replacements that can be applied to switch all Material identifiers to the new prefix. */
  private replacements: Replacement[] = [];

  /** List of declarations that are belonging to the Angular Material module. */
  private declarations: ts.Declaration[] = [];

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
    const symbol = getSymbolOfIdentifier(node, this.checker);

    if (!includesAngularMaterialPrefix(symbol)) {
      return;
    }

    if (isAngularMaterialImportSpecifier(node)) {
      this.declarations.push(symbol.valueDeclaration);
      this.createReplacement(node, symbol.name.replace(/^Md/, 'Mat'));
    } else if (this.isAngularMaterialSymbol(symbol)) {
      this.createReplacement(node, symbol.name.replace(/^Md/, 'Mat'));
    }
  }

  /** Method that checks whether the given symbol is a declaration of Angular Material. */
  private isAngularMaterialSymbol(symbol: ts.Symbol) {
    return this.declarations.indexOf(symbol.valueDeclaration) !== -1;
  }

  /** Method that creates a new replacement at the given node. */
  private createReplacement(node: ts.Node, newText: string) {
    this.replacements.push({start: node.getStart(), end: node.getEnd(), text: newText });
  }

}
