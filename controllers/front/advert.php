<?php
namespace controllers\front;
use \timer as timer;
use \models as models;
class advert extends _ {
	function __construct(){
		parent::__construct();
		header_remove( 'X-Frame-Options' );
	}
	function script(){
		$this->f3->set("NOTIMERS",true);
	//	sleep(5);

		$module = $this->f3->get("PARAMS['module']");
		$site = $this->f3->get("PARAMS['site']");
		$script = "";

		$modules = $this->f3->get("modules_type");
		$module = $modules[$module];



		if (class_exists($module['class'])) {


			if (method_exists($module['class'],"script")){
				$scriptO = $module['class'] . "::script";
				$script = $scriptO();
			}



		} else {
			$this->f3->error(404);
		}


		$url = "//".$_SERVER['HTTP_HOST'] . "/advert" . $_SERVER['REQUEST_URI'];

		$uri = array();
		foreach ($_GET as $k=>$v){
			$uri[] = $k."=".$v;
		}
// //adverts.local/c4ca4238a0b923820dcc509a6f75849b/banner_250x250.js?debugging=true&keywords=&mustContain=&mustNotContain=&


		$url_ = "//".$_SERVER['HTTP_HOST'] . "/advert/" . $site . "/" . $module['type'] . "?" . implode("&",$uri) ;
		$url_script = "//".$_SERVER['HTTP_HOST'] . "/" . $site . "/" . $module['type'] . ".js?" . implode("&",$uri) ;


		//test_array(array($url,$url_));


		header( 'X-Frame-Options: ALLOW' );
		header('Content-Type:application/x-javascript');



		$tmpl = new \template("script.js","ui/front");
		$tmpl->script = $script;
		$tmpl->url = $url_;
		$tmpl->url_script = $url_script;
		$tmpl->get = $_GET;
		$tmpl->advert = json_encode($this->advert(true));
		$tmpl->output();



	}
	function advert($called){
		if ($called!==true){
			$this->f3->set("__runJSON", true);
			$this->f3->set("NOTIMERS",true);
		}

		$module = $this->f3->get("PARAMS['module']");
		$siteID = $this->f3->get("PARAMS['site']");

		$site = models\sites::getInstance()->get($siteID,array("format"=>true));

		//test_array($module);

		$modules = $this->f3->get("modules_type");
		$module = $modules[$module];



		$options = $_GET;

		$keywords = isset($_REQUEST['keywords'])?$_REQUEST['keywords']:"";
		$mustContain = isset($_REQUEST['mustContain'])?$_REQUEST['mustContain']:"";
		$mustNotContain = isset($_REQUEST['mustNotContain'])?$_REQUEST['mustNotContain']:"";


		// "AND (`used` is null OR `used` < `budget`)

		$adverts_where = "moduleID = '{$module['ID']}' AND (date_from<=CURRENT_DATE() AND date_to >= CURRENT_DATE()) ";
		if ($_REQUEST['advert']){
			$adverts_where = $adverts_where . " AND (ID = {$_REQUEST['advert']} OR md5(ID) = '{$_REQUEST['advert']}') ";
		}

		$advertsO = models\adverts::getInstance();
		$adverts = $advertsO->getAll($adverts_where);

		$list = array();

		foreach ($adverts as $item){


			if ($item['used_status']!='3'){
				$list[] = $item;
			}
		}

		$adverts = $list;


		//test_array("module = '$moduleID' AND (date_from<=CURRENT_DATE() AND date_to >= CURRENT_DATE()) AND (`used` is null OR `used` < `budget`)");

//		test_array($adverts);


		$seen = $advertsO->getTempSeen($site['ID'],$module['ID']);

		//test_array($seen);
		//test_array($seen);
		$seenarray = array();
		$lastSeenarray = array();
		if (is_array($seen)){
			$seenarray = array_count_values(array_column($seen, 'advertID'));
		}

		foreach ($seen as $item){
			$lastSeenarray[$item['advertID']] = date("YmdHis",strtotime($item['datein'])).".".$item['ID'];
		}


		//test_array($adverts);
		$a = array();
		foreach ($adverts as $item){
			$m = $this->arrayCompareMustContain($item['mustContain'],$keywords);
			$n = $this->arrayCompare($item['mustNotContain'],$keywords);

			$n = ($n>0)?false:true;

			$sm = $this->arrayCompareMustContain($mustContain, $item['description']);
			$sn = $this->arrayCompare($mustNotContain, $item['description']);
			$sn = ($sn>0)?false:true;

			$weight = array(
				"m"=>count($this->split($item['mustContain']))*$cfg['weightMultipliers']['m'],
				"n"=>count($this->split($item['mustNotContain']))*$cfg['weightMultipliers']['n'],
			);
			$weightValue = 0;

			$weightValue = $weightValue + ($weight['m']);
			$weightValue = $weightValue + ($weight['n']);

			$similar_text = similar_text($item['description'],$keywords);
			$weightValue = $weightValue + $similar_text;

			$item['debug'] = array(
				"show"=>false,
				"weight"=>$weight,
				"weightValue"=>$weightValue,
				"similar_text"=>$similar_text,
				"advert"=>array(
					"m"=>$m,
					"n"=>$n,
				),
				"site"=> array(
					"m"=>$sm,
					"n"=>$sn,
				)
			);

			if ($m===true&&$n===true&&$sm===true&&$sn===true){
				$item['debug']['show'] = true;
			}

			$item['show'] = $item['debug']['show'];
			$item['weightValue'] = $weightValue;
			$item['seen'] = isset($seenarray[$item['ID']])?1:0;
			$item['seenCount'] = isset($seenarray[$item['ID']])?$seenarray[$item['ID']]:0;
			$item['seenLast'] = isset($lastSeenarray[$item['ID']])?$lastSeenarray[$item['ID']]:'';

			/*
			unset($item['accountID']);
			unset($item['dateFrom']);
			unset($item['dateTo']);
			unset($item['campaignID']);
			unset($item['categoryID']);
			unset($item['filename']);
			unset($item['category']);
			unset($item['datein']);
			unset($item['logAbuse']);
			unset($item['logCount']);
			unset($item['link']);
			unset($item['stagger']);
			unset($item['lastShow']);
			unset($item['domainCount']);
			unset($item['width']);
			unset($item['height']);
			*/



			if (isset($_GET['debug'])){
				$a[] = $item;

			} else {
				if ($item['show']){
					$a[] = $item;
				}
			}




		}
		$adverts = $a;

		usort($adverts, $this->make_cmp(array(array('seen'=>'ASC'),array('seenLast'=>'ASC'),array('weightValue'=>"ASC"))));

		$debug = (array(
			"siteID"=>	$siteID,
			"module"=>	$module,
			"keywords"=>$this->split($keywords),
			"seen"=>	$lastSeenarray,
			"adverts"=>	$adverts
		));

		$log = json_encode($debug);


		if (isset($_GET['debug'])){
			test_array($debug);
		}

		//test_array($adverts);
		$advert = isset($adverts[0])?$adverts[0]:false;




		$return = array(
			"site"=>$site,
			"module"=>$module,
			"options"=>$options,
			"advert"=>$advert,
		);


	//	test_array($return);

		if (!isset($_GET['debug'])){
			if ($advert['ID']){
				models\adverts::getInstance()->setTempSeen($advert['ID'],$module['ID'],$site['ID']);
			}
			models\adverts::getInstance()->logRequestDo($advert,$site['ID'],$module['ID'],$options,$log);
		}




		return $GLOBALS["output"]['data'] = $return;
	}





