// Match only builder names we can read syntactically; do not trace aliases.
module.exports = function getBuilderName(builder) {
  if (builder.type === "Identifier") return builder.name;
  if (builder.type === "CallExpression") {
    return builder.callee.type === "Identifier" ? builder.callee.name : null;
  }
  if (builder.type === "MemberExpression") {
    if (builder.object.type === "Identifier") return builder.object.name;
    if (
      builder.object.type === "ThisExpression" &&
      !builder.computed &&
      builder.property.type === "Identifier"
    ) {
      return builder.property.name;
    }
  }
  return null;
};
