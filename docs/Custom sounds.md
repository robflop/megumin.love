## Adding custom sounds

There are two ways to add custom sounds starting with version 5.0.0 -- via interface or manually.
If done via interface then no restart is required, if done manually changes only take effect on restart.

Using the interface is _highly_ recommended. It's much less effort and less prone to errors.

For manual management: `[theme]` always stands for a sound's association. E.g. A soundclip from Megumin (such as "Explosion") would have no theme and go into the `megumin` subfolder of the sounds folder and a Kazuma clip (such as "Steal") has the theme "kazuma" and goes into the "kazuma" subfolder of sounds.

### Interface:
1) Open the admin panel at the `/admin` page and log in
2) Fill out the form for uploads on the very left and click "Upload sound"

### Manually:
1) Put your new mp3 sound file in the `src/resources/sounds/[theme]` folder
2) Run this query with the values you want to use for the sound:
	- `INSERT INTO sounds ( filename, displayname, source, count, theme ) VALUES ( <your>, <values>, <here>, 0, <optional value> );`
3) Restart the website

## Modifying sounds

### Interface:
1) Open the admin panel at the `/admin` page and log in
2) Fill out the form for modifying in the center and click "Modify sound".

### Manually:
1) Rename the file in the `src/resources/sounds/[theme]` folder
2) Run this query with with the new values you want to use for the sound:
	- `UPDATE sounds SET filename = <your>, displayname = <values>, source = <here>, count = <and>, theme = <here> WHERE id = <id>;`
3) Restart the website

All values are optional, but at least any one must be filled out.

## Removing sounds

### Interface:
1) Open the admin panel at the `/admin` page and log in.
2) Fill out the form for deletion to the right and click "Delete sound"

### Manually:
1) Delete the file in the `src/resources/sounds/[theme]` folder
2) Run this query with with the value for the sound you want to delete:
	- `DELETE FROM sounds WHERE filename = <your value here>;`
3) Restart the website