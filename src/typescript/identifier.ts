import * as ts from 'typescript';

/** Resolves the symbol of the specified identifier. Ignoring alias identifiers. */
export function getSymbolOfIdentifier(node: ts.Identifier, checker: ts.TypeChecker) {
  const baseSymbol = checker.getSymbolAtLocation(node);

  if (baseSymbol.flags & ts.SymbolFlags.Alias) {
    return checker.getAliasedSymbol(baseSymbol);
  }

  return baseSymbol;
}
