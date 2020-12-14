# eslint-plugin-knex

## Installation

```
npm install -D eslint-plugin-knex
yarn add -D eslint-plugin-knex
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

## Rules

### `knex/avoid-injections`

Avoid some issues related to SQL injection by disallowing plain strings as the query argument to the raw queries. Check out [the tests](https://github.com/AntonNiklasson/eslint-plugin-knex/blob/master/rules/avoid-injections.test.js) to get a sense for what is valid and not.
