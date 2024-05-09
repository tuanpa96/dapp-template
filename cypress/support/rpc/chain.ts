import { toCy } from "./utils";

const getRandomId = () => (Math.random() + 1).toString(36).slice(2, 7);

export type RPCValue<T> = T | Cypress.Chainable<T> | Promise<T>;

/**
 * Holds a value and bases it on the global RPC chain. This makes sure all
 * RPC chain instances work independently.
 */
class RPCChain<T = unknown> {
  private static rpcAlias = `RPC-${getRandomId()}`;
  private static rpcStaticAliases = `RPC-${getRandomId()}`;
  private alias = `rpc-${getRandomId()}`;

  constructor($thing?: RPCValue<T>) {
    toCy($thing).as(this.alias, { type: "static" });
  }

  /**
   * Chain *const* operations on the RPC here.
   */
  get $() {
    return this.getAlias(RPCChain.rpcAlias).then(() =>
      this.getAlias<T>(this.alias)
    );
  }

  /**
   * Executes a *non-const* operation on the RPC.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  push$<R = any>(opt: (thing: T | null) => R) {
    return this.$.then((thing) => opt(thing)).as(RPCChain.rpcAlias, {
      type: "static",
    }) as Cypress.Chainable<
      R extends Cypress.Chainable<infer S>
        ? S extends void | undefined
          ? T
          : S
        : Awaited<R> extends void | undefined
        ? T
        : R
    >;
  }

  /**
   * Chain *const* operations on the static data of this RPC entity here.
   */
  protected get static$() {
    return this.getAlias(RPCChain.rpcAlias).then(() =>
      // eslint-disable-next-line @typescript-eslint/ban-types
      this.getAlias<Map<Function, string>>(
        RPCChain.rpcStaticAliases,
        new Map()
      ).then((map) => this.getAlias<T>(map.get(this.constructor) ?? ""))
    );
  }

  /**
   * Updates the static data of this RPC entity.
   */
  protected pushStatic$(
    opt: (
      thing: T | null
    ) =>
      | void
      | undefined
      | T
      | Promise<void | undefined | T>
      | Cypress.Chainable<void | undefined | T>
  ) {
    const staticId = `RPC-${getRandomId()}`;

    return this.static$
      .then((thing) => opt(thing) as T)
      .as(staticId, { type: "static" })
      .then((value) => {
        // eslint-disable-next-line @typescript-eslint/ban-types
        this.getAlias<Map<Function, string>>(
          RPCChain.rpcStaticAliases,
          new Map()
        ).then((map) => map.set(this.constructor, staticId));

        return cy.wrap(value, { log: false }); // forward subject
      });
  }

  private existsAlias(alias: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (cy as any).state("aliases")?.[alias] !== undefined;
  }

  private getAlias<T = unknown>(alias: string): Cypress.Chainable<T | null>;
  private getAlias<T = unknown>(
    alias: string,
    defaultValue: T
  ): Cypress.Chainable<T>;
  private getAlias<T = unknown>(alias: string, defaultValue = null) {
    if (!alias) {
      return cy.wrap(defaultValue, { log: false });
    }

    if (!this.existsAlias(alias)) {
      cy.wrap(defaultValue, { log: false }).as(alias, { type: "static" });
    }

    return cy.get<T>(`@${alias}`, { log: false });
  }
}

export default RPCChain;
