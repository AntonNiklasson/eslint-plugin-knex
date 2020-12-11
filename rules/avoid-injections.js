module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Avoid SQL injections",
    },
    messages: {
      "avoid-raw": `Avoid using knex.raw() with an interpolated string`,
      "avoid-whereraw": `Avoid using .whereRaw() with an interpolated string`,
      "avoid-joinraw": `Avoid using .joinRaw() with an interpolated string`,
    },
  },

  create(context) {
    const rawStatements = /(raw|whereRaw|joinRaw)/

    return {
      [`CallExpression[callee.property.name=${rawStatements}][arguments.0.type!='Literal']`](
        node,
      ) {
        check(context, node)
      },
    }
  },
}

console.log(anton)

function check(context, node) {
  const statement = node.callee.property.name
  const messageId =
    statement === "raw"
      ? "avoid-raw"
      : statement === "whereRaw"
      ? "avoid-whereraw"
      : statement === "joinRaw"
      ? "avoid-joinraw"
      : null
  const queryNode = node.arguments[0]

  if (
    queryNode.type === "TemplateLiteral" &&
    queryNode.expressions.length === 0
  ) {
    return
  }

  if (queryNode.type === "Identifier") {
    const queryVariableDefinition = context
      .getScope(queryNode)
      .variables.find((v) => v.name === queryNode.name).defs[0].node

    if (
      queryVariableDefinition.init.type === "Literal" ||
      (queryVariableDefinition.init.type === "TemplateLiteral" &&
        queryVariableDefinition.init.expressions.length === 0)
    ) {
      return
    }
  }

  context.report({
    node: node.callee.property,
    messageId,
  })
}
