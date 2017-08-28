import {Rules, RuleFailure} from 'tslint';
import {TemplateWalker} from '../tslint/template-walker';
import {ExternalTemplate} from '../tslint/template-file';
import {
  attributeSelectors, elementSelectors, exportAsNames,
  inputNames
} from '../material/component-data';
import * as ts from 'typescript';

/**
 * Message that is being sent to TSLint if there is something in the template that still use an
 * outdated prefix.
 */
const failureMessage = 'Template uses outdated Material prefix.';

/** Method that can be used to remove the surrounding Angular attribute brackets from a string. */
const removeAttributeBackets = (str) => str.substring(1, str.length - 1);

/**
 * Rule that walks through every string literal, which includes the outdated Material prefix and
 * is part of a call expression. Those string literals will be changed to the new prefix.
 */
export class Rule extends Rules.AbstractRule {

  apply(sourceFile: ts.SourceFile): RuleFailure[] {
    return this.applyWithWalker(new SwitchTemplatesWalker(sourceFile, this.getOptions()));
  }
}

export class SwitchTemplatesWalker extends TemplateWalker {

  visitInlineTemplate(template: ts.StringLiteral) {
    const newTemplateText = this.replacePrefixesInTemplate(template.getText());

    if (newTemplateText !== template.getText()) {
      const replacement = this.createReplacement(template.getStart(), template.getWidth(),
          newTemplateText);

      this.addFailureAtNode(template, failureMessage, replacement);
    }
  }

  visitExternalTemplate(template: ExternalTemplate) {
    const newTemplateText = this.replacePrefixesInTemplate(template.getFullText());

    if (newTemplateText !== template.getFullText()) {
      const replacement = this.createReplacement(template.getStart(), template.getWidth(),
          newTemplateText);

      this.addTemplateFailure(template, failureMessage, replacement);
    }
  }

  /**
   * Replaces the outdated prefix in the template with the new one and returns an updated template.
   */
  private replacePrefixesInTemplate(templateContent: string): string {
    elementSelectors.forEach(selector => {
      // Replace every HTMLElement with an outdated "md" prefix in the template.
      // To ensure only elements match, the leading tag opening symbol will be replaced as well.
      // Manually replacing by strings should be faster than creating a RegExp each selector.
      templateContent = templateContent.replace(`<${selector.md}`, `<${selector.mat}`);
      templateContent = templateContent.replace(`</${selector.md}`, `</${selector.mat}`);
    });

    attributeSelectors.forEach(attribute => {
      templateContent = templateContent.replace(
        removeAttributeBackets(attribute.md),
        removeAttributeBackets(attribute.mat)
      );
    });

    inputNames.forEach(input => {
      templateContent = templateContent.replace(input.md, input.mat);
    });

    exportAsNames.forEach(exportName => {
      templateContent = templateContent.replace(exportName.md, exportName.mat);
    });

    return templateContent;
  }


}
