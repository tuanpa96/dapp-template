import RPCChain, { type RPCValue } from "./chain";
import RPCLookup from "./lookup";
import RPCOffer from "./offer";
import { m, toPromise } from "./utils";
import RPCWallet from "./wallet";

class RPCTrade extends RPCChain<string> {
  constructor(
    private wallet?: RPCWallet,
    tradeOrderId?: RPCValue<string>,
    private _offer?: RPCOffer
  ) {
    super(tradeOrderId);
  }

  get orderId() {
    return this.$.then((orderId) => orderId || "");
  }

  get offer(): RPCOffer {
    return this._offer || new RPCOffer();
  }

  get tradingAs(): RPCWallet {
    return this.wallet || new RPCWallet();
  }

  /**
   * Switches to a wallet (could be seller/buyer).
   */
  as(wallet: RPCWallet): RPCTrade {
    return new RPCTrade(wallet, this.orderId);
  }

  /**
   * Switches to an offer.
   */
  of(_offer: RPCOffer): RPCTrade {
    return new RPCTrade(this.tradingAs, this.orderId, _offer);
  }

  /**
   * Switches to a trade.
   */
  order(orderId: RPCValue<string>): RPCTrade {
    return new RPCTrade(this.wallet, orderId);
  }

  /**
   * Stores order id and trading wallet private key to Cypress env.
   *
   * Defaults to `E2E_TRADE_ORDER`.
   */
  bindToCypressEnv(env = "E2E_TRADE_ORDER") {
    this.push$(() => {
      cy.all(this.orderId, this.tradingAs.privateKey, this.offer.offerId).then(
        ([orderId, privKey, offerId]) => {
          const value = `${orderId || ""}/${privKey}/${offerId || ""}`;

          if (Cypress.env(env) !== value) {
            Cypress.env(env, value);
            this.log(m("ENV", { [env]: value }));
          }
        }
      );
    });

    return this;
  }

  /**
   * Loads order id and trading wallet private key from Cypress env.
   *
   * Defaults to `E2E_TRADE_ORDER`.
   */
  fromCypressEnv(env = "E2E_TRADE_ORDER") {
    const $env = toPromise(
      this.$.then(() => {
        const [orderId, privKey, offerId] = String(Cypress.env(env)).split("/");
        return cy.wrap([orderId, privKey, offerId], { log: false });
      })
    );

    const $orderId = $env.then((env) => env[0]);
    const $wallet = new RPCWallet($env.then((env) => env[1]));
    const $offerId = $env.then((env) => env[2]);

    return this.order($orderId)
      .as($wallet)
      .of(new RPCOffer(undefined, $offerId));
  }

  /**
   * Releases a trade order.
   */
  sellerReleases() {
    this.push$(() => {
      cy.all(this.orderId, this.tradingAs.privateKey).then(
        ([orderId, privKey]) => {
          if (!orderId) {
            throw new Error(
              "No trade order was specified for releasing. Switch to one first!"
            );
          }

          if (!privKey) {
            throw new Error(
              `No wallet was provided for releasing trade order #${orderId}. Switch to the seller wallet that created this order first!`
            );
          }

          this.tradingAs.reserve(5e-6, "RENEC");

          cy.task("sellerReleasesTrade", {
            orderId,
            privKey,
          }).then(() => {
            this.log(m("RELEASE", { ORDER: orderId }));
            RPCLookup.of(RPCTrade).delete(orderId);
          });
        }
      );
    });

    return this;
  }

  /**
   * Requests arbitration for a trade order.
   */
  buyerRequestsArbitration() {
    this.push$(() => {
      cy.all(this.orderId, this.tradingAs.privateKey).then(
        ([orderId, privKey]) => {
          if (!orderId) {
            throw new Error(
              "No trade order was specified for requesting arbitration. Switch to one first!"
            );
          }

          if (!privKey) {
            throw new Error(
              `No wallet was provided for requesting arbitration for trade order #${orderId}. Switch to the buyer wallet that joined this order first!`
            );
          }

          this.tradingAs.reserve(5e-6, "RENEC");

          cy.task("buyerRequestsArbitration", {
            orderId,
            privKey,
          }).then(() => {
            this.log(m("BUYER_DISPUTE", { ORDER: orderId }));
          });
        }
      );
    });

    return this;
  }

  /**
   * Resolves dispute of a trade order.
   */
  arbitratorResolvesDispute(action: "Cancel" | "Release" = "Cancel") {
    this.push$((orderId) => {
      if (!orderId) {
        throw new Error(
          "No trade order was specified for resolving dispute. Switch to one first!"
        );
      }

      cy.task("arbitratorResolvesDispute", { orderId, action }).then(() => {
        this.log(m("RESOLVE_DISPUTE", { ORDER: orderId, ACTION: action }));
        RPCLookup.of(RPCTrade).delete(orderId);
      });
    });

    return this;
  }

  private log(message: string) {
    Cypress.log({
      message,
      name: "RPCTrade",
    });
  }
}

export default RPCTrade;
