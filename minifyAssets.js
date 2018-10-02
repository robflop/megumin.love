function minifyAssets() {
	const compressor = require('node-minify');
	const { readdirSync } = require('fs');
	const { join } = require('path');
	const Logger = require(join(__dirname, './src/resources/js/Logger'));

	const cssFiles = readdirSync(join(__dirname, './src/resources/css'))
		.filter(f => !f.endsWith('.min.css'));
	const cssPath = join(__dirname, './src/resources/css/');

	const jsFiles = readdirSync(join(__dirname, './src/resources/js'))
		.filter(f => !f.endsWith('.min.js'));
	jsFiles.splice(0, 1); // Remove eslintrc
	const jsPath = join(__dirname, './src/resources/js/');

	cssFiles.forEach(fullFilename => {
		const noExtFilename = fullFilename.substr(0, fullFilename.indexOf('.css'));
		compressor.minify({
			compressor: 'clean-css',
			input: `${cssPath}${fullFilename}`,
			output: `${cssPath}${noExtFilename}.min.css`
		});
	});

	Logger.info('CSS minification complete.');

	jsFiles.forEach(fullFilename => {
		const noExtFilename = fullFilename.substr(0, fullFilename.indexOf('.js'));
		compressor.minify({
			compressor: 'uglify-es',
			input: `${jsPath}${fullFilename}`,
			output: `${jsPath}${noExtFilename}.min.js`
		});
	});

	Logger.info('JS minification complete.');
}

module.exports = minifyAssets;