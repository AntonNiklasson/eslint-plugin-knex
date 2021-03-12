const { RuleTester } = require("eslint");
const rule = require("./avoid-injections");

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2015 } });

function invalidCase(code, errors = []) {
  return {
    code,
    errors,
  };
}

ruleTester.run("avoid-injections", rule, {
  valid: [
    "knex.raw('select ? from users', ['email'])",
    "knex.raw('select * from users');",
    "knex.raw(`select * from users`)",
    "knex.raw('select ? from users', ['email'])",
    `const query = 'SELECT * FROM users'; const result = knex.raw(query);`,
    `
    const query = \`now() + interval '123 seconds'\`;
    function run() {
      return knex.raw(query);
    }
    `,
    "knex('users').whereRaw('id = ?', [1]);",
    "knex('users').whereRaw(`id = 1`);",
    "const joinCondition = `blog_posts ON users.id = blog_posts.author`; knex('users').select(['email']).joinRaw(joinCondition)",
    `
    function sharp() {
      return {
        raw: () => {},
      };
    }
    sharp().raw();
    `,
    "page.drawText(`${foo}bar`);",
  ],
  invalid: [
    // .raw()
    invalidCase("knex.raw(`select * from ${table}`);", [
      { messageId: "avoid", data: { query: "raw" } },
    ]),
    invalidCase('knex.raw("select * from " + table);', [
      { messageId: "avoid", data: { query: "raw" } },
    ]),
    invalidCase(
      "const email = 'user@domain.com'; const query = `SELECT * FROM users WHERE email='${email}'`; function run() { knex.raw(query); }",
      [{ messageId: "avoid", data: { query: "raw" } }],
    ),

    // .whereRaw()
    invalidCase("knex('users').whereRaw(`id = ${id}`);", [
      { messageId: "avoid", data: { query: "whereRaw" } },
    ]),
    invalidCase("knex('users').whereRaw(`id = ` + id);", [
      { messageId: "avoid", data: { query: "whereRaw" } },
    ]),
    invalidCase("knex('users').whereRaw(`id = ${getId()}`);", [
      { messageId: "avoid", data: { query: "whereRaw" } },
    ]),
    invalidCase("knex('users').whereRaw(`id = ${getId()}`);", [
      { messageId: "avoid" },
    ]),

    // .joinRaw()
    invalidCase(
      "knex('users').select(['email']).joinRaw(`blog_posts ON users.id = ${userId}`)",
      [{ messageId: "avoid", data: { query: "joinRaw" } }],
    ),
  ],
});
