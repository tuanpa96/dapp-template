// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any;

export interface HealerAttempt<Fn extends AnyFn = AnyFn> {
  args: Parameters<Fn>;
  error: Error;
  fn: Fn;
  timeTaken: number; // in ms
  when: Date;
}

export interface HealerContext<Fn extends AnyFn = AnyFn> {
  /**
   * Past attempts to retry for this error.
   */
  attempts: HealerAttempt<Fn>[];

  /**
   * This function can only be called **once** per exception thrown, unless
   * `force` is set to `true`. This is to prevent stack overflow due to
   * infinite recursive calls. You are responsible for avoiding stack errors
   * should you use force retrying.
   */
  retry(force?: boolean): void;
}

export type HealerPill = <Fn extends AnyFn>(
  context: HealerContext<Fn>
) => unknown;
export type HealerPillAsync = <Fn extends AnyFn>(
  context: HealerContext<Fn>
) => Promise<unknown>;

export interface Healer {
  <Fn extends AnyFn>(...pills: HealerPill[]): (
    fn: Fn
  ) => (...args: Parameters<Fn>) => ReturnType<Fn>;
  <Fn extends AnyFn>(...pills: (HealerPill | HealerPillAsync)[]): (
    fn: Fn
  ) => (...args: Parameters<Fn>) => Promise<Awaited<ReturnType<Fn>>>;
}

const healer = (...pills: (HealerPill | HealerPillAsync)[]) => {
  return (fn: AnyFn) => {
    const attempts: HealerAttempt<typeof fn>[] = [];
    let when = new Date();

    const healWithPill = (
      pill: (typeof pills)[number],
      error: Error,
      args: Parameters<typeof fn>
    ) => {
      const forward = (action: string) => {
        // eslint-disable-next-line no-console
        console.log(`[healer] \`${pill.name}\` ${action}, forwarding`);
        throw error;
      };

      if (!(error instanceof Error)) {
        forward("was passed an ambiguous error");
      }

      // eslint-disable-next-line no-console
      console.log(
        `[healer] \`${pill.name}\` is attempting to heal from`,
        error
      );

      attempts.push({
        args,
        error,
        fn,
        timeTaken: new Date().getTime() - when.getTime(),
        when,
      });

      let retryCalled = false;
      const cachedResult = {} as ReturnType<typeof fn>;
      let retryResult = cachedResult;

      try {
        const healResult = pill({
          attempts,
          retry(force = false) {
            if (!force && retryCalled) {
              forward("tried to `retry` twice");
            }
            retryCalled = true;
            retryResult = fn(...args);
          },
        });

        // Support async returns
        if (healResult instanceof Promise) {
          return healResult
            .then(
              () => retryResult,
              () => forward("could not heal")
            )
            .then((result) => {
              if (result === cachedResult) {
                forward("did not retry");
              }
              return result;
            });
        }

        // Support sync returns
        if (retryResult === cachedResult) {
          forward("did not retry");
        }
        return retryResult;
      } catch (_) {
        forward("could not heal");
      }
    };

    const heal = (
      pillIndex: number,
      error: Error,
      args: Parameters<typeof fn>
    ): ReturnType<typeof fn> => {
      if (pillIndex >= pills.length) {
        throw error;
      }

      when = new Date();

      try {
        const result =
          pillIndex < 0
            ? fn(...args)
            : healWithPill(pills[pillIndex], error, args);
        return result instanceof Promise
          ? result.catch((err) => heal(pillIndex + 1, err, args))
          : result;
      } catch (err) {
        return heal(pillIndex + 1, err as Error, args);
      }
    };

    return (...args: Parameters<typeof fn>) => heal(-1, new Error(), args);
  };
};

/**
 * Builds a healer to recover from thrown exceptions.
 */
export default healer as Healer;
