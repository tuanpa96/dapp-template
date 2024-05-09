import { defineConfig } from "cypress";

import * as tasks from "./src/utils/cypress-support";
import { buildTasksObject } from "./src/utils/cypress-support/utils";

const globalConfig: Cypress.ConfigOptions = {
  blockHosts: [
    "*.google-analytics.com",
    "*.rollbar.com",
    "*.googleapis.com",
    "*.googletagmanager.com",
    "*.amplitude.com",
    "*.intercom.io",
  ],
  defaultCommandTimeout: 60000,
  env: {
    E2E_WALLET_PRIVATE_KEY: process.env.CYPRESS_E2E_WALLET_PRIVATE_KEY,
    CYPRESS_TREASURY_PRIVATE_KEY: process.env.CYPRESS_TREASURY_PRIVATE_KEY,
    codeCoverage: {
      // At end of run, call this endpoint to retrieve code coverage info from the backend
      // and combine with coverage info from frontend code executed in the browser
      url: "http://localhost:3000/api/__coverage__",
    },
  },
  setupNodeEvents(on, config) {
    // eslint-disable-next-line
    require("cypress-fail-fast/plugin")(on, config);
    // eslint-disable-next-line
    require("cypress-split")(on, config);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("@cypress/code-coverage/task")(on, config);

    on(
      "task",
      buildTasksObject({
        tasks,
        retryables: [] as const,
        pills: [],
      })
    );

    return config;
  },
  video: false,
};

export default defineConfig({
  e2e: {
    ...globalConfig,
    baseUrl: "http://localhost:3000",
    viewportWidth: 375,
    viewportHeight: 600,
  },

  component: {
    ...globalConfig,
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
    setupNodeEvents(on, config) {
      globalConfig.setupNodeEvents?.(on, config);

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const webpackPreprocessor = require("@cypress/webpack-batteries-included-preprocessor");
      on(
        "file:preprocessor",
        webpackPreprocessor({ typescript: "typescript" })
      );

      return config;
    },
  },
});
