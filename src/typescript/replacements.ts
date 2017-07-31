/** Interface that describes a replacement for a TypeScript source file. */
export interface Replacement {
  start: number;
  end: number;
  text: string;
}

/** Updates the specified source file text with all specified replacements. */
export function updateSourceFileText(sourceFileText: string, replacements: Replacement[]) {
  for (const {start, end, text} of replacements.reverse()) {
    sourceFileText = sourceFileText.slice(0, start) + text + sourceFileText.slice(end)
  }

  return sourceFileText;
}
