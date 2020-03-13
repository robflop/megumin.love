## `PATCH /admin/sounds/modify`

Modify an existing sound on the website.

### Headers

| Key           | Value                             |
| ------------- | --------------------------------- |
| Content-Type  | application/x-www-form-urlencoded |
| Authorization | Configured admin token            |

### Body

| Key         | Description     | Format  | Example   |
| ----------- | --------------- | ------- | --------- |
| id          | Target sound ID | Integer | 42        |
| filename    | New filename    | String  | explosion |
| displayname | New displayname | String  | Boom!     |
| source      | New source      | String  | Movie 1   |
| count       | New count       | Integer | 5000      |
| theme       | New theme       | String  | darkness  |

All parameters are optional, but at least any one besides the ID must be provided.
Parameters that are not provided will remain unchanged.

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

#### Example requests

`/admin/sounds/modify` with:
- id `42`
- filename `explosion`
- displayname `Boom!`
- source `Movie 1`
- theme `darkness`

Output when there is no error:

```json
{
    "code": 200,
    "message": "Sound successfully modified.",
    "sound": {
        "id": 60,
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

Output when count is provided but not of integer type:

```json
{
    "code": 400,
    "name": "Invalid count",
    "message": "Sound click count must be an integer if provided."
}
```

Output when no property to modify is provided:

```json
{
    "code": 400,
    "name": "Invalid parameters",
    "message": "At least one property to modify must be provided."
}
```

Output when filename is provided as empty strings:

```json
{
    "code": 400,
    "name": "Invalid filename",
    "message": "Sound filename may not be an empty string."
}
```

Output for misc. errors:

```json
{
    "code": 500,
    "name": "Serverside error",
    "message": "An unexpected error occurred."
}
```