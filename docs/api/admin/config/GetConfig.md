## `GET /admin/config`

Returns internal configuration values of the website meant for admin-use only.

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

`/admin/config`

Output:

```json
{
    "updateInterval": 15,
    "socketConnections": -1,
    "requestsPerMinute": -1,
    "responseInterval": -1
}
```