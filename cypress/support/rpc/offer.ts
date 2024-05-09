import RPCChain, { type RPCValue } from "./chain";
import { type RPCAllowedToken } from "./helper";
import RPCLookup from "./lookup";
import RPCToken from "./token";
import RPCTrade from "./trade";
import { m, skf, toPromise } from "./utils";
import RPCWallet from "./wallet";

class RPCOffer extends RPCChain<string> {
  constructor(private wallet?: RPCWallet, offerId?: RPCValue<string>) {
    super(offerId);
  }

  get offerId() {
    return this.$.then((offerId) => offerId || "");
  }

  get tradingAs() {
    return this.wallet || new RPCWallet();
  }

  /**
   * Switches to a wallet (could be seller/buyer).
   */
  as(wallet: RPCWallet) {
    return new RPCOffer(wallet, this.offerId);
  }

  /**
   * Switches to an offer.
   */
  offer(offerId: RPCValue<string>) {
    return new RPCOffer(this.wallet, offerId);
  }

  /**
   * Switches to a trade order.
   */
  order(tradeId: RPCValue<string>) {
    return new RPCTrade(this.tradingAs, tradeId, this);
  }

  /**
   * Stores offer id and trading wallet private key to Cypress env.
   *
   * Defaults to `E2E_OFFER`.
   */
  bindToCypressEnv(env = "E2E_OFFER") {
    this.push$((offerId) => {
      this.tradingAs.privateKey.then((privKey) => {
        const value = `${offerId || ""}/${privKey}`;

        if (Cypress.env(env) !== value) {
          Cypress.env(env, value);
          this.log(m("ENV", { [env]: value }));
        }
      });
    });

    return this;
  }

  /**
   * Loads offer id and trading wallet private key from Cypress env.
   *
   * Defaults to `E2E_OFFER`.
   */
  fromCypressEnv(env = "E2E_OFFER") {
    const $env = toPromise(
      this.$.then(() => {
        const [offerId, privKey] = String(Cypress.env(env)).split("/");
        return cy.wrap([offerId, privKey], { log: false });
      })
    );

    return this.offer($env.then((env) => env[0])).as(
      new RPCWallet($env.then((env) => env[1]))
    );
  }

  /**
   * Creates an offer. If no wallet is provided, a new one will be generated.
   */
  sellerCreatesOffer(
    amount: number,
    tokenName: RPCAllowedToken,
    bondType: "native" | "spl" = "spl",
    minTradeSize?: number
  ) {
    const token = new RPCToken()[tokenName];
    const wallet = this.tradingAs.fill().reserveFees();

    const $offerId = this.push$(() => {
      token.bondRate.then((bondRate) => {
        if (bondType === "native" && tokenName !== "RENEC") {
          token.renecRate.then((renecRate) => {
            wallet.reserve(
              [amount * bondRate * renecRate, "RENEC"],
              [amount, tokenName]
            );
          });
        } else {
          wallet.reserve(amount * (1.0 + bondRate), tokenName);
        }
      });

      return wallet.privateKey.then((privKey) =>
        cy
          .retryableTask<{ offerId: string }>("sellerCreatesOffer", {
            amount,
            privKey,
            tokenName,
            isNativeBondType: bondType === "native",
            minTradeSize: minTradeSize || 1,
          })
          .then(({ offerId }) => {
            this.log(m("CREATE", { OFFER: offerId, SELLER: skf(privKey) }));
            RPCLookup.of(RPCOffer).set(offerId, new RPCOffer(wallet, offerId));
            return cy.wrap(offerId, { log: false });
          })
      );
    });

    return this.as(wallet).offer($offerId);
  }

  /**
   * Cancels an offer.
   */
  sellerCancelsOffer() {
    this.push$(() => {
      cy.all(this.offerId, this.tradingAs.privateKey).then(
        ([offerId, privKey]) => {
          if (!offerId) {
            throw new Error(
              "No offer was specified for cancelling. Switch to one first!"
            );
          }

          if (!privKey) {
            throw new Error(
              `No wallet was provided for cancelling offer #${offerId}. Switch to the seller wallet that created this offer first!`
            );
          }

          this.tradingAs.reserve(5e-6, "RENEC");

          cy.task("sellerCancelsOffer", {
            offerId,
            privKey,
          }).then(() => {
            this.log(m("CANCEL", { OFFER: offerId }));
            RPCLookup.of(RPCOffer).delete(offerId);
          });
        }
      );
    });

    return this;
  }

  /**
   * Joins an offer.
   */
  buyerJoinsOffer(tradeAmount?: number) {
    const wallet = this.tradingAs.fill().reserveFees();

    const $tradeId = this.push$((offerId) => {
      if (!offerId) {
        throw new Error(
          "No offer was specified for joining. Switch to one first!"
        );
      }

      cy.task<object>("getTokenAmountOfTrade", offerId).then((balances) => {
        for (const [name, amount] of Object.entries(balances)) {
          wallet.reserve(amount, name as RPCAllowedToken);
        }
      });

      return wallet.privateKey.then((privKey) =>
        cy
          .retryableTask<{ tradeId: string }>("buyerJoinsOffer", {
            offerId,
            privKey,
            tradeAmount,
          })
          .then(({ tradeId }) => {
            this.log(
              m("JOIN", { OFFER: offerId, TRADE: tradeId, BUYER: skf(privKey) })
            );
            RPCLookup.of(RPCTrade).set(
              tradeId,
              new RPCTrade(wallet, tradeId, this)
            );
            return cy.wrap(tradeId, { log: false });
          })
      );
    });

    return this.as(wallet).order($tradeId);
  }

  private log(message: string) {
    Cypress.log({
      message,
      name: "RPCOffer",
    });
  }
}

export default RPCOffer;
