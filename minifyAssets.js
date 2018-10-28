const compressor = require('node-minify');
const { readdirSync } = require('fs');
const { basename, join } = require('path');

const resources = (...dir) => join(...[__dirname, 'src', 'resources'].concat(dir));

const Logger = require(resources('js', 'Logger'));

function minifyAssets() {
	const cssPath = resources('css');
	const cssFiles = readdirSync(cssPath).filter(f => !f.endsWith('.min.css'));

	const jsPath = resources('js');
	const jsFiles = readdirSync(jsPath).filter(f => !f.endsWith('.min.js'));

	jsFiles.splice(0, 1); // Remove eslintrc

	cssFiles.forEach(fileName => {
		compressor.minify({
			compressor: 'clean-css',
			input: `${cssPath}${fileName}`,
			output: `${cssPath}${basename(fileName, '.css')}.min.css`
		});
	});

	Logger.info('CSS minification complete.');

	jsFiles.forEach(fileName => {
		compressor.minify({
			compressor: 'uglify-es',
			input: `${jsPath}${fileName}`,
			output: `${jsPath}${basename(fileName, '.js')}.min.js`
		});
	});

	Logger.info('JS minification complete.');
}

module.exports = minifyAssets;