# Website statistics

`GET /stats`  
Returns an object containing the website's statistics, mapped by their corresponding date.

#### Parameters

| Key  | Description                            | Format     | Example    |
|------|----------------------------------------|------------|------------|
| from | First day of statistics to be returned | YYYY-MM-DD | 2017-05-27 |
| to   | Last day of statistics to be returned  | YYYY-MM-DD | 2017-06-05 |

Supplying only the `from` parameter will result in the output only returning the specified date.

Supplying only the `to` parameter will result in the output starting at the earliest known date and return everything up to the specified date.

Omitting both the `from` and `to` parameter will return the entirety of the statistics from beginning to end.

#### Example request

`/stats?from=2017-05-27&to=2017-06-05`

Output:

```js
{
"2017-05-27":529745,
"2017-05-28":3694,
"2017-05-29":3148,
"2017-05-30":3296,
"2017-05-31":2725,
"2017-06-01":14945,
"2017-06-02":12012,
"2017-06-03":1518,
"2017-06-04":2214,
"2017-06-05":14534
}
```

---

`GET /counter?statistics`  
Returns an object containing the overall statistics, seperated into all-time clicks, today's clicks, this week's clicks, this month's clicks and average clicks this month. Not available for any other time than the current.

#### Parameters

- None

#### Example request

`/counter?statistics`

Output:

```js
{
  "alltime": 21198920,
  "today": 558,
  "week": 17430,
  "month": 8489,
  "average": 4245
}
```

---