module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  extends: ["eslint:recommended"],
  ignorePatterns: ["dist", "node_modules"],
  rules: {}
};
