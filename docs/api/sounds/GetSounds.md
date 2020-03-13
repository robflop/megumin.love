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

```json
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

```json
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

```json
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