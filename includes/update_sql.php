<?php
ini_set('display_errors', 1);
include('global_variables.php');
$db = new mysqli(HOST, USERNAME, PASSWORD, DATABASE);
$cacheCounter = new Memcached();
$cacheCounter->addServer(MEMCACHED_HOST, MEMCACHED_PORT) or die ("Memcached connection failed!");
 
if($db->connect_errno > 0) {
    printf('Error connecting to database:'. $db->connect_error);
    die();
}
 
if(!$cacheCounter->addServer(MEMCACHED_HOST, MEMCACHED_PORT)) {
    printf("Memcached server not running, update aborted");
    die();
}
 
$sqlVal = $db->query("SELECT counter FROM yamero_counter")->fetch_row()[0];
$count = $cacheCounter->get('yamero_counter');
if($count < $sqlVal) {
    $cacheCounter->set('yamero_counter', $sqlVal);
} else {
    $updateSql = 'UPDATE yamero_counter SET `counter` = '.$count;
    if(!$db->query($updateSql))
        echo $db->error;
}
 
 
?>