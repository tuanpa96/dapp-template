import { type InstalledClock, withGlobal } from "@sinonjs/fake-timers";

class Timer {
  private static currentTimer: InstalledClock | null = null;

  private install(
    win: Window,
    pauseTimer = false,
    from: InstalledClock | null = null
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Timer.currentTimer = (win as any).__timer__ = withGlobal(win).install({
      now: from?.now || new Date(),
      shouldAdvanceTime: !pauseTimer,
    });

    this.log(
      from ? "Clock transferred from last session." : "New clock installed."
    );
  }

  /**
   * This method is to be called before all tests.
   */
  initialize() {
    Cypress.on("test:before:run", () => {
      Timer.currentTimer = null;
    });

    Cypress.on("window:load", (win) => {
      this.install(win, false, Timer.currentTimer);
    });
  }

  private get $clock(): Cypress.Chainable<InstalledClock> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return cy.window({ log: false }).then((win: any) => win.__timer__);
  }

  /**
   * Pauses the clock.
   */
  pause() {
    this.$clock.then((clock) => {
      cy.window({ log: false }).then((win) => {
        this.install(win, true, clock);
        this.log(`Clock paused at **${new clock.Date()}**.`);
      });
    });

    return this;
  }

  /**
   * Resumes the clock.
   */
  resume() {
    this.$clock.then((clock) => {
      cy.window({ log: false }).then((win) => {
        this.install(win, false, clock);
        this.log(`Clock resumed from **${new clock.Date()}**.`);
      });
    });

    return this;
  }

  /**
   * Advances the clock by `ms` milliseconds.
   */
  tick(ms: number) {
    this.$clock.then((clock) => {
      clock.tick(ms);
      this.log(`Clock ticked **${ms}ms** to **${new clock.Date()}**.`);
    });

    return this;
  }

  /**
   * Sets the clock to a specific moment.
   *
   * By default, this only changes the system time without triggering any time
   * related methods such as `setTimeout`. However if the provided `time` is in
   * the future compared to the current one, you might want to {@link tick}
   * instead. In that case, set `tickIfAdvance` to `true`.
   */
  setSystemTime(time: number | Date, tickIfAdvance = false) {
    this.$clock.then((clock) => {
      const ms = new Date(time).getTime() - clock.now;
      if (tickIfAdvance && ms > 0) {
        clock.tick(ms);
      } else {
        clock.setSystemTime(time);
        this.log(`Clock set to **${new clock.Date()}**.`);
      }
    });

    return this;
  }

  private log(message: string) {
    Cypress.log({
      message,
      name: "Timer",
    });
  }
}

export default Timer;
