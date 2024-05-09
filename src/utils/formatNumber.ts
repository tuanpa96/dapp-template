export const truncateNumber = (number: number | string, n: number) => {
  const stringNumber: string = number.toString();
  const decimalIndex: number = stringNumber.indexOf(".");

  if (decimalIndex === -1) {
    return stringNumber;
  }

  const truncatedNumber: string = stringNumber.slice(0, decimalIndex + n + 1);
  return Number(truncatedNumber);
};
