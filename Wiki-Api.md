# Website API

Base domain for all requests is ``megumin.love/api``. Response format for all routes is JSON.

---

## `GET /conInfo`

Returns necessary data for the client to properly connect to the server, such as whether the website is proxied to SSL and what port it is being run on.
(Mostly used by the browser to connect to websocket server etc, very likely not necessary for API use outside of that)

### Headers

| Key          | Value                             |
| ------------ | --------------------------------- |
| Content-Type | application/x-www-form-urlencoded |

### Body

| Key | Description | Format |
| --- | ----------- | ------ |
| --- | ----------- | ------ |

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

##### Example requests

`/conInfo`

Output:

```js
{
    "port": 5959,
    "ssl": false
}
```

---

## `GET /counter`

Returns the current global counter.

### Headers

| Key          | Value                             |
| ------------ | --------------------------------- |
| Content-Type | application/x-www-form-urlencoded |

### Body

| Key | Description | Format |
| --- | ----------- | ------ |
| --- | ----------- | ------ |

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

#### Example requests

`/counter`

Output:

```js
{
    "counter": 59206101
}
```

---

`GET /sounds`

Returns an array of objects containing the following information on all of the website's sounds:
- ID
- filename
- displayname
- source
- count

### Headers

| Key          | Value                             |
| ------------ | --------------------------------- |
| Content-Type | application/x-www-form-urlencoded |

### Body

| Key | Description | Format |
| --- | ----------- | ------ |
| --- | ----------- | ------ |

### Parameters

| Key    | Description                                     | Format     | Example  |
| ------ | ----------------------------------------------- | ---------- | -------- |
| source | Source a sound must be from to be returned      | Any string | Season 1 |
| equals | The exact amount of clicks a sound must have    | Any number | 51840    |
| over   | The amount of clicks a sound must at least have | Any number | 25000    |
| under  | The amount of clicks a sound must at max have   | Any number | 50000    |

All 3 amount filtering parameters (equals, over, under) can be used alongside each other, as well as alongside the source filter.

#### Example requests

`/sounds?source=Season 1`

Output:

```js
[
    {
        "id": 1,
        "filename": "eugh1",
        "displayname": "Eugh #1",
        "source": "Season 1",
        "count": 15532
    },
    {
        "id": 2,
        "filename": "eugh2",
        "displayname": "Eugh #2",
        "source": "Season 1",
        "count": 12671
    },
// ...
]
```

`/sounds?source=Season 2&over=25000&under=50000`

Output:

```js
[
    {
        "id": 38,
        "filename": "lalala",
        "displayname": "♬Explosions♬",
        "source": "Season 2",
        "count": 28496
    },
    {
        "id": 40,
        "filename": "mywin",
        "displayname": "My Win!",
        "source": "Season 2",
        "count": 27933
    }
]
```

`/sounds?source=Season 1&equals=51840`

Output:

```js
[
    {
        "id": 5,
        "filename": "explosion",
        "displayname": "Explosion!",
        "source": "Season 1",
        "count": 51840
    }
]
```

---

## `GET /statistics`

Returns an object containing the website's statistics, mapped by their corresponding date.

### Headers

| Key          | Value                             |
| ------------ | --------------------------------- |
| Content-Type | application/x-www-form-urlencoded |

### Body

| Key | Description | Format |
| --- | ----------- | ------ |
| --- | ----------- | ------ |

### Parameters

| Key    | Description                                      | Format     | Example    |
| ------ | ------------------------------------------------ | ---------- | ---------- |
| from   | First day of statistics to be returned           | YYYY-MM-DD | 2017-05-27 |
| to     | Last day of statistics to be returned            | YYYY-MM-DD | 2017-06-05 |
| equals | The exact amount of clicks an entry must have    | Any number | 684826     |
| over   | The amount of clicks an entry must at least have | Any number | 10000      |
| under  | The amount of clicks an entry must at max have   | Any number | 1000000    |

Supplying only the `from` parameter will result in the output starting at the specified date and return everything up to the latest known date.

