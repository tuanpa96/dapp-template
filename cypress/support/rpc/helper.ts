export const RPC_ALLOWED_TOKENS = ["RENEC", "REVND", "REUSD", "RENGN"] as const;
export type RPCAllowedToken = (typeof RPC_ALLOWED_TOKENS)[number];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isRPCAllowedToken = (value: any): value is RPCAllowedToken => {
  return RPC_ALLOWED_TOKENS.includes(value);
};
