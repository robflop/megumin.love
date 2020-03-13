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

```json
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

```json
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

```json
[
    {
        "id": 129,
        "date": "2017-08-23",
        "count": 684826
    }
]
```