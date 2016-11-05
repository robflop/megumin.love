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
 
$sqlVal = $db->querySingle("SELECT counter FROM yamero_counter");
$count = $cacheCounter->get('yamero_counter');
if($count < $sqlVal) {
    $cacheCounter->set('yamero_counter', $sqlVal);
} else {
    $updateSql = 'UPDATE yamero_counter SET `counter` = '.$count;
    if(!$db->query($updateSql))
    	echo $db->error;
	
}
$db->close();
?>