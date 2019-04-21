## Adding new milestones

There are two ways to add notifications, via interface or manually.
If done via interface then no restart is required, if done manually changes only take effect on restart.

Using the interface is _highly_ recommended. It's much less effort and less prone to errors.

### Interface:
1) Open the admin panel at the `/admin` page and log in
2) Fill out the form for new milestones on the 2nd row to the very left and click "Add milestone"

### Manually:
1) Run this query with the value you want to use for the milestone:
	- `INSERT INTO milestones ( count ) VALUES ( <your milestone count> );`
3) Restart the website

## Modifying milestones

### Interface:
1) Open the admin panel at the `/admin` page and log in
2) Fill out the form for modifying milestones on the 2nd row in the center and click "Modify milestone".

### Manually:
1) Run this query with with the new values you want to use for the sound:
	- `UPDATE milestones SET count = <your>, achieved = <values>, timestamp = <in>, soundID = <here> WHERE id = <milestone id>;`
2) Restart the website

## Removing milestones

### Interface:
1) Open the admin panel at the `/admin` page and log in.
2) Fill out the form for removing milestones on the 2nd row to the right and click "Remove milestone"

### Manually:
1) Run this query with with the value for the sound you want to delete:
	- `DELETE FROM milestones WHERE id = <milestone id>;`
2) Restart the website