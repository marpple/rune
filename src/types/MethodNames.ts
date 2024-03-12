/* eslint-disable @typescript-eslint/no-explicit-any */
export type MethodNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

class MyClass {
  a = 1;
  b() {}
}

function aa(k: MethodNames<MyClass>) {}

// aa('a');
aa('b');

type Equals<A1, A2> =
  (<A>() => A extends A2 ? 1 : 0) extends <A>() => A extends A1 ? 1 : 0 ? 1 : 0;

type CallableObject = (...args: any[]) => any;

type Cast<A1, A2> = A1 extends A2 ? A1 : A2;

type PickFunctionKeys<O extends object> = {
  [K in keyof O]-?: {
    1: K;
    0: never;
  }[Equals<Cast<O[K], CallableObject>, CallableObject>];
}[keyof O];
