>Original: https://megumin.love

# Megumin.love

A site committed to worshipping best girl Megumin!

## Self-hosting Usage

>_**Important**: It is _**highly**_ recommended to use releases instead of the latest commit, as the master branch will sometimes require frequent DB adjustments or even wipes. No instructions for it will be provided either, so use it at your own risk of heavy breakage._

1. Navigate into the folder you downloaded the latest release / commit to
2. Rename `src/config.sample.json` to `src/config.json`
3. *Recommended, but not needed*: Rename `src/db/default.db` to a name of your choosing (take care to change the config appropriately)
   * **Your database may be overwritten** by the default one if you keep the original filename and try updating the website in the future.
4. Open the `config.json` file and [configure the website's settings]((https://github.com/robflop/megumin.love/wiki/Configuration) (**Make sure to change the admin token and session secret**)
5. Run `npm run setup` once to install dependencies and minify resources (needs to be re-run on site updates)
6. Navigate into the `src` folder if you aren't already in it to set the working directory properly
7. Boot up the website's server at `server.js` with the process manager of your choice
8. Click!

## More information

For information on updating the version of the website, adding/modifying/deleting any sounds on the website, serving it via nginx or other questions, please either visit the [GitHub Wiki](https://github.com/robflop/megumin.love/wiki) for this repo or read the individual files [here](https://github.com/robflop/megumin.love/tree/master/docs).

## License

Licensed under the [MIT License](LICENSE.md).
