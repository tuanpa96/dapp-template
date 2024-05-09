export const RPL_TOKEN_LIST_ENDPOINT =
  "https://raw.githubusercontent.com/renec-chain/rpl-token-registry/master/src/tokens/renec.tokenlist.json";
export const apiBaseUrl = "/api/v1";
export const endpoints = {
  settings: `${apiBaseUrl}/settings/nemo_swap`,
  rates: "https://price.renec.foundation/api/quotes",
  notifyOrderUpdates: `${apiBaseUrl}/helper/notify-order-updates`,
  contactInfo: (address: any) => `${apiBaseUrl}/contacts?address=${address}`,
  bankInfo: (address: any) => `${apiBaseUrl}/bank_info?**address=${address}**`,
  saveContactInfo: (address: any) =>
    `${apiBaseUrl}/contacts?public_key=${address}*`,
  kycVerifications: (address: any) =>
    `${apiBaseUrl}/kyc_verifications/status?wallet_address=${address}`,
  buyRequests: `${apiBaseUrl}/buy_requests`,
  buyRequestsDispute: `${apiBaseUrl}/buy_requests/dispute`,
  buyRequestsStatus: (address: any) =>
    `${apiBaseUrl}/buy_requests/status?**buyer_wallet_address=${address}**`,
  pools: `${apiBaseUrl}/pools`,
  activatingNemoCampaigns: () => `${apiBaseUrl}/nemo_campaigns/activating`,
  escrowTradeById: (orderId: any) => `${apiBaseUrl}/escrow_trades/${orderId}`,
  trackEscrowOffer: () => `${apiBaseUrl}/escrow_offer`,
};
export const BUY_PAGE_PATH = "/orders";
export const SELL_PAGE_PATH = "/sell";
export const TRADE_PAGE_PATH = "/trade";
export const OFFER_PAGE_PATH = "/offer";
export const ARBITRATORS_PAGE_PATH = "/arbitrators";
export const QUOTA_PAGE_PATH = "/quota";
export const ASSETS_PAGE_PATH = "/assets";
