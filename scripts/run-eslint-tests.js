const { readdirSync } = require("fs");
const path = require("path");
const { describe, it } = require("node:test");

global.describe = describe;
global.it = it;

const rules = path.join(__dirname, "rules");
const tests = readdirSync(rules).filter(file => file.endsWith(".test.js"));
if (tests.length === 0) throw new Error("No rule tests found");

for (const file of tests) {
  require(path.join(rules, file));
}
