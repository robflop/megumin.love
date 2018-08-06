# Website API

Base domain for all requests is ``megumin.love/api``.
Response format for all routes is JSON.

---

`GET /counter`

Returns the current global counter.

## Parameters

| Key          | Description                                             | Format | Example |
| ------------ | ------------------------------------------------------- | ------ | ------- |
| statistics   | Whether to output current statistics instead of counter | N/A    | N/A     |

When the statistics parameter is provided, summarized counter statistics, such as all-time clicks, today's clicks, this week's clicks, this month's clicks, this year's clicks and average clicks this month will be provided all in one.

This summary is not available for any other time than the current (use the data from the `/statistics` endpoint for that).

### Example requests

`/counter`

Output:

```js
{
    "counter": 59206101
}
```

`/counter?statistics`

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