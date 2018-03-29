import {Replacement, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';
import {
  attributeSelectors,
  cssNames,
  elementSelectors,
  exportAsNames,
  inputNames,
  outputNames
} from '../material/component-data';
import {ExternalResource} from '../tslint/component-file';
import {ComponentWalker} from '../tslint/component-walker';
import {
  findAll,
  findAllInputsInElWithAttr,
  findAllInputsInElWithTag,
  findAllOutputsInElWithAttr,
  findAllOutputsInElWithTag
} from '../typescript/literal';

/**
 * Message that is being sent to TSLint if there is something in the template that still use an
 * outdated name.
 */
const failureMessage = 'Template uses outdated Material name.';

/**
 * Rule that walks through every component decorator and updates their inline or external
 * templates.
 */
export class Rule extends Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): RuleFailure[] {
    return this.applyWithWalker(new SwitchTemplatesWalker(sourceFile, this.getOptions()));
  }
}

export class SwitchTemplatesWalker extends ComponentWalker {
  visitInlineTemplate(template: ts.StringLiteral) {
    this.replaceNamesInTemplate(template, template.getText()).forEach(replacement => {
      this.addFailureAtNode(template, replacement.message, replacement.replacement);
    });
  }

  visitExternalTemplate(template: ExternalResource) {
    this.replaceNamesInTemplate(template, template.getFullText()).forEach(replacement => {
      this.addExternalResourceFailure(template, replacement.message, replacement.replacement);
    });
  }

  /**
   * Replaces the outdated name in the template with the new one and returns an updated template.
   */
  private replaceNamesInTemplate(node: ts.Node, templateContent: string):
      {message: string, replacement: Replacement}[] {
    const replacements: {message: string, replacement: Replacement}[] = [];
/*
    elementSelectors.forEach(selector => {
      // Being more aggressive with that replacement here allows us to also handle inline
      // style elements. Normally we would check if the selector is surrounded by the HTML tag
      // characters.
      this.createReplacementsForOffsets(node, selector, findAll(templateContent, selector.replace))
          .forEach(replacement => {
            replacements.push({message: failureMessage, replacement});
          });
    });

    attributeSelectors.forEach(selector => {
      // Being more aggressive with that replacement here allows us to also handle inline
      // style elements. Normally we would check if the selector is surrounded by the HTML tag
      // characters.
      this.createReplacementsForOffsets(node, selector, findAll(templateContent, selector.replace))
          .forEach(replacement => {
            replacements.push({message: failureMessage, replacement});
          });
    });

    cssNames.forEach(name => {
      if (!name.whitelist || name.whitelist.html) {
        this.createReplacementsForOffsets(node, name, findAll(templateContent, name.replace))
            .forEach(replacement => {
              replacements.push({message: failureMessage, replacement});
            });
      }
    });

    inputNames.forEach(name => {
      let offsets;
      if (name.whitelist && name.whitelist.attributes && name.whitelist.attributes.length) {
        offsets =
            findAllInputsInElWithAttr(templateContent, name.replace, name.whitelist.attributes);
      }
      if (name.whitelist && name.whitelist.elements && name.whitelist.elements.length) {
        offsets =
            findAllInputsInElWithTag(templateContent, name.replace, name.whitelist.elements);
      }
      if (!name.whitelist) {
        offsets = findAll(templateContent, name.replace);
      }
      this.createReplacementsForOffsets(node, name, offsets).forEach(replacement => {
        replacements.push({message: failureMessage, replacement});
      });
    });

    outputNames.forEach(name => {
      let offsets;
      if (name.whitelist && name.whitelist.attributes && name.whitelist.attributes.length) {
        offsets = findAllOutputsInElWithAttr(
            templateContent, name.replace, name.whitelist.attributes);
      }
      if (name.whitelist && name.whitelist.elements && name.whitelist.elements.length) {
        offsets = findAllOutputsInElWithTag(
            templateContent, name.replace, name.whitelist.elements);
      }
      if (!name.whitelist) {
        offsets = findAll(templateContent, name.replace);
      }
      this.createReplacementsForOffsets(node, name, offsets).forEach(replacement => {
        replacements.push({message: failureMessage, replacement});
      });
    });

    exportAsNames.forEach(selector => {
      this.createReplacementsForOffsets(node, selector, findAll(templateContent, selector.replace))
          .forEach(replacement => {
            replacements.push({message: failureMessage, replacement});
          })
    });
*/
    return replacements;
  }

  private createReplacementsForOffsets(node: ts.Node,
                                       update: {replace: string, replaceWith: string},
                                       offsets: number[]): Replacement[] {
    return offsets.map(offset => this.createReplacement(
        node.getStart() + offset, update.replace.length, update.replaceWith));
  }
}
