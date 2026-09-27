const assert = require("assert");
const { ESLint } = require("eslint");
const plugin = require("./index");

(async () => {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [plugin.configs["flat/recommended"]],
  });
  const [unsafe] = await eslint.lintText(
    "knex.raw(`select * from ${table}`);",
    { filePath: "query.js" },
  );
  const [
    safe,
  ] = await eslint.lintText(
    'knex.raw("select * from users where id = ?", [id]);',
    { filePath: "query.js" },
  );
  assert.deepStrictEqual(
    unsafe.messages.map(message => message.ruleId),
    ["knex/avoid-injections"],
  );
  assert.strictEqual(safe.messages.length, 0);
  assert.strictEqual(plugin.meta.name, "eslint-plugin-knex");
  assert.strictEqual(plugin.meta.version, require("./package.json").version);
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
