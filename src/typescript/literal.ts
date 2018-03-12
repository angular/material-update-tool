import * as ts from 'typescript';

/** Returns the text of a string literal without the quotes. */
export function getLiteralTextWithoutQuotes(literal: ts.StringLiteral) {
  return literal.getText().substring(1, literal.getText().length - 1);
}

/** Method that can be used to replace all search occurrences in a string. */
export function replaceAll(str: string, search: string, replacement: string) {
  while (str.indexOf(search) !== -1) {
    str = str.replace(search, replacement);
  }
  return str;
}

export function replaceAllInputsInElWithTag(html: string, oldName: string, newName: string,
                                            tagNames: string[]) {
  return replaceAllIoInElWithTag(
      html, oldName, newName, tagNames, String.raw`\[?`, String.raw`\]?`);
}

export function replaceAllOutputsInElWithTag(html: string, oldName: string, newName: string,
                                             tagNames: string[]) {
  return replaceAllIoInElWithTag(html, oldName, newName, tagNames, String.raw`\(`, String.raw`\)`);
}

/**
 * Method that can be used to rename all occurrences of an `@Input()` in a HTML string that occur
 * inside an element with any of the given attributes. This is useful for replacing an `@Input()` on
 * a `@Directive()` with an attribute selector.
 */
export function replaceAllInputsInElWithAttr(html: string, oldName: string, newName: string,
                                             attrs: string[]) {
  return replaceAllIoInElWithAttr(html, oldName, newName, attrs, String.raw`\[?`, String.raw`\]?`);
}

/**
 * Method that can be used to rename all occurrences of an `@Output()` in a HTML string that occur
 * inside an element with any of the given attributes. This is useful for replacing an `@Output()`
 * on a `@Directive()` with an attribute selector.
 */
export function replaceAllOutputsInElWithAttr(html: string, oldName: string, newName: string,
                                              attrs: string[]) {
  return replaceAllIoInElWithAttr(html, oldName, newName, attrs, String.raw`\(`, String.raw`\)`);
}

function replaceAllIoInElWithTag(html:string, oldName: string, newName: string, tagNames: string[],
                                 startIoPattern: string, endIoPattern: string) {
  const skipPattern = String.raw`[^>]*\s`;
  const openTagPattern = String.raw`<\s*`;
  const tagNamesPattern = String.raw`(?:${tagNames.join('|')})`;
  const replaceIoPattern = String.raw`
      (${openTagPattern}${tagNamesPattern}\s(?:${skipPattern})?${startIoPattern})
      ${oldName}
      (${endIoPattern}[=\s>])`;
  const replaceIoRegex = new RegExp(replaceIoPattern.replace(/\s/g, ''), 'g');
  return html.replace(replaceIoRegex, (_, prefix, suffix) => `${prefix}${newName}${suffix}`);
}

function replaceAllIoInElWithAttr(html: string, oldName: string, newName: string, attrs: string[],
                                  startIoPattern: string, endIoPattern: string) {
  const skipPattern = String.raw`[^>]*\s`;
  const openTagPattern = String.raw`<\s*\S`;
  const attrsPattern = String.raw`(?:${attrs.join('|')})`;
  const inputAfterAttrPattern = String.raw`
    (${openTagPattern}${skipPattern}${attrsPattern}[=\s](?:${skipPattern})?${startIoPattern})
    ${oldName}
    (${endIoPattern}[=\s>])`;
  const inputBeforeAttrPattern = String.raw`
    (${openTagPattern}${skipPattern}${startIoPattern})
    ${oldName}
    (${endIoPattern}[=\s](?:${skipPattern})?${attrsPattern}[=\s>])`;
  const replaceIoPattern = String.raw`${inputAfterAttrPattern}|${inputBeforeAttrPattern}`;
  const replaceIoRegex = new RegExp(replaceIoPattern.replace(/\s/g, ''), 'g');
  return html.replace(replaceIoRegex, (_, prefix1, suffix1, prefix2, suffix2) =>
      `${prefix1 || prefix2}${newName}${suffix1 || suffix2}`);
}
