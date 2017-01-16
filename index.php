<?php
date_default_timezone_set('Africa/Johannesburg');
setlocale(LC_ALL, 'en_ZA.UTF8');
$errorFolder = "." . DIRECTORY_SEPARATOR . "logs" . DIRECTORY_SEPARATOR . "php";
if (!file_exists($errorFolder)) {
	@mkdir($errorFolder, 01777, TRUE);
}
$errorFile = $errorFolder . DIRECTORY_SEPARATOR . date("Y-m") . ".log";
ini_set("error_log", $errorFile);

if (session_id() == "") {
	$SID = @session_start();
} else $SID = session_id();
if (!$SID) {
	session_start();
	$SID = session_id();
}



function currency($str){
	if ($str){
		$fmt = new NumberFormatter( 'en_ZA', NumberFormatter::CURRENCY );
		$fmt->setPattern(str_replace('¤#',"¤\xC2\xA0#", $fmt->getPattern()));
		$str = $fmt->formatCurrency($str, "ZAR");
	}

	return $str;
}


$GLOBALS["output"] = array();
$GLOBALS["models"] = array();
$GLOBALS["css"] = array();
$GLOBALS["javascript"] = array();


require_once('vendor/autoload.php');

$f3 = \base::instance();
require('inc/timer.php');
require('inc/template.php');
require('inc/functions.php');
require('inc/pagination.php');
$GLOBALS['page_execute_timer'] = new timer(TRUE);
$cfg = array();
require_once('config.default.inc.php');
if (file_exists("config.inc.php")) {
	require_once('config.inc.php');
}

$f3->set('AUTOLOAD', './|lib/|controllers/|inc/|/modules/|/app/controllers/|/resources/**/*');
$f3->set('PLUGINS', 'vendor/bcosca/fatfree/lib/');
$f3->set('CACHE', TRUE);

$f3->set('DB', new DB\SQL('mysql:host=' . $cfg['DB']['host'] . ';dbname=' . $cfg['DB']['database'] . '', $cfg['DB']['username'], $cfg['DB']['password']));


//test_array("woof"); 


$f3->set('cfg', $cfg);
$f3->set('DEBUG', 3);


$f3->set('UI', 'ui/|media/|resources/');
$f3->set('MEDIA', './media/|' . $cfg['media']);
$f3->set('TZ', 'Africa/Johannesburg');

$f3->set('TAGS', 'p,br,b,strong,i,italics,em,h1,h2,h3,h4,h5,h6,div,span,blockquote,pre,cite,ol,li,ul');


//$f3->set('ERRORFILE', $errorFile);
//$f3->set('ONERROR', 'Error::handler');
$f3->set('ONERRORd',
		function ($f3) {
			// recursively clear existing output buffers:
			while (ob_get_level())
				ob_end_clean();
			// your fresh page here:
			echo $f3->get('ERROR.text');
			print_r($f3->get('ERROR.stack'));
		}
);

$version = date("YmdH");
if (file_exists("./.git/refs/heads/" . $cfg['git']['branch'])) {
	$version = file_get_contents("./.git/refs/heads/" . $cfg['git']['branch']);
	$version = substr(base_convert(md5($version), 16, 10), -10);
}

$minVersion = preg_replace("/[^0-9]/", "", $version);
$f3->set('_version', $version);
$f3->set('_v', $minVersion);


$uID = isset($_SESSION['uID']) ? base64_decode($_SESSION['uID']) : "";

$userO = new \models\users();
$user = $userO->get($uID,array("format"=>true,"companies"=>true));

//test_array($user);
if (isset($_GET['auID']) && $user['su'] == '1') {
	$_SESSION['uID'] = $_GET['auID'];
	$user = $userO->get($_GET['auID'],array("format"=>true,"companies"=>true));
}

if ($user['lastCompanyID']==""){
	$user['lastCompanyID'] = isset($user['companies'][0]['ID'])?$user['companies'][0]['ID']:null;
}

$companyID  = isset($_GET['cID'])?$_GET['cID']:false;

if($user['ID']){

	if (($companyID) && ($companyID != $user['lastCompanyID'])){
		models\users::_save($user['ID'],array("lastCompanyID"=>$companyID));
	}

}

$companyID = $companyID?$companyID:$user['lastCompanyID'];

$company = models\companies::getInstance()->get($companyID,array("format"=>true));
$user['company'] = $company;
$settings = $company['settings'];

//test_array($settings);


$settings['enable_email'] = true;
$settings['enable_sms'] = false;
if($settings["smsportal_username"] && $settings["smsportal_password"]){
	$settings['enable_sms'] = true;
};


$f3->set('settings', $settings);




$f3->set('user', $user);

if ($user['ID']) {
	models\users::lastActivity($user);
}



$f3->set('session', $SID);

//test_array($f3->get("types"));


$f3->route('GET|POST /', 'controllers\front\home->page');
$f3->route('GET|POST /@companyID', 'controllers\front\form->page');
$f3->route('GET|POST /form/@companyID', 'controllers\front\form->page');
$f3->route('GET|POST /login', 'controllers\front\login->page');

