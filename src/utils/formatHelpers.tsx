export function formatBalance(value: number | string, fixed = 5) {
  return parseFloat(Number(value).toFixed(fixed));
}

export const formatAddressDisplay = (address: string, numberShow?: number) => {
  if (address.length <= 8) return address;
  const sliceNumber = numberShow || 4;

  return address
    .slice(0, sliceNumber)
    .concat("...")
    .concat(address.slice(-sliceNumber));
};
