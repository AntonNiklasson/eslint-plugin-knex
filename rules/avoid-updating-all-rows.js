const meta = {
  type: "problem",
  docs: {
    description: "Avoid updating all rows",
  },
  messages: {
    avoid: `Avoid updating all rows`,
  },
};

const create = function (context) {
  return {
    [`CallExpression[callee.property.name='update'][callee.object.callee.name='knex']`](node) {
      check(context, node);
    },
  };
};
const check = function (context, node) {

  context.report({
    node,
    messageId: "avoid"
  });
};

module.exports = { meta, create };
