<?php

namespace controllers\front\data;
use \models as models;

class form extends _ {
	function __construct() {
		parent::__construct();

	}


	function data(){
		$return = array();
		$return['errors'] = array();
		$company = isset($_REQUEST['companyID'])?$_REQUEST['companyID']:"";
		$company = models\companies::getInstance()->get($company,array("format"=>true));

		$services = models\services::getInstance()->getAll("companyID = '{$company['ID']}'","category ASC, label ASC","", array("format" => true,"group"=>"category"));

		//test_array($services);

		$cookiedata = isset($_SESSION['data'])?json_decode($_SESSION['data'],true):array();
		if (!is_array($cookiedata)){
			$cookiedata = array();
		}
		$return['cookie'] = $cookiedata;
		$return['posting'] = $_POST;
		$return['post_count'] = count($_POST);
		//test_array($cookiedata);
		//$cookiedata = array();

		$return['post']['mobile_number']="";
		$return['post']['email'] = "";
		$return['post']['clientID'] = "";
		$return['post']['first_name'] = "";
		$return['post']['last_name'] = "";
		$return['post']['appointmentDate_day'] = "";
		$return['post']['appointmentDate_time'] = "";
		$return['post']['notes'] = "";
		$return['post']['services'] = array();
		$return['post']['duration'] = 0;



		$post = $_POST;






		foreach ($cookiedata as $k=>$v){

			$return['post'][$k] = $v;

		}




		foreach ($post as $k=>$v){
			if ($v==""){
				if (isset($cookiedata[$k])){
					$v = $cookiedata[$k];
				}
			}

			$return['post'][$k] = $v;

		}


		//test_array($_POST);
		$_SESSION['data'] = json_encode($return['post']);
		$return['ses'] = $_SESSION['data'];
		//test_array($_SESSION['data']);


		$return['save'] = array(
			"clientID"=>"",
			"appointmentStart"=>"",
			"notes"=>"",
		);



			if ($return['post']['mobile_number']==""){
				$return['errors']['mobile_number'] = "";
			}

		//$return['post']['mobile_number'] = "0835029157";




		if ($return['post']['mobile_number']){
			$clientDetails = models\clients::getInstance()->getAll("mobile_number=? AND companyID = '{$company['ID']}'","","0,1",array("args"=>array($return['post']['mobile_number'])));
			$return['client'] = $clientDetails;

			if (isset($clientDetails[0])){
				$clientDetails = $clientDetails[0];

				$return['post']['clientID'] = $clientDetails['ID'];
				$return['post']['email'] = $clientDetails['email'];
				$return['post']['first_name'] = $clientDetails['first_name'];
				$return['post']['last_name'] = $clientDetails['last_name'];
			}




		} else {

		}


		if ($return['post']['first_name']==""){
			$return['errors']['first_name'] = "";
		}

		if ($return['post']['appointmentDate_day']==""){
			$return['errors']['appointmentDate_day'] = "";
		} else {
			$return['extra']['appointmentDate_day_label'] = date("D, d M Y",strtotime($return['post']['appointmentDate_day']));
		}


		if (!count($return['post']['services'])){
			$return['errors']['services'] = "";
		}



		$settings = $company['settings'];

		$return['times'] = array();
		$return['dates'] = array();

		$return['extra']['duration'] = $return['post']['duration'];
		$return['extra']['duration_view'] = seconds_to_time($return['extra']['duration']*60,true)
		;


		$today = time();




		$days = array();

		if ($settings['daysAhead']){
			for($i=-10;$i<=$settings['daysAhead']-1;$i++){
				$date = strtotime("+$i day", $today);
				$showdate = true;
				if (isset($settings['closed'])){
					if (in_array(date("d-m",$date),$settings['closed'])){
						$showdate = false;
					}
				}


				$dayname = strtolower(date('l',$date));

				if (isset($settings['open'])){
					if (isset($settings['open'][$dayname])){
						if ($settings['open'][$dayname]['start'] && $settings['open'][$dayname]['end']){

						} else {
							$showdate = false;
						}


					}
				}

				//test_array($dayname);


				$days[date('Y-m-d', $date)] = $showdate?1:0;

			}



			$nd = array();

			foreach($days as $k=>$item){
				$date = strtotime($k);

				$nd[] = array(
					"dayName"=>date("D",$date),
					"day"=>date("d",$date),
					"month"=>date("M",$date),
					"value"=>$k,
					"active"=>$item
				);


			}

			$return['dates'] = $nd;
		} else {
			$return['dates'] = array();
		}




		$return['extra']['services'] = array();


		$return['extra']['services_totals'] = array(
			"duration" => 0,
			"price" => 0,

		);
		$serviceids = "";
	//	test_array($return['post']['services']);
		if (count($return['post']['services'])||$return['post']['services']!=""){
			$serviceids = is_array($return['post']['services'])?implode(",",$return['post']['services']):$return['post']['services'];

			if ($serviceids){
				$return['extra']['services'] = models\services::getInstance()->getAll("services.ID IN ({$serviceids}) AND companyID = '{$company['ID']}'","category ASC, label ASC","",array("format"=>true,"staff"=>true));

				//test_array("services.ID IN ({$serviceids}) AND companyID = '{$company['ID']}'");

				foreach ($return['extra']['services'] as $item){
					$return['extra']['services_totals']['duration'] = $return['extra']['services_totals']['duration'] + $item['duration'];
					$return['extra']['services_totals']['price'] = $return['extra']['services_totals']['price'] + $item['price'];
				}
			}



		}


		if (count($return['extra']['services']) && $return['post']['appointmentDate_day']){

			$services = array();
			foreach ($return['extra']['services'] as $service){

				$services[] = $service['ID'];
			}


			$first = "23:59";
			$selected_target = array();
			if ($return['post']['appointmentDate_time']){

				foreach ($return['post']['appointmentDate_time'] as $s=>$v){
					if ($v['time']<$first)$first=$v['time'];
					$selected_target[] = array(
						"serviceID"=>$s,
						"staffID"=>$v['staffID'],
						"time"=>$v['time'],
						"ID"=>""
					);
				}

			}
			$return['post']['appointmentDate_time_display'] = $first;

			$return['times'] = models\available_timeslots::getInstance()->get($services,$return['post']['appointmentDate_day'],$company['ID'],$selected_target);

			$staff_ = models\staff::getInstance()->getAll("companyID = '{$company['ID']}'");

			$return['extra']['services_selected'] = array();

			$time_errors= false;
			foreach ($return['extra']['services'] as $item){
				$staff = array();
				if ($return['post']['appointmentDate_time'][$item['ID']]){
					$staff = $staff_[array_search($return['post']['appointmentDate_time'][$item['ID']]['staffID'], array_column($staff_, 'ID'))];
				}
				$item['staff'] = $staff;
				if (isset($return['post']['appointmentDate_time'])&&isset($return['post']['appointmentDate_time'][$item['ID']])){
					$item['time'] = array(
						"start"=>$return['post']['appointmentDate_time'][$item['ID']]['time'],
						"end"=>date("H:i",strtotime($return['post']['appointmentDate_time'][$item['ID']]['time'].":00")+($item['duration']*60))
					);
				}

				if (isset($return['post']['appointmentDate_time'])){
					if(!isset($return['post']['appointmentDate_time'][$item['ID']])){
						$time_errors = true;
					} else {
						if(!isset($return['post']['appointmentDate_time'][$item['ID']]['staffID'])||$return['post']['appointmentDate_time'][$item['ID']]['staffID']==""){
							$time_errors = true;
						}

						if(!isset($return['post']['appointmentDate_time'][$item['ID']]['time'])||$return['post']['appointmentDate_time'][$item['ID']]['time']==""){
							$time_errors = true;
						}
					}


				} else {
					$time_errors = true;
				}

				$return['extra']['services_selected'][] = $item;
			}

			if ($return['times']['error']||$time_errors){
				$return['errors']['appointmentDate_time'] = "";
			}




		}

		//test_array($return);


		//test_array($return['extra']['services']);

		$return['extra']['services_totals']["duration_view"] = seconds_to_time($return['extra']['services_totals']['duration']*60,true);
		$return['extra']['services_totals']["price_view"] = currency($return['extra']['services_totals']['price']);


		if (!count($return['errors'])){
			$return['submit'] = array(
				"appointmentDate"=>$return['post']['appointmentDate_day'],
				"notes"=>$return['post']['notes'],
				"clientID"=>$return['post']['clientID'],
				"client"=>array(
					"ID"=>$return['post']['clientID'],
					"first_name"=>$return['post']['first_name'],
					"last_name"=>$return['post']['last_name'],
					"mobile_number"=>$return['post']['mobile_number'],
					"email"=>$return['post']['email'],
				),
				"services"=>$serviceids


			);
		}


		//test_array($return);


		//$_SESSION['data'] = json_encode($return);


		return $GLOBALS["output"]['data'] = $return;
	}




}
