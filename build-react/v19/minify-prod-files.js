const { PREBUILD_PATH } = require('./constBuildPaths');
const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const ROOT = path.resolve(__dirname, PREBUILD_PATH);

async function processDir(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            await processDir(fullPath);
            continue;
        }

        if (
            file.endsWith('.js') &&
            !file.endsWith('.development.js') &&
            !file.endsWith('.min.js')
        ) {
            const devFile = fullPath.replace(/\.js$/, '.development.js');

            // Минифицируем только production-файлы,
            // для которых рядом есть development-вариант.
            if (!fs.existsSync(devFile)) {
                continue;
            }

            const code = fs.readFileSync(fullPath, 'utf8');

            try {
                const minified = await minify(code, {
                    ecma: 5,
                    compress: true,
                    mangle: true,
                    sourceMap: false,
                });

                if (!minified || !minified.code) {
                    console.error('Пустой результат минификации:', fullPath);
                    continue;
                }

                const minFile = fullPath.replace(/\.js$/, '.min.js');

                fs.writeFileSync(minFile, minified.code, 'utf8');
                fs.unlinkSync(fullPath);

                console.log('Минификация:', minFile);
                console.log('Удален исходный файл:', fullPath);
            } catch (e) {
                console.error('Ошибка минификации', fullPath, e);
            }
        }
    }
}

(async () => {
    await processDir(ROOT);
    console.log('\nВсе файлы минифицированы!\n');
})();