## `PATCH /admin/config/ratelimit`

Modify the amount of clicks that can be sent from each unique IP every minute.

### Headers

| Key          | Value                             |
| ------------ | --------------------------------- |
| Content-Type | application/x-www-form-urlencoded |

### Body

| Key       | Description                                                                                          | Format  | Example |
| --------- | ---------------------------------------------------------------------------------------------------- | ------- | ------- |
| ratelimit | The amount of clicks a specific IP can send in one minute before being ratelimited until next minute | Integer | 10000   |

Set `-1` as value for `ratelimit` to disable the limit and allow unlimited clicks/requests.
Otherwise, `ratelimit` must be any integer above 0.

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

#### Example requests

`/admin/config/ratelimit` with:
- ratelimit `10000`

Output:

```json
{
    "code": 200,
    "message": "Click ratelimit successfully updated",
    "ratelimit": 10000
}
```