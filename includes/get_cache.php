<?php
include('global_variables.php'); // Load necessary ressources and make connections
$cacheCounter = new Memcached();
$cacheCounter->addServer(MEMCACHED_HOST, MEMCACHED_PORT) or die("Memcached connection failed!");

 // Check if memcached is running to prevent db corruption
if(!$cacheCounter->addServer(MEMCACHED_HOST, MEMCACHED_PORT)) {
    printf("Memcached server not running or connection failed, update aborted");
    die();
}

$cacheNumber = $cacheCounter->get('yamero_counter');
echo $cacheNumber;
?>