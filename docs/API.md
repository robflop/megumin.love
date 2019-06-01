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

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

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

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

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

## `GET /themes`

Returns a list of all available website themes. By default the website ships with four:
- megumin
- aqua
- darkness
- kazuma

### Headers

| Key          | Value                             |
| ------------ | --------------------------------- |
| Content-Type | application/x-www-form-urlencoded |

### Body

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

#### Example requests

`/themes`

Output:

```js
[
    'megumin',
    'aqua',
    'darkness',
    'kazuma'
]
```

---

## `GET /sounds`

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

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

### Parameters

| Key    | Description                                     | Format  | Example  |
| ------ | ----------------------------------------------- | ------- | -------- |
| theme  | Theme to filter the requested sounds by         | String  | megumin  |
| source | Source a sound must be from to be returned      | String  | Season 1 |
| equals | The exact amount of clicks a sound must have    | Integer | 51840    |
| over   | The amount of clicks a sound must at least have | Integer | 25000    |
| under  | The amount of clicks a sound must at max have   | Integer | 50000    |

A list of themes is available from the `/themes` route (GET).
All 3 amount filtering parameters (equals, over, under) can be used alongside each other, as well as alongside the source filter.
No theme filter will return sounds for every available theme.

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

Returns an array of objects containing the website's statistics for each day.

### Headers

| Key          | Value                             |
| ------------ | --------------------------------- |
| Content-Type | application/x-www-form-urlencoded |

### Body

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

### Parameters

| Key    | Description                                      | Format     | Example    |
| ------ | ------------------------------------------------ | ---------- | ---------- |
| from   | First day of statistics to be returned           | YYYY-MM-DD | 2017-05-27 |
| to     | Last day of statistics to be returned            | YYYY-MM-DD | 2017-06-05 |
| equals | The exact amount of clicks an entry must have    | Integer    | 684826     |
| over   | The amount of clicks an entry must at least have | Integer    | 10000      |
| under  | The amount of clicks an entry must at max have   | Integer    | 1000000    |

Supplying only the `from` parameter will result in the output starting at the specified date and return everything up to the latest known date.

Supplying only the `to` parameter will result in the output starting at the earliest known date and return everything up to the specified date.

Omitting both the `from` and `to` parameter will return the entirety of the statistics from beginning to end (assuming no count filter is used).

If only a single day of statistics is wanted, set both the `from` and `to` parameters to the same date.

All 3 amount filtering parameters (equals, over, under) can be used alongside each other, as well as alongside the time (from, to) filter.

#### Example requests

`/statistics?from=2017-05-27&to=2017-06-05`

Output:

```js
[
    {
        "id": 41,
        "date": "2017-05-27",
        "count": 529745
    },
    {
        "id": 42,
        "date": "2017-05-28",
        "count": 3694
    },
    // ...
    {
        "id": 49,
        "date": "2017-06-04",
        "count": 2214
    },
    {
        "id": 50,
        "date": "2017-06-05",
        "count": 14534
    }
]
```

`/statistics?from=2017-11-26&to=2017-12-20&over=10000&under=1000000`

Output:

```js
[
    {
        "id": 224,
        "date": "2017-11-26",
        "count": 895102
    },
    {
        "id": 227,
        "date": "2017-11-29",
        "count": 137571
    },
    // ...
    {
        "id": 241,
        "date": "2017-12-13",
        "count": 471346
    },
    {
        "id": 243,
        "date": "2017-12-15",
        "count": 25590
    }
]
```

`/statistics?to=2017-12-20&equals=684826`

Output:

```js
[
    {
        "id": 129,
        "date": "2017-08-23",
        "count": 684826
    }
]
```

---

## `GET /statistics/milestones`

Returns an array containing the website's milestones including the following information:
- Count for said milestone to be hit
- If the milestone has been reached in Integer type (0 or 1 for false or true respectively)
- When the milestone was reached if yes (epoch timestamp)
- The ID of the sound that played when the milestone was hit

All additional info besides count will only be filled out if the milestone has been reached.
If it has not been reached, a dummy 0 value is filled out for the timestamp.

No milestones are activated by default, so none may exist.

### Headers

| Key          | Value                             |
| ------------ | --------------------------------- |
| Content-Type | application/x-www-form-urlencoded |

### Body

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

### Parameters

| Key      | Description                                       | Format     | Example      |
| -------- | ------------------------------------------------- | ---------- | ------------ |
| reached  | Whether the milestone needs to have been reached  | Integer    | 0 / 1        |
| sound_id  | ID the milestone must have been reached with      | Integer    | 42           |

#### Example requests

`/statistics/milestones`

Output:

```js
[
    {
        count: 100000,
        reached: 1,
        timestamp: 1555792165395,
        sound_id: 24
    },
    {
        count: 500000,
        reached: 1,
        timestamp: 1556152197176,
        sound_id: 42
    },
    {
        count: 1000000,
        reached: 0,
        timestamp: 0,
        sound_id: undefined
    }
]
```

`/statistics/milestones?reached=0`

Output:

```js
[
    {
        count: 1000000,
        reached: 0,
        timestamp: 0,
        sound_id: undefined
    }
]
```

`/statistics/milestones?sound_id=42`

Output:

```js
[
    {
        count: 500000,
        reached: 1,
        timestamp: 1556152197176,
        sound_id: 42
    }
]
```
---

## `GET /statistics/summary`

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

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

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

Returns an array of objects with data necessary for constructing the monthly click distribution chart displayed on the Statistics page.

### Headers

| Key          | Value                             |
| ------------ | --------------------------------- |
| Content-Type | application/x-www-form-urlencoded |

### Body

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

### Parameters

| Key    | Description             | Format  | Example    |
| ------ | ----------------------- | ------- | ---------- |
| from   | Month to begin data at  | YYYY-MM | 2018-07    |
| to     | Month to end data at    | YYYY-MM | 2018-10    |
| equals | Exact clicks in entry   | Integer | 684826     |
| over   | Minimum clicks in entry | Integer | 10000      |
| under  | Maximum clicks in entry | Integer | 1000000    |

Parameters behave exactly like the ones for the statistics endpoint, but based on months.

#### Example requests

`/statistics/chartData`

Output:

```js
[
    {
        "month": "2017-04",
        "count": 20085238
    },
    {
        "month": "2017-05",
        "count": 3652240
    },
    {
        "month": "2017-06",
        "count": 179360
    },
    {
        "month": "2017-07",
        "count": 150923
    },
    // ...
]
```

`/statistics/chartData?from=2018-07`

Output:

```js
[
    {
        "month": "2018-07",
        "count": 375994
    },
    {
        "month": "2018-08",
        "count": 266681
    },
    {
        "month": "2018-09",
        "count": 50542260
    },
    {
        "month": "2018-10",
        "count": 334915
    },
    // ...
]
```

`/statistics/chartData?to=2018-10`

Output:

```js
[
    {
        "month": "2017-04",
        "count": 20085238
    },
    {
        "month": "2017-05",
        "count": 3652240
    },
    // ...
    {
        "month": "2018-09",
        "count": 50542260
    },
    {
        "month": "2018-10",
        "count": 334915
    }
]
```

`/statistics/chartData?from=2018-07&to=2018-10`

Output:

```js
[
    {
        "month": "2018-07",
        "count": 375994
    },
    {
        "month": "2018-08",
        "count": 266681
    },
    {
        "month": "2018-09",
        "count": 50542260
    },
    {
        "month": "2018-10",
        "count": 334915
    }
]
```

---

## `POST /login`

Login route for the purpose of being able to access the admin panel page.

Admin routes can be accessed by providing an Authorization header, so this is usually not needed for anything but the actual website's browser representation.

### Headers

| Key          | Value                             |
| ------------ | --------------------------------- |
| Content-Type | application/x-www-form-urlencoded |

### Body

| Key   | Description                                       | Format | Example |
| ----- | ------------------------------------------------- | ------ | ------- |
| token | The auth token configured in the website settings | String | mytoken |

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

#### Example requests

`/login` with wrong token:

Output:

```js
{
    "code": 401,
    "name": "Access denied",
    "message": "Invalid token provided."
}
```

`/login` with correct token:

```js
{
    "code": 200,
    "message": "Successfully logged in!"
}
```

---

## `GET /admin/*` and `POST /admin/*`

Admin routes for various tasks.

### Headers

| Key           | Value                  |
| ------------- | ---------------------- |
| Authorization | Configured admin token |

The Authorization header **must** be provided for every admin route.
Body and Parameters vary by route.

If either no Authorization header or an incorrect one is provided, the following response will be returned:

```js
{
    "code": 401,
    "name": "Access denied",
    "message": "Invalid token provided."
}
```

Otherwise, responses vary by route.

---

## `GET /admin/logout`

Logout route that disables access to admin-only routes upon use.

### Headers

| Key           | Value                             |
| ------------- | --------------------------------- |
| Content-Type  | application/x-www-form-urlencoded |
| Authorization | Configured admin token            |

### Body

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

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

---

## `POST /admin/notification`

Send site-wide notifications to everyone viewing the website.

### Headers

| Key          | Value                             |
| ------------ | --------------------------------- |
| Content-Type | application/x-www-form-urlencoded |

### Body

| Key      | Description                            | Format  | Example |
| -------- | -------------------------------------- | ------- | ------- |
| text     | Notification text to display           | String  | hello!  |
| duration | Duration (seconds) of the notification | Integer | 5       |

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

#### Example requests

`/admin/notification` with:
- text `test notification`
- duration `3`

Output:

```js
{
    "code": 200,
    "message": "Notification sent."
}
```

---

## `POST /admin/sounds/upload`

Upload a new sound to the website.

### Headers

| Key          | Value               |
| ------------ | ------------------- |
| Content-Type | multipart/form-data |

### Body

| Key          | Description                                             | Type    | Example  |
| ------------ | ------------------------------------------------------- | ------- | -------- |
| file         | Sound file (mp3) that contains the sound to be played   | File    | -------- |
| filename     | Filename the sound file should be saved under           | Text    | laugh    |
| displayname* | Name the sound should be displayed under on the website | Text    | hahaha   |
| source*      | Origin of the soundclip (i.e. Season, OVA, Movie, etc)  | Text    | Season 2 |
| count*       | Preset count of the sound (defaults to 0)               | Integer | 5000     |
| theme*       | Theme for the soundclip (defaults to "megumin")         | Text    | goddess  |

\* Optional parameter

**Info**: While source and displayname are optional, if either is not provided, they won't show up on the soundboard or rankings (but be included on the main page button).

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

#### Example requests

`/admin/sounds/upload` with:
- file `test.mp3`
- filename `laugh`
- displayname `hahaha`
- source `Season 2`
- count `null`
- theme `null` (no theme defaults to `megumin`, the base sounds)

Output when there is no error:

```js
{
    "code": 200,
    "message": "Sound successfully uploaded.",
    "sound": {
        "id": 42,
        "filename": "laugh",
        "displayname": "hahaha",
        "source": "Season 2",
        "count": 0,
        "theme": "megumin"
    }
}
```

Output when filename is already in use:

```js
{
    "code": 400,
    "name": "Invalid filename",
    "message": "Sound filename already in use."
}
```

Output when no filename is provided:

```js
{
    "code": 400,
    "name": "Invalid filename",
    "message": "Filename must be provided."
}
```

Output when either no file or a non-mp3 file is provided:

```js
{
    "code": 400,
    "name": "Invalid file",
    "message": "An mp3 file must be provided."
}
```

Output when count is provided but not of integer type:

```js
{
    "code": 400,
    "name": "Invalid count",
    "message": "Count must be an integer if provided."
}
```

Output for other errors:

```js
{
    "code": 500,
    "name": "Serverside error",
    "message": "An unexpected error occurred."
}
```

