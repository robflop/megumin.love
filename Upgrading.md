# Various instructions for how to upgrade from previous versions

## Breaking version changes (e.g. 5.x -> 6.x)

If below version 5.0.0, use the [v4 -> v5 database migration script](https://github.com/robflop/megumin.love/blob/master/legacy_upgrade/dbUpdate_v5.js) before anything else.

If upgrading from version 5.1.0 to version 6.0.0 use the [v5 -> v6 database migration script](https://github.com/robflop/megumin.love/blob/master/legacy_upgrade/dbUpdate_v6.js) before anything else.

If below version 5.0.0 and trying to upgrade to version 6.0.0, first use the v4 -> v5 migration script and then use the v5 -> v6 migration script, both linked above.

---

## Adding sounds of new versions to existing instances

Use these queries starting at version 5.0.0 when updating to any version beyond 5.0.0 -- if updating through multiple versions, use each update's section. (e.g. updating from 5.0.0 to 5.3.0 would have you use the queries from 5.1.x, 5.2.x and 5.3.0)

The [sqlite3 CLI tool](https://sqlite.org/cli.html) is recommended to be used alongside these queries.

### Version 5.1.0
- No queries necessary

### Version 6.0.0
- No queries necessary

---