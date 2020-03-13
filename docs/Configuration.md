## `port`

Configures which port the web- and socket server will run on.

---

## `proxy`

Tells the backend whether the server is being run for a proxy for the purpose of connection limits and ratelimits. If you use a proxy but do not toggle this setting, these functionalities will malfunction as requests will appear to come from your server's ip (or your proxy's ip, respectively), thus believing all users are the same and putting the limit of one user on all users.

---

## `databasePath`

The path from which the server will try to load the database containing all data necessary to function.

---

## `updateInterval`

Configures at which integer interval the cached counter values and statistics will be saved to the database in minutes. Must be an integer higher than 0.

---

## `adminToken`

The admin token which can be used to sign into the web admin panel as well as to access admin-only API routes. Be sure to change this from the default value the sample ships with.

---

## `sessionSecret`

Used in securing login sessions for the web admin panel. Be sure to change this from the default value the sample ships with to a lengthy randomly generated value.

---

## `socketConnections`

Sets the limit for how many socket connections can simultaneously be open from the same IP. `-1` indicates that the limit is disabled, i.e. unlimited connections are possible. Otherwise, the value must be an integer greater than 1.

---

## `requestsPerMinute`

Sets the ratelimit on how many requests (clicks) can be sent from the same ip each minute. Once this limit is hit, said IP will not be able to trigger any more counter updates until the ratelimit resets. `-1` indicates that the limit is disabled, i.e. unlimited clicks are possible. Otherwise, the value must be an integer greater than 1.

---

## `responseInterval`

Sets the interval at which the socket server sends counter updates to all connected clients in milliseconds. `-1` indicates that the interval is disabled, i.e. responses to clicks are sent immediately. Otherwise, the value must be an integer greater than 1.