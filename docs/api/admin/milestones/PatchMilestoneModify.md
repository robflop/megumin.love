## `PATCH /admin/milestones/modify`

Modify an existing sound on the website.

### Headers

| Key           | Value                             |
| ------------- | --------------------------------- |
| Content-Type  | application/x-www-form-urlencoded |
| Authorization | Configured admin token            |

### Body

| Key       | Description                                                | Format  | Example         |
| ----------| ---------------------------------------------------------- | ------- | --------------- |
| id        | ID of the milestone to modify                              | Integer | 5               |
| count     | New clicks count the milestone is for                      | Integer | 2000000         |
| reached   | New status as to whether the milestone has been reached    | Integer | 0 / 1           |
| timestamp | New unix timestamp for when the milestone was reached      | Integer | 1550247538345   |
| sound_id   | New ID of the sound that played when milestone was reached | Integer | 39              |

ID parameter is mandatory, all others are optional, but at least one must be filled out.

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

#### Example requests

`/admin/milestones/modify` with:
- id `5`
- count `2000000`
- reached `1`
- timestamp `1550247538345`
- sound_id `39`

Output when there is no error:

```json
{
    "code": 200,
    "message": "Milestone successfully modified.",
    "milestone": {
        "id": 5,
        "count": 2000000,
        "reached": 1,
        "timestamp": 1550247538345,
        "sound_id": 39
    }
}
```

Output when the requested milestone (ID) was not found:
```json
{
    "code": 404,
    "name": "Invalid milestone",
    "message": "Milestone not found."
}
```

Output for when no property to modify was submitted (i.e. only ID):
```json
{
    "code": 400,
    "name": "Invalid parameters",
    "message": "At least one property to modify must be provided."
}
```

Other responses (misc errors, wrong types for other properties) behave just like with adding milestones.