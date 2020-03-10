define({ "api": [
  {
    "type": "GET",
    "url": "/counter",
    "title": "Get main counter",
    "name": "GetCounter",
    "group": "General",
    "examples": [
      {
        "title": "Example Request:",
        "content": "$ curl -X GET 'https://megumin.love/api/counter'",
        "type": "curl"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "counter",
            "description": "<p>The website's main counter</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Example Response:",
          "content": "{\n    \"counter\": 59206101\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/server.js",
    "groupTitle": "General"
  },
  {
    "type": "get",
    "url": "/meta",
    "title": "Get Meta Information",
    "name": "GetMeta",
    "group": "General",
    "examples": [
      {
        "title": "Example Request:",
        "content": "$ curl -X GET 'https://megumin.love/api/meta'",
        "type": "curl"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "port",
            "description": "<p>The website's port</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "version",
            "description": "<p>The website's version</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Example Response:",
          "content": "{\n    \"port\": 5959,\n    \"version\": \"9.0.0\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/server.js",
    "groupTitle": "General"
  },
  {
    "type": "GET",
    "url": "/themes",
    "title": "Get all themes",
    "name": "GetThemes",
    "group": "General",
    "examples": [
      {
        "title": "Example Request:",
        "content": "$ curl -X GET 'https://megumin.love/api/themes'",
        "type": "curl"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "themes",
            "description": "<p>An array containing the available theme names</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Example Response:",
          "content": "[\n   \"megumin\",\n   \"aqua\",\n   \"darkness\",\n   \"kazuma\"\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/server.js",
    "groupTitle": "General"
  },
  {
    "type": "GET",
    "url": "/sounds",
    "title": "Get sound data",
    "name": "GetSounds",
    "group": "Sounds",
    "parameter": {
      "fields": {
        "Query string": [
          {
            "group": "Query string",
            "type": "String",
            "optional": false,
            "field": "theme",
            "description": "<p>Theme name to filter the sounds by (acquired via <code>/themes</code>). E.g.:</p> <pre class=\"prettyprint\">theme=megumin </code></pre>"
          },
          {
            "group": "Query string",
            "type": "String",
            "optional": false,
            "field": "source",
            "description": "<p>Source name to filter the sounds by. E.g.:</p> <pre class=\"prettyprint\">source=Season 1 </code></pre>"
          },
          {
            "group": "Query string",
            "type": "Number",
            "optional": false,
            "field": "equals",
            "description": "<p>Exact click amount to filter the sounds by. E.g.:</p> <pre class=\"prettyprint\">equals=51840 </code></pre>"
          },
          {
            "group": "Query string",
            "type": "Number",
            "optional": false,
            "field": "over",
            "description": "<p>Minimum (exclusive) click amount to filter the sounds by. E.g.:</p> <pre class=\"prettyprint\">over=25000 </code></pre>"
          },
          {
            "group": "Query string",
            "type": "Number",
            "optional": false,
            "field": "under",
            "description": "<p>Maximum (exclusive) click amount to filter the sounds by E.g.:</p> <pre class=\"prettyprint\">under=50000 </code></pre>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Unfiltered example:",
        "content": "$ curl -X GET 'https://megumin.love/api/sounds'",
        "type": "curl"
      },
      {
        "title": "Example with parameters:",
        "content": "$ curl -X GET 'https://megumin.love/api/sounds?source=Season%201&over=25000&under=50000'",
        "type": "curl"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "sounds",
            "description": "<p>An array containing sound objects</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "sounds.id",
            "description": "<p>The id of the sound</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "sounds.filename",
            "description": "<p>The backend filename of the sound</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "sounds.displayname",
            "description": "<p>The frontend display name of the sound</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "sounds.source",
            "description": "<p>The source of the sound</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "sounds.count",
            "description": "<p>The soundboard click counter of the sound</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Successful unfiltered response:",
          "content": " [\n    {\n        \"id\": 1,\n        \"filename\": \"eugh1\",\n        \"displayname\": \"Eugh #1\",\n        \"source\": \"Season 1\",\n        \"count\": 15532\n    },\n    {\n        \"id\": 2,\n        \"filename\": \"eugh2\",\n        \"displayname\": \"Eugh #2\",\n        \"source\": \"Season 1\",\n        \"count\": 12671\n    },\n    // Potentially more sounds ...\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/server.js",
    "groupTitle": "Sounds"
  }
] });
