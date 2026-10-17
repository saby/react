const { REACT_SCHEDULER_SOURCE_PATH, REACT_SCHEDULER_OUT_PATH } = require('../constBuildPaths');
const path = require("path");
const fs = require("fs");
const rollup = require("rollup");
const babel = require("@rollup/plugin-babel").default;
const resolve = require("@rollup/plugin-node-resolve").default;
const replace = require('@rollup/plugin-replace');

const inputFile = path.join(REACT_SCHEDULER_SOURCE_PATH, "index.js");

const buildVariants = [
  {
    outFile: "scheduler.development.js",
    minify: false,
    env: "development",
  },
  {
    outFile: "scheduler.production.js",
    minify: false,
    env: "production",
  },
];

async function build() {
  if (!fs.existsSync(REACT_SCHEDULER_OUT_PATH)) {
        fs.mkdirSync(REACT_SCHEDULER_OUT_PATH, { recursive: true });
    }

  for (const variant of buildVariants) {
    const bundle = await rollup.rollup({
      input: inputFile,
      plugins: [
        resolve(),
        replace({
            preventAssignment: true,
            __EXPERIMENTAL__: 'false'
        }),
        babel({
          babelHelpers: "bundled",
          exclude: /node_modules/,
        }),
      ],
      external: [],
      onwarn: (warning, warn) => {
        // Ignore circular deps in node_modules
        if (warning.code === "CIRCULAR_DEPENDENCY") {
            return;
        }
        warn(warning);
      },
    });

    await bundle.write({
      file: path.join(REACT_SCHEDULER_OUT_PATH, variant.outFile),
      format: "amd",
      name: "Scheduler",
      exports: "named",
      sourcemap: false,
      intro: `// Scheduler ${variant.env} build`,
      banner: `/** @license Scheduler - React Team */\n`,
    });

    console.log(`Сборка ${variant.outFile}`);
  }
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
