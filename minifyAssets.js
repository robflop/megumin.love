function minifyAssets() {
	const compressor = require('node-minify');
	const { readdirSync } = require('fs');
	const { join } = require('path');
	const Logger = require(join(__dirname, './src/resources/js/Logger'));

	const htmlFiles = readdirSync(join(__dirname, './src/pages'))
		.concat(readdirSync(join(__dirname, './src/pages/errorTemplates')).map(e => e = `errorTemplates/${e}`))
		.filter(f => !f.endsWith('.min.html'));

	htmlFiles.splice(2, 1); // Remove errorTemplates folder string
	const htmlPath = join(__dirname, './src/pages/');

	const cssFiles = readdirSync(join(__dirname, './src/resources/css'))
		.filter(f => !f.endsWith('.min.css'));
	const cssPath = join(__dirname, './src/resources/css/');

	const jsFiles = readdirSync(join(__dirname, './src/resources/js'))
		.filter(f => !f.endsWith('.min.js'));
	jsFiles.splice(0, 1); // Remove eslintrc
	const jsPath = join(__dirname, './src/resources/js/');

	htmlFiles.forEach(fullFilename => {
		const noExtFilename = fullFilename.substr(0, fullFilename.indexOf('.html'));
		compressor.minify({
			compressor: 'html-minifier',
			input: `${htmlPath}${fullFilename}`,
			output: `${htmlPath}${noExtFilename}.min.html`
		});
	});

	Logger.info('HTML minification complete.');

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