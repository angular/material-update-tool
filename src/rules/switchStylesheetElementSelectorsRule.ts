import {green, red} from 'chalk';
import {sync as globSync} from 'glob';
import {resolve} from "path";
import {IOptions, Replacement, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';
import {elementSelectors} from '../material/component-data';
import {EXTRA_STYLESHEETS_GLOB_KEY} from '../material/extra-stylsheets';
import {ExternalResource} from '../tslint/component-file';
import {ComponentWalker} from '../tslint/component-walker';
import {findAll} from '../typescript/literal';

/**
 * Rule that walks through every component decorator and updates their inline or external
 * stylesheets.
 */
export class Rule extends Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): RuleFailure[] {
    return this.applyWithWalker(
        new SwitchStylesheetElementSelectorsWalker(sourceFile, this.getOptions()));
  }
}

export class SwitchStylesheetElementSelectorsWalker extends ComponentWalker {

  constructor(sourceFile: ts.SourceFile, options: IOptions) {
    // This is a special feature. In some applications, developers will have global stylesheets
    // that are not specified in any Angular component. Those stylesheets can be also migrated
    // if the developer specifies the `--extra-stylesheets` option which accepts a glob for files.
    const extraFiles = [];
    if (process.env[EXTRA_STYLESHEETS_GLOB_KEY]) {
      process.env[EXTRA_STYLESHEETS_GLOB_KEY].split(' ')
          .map(glob => globSync(glob))
          .forEach(files => files.forEach(styleUrl => {
            extraFiles.push(resolve(styleUrl));
          }));
    }

    super(sourceFile, options, extraFiles);

    extraFiles.forEach(styleUrl => this._reportExternalStyle(styleUrl));
  }

  visitInlineStylesheet(stylesheet: ts.StringLiteral) {
    this.replaceNamesInStylesheet(stylesheet, stylesheet.getText()).forEach(replacement => {
      const fix = replacement.replacement;
      const ruleFailure = new RuleFailure(stylesheet.getSourceFile(), fix.start, fix.end,
          replacement.message, this.getRuleName(), fix);
      this.addFailure(ruleFailure);
    });
  }

  visitExternalStylesheet(stylesheet: ExternalResource) {
    this.replaceNamesInStylesheet(stylesheet, stylesheet.getFullText()).forEach(replacement => {
      const fix = replacement.replacement;
      const ruleFailure = new RuleFailure(stylesheet, fix.start + 1, fix.end + 1,
          replacement.message, this.getRuleName(), fix);
      this.addFailure(ruleFailure);
    });
  }

  /**
   * Replaces the outdated name in the stylesheet with the new one and returns an updated
   * stylesheet.
   */
  private replaceNamesInStylesheet(node: ts.Node, stylesheetContent: string):
      {message: string, replacement: Replacement}[] {
    const replacements: {message: string, replacement: Replacement}[] = [];

    elementSelectors.forEach(selector => {
      this.createReplacementsForOffsets(node, selector,
          findAll(stylesheetContent, selector.replace)).forEach(replacement => {
            replacements.push({
              message: `Found deprecated element selector "${red(selector.replace)}" which has` +
                  ` been renamed to "${green(selector.replaceWith)}"`,
              replacement
            });
          });
    });

    return replacements;
  }

  private createReplacementsForOffsets(node: ts.Node,
                                       update: {replace: string, replaceWith: string},
                                       offsets: number[]): Replacement[] {
    return offsets.map(offset => this.createReplacement(
        node.getStart() + offset, update.replace.length, update.replaceWith));
  }
}
