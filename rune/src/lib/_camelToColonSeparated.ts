export function _camelToColonSeparated(text: string) {
  return text.replace(/([a-z])([A-Z])/g, '$1:$2').toLowerCase();
}
