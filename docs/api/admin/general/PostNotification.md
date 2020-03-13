## `POST /admin/notification`

Send site-wide notifications to everyone viewing the website.

### Headers

| Key           | Value                             |
| ------------- | --------------------------------- |
| Content-Type  | application/x-www-form-urlencoded |
| Authorization | Configured admin token            |

### Body

| Key      | Description                            | Format  | Example |
| -------- | -------------------------------------- | ------- | ------- |
| text     | Notification text to display           | String  | hello!  |
| duration | Duration (seconds) of the notification | Integer | 5       |

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

#### Example requests

`/admin/notification` with:
- text `test notification`
- duration `3`

Output:

```json
{
    "code": 200,
	"message": "Notification sent.",
	"notification": {
		"text": "test notification",
		"duration": 3
	}
}
```