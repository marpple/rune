import _isIterable from './_isIterable';

export default function* _toIterator<T>(list: Iterable<T> | ArrayLike<T>): IterableIterator<T> {
  if (_isIterable(list)) {
    yield* list;
  } else {
    for (let i = 0; i < list.length; i++) {
      yield list[i];
    }
  }
}
