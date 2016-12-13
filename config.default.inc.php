<?php
$cfg['DB']['host'] = "localhost";
$cfg['DB']['username'] = "";
$cfg['DB']['password'] = "";
$cfg['DB']['database'] = "appointments";

$cfg['git'] = array(
	'username'=>"",
	"password"=>"",
	"path"=>"github.com/WilliamStam/Appointments",
	"branch"=>"master"
);

$cfg['media'] = $_SERVER['DOCUMENT_ROOT'] . DIRECTORY_SEPARATOR. "media" . DIRECTORY_SEPARATOR;
$cfg['backup'] = $cfg['media'] . "backups" . DIRECTORY_SEPARATOR;



$cfg['ttl'] = 0;

