/**
 * TSLint custom walker implementation that also visits external and inline templates.
 */
import {RuleWalker} from 'tslint';
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

  protected visitDirectiveCallExpression(callExpression: ts.CallExpression) {
    const directiveMetadata = callExpression.arguments[0] as ts.ObjectLiteralExpression;

    for (const property of directiveMetadata.properties as ts.PropertyAssignment[]) {
      const propertyName = property.name.getText();

      if (propertyName === 'template') {
        this.visitInlineTemplate(property.initializer as ts.StringLiteral)
      }

      if (propertyName === 'templateUrl') {
        // TODO: external
      }
    }
  }


  protected visitInlineTemplate(template: ts.StringLiteral) {}
}
