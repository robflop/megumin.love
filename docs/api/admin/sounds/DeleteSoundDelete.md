## `DELETE /admin/sounds/delete`

Delete an existing sound from the website.

### Headers

| Key           | Value                             |
| ------------- | --------------------------------- |
| Content-Type  | application/x-www-form-urlencoded |
| Authorization | Configured admin token            |

### Body

| Key | Description                   | Format  | Example |
| --- | ----------------------------- | ------- | ------- |
| id  | ID of the sound to be deleted | Integer | 42      |

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

#### Example requests

`/admin/sounds/delete` with:
- id `42`

Output when there is no error:

```json
{
    "code": 200,
    "message": "Sound successfully deleted.",
    "sound": {
        "id": 42,
        "filename": "explosion",
        "displayname": "Boom!",
        "source": "Movie 1",
        "count": 0,
        "theme": "darkness"
    }
}
```

Output when the requested sound (ID) was not found:
```json
{
    "code": 404,
    "name": "Invalid sound",
    "message": "Sound not found."
}
```

Output for other errors:

```json
{
    "code": 500,
    "name": "Serverside error",
    "message": "An unexpected error occurred."
}
```