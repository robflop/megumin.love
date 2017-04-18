>Original: https://megumin.love

# Megumin.love
A site committed to worshipping best girl Megumin!

Runs under NodeJS with Express, SQLite3 and Socket.IO.

## Self-hosting Usage:
- Rename `config.sample.json` to ``config.json` and adjust as needed/wanted
- Run `npm install` in a terminal to install dependencies
- Start the website using `node server.js`
- Click!

#### Information

If you add to the errorTemplates, you will have to create the actual html pages for these in `./pages/errorTemplates/` aswell, otherwise this setting will not take effect.

### Adding new sounds:
- Put your new sound files in the `./sounds/` folder (in mp3, ogg, aac and format)
- Add your sound's name (name of the files!) to the sounds array in ``./js/sounds.js``

And that's it. Your sound will automatically be added to the main button's available sounds.

##### Information:
To add new sounds to the Soundboard, a button for each has to be created in the `./pages/soundboard.html` file.

#### License

Licensed under the [MIT License](LICENSE.md).
