[![License](https://img.shields.io/badge/License-MPL-blue.svg)](https://github.com/robflop/Megumin/blob/master/LICENSE)
![Version](https://img.shields.io/badge/Version-1.1-blue.svg)
[![Website](https://img.shields.io/website-up-down-green-red/http/shields.io.svg?maxAge=2592000)](https://megumin.love)

>Original: https://megumin.love

# Megumin.love
A site committed to worshipping best girl Megumin!

Runs under JS/PHP with MySQL. [Memcached](https://pecl.php.net/package/memcached) (PECL) extension required for it to work.
Written under PHP5.6, no guarantees for PHP7.

## Usage:
- Adjust "global_variables.php" to fit your SQL and Memcached login info
- Create table "yamero_counter" with column "counter" or see below for prepared query using the "megumin_yamero" database
- Insert value zero (0) into previously created "counter" column of your "yamero_counter" table or see below
- (Optional: Install phpmemcachedadmin for a simple memcached control panel. Make sure you protect it!)
- Set up cronjob for update_sql.php -- this updates the cached counter to mysql with your set interval.
- Click!




##### MySQL prepared queries:

Table wih column -> CREATE TABLE megumin_yamero.yamero_counter ( counter INT NOT NULL ) ENGINE = InnoDB; 

Column insert -> INSERT INTO megumin_yamero.yamero_counter (counter) VALUES ('0');

