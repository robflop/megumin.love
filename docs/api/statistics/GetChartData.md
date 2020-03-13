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

```json
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

```json
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

```json
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

```json
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