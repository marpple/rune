const ESCAPE_LOOKUP: Record<string, string> = {
  '&': '\\u0026',
  '>': '\\u003e',
  '<': '\\u003c',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

export const ESCAPE_REGEX = /[&><\u2028\u2029]/g;

export function _htmlEscapeJsonString(str: string): string {
  return str.replace(ESCAPE_REGEX, (match) => ESCAPE_LOOKUP[match]);
}
