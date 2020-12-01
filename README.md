# eslint-plugin-knex

## Installation

```
npm install -D eslint-plugin-knex
yarn add --D eslint-plugin-knex
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

Avoid some of the more obvious issues when it comes to SQL injection. This rule disallows any kind of interpolated string as the first argument to `.raw()`, `.whereRaw`, and `.joinRaw`.
