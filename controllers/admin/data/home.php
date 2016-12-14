<?php

namespace controllers\admin\data;

use \models as models;

class home extends _ {
	function __construct() {
		parent::__construct();

		$this->options = $_GET;

		$return = array();

		$currrentDate = date("Ymd",strtotime("today"));

		$agenda_items = models\appointments::getInstance()->getAll("DATE_FORMAT(appointmentStart,'%Y%m%d') = '{$currrentDate}'","appointmentStart ASC","",array("format"=>true,"client"=>true,"services"=>true));
		$n = array();
		$return["stats"] = array(
			"count"=>count($agenda_items),
			"duration"=>0
		);
		foreach ($agenda_items as $item){
			//test_array($item);
			$return["stats"]['duration'] = $return["stats"]['duration'] + $item['duration'];
			if ($item['active']==1)$item['status']="current";
			$n[] = $item;
		}
		$agenda_items = $n;

		$return['agenda'] = models\appointments::getInstance()->agenda_view($agenda_items);

		$return["stats"]['duration_view'] = seconds_to_time($return["stats"]['duration']*60,true);


		$this->head = $return;
	}

	function appointment(){
		$return = array();

		$ID = isset($_GET['ID'])?$_GET['ID']:"";

		$return = models\appointments::getInstance()->get($ID,array("format"=>true,"services"=>true,"client"=>true));
		$return['status'] = "current";

		$currrentDate = date("Ymd",strtotime($return['appointmentStart']));

		$agenda_items = models\appointments::getInstance()->getAll("DATE_FORMAT(appointmentStart,'%Y%m%d') = '{$currrentDate}'","appointmentStart ASC","",array("format"=>true,"client"=>true,"services"=>true));




	//	test_array($agenda_items);


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











		$return['agenda'] = models\appointments::getInstance()->agenda_view($agenda_items);





























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



		$return['head'] = $this->head;

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
