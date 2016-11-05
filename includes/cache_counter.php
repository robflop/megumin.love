<?php
error_reporting(0);
include('global_variables.php');
$db = new SQLite3('../../megumin_yamero.db');
$cacheCounter = new Memcached();
$cacheCounter->addServer(MEMCACHED_HOST, MEMCACHED_PORT) or die("Memcached connection failed!");

 if($db->lastErrorCode > 0) {
	printf('Last occured error code: %s\n', $db->lastErrorCode);
    die();
} 

if(!$cacheCounter->addServer(MEMCACHED_HOST, MEMCACHED_PORT)) {
    printf("Memcached server not running or connection failed, update aborted");
    die();
}

if(isset($_GET['count']) && $_GET['count'] == 1) {
   if($cacheCounter->get('yamero_counter') == false) {
    	$sqlVal = $db->querySingle("SELECT counter FROM yamero_counter");
		$cacheCounter->set('yamero_counter', $sqlVal);
    }
    else {
        $cacheCounter->increment('yamero_counter', 1);
    } 
}

$db->close();
?>