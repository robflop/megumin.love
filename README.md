>Original: https://megumin.love

# Megumin.love
A site committed to worshipping best girl Megumin!

Runs under JS/PHP with SQLite. [Memcached](https://pecl.php.net/package/memcached) (PECL) extension required for it to work.

Written under PHP5.6, no guarantees for PHP7.

## Usage:
- Adjust "global_variables.php" to fit your Memcached login info
- Create table "yamero_counter" with column "counter" or see below for prepared query using the "megumin_yamero" database
- Insert value zero (0) into previously created "counter" column of your "yamero_counter" table or see below
- (Optional: Install phpmemcachedadmin for a simple memcached control panel. Make sure you protect it!)
- Set up cronjob for update_sql.php -- this updates the cached counter to sqlite with your set interval.
- Click!


##### Information:
The default version of this website operates with a sqlite database called "megumin_yamero.db" located on folder on top of the webroot. It also assumes you run memcached on the same server, on port 11211.
Since the php files are located in /includes/ it has to grab two folders above. If you want to change the location and name of your database please take note of this and change as needed.

#### License

Licensed under the MIT License.

##### MySQL prepared queries:

Table with column -> CREATE TABLE yamero_counter ( counter INT NOT NULL ); 

Column insert -> INSERT INTO yamero_counter (counter) VALUES ('0');

### Adding new sounds:
- Add sound files to "sounds" folder (preferably mp3, aac and ogg format)
- Adjust count.js, adding new sound(s) to the ion.sound initialization and adjusting the switch() + rsound statement

#### Example:
Previous sounds amount: 12
- Add "test.mp3", (ogg, aac) to /sounds/
- Add "test" to the ion.sound initialization within count.js
- Adjust the rsound variable, so changing the multiplier 12 to 13 within count.js

New sounds amount: 13

### Changing the Interval at which the counter updates:
- Open index.php and change "1500" on line 72 to your desired length.
- Unit used is milliseconds, 1500ms stand for 1,5s.

