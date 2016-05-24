<?php
/*
* When actually hosting, you probably want to do 
* error_reporting(0);
* So no errors get printed to the user
*/
include_once('global_variables.php');
//Define a mysqli database connection based on values in global_variables.php
$db = new mysqli(HOST, USERNAME, PASSWORD, DATABASE);
//Before continuing, change megumin_counter to whatever your table is named

//Connect to the database. If denied access, throw error and exit
if($db->connect_errno) {
	printf('Error connecting to database: %s\n', $db->connect_error);
	die();
}
if(isset($_GET['count']) && $_GET['count'] == '1') { //second half isn't really necessary, since we're just passing a flag rather than a value
	//Statement to update counter += 1
	$statement = 'UPDATE megumin_love_counter SET `counter` = `counter`+1'; 

	//Execute the statement. If denied, throw error and exit
	if(!$db->query($statement)) {
		printf('Error updating entry: %s\n', $db->error);
		die();
	}
}

$statement = 'SELECT `counter` FROM megumin_love_counter';
$result = $db->query($statement);
while($rowResult = $result->fetch_row()) {
	echo $rowResult[0];
	break; //Technically should never happen, since there's only 1 row...
}

?>