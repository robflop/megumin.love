<?php
error_reporting(0);
include_once('global_variables.php');
$db = new mysqli(HOST, USERNAME, PASSWORD, DATABASE);

if($db->connect_errno) {
	printf('Error connecting to database: %s\n', $db->connect_error);
	die();
}
if(isset($_GET['count']) && $_GET['count'] == '1') {
	$statement = 'UPDATE megumin_love_counter SET `counter` = `counter`+1'; 

	if(!$db->query($statement)) {
		printf('Error updating entry: %s\n', $db->error);
		die();
	}
}

$statement = 'SELECT `counter` FROM megumin_love_counter';
$result = $db->query($statement);
while($rowResult = $result->fetch_row()) {
	echo $rowResult[0];
	break;
}

?>