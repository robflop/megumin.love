# Updating existing instances to newer versions

**No matter the update, _always_ read the patchnotes. They can contain important information.**

## Breaking version changes (e.g. 5.x.x -> 6.x.x)

- When updating from any major version to another, make sure to check if there are any relevant migration scripts (for e.g. adjustment of database structures).
- Similar to a ladder, each major version represents a step.
- For every major you are behind, use the migration script to the next closest version until you reach either the desired version or the latest version.
- In addition to this, check the below Minor version changes section for instructions on adding new sounds that may ship with newer versions to your instance.

For example, if you are currently on version 4.x.x and want to update to version 6.x.x, you would:
- Run the script for migrating from Major version 4 to Major version 5.
- Run the script for migrating from Major version 5 to Major version 6.

Migration scripts are located [here](https://github.com/robflop/megumin.love/blob/master/legacy_update/).

---

## Minor version changes (e.g. 5.1.x -> 5.2.x)

Overwrite the relevant files with the new ones, but be sure to double check. No migration necessary.

If following these instructions after a major version update, only execute these queries after you have finished going through all migration scripts.

### Adding sounds of new versions to existing instances

- If a new version ships adds new sounds, follow these instructions for the relevant versions.
- If updating from multiple versions behind (e.g. 5.1.x to 5.3.x), follow the instructions for every version starting at 5.1.x up to 5.3.x.
- If no instructions exist for specific versions, then no action needs to be taken.

The [sqlite3 CLI tool](https://sqlite.org/cli.html) is recommended to be used alongside these queries.

#### Before version 5.0.0
- Prior to version 5.0.0, most sound info was not saved in the database as it is now, so no relevant queries exist.

---

## Patch version changes (e.g. 5.x.1 -> 5.x.2)

Simply overwrite the relevant files with the new ones, but be sure to double check.

---