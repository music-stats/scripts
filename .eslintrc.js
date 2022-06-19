module.exports = {
  "env": {
    "node": true,
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.eslint.json",
    "tsconfigRootDir": __dirname,
    "sourceType": "module",
  },
  "plugins": [
    "@typescript-eslint",
    "import",
  ],
  "rules": {
    "semi": [ "error", "always" ],
    "eqeqeq": "error",
    "comma-dangle": [ "error", "always-multiline" ],
    "array-bracket-spacing": [ "error", "never" ],
    "object-curly-spacing": [ "error", "never" ],
    "no-else-return": [ "error", { "allowElseIf": false } ],
    "no-implicit-coercion": "error",
    "no-param-reassign": "error",

    "@typescript-eslint/explicit-function-return-type": [
      "error",
      { "allowExpressions": true },
    ],
    "@typescript-eslint/member-ordering": "error",
    "@typescript-eslint/no-explicit-any": "error",

    "import/newline-after-import": "error",
  },
  "settings": {
    "import/resolver": {
      "typescript": {},
    }
  },
}
