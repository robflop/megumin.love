<?php
/* 
* I suggest to keep files like this (and all PHP files that don't require ajax or a direct connection to the client) 
* outside of the webroot (for example, in the folder above public_html). Easier to manage, and will keep these more secure. 
*/
define('HOST', 'localhost'); //Designated URL for your SQL server
define('USERNAME', 'user'); //Username of...user
define('PASSWORD', 'password'); //Password of aformentioned user
define('DATABASE', 'database_name'); //Name of the database that contains the table 'megumin_love_counter'
?>