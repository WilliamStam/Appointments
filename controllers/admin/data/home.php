<?php

namespace controllers\admin\data;

use \models as models;

class home extends _ {
	function __construct() {
		parent::__construct();

		$this->options = $_GET;


	}

	function appointment(){
		$return = array();

		$ID = isset($_GET['ID'])?$_GET['ID']:"";

		$return = models\appointments::getInstance()->get($ID,array("format"=>true,"services"=>true,"client"=>true));

		$return['services'] = models\services::getInstance()->format($return['services'],array("group"=>"category"));



		if (isset($return['time']['start'])){

			$return['label']['main'] = date("H:i",strtotime($return['time']['start']));
			$return['label']['small'] =  date("l, d M Y",strtotime($return['time']['start']));
			$return['label']['today'] =  date("Ymd",strtotime($return['time']['start']))==date("Ymd",strtotime("now"))?1:0;

			$return['time']['start_view'] = date("H:i",strtotime($return['time']['start']));
			$return['time']['end_view'] = date("H:i",strtotime($return['time']['end']));
		}

		if ($return['clientID']==0){
			$return['client'] = array(
				"first_name"=>"Walk-In"
			);

		}



		$business_hours = array(
			"start"=>date("Y-m-d H:i:s",strtotime(date("Y-m-d",strtotime($return['time']['start']))." 07:30:00")),
			"end"=>date("Y-m-d H:i:s",strtotime(date("Y-m-d",strtotime($return['time']['start']))." 16:00:00"))
		);





//test_array($business_hours);



		$return['agenda']['items'] = array();


		$day_s = strtotime(date("Y-m-d 00:00:00",strtotime($business_hours['start'])));
		$day_e = strtotime(date("Y-m-d 23:59:59",strtotime($business_hours['end'])));

		$day = $day_e - $day_s;




		$s = strtotime($return['time']['start']);
		$e = strtotime($return['time']['end']);


		$l = $s - $day_s;


		$l= ($l / $day)*100;

	//test_array(date("Y-m-d H:i:s",$day_s));


		$r = $day_e - $e;

		if ($r < 0){
			$r = 0;
		} else {
			$r = ($r / $day)*100;
		}

		//$r = 100 - $r;

		if ($l < 0)$l = 0;
		// if ($r < 0)$l = 0;

		//test_array(array("day s"=>$day_s,"day e"=>$day_e, "day"=> $day,"s"=>$s,"e"=>$e,"l"=>$l ));
		$return['agenda']['items'][] = array(
			"current"=>1,
			"label"=>$return['client']['first_name']." " . $return['client']['last_name'],
			"l"=>$l,
			"r"=> $r
		);






		$return['agenda']['settings'] = array(
			"width"=>(100 / 24)
		);






		$endh = strtotime($business_hours['end']);
		$starth = strtotime($business_hours['start']);


		//test_array(date("Y-m-d H:i:s",$day_s));

		$secinday = 60 * 60 * 24;
		//$starth = (($day_s - $starth)/$secinday)*100;
		//$endh = (($day_e - $endh)/$secinday)*100;

		$starth_ = (($starth - $day_s));
		$endh_ = (($day_e - $endh));


		//test_array(array($starth,$day_s,$starth_,date("Y-m-d H:i:s",$day_s)));


		$s = ($starth_ / $secinday)*100;
		$e = ($endh_ / $secinday)*100;



		$c_ = $secinday - $starth_ - $endh_;
		$c =  ($c_ / $secinday)*100;


		$m = $starth_ +  $endh_;
		$m_ = $secinday / ($secinday - $m);



//test_array(array($m,$secinday,$m_));

		$multiplier = $m_;


		$return['agenda']['settings']['l'] = $s *$multiplier;
		$return['agenda']['settings']['r'] = $e*$multiplier;
		$return['agenda']['settings']['m'] = $multiplier;


		//$return['agenda']['settings']['l'] = $starth * $return['agenda']['settings']['width'];
		//	$return['agenda']['settings']['r'] = $endh * $return['agenda']['settings']['width'];





		//test_array($return['agenda']['settings']);
	//	test_array(array("end"=>array($day_e, $endh, $endh_, $e),"start"=>array($day_s,$starth,$starth_, $s),"combined"=>array($c_,$c,($e+$s+$c))));













		return $GLOBALS["output"]['data'] = $return;
	}


	function view_list() {
		$return = array();
		$return['options'] = $this->options;


		$records = models\appointments::getInstance()->getAll("appointmentStart","appointmentStart","",array("services"=>true,"client"=>true));


		$list = array();

		foreach ($records as $item){
			$dateKey = date("Ymd",strtotime($item['appointmentStart']));






			$item['time']['start_view'] = date("H:i",strtotime($item['time']['start']));
			$item['time']['end_view'] = date("H:i",strtotime($item['time']['end']));



			if ($item['clientID']==0){
				$item['client']=array(
					"first_name"=>"Walk-In"
				);
			}



			if (!isset($list[date("Ymd",strtotime($item['appointmentStart']))])){
				$list[$dateKey]['label']['day'] = date("l",strtotime($item['appointmentStart']));
				$list[$dateKey]['label']['date'] = date("d F Y",strtotime($item['appointmentStart']));
				$list[$dateKey]['label']['duration'] = 0;
				$list[$dateKey]['label']['duration_view'] = "";
				$list[$dateKey]['label']['status'] = 0;

				if ($dateKey < date("Ymd",strtotime('now'))){
					$list[$dateKey]['label']['status'] = 1;
				}
				if ($dateKey > date("Ymd",strtotime('now'))){
					$list[$dateKey]['label']['status'] = 2;
				}



			}
			$list[$dateKey]['records'][] = $item;
			$list[$dateKey]['label']['duration'] = $list[$dateKey]['label']['duration'] + $item['duration'];
			$list[$dateKey]['label']['duration_view'] = seconds_to_time($list[$dateKey]['label']['duration'] * 60,true);






		}

		$return['list'] = array();

		foreach ($list as $item){
			$return['list'][] = $item;
		}




		//test_array($list);




		return $GLOBALS["output"]['data'] = $return;
	}

	function view_day() {
		$return = array();
		$return['options'] = $this->options;


		return $GLOBALS["output"]['data'] = $return;
	}
	function view_calendar() {
		$return = array();
		$return['options'] = $this->options;


		return $GLOBALS["output"]['data'] = $return;
	}


}
