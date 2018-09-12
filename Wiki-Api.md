# Website API

Base domain for all requests is ``megumin.love/api``.
Response format for all routes is JSON.

---

`GET /counter`

Returns the current global counter.

## Parameters

| Key    | Description                            | Format     | Example    |
| ------ | -------------------------------------- | ---------- | ---------- |
| ------ | -------------------------------------- | ---------- | ---------- |

### Example requests

`/counter`

Output:

```js
{
    "counter": 59206101
}
```

---

`GET /statistics`

Returns an object containing the website's statistics, mapped by their corresponding date (JSON).

## Parameters

| Key    | Description                            | Format     | Example    |
| ------ | -------------------------------------- | ---------- | ---------- |
| from   | First day of statistics to be returned | YYYY-MM-DD | 2017-05-27 |
| to     | Last day of statistics to be returned  | YYYY-MM-DD | 2017-06-05 |
| equals | The exact  amount an entry must have   | Any number | 5000       |
| over   | The amount an entry must at least have | Any number | 9000       |
| under  | The amount an entry must at max have   | Any number | 7000       |

Supplying only the `from` parameter will result in the output only returning the specified date.

Supplying only the `to` parameter will result in the output starting at the earliest known date and return everything up to the specified date.

Omitting both the `from` and `to` parameter will return the entirety of the statistics from beginning to end.

Time (from, to) and amount (equals, over, under) filtering can be used together.

### Example requests

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

---

`GET /statistics/summary`

Returns a summary of various counter statistics containing:

- All-time clicks
- Today's clicks
- This week's clicks
- This month's clicks
- This year's clicks
- Average clicks this month.

This summary is not available for any other time than the time of the request, but you can use the data from the `/statistics` endpoint and aggregate it like this endpoint's output format to achieve the same result for a different point in time.


### Example requests

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