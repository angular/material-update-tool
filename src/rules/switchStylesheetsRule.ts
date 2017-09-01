import {Rules, RuleFailure} from 'tslint';
import * as ts from 'typescript';
import {ComponentWalker} from '../tslint/component-walker';
import {ExternalResource} from '../tslint/component-file';
import {attributeSelectors, elementSelectors, inputNames} from '../material/component-data';

/**
 * Message that is being sent to TSLint if there is something in the stylesheet that still use an
 * outdated prefix.
 */
const failureMessage = 'Stylesheet uses outdated Material prefix.';

/**
 * Rule that walks through every component decorator and updates their inline or external
 * stylesheets.
 */
export class Rule extends Rules.AbstractRule {

  apply(sourceFile: ts.SourceFile): RuleFailure[] {
    return this.applyWithWalker(new SwitchStylesheetsWalker(sourceFile, this.getOptions()));
  }
}

export class SwitchStylesheetsWalker extends ComponentWalker {

  visitInlineStylesheet(stylesheet: ts.StringLiteral) {
    const newStylesheetText = this.replacePrefixesInStylesheet(stylesheet.getText());

    if (newStylesheetText !== stylesheet.getText()) {
      const replacement = this.createReplacement(stylesheet.getStart(), stylesheet.getWidth(),
          newStylesheetText);

      this.addFailureAtNode(stylesheet, failureMessage, replacement);
    }
  }

  visitExternalStylesheet(stylesheet: ExternalResource) {
    const newStylesheetText = this.replacePrefixesInStylesheet(stylesheet.getFullText());

    if (newStylesheetText !== stylesheet.getFullText()) {
      const replacement = this.createReplacement(stylesheet.getStart(), stylesheet.getWidth(),
          newStylesheetText);

      this.addExternalResourceFailure(stylesheet, failureMessage, replacement);
    }
  }

  /**
   * Replaces the outdated prefix in the stylesheet with the new one and returns an updated
   * stylesheet.
   */
  private replacePrefixesInStylesheet(stylesheetContent: string): string {
    elementSelectors.forEach(selector => {
      stylesheetContent = stylesheetContent.replace(selector.md, selector.mat);
    });

    attributeSelectors.forEach(attribute => {
      stylesheetContent = stylesheetContent.replace(attribute.md, attribute.mat);
    });

    inputNames.forEach(input => {
      stylesheetContent = stylesheetContent.replace(`[${input.md}]`, `[${input.mat}]`);
    });

    return stylesheetContent;
  }

}
