## `GET /admin/logout`

Logout route that disables access to admin-only routes via the web admin panel upon use.

### Headers

| Key           | Value                             |
| ------------- | --------------------------------- |
| Content-Type  | application/x-www-form-urlencoded |
| Authorization | Configured admin token            |

### Body

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

#### Example requests

`/admin/logout` while being logged in:

```json
{
    "code": 200,
    "message": "Successfully logged out!"
}
```