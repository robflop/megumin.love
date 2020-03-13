## `POST /admin/milestones/add`

Add a new milestone to the site.

### Headers

| Key           | Value                             |
| ------------- | --------------------------------- |
| Content-Type  | application/x-www-form-urlencoded |
| Authorization | Configured admin token            |

### Body

| Key       | Description                                         | Type    | Example       |
| --------- | --------------------------------------------------- | ------- | ------------- |
| count     | The count at which the milestone is reached         | Integer | 1000000       |
| reached   | Integer whether the milestone has been reached      | Integer | 0 / 1         |
| timestamp | Unix time of when the timestamp was reached         | Integer | 1555847635067 |
| sound_id  | ID of sound that played when milestone was reached  | Integer | 42            |

All values except `count` are optional and will be filled out once the milestone is reached.

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

#### Example requests

`/admin/milestones/add` with:
- count `1000000`

Output when there is no error:

```json
{
    "code": 200,
    "message": "Milestone successfully added.",
    "milestone": {
        "id": 5,
        "count": 1000000,
        "reached": 0,
        "timestamp": null,
        "sound_id": null
    }
}
```

Output when milestone with same count already exists:

```json
{
    "code": 400,
    "name": "Invalid count",
    "message": "Milestone with submitted count already exists."
}
```

Output when no count is provided:

```json
{
    "code": 400,
    "name": "Invalid count",
    "message": "Milestone count must be provided."
}
```

Output when count is not an integer:

```json
{
    "code": 400,
    "name": "Invalid count",
    "message": "Milestone count must be an integer."
}
```

Output when reached status is provided outside of 0 or 1 Boolean integer values:

```json
{
    "code": 400,
    "name": "Invalid status",
    "message": "Milestone reached status must be an integer of either 0 or 1 if provided."
}
```

Output when any other value is provided but not in Integer format:

```json
{
    "code": 400,
    "name": "Invalid status",
    "message": "Milestone reached status must be an integer if provided."
}
```

```json
{
    "code": 400,
    "name": "Invalid timestamp",
    "message": "Milestone timestamp must be an integer if provided."
}
```

```json
{
    "code": 400,
    "name": "Invalid sound",
    "message": "Milestone sound_id must be an integer if provided."
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