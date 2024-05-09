export {};

module.exports = (on: any, config: any) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("@cypress/code-coverage/task")(on, config);
  return config;
};
