const { execFileSync, spawnSync } = require("child_process");
const {
  copyFileSync,
  mkdtempSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} = require("fs");
const { tmpdir } = require("os");
const path = require("path");

const versions = process.argv.slice(2);
const majors = versions.length ? versions : ["7", "8"];

if (majors.some(major => !["7", "8", "9", "10"].includes(major))) {
  console.error("Usage: pnpm test:eslint [7|8|9|10 ...]");
  process.exit(2);
}

const rules = path.join(__dirname, "..", "rules");
let failed = false;

for (const major of majors) {
  const sandbox = mkdtempSync(path.join(tmpdir(), "eslint-plugin-knex-"));

  try {
    const sandboxRules = path.join(sandbox, "rules");
    mkdirSync(sandboxRules);
    for (const file of readdirSync(rules).filter(file =>
      file.endsWith(".js"),
    )) {
      copyFileSync(path.join(rules, file), path.join(sandboxRules, file));
    }

    writeFileSync(path.join(sandbox, "package.json"), '{"private":true}\n');
    copyFileSync(
      path.join(__dirname, "run-eslint-tests.js"),
      path.join(sandbox, "run-tests.js"),
    );

    console.log(`\n=== ESLint ${major} ===`);
    execFileSync(
      "npm",
      [
        "install",
        "--prefix",
        sandbox,
        "--no-save",
        "--no-package-lock",
        "--ignore-scripts",
        "--no-audit",
        "--no-fund",
        `eslint@${major}`,
      ],
      { stdio: "inherit" },
    );
    const version = require(path.join(
      sandbox,
      "node_modules/eslint/package.json",
    )).version;
    console.log(`Running rule tests with ESLint ${version}`);

    const result = spawnSync(
      process.execPath,
      ["--test", "--test-reporter=spec", "run-tests.js"],
      { cwd: sandbox, stdio: "inherit" },
    );
    if (result.error) throw result.error;
    if (result.status !== 0) failed = true;
  } catch (error) {
    console.error(error);
    failed = true;
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

if (failed) process.exitCode = 1;
