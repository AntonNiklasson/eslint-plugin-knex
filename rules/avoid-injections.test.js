const { RuleTester } = require("eslint");
const rule = require("./avoid-injections");
const eslintMajor = Number(
  require("eslint/package.json").version.split(".")[0],
);
const testerOptions =
  eslintMajor >= 9
    ? { languageOptions: { ecmaVersion: 2015 } }
    : { parserOptions: { ecmaVersion: 2015 } };

function invalidCase(code, errors = [], others = {}) {
  return Object.assign(
    {
      code,
      errors,
    },
    others,
  );
}

const tester = new RuleTester(testerOptions);

tester.run("avoid-injections", rule, {
  valid: [
    "knex.raw('select ? from users', ['email'])",
    "knex.raw(`select * from users`)",
    `const query = 'SELECT * FROM users'; const result = knex.raw(query);`,
    "function run(query) { return knex.raw(query); }",
    "const run = query => knex.raw(query);",
    "let query; knex.raw(query);",
    "let query = 'select * from users'; query += userInput; knex.raw(query);",
    {
      code:
        "let query = 'select * from users'; query = 'select ?'; knex.raw(query, [id]);",
      options: [{ checkQueryReassignments: true }],
    },
    {
      code:
        "let query = 'select ?'; knex.raw(query, [id]); query += userInput;",
      options: [{ checkQueryReassignments: true }],
    },
    {
      code:
        "let query = 'select ?'; function other() { query += input; } knex.raw(query, [id]);",
      options: [{ checkQueryReassignments: true }],
    },
    Object.assign(
      { code: "import query from './query'; knex.raw(query);" },
      eslintMajor >= 9
        ? { languageOptions: { sourceType: "module" } }
        : { parserOptions: { sourceType: "module" } },
    ),
    `
    const query = \`now() + interval '123 seconds'\`;
    function run() {
    return knex.raw(query);
    }
    `,
    "knex('users').whereRaw('id = ?', [1]);",
    "knex('users').joinRaw('join posts on posts.user_id = users.id');",
    "knex('users').groupByRaw('year(created_at)');",
    "knex('users').orderByRaw('name asc');",
    "knex.raw('select * from users where id = ?', [id]);",
    "knex('users').joinRaw('join posts on posts.user_id = ?', [id]);",
    ...[
      ["orWhereRaw", "id = ?", "id"],
      ["havingRaw", "count(*) > ?", "minimum"],
      ["orHavingRaw", "count(*) > ?", "minimum"],
      ["groupByRaw", "coalesce(??, ?)", "'name', 'n/a'"],
      ["orderByRaw", "?? asc", "column"],
    ].map(
      ([method, sql, bindings]) =>
        `knex('users').${method}('${sql}', [${bindings}]);`,
    ),
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
    {
      code:
        "class Test { constructor({ knex }) { this.knex = knex; } query() { const query = 'select ? from users'; return this.knex.raw(query, ['email']); } }",
      settings: { knex: { builderName: "^knex$" } },
    },
    {
      code: "this[knex].raw(`select * from ${table}`);",
      settings: { knex: { builderName: "^knex$" } },
    },
    {
      code: "trx.raw(`select * from ${table}`);",
      settings: { knex: { builderName: "^(knex|transaction)$" } },
    },
  ],
  invalid: [
    ...[
      "orWhereRaw",
      "havingRaw",
      "orHavingRaw",
      "groupByRaw",
      "orderByRaw",
    ].map(method =>
      invalidCase(`knex('users').${method}(\`unsafe ${"${input}"}\`);`, [
        { messageId: "avoid", data: { query: method } },
      ]),
    ),
    invalidCase(
      "let query = 'select * from users'; query += userInput; knex.raw(query);",
      [{ messageId: "avoid", data: { query: "raw" } }],
      { options: [{ checkQueryReassignments: true }] },
    ),
    invalidCase(
      "let query = 'select * from users'; query = `select ${id}`; knex.raw(query);",
      [{ messageId: "avoid", data: { query: "raw" } }],
      { options: [{ checkQueryReassignments: true }] },
    ),
    invalidCase(
      "let query = 'count(*) > ?'; query += input; knex('users').havingRaw(query);",
      [{ messageId: "avoid", data: { query: "havingRaw" } }],
      { options: [{ checkQueryReassignments: true }] },
    ),
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
    invalidCase('const query = "select * from " + table; knex.raw(query);', [
      { messageId: "avoid", data: { query: "raw" } },
    ]),

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
    invalidCase(
      "knex('users').whereRaw(`id = ${id}`);",
      [{ messageId: "avoid", data: { query: "whereRaw" } }],
      { settings: { knex: { builderName: "^knex$" } } },
    ),
    invalidCase(
      "knex.schema.raw(`select * from ${table}`);",
      [{ messageId: "avoid", data: { query: "raw" } }],
      { settings: { knex: { builderName: "^knex$" } } },
    ),
    invalidCase(
      "class Test { query(table) { return this.knex.raw(`select * from ${table}`); } }",
      [{ messageId: "avoid", data: { query: "raw" } }],
      { settings: { knex: { builderName: "^knex$" } } },
    ),
    invalidCase(
      "transaction.raw(`select * from ${table}`);",
      [{ messageId: "avoid", data: { query: "raw" } }],
      { settings: { knex: { builderName: "^(knex|transaction)$" } } },
    ),
    invalidCase(
      "knex.raw(`select * from ${table}`);",
      [{ messageId: "avoid", data: { query: "raw" } }],
      { settings: { knex: { builderName: "[" } } },
    ),
    invalidCase(
      "knex.raw(`select * from ${table}`);",
      [{ messageId: "avoid", data: { query: "raw" } }],
      { settings: { knex: { builderName: 123 } } },
    ),
  ],
});
