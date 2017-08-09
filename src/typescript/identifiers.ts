import * as ts from 'typescript';

/** Returns the original symbol from an identifier. */
export function getOriginalSymbolFromIdentifier(node: ts.Identifier, checker: ts.TypeChecker) {
  const baseSymbol = checker.getSymbolAtLocation(node);

  if (baseSymbol && baseSymbol.flags & ts.SymbolFlags.Alias) {
    return checker.getAliasedSymbol(baseSymbol);
  }

  return baseSymbol;
}
