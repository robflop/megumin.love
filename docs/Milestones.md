## Adding new milestones

There are two ways to add notifications, via interface or manually.
If done via interface then no restart is required, if done manually changes only take effect on restart.

Using the interface is _highly_ recommended. It's much less effort and less prone to errors.

### Interface:
1) Open the admin panel at the `/admin` page and log in
2) Fill out the form for new milestones on the 2nd row to the very left and click "Add milestone"

### Manually:
1) Run this query with the value you want to use for the milestone:
	- `INSERT INTO milestones ( count, reached, timestamp, soundID ) VALUES ( <your>, <values>, <in>, <here> );`
3) Restart the website

All values except the count are optional, `reached` will default to 0 (i.e. not reached) if not set.
Other values are set to null by default.

## Modifying milestones

### Interface:
1) Open the admin panel at the `/admin` page and log in
2) Fill out the form for modifying milestones on the 2nd row in the center and click "Modify milestone".

### Manually:
1) Run this query with with the new values you want to use for the sound:
	- `UPDATE milestones SET count = <your>, reached = <values>, timestamp = <in>, soundID = <here> WHERE id = <milestone id>;`
2) Restart the website

All values are again optional and remain unchanged if not provided, but any one must be filled out.

## Deleting milestones

### Interface:
1) Open the admin panel at the `/admin` page and log in.
2) Fill out the form for removing milestones on the 2nd row to the right and click "Delete milestone"

### Manually:
1) Run this query with with the value for the sound you want to delete:
	- `DELETE FROM milestones WHERE id = <milestone id>;`
2) Restart the website