>Original: https://megumin.love

# Megumin.love

[![Build Status](https://travis-ci.org/robflop/megumin.love.svg?branch=master)](https://travis-ci.org/robflop/megumin.love)

A site committed to worshipping best girl Megumin!

Runs under NodeJS mainly with Express, SQLite3 and Socket.IO.

## Self-hosting Usage

- Rename `src/config.sample.json` to `src/config.json` and adjust as needed/wanted
- Run `npm install` in a terminal to install dependencies
- Navigate into the `src` folder (to set the cwd properly)
- Start the website using `node server.js` (or `pm2 start server.js` if you use pm2)
- Click!

### Adding new sounds

- Put your new sound files in the `src/resources/sounds/` folder (in mp3, ogg and aac format)
- Fill out all 3 properties for your new sound in `src/resources/js/sounds.js` (see existing sounds for examples)

And that's it. Your sound will automatically be added to the main button's available sounds and to the soundboard.

### Important Information

#### Using the master branch instead of releases does not guarantee receiving a working version. I work on the site on my own pace and don't always update the master branch to a working state (especially when i am working on new features), so if you want a version that works, use the releases.

If you add to the errorTemplates, you will have to create the actual html pages for these in `src/pages/errorTemplates/` aswell, otherwise this setting will not take effect.

Update interval represents minutes, following the cronjob syntax, so max value is 60 (meaning once every hour).

`1` would mean once every minute, `10` once every 10 minutes etc. Commas will be rounded (this is due to scheduling).

#### Important for proxying to 443 (SSL)

If you want to proxy the website to the SSL port (443), so that users can access the site via `https://<domain>` instead of `http://<domain>:<port>`, then flip on the `SSLproxy` setting in the config.
This will make the front-end Socket.io connections connect to `https://<domain>` instead of `http://<domain>:<port>`.
Not changing this setting but still proxying to the SSL port (443) will result in the counter being unresponsive, as it cannot connect to Socket.io.

Otherwise, leave the setting at the default `false` value and everything should be fine.

Apache example configuration for such a proxy:

```apache
<VirtualHost *:443>
    # i'm leaving out all the actual domain stuff

    RewriteEngine On
    RewriteCond %{REQUEST_URI}  ^/socket.io            [NC]
    RewriteCond %{QUERY_STRING} transport=websocket    [NC]
    RewriteRule /(.*)           ws://localhost:<port>/$1 [P,L]

    <Proxy *>
        Order allow,deny
        Allow from all
    </Proxy>
    ProxyPass / http://localhost:<port>/
    ProxyPassReverse / http://localhost:<port>/
</VirtualHost>
```

You will have to insert the port you chose for the placeholders here, the same you entered into the `src/config.json` file.

#### License

Licensed under the [MIT License](LICENSE.md).
