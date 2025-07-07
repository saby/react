const { PREBUILD_PATH } = require('./constBuildPaths');
const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const ROOT = path.resolve(__dirname, PREBUILD_PATH);

async function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            await processDir(fullPath);
        } else if (
            file.endsWith('.js') &&
            !file.endsWith('.development.js') &&
            !file.endsWith('.min.js')
        ) {
            const devFile = fullPath.replace(/\.js$/, '.development.js');
            // Не минифицируем development-файлы ???
            if (fs.existsSync(devFile)) {
                // Обычный production файл, минифицируем
                const code = fs.readFileSync(fullPath, 'utf8');
                try {
                    const minified = await minify(code, {
                        ecma: 5,
                        compress: true,
                        mangle: true,
                        sourceMap: false,
                    });
                    const minFile = fullPath.replace(/\.js$/, '.min.js');
                    fs.writeFileSync(minFile, minified.code);
                    console.log('Минификация:', minFile);
                } catch (e) {
                    console.error('Ошибка минификации', fullPath, e);
                }
            }
        }
    }
}

(async () => {
    await processDir(ROOT);
    console.log('\nВсе файлы минифицированы!\n');
})();
