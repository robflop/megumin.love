## `GET /meta`

Returns meta information about the website, such as the current version as well as connection info such as the port or whether the instance is behind a proxy.
Mostly used when accessing the website in a browser, so that the browser fills in relevant data on the page and establishes connections properly.

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

##### Example requests

`/meta`

Output:

```json
{
    "port": 5959,
    "version": "8.1.0"
}
```