import {Rules, RuleFailure, IOptions} from 'tslint';
import * as ts from 'typescript';
import {ComponentWalker} from '../tslint/component-walker';
import {ExternalResource} from '../tslint/component-file';
import {attributeSelectors, elementSelectors, inputNames} from '../material/component-data';
import {replaceAll} from '../typescript/literal';
import {sync as globSync} from 'glob';

/**
 * A glob string needs to be transferred from the CLI process to the child process of TSLint.
 * This is the environment variable, which will be set if the `--extra-stylesheets` option is set.
 */
export const EXTRA_STYLESHEETS_GLOB_KEY = 'MD_EXTRA_STYLESHEETS_GLOB';

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

  constructor(sourceFile: ts.SourceFile, options: IOptions) {
    super(sourceFile, options);

    // This is a special feature. In some applications, developers will have global stylesheets
    // that are not specified in any Angular component. Those stylesheets can be also migrated
    // if the developer specifies the `--extra-stylesheets` option which accepts a glob for files.
    if (process.env[EXTRA_STYLESHEETS_GLOB_KEY]) {
      process.env[EXTRA_STYLESHEETS_GLOB_KEY].split(' ')
        .map(glob => globSync(glob))
        .forEach(files => files.forEach(styleUrl => this._reportExternalStyle(styleUrl)));
    }
  }

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
    [...elementSelectors, ...attributeSelectors].forEach(selector => {
      stylesheetContent = replaceAll(stylesheetContent, selector.md, selector.mat);
    });

    inputNames.forEach(input => {
      stylesheetContent = replaceAll(stylesheetContent, `[${input.md}]`, `[${input.mat}]`);
    });

    return stylesheetContent;
  }

}
