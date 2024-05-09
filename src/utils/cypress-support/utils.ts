import Decimal from "decimal.js";

import { DecimalUtil } from "@orca-so/common-sdk";

import { format, processDecimalNumber } from "../helpers.number";
import healer, { HealerPill, HealerPillAsync } from "./healer";

export type TFormatNumber = {
  num: number | string;
  numDecimal?: number;
};

export const parseFloat = (str: string) => processDecimalNumber(str).toNumber();

export const toFixed = ({ num, numDecimal }: TFormatNumber) =>
  format(num, true, numDecimal);

export const toU64 = (number: number, decimals = 0) =>
  DecimalUtil.toU64(new Decimal(number).toDP(decimals), decimals);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RetryableReturnType<R = any> =
  | { retry: false; result: R }
  | { retry: true; error: any };

/**
 * Wraps a task function to be called from `cy.retryableTask`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const retryable = <R, Fn extends (...args: any[]) => R | Promise<R>>(
  fn: Fn
) => {
  const toErrorMessage = (reason: Error) =>
    `> ${reason.message}\n\nStack trace:\n${reason.stack}`;

  return (
    ...args: Parameters<Fn>
  ): Promise<RetryableReturnType<R>> | RetryableReturnType<R> => {
    try {
      const result = fn(...args);
      return result instanceof Promise
        ? result.then(
            (result) => ({ retry: false, result }),
            (reason) => ({ retry: true, error: toErrorMessage(reason) })
          )
        : { retry: false, result };
    } catch (error) {
      return { retry: true, error: toErrorMessage(error as Error) };
    }
  };
};

/**
 * Recomposes the list of tasks by turning some into {@link retryable}s and
 * attach {@link healer}s to all.
 */
export const buildTasksObject = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Tasks extends Record<string, (...args: any[]) => any>,
  Retryables extends readonly (string & keyof Tasks)[]
>({
  tasks,
  retryables = [] as unknown as Retryables,
  pills = [],
}: {
  tasks: Tasks;
  retryables?: Retryables;
  pills?: (HealerPill | HealerPillAsync)[];
}): Omit<Tasks, Retryables[number]> & {
  [Task in Retryables[number]]: (
    ...args: Parameters<Tasks[Task]>
  ) => ReturnType<Tasks[Task]> extends Promise<infer R>
    ? Promise<RetryableReturnType<R>>
    : RetryableReturnType<ReturnType<Tasks[Task]>>;
} => {
  const withHealer = healer(...pills);

  return Object.fromEntries(
    Object.entries(tasks).map(([task, fn]) => [
      task,
      withHealer(retryables.includes(task) ? retryable(fn) : fn),
    ])
  ) as Tasks;
};
