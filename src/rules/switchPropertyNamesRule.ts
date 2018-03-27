import {ProgramAwareRuleWalker, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';
import {propertyNames} from '../material/component-data';

/** Message that is being sent to TSLint if a property name still uses the outdated name. */
const failureMessage = 'Deprecated property access expression can be updated.';

/**
 * Rule that walks through every property access expression and updates properties that have
 * been changed in favor of the new name.
 */
export class Rule extends Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    return this.applyWithWalker(
        new SwitchPropertyNamesWalker(sourceFile, this.getOptions(), program));
  }
}

export class SwitchPropertyNamesWalker extends ProgramAwareRuleWalker {
  visitPropertyAccessExpression(prop: ts.PropertyAccessExpression) {
    // Recursively call this method for the expression of the current property expression.
    // It can happen that there is a chain of property access expressions.
    // For example: "mySortInstance.mdSortChange.subscribe()"
    if (prop.expression && prop.expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
      this.visitPropertyAccessExpression(prop.expression as ts.PropertyAccessExpression);
    }

    // TODO(mmalerba): This is prrobably a bad way to get the property host...
    // Tokens are: [..., <host>, '.', <prop>], so back up 3.
    const propHost = prop.getChildAt(prop.getChildCount() - 3);

    const type = this.getTypeChecker().getTypeAtLocation(propHost);
    const typeName = type && type.getSymbol() && type.getSymbol().getName();
    const propertyData = propertyNames.find(name => {
      if (prop.name.text === name.replace) {
        // TODO(mmalerba): Verify that this type comes from Angular Material like we do in
        // `switchIdentifiersRule`.
        return !name.whitelist || new Set(name.whitelist.classes).has(typeName);
      }
      return false;
    });

    if (!propertyData) {
      return;
    }

    const replacement = this.createReplacement(prop.name.getStart(),
        prop.name.getWidth(), propertyData.replaceWith);

    this.addFailureAtNode(prop.name, failureMessage, replacement);
  }
}
