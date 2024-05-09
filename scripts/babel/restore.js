module.exports = {
  presets: ["next/babel"],
  env: {
    test: {
      plugins: ["transform-class-properties", "istanbul"],
    },
  },
};
