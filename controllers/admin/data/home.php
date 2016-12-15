<?php

namespace controllers\admin\data;

use \models as models;
use \models\users as user;

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
		$active = array();
		foreach ($agenda_items as $item){
			//test_array($item);
			$return["stats"]['duration'] = $return["stats"]['duration'] + $item['duration'];
			if ($item['active']==1){
				$item['status']="current";
				$active = $item;
			}
			$n[] = $item;
		}
		$agenda_items = $n;

		$return['agenda'] = models\appointments::getInstance()->agenda_view($agenda_items);

	//	if (isset($_GET['debug'])) test_array($return);

		$return["stats"]['duration_view'] = seconds_to_time($return["stats"]['duration']*60,true);


		if ($active['ID']){
			if (isset($active['services'])){
				$active['services_count'] = count($active['services']);
				$active['services'] = models\services::getInstance()->format($active['services'],array("group"=>"category"));
			}


			$active['time']['startsin'] = seconds_to_time(strtotime($active['appointmentStart'])-strtotime("now"),true);
		}


		$return['active'] = $active;



		$return["next"] = models\appointments::getInstance()->getAll("appointmentStart > now()","appointmentStart ASC","0,1",array("format"=>true,"client"=>true,"services"=>true));


		if (isset($return["next"][0])){
			$return["next"] = $return["next"][0];
			$return["next"]['services_count'] = count($return["next"]['services']);
			$return['next']['services'] = models\services::getInstance()->format($return['next']['services'],array("group"=>"category"));

			if (date("Y-m-d H:i:s",strtotime("+1 hour"))>date("Y-m-d H:i:s",strtotime($return["next"]['appointmentStart']))){
				$return["next"]['status'] = "shortly";
			}

			$return["next"]['time']['startsin'] = seconds_to_time(strtotime($return["next"]['appointmentStart'])-strtotime("now"),true);


		}

		//test_array($return["next"]);

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
			$return['label']['small'] =  date("D, d M Y",strtotime($return['time']['start']));
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
		user::settings("section","list");
		$list_filter = isset($_GET['list_filter'])?$_GET['list_filter']:user::settings("list_filter");
		$list_filter = $list_filter?$list_filter:"day";

		$list_value = isset($_GET['list_value'])?$_GET['list_value']:user::settings("list_value_".$list_filter);



		$next = "";
		$prev = "";
		$label = "";
		$current = "";
		$where = "1";
		switch($list_filter){
			case "day":

				$list_value = $list_value?$list_value:date("Y-m-d",strtotime("now"));

				$next = date("Y-m-d",strtotime("+1 day",strtotime($list_value)));
				$prev = date("Y-m-d",strtotime("-1 day",strtotime($list_value)));
				$current = date("Y-m-d",strtotime("now"));

				$label = date("D, d M Y",strtotime($list_value));
				$currrentDate = date("Y-m-d",strtotime($list_value));

				$where .= " AND (DATE_FORMAT(appointmentStart,'%Y-%m-%d') = '{$currrentDate}')";

				break;

			case "week":




				$list_value = $list_value?$list_value:date("W-Y");
				$val_parts = explode("-",$list_value);



				$week_start = date("Y-m-d", strtotime($val_parts[1].'W'.str_pad($val_parts[0], 2, 0, STR_PAD_LEFT)));
				$week_end = date("Y-m-d", strtotime($val_parts[1].'W'.str_pad($val_parts[0], 2, 0, STR_PAD_LEFT).' +6 days'));



				//test_array(array($week_start,$week_end));


				$next = date("W-Y",strtotime("+1 week",strtotime($week_start)));
				$prev = date("W-Y",strtotime("-1 week",strtotime($week_start)));
				$current = date("W-Y",strtotime("now"));


				$label =  date("d M", strtotime($week_start)) . " - " . date("d M", strtotime($week_end)). " (Week ".   date("W",strtotime($week_start)) .  ")";

				$where .= " AND ((DATE_FORMAT(appointmentStart,'%Y-%m-%d') >= '{$week_start}' AND DATE_FORMAT(appointmentStart,'%Y-%m-%d') <= '{$week_end}'))";

				break;


			case "month":




				$list_value = $list_value?$list_value:date("m-Y");
				$val_parts = explode("-",$list_value);


				$month_start = date("Y-m-d",strtotime($val_parts[1]."-".$val_parts[0]."-01"));
				$month_end = date("Y-m-d",strtotime($val_parts[1]."-".$val_parts[0]."-".date('t',strtotime($month_start))));

				$label =  date("F Y", strtotime($month_start)) ;


				//test_array(array($month_start,$list_value,$month_end,$label));


				$next = date("m-Y",strtotime("+1 month",strtotime($month_start)));
				$prev = date("m-Y",strtotime("-1 month",strtotime($month_start)));
				$current = date("m-Y",strtotime("now"));



				$where .= " AND ((DATE_FORMAT(appointmentStart,'%Y-%m-%d') >= '{$month_start}' AND DATE_FORMAT(appointmentStart,'%Y-%m-%d') <= '{$month_end}'))";

				break;



		}




		$return['settings'] = array(
			"list_filter"=>$list_filter,
			"list_value"=>$list_value,
			"label"=>$label,
			"nav"=>array(
				"current"=>$list_value,
				"now"=>$current,
				"next"=>$next,
				"prev"=>$prev,
			)

		);



		$records = models\appointments::getInstance()->getAll($where,"appointmentStart","",array("services"=>true,"client"=>true));


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
		\models\users::settings("section","day");












		$return['head'] = $this->head;
		return $GLOBALS["output"]['data'] = $return;
	}
	function view_calendar() {
		$return = array();
		$return['options'] = $this->options;
		\models\users::settings("section","calendar");



		$return['head'] = $this->head;
		return $GLOBALS["output"]['data'] = $return;
	}


}
