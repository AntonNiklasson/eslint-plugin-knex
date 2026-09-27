/* global describe, it */
const assert = require("assert");
const getBuilderName = require("./get-builder-name");

// Use the parser bundled with whichever ESLint version runs this test.
const espree = require(require.resolve("espree", {
  paths: [require.resolve("eslint")],
}));

function builderIn(code) {
  const ast = espree.parse(code, { ecmaVersion: 2018 });
  return ast.body[0].expression.callee.object;
}

describe("getBuilderName", () => {
  const cases = [
    ["knex.raw(query)", "knex"],
    ["knex('users').whereRaw(query)", "knex"],
    ["knex.schema.raw(query)", "knex"],
    ["this.knex.raw(query)", "knex"],
    ["this[knex].raw(query)", null],
    ["db.getBuilder().raw(query)", null],
    ["db.client.schema.raw(query)", null],
    ["(1).raw(query)", null],
  ];

  for (const [code, expected] of cases) {
    it(`${code} → ${expected || "unknown"}`, () => {
      assert.strictEqual(getBuilderName(builderIn(code)), expected);
    });
  }
});
