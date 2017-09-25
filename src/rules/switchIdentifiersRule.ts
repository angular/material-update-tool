import {Rules, RuleFailure, ProgramAwareRuleWalker} from 'tslint';
import * as ts from 'typescript';
import {getOriginalSymbolFromNode} from '../typescript/identifiers';
import {
  isExportSpecifierNode,
  isImportSpecifierNode,
  isNamespaceImportNode
} from '../typescript/imports';
import {
  isMaterialImportDeclaration,
  isMaterialExportDeclaration,
} from '../material/typescript-specifiers';
import {classNames} from '../material/component-data';

/** Message that is being sent to TSLint if an identifier still uses the outdated prefix. */
const failureMessage = 'Identifier can be switched from "Md" prefix to "Mat".';

/**
 * Rule that walks through every identifier that is part of Angular Material and replaces the
 * outdated prefix with the new one.
 */
export class Rule extends Rules.TypedRule {

  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    return this.applyWithWalker(
        new SwitchIdentifiersWalker(sourceFile, this.getOptions(), program));
  }
}

export class SwitchIdentifiersWalker extends ProgramAwareRuleWalker {

  /** List of Angular Material declarations inside of the current source file. */
  materialDeclarations: ts.Declaration[] = [];

  /** List of Angular Material namespace declarations in the current source file. */
  materialNamespaceDeclarations: ts.Declaration[] = [];

  /** Method that is called for every identifier inside of the specified project. */
  visitIdentifier(identifier: ts.Identifier) {
    // Store Angular Material namespace identifers in a list of declarations.
    this._storeNamespaceImports(identifier);

    // For identifiers that aren't listed in the className data, the whole check can be
    // skipped safely.
    if (!classNames.some(data => data.md === identifier.text)) {
      return;
    }

    const symbol = getOriginalSymbolFromNode(identifier, this.getTypeChecker());

    // If the symbol is not defined or could not be resolved, just skip the following identifier
    // checks.
    if (!symbol) {
      return;
    }

    // For export declarations that are referring to Angular Material, the identifier should be
    // switched to the new prefix.
    if (isExportSpecifierNode(identifier) && isMaterialExportDeclaration(identifier)) {
      return this.createIdentifierFailure(identifier, symbol);
    }

    // For import declarations that are referring to Angular Material, the value declarations
    // should be stored so that other identifiers in the file can be compared.
    if (isImportSpecifierNode(identifier) && isMaterialImportDeclaration(identifier)) {
      this.materialDeclarations.push(symbol.valueDeclaration);
    }

    // For identifiers that are not part of an import or export, the list of Material declarations
    // should be checked to ensure that only identifiers of Angular Material are updated.
    // Identifiers that are imported through an Angular Material namespace will be updated.
    else if (this.materialDeclarations.indexOf(symbol.valueDeclaration) === -1 &&
              !this._isIdentifierFromNamespace(identifier)) {
      return;
    }

    return this.createIdentifierFailure(identifier, symbol);
  }

  /** Creates a failure and replacement for the specified identifier. */
  private createIdentifierFailure(identifier: ts.Identifier, symbol: ts.Symbol) {
    const classData = classNames.find(data => data.md === symbol.name);

    if (!classData) {
      console.error(`Could not find updated prefix for identifier (${identifier.getText()}).`);
      return;
    }

    const replacement = this.createReplacement(
        identifier.getStart(), identifier.getWidth(), classData.mat);

    this.addFailureAtNode(identifier, failureMessage, replacement);
  }

  /** Checks namespace imports from Angular Material and stores them in a list. */
  private _storeNamespaceImports(identifier: ts.Identifier) {
    // In some situations, developers will import Angular Material completely using a namespace
    // import. This is not recommended, but should be still handled in the migration tool.
    if (isNamespaceImportNode(identifier) && isMaterialImportDeclaration(identifier)) {
      const symbol = getOriginalSymbolFromNode(identifier, this.getTypeChecker());

      if (symbol) {
        return this.materialNamespaceDeclarations.push(symbol.valueDeclaration);
      }
    }
  }

  /** Checks whether the given identifier is part of the Material namespace. */
  private _isIdentifierFromNamespace(identifier: ts.Identifier) {
    if (identifier.parent.kind !== ts.SyntaxKind.PropertyAccessExpression) {
      return;
    }

    const propertyExpression = identifier.parent as ts.PropertyAccessExpression;
    const expressionSymbol = getOriginalSymbolFromNode(propertyExpression.expression,
        this.getTypeChecker());

    return this.materialNamespaceDeclarations.indexOf(expressionSymbol.valueDeclaration) !== -1;
  }
}
