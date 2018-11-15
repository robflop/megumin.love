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
- Run `npm install` in a terminal to install dependencies
- Navigate into the `src` folder if you aren't already in it to set the working directory properly
- Boot up the website's server at `server.js`
- Click!

## Updating the website
- When a new version adds default sounds, you will need to follow some instructions to add these to your existing database
- Read the [Updating](https://github.com/robflop/megumin.love/blob/master/Updating.md) guidelines for instructions on how to do so
- In addition, read the relevant release notes in the GitHub releases section carefully for additional notices (esp. for breaking versions).

### Adding custom sounds

There are two ways to add custom sounds starting with version 5.0.0 -- via interface or manually.
If done via interface then no restart is required, if done manually changes only take effect on restart.

#### Interface:
1) Open the admin panel at the `/admin` page and log in
2) Fill out the form for uploads on the very left and click "Upload sound"

#### Manually:
1) Put your new sound file in the `src/resources/sounds/` folder (in mp3 format)
2) Run this query with the values you want to use for the sound:
	- `INSERT INTO sounds ( filename, displayname, source, count ) VALUES ( <your>, <values>, <here>, 0 );`
3) Restart the website

### Renaming sounds

#### Interface:
1) Open the admin panel at the `/admin` page and log in
2) Fill out the form for renaming in the center and click "Update sound".

#### Manually:
1) Rename the file in the `src/resources/sounds` folder
2) Run this query with with the new values you want to use for the sound:
	- `UPDATE sounds SET filename = <your>, displayname = <values>, source = <here> WHERE filename = <old filename>;`
3) Restart the website

### Removing sounds

#### Interface:
1) Open the admin panel at the `/admin` page and log in.
2) Fill out the form for deletion to the right and click "Delete sound"

#### Manually:
1) Delete the file in the `src/resources/sounds` folder
2) Run this query with with the value for the sound you want to delete:
	- `DELETE FROM sounds WHERE filename = <your value here>;`
3) Restart the website

### Important Information

- **Using the master branch instead of releases does not guarantee receiving a working version of the website. I work on the site on my own pace and don't always update the master branch to a working state (especially when i am working on new features), so if you want a version that's guaranteed to work, use a release version -- optimally the latest.**

- If you add to the errorTemplates, you will have to create the actual html files for these in the `src/pages/errorTemplates/` folder as well, otherwise this setting will not take effect.

- Update interval in the config represents minutes, following the cronjob syntax, so the max value is 60 (meaning once every hour).
	- `1` would mean once every minute, `10` once every 10 minutes etc. Commas will be rounded (this is due to scheduling).

- It is also advised to check out the [Wiki](https://github.com/robflop/megumin.love/wiki) for more information.

- uws version 10.148.1 or earlier needs to be installed as newer versions are blank repos. No support provided for cases where versions later than 10.148.1 are installed.

#### Important for proxying to 443 (SSL)

If you want to proxy the website to the SSL port (443), so that users can access the site via `https://<domain>` instead of `http://<domain>:<port>`, then flip on the `SSLproxy` setting in the config.
This will make the front-end WebSocket connections connect to `wss://<domain>` instead of `ws://<domain>:<port>`.
Not changing this setting but still proxying to the SSL port (443) will result in every counter of the page being unresponsive, as the WebSocket connections will fail.

If you're not going to be running the site with SSL just leave the setting at the default `false` value and everything should be fine.

Nginx proxy example:
-

```nginx
server {
    # Proxy-unrelated settings left out

    location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_set_header X-NginX-Proxy true;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_http_version 1.1;
        proxy_pass http://127.0.0.1:<port>;
        proxy_store off;
        proxy_redirect off;
    }
}
```

>I used to have an Apache example too, but I couldn't figure out how to get it working after switching to uws, so i removed it instead of providing false info. Apologies for those who need it.

You will have to insert the port you chose in the `src/config.json` file in place of the `<port>` placeholders here.

#### License

Licensed under the [MIT License](LICENSE.md).
