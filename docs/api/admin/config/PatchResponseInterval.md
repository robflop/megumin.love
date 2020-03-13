## `PATCH /admin/config/responseinterval`

Modify the interval at which the socket server sends a counter update event to all connected clients.

### Headers

| Key          | Value                             |
| ------------ | --------------------------------- |
| Content-Type | application/x-www-form-urlencoded |

### Body

| Key      | Description                                                   | Format  | Example |
| -------- | ------------------------------------------------------------- | ------- | ------- |
| interval | The interval at which to send a websocket update milliseconds | Integer | 1000    |

Set `-1` as value for `interval` to disable the response interval and immediately send responses for all events.
Otherwise, `interval` must be any integer above 0.

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

#### Example requests

`/admin/config/responseinterval` with:
- interval `1000`

Output:

```json
{
    "code": 200,
    "message": "Response interval successfully updated",
    "limit": 15
}
```