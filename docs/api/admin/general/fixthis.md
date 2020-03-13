## `GET /admin/*` and `POST /admin/*`

Admin routes for various tasks.

### Headers

| Key           | Value                  |
| ------------- | ---------------------- |
| Authorization | Configured admin token |

The Authorization header **must** be provided for every admin route.
Body and Parameters vary by route.

If either no Authorization header or an incorrect one is provided, the following response will be returned:

```json
{
    "code": 401,
    "name": "Access denied",
    "message": "Invalid token provided."
}
```