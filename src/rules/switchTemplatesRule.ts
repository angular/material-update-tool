import {Rules, RuleFailure} from 'tslint';
import {TemplateWalker} from '../angular/template-walker';
import * as ts from 'typescript';
import {ExternalTemplate} from '../angular/template-file';

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
    console.log('Inline Template', template.getText());
  }

  visitExternalTemplate(template: ExternalTemplate) {
    console.log('External template', template.fileName);
  }

}
