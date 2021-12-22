const { RuleTester } = require("eslint");
const rule = require("./avoid-injections");

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

tester.run("avoid-injections", rule, {
  valid: [
    "knex.raw('select ? from users', ['email'])",
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
    `function sharp() { return { raw: () => {}, }; } sharp().raw();`,
    {
      code: "knex('users').whereRaw(`id = ` + id);",
      settings: {
        knex: {
          builderName: /(transaction|trx)/i,
        },
      },
    },
    // knex.schema.raw()
    "knex.schema.raw(`ALTER TABLE 'users' ADD COLUMN 'is_awesome' BOOLEAN NOT NULL DEFAULT false;`)",
    {
      code:
        "knex.schema.raw(`ALTER TABLE 'users' ADD COLUMN 'is_awesome' BOOLEAN NOT NULL DEFAULT false;`)",
      settings: {
        knex: {
          builderName: "^(knex|transaction)$",
        },
      },
    },
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

    invalidCase(
      "lorem.raw(`select * from ${table}`);",
      [{ messageId: "avoid", data: { query: "raw" } }],
      {
        settings: {
          knex: {
            builderName: /lorem/i,
          },
        },
      },
    ),

    // knex.schema.raw()
    invalidCase(
      "knex.schema.raw(`ALTER TABLE 'users' ADD COLUMN 'is_awesome' BOOLEAN NOT NULL DEFAULT ${defaultAwesome};`)",
      [{ messageId: "avoid", data: { query: "raw" } }],
    ),
    invalidCase(
      "knex.schema.raw(`ALTER TABLE 'users' ADD COLUMN 'is_awesome' BOOLEAN NOT NULL DEFAULT ${defaultAwesome};`)",
      [{ messageId: "avoid", data: { query: "raw" } }],
      {
        settings: {
          knex: {
            builderName: "^(knex|transaction)$",
          },
        },
      },
    ),
  ],
});
