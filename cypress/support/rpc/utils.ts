import { RPCValue } from "./chain";

/**
 * Format public key for logging.
 */
export const pkf = (pubKey: string) => `PK<${pubKey}>`;

/**
 * Format secret (private) key for logging.
 */
export const skf = (privKey: string) => `SK<${privKey}`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const m = (command: string, args: Record<string, any>) => {
  return `[**${command}**] ${Object.entries(args)
    .map(
      ([key, value]) =>
        `(${key}=${value != null ? `**${JSON.stringify(value)}**` : "*none*"})`
    )
    .join("")}`.trim();
};

export const toPromise = <T>(chain: Cypress.Chainable<T>) => {
  return new Promise<T>((resolve) => {
    chain.then((value) => {
      resolve(value);
    });
  });
};

export const toCy = <T>($thing?: RPCValue<T>) => {
  return Cypress.isCy($thing)
    ? $thing
    : (cy.wrap($thing ?? null, { log: false }) as Cypress.Chainable<T>);
};
