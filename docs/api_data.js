define({ "api": [
  {
    "type": "get",
    "url": "/meta",
    "title": "Get Meta Information",
    "name": "GetMeta",
    "group": "Meta",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Number",
            "optional": false,
            "field": "port",
            "description": "<p>The website's port</p>"
          },
          {
            "group": "200",
            "type": "Boolean",
            "optional": false,
            "field": "proxy",
            "description": "<p>Whether the proxy setting is activated</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "version",
            "description": "<p>The website's version</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"port\": 5959,\n    \"proxy\": false,\n    \"version\": \"9.0.0\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/server.js",
    "groupTitle": "Meta"
  }
] });
