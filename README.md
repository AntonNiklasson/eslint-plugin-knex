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
  }
}
```

## Settings

You can configure what names you intend to use for the knex client. Make sure to
include the library itself (`knex`), but also transaction variables (`trx`,
`transaction`).

```
{
  "settings": {
    "knex": {
      "builderName": "^(knex|transaction)$"
    }
  }
}
```

`builderName` accepts a regular-expression string (or a `RegExp` in JavaScript
configs). Invalid patterns or other values are ignored, so the rule checks all
raw-query calls as it does without this setting.

## Testing

Run `pnpm test:eslint` to test the full rule suite against the latest ESLint 7
and 8 releases. Run `pnpm test:eslint 9 10` to try the newer versions; ESLint
9 and 10 are also included in the CI matrix. The harness installs ESLint
in temporary directories without changing local dependencies or the lockfile.
Requires Node.js 22 and npm.

## Rules

### `knex/avoid-injections`

Avoid some issues related to SQL injection by disallowing plain strings as the query argument to the raw queries. Check out [the tests](https://github.com/AntonNiklasson/eslint-plugin-knex/blob/main/rules/avoid-injections.test.js) to get a sense for what is valid and not.
