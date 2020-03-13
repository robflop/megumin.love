## `DELETE /admin/milestones/delete`

Delete an existing milestone from the website.

### Headers

| Key           | Value                             |
| ------------- | --------------------------------- |
| Content-Type  | application/x-www-form-urlencoded |
| Authorization | Configured admin token            |

### Body

| Key | Description                       | Format  | Example |
| --- | --------------------------------- | --------| ------- |
| id  | ID of the milestone to be deleted | Integer | 39      |

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

#### Example requests

`/admin/milestones/delete` with:
- id `5`

Output when there is no error:

```json
{
    "code": 200,
    "message": "Milestone successfully deleted.",
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

Output for other errors:

```json
{
    "code": 500,
    "name": "Serverside error",
    "message": "An unexpected error occurred."
}
```