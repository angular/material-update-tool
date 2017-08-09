/** Whether the given TypeScript symbol includes the Material prefix. */
export function includesAngularMaterialPrefix(node: string) {
  // TODO(devversion): case specific changes
  return node.match(/^Md/i);
}
