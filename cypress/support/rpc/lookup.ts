import isEqual from "lodash/isEqual";

import RPCChain, { RPCValue } from "./chain";
import { toCy } from "./utils";

/**
 * Global entity-based key-value storage for created RPC entities.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class RPCLookup<E extends object> extends RPCChain<[unknown, E][]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private ctor?: { new (...args: any[]): E }) {
    super();
  }

  /**
   * Constructs a lookup map of only values having the entity.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static of<E extends object>(ctor: { new (...args: any[]): E }) {
    return new RPCLookup(ctor);
  }

  /**
   * Constructs a lookup map of only values having the entity.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  of<E extends object>(ctor: { new (...args: any[]): E }) {
    return RPCLookup.of(ctor);
  }

  private get map() {
    return this.static$.then((arr) => new Map(this.filterByCtor(arr ?? [])));
  }

  get size() {
    return this.map.then((map) => map.size);
  }

  entries() {
    return this.map.then((map) => [...map.entries()]);
  }

  keys() {
    return this.map.then((map) => [...map.keys()]);
  }

  values() {
    return this.map.then((map) => [...map.values()]);
  }

  has(key: unknown) {
    return this.map.then((map) => map.has(key));
  }

  get(key: unknown) {
    return this.map.then((map) =>
      map.has(key) ? { value: map.get(key) } : {}
    );
  }

  set(key: unknown, value: E) {
    this.pushStatic$((arr) => [
      ...(arr ?? []).filter(
        (item) => !this.ofCtor(item) || !isEqual(item[0], key)
      ),
      [key, value],
    ]);

    return this;
  }

  delete(key: unknown) {
    this.pushStatic$((arr) =>
      (arr ?? []).filter((item) => !this.ofCtor(item) || !isEqual(item[0], key))
    );

    return this;
  }

  /**
   * Same as `.entries().then(.filter())` but supports returning `Chainable`
   * from predicate function.
   */
  filter(pred: (entry: [unknown, E]) => RPCValue<boolean>) {
    return this.entries().then((entries) => {
      cy.all(...entries.map((entry) => toCy(pred(entry)))).then((allPreds) =>
        entries.filter((_, index) => allPreds[index])
      );
    });
  }

  private ofCtor(item: [unknown, unknown]): item is [unknown, E] {
    return !this.ctor || item[1] instanceof this.ctor;
  }

  private filterByCtor(arr: [unknown, unknown][]) {
    return arr.filter((item) => this.ofCtor(item)) as [unknown, E][];
  }
}

export default RPCLookup;
