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

## Settings

`builderName` is optional. Without it, the rule checks every call named `raw`,
`whereRaw`, or `joinRaw`, including non-Knex calls. Set it to a regex string
(or a `RegExp` in a JS config) to filter builder names. Invalid values are
ignored, leaving all names checked.

## Rules

### `knex/avoid-injections`

Checks the first SQL argument of `raw`, `whereRaw`, and `joinRaw`:

```js
knex.raw("select * from users where id = ?", [id]); // OK: binding
knex.raw(`select * from users where id = ${id}`); // reported
```

Static strings/templates are accepted; interpolation and concatenation are
reported. For a query variable, only its initializer is checked:

```js
let query = "select * from users";
query += userInput;
knex.raw(query); // not reported: subsequent writes aren't tracked
```

Limits: parameters, imports and uninitialized variables are skipped; aliases,
control flow and computed methods (`knex["raw"]`) aren't tracked. A non-Knex
`.raw()` may be reported (false positive), while a dynamic query passed as a
parameter may be missed (false negative). This is **not** complete SQL-injection
analysis; use bindings, validation and security review too.