	function arrayCompare($array1,$array2){
		//test_array($this->cfg['keywordsSplit']);

		if (!is_array($array1)){
			$array1 = $this->split($array1);
		}
		if (!is_array($array2)){
			$array2 =$this->split($array2);
		}
		//test_array($array2);
		$n = 0;
		foreach ($array1 as $keyword){
			if (in_array($keyword,$array2)){
				$n = $n+1;
			};
		}


		return $n;

	}
	function arrayCompareMustContain($array1,$array2){
		if (!is_array($array1)){
			$array1 = $this->split($array1);
		}
		if (!is_array($array2)){
			$array2 = $this->split($array2);
		}
		$n = true;
		foreach ($array1 as $keyword){
			if (!in_array($keyword,$array2)){
				$n = false;
			};


		}




		return $n;

	}
	function make_cmp($fields, $fieldcmp='strcmp') {
		return function ($a, $b) use (&$fields,$fieldcmp) {
			foreach ($fields as $field) {
				$dir = "ASC";
				if (is_array($field)){
					$dir = array_values($field)[0];
					$field = key($field);
				}
				if ($dir=="ASC"){
					$diff = $fieldcmp($a[$field], $b[$field]);
				} else {
					$diff = $fieldcmp($b[$field], $a[$field]);
				}


				if($diff != 0) {
					return $diff;
				}
			}
			return 0;
		};
	}

	function advertSort($a, $b) {
		$c = strcmp($a['weightValue'], $b['weightValue']);
		if($c != 0) {
			return $c;
		}



		return strcmp($a['seen'], $b['seen']);
	}
	function split($val){
		$ar = preg_split($this->cfg['keywordsSplit'],$val,-1,PREG_SPLIT_NO_EMPTY);
		return $ar;
	}
}