$f3->route('GET|POST /admin', 'controllers\admin\home->page');
$f3->route('GET|POST /admin/services', 'controllers\admin\services->page');
$f3->route('GET|POST /admin/products', 'controllers\admin\products->page');
$f3->route('GET|POST /admin/clients', 'controllers\admin\clients->page');
$f3->route('GET|POST /admin/staff', 'controllers\admin\staff->page');
$f3->route('GET|POST /admin/settings', 'controllers\admin\settings->page');
$f3->route('GET|POST /admin/settings/users', 'controllers\admin\users->page');
$f3->route('GET|POST /admin/settings/notifications', 'controllers\admin\notifications->page');
$f3->route('GET|POST /admin/settings/notification_templates', 'controllers\admin\notification_templates->page');




$f3->route('GET|POST /logout', function ($f3, $params) use ($user) {
	session_start();
	session_unset();
	session_destroy();
	session_write_close();
	setcookie(session_name(), '', 0, '/');
	$f3->reroute("/login");
});


$f3->route('GET /php', function () {
	phpinfo();
	exit();
});



$f3->route('GET /admin/settings/notifications/data', function () {

	test_array(\models\action::getInstance()->show_data());
});

$f3->route('GET|POST /cron', 'controllers\front\cron->page');
$f3->route('GET|POST /cron.php', 'controllers\front\cron->page');



$f3->route('GET /test/sms/@number', function ($app, $params) {


	$return = models\notifications::getInstance()->_send_sms($params['number'],"test message",array());
	test_array($return);

});

$f3->route('GET /test/email/@email', function ($app, $params) {


	$return = models\notifications::getInstance()->_send_email($params['email'],"test message subject","test message body",array());
	test_array($return);

});


$f3->route('GET /importSettings', function ($app, $params) {

	$companyID = '1';

	$settings_data = $app->get("DB")->exec("SELECT * FROM settings;");
	$settings = array();
	foreach ($settings_data as $item){
		$settings[$item['setting']] = json_decode($item['data'],true);
	}



	//test_array($settings);

	$values = array("settings"=>($settings));
	models\companies::_save($companyID,$values);

	test_array("imported");



});





$f3->route("GET|POST /admin/save/@function", function ($app, $params) {
	//test_array($params);
	$app->call("controllers\\admin\\save\\save->" . $params['function']);
});
$f3->route("GET|POST /admin/save/@class/@function", function ($app, $params) {
	//test_array($params);
	$app->call("controllers\\admin\\save\\" . $params['class'] . "->" . $params['function']);
});
$f3->route("GET|POST /admin/save/@folder/@class/@function", function ($app, $params) {
	///test_array($params);
	$app->call("controllers\\admin\\save\\" . $params['folder'] . "\\" . $params['class'] . "->" . $params['function']);
});
$f3->route("GET|POST /admin/data/@function", function ($app, $params) {
	//test_array($params);
	$app->call("controllers\\admin\\data\\data->" . $params['function']);
});
$f3->route("GET|POST /admin/data/@class/@function", function ($app, $params) {
	//test_array($params);
	//test_array($params);
	$app->call("controllers\\admin\\data\\" . $params['class'] . "->" . $params['function']);
});
$f3->route("GET|POST /admin/data/@folder/@class/@function", function ($app, $params) {
	//test_array($params);
	$app->call("controllers\\admin\\data\\" . $params['folder'] . "\\" . $params['class'] . "->" . $params['function']);
});

$f3->route("GET|POST /data/@class/@function", function ($app, $params) {
	$app->call("controllers\\front\\data\\" . $params['class'] . "->" . $params['function']);
});
$f3->route("GET|POST /save/@class/@function", function ($app, $params) {
	$app->call("controllers\\front\\save\\" . $params['class'] . "->" . $params['function']);
});




$f3->run();


$models = $GLOBALS['models'];

///test_array($models); 
$t = array();
foreach ($models as $model) {
	$c = array();
	foreach ($model['m'] as $method) {
		$c[] = $method;
	}
	$model['m'] = $c;
	$t[] = $model;
}

//test_array($t); 

$models = $t;
$pageTime = timer::shortenTimer($GLOBALS['page_execute_timer']->stop("Page Execute"));

$GLOBALS["output"]['timer'] = $GLOBALS['timer'];

$GLOBALS["output"]['models'] = $models;


$GLOBALS["output"]['page'] = array(
		"page" => $_SERVER['REQUEST_URI'],
		"time" => $pageTime
);

//test_array($tt); 

if ($f3->get("ERROR")) {
	exit();
}

if (($f3->get("AJAX") && ($f3->get("__runTemplate") == FALSE) || $f3->get("__runJSON"))) {
	header("Content-Type: application/json");
	echo json_encode($GLOBALS["output"]);
} else {
	
	//if (strpos())
	if ($f3->get("NOTIMERS")) {
		exit();
	}
	
	
	echo '
		<script type="text/javascript">
			updatetimerlist(' . json_encode($GLOBALS["output"]) . ');
		</script>
		</body>
</html>';
	
}



?>
