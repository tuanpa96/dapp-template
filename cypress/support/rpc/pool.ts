import RPCChain, { RPCValue } from "./chain";
import RPCLookup from "./lookup";
import RPCPosition from "./position";
import RPCToken, { IToken } from "./token";
import { m } from "./utils";
import RPCWallet from "./wallet";

class RPCPool extends RPCChain<string> {
  constructor(private wallet?: RPCWallet, address?: RPCValue<string>) {
    super(address);
  }

  get address() {
    return this.$.then((address) => address || "");
  }

  get tokenA() {
    return new RPCToken(
      this.address.then((address) => {
        if (!address) {
          throw new Error(
            "No pool address was provided for retrieving tokenAInfo."
          );
        }

        return cy
          .task<{ tokenA: IToken }>("getTokensOfPool", { poolAddress: address })
          .then(({ tokenA }) => tokenA);
      })
    );
  }

  get tokenB() {
    return new RPCToken(
      this.address.then((address) => {
        if (!address) {
          throw new Error(
            "No pool address was provided for retrieving tokenBInfo."
          );
        }

        return cy
          .task<{ tokenB: IToken }>("getTokensOfPool", { poolAddress: address })
          .then(({ tokenB }) => tokenB);
      })
    );
  }

  get tradingAs() {
    return this.wallet || new RPCWallet();
  }

  /**
   * {@link RPCPosition} chain using the current pool and wallet.
   */
  get position() {
    return new RPCPosition(this.tradingAs, this);
  }

  /**
   * Switches to a wallet.
   */
  as(wallet: RPCWallet) {
    return new RPCPool(wallet, this.address);
  }

  /**
   * Switches to a pool.
   */
  pool(address: RPCValue<string>) {
    return new RPCPool(this.wallet, address);
  }

  /**
   * Stores pool address to Cypress env.
   *
   * Defaults to `E2E_POOL_ADDRESS`.
   */
  bindToCypressEnv(env = "E2E_POOL_ADDRESS") {
    this.push$((address) => {
      if (Cypress.env(env) !== address) {
        Cypress.env(env, address);
        this.log(m("ENV", { [env]: address }));
      }
    });

    return this;
  }

  /**
   * Loads pool address from Cypress env.
   *
   * Defaults to `E2E_POOL_ADDRESS`.
   */
  fromCypressEnv(env = "E2E_POOL_ADDRESS") {
    return this.pool(
      this.address.then((address) => Cypress.env(env) || address)
    );
  }

  /**
   * Creates a new pool.
   */
  create(tokenA: RPCToken, tokenB: RPCToken, priceBToA: number) {
    return this.pool(
      this.push$(() =>
        cy
          .all(
            tokenA.decimals,
            tokenA.mintAddress,
            tokenB.decimals,
            tokenB.mintAddress
          )
          .then(
            ([
              tokenADecimals,
              tokenAMintAddress,
              tokenBDecimals,
              tokenBMintAddress,
            ]) =>
              cy
                .task<string>("createPool", {
                  priceBToA,
                  tokenA: {
                    mintAddress: tokenAMintAddress,
                    decimals: tokenADecimals,
                  },
                  tokenB: {
                    mintAddress: tokenBMintAddress,
                    decimals: tokenBDecimals,
                  },
                })
                .then((poolAddress: string) => {
                  this.log(
                    m("CREATE", {
                      POOL: poolAddress,
                      A: tokenAMintAddress,
                      B: tokenBMintAddress,
                    })
                  );

                  RPCLookup.of(RPCPool).set(
                    poolAddress,
                    new RPCPool(this.tradingAs, poolAddress)
                  );

                  return cy.wrap(poolAddress, { log: false });
                })
          )
      )
    );
  }

  /**
   * Finds the pool with the token pair.
   */
  find(tokenA: RPCToken, tokenB: RPCToken) {
    return this.pool(
      cy
        .all(tokenA.mintAddress, tokenB.mintAddress)
        .then(([tokenAMintAddress, tokenBMintAddress]) =>
          cy.task("findPoolWithTokenPair", {
            tokenAMintAddress,
            tokenBMintAddress,
          })
        )
    );
  }

  /**
   * Executes a swap on the current pool.
   *
   * Please make sure the pool has excessive liquidity before swapping.
   */
  swap(amount: number, token: RPCToken) {
    const wallet = this.tradingAs.fill();

    this.push$(() => {
      cy.all(this.address, wallet.privateKey, token.mintAddress).then(
        ([poolAddress, privKey, tokenMintAddress]) => {
          if (!poolAddress) {
            throw new Error(
              "No pool address was provided for executing this swap. Use `.pool` to switch to one, or `.find` to search for a pool with a given token pair first!"
            );
          }

          // Orca recommends at least 0.05 RENEC before swapping.
          // https://docs.orca.so/new-orca-for-traders/master#what-does-not-enough-sol-mean
          wallet.reserve([0.05, "RENEC"], [amount, token]);

          cy.task("swap", {
            poolAddress,
            privKey,
            tokenMintAddress,
            amount,
          }).then(() => {
            this.log(
              m("SWAP", {
                AMOUNT: amount,
                TOKEN: tokenMintAddress,
                POOL: poolAddress,
              })
            );
          });
        }
      );
    });

    return this.as(wallet);
  }

  private log(message: string) {
    Cypress.log({
      message,
      name: "RPCPool",
    });
  }
}

export default RPCPool;
