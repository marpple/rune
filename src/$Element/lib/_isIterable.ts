function _isIterable(a: any): a is Iterable<unknown> {
  return typeof a?.[Symbol.iterator] === 'function';
}

export default _isIterable;
