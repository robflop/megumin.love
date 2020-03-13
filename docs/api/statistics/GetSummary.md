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

```json
{
    "alltime": 59206101,
    "daily": 336,
    "weekly": 336,
    "monthly": 26462,
    "yearly": 1706841,
    "average": 4410
}
```