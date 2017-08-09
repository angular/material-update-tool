import {Rules, RuleFailure, RuleWalker} from 'tslint';
import * as ts from 'typescript';
import {includesAngularMaterialPrefix} from '../common/material-module';

/** Message that is being sent to TSLint if a string literal still uses the outdated prefix. */
const failureMessage = 'String literal can be switched from "Md" prefix to "Mat".';

/**
 * Rule that walks through every string literal, which includes the outdated Material prefix and
 * is part of a call expression. Those string literals will be changed to the new prefix.
 */
export class Rule extends Rules.AbstractRule {

  apply(sourceFile: ts.SourceFile): RuleFailure[] {
    return this.applyWithWalker(new SwitchStringLiteralsWalker(sourceFile, this.getOptions()));
  }
}

export class SwitchStringLiteralsWalker extends RuleWalker {

  /** Method that is called for every string literal inside of the specified project. */
  visitStringLiteral(stringLiteral: ts.StringLiteral) {
    if (stringLiteral.parent.kind !== ts.SyntaxKind.CallExpression) {
      return;
    }

    // TODO: Verify if this is a valid selector by comparing with the list of selectors file (JSON)
    if (!includesAngularMaterialPrefix(stringLiteral.text)) {
      return;
    }

    // For the replacement the quotation characters of the string literal need to be ignored.
    // Because of that we need to adjust the start and end position of the replacement.
    const replacement = this.createReplacement(
      stringLiteral.getStart() + 1,
      stringLiteral.getWidth() - 2,
      stringLiteral.text.replace(/^md/i, 'mat') // TODO(devversion): case specific changes
    );

    this.addFailureAtNode(stringLiteral, failureMessage, replacement);
  }
}
