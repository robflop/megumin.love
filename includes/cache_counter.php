<?php
error_reporting(0);
include('global_variables.php');
$cacheCounter = new Memcached();
$cacheCounter->addServer(MEMCACHED_HOST, MEMCACHED_PORT) or die ("Memcached connection failed!");
$db = new mysqli(HOST, USERNAME, PASSWORD, DATABASE);

if($db->connect_errno > 0) {
	printf('Error connecting to database: %s\n', $db->connect_error);
	die();
}

if(isset($_GET['count']) && $_GET['count'] == 1) {
   if($cacheCounter->get('yamero_counter') == false) {
        $sqlVal = $db->query("SELECT counter FROM yamero_counter")->fetch_row()[0];
        $cacheCounter->set('yamero_counter', $sqlVal);
    }
    else {
        $cacheCounter->increment('yamero_counter', 1);
    } 
}

echo $cacheCounter->get('yamero_counter');
?>