/**
 * TSLint custom walker implementation that also visits external and inline templates.
 */
import {Fix, RuleFailure, RuleWalker} from 'tslint';
import {createTemplateFile, ExternalTemplate} from './template-file';
import {getLiteralTextWithoutQuotes} from '../typescript/literal';
import {join, dirname} from 'path';
import {readFileSync, existsSync} from 'fs'
import * as ts from 'typescript';

export class TemplateWalker extends RuleWalker {

  walk(sourceFile: ts.SourceFile) {
    super.walk(sourceFile);
  }

  visitNode(node: ts.Node) {
    if (node.kind === ts.SyntaxKind.CallExpression) {
      const callExpression = node as ts.CallExpression;
      const callExpressionName = callExpression.expression.getText();

      if (callExpressionName === 'Component' || callExpressionName === 'Directive') {
        this.visitDirectiveCallExpression(callExpression);
      }
    }

    super.visitNode(node);
  }

  private visitDirectiveCallExpression(callExpression: ts.CallExpression) {
    const directiveMetadata = callExpression.arguments[0] as ts.ObjectLiteralExpression;

    for (const property of directiveMetadata.properties as ts.PropertyAssignment[]) {
      const propertyName = property.name.getText();

      if (propertyName === 'template') {
        this.visitInlineTemplate(property.initializer as ts.StringLiteral)
      }

      if (propertyName === 'templateUrl') {
        const templateUrl = getLiteralTextWithoutQuotes(property.initializer as ts.StringLiteral);
        const templatePath = join(dirname(this.getSourceFile().fileName), templateUrl);

        // Check if the external template file exists before proceeding.
        if (!existsSync(templatePath)) {
          console.error(`PARSE ERROR: ${this.getSourceFile().fileName}:` +
              ` Could not find template: "${templatePath}".`);
          process.exit(1);
        }

        // Create a fake TypeScript source file that includes the template content.
        const templateFile = createTemplateFile(templatePath, readFileSync(templatePath, 'utf8'));

        this.visitExternalTemplate(templateFile);
      }
    }
  }

  protected visitInlineTemplate(template: ts.StringLiteral) {}

  protected visitExternalTemplate(template: ExternalTemplate) {}

  protected addTemplateFailure(template: ExternalTemplate, failureMessage: string, fix?: Fix) {
    const ruleFailure = new RuleFailure(template,template.getStart(), template.getEnd(),
        failureMessage, this.getRuleName(), fix);

    this.addFailure(ruleFailure);
  }
}
