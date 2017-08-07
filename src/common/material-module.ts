/** Name of the Angular Material module specifier. */
export const materialModulePathSegment = 'node_modules/@angular/material';


/** Whether the given TypeScript symbol includes the Material prefix. */
export function includesAngularMaterialPrefix(node: string) {
  // TODO(devversion): case specific changes
  return node.match(/^Md/i);
}
