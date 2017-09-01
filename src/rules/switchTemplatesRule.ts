import {Rules, RuleFailure} from 'tslint';
import {
  attributeSelectors, elementSelectors, exportAsNames, inputNames, removeAttributeBackets
} from '../material/component-data';
import {ComponentWalker} from '../tslint/component-walker';
import {ExternalResource} from '../tslint/component-file';
import * as ts from 'typescript';
import {replaceAll} from '../typescript/literal';

/**
 * Message that is being sent to TSLint if there is something in the template that still use an
 * outdated prefix.
 */
const failureMessage = 'Template uses outdated Material prefix.';

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
    const newTemplateText = this.replacePrefixesInTemplate(template.getText());

    if (newTemplateText !== template.getText()) {
      const replacement = this.createReplacement(template.getStart(), template.getWidth(),
          newTemplateText);

      this.addFailureAtNode(template, failureMessage, replacement);
    }
  }

  visitExternalTemplate(template: ExternalResource) {
    const newTemplateText = this.replacePrefixesInTemplate(template.getFullText());

    if (newTemplateText !== template.getFullText()) {
      const replacement = this.createReplacement(template.getStart(), template.getWidth(),
          newTemplateText);

      this.addExternalResourceFailure(template, failureMessage, replacement);
    }
  }

  /**
   * Replaces the outdated prefix in the template with the new one and returns an updated template.
   */
  private replacePrefixesInTemplate(templateContent: string): string {
    elementSelectors.forEach(selector => {
      templateContent = templateContent.replace(
          new RegExp(`(</?)${selector.md}`, 'g'), `$1${selector.mat}`);
    });

    attributeSelectors.forEach(attribute => {
      templateContent = replaceAll(templateContent,
          removeAttributeBackets(attribute.md), removeAttributeBackets(attribute.mat));
    });

    [...inputNames, ...exportAsNames].forEach(selector => {
      templateContent = replaceAll(templateContent, selector.md, selector.mat);
    });

    return templateContent;
  }


}
