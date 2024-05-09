import RPCLookup from "./lookup";
import RPCOffer from "./offer";
import RPCPool from "./pool";
import RPCPosition from "./position";
import RPCToken from "./token";
import RPCTrade from "./trade";
import RPCWallet from "./wallet";

/**
 * RPC interaction utilities for Cypress.
 */
const rpc = {
  /**
   * Starts a pool chain.
   */
  get pool() {
    return new RPCPool();
  },

  /**
   * Starts a position chain.
   */
  get position() {
    return new RPCPosition();
  },

  /**
   * Starts a token chain.
   */
  get token() {
    return new RPCToken();
  },

  /**
   * Starts a trading chain.
   */
  get trade() {
    return new RPCTrade();
  },

  /**
   * Starts a chain for offer.
   */
  get offer() {
    return new RPCOffer();
  },

  /**
   * Starts a wallet chain.
   */
  get wallet() {
    return new RPCWallet();
  },

  /**
   * Generates a wallet, binds it to `E2E_WALLET_PRIVATE_KEY`, and requests an airdrop.
   */
  prepareWallet(skipAirdrop = false, env = "E2E_WALLET_PRIVATE_KEY") {
    const wallet = rpc.wallet.generate().bindToCypressEnv(env);
    if (!skipAirdrop) {
      wallet.requestAirdrop();
    }
    return wallet;
  },

  /**
   * Retrieves the lookup map for all created RPC entities.
   *
   * @internal
   */
  get lookup() {
    return new RPCLookup();
  },
};

export default rpc;

export {
  RPCLookup,
  RPCOffer,
  RPCPool,
  RPCPosition,
  RPCToken,
  RPCTrade,
  RPCWallet,
};
