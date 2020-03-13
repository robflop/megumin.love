## `POST /admin/sounds/upload`

Upload a new sound to the website.

### Headers

| Key           | Value                             |
| ------------- | --------------------------------- |
| Content-Type  | application/x-www-form-urlencoded |
| Authorization | Configured admin token            |

### Body

| Key          | Description                                             | Type    | Example  |
| ------------ | ------------------------------------------------------- | ------- | -------- |
| file         | Sound file (mp3) that contains the sound to be played   | File    | -------- |
| filename     | Filename the sound file should be saved under           | Text    | laugh    |
| displayname* | Name the sound should be displayed under on the website | Text    | hahaha   |
| source*      | Origin of the soundclip (i.e. Season, OVA, Movie, etc)  | Text    | Season 2 |
| count*       | Preset count of the sound (defaults to 0)               | Integer | 5000     |
| theme*       | Theme for the soundclip (defaults to "megumin")         | Text    | goddess  |

\* Optional parameter

**Info**: While source and displayname are optional, if either is not provided, they won't show up on the soundboard or rankings (but be included on the main page button).

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

#### Example requests

`/admin/sounds/upload` with:
- file `test.mp3`
- filename `laugh`
- displayname `hahaha`
- source `Season 2`
- count `null`
- theme `null` (no theme defaults to `megumin`, the base sounds)

Output when there is no error:

```json
{
    "code": 200,
    "message": "Sound successfully uploaded.",
    "sound": {
        "id": 42,
        "filename": "laugh",
        "displayname": "hahaha",
        "source": "Season 2",
        "count": 0,
        "theme": "megumin"
    }
}
```

Output when filename is already in use:

```json
{
    "code": 400,
    "name": "Invalid filename",
    "message": "Sound filename already in use."
}
```

Output when no filename is provided:

```json
{
    "code": 400,
    "name": "Invalid filename",
    "message": "Filename must be provided."
}
```

Output when either no file or a non-mp3 file is provided:

```json
{
    "code": 400,
    "name": "Invalid file",
    "message": "An mp3 file must be provided."
}
```

Output when count is provided but not of integer type:

```json
{
    "code": 400,
    "name": "Invalid count",
    "message": "Count must be an integer if provided."
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