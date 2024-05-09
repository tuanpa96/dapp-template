import "@testing-library/cypress/add-commands";
import "cypress-localstorage-commands";
import rpc from "./rpc";
import timer from "./timer";
import { endpoints } from "./utils";

import RenecCoreTokenListSample from "../fixtures/get-core-tokens.json";
import RenecTokenListSample from "../fixtures/renec.tokenlist.json";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      all: <T extends readonly Chainable[]>(
        ...args: T
      ) => Chainable<{
        -readonly [P in keyof T]: T[P] extends Chainable<infer S>
          ? S
          : Awaited<T[P]>;
      }>;
      navigate: (pagePath: string) => Chainable<null>;
      connectWallet: (env?: string) => Chainable<null>;
      disconnectWallet: () => Chainable<null>;
      waitTilIntercomWidgetVisible: () => Chainable<null>;
      waitTilSpinnerExits: () => Chainable<null>;
      waitTilSwapFormReady: () => Chainable<null>;
      travelToDisputableMoment: () => Chainable<null>;
      generalIntercept: (excludes?: string[]) => Chainable<null>;
      generalBondlessIntercept: (orderId: string) => Chainable<null>;
      parseFloat: (str: string) => Chainable<number>;
      toFixed: (num: number, decimal?: number) => Chainable<string>;
      assertValueCopiedToClipboard: (value: string) => Chainable<null>;
      /**
       * {@link cy.task} for retryable tasks.
       */
      retryableTask: <S = unknown>(
        event: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        arg?: any,
        options?: Partial<Loggable & Timeoutable & { maxRetries: number }>
      ) => Chainable<S>;
      generalWalletMetadataIntercept: (
        which?: "all" | ("bank" | "contact" | "kyc")[],
        matchAll?: boolean
      ) => Chainable<null>;
    }
  }
}

Cypress.Commands.add("retryableTask", (task, arg, options) => {
  const log =
    options?.log ?? true
      ? Cypress.log({
          name: "retryableTask",
          autoEnd: false,
          message: [task, arg],
          consoleProps: () => ({ task, arg, options }),
        })
      : null;
  const timeout = options?.timeout ?? Cypress.config("taskTimeout");
  const maxRetries = options?.maxRetries ?? 5;

  const firstRun = new Date();
  let retries = 0;
  let lastErrorMessage = "";

  const except = (message: string) => {
    const error = new Error(
      `${message}${
        lastErrorMessage
          ? `\n\nLast error message was:\n${lastErrorMessage}`
          : ""
      }`
    );
    log?.error(error).end();
    throw error;
  };

  const runner = () => {
    const remainingTimeout =
      timeout - (new Date().getTime() - firstRun.getTime());
    if (timeout > 0 && remainingTimeout <= 0) {
      except(
        `Timed out ${timeout}ms after ${retries} time${
          retries !== 1 ? "s" : ""
        } retrying task \`${task}\`.`
      );
    }

    if (maxRetries > 0 && retries >= maxRetries) {
      except(
        `Number of retries exceeded (maximum ${maxRetries}) for task \`${task}\`.`
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return cy
      .task(task, arg, { log: false, timeout: remainingTimeout })
      .then((result: any) => {
        if (
          !("retry" in result) ||
          !("result" in result || "error" in result)
        ) {
          except(
            "Cannot read retry metadata. Are you trying to retry a task that is not retryable?"
          );
        }

        if (result.retry === true) {
          ++retries;
          lastErrorMessage = result.error;
          log?.set("consoleProps", () => ({
            task,
            arg,
            options,
            retries,
            error: result.error,
          }));
          cy.then(runner);
        } else {
          log
            ?.set("consoleProps", () => ({
              task,
              arg,
              options,
              retries,
              yielded: result.result,
            }))
            .end();
          return cy.wrap(result.result, { log: false });
        }
      });
  };

  return runner();
});

Cypress.Commands.add("all", (...args: Cypress.Chainable[]) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = [] as any[];

  args.forEach(($arg) =>
    $arg.then((value) => {
      result.push(value);
    })
  );

  return cy.then(() => cy.wrap(result, { log: false }));
});

Cypress.Commands.add("navigate", (pagePath: string) => {
  cy.log(`navigate to ${pagePath} and wait til the spinner disappears`);
  return cy.visit(pagePath).waitTilSpinnerExits();
});

Cypress.Commands.add("connectWallet", (env?: string) => {
  const walletEnv = env || "E2E_WALLET_PRIVATE_KEY";
  cy.log(`connect the ${walletEnv} wallet`);
  rpc.wallet
    .fromCypressEnv(walletEnv)
    .bindToCypressEnv("E2E_WALLET_PRIVATE_KEY");
  cy.get(".wallet-adapter-button-wrap > button").click({ force: true }); // due the menu is hidden when scrolling down on mobile view port
  cy.get(".wallet-adapter-modal-wrapper > .MuiButtonBase-root").first().click();

  return cy.wrap(null, { log: false }) as Cypress.Chainable;
});

Cypress.Commands.add("disconnectWallet", () => {
  cy.log("disconnect the wallet");
  cy.get(".wallet-adapter-button-wrap > button").click({ force: true }); // due the menu is hidden when scrolling down on mobile view port
  cy.get(".wallet-adapter-dropdown-list").contains("Disconnect").click();

  return cy.wrap(null, { log: false }) as Cypress.Chainable;
});

Cypress.Commands.add("waitTilIntercomWidgetVisible", () => {
  cy.log("wait til the Intercom widget is visible")
    .get(".intercom-launcher")
    .should("be.visible");

  return cy.wrap(null, { log: false }) as Cypress.Chainable;
});

Cypress.Commands.add("waitTilSpinnerExits", () => {
  cy.window().then((win) => {
    if (win.location.origin === Cypress.config("baseUrl")) {
      cy.get('[data-testid="routing-spinner"]').should("not.exist");
    }
  });

  return cy.wrap(null, { log: false }) as Cypress.Chainable;
});

Cypress.Commands.add("waitTilSwapFormReady", () => {
  cy.get('[data-testid="switch-btn-loading-indicator"]').should("not.exist");

  // whether pools are fetched
  cy.get("body").should("have.attr", "is-fetching-pools", "false");

  return cy.wrap(null, { log: false }) as Cypress.Chainable;
});

Cypress.Commands.add("travelToDisputableMoment", () => {
  cy.fixture("settings.json").then((settingData) => {
    cy.log("travel to the moment that the trade is disputable");
    timer.tick((settingData.dispute_awaiting_duration_in_min + 1) * 60 * 1000);
  });

  return cy.wrap(null, { log: false }) as Cypress.Chainable;
});

Cypress.Commands.add("generalIntercept", (excludes: string[] = []) => {
  excludes.includes("getRenecTokenList") ||
    cy
      .intercept("GET", "/api/v1/tokens?*", (req) => {
        const keyword = String(req.query["keyword"] || "");
        const page = Number(req.query["page"] || "0");
        const per = Number(req.query["per"] || "0");
        const symbols = [...req.url.matchAll(/symbols%5B%5D=([^&]+)/g)].map(
          (match) => match[1].toLowerCase()
        );

        req.reply({
          items: [
            ...(req.query["token_type"] === "core"
              ? RenecCoreTokenListSample
              : RenecTokenListSample
            ).items,
          ]
            .filter(
              (item) =>
                !keyword ||
                item.token_name.toLowerCase().includes(keyword.toLowerCase()) ||
                item.token_symbol
                  .toLowerCase()
                  .includes(keyword.toLowerCase()) ||
                item.coin_address === keyword
            )
            .filter(
              (item) =>
                !symbols.length ||
                symbols.includes(item.token_symbol.toLowerCase())
            )
            .slice(per ? (page - 1) * per : 0, per ? page * per : undefined),
        });
      })
      .as("getRenecTokenList");

  excludes.includes("getIntercomUserHash") ||
    cy.intercept("GET", "/api/user-hash?**").as("getIntercomUserHash");

  excludes.includes("getRates") ||
    cy
      .intercept("GET", endpoints.rates, { fixture: "rates.json" })
      .as("getRates");

  excludes.includes("notifyOrderUpdates") ||
    cy.intercept("POST", endpoints.notifyOrderUpdates, {
      statusCode: 200,
      body: {},
    });

  excludes.includes("notifyOrderUpdates") ||
    cy
      .intercept("GET", "/api/geo", { lang: "en", info: { ip: "::1" } })
      .as("getGeoInfo");

  excludes.includes("getQuotes") ||
    cy
      .intercept("GET", "https://price.renec.foundation/api/quotes", {
        fixture: "quotes.json",
      })
      .as("getQuotes");

  excludes.includes("checkIfPaymentEvidenceUploaded") ||
    cy
      .intercept(
        "GET",
        "/api/v1/escrow_trades/**/is_payment_evidences_uploaded",
        { uploaded: false }
      )
      .as("checkIfPaymentEvidenceUploaded");

  return cy.wrap(null, { log: false }) as Cypress.Chainable;
});

Cypress.Commands.add("parseFloat", (str) => {
  return cy.task("parseFloat", str);
});

Cypress.Commands.add("toFixed", (num, numDecimal?) => {
  return cy.task("toFixed", { num, numDecimal });
});

Cypress.Commands.add("assertValueCopiedToClipboard", (value) => {
  cy.window().then((win) => {
    win.navigator.clipboard.readText().then((text) => {
      expect(text).to.eq(value);
    });
  });

  return cy.wrap(null, { log: false }) as Cypress.Chainable;
});

Cypress.Commands.add("generalBondlessIntercept", (orderId) => {
  cy.intercept("POST", endpoints.buyRequests, {
    statusCode: 201,
    body: {
      trade_id: orderId,
    },
  });
  cy.intercept("PUT", endpoints.buyRequestsDispute, {
    statusCode: 200,
    body: {
      message: `This trade #${orderId} is being disputed`,
    },
  });
  rpc.wallet.publicKey.then((publicKey) => {
    cy.intercept("GET", endpoints.buyRequestsStatus(publicKey), {
      statusCode: 201,
      body: {
        trade_id: orderId,
        buyer_wallet_address: publicKey,
        status: "awaiting",
      },
    });
  });
  return cy.wrap(null, { log: false }) as Cypress.Chainable;
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});

Cypress.Commands.add(
  "generalWalletMetadataIntercept",
  (which = "all", matchAll = false) => {
    const publicKey$ = matchAll
      ? cy.wrap("**")
      : rpc.wallet.fromCypressEnv().publicKey;

    publicKey$.then((publicKey) => {
      if (which === "all" || which.includes("bank")) {
        cy.fixture("secured-bank-info.json").then((securedBankInfo) => {
          cy.setLocalStorage(
            `${publicKey}_seller_secured_payment_info`,
            JSON.stringify(securedBankInfo)
          );
          cy.setLocalStorage(
            `${publicKey}_seller_secured_payment_info_reusd`,
            JSON.stringify(securedBankInfo)
          );
          cy.setLocalStorage(
            `${publicKey}_seller_secured_payment_info_rengn`,
            JSON.stringify(securedBankInfo)
          );
        });
      }

      if (which === "all" || which.includes("contact")) {
        cy.intercept("GET", endpoints.contactInfo(publicKey), {
          fixture: "contact-info.json",
        }).as("contactInfo");
      }

      if (which === "all" || which.includes("kyc")) {
        cy.intercept("GET", endpoints.kycVerifications(publicKey), {
          fixture: "kyc-verified.json",
        }).as("kycVerified");
      }
    });

    return cy.wrap(null, { log: false });
  }
);
