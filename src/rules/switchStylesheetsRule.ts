import {sync as globSync} from 'glob';
import {IOptions, Replacement, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';
import {
  attributeSelectors,
  cssNames,
  elementSelectors,
  inputNames,
  outputNames
} from '../material/component-data';
import {ExternalResource} from '../tslint/component-file';
import {ComponentWalker} from '../tslint/component-walker';
import {findAll} from '../typescript/literal';

/**
 * A glob string needs to be transferred from the CLI process to the child process of TSLint.
 * This is the environment variable, which will be set if the `--extra-stylesheets` option is set.
 */
export const EXTRA_STYLESHEETS_GLOB_KEY = 'MD_EXTRA_STYLESHEETS_GLOB';

/**
 * Message that is being sent to TSLint if there is something in the stylesheet that still use an
 * outdated name.
 */
const failureMessage = 'Stylesheet uses outdated Material name.';

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
    this.replaceNamesInStylesheet(stylesheet, stylesheet.getText()).forEach(replacement => {
      this.addFailureAtNode(stylesheet, replacement.message, replacement.replacement);
    });
  }

  visitExternalStylesheet(stylesheet: ExternalResource) {
    this.replaceNamesInStylesheet(stylesheet, stylesheet.getFullText()).forEach(replacement => {
      this.addExternalResourceFailure(stylesheet, replacement.message, replacement.replacement);
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
            replacements.push({message: failureMessage, replacement});
          });
    });

    attributeSelectors.forEach(selector => {
      const bracketedSelector = {
        replace: `[${selector.replace}]`,
        replaceWith: `[${selector.replaceWith}]`
      };
      this.createReplacementsForOffsets(node, bracketedSelector,
          findAll(stylesheetContent, bracketedSelector.replace)).forEach(replacement => {
        replacements.push({message: failureMessage, replacement});
      });
    });

    cssNames.forEach(name => {
      if (!name.whitelist || name.whitelist.css) {
        this.createReplacementsForOffsets(node, name, findAll(stylesheetContent, name.replace))
            .forEach(replacement => {
              replacements.push({message: failureMessage, replacement});
            });
      }
    });

    inputNames.forEach(name => {
      if (!name.whitelist || name.whitelist.css) {
        const bracketedName = {replace: `[${name.replace}]`, replaceWith: `[${name.replaceWith}]`};
        this.createReplacementsForOffsets(node, name,
            findAll(stylesheetContent, bracketedName.replace)).forEach(replacement => {
              replacements.push({message: failureMessage, replacement});
            });
      }
    });

    outputNames.forEach(name => {
      if (!name.whitelist || name.whitelist.css) {
        const bracketedName = {replace: `[${name.replace}]`, replaceWith: `[${name.replaceWith}]`};
        this.createReplacementsForOffsets(node, name,
            findAll(stylesheetContent, bracketedName.replace)).forEach(replacement => {
              replacements.push({message: failureMessage, replacement});
            });
      }
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
