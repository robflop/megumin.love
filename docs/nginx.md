If you want to proxy the website to the SSL port (443), so that users can access the site via `https://<domain>` instead of `http://<domain>:<port>`, then flip on the `SSLproxy` setting in the config.
This will make the front-end WebSocket connections connect to `wss://<domain>` instead of `ws://<domain>:<port>`.
Not changing this setting but still proxying to the SSL port (443) will result in every counter of the page being unresponsive, as the WebSocket connections will fail.

If you're not going to be running the site with SSL just leave the setting at the default `false` value and everything should be fine.

Fully functional nginx example:
-

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name domain.tld; # Replace this with your actual domain

    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name domain.tld; # Replace this with your actual domain

    ssl_certificate /location/of/certificate.pem;
    ssl_certificate_key /location/of/certificate.key;
    ssl_trusted_certificate /location/of/certificate.pem;
    # Get a certificate from e.g. Cloudflare or letsencrypt

    access_log /var/log/nginx/domain.tld.access.log;
    error_log /var/log/nginx/domain.tld.error.log;
    # Non vital, only if you want separate logging

    # SSL security settings omitted, but easy enough to find on the web

    location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_set_header X-NginX-Proxy true;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_http_version 1.1;
        proxy_store off;
        proxy_redirect off;
        proxy_pass http://127.0.0.1:<port>; # Replace port with configured port
    }
}
```