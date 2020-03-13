## `PATCH /admin/config/connectionlimit`

Modify the number of websocket connections a user can have opened from the same IP simultaneously.

### Headers

| Key          | Value                             |
| ------------ | --------------------------------- |
| Content-Type | application/x-www-form-urlencoded |

### Body

| Key         | Description                                                               | Format  | Example |
| ----------- | ------------------------------------------------------------------------- | ------- | ------- |
| connections | The number of simultaneous websocket connections allowed from the same IP | Integer | 2       |

Set `-1` as value for `connections` to disable the limit and allow unlimited connections.
Otherwise, `connections` must be any integer above 0.

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

#### Example requests

`/admin/config/updateinterval` with:
- connections: 2

Output:

```json
{
    "code": 200,
    "message": "Connection limit successfully updated",
    "connections": 2
}
```