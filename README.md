# eslint-plugin-knex

[![npm version](https://badge.fury.io/js/eslint-plugin-knex.svg)](https://badge.fury.io/js/eslint-plugin-knex)

## Installation

```
npm install -D eslint-plugin-knex
pnpm add -D eslint-plugin-knex
```

## Usage

In your eslint config file:

```
{
  "plugins": ["knex"],
  "rules": {
    "knex/avoid-injections": "error"
  },
  "settings": {
    "knex": {
      "builderName": "^(knex|trx|transaction)$"
    }
  }
}
```

For ESLint 9 and 10, use `eslint.config.js` (CommonJS):

```js
const knex = require("eslint-plugin-knex");

module.exports = [
  {
    plugins: { knex },
    rules: { "knex/avoid-injections": "error" },
    settings: { knex: { builderName: "^(knex|trx|transaction)$" } },
  },
];
```

The eslintrc example above works with ESLint 7 and 8. The rule tests run
against ESLint 7, 8, 9 and 10 in CI. ESLint 8 also supports flat config via
`ESLINT_USE_FLAT_CONFIG=true`; ESLint 9+ defaults to flat config.

## Settings

`builderName` is optional. Without it, the rule checks every call using one of
the raw-query methods listed below, including non-Knex calls. Set it to a regex string
(or a `RegExp` in a JS config) to filter builder names. Invalid values are
ignored, leaving all names checked.

## Rules

### `knex/avoid-injections`

Checks the first SQL argument of `raw`, `whereRaw`, `joinRaw`, `orWhereRaw`,
`havingRaw`, `orHavingRaw`, `groupByRaw`, and `orderByRaw` by default.

**0.3.0 changes default findings:** the last five methods were not checked in
0.2.x, so upgrading may introduce new lint errors.

```js
knex.raw("select * from users where id = ?", [id]); // OK: binding
knex.raw(`select * from users where id = ${id}`); // reported
```

Static strings/templates are accepted; interpolation and concatenation are
reported. Bindings remain the safer choice. For a query variable, only its
initializer is checked:

```js
let query = "select * from users";
query += userInput;
knex.raw(query); // not reported: subsequent writes aren't tracked
```

To detect query variables modified in the same scope before the call, opt in
with `"knex/avoid-injections": ["error", { "checkQueryReassignments": true }]`.
This catches the example above while leaving static assignments and bound
parameters valid. It does not follow writes in nested functions, aliases or
control flow, and is off by default.

Limits: parameters, imports and uninitialized variables are skipped; aliases,
control flow and computed methods (`knex["raw"]`) aren't tracked. A non-Knex
`.raw()` may be reported (false positive), while a dynamic query passed as a
parameter may be missed (false negative). This is **not** complete SQL-injection
analysis; use bindings, validation and security review too.