---

## `PATCH /admin/sounds/modify`

Modify an existing sound on the website.

### Headers

| Key          | Value                             |
| ------------ | --------------------------------- |
| Content-Type | application/x-www-form-urlencoded |

### Body

| Key         | Description     | Format  | Example   |
| ----------- | --------------- | ------- | --------- |
| id          | Target sound ID | Integer | 42        |
| filename    | New filename    | String  | explosion |
| displayname | New displayname | String  | Boom!     |
| source      | New source      | String  | Movie 1   |
| count       | New count       | Integer | 5000      |
| theme       | New theme       | String  | darkness  |

All parameters are optional, but at least any one besides the ID must be provided.
Parameters that are not provided will remain unchanged.

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

#### Example requests

`/admin/sounds/modify` with:
- id `42`
- filename `explosion`
- displayname `Boom!`
- source `Movie 1`
- theme `darkness`

Output when there is no error:

```js
{
    "code": 200,
    "message": "Sound successfully modified.",
    "sound": {
        "id": 60,
        "filename": "explosion",
        "displayname": "Boom!",
        "source": "Movie 1",
        "count": 0,
        "theme": "darkness"
    }
}
```

Output when the requested sound (ID) was not found:
```js
{
    "code": 404,
    "name": "Invalid sound",
    "message": "Sound not found."
}
```

Output when count is provided but not of integer type:

```js
{
    "code": 400,
    "name": "Invalid count",
    "message": "Sound click count must be an integer if provided."
}
```

Output when no property to modify is provided:

```js
{
    "code": 400,
    "name": "Invalid parameters",
    "message": "At least one property to modify must be provided."
}
```

Output when filename is provided as empty strings:

```js
{
    "code": 400,
    "name": "Invalid filename",
    "message": "Sound filename may not be an empty string."
}
```

Output for misc. errors:

```js
{
    "code": 500,
    "name": "Serverside error",
    "message": "An unexpected error occurred."
}
```

---

## `DELETE /admin/sounds/delete`

Delete an existing sound from the website.

### Headers

| Key          | Value                             |
| ------------ | --------------------------------- |
| Content-Type | application/x-www-form-urlencoded |

### Body

| Key | Description                   | Format  | Example |
| --- | ----------------------------- | ------- | ------- |
| id  | ID of the sound to be deleted | Integer | 42      |

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

#### Example requests

`/admin/sounds/delete` with:
- id `42`

Output when there is no error:

```js
{
    "code": 200,
    "message": "Sound successfully deleted.",
    "sound": {
        "id": 42,
        "filename": "explosion",
        "displayname": "Boom!",
        "source": "Movie 1",
        "count": 0,
        "theme": "darkness"
    }
}
```

Output when the requested sound (ID) was not found:
```js
{
    "code": 404,
    "name": "Invalid sound",
    "message": "Sound not found."
}
```

Output for other errors:

```js
{
    "code": 500,
    "name": "Serverside error",
    "message": "An unexpected error occurred."
}
```

---

## `POST /admin/milestones/add`

Add a new milestone to the site.

### Headers

| Key          | Value                             |
| ------------ | --------------------------------- |
| Content-Type | application/x-www-form-urlencoded |

### Body

| Key       | Description                                         | Type    | Example       |
| --------- | --------------------------------------------------- | ------- | ------------- |
| count     | The count at which the milestone is reached         | Integer | 1000000       |
| reached   | Integer whether the milestone has been reached      | Integer | 0 / 1         |
| timestamp | Unix time of when the timestamp was reached         | Integer | 1555847635067 |
| sound_id   | ID of sound that played when milestone was reached  | Integer | 42            |

All values except `count` are optional and will be filled out once the milestone is reached.

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

#### Example requests

`/admin/milestones/add` with:
- count `1000000`

Output when there is no error:

```js
{
    "code": 200,
    "message": "Milestone successfully added.",
    "milestone": {
        "id": 5,
        "count": 1000000,
        "reached": 0,
        "timestamp": null,
        "sound_id": null
    }
}
```

