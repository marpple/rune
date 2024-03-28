export function* _entries(obj) {
  for (const k in obj) yield [k, obj[k]];
}
