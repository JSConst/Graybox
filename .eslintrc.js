module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  env: {
    browser: true,
    es2021: true,
    jest: true,
    node: true,
  },
  extends: [
    "plugin:jest/recommended",
    "plugin:@typescript-eslint/recommended",
    "eslint:recommended",
    "prettier",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "@typescript-eslint/no-empty-function": 0,
    "@typescript-eslint/no-unused-vars": 0,
    "no-unused-vars": 0,
    "no-constant-condition": 0,
    "linebreak-style": ["error", "unix"],
    semi: ["error", "always"],
  },
};
