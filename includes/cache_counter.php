<?php
error_reporting(0);
include('global_variables.php'); // Load necessary ressources and make connections
$db = new SQLite3(DATABASE_PATH);
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
// Check if GET request has proper values
if(isset($_GET['count']) && $_GET['count'] == 1) {
	if($cacheCounter->get('yamero_counter') == false) {
	// Check if memcached keypair is loaded and if not load from db
		$sqlVal = $db->querySingle("SELECT counter FROM yamero_counter");
		$cacheCounter->set('yamero_counter', $sqlVal);
    }
    else { // If memcached value is loaded, increment it by 1
        $cacheCounter->increment('yamero_counter', 1);
    }
}
// Close db connection
$db->close();
?>