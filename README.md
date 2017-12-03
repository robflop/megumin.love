>Original: https://megumin.love

# Megumin.love

[![Build Status](https://travis-ci.org/robflop/megumin.love.svg?branch=master)](https://travis-ci.org/robflop/megumin.love)

A site committed to worshipping best girl Megumin!

Runs under [NodeJS](https://nodejs.org/en/) mainly with [Express](https://expressjs.com), [SQLite3](https://www.sqlite.org/) and [uws](https://www.npmjs.com/package/uws).

## Self-hosting Usage

- Rename `src/config.sample.json` to `src/config.json` and adjust as needed/wanted
- Run `npm install` in a terminal to install dependencies
- Navigate into the `src` folder (to set the cwd properly)
- Start the website using `node server.js` (or `pm2 start server.js` if you use pm2)
- Click!

      A maintenance mode that will route every request to a 503 page is also
	  available. Simply pass "--maintenance" as node arg when launching the
	  server.

### Adding new sounds

- Put your new sound file(s) in the `src/resources/sounds/` folder (in ogg and mp3 format)
- Fill out all 3 properties for your new sound in `src/resources/js/sounds.js` (see existing sounds for examples)

And that's it. Your sound will automatically be added to the main button's available sounds, the soundboard and the rankings after a restart.

    Notice: If you want to rename the file(s) of a sound after adding it, do the following:
    1) Rename the file(s)
    2) Rename the filename property of the its entry in the sounds.js file
    3) Update the database row of the respective sound in the rankings table to contain the sound's new name
	
	Update query: "UPDATE rankings SET filename = <new name> WHERE filename = <old name>;"

### Important Information

#### Using the master branch instead of releases does not guarantee receiving a working version of the website. I work on the site on my own pace and don't always update the master branch to a working state (especially when i am working on new features), so if you want a version that's guaranteed to work, use a release version -- optimally the latest.

If you add to the errorTemplates, you will have to create the actual html files for these in the `src/pages/errorTemplates/` folder aswell, otherwise this setting will not take effect.

Update interval in the config represents minutes, following the cronjob syntax, so the max value is 60 (meaning once every hour).

`1` would mean once every minute, `10` once every 10 minutes etc. Commas will be rounded (this is due to scheduling).

It is also advised to check out the [Wiki](https://github.com/robflop/megumin.love/wiki) for more information.

#### Important for proxying to 443 (SSL)

If you want to proxy the website to the SSL port (443), so that users can access the site via `https://<domain>` instead of `http://<domain>:<port>`, then flip on the `SSLproxy` setting in the config.
This will make the front-end WebSocket connections connect to `wss://<domain>` instead of `ws://<domain>:<port>`.
Not changing this setting but still proxying to the SSL port (443) will result in every counter of the page being unresponsive, as the WebSocket connections will fail.

If you're not going to be running the site on via SSL just leave the setting at the default `false` value and everything should be fine.

Nginx proxy example:
-

```nginx
server {
    # proxy-unrelated settings left out

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
