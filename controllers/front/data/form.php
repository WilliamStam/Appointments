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
		$return['post']['appointmentDate_time'] = array();
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
				$return['extra']['services'] = models\services::getInstance()->getAll("services.ID IN ({$serviceids}) AND companyID = '{$company['ID']}'","category ASC, label ASC, ID ASC","",array("format"=>true,"staff"=>true));

				foreach ($return['extra']['services'] as $item){
					$return['extra']['services_totals']['duration'] = $return['extra']['services_totals']['duration'] + $item['duration'];
					$return['extra']['services_totals']['price'] = $return['extra']['services_totals']['price'] + $item['price'];
				}
			}
		}

		$appointmentStarts = false;

		//test_array($company);
		if (count($return['extra']['services']) && $return['post']['appointmentDate_day']){

			$key = 0;
			$services = array();

			foreach ($return['extra']['services'] as $service){
				$key_ = $service['ID']."-".$key;
				$defaultStart = "";
				if ($service['appointmentStart']){
					$defaultStart = date(" H:i:00",strtotime($service['appointmentStart']));

				}

				$serv_staffID = (isset($return['post']['appointmentDate_time-'.$key_.'-staffID']))?$return['post']['appointmentDate_time-'.$key_.'-staffID']:$service['staffID'];
				$serv_time = (isset($return['post']['appointmentDate_time-'.$key_.'-time']))?" ".$return['post']['appointmentDate_time-'.$key_.'-time'].":00":$defaultStart;

				$service['staff_member'] = array();

				foreach ($service['staff'] as $staff_item){
					if ($staff_item['ID']==$serv_staffID){
						$service['staff_member'] = $staff_item;
					}
				}


				$service['key'] = $key_;
				$service['staffID'] = $serv_staffID;
				$service['appointmentStart'] = $return['post']['appointmentDate_day'] . $serv_time;

				$service['time_start'] = date("H:i",strtotime($service['appointmentStart']));
				$service['time_end'] = date("H:i",strtotime("+{$service['duration']} minute",strtotime($service['appointmentStart'])));

				if (!$appointmentStarts || $service['appointmentStart'] < $appointmentStarts ){
					$appointmentStarts = $service['appointmentStart'];
				}

				$service['error'] = 0;
				if (date('Y-m-d H:i:s', strtotime($service['appointmentStart'])) != $service['appointmentStart']){
					$return['errors']['appointmentDate_time'][] = "Need a time";
					$service['error'] = 1;
				}



				$services[] = $service;
				$key = $key + 1;
			}



			$return['times']['services'] =  models\available_timeslots::getInstance()->timeslots($company['ID'],$services);

			//test_array($services);

			foreach($return['times']['services'] as $ts_sservice){
				if (count($ts_sservice['slots']['errors'])){
					$return['errors']['appointmentDate_time'][] = $ts_sservice['slots']['errors'];
				}
				if (isset($service['staff_member']['ID'])){
					if ($service['staff_member']['ID']==""){
						$return['errors']['appointmentDate_time'][] = "errrors";
					}
				} else {
					$return['errors']['appointmentDate_time'][] = "errrors";
				}


			}






		}

		if ($appointmentStarts){
			$return['extra']['appointmentDate_display'] = date('D, d M Y \a\t H:i',strtotime($appointmentStarts));
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
				"services"=>$return['times']['services']


			);
		}


		//test_array($return);


		//$_SESSION['data'] = json_encode($return);


		return $GLOBALS["output"]['data'] = $return;
	}




}
