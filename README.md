>Original: https://megumin.love

# Megumin.love

[![Build Status](https://travis-ci.org/robflop/Megumin.love.svg?branch=master)](https://travis-ci.org/robflop/Megumin.love)

A site committed to worshipping best girl Megumin!

Runs under NodeJS mainly with Express, SQLite3 and Socket.IO.

## Self-hosting Usage:
- Rename `config.sample.json` to `config.json` and adjust as needed/wanted
- Run `npm install` in a terminal to install dependencies
- Start the website using `node server.js` (or `pm2 start server.js` if you use pm2)
- Click!

### Adding new sounds:
- Put your new sound files in the `resources/sounds/` folder (in mp3, ogg, aac and format)
- Add your sound's name (name of the files!) to the sounds array in ``resources/js/sounds.js``

And that's it. Your sound will automatically be added to the main button's available sounds.

### Important Information:

If you add to the errorTemplates, you will have to create the actual html pages for these in `/pages/errorTemplates/` aswell, otherwise this setting will not take effect.

To add new sounds to the Soundboard, a button for each has to be created in the `/pages/soundboard.html` file.

Don't flip off the `firstRun` setting if it's your first run. There will be crashes and no support will be provided.

Update interval represents minutes, following the cronjob syntax, so max value is 60 (meaning once every hour).

`1` would mean once every minute, `10` once every 10 minutes etc. Commas will be rounded (this is due to scheduling).

#### Important for proxying to 443 (SSL):

If you want to proxy the website to the SSL port (443), so that users can access the site via `https://<domain>` instead of `https://<domain>:<port>`, then flip on the "SSLproxy" setting in the config.
This will make the front-end Socket.io connections connect to `https://<domain>` instead of `http://<domain>:<port>`.
Not changing this setting but still proxying to the SSL port (443) will result in the counter being unresponsive, as it cannot connect to Socket.io.

Otherwise, leave the setting at the default "false" value and everything should be fine.

Apache example configuration for such a proxy:

```
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

You will have to insert the port you chose for the placeholders here, the same you entered into the `config.json`.

#### License

Licensed under the [MIT License](LICENSE.md).
