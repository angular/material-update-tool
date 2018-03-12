import {RuleFailure, Rules, RuleWalker} from 'tslint';
import * as ts from 'typescript';
import {attributeSelectors, cssNames, elementSelectors} from "../material/component-data";
import {replaceAll} from '../typescript/literal';

/** Message that is being sent to TSLint if a string literal still uses the outdated name. */
const failureMessage = 'Deprecated string literal value can be updated.';

/**
 * Rule that walks through every string literal, which includes the outdated Material name and
 * is part of a call expression. Those string literals will be changed to the new name.
 */
export class Rule extends Rules.AbstractRule {

  apply(sourceFile: ts.SourceFile): RuleFailure[] {
    return this.applyWithWalker(new SwitchStringLiteralsWalker(sourceFile, this.getOptions()));
  }
}

export class SwitchStringLiteralsWalker extends RuleWalker {

  visitStringLiteral(stringLiteral: ts.StringLiteral) {
    if (stringLiteral.parent.kind !== ts.SyntaxKind.CallExpression) {
      return;
    }

    let updatedText = stringLiteral.getText();

    [...elementSelectors, ...attributeSelectors].forEach(selector => {
      updatedText = replaceAll(updatedText, selector.replace, selector.replaceWith);
    });

    cssNames.forEach(name => {
      if (!name.whitelist || name.whitelist.strings) {
        updatedText = replaceAll(updatedText, name.replace, name.replaceWith);
      }
    });

    if (updatedText !== stringLiteral.getText()) {
      const replacement = this.createReplacement(stringLiteral.getStart(),
          stringLiteral.getWidth(), updatedText);

      this.addFailureAtNode(stringLiteral, failureMessage, replacement);
    }
  }
}
