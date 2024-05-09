import RPCChain, { RPCValue } from "./chain";
import { isRPCAllowedToken, type RPCAllowedToken } from "./helper";
import RPCLookup from "./lookup";
import RPCOffer from "./offer";
import RPCToken from "./token";
import RPCTrade from "./trade";
import { m, pkf, skf, toCy } from "./utils";

export type RPCWalletBalances = Record<RPCAllowedToken, number> & {
  [mintAddress: string]: number;
};

class RPCWallet extends RPCChain<string> {
  static get treasury() {
    return new RPCWallet(cy.task("getTreasuryPrivKey"));
  }

  get treasury() {
    return RPCWallet.treasury;
  }

  get privateKey() {
    return this.$.then((privKey) => privKey || "");
  }

  get publicKey() {
    return this.privateKey.then((privKey) =>
      privKey ? cy.task("getPublicKey", privKey, { log: false }) : ""
    ) as Cypress.Chainable<string>;
  }

  get balances() {
    const proxy = (balances: object) => {
      return new Proxy(balances, {
        get(target, p, receiver) {
          // target: { RENEC: number, [mintAddress]: number }
          // p: RPCAllowedToken | string
          // -> Turn p to RENEC if p is mint address of RENEC
          // -> Turn p from RPCAllowedToken to mint address unless p is RENEC
          p = RPCToken.i[p as RPCAllowedToken]?.mintAddress || p;
          p = p === RPCToken.i.RENEC.mintAddress ? "RENEC" : p;

          if (!Object.prototype.hasOwnProperty.call(target, p)) {
            return 0;
          }

          return Number(Reflect.get(target, p, receiver));
        },
      }) as RPCWalletBalances;
    };

    return this.publicKey
      .then((pubKey) => (pubKey ? cy.task("getBalances", pubKey) : {}))
      .then(proxy);
  }

  /**
   * {@link RPCTrade} chain using this wallet.
   */
  get trading() {
    return new RPCTrade(this);
  }

  /**
   * {@link RPCOffer} chain using this wallet.
   */
  get offering() {
    return new RPCOffer(this);
  }

  /**
   * Switches to a wallet.
   *
   * If `privKey` is not provided or empty, a new wallet will be generated.
   */
  wallet(privKey?: RPCValue<string>) {
    return new RPCWallet(
      toCy(privKey).then((privKey: string) =>
        privKey
          ? cy.wrap(privKey, { log: false })
          : cy.task<string>("generateNewKey").then((newPrivKey) => {
              this.log(m("GENERATE", { WALLET: skf(newPrivKey) }));
              RPCLookup.of(RPCWallet).set(
                newPrivKey,
                new RPCWallet(newPrivKey)
              );
              return cy.wrap(newPrivKey, { log: false });
            })
      )
    );
  }

  /**
   * Generates a new wallet.
   *
   * @alias `.wallet()`
   */
  generate() {
    return this.wallet();
  }

  /**
   * Returns the current wallet if existing, otherwise generate a new one.
   *
   * @alias `.wallet(.privateKey)`
   */
  fill() {
    return this.wallet(this.privateKey);
  }

  /**
   * Stores private key to Cypress env.
   *
   * Defaults to `E2E_WALLET_PRIVATE_KEY`.
   */
  bindToCypressEnv(env = "E2E_WALLET_PRIVATE_KEY") {
    this.push$((privKey) => {
      if (Cypress.env(env) !== privKey) {
        Cypress.env(env, privKey);

        this.log(m("ENV", { [env]: privKey }));

        if (env === "E2E_WALLET_PRIVATE_KEY") {
          this.log(
            `The app uses the \`${env}\` env to decide which wallet it should connect to, so to make sure it receives the value you just set, I will do a reload.`
          );
          if (Cypress.testingType === "e2e") {
            cy.reload();
          }
        }
      }
    });

    return this;
  }

  /**
   * Loads private key from Cypress env.
   *
   * Defaults to `E2E_WALLET_PRIVATE_KEY`.
   */
  fromCypressEnv(env = "E2E_WALLET_PRIVATE_KEY") {
    return this.wallet(
      this.privateKey.then((privKey) => Cypress.env(env) || privKey)
    );
  }

  /**
   * @deprecated
   *
   * Consider providing a list of tokens, or using {@link request} or
   * {@link reserve} to avoid excessive requesting. Use this only if you
   * need ALL default tokens.
   */
  requestAirdrop(): this;
  /**
   * Reserves a default amount for each token. To request a custom amount, use
   * {@link request} instead. To reserve a custom amount, use {@link reserve}
   * instead.
   */
  requestAirdrop(tokenNames: RPCAllowedToken[]): this;
  requestAirdrop(tokenNames?: RPCAllowedToken[]) {
    this.push$(() => {
      this.publicKey.then((pubKey) => {
        if (!pubKey) {
          throw new Error(
            "No wallet was provided for requesting airdrop. Switch to one first!"
          );
        }

        cy.task("requestAirdrop", {
          pubKey,
          tokenNames,
        }).then(() => {
          this.log(
            m("AIRDROP", { WALLET: pkf(pubKey), TOKENS: tokenNames ?? "ALL" })
          );
        });
      });
    });

    return this;
  }

