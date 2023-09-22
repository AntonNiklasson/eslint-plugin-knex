const { RuleTester } = require("eslint");
const rule = require("./avoid-updating-all-rows");

function invalidCase(code, errors = [], others = {}) {
  return Object.assign(
    {
      code,
      errors,
    },
    others,
  );
}

const tester = new RuleTester({
  parserOptions: { ecmaVersion: 2015 },
});

tester.run("avoid-updating-all-rows", rule, {
  valid: ["knex('books').where({id:1}).update({'status': 'archived'})"],
  invalid: [
    invalidCase("knex('books').update({'status': 'archived'})", [
      { messageId: "avoid" },
    ]),
  ],
});
