import Decimal from "decimal.js";
import { DecimalUtil } from "@orca-so/common-sdk";
import { u64 } from "@solana/spl-token";

export const decimalDelimiter = ".";
export const thousandDelimiter = ",";

const stripInsignificantZeros = (numberValue: string) => {
  let numberString = `${numberValue}`;
  if (numberString.indexOf(decimalDelimiter) > -1) {
    numberString = numberString.replace(
      new RegExp(`\\${decimalDelimiter}?0+$`),
      ""
    );
  }
  return numberString;
};

export const formatThousandDelimiter = (
  numberString: string,
  delimiter: string
) => numberString.replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);

export const toDecimal = (number: Decimal.Value, decimal?: number) =>
  (Decimal.isDecimal(number) ? number : processDecimalNumber(`${number}`)).toDP(
    decimal != null ? decimal : 2,
    Decimal.ROUND_DOWN
  );

export const format = (
  number: Decimal.Value,
  strip: boolean,
  decimal?: number
) => {
  const [ints, decimals] = toDecimal(number, decimal)
    .toFixed()
    .split(decimalDelimiter);
  const formattedInts = formatThousandDelimiter(ints, thousandDelimiter);
  let result = formattedInts;
  if (decimals) {
    result = `${formattedInts}${decimalDelimiter}${decimals}`;
  }
  if (strip) {
    return stripInsignificantZeros(result);
  }
  return result;
};

export const formatTokenAmountWithDecimals = (
  amount: u64,
  decimal?: number
) => {
  return format(DecimalUtil.fromU64(amount, decimal).toNumber(), true, decimal);
};

export const replaceAll = (
  str: string,
  searchValue: string,
  replaceValue: string
) => {
  const regex = new RegExp(searchValue, "g");
  return str.replace(regex, replaceValue);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const castToDecimal = (value: any) => {
  try {
    return new Decimal(value);
  } catch (err) {
    return new Decimal(0);
  }
};

export const processDecimalNumber = (value: string) => {
  // remove thousand delimiters
  let processedNumber = replaceAll(value, thousandDelimiter, "");

  // if last character is a decimal delimiter, add a zero
  if (processedNumber[processedNumber.length - 1] === decimalDelimiter) {
    processedNumber = `${processedNumber}0`;
  }

  // make sure a digit exists before decimal delimiter
  const delimiterIndex = processedNumber.indexOf(decimalDelimiter);
  if (
    delimiterIndex >= 0 &&
    !processedNumber[delimiterIndex - 1]?.match(/[0-9]/)
  ) {
    processedNumber =
      processedNumber.slice(0, delimiterIndex) +
      "0" +
      processedNumber.slice(delimiterIndex);
  }

  return castToDecimal(processedNumber || 0);
};

/**
 * Similar to {@link Decimal.toDecimalPlaces}, but instead of trimming the
 * decimals down to the provided limit, this method tries to round as many
 * exceeding decimal places as possible, up to the leftmost significant digit.
 */
export const limitDecimalPlaces = (
  num: Decimal.Value,
  decimals = 0,
  rounding = Decimal.rounding
) => {
  num = castToDecimal(num);

  // If the whole part is non-zero, it itself is already significant so looking
  // at the decimal part is not necessary.
  if (!num.trunc().eq(0)) {
    return num.toDP(decimals, rounding);
  }

  const decimalPlaces = num.sub(num.trunc()).toFixed();
  const [, decimal] = decimalPlaces.split(".");

  const index = (decimal ?? "").split("").findIndex((digit) => digit !== "0");
  const newDecimals = index + 1;

  return num.toDP(Math.max(decimals, newDecimals), rounding);
};

/**
 * Converts a range decimal-sensitively without losing details.
 *
 * For example, range `[0.0021, 0.0036]` with `decimals < 3` would result in
 * `[0, 0]` if both the lower and upper ends are trimmed by decimals. Instead,
 * round both ends to the leftmost significant digits (`[0.002, 0.004]`).
 *
 * Note that the range has to be formatted in a way that it shows the *from-to*
 * relationship of the numbers. The output, therefore, might have more decimal
 * places than the provided `decimals`. For example, although `decimals = 0`,
 * an input of `[0.0001, 0.0036]` still results in `[0.000, 0.004]` (yes, with
 * trailing zeroes!), instead of `[0, 0]`.
 */
export const formatRangeByDecimal = (
  lower: Decimal.Value,
  upper: Decimal.Value,
  decimals: number
) => {
  lower = castToDecimal(lower);
  upper = castToDecimal(upper);

  if (lower.eq(upper)) {
    return [lower.toDP(decimals).toFixed(), upper.toDP(decimals).toFixed()];
  }

  if (lower.gt(upper)) {
    [lower, upper] = [upper, lower];
  }

  if (lower.mul(upper).lt(0)) {
    return [
      limitDecimalPlaces(lower, decimals).toFixed(),
      limitDecimalPlaces(upper, decimals).toFixed(),
    ];
  }

  const diff = limitDecimalPlaces(upper.sub(lower));

  if (diff.trunc().eq(0) && diff.dp() >= decimals) {
    return [
      lower.toFixed(diff.dp()), // force trailing zeroes if any!
      upper.toDP(diff.dp()).toFixed(),
    ];
  } else {
    return [lower.toDP(decimals).toFixed(), upper.toDP(decimals).toFixed()];
  }
};