Supplying only the `to` parameter will result in the output starting at the earliest known date and return everything up to the specified date.

Omitting both the `from` and `to` parameter will return the entirety of the statistics from beginning to end (assuming no count filter is used).

If only a single day of statistics is wanted, set both the `from` and `to` parameters to the same date.

All 3 amount filtering parameters (equals, over, under) can be used alongside each other, as well as alongside the time (from, to) filter.

#### Example requests

`/statistics?from=2017-05-27&to=2017-06-05`

Output:

```js
{
    "2017-05-27": 529745,
    "2017-05-28": 3694,
    "2017-05-29": 3148,
    "2017-05-30": 3296,
    "2017-05-31": 2725,
    "2017-06-01": 14945,
    "2017-06-02": 12012,
    "2017-06-03": 1518,
    "2017-06-04": 2214,
    "2017-06-05": 14534
}
```

`/statistics?from=2017-11-26&to=2017-12-20&over=10000&under=1000000`

Output:

```js
{
    "2017-11-26": 895102,
    "2017-11-29": 137571,
    "2017-11-30": 65460,
    "2017-12-05": 66553,
    "2017-12-10": 19278,
    "2017-12-13": 471346,
    "2017-12-15": 25590
}
```

`/statistics?to=2017-12-20&equals=684826`

Output:

```js
{
    "2017-08-23": 684826
}
```

---

`GET /statistics/summary`

Returns a summary of the following counter statistics:

- All-time clicks
- Today's clicks
- This week's clicks
- This month's clicks
- This year's clicks
- Average clicks this month.

This summary is not available for any other time than the time of the request, but you can use the data from the `/statistics` endpoint and aggregate it like this endpoint's output format to achieve the same result for a different point in time.

### Headers

| Key          | Value                             |
| ------------ | --------------------------------- |
| Content-Type | application/x-www-form-urlencoded |

### Body

| Key | Description | Format |
| --- | ----------- | ------ |
| --- | ----------- | ------ |

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |


#### Example requests

`/statistics/summary`

Output:

```js
{
    "alltime": 59206101,
    "daily": 336,
    "weekly": 336,
    "monthly": 26462,
    "yearly": 1706841,
    "average": 4410
}
```

---

## `GET /statistics/chartData`

Returns data necessary for constructing the monthly click distribution chart displayed on the Statistics page.

### Headers

| Key          | Value                             |
| ------------ | --------------------------------- |
| Content-Type | application/x-www-form-urlencoded |

### Body

| Key | Description | Format |
| --- | ----------- | ------ |
| --- | ----------- | ------ |

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |


#### Example requests

`/statistics/chartData`

Output:

```js
[
    {
        "clicks": 1099355,
        "month": "2017-04"
    },
    {
        "clicks": 3652240,
        "month": "2017-05"
    },
// ...
]
```

---

## `POST /login`

Login route for the purpose of being able to access admin-only routes. Works via sessions that are stored serverside.

### Headers

| Key          | Value                             |
| ------------ | --------------------------------- |
| Content-Type | application/x-www-form-urlencoded |

### Body

| Key      | Description                                     | Format     |
| -------- | ----------------------------------------------- | ---------- |
| password | The password configured in the website settings | Any string |

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

#### Example requests

`/login` with wrong password:

Output:

```js
{
    "code": 401,
    "message": "Invalid password provided."
}
```

`/login` with correct password:

```js
{
    "code": 200,
    "message": "Successfully logged in!"
}
```

`/login` while already logged in:

```js
{
    "code": 401,
    "message": "Already logged in."
}
```

---

## `GET /admin/*` and `POST /admin/*`

Admin routes for various tasks.

If any of these routes are accessed while not logged in, the following response will be sent:

```js
{
    "code": 401,
    "message": "Not logged in."
}
```

Otherwise, responses vary by route.

---

## `GET /admin/logout`

Logout route that disables access to admin-only routes upon use.

### Headers

| Key          | Value                             |
| ------------ | --------------------------------- |
| Content-Type | application/x-www-form-urlencoded |

### Body

| Key | Description | Format |
| --- | ----------- | ------ |
| --- | ----------- | ------ |

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