  /**
   * Requests an amount of token from the treasury.
   */
  request(amount: number, token: RPCAllowedToken) {
    this.push$(() => {
      this.publicKey.then((toPubKey) => {
        if (!toPubKey) {
          throw new Error(
            "No wallet was provided for requesting token. Switch to one first!"
          );
        }

        cy.task("transferToken", {
          amount,
          token,
          toPubKey,
        }).then(() => {
          this.log(
            m("REQUEST", {
              AMOUNT: amount,
              TOKEN: token,
              WALLET: pkf(toPubKey),
            })
          );
        });
      });
    });

    return this;
  }

  /**
   * Deposits an amount of token to another wallet.
   */
  deposit(
    toWallet: RPCWallet,
    amount: number,
    token: RPCAllowedToken | RPCToken
  ) {
    this.push$((fromPrivKey) => {
      if (!fromPrivKey) {
        throw new Error(
          "No wallet was provided for depositing token. Switch to one first!"
        );
      }

      this.reserve(1e-5, "RENEC");

      toWallet.publicKey.then((toPubKey) => {
        const $ =
          token instanceof RPCToken
            ? cy
                .all(token.decimals, token.mintAddress)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .then(
                  ([decimals, mintAddress]) =>
                    ({ decimals, mintAddress } as any)
                )
            : cy.wrap(token, { log: false });

        $.then((token) => {
          cy.task("transferToken", {
            fromPrivKey,
            amount,
            token,
            toPubKey,
          }).then(() => {
            this.log(
              m("DEPOSIT", {
                FROM: skf(fromPrivKey),
                TO: pkf(toPubKey),
                AMOUNT: amount,
                TOKEN: typeof token === "string" ? token : token.mintAddress,
              })
            );
          });
        });
      });
    });

    return this;
  }

  /**
   * Reserves a *safe* RENEC amount to pay all kinds of fees. Note that this
   * amount might not suffice in cases where RENEC itself is being traded.
   *
   * This should only be used if it is not sure how much fee would be incurred
   * in a transaction. If the information is known, use {@link reserve}
   * instead.
   */
  reserveFees() {
    return this.reserve(1, "RENEC");
  }

  /**
   * Reserves at least an amount of token in the wallet.
   */
  reserve(amount: number, token: RPCAllowedToken | RPCToken): this;
  /**
   * Reserves at least a number of tokens with given amounts in the wallet.
   */
  reserve(...tokens: [number, RPCAllowedToken | RPCToken][]): this;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reserve(...args: any[]) {
    if (args.length === 2 && typeof args[0] === "number") {
      args = [[args[0], args[1]]];
    }

    args = args.reduce((arr, [requested, token], index) => {
      if (isRPCAllowedToken(token)) {
        arr.push([requested, new RPCToken()[token]]);
      } else if (token instanceof RPCToken) {
        arr.push([requested, token]);
      } else {
        this.log(
          `Skipping unknown token at index **${index}** requesting **${requested}**.`
        );
      }
      return arr;
    }, []);

    this.push$(() => {
      cy.all(this.privateKey, this.balances).then(([privKey, balances]) => {
        if (!privKey) {
          throw new Error(
            "No wallet was specified for reserving token. Switch to one first!"
          );
        }

        cy.all(
          ...args.map(([required, token]) =>
            cy
              .all(token.name, token.mintAddress)
              .then(([name, mintAddress]) => ({
                required,
                token,
                name,
                mintAddress,
              }))
          )
        ).then((args) => {
          const groupedArgs = args.reduce((arr, curr) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const item = arr.find(
              (value: any) => value.mintAddress === curr.mintAddress
            );
            if (item) {
              item.required += curr.required;
            } else {
              arr.push(curr);
            }
            return arr;
          }, [] as typeof args);

          for (const { required, token, name, mintAddress } of groupedArgs) {
            if (name === "Unknown") {
              const current = balances[mintAddress];
              const needToRequest = required - current;

              if (needToRequest > 0) {
                this.log(
                  m("TO_MINT", {
                    AMOUNT: needToRequest,
                    TOKEN: mintAddress,
                    REQUIRED: required,
                    CURRENT: current,
                  })
                );

                token.mintTo(this, needToRequest);
              }
            } else {
              const current = balances[name];
              const needToRequest = required - current;

              if (needToRequest > 0) {
                this.log(
                  m("TO_REQUEST", {
                    AMOUNT: needToRequest,
                    TOKEN: name,
                    REQUIRED: required,
                    CURRENT: current,
                  })
                );

                this.request(needToRequest, name);
              }
            }
          }
        });
      });
    });

    return this;
  }

  private log(message: string) {
    Cypress.log({
      message,
      name: "RPCWallet",
    });
  }
}

export default RPCWallet;
