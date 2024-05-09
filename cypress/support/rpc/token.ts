import RPCChain, { RPCValue } from "./chain";
import { RPCAllowedToken } from "./helper";
import RPCLookup from "./lookup";
import { m, pkf } from "./utils";
import RPCWallet from "./wallet";

export interface IToken {
  decimals: number;
  mintAddress: string;
}

class RPCToken extends RPCChain<IToken> {
  /**
   * Static data of built-in tokens for testing.
   */
  static get i(): Record<RPCAllowedToken, IToken> {
    return {
      RENEC: {
        decimals: 9,
        mintAddress: "So11111111111111111111111111111111111111112",
      },
      REUSD: {
        decimals: 9,
        mintAddress: "Afy8qEgeJykFziRwiCk6tnBbd3uzxMoEqn2GTNCyGN7P",
      },
      REVND: {
        decimals: 0,
        mintAddress: "DSodi59U9ZWRnVgP94VNnKamFybYpsqYj2iKL1jQF7Ag",
      },
      RENGN: {
        decimals: 0,
        mintAddress: "CHe7TGhNzxpqiW6pdVJ2H2Mw5t7yHXTNyCfzJ1WFR5Dw",
      },
    };
  }

  /**
   * Static data of built-in tokens for testing.
   *
   * @alias `RPCToken.i`
   */
  get i() {
    return RPCToken.i;
  }

  /**
   * @alias `.token(.i.RENEC)`
   */
  get RENEC() {
    return this.token(this.i.RENEC);
  }

  /**
   * @alias `.token(.i.REUSD)`
   */
  get REUSD() {
    return this.token(this.i.REUSD);
  }

  /**
   * @alias `.token(.i.REVND)`
   */
  get REVND() {
    return this.token(this.i.REVND);
  }

  /**
   * @alias `.token(.i.RENGN)`
   */
  get RENGN() {
    return this.token(this.i.RENGN);
  }

  get decimals() {
    return this.$.then((token) => token?.decimals ?? NaN);
  }

  get mintAddress() {
    return this.$.then((token) => token?.mintAddress ?? "");
  }

  /**
   * The current escrow bond rate of the token.
   */
  get bondRate() {
    return this.mintAddress.then((address) =>
      cy.task("getBondRate", address)
    ) as Cypress.Chainable<number>;
  }

  /**
   * The current token/RENEC rate in the program.
   */
  get renecRate() {
    return this.mintAddress.then((address) =>
      cy.task("fetchRenecRateOfToken", address)
    ) as Cypress.Chainable<number>;
  }

  /**
   * Returns the name if the token is an {@link RPCAllowedToken}, otherwise
   * `Unknown`.
   */
  get name() {
    return this.mintAddress.then(
      (address) =>
        Object.entries(this.i).filter(
          ([, { mintAddress }]) => mintAddress === address
        )[0]?.[0] || "Unknown"
    );
  }

  /**
   * Imports token data.
   */
  token(token: RPCValue<IToken>) {
    return new RPCToken(token);
  }

  /**
   * Stores token mint address and decimals to Cypress env.
   *
   * Defaults to `E2E_MINT_TOKEN`.
   */
  bindToCypressEnv(env = "E2E_MINT_TOKEN") {
    this.push$((token) => {
      const value = JSON.stringify(token || {});

      if (Cypress.env(env) !== value) {
        Cypress.env(env, value);
        this.log(m("ENV", { [env]: value }));
      }
    });

    return this;
  }

  /**
   * Loads token mint address and decimals from Cypress env.
   *
   * Defaults to `E2E_MINT_TOKEN`.
   */
  fromCypressEnv(env = "E2E_MINT_TOKEN") {
    return this.token(
      this.$.then(() => {
        let token = {};
        try {
          token = JSON.parse(Cypress.env(env));
        } catch (err) {
          /* empty */
        }

        return cy.wrap(token as IToken, { log: false });
      })
    );
  }

  /**
   * Creates a new token and mints it.
   *
   * @param decimals decimals of the new token (between `0` and `9`, inclusively).
   */
  create(decimals = 9) {
    return this.token(
      this.push$(() =>
        cy.task<IToken>("createToken", decimals).then((result: IToken) => {
          this.log(
            m("CREATE", {
              TOKEN: result.mintAddress,
              DECIMALS: result.decimals,
            })
          );

          RPCLookup.of(RPCToken).set(result, new RPCToken(result));

          return cy.wrap(result, { log: false });
        })
      )
    );
  }

  /**
   * Mints an arbitrary amount of the created token.
   *
   * This should only be called if token data already exists, i.e., after
   * calling `createToken` or `from`.
   */
  mintTo(toWallet: RPCWallet, amount: number) {
    this.push$(() => {
      cy.all(this.$, toWallet.publicKey).then(([token, toPubKey]) => {
        if (token?.decimals == null) {
          throw new Error("Invalid token data: No decimals.");
        }

        if (!token.mintAddress) {
          throw new Error("Invalid token data: No mint address.");
        }

        if (!toPubKey) {
          throw new Error("The provided wallet has not been initialized.");
        }

        if (amount > 0) {
          cy.task("mintToken", {
            amount,
            decimals: token.decimals,
            tokenMintAddress: token.mintAddress,
            toPubKey,
          }).then(() => {
            this.log(
              m("MINT", {
                AMOUNT: amount,
                TOKEN: token.mintAddress,
                DECIMALS: token.decimals,
                TO_WALLET: pkf(toPubKey),
              })
            );
          });
        }
      });
    });

    return this;
  }

  private log(message: string) {
    Cypress.log({
      message,
      name: "RPCToken",
    });
  }
}

export default RPCToken;
