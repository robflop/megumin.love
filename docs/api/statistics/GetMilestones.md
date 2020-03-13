## `GET /statistics/milestones`

Returns an array containing the website's milestones including the following information:
- Count for said milestone to be hit
- If the milestone has been reached in Integer type (0 or 1 for false or true respectively)
- When the milestone was reached if yes (epoch timestamp)
- The ID of the sound that played when the milestone was hit

All additional info besides count will only be filled out if the milestone has been reached.
If it has not been reached, a dummy 0 value is filled out for the timestamp.

No milestones are activated by default, so none may exist.

### Headers

| Key          | Value                             |
| ------------ | --------------------------------- |
| Content-Type | application/x-www-form-urlencoded |

### Body

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

### Parameters

| Key      | Description                                       | Format     | Example      |
| -------- | ------------------------------------------------- | ---------- | ------------ |
| reached  | Whether the milestone needs to have been reached  | Integer    | 0 / 1        |
| sound_id | ID the milestone must have been reached with      | Integer    | 42           |

#### Example requests

`/statistics/milestones`

Output:

```json
[
    {
        "count": 100000,
        "reached": 1,
        "timestamp": 1555792165395,
        "sound_id": 24
    },
    {
        "count": 500000,
        "reached": 1,
        "timestamp": 1556152197176,
        "sound_id": 42
    },
    {
        "count": 1000000,
        "reached": 0,
        "timestamp": 0,
        "sound_id": null
    }
]
```

`/statistics/milestones?reached=0`

Output:

```json
[
    {
        "count": 1000000,
        "reached": 0,
        "timestamp": 0,
        "sound_id": null
    }
]
```

`/statistics/milestones?sound_id=42`

Output:

```json
[
    {
        "count": 500000,
        "reached": 1,
        "timestamp": 1556152197176,
        "sound_id": 42
    }
]
```