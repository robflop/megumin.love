## `POST /login`

Login route for the purpose of being able to access the admin panel page.

Admin routes can be accessed by providing an Authorization header, so this is usually not needed for anything but the actual website's browser representation.

### Headers

| Key          | Value                             |
| ------------ | --------------------------------- |
| Content-Type | application/x-www-form-urlencoded |

### Body

| Key   | Description                                       | Format | Example |
| ----- | ------------------------------------------------- | ------ | ------- |
| token | The auth token configured in the website settings | String | mytoken |

### Parameters

| Key | Description | Format | Example |
| --- | ----------- | ------ | ------- |
| --- | ----------- | ------ | ------- |

#### Example requests

`/login` with wrong token:

Output:

```json
{
    "code": 401,
    "name": "Access denied",
    "message": "Invalid token provided."
}
```

`/login` with correct token:

```json
{
    "code": 200,
    "message": "Successfully logged in!"
}
```