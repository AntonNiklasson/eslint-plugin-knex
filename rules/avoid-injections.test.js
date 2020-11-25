const { RuleTester } = require('eslint');
const rule = require('./avoid-injections');

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2015 } });

function invalidCase(code, errorIds = []) {
  return {
    code,
    errors: errorIds.map((id) => ({ messageId: id })),
  };
}

ruleTester.run('avoid-injections', rule, {
  valid: [
    "knex.raw('select ? from users', ['email'])",
    "knex.raw('select * from users');",
    'knex.raw(`select * from users`)',
    "knex.raw('select ? from users', ['email'])",
    `const query = 'SELECT * FROM users'; const result = knex.raw(query);`,

    "knex('users').whereRaw('id = ?', [1]);",
    "knex('users').whereRaw(`id = 1`);",

    "const joinCondition = `blog_posts ON users.id = blog_posts.author`; knex('users').select(['email']).joinRaw(joinCondition)",
  ],
  invalid: [
    invalidCase('knex.raw(`select * from ${table}`);', ['avoid-raw']),
    invalidCase('knex.raw("select * from " + table);', ['avoid-raw']),

    invalidCase("knex('users').whereRaw(`id = ${id}`);", ['avoid-whereraw']),
    invalidCase("knex('users').whereRaw(`id = ` + id);", ['avoid-whereraw']),
    invalidCase("knex('users').whereRaw(`id = ${getId()}`);", ['avoid-whereraw']),

    invalidCase("knex('users').whereRaw(`id = ${getId()}`);", ['avoid-whereraw']),

    invalidCase("knex('users').select(['email']).joinRaw(`blog_posts ON users.id = ${userId}`)", [
      'avoid-joinraw',
    ]),
  ],
});
