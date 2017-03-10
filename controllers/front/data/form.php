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
		$settings = $company['settings'];

		$sessionKey = "data".date("Ymd");

		$saved = isset($_COOKIE['front-form'])?json_decode($_COOKIE['front-form'],true):array();

		//test_array($saved);
		$defaults = array();
		$defaults['mobile_number']="";
		$defaults['email'] = "";
		$defaults['clientID'] = "";
		$defaults['first_name'] = "";
		$defaults['last_name'] = "";
		$defaults['notes'] = "";
		$defaults['services'] = array();
		$defaults['services_data'] = array();
		$defaults['duration'] = 0;
		$defaults['appointmentDate'] = date("Y-m-d");


		$appointmentStart = false;

		$return['data'] = array_replace_recursive($defaults,$saved,$_POST);
		setcookie("front-form",json_encode($return['data']), time() + (86400), "/");

		// ---------------------------------------- extra ----------------------------------------
		$return['extra'] = array();
		$return['extra']['services_totals'] = array(
			"duration"=>0,
			"price"=>0,
		);


		// ---------------------------------------- extra ----------------------------------------









		// ---------------------------------------- client ----------------------------------------

		$clientDetails = models\clients::getInstance()->getAll("mobile_number=? AND companyID = '{$company['ID']}'","","0,1",array("args"=>array($return['data']['mobile_number'])));


		if (isset($clientDetails[0])){
			$clientDetails = $clientDetails[0];

			$fields = array("clientID"=>"ID","email","first_name","last_name");


			foreach($fields as $k=>$f){
				if (is_numeric($k))$k=$f;
				$return['data'][$k] = $clientDetails[$f];
			}

		}

		$return['client'] = $clientDetails;

		// ---------------------------------------- client ----------------------------------------


		// ---------------------------------------- services ----------------------------------------


		if (count($return['data']['services'])){
			$serviceIDs = implode(",",$return['data']['services']);

			$services_ = models\services::getInstance()->getAll("ID in ({$serviceIDs}) AND companyID = '{$company['ID']}'","","",array("staff"=>true));

			$services = array();
			$key_ = array();
			foreach ($services_ as $item){
				if (!isset($key_[$item['ID']])) {
					$key_[$item['ID']] = 0;
				}
				$key = "new-" . $item['ID']. "-".$key_[$item['ID']];
				if (isset($item['recordID']) && $item['recordID']) {
					$key = "edit-".$item['recordID'];
				}

				$item['form_key'] = $key;
				$item['appointmentStart'] = $return['data']['appointmentDate'];

				if (isset($return['data']['services_data'][$key])){
					if (isset($return['data']['services_data'][$key]['time'])){
						$item['appointmentStart'] = $item['appointmentStart'] ." ".$return['data']['services_data'][$key]['time'].":00";
						if (!date("Y-m-d H:i:s",strtotime($item['appointmentStart']))){
							$item['appointmentStart'] = "";
						}


					}
					if (isset($return['data']['services_data'][$key]['staffID'])){
						$item['staffID'] = $return['data']['services_data'][$key]['staffID'];
					}

				}


				if ($item['appointmentStart']){
					if ($appointmentStart==false || $item['appointmentStart'] < $appointmentStart){
						$appointmentStart = $item['appointmentStart'];
					}

				}



				if ($item['staffID']){
					$item['staff_member'] = array();
					foreach($item['staff'] as $staff_item){
						if ($staff_item['ID']==$item['staffID']){
							$item['staff_member'] = $staff_item;
						}
					}

				}

				$services[] = $item;
			}

			$services = models\services::format((array)$services, array());
			$services_ = models\available_timeslots::getInstance()->timeslots($company['ID'], $services);

			$services = array();
			foreach ($services_ as $item){


				$item['time_start'] = date("H:i",$item['s']);
				$item['time_end'] = date("H:i",$item['e']);

				$return['extra']['services_totals']['duration'] = $return['extra']['services_totals']['duration'] + $item['duration'];
				$return['extra']['services_totals']['price'] = $return['extra']['services_totals']['duration'] + $item['price'];
				//unset($item['staff']);

				$services[] = $item;
			}


			//test_array($services);
			$return['services'] = $services;



		}

		// ---------------------------------------- services ----------------------------------------





		// ---------------------------------------- dates ----------------------------------------
		$return['dates'] = array();
		$today = time();




		$days = array();

		if ($settings['daysAhead']){
			for($i=0;$i<=$settings['daysAhead']-1;$i++){
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
		// ---------------------------------------- dates ----------------------------------------


		// ---------------------------------------- extra ----------------------------------------

		$return['extra']['appointmentStart'] = date('D, d M Y \a\t H:i',strtotime($appointmentStart));
		$return['extra']['services_totals']["duration_view"]= seconds_to_time($return['extra']['services_totals']["duration"]*60,true);
		$return['extra']['services_totals']["price_view"]=currency($return['extra']['services_totals']["price"]);



		// ---------------------------------------- extra ----------------------------------------




		// ---------------------------------------- errors ----------------------------------------

		if ($return['data']['mobile_number']==""){
			$return['errors']['mobile_number'] = "";
		}
		if ($return['data']['first_name']==""){
			$return['errors']['first_name'] = "";
		}


		if ($return['data']['appointmentDate']==""){
			$return['errors']['appointmentDate_day'] = "";
		}

		if (count($return['services'])==0){
			$return['errors']['services'] = "Please select at least 1 service";
		} else {
			foreach ($return['services'] as $item){

				if ($item['appointmentStart']){
					if (date("Y-m-d H:i:s",strtotime($item['appointmentStart']))!=$item['appointmentStart']){
						$return['errors']['appointmentDate_time'] = "";
					}
				}

				if (count($item['slots']['errors'])){
					$return['errors']['appointmentDate_time'] = "";
					$return['errors']['service-item-'.$item['form_key']] = "";
				}

				//test_array($item);
			}
		}




		// ---------------------------------------- errors ----------------------------------------



		// ---------------------------------------- submit ----------------------------------------
		if (count($return['errors'])==0){


			$return['submit'] = array(
				"appointmentDate"=>$return['data']['appointmentDate'],
				"notes"=>$return['data']['notes'],
				"clientID"=>$return['data']['clientID'],
				"client"=>array(
					"ID"=>$return['data']['clientID'],
					"first_name"=>$return['data']['first_name'],
					"last_name"=>$return['data']['last_name'],
					"mobile_number"=>$return['data']['mobile_number'],
					"email"=>$return['data']['email'],
				),
				"services"=>$return['services']


			);

		}


		// ---------------------------------------- submit ----------------------------------------




		return $GLOBALS["output"]['data'] = $return;
	}




}