Output when milestone with same count already exists:

```js
{
    "code": 400,
    "name": "Invalid count",
    "message": "Milestone with submitted count already exists."
}
```

Output when no count is provided:

```js
{
    "code": 400,
    "name": "Invalid count",
    "message": "Milestone count must be provided."
}
```

Output when count is not an integer:

```js
{
    "code": 400,
    "name": "Invalid count",
    "message": "Milestone count must be an integer."
}
```

Output when reached status is provided outside of 0 or 1 Boolean integer values:

```js
{
    "code": 400,
    "name": "Invalid status",
    "message": "Milestone reached status must be an integer of either 0 or 1 if provided."
}
```

Output when any other value is provided but not in Integer format:

```js
{
    "code": 400,
    "name": "Invalid status",
    "message": "Milestone reached status must be an integer if provided."
}
```

```js
{
    "code": 400,
    "name": "Invalid timestamp",
    "message": "Milestone timestamp must be an integer if provided."
}
```

```js
{
    "code": 400,
    "name": "Invalid sound",
    "message": "Milestone sound_id must be an integer if provided."
}
```

Output for other errors:

```js
{
    "code": 500,
    "name": "Serverside error",
    "message": "An unexpected error occurred."
}
```

---

## `PATCH /admin/milestones/modify`

Modify an existing sound on the website.

### Headers

| Key          | Value                             |
| ------------ | --------------------------------- |
| Content-Type | application/x-www-form-urlencoded |

### Body

| Key       | Description                                                | Format  | Example         |
| ----------| ---------------------------------------------------------- | ------- | --------------- |
| id        | ID of the milestone to modify                              | Integer | 5               |
| count     | New clicks count the milestone is for                      | Integer | 2000000         |
| reached   | New status as to whether the milestone has been reached    | Integer | 0 / 1           |
| timestamp | New unix timestamp for when the milestone was reached      | Integer | 1550247538345   |
| sound_id   | New ID of the sound that played when milestone was reached | Integer | 39              |

ID parameter is mandatory, all others are optional, but at least one must be filled out.

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

#### Example requests

`/admin/milestones/modify` with:
- id `5`
- count `2000000`
- reached `1`
- timestamp `1550247538345`
- sound_id `39`

Output when there is no error:

```js
{
    "code": 200,
    "message": "Milestone successfully modified.",
    "milestone": {
        "id": 5,
        "count": 2000000,
        "reached": 1,
        "timestamp": 1550247538345,
        "sound_id": 39
    }
}
```

Output when the requested milestone (ID) was not found:
```js
{
    "code": 404,
    "name": "Invalid milestone",
    "message": "Milestone not found."
}
```

Output for when no property to modify was submitted (i.e. only ID):
```js
{
    "code": 400,
    "name": "Invalid parameters",
    "message": "At least one property to modify must be provided."
}
```

Other responses (misc errors, wrong types for other properties) behave just like with adding milestones.

---

## `DELETE /admin/milestones/delete`

Delete an existing milestone from the website.

### Headers

| Key          | Value                             |
| ------------ | --------------------------------- |
| Content-Type | application/x-www-form-urlencoded |

### Body

| Key | Description                       | Format  | Example |
| --- | --------------------------------- | --------| ------- |
| id  | ID of the milestone to be deleted | Integer | 39      |

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

#### Example requests

`/admin/milestones/delete` with:
- id `5`

Output when there is no error:

```js
{
    "code": 200,
    "message": "Milestone successfully deleted.",
    "milestone": {
        "id": 5,
        "count": 2000000,
        "reached": 1,
        "timestamp": 1550247538345,
        "sound_id": 39
    }
}
```

Output when the requested milestone (ID) was not found:
```js
{
    "code": 404,
    "name": "Invalid milestone",
    "message": "Milestone not found."
}
```

Output for other errors:

```js
{
    "code": 500,
    "name": "Serverside error",
    "message": "An unexpected error occurred."
}
```

---