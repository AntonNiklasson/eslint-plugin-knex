module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Avoid SQL injections",
    },
    messages: {
      avoid: `Avoid using {{query}}() with an interpolated string`,
    },
  },

  create(context) {
    const rawStatements = /(raw|whereRaw|joinRaw)/;

    return {
      [`CallExpression[callee.property.name=${rawStatements}][arguments.0.type!='Literal']`](
        node,
      ) {
        check(context, node);
      },
    };
  },
};

function check(context, node) {
  const statement = node.callee.property.name;
  const queryNode = node.arguments[0];

  if (
    queryNode === undefined ||
    (queryNode.type === "TemplateLiteral" &&
      queryNode.expressions.length === 0)
  ) {
    return;
  }

  if (queryNode.type === "Identifier") {
    let currentScope = context.getScope();

    while (
      currentScope.upper &&
      !currentScope.variables.find(v => v.name === queryNode.name)
    ) {
      currentScope = currentScope.upper;
    }

    const variableDefinition = currentScope.variables.find(
      v => v.name === queryNode.name,
    );

    // The input variable is not defined?
    if (!variableDefinition) return;

    const queryVariableDefinition = variableDefinition.defs[0].node;

    if (
      queryVariableDefinition.init.type === "Literal" ||
      (queryVariableDefinition.init.type === "TemplateLiteral" &&
        queryVariableDefinition.init.expressions.length === 0)
    ) {
      return;
    }
  }

  context.report({
    node: node.callee.property,
    messageId: "avoid",
    data: {
      query: statement,
    },
  });
}
