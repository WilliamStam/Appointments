<?php
date_default_timezone_set('Africa/Johannesburg');
function isLocal() {
	if (file_exists("D:/web/local.txt") || file_exists("C:/web/local.txt")) {
		return true;
	} else return false;
}


$cfg = array();

require_once('../config.default.inc.php');
require_once('../config.inc.php');
require_once('update.php');


if (!isLocal()) {
	echo "Updates...<hr>";
	echo "<h3>Files</h3>";
	echo "<pre>" . update::code($cfg) . "</pre>";

	
}

echo "<pre>" . update::db($cfg) . "</pre>";
 
 ?>
