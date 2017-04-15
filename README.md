>Original: https://megumin.love

# Megumin.love
A site committed to worshipping best girl Megumin!

Runs under NodeJS with SQLite3.

## Self-hosting Usage:
- Rename `config.sample.js` to ``config.js` and adjust as needed/wanted
- Use `npm install` in a terminal to install dependencies
- Run using `node server.js`
- Click!

#### Information

If you do not plan on using the prepared database that comes by default located in `/db/megumin_yamero.db` as is, you will either have to rename the database name to your liking, or create one of your own and execute the queries below on it before being able to run the website.

In addition, if you add to the errorTemplates, you will have to create the actual html pages for these in `/pages/errorTemplates` aswell, otherwise this setting will not take effect.

##### Necessary queries:

1) `CREATE TABLE yamero_counter ( counter INT NOT NULL );`

2) `INSERT INTO yamero_counter (counter) VALUES ('0');`

### Adding new sounds:
- Put your new sound files in the `/sounds/` folder (in mp3, ogg, aac and format)
- Add your sound's name (name of the files!) to the sounds array in ``/js/sounds.js``

And that's it. Your sound will automatically be added to the main button's available sounds.

##### Information:
To add new sounds to the Soundboard, a button for each has to be created in the `soundboard.html` file.

### Changing the Interval at which the counter updates:
- Open `index.html` and change `1500` on line 77 to your desired length.
- Unit used is milliseconds, 1500ms stand for 1,5s.


#### License

Licensed under the MIT License.