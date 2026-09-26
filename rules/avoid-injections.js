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
    const rawStatements = /^(raw|whereRaw|joinRaw)$/;

    return {
      [`CallExpression[callee.property.name=${rawStatements}][arguments.0.type!='Literal']`](
        node,
      ) {
        if (context.settings && context.settings.knex) {
          const builder = node.callee.object;
          const builderName = builder.name || builder.callee.name;
          const { builderName: builderNamePattern } = context.settings.knex;

          if (
            builderNamePattern instanceof RegExp &&
            !builderNamePattern.test(builderName)
          ) {
            return;
          }
        }

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
    (queryNode.type === "TemplateLiteral" && queryNode.expressions.length === 0)
  ) {
    return;
  }

  if (queryNode.type === "Identifier") {
    // `context.getScope()` was removed in ESLint 9. Prefer the modern
    // `SourceCode#getScope(node)` API and fall back for older versions.
    const sourceCode = context.sourceCode || context.getSourceCode();
    let scope = sourceCode.getScope
      ? sourceCode.getScope(node)
      : context.getScope();

    while (
      scope.upper &&
      !scope.variables.find(v => v.name === queryNode.name)
    ) {
      scope = scope.upper;
    }

    const variableDefinition = scope.variables.find(
      v => v.name === queryNode.name,
    );

    // The input variable is not defined?
    if (!variableDefinition) return;

    const definition = variableDefinition.defs[0];
    const initializer = definition && definition.node && definition.node.init;

    // Parameters, imports, and declarations without initializers cannot be checked.
    if (!initializer) return;

    if (
      initializer.type === "Literal" ||
      (initializer.type === "TemplateLiteral" &&
        initializer.expressions.length === 0)
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