#### Example requests

`/admin/logout` while being logged in:

```js
{
    "code": 200,
    "message": "Successfully logged out!"
}
```

`/admin/logout` while not logged in:

```js
{
    "code": 401,
    "message": "Not logged in."
}
```

---

## `POST /admin/upload`

Upload a new sound to the website.

### Headers

| Key          | Value               |
| ------------ | ------------------- |
| Content-Type | multipart/form-data |

### Body

| Key         | Description                                                           | Type |
| ----------- | --------------------------------------------------------------------- | ---- |
| files[]     | The two sound files (mp3 and ogg) that contain the sound to be played | File |
| filename    | The filename the sound files should be saved under                    | Text |
| displayname | The name the sound should be displayed under on the website           | Text |
| source      | The origin of the soundclips (i.e. Season, OVA, Movie, etc)           | Text |

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

#### Example requests

`/admin/upload` with:
- files[] including `test.mp3` and `test.ogg`
- filename `testfilename`
- displayname `testdisplayname`
- source `testsource`

Output when there is no error:

```js
{
    "code": 200,
    "message": "Sound successfully uploaded.",
    "sound": {
        "id": 60,
        "filename": "testfilename",
        "displayname": "testdisplayname",
        "source": "testsource",
        "count": 0
    }
}
```

Output when filename is already in use:

```js
{
    "code": 400,
    "message": "Sound filename already in use."
}
```

Output when files with different extension than mp3 and ogg are submitted:
```js
{
    "code": 400,
    "message": "Only mp3 and ogg files are accepted."
}
```

Output when no files are supplied (not applicable to this example):
```js
{
    "code": 400,
    "message": "An mp3 and ogg file must be supplied."
}
```

Output for other errors:

```js
{
    "code": 500,
    "message": "An unexpected error occurred."
}
```

---

## `POST /admin/rename`

Modify an existing sound on the website.

### Headers

| Key          | Value                             |
| ------------ | --------------------------------- |
| Content-Type | application/x-www-form-urlencoded |

### Body

| Key            | Description                                | Format     |
| -------------- | ------------------------------------------ | ---------- |
| oldFilename    | Old filename of the sound to be renamed    | Any string |
| newFilename    | New filename of the sound to be renamed    | Any string |
| newDisplayname | New displayname of the sound to be renamed | Any string |
| newSource      | New source of the sound to be renamed      | Any string |

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

#### Example requests

`/admin/rename` with:
- oldFilename `testfilename`
- newFilename `newtestfilename`
- newDisplayname `newtestdisplayname`
- newSource `newtestsource`

Output when there is no error:

```js
{
    "code": 200,
    "message": "Sound successfully renamed.",
    "sound": {
        "id": 60,
        "filename": "newtestfilename",
        "displayname": "newtestdisplayname",
        "source": "newtestsource",
        "count": 0
    }
}
```

Output when the requested sound (oldFilename) was not found:
```js
{
    "code": 404,
    "message": "Sound not found."
}
```

Output for misc. errors:

```js
{
    "code": 500,
    "message": "An unexpected error occurred."
}
```

---

## `POST /admin/delete`

Delete an existing sound from the website.

### Headers

| Key          | Value                             |
| ------------ | --------------------------------- |
| Content-Type | application/x-www-form-urlencoded |

### Body

| Key      | Description                         | Format     |
| -------- | ----------------------------------- | ---------- |
| filename | Filename of the sound to be deleted | Any string |

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

#### Example requests

`/admin/upload` with:
- filename `newtestfilename`

Output when there is no error:

```js
{
    "code": 200,
    "message": "Sound successfully deleted.",
    "sound": {
        "id": 60,
        "filename": "newtestfilename",
        "displayname": "newtestdisplayname",
        "source": "newtestsource",
        "count": 0
    }
}
```

Output when the requested sound (filename) was not found:
```js
{
    "code": 404,
    "message": "Sound not found."
}
```

Output for other errors:

```js
{
    "code": 500,
    "message": "An unexpected error occurred."
}
```