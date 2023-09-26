const meta = {
  type: "problem",
  docs: {
    description: "Avoid updating all rows",
  },
  messages: {
    avoid: `Avoid updating all rows`,
  },
};

const create = function(context) {
  return {
    [`CallExpression[callee.property.name='update'][callee.object.callee.name='knex']`](node) {
      check(context, node);
    },
  };
};
const check = function(context, node) {

  if (context.settings && context.settings.knex && context.settings.knex.rule) {
    const ruleSettings = context.settings.knex.rule["avoid-updating-all-rows"];
    const tablesToIgnore = ruleSettings.tablesToIgnore;
    const tableToUpdate = node.callee.object.arguments[0].value;
    if (tablesToIgnore.includes(tableToUpdate)) {
      return;
    }
  }

  context.report({
    node,
    messageId: "avoid",
  });
};

module.exports = { meta, create };
