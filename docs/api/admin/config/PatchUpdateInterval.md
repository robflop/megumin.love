## `PATCH /admin/config/updateinterval`

Modify the interval at which the database is updated with counter values from cache.

### Headers

| Key          | Value                             |
| ------------ | --------------------------------- |
| Content-Type | application/x-www-form-urlencoded |

### Body

| Key      | Description                                             | Format  | Example |
| -------- | ------------------------------------------------------- | ------- | ------- |
| interval | The interval at which to update the database in minutes | Integer | 15      |

`interval` must be any integer greater than 0.

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

#### Example requests

`/admin/config/updateinterval` with:
- interval `15`

Output:

```json
{
    "code": 200,
    "message": "Update interval successfully updated",
    "limit": 15
}
```