import {RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';
import {
  attributeSelectors, cssNames,
  elementSelectors,
  exportAsNames,
  inputNames,
  outputNames
} from '../material/component-data';
import {ExternalResource} from '../tslint/component-file';
import {ComponentWalker} from '../tslint/component-walker';
import {
  replaceAll,
  replaceAllInputsInElWithAttr,
  replaceAllInputsInElWithTag,
  replaceAllOutputsInElWithAttr,
  replaceAllOutputsInElWithTag
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
    const newTemplateText = this.replaceNamesInTemplate(template.getText());

    if (newTemplateText !== template.getText()) {
      const replacement = this.createReplacement(template.getStart(), template.getWidth(),
          newTemplateText);

      this.addFailureAtNode(template, failureMessage, replacement);
    }
  }

  visitExternalTemplate(template: ExternalResource) {
    const newTemplateText = this.replaceNamesInTemplate(template.getFullText());

    if (newTemplateText !== template.getFullText()) {
      const replacement = this.createReplacement(template.getStart(), template.getWidth(),
          newTemplateText);

      this.addExternalResourceFailure(template, failureMessage, replacement);
    }
  }

  /**
   * Replaces the outdated name in the template with the new one and returns an updated template.
   */
  private replaceNamesInTemplate(templateContent: string): string {
    [...elementSelectors, ...attributeSelectors].forEach(selector => {
      // Being more aggressive with that replacement here allows us to also handle inline
      // style elements. Normally we would check if the selector is surrounded by the HTML tag
      // characters.
      templateContent = replaceAll(templateContent, selector.replace, selector.replaceWith);
    });

    cssNames.forEach(name => {
      if (!name.whitelist || name.whitelist.html) {
        templateContent = replaceAll(templateContent, name.replace, name.replaceWith);
      }
    });

    inputNames.forEach(input => {
      if (input.whitelist && input.whitelist.attributes && input.whitelist.attributes.length) {
        templateContent = replaceAllInputsInElWithAttr(
            templateContent, input.replace, input.replaceWith, input.whitelist.attributes);
      }
      if (input.whitelist && input.whitelist.elements && input.whitelist.elements.length) {
        templateContent = replaceAllInputsInElWithTag(
            templateContent, input.replace, input.replaceWith, input.whitelist.elements);
      }
      if (!input.whitelist) {
        templateContent = replaceAll(templateContent, input.replace, input.replaceWith);
      }
    });

    outputNames.forEach(output => {
      if (output.whitelist && output.whitelist.attributes && output.whitelist.attributes.length) {
        templateContent = replaceAllOutputsInElWithAttr(
            templateContent, output.replace, output.replaceWith, output.whitelist.attributes);
      }
      if (output.whitelist && output.whitelist.elements && output.whitelist.elements.length) {
        templateContent = replaceAllOutputsInElWithTag(
            templateContent, output.replace, output.replaceWith, output.whitelist.elements);
      }
      if (!output.whitelist) {
        templateContent = replaceAll(templateContent, output.replace, output.replaceWith);
      }
    });

    exportAsNames.forEach(selector => {
      templateContent = replaceAll(templateContent, selector.replace, selector.replaceWith);
    });

    return templateContent;
  }
}
