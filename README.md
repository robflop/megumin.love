>Original: https://megumin.love

# Megumin.love

A site committed to worshipping best girl Megumin!

Runs on [NodeJS](https://nodejs.org/en/) mainly with [Express](https://expressjs.com), [SQLite3](https://www.sqlite.org/) and [uws](https://www.npmjs.com/package/uws).

## Self-hosting Usage
- Navigate into the folder you cloned the repo to
- Rename `src/config.sample.json` to `src/config.json`
- *Recommended, but not needed*: Rename `src/db/default.db` to a name of your choosing (take care to change the config appropriately)
  - **Your database may be overwritten** by the default one if you keep the original filename and try updating the website in the future.
- Open the `config.json` file and configure the website's settings (**Make sure to change the admin token and session secret**)
- Run `npm run setup` once to install dependencies and minify resources (needs to be re-run on site updates)
- Navigate into the `src` folder if you aren't already in it to set the working directory properly
- Boot up the website's server at `server.js` with the process manager of your choice
- Click!

## More information

For information on updating the version of the website, adding/modifying/deleting any sounds on the website, serving it via nginx or other questions, please either visit the [GitHub Wiki](https://github.com/robflop/megumin.love/wiki) for this repo or read the individual files [here](https://github.com/robflop/megumin.love/tree/master/docs).

## License

Licensed under the [MIT License](LICENSE.md).
