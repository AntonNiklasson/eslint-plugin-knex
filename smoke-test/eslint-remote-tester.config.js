module.exports = {
  /** Repositories to scan */
  repositories: ["knex/knex", "react/react"],

  /** Extensions of files under scanning */
  extensions: [".js", ".jsx", ".ts", ".tsx"],

  /** Optional pattern used to exclude paths */
  pathIgnorePattern: `(${[
    "node_modules",
    "\\/\\.", // Any file or directory starting with dot, e.g. ".git"
    "test-results",
    "tests",
    "docs",
  ].join("|")})`,

  /** Optional array of rules used to filter out results. Use undefined or empty array when ESLint crashes are the only interest */
  rulesUnderTesting: [],

  /** Maximum amount of tasks ran concurrently */
  concurrentTasks: 2,

  /** ESLint configuration */
  eslintrc: {
    root: true,
    plugins: ["knex"],
    rules: {
      "knex/avoid-injections": 2,
    },
  },

  CI: false,
};
