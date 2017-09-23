import {Rules, RuleFailure, RuleWalker} from 'tslint';
import {propertyNames} from "../material/component-data";
import * as ts from 'typescript';

/** Message that is being sent to TSLint if a string literal still uses the outdated prefix. */
const failureMessage = 'Property access expression can be switched from "Md" prefix to "Mat".';

/**
 * Rule that walks through every property access expression and updates properties that have
 * been changed in favor of the new prefix.
 */
export class Rule extends Rules.AbstractRule {

  apply(sourceFile: ts.SourceFile): RuleFailure[] {
    return this.applyWithWalker(new SwitchPropertyNamesWalker(sourceFile, this.getOptions()));
  }
}

export class SwitchPropertyNamesWalker extends RuleWalker {

  visitPropertyAccessExpression(prop: ts.PropertyAccessExpression) {
    // Recursively call this method for the expression of the current property expression.
    // It can happen that there is a chain of property access expressions.
    // For example: "mySortInstance.mdSortChange.subscribe()"
    if (prop.expression && prop.expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
      this.visitPropertyAccessExpression(prop.expression as ts.PropertyAccessExpression);
    }

    const propertyData = propertyNames.find(name => prop.name.getText() === name.md);

    if (!propertyData) {
      return;
    }

    const replacement = this.createReplacement(prop.name.getStart(),
        prop.name.getWidth(), propertyData.mat);

    this.addFailureAtNode(prop.name, failureMessage, replacement);
  }
}
