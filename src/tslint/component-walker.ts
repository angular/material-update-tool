/**
 * TSLint custom walker implementation that also visits external and inline templates.
 */
import {Fix, RuleFailure, RuleWalker} from 'tslint';
import {getLiteralTextWithoutQuotes} from '../typescript/literal';
import {join, dirname} from 'path';
import {createComponentFile, ExternalResource} from "./component-file";
import {readFileSync, existsSync} from 'fs'
import * as ts from 'typescript';

/**
 * Custom TSLint rule walker that identifies Angular components and visits specific parts of
 * the component metadata.
 */
export class ComponentWalker extends RuleWalker {

  protected visitInlineTemplate(template: ts.StringLiteral) {}
  protected visitInlineStylesheet(stylesheet: ts.StringLiteral) {}

  protected visitExternalTemplate(template: ExternalResource) {}
  protected visitExternalStylesheet(stylesheet: ExternalResource) {}

  visitNode(node: ts.Node) {
    if (node.kind === ts.SyntaxKind.CallExpression) {
      const callExpression = node as ts.CallExpression;
      const callExpressionName = callExpression.expression.getText();

      if (callExpressionName === 'Component' || callExpressionName === 'Directive') {
        this._visitDirectiveCallExpression(callExpression);
      }
    }

    super.visitNode(node);
  }

  private _visitDirectiveCallExpression(callExpression: ts.CallExpression) {
    const directiveMetadata = callExpression.arguments[0] as ts.ObjectLiteralExpression;

    for (const property of directiveMetadata.properties as ts.PropertyAssignment[]) {
      const propertyName = property.name.getText();
      const initializerKind = property.initializer.kind;

      if (propertyName === 'template') {
        this.visitInlineTemplate(property.initializer as ts.StringLiteral)
      }

      if (propertyName === 'templateUrl' && initializerKind === ts.SyntaxKind.StringLiteral) {
        this._reportExternalTemplate(property.initializer as ts.StringLiteral);
      }

      if (propertyName === 'styles' && initializerKind === ts.SyntaxKind.ArrayLiteralExpression) {
        this._reportInlineStyles(property.initializer as ts.ArrayLiteralExpression);
      }

      if (propertyName === 'styleUrls' && initializerKind === ts.SyntaxKind.ArrayLiteralExpression) {
        this._visitExternalStylesArrayLiteral(property.initializer as ts.ArrayLiteralExpression);
      }
    }
  }

  private _reportInlineStyles(inlineStyles: ts.ArrayLiteralExpression) {
    inlineStyles.elements.forEach(element => {
      this.visitInlineStylesheet(element as ts.StringLiteral);
    });
  }

  private _visitExternalStylesArrayLiteral(styleUrls: ts.ArrayLiteralExpression) {
    styleUrls.elements.forEach(styleUrlLiteral => {
      const styleUrl = getLiteralTextWithoutQuotes(styleUrlLiteral as ts.StringLiteral);
      const stylePath = join(dirname(this.getSourceFile().fileName), styleUrl);

      this._reportExternalStyle(stylePath);
    })
  }

  private _reportExternalTemplate(templateUrlLiteral: ts.StringLiteral) {
    const templateUrl = getLiteralTextWithoutQuotes(templateUrlLiteral);
    const templatePath = join(dirname(this.getSourceFile().fileName), templateUrl);

    // Check if the external template file exists before proceeding.
    if (!existsSync(templatePath)) {
      console.error(`PARSE ERROR: ${this.getSourceFile().fileName}:` +
        ` Could not find template: "${templatePath}".`);
      process.exit(1);
    }

    // Create a fake TypeScript source file that includes the template content.
    const templateFile = createComponentFile(templatePath, readFileSync(templatePath, 'utf8'));

    this.visitExternalTemplate(templateFile);
  }

  public _reportExternalStyle(stylePath: string) {
    // Check if the external stylesheet file exists before proceeding.
    if (!existsSync(stylePath)) {
      console.error(`PARSE ERROR: ${this.getSourceFile().fileName}:` +
        ` Could not find stylesheet: "${stylePath}".`);
      process.exit(1);
    }

    // Create a fake TypeScript source file that includes the stylesheet content.
    const stylesheetFile = createComponentFile(stylePath, readFileSync(stylePath, 'utf8'));

    this.visitExternalStylesheet(stylesheetFile);
  }

  /** Creates a TSLint rule failure for the given external resource. */
  protected addExternalResourceFailure(file: ExternalResource, message: string, fix?: Fix) {
    const ruleFailure = new RuleFailure(file, file.getStart(), file.getEnd(),
        message, this.getRuleName(), fix);

    this.addFailure(ruleFailure);
  }
}
