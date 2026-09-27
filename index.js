const { version } = require("./package.json");

const plugin = {
  meta: { name: "eslint-plugin-knex", version },
  rules: {
    "avoid-injections": require("./rules/avoid-injections"),
  },
};

plugin.configs = {
  "flat/recommended": {
    plugins: { knex: plugin },
    rules: { "knex/avoid-injections": "error" },
  },
};

module.exports = plugin;
