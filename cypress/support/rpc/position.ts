import RPCChain, { RPCValue } from "./chain";
import RPCLookup from "./lookup";
import RPCPool from "./pool";
import RPCToken, { IToken } from "./token";
import { m, skf, toPromise } from "./utils";
import RPCWallet from "./wallet";

class RPCPosition extends RPCChain<string> {
  constructor(
    private wallet?: RPCWallet,
    private _pool?: RPCPool,
    address?: RPCValue<string>
  ) {
    super(address);
  }

  get address() {
    return this.$.then((address) => address || "");
  }

  get pool() {
    return this._pool || new RPCPool();
  }

  get tradingAs() {
    return this.wallet || this.pool.tradingAs || new RPCWallet();
  }

  /**
   * Switches to a wallet.
   */
  as(wallet: RPCWallet) {
    return new RPCPosition(wallet, this.pool, this.address);
  }

  /**
   * Switches to a pool.
   */
  in(pool: RPCPool) {
    return new RPCPosition(this.tradingAs, pool, this.address);
  }

  /**
   * Switches to a position.
   */
  position(address: RPCValue<string>) {
    return new RPCPosition(this.tradingAs, this.pool, address);
  }

  /**
   * Stores position address, pool address, and trading wallet private key to
   * Cypress env.
   *
   * Defaults to `E2E_OPEN_POSITION`.
   */
  bindToCypressEnv(env = "E2E_OPEN_POSITION") {
    this.push$(() => {
      cy.all(this.address, this.pool.address, this.tradingAs.privateKey).then(
        ([positionAddress, poolAddress, privKey]) => {
          const value = `${positionAddress}/${poolAddress}/${privKey}`;

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
   * Loads position address, pool address, and trading wallet private key from
   * Cypress env.
   *
   * Defaults to `E2E_OPEN_POSITION`.
   */
  fromCypressEnv(env = "E2E_OPEN_POSITION") {
    const $env = toPromise(
      this.$.then(() => {
        const [positionAddress, poolAddress, privKey] = String(
          Cypress.env(env)
        ).split("/");
        return cy.wrap([positionAddress, poolAddress, privKey], { log: false });
      })
    );

    return this.position($env.then((env) => env[0]))
      .in(
        new RPCPool(
          undefined,
          $env.then((env) => env[1])
        )
      )
      .as(new RPCWallet($env.then((env) => env[2])));
  }

  /**
   * Creates a position.
   *
   * @param amount amount of `token` to be deposited to the pool
   * @param token one of the two tokens in the pool
   * @param minPriceRate rate to be applied on the current price to calculate **lower** tick
   * @param maxPriceRate rate to be applied on the current price to calculate **upper** tick
   */
  create(
    amount: number,
    token: RPCToken,
    minPriceRate = 0.85,
    maxPriceRate = 1.15
  ) {
    const wallet = this.tradingAs.fill();

    return this.as(wallet).position(
      this.push$(() =>
        cy
          .all(wallet.privateKey, this.pool.address, token.mintAddress)
          .then(([privKey, poolAddress, tokenMintAddress]) =>
            cy
              .task<{ tokenB: IToken; tokenBQuote: number }>(
                "getIncreaseLiquidityQuoteByInputTokenAmount",
                {
                  poolAddress,
                  amount,
                  tokenA: tokenMintAddress,
                  minPriceRate,
                  maxPriceRate,
                }
              )
              .then(({ tokenB, tokenBQuote }) => {
                // Orca requires 0.08-0.22 SOL for pool/position creation.
                // https://docs.orca.so/reference/pool-network-fees
                wallet.reserve(
                  [0.22, "RENEC"],
                  [amount, token],
                  [tokenBQuote, new RPCToken(tokenB)]
                );

                return cy
                  .task<string>("createPosition", {
                    poolAddress,
                    privKey,
                    tokenMintAddress,
                    amount,
                    minPriceRate,
                    maxPriceRate,
                  })
                  .then((positionAddress) => {
                    this.log(
                      m("CREATE", {
                        ADDRESS: positionAddress,
                        POOL: poolAddress,
                        OWNER: skf(privKey),
                      })
                    );

                    RPCLookup.of(RPCPosition).set(
                      positionAddress,
                      new RPCPosition(wallet, this.pool, positionAddress)
                    );

                    return cy.wrap(positionAddress, { log: false });
                  });
              })
          )
      )
    );
  }

  /**
   * Closes the current position.
   */
  close() {
    this.push$(() => {
      cy.all(this.address, this.pool.address, this.tradingAs.privateKey).then(
        ([positionAddress, poolAddress, privKey]) => {
          if (!positionAddress) {
            throw new Error(
              "No position was specified for closing. Switch to one first!"
            );
          }

          if (!privKey) {
            throw new Error(
              "No wallet was specified for closing position. Switch to the wallet that owns the position first!"
            );
          }

          this.tradingAs.reserve(1e-5, "RENEC");

          cy.task("closePosition", {
            poolAddress,
            positionAddress,
            privKey,
          }).then(() => {
            this.log(
              m("CLOSE", { ADDRESS: positionAddress, POOL: poolAddress })
            );
            RPCLookup.of(RPCPosition).delete(positionAddress);
          });
        }
      );
    });

    return this;
  }

  private log(message: string) {
    Cypress.log({
      message,
      name: "RPCPosition",
    });
  }
}

export default RPCPosition;
