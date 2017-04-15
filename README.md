>Original: https://megumin.love

# Megumin.love
A site committed to worshipping best girl Megumin!

Runs under JS/PHP with SQLite. [Memcached](https://pecl.php.net/package/memcached) (PECL) extension required for it to work.

Written under PHP5.6, no guarantees for PHP7.

## Usage:
- Adjust `global_variables.php` to fit your Memcached login info and database path
- Create table `yamero_counter` with column `counter` or see below for prepared query
- Insert value zero (0) into previously created `counter` column of your `yamero_counter` table or see below
- (Optional: Install phpmemcachedadmin for a simple memcached control panel. Make sure you protect it!)
- Set up cronjob for `update_sql.php` -- this updates the cached counter to sqlite with your set interval.
- Click!


##### Information:
The default version of this website operates with a sqlite database called `megumin_yamero.db` located on folder on top of the webroot. It also assumes you run memcached on the same server, on port 11211.
Since the php files are located in `/includes/` it has to grab two folders above. If you want to change the location and name of your database please take note of this and change as needed.

#### License

Licensed under the MIT License.

##### MySQL prepared queries:

Table with column -> `CREATE TABLE yamero_counter ( counter INT NOT NULL );`

Column insert -> `INSERT INTO yamero_counter (counter) VALUES ('0');`

### Adding new sounds:
- Put your new sound files in the `/sounds/` folder (in mp3, ogg, aac and format)
- Add your sound's name (name of the files!) to the sounds array in ``/js/sounds.js``

And that's it. Your sound will automatically be added to the main button's available sounds.

##### INFO:
To add new sounds to the Soundboard, a button for each has to be created in the `soundboard.html` file.

### Changing the Interval at which the counter updates:
- Open `index.php` and change `1500` on line 72 to your desired length.
- Unit used is milliseconds, 1500ms stand for 1,5s.

