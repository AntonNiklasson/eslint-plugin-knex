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

Avoid some of the more obvious issues when it comes to SQL injection. This rule disallows any kind of interpolated string as the first argument to `.raw()`, `.whereRaw`, and `.joinRaw`.

## Development

Here's a good starting point for working with the rule in ASTExplorer:

https://astexplorer.net/#/gist/01bce73cb93c30d0a83fdc1502c129c9/2ac43132c3bbdf9ada9dcc26a55fae33bfbc2085
