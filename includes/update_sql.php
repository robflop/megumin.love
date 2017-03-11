<?php
error_reporting(0);
include('global_variables.php'); // Load necessary ressources and make connections
$db = new SQLite3('/var/www/megumin_yamero.db');
$cacheCounter = new Memcached();
$cacheCounter->addServer(MEMCACHED_HOST, MEMCACHED_PORT) or die("Memcached connection failed!");

if($db->lastErrorCode > 0) {
	printf('Last occured error code: %s\n', $db->lastErrorCode);
    die();
}
 // Check if memcached is running to prevent db corruption
if(!$cacheCounter->addServer(MEMCACHED_HOST, MEMCACHED_PORT)) {
    printf("Memcached server not running or connection failed, update aborted");
    die();
}
 
$sqlVal = $db->querySingle("SELECT counter FROM yamero_counter");
$count = $cacheCounter->get('yamero_counter');
if($count < $sqlVal) { // Set memcached value to db value if db > memcached
    $cacheCounter->set('yamero_counter', $sqlVal);
} else { // Send query to update db value to memcached value if memcached > db
    $updateSql = 'UPDATE yamero_counter SET `counter` = '.$count;
    if(!$db->query($updateSql))
    	echo $db->error;
}
// Close db connection
$db->close();
?>