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


		$cookiedata = isset($_SESSION['data'])?json_decode($_SESSION['data'],true):array();
		if (!is_array($cookiedata)){
			$cookiedata = array();
		}
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



		$post = count($_POST)?$_POST:$cookiedata;

		foreach ($post as $k=>$v){
			$return['post'][$k] = $v;

		}


		//test_array($_POST);
		$_SESSION['data'] = json_encode($return['post']);

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
		if ($return['post']['appointmentDate_time']==""){
			$return['errors']['appointmentDate_time'] = "";
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




	//	test_array(array($return['dates'],$settings));

//test_array(array($settings['timeslots'],isset($days[$return['post']['appointmentDate_day']]),$days[$return['post']['appointmentDate_day']]));

		if ($settings['timeslots'] &&  isset($days[$return['post']['appointmentDate_day']]) && $days[$return['post']['appointmentDate_day']]==1 ){
			$currrentDate = $return['post']['appointmentDate_day'];



			$agenda_items = models\appointments::getInstance()->getAll("DATE_FORMAT(appointmentStart,'%Y-%m-%d') = '{$currrentDate}' AND appointments.companyID ='{$company['ID']}'","appointmentStart ASC","",array("format"=>true,"services"=>true));


			$timeslots = array();
			/*
			$timeslots[] = array(
				"s"=>"08:12",
				"e"=>"09:16"
			);
			$timeslots[] = array(
				"s"=>"14:12",
				"e"=>"15:16"
			);
*/

			foreach ($agenda_items as $item){
				$timeslots[] = array(
					"s"=>date("H:i",strtotime($item['time']['start'])),
					"e"=>date("H:i",strtotime($item['time']['end']))
				);
			}

			$reserved_data = \models\timeslots::getInstance()->getAll("companyID = '{$company['ID']}'");

			foreach ($reserved_data as $item){

				$include_item = false;
				switch ($item['repeat_mode']){
					case "0":
						$item['start_date'] = date("Y-m-d H:i:s",strtotime($item['data']['onceoff'] . " " . $item['start'].":00"));
						$item['end_date'] = date("Y-m-d H:i:s",strtotime($item['data']['onceoff'] . " " . $item['end'].":00"));

						if ($item['data']['onceoff'] == $currrentDate){
							$include_item = true;
						}
						break;
					case "1":
						$item['start_date'] = date("Y-m-d ".$item['start'].":00",strtotime($currrentDate));
						$item['end_date'] = date("Y-m-d ".$item['end'].":00",strtotime($currrentDate));
						$include_item = true;
						break;

					case "2":

						$dow_numeric = date('w',strtotime($currrentDate));

						$dayoftheweek = strtolower(date('l', strtotime("Sunday +{$dow_numeric} days")));
						$days = explode(",",$item['data']['weekly']);

						$item['start_date'] = date("Y-m-d ".$item['start'].":00",strtotime($currrentDate));
						$item['end_date'] = date("Y-m-d ".$item['end'].":00",strtotime($currrentDate));


						$item['dow'] = $dayoftheweek;
						if (count($days)){

							if (in_array($dayoftheweek,$days)){
								$include_item = true;
							}


						}




						break;

					case "3":
						$item['start_date'] = date("Y-m-d ".$item['start'].":00",strtotime($currrentDate));
						$item['end_date'] = date("Y-m-d ".$item['end'].":00",strtotime($currrentDate));
						$daytoday = date("d",strtotime($currrentDate));
						$days = explode(",",$item['data']['monthly']);
						if (count($days)){

							if (in_array($daytoday,$days)){
								$include_item = true;
							}


						}




						break;


				}



				if ($include_item){

					$timeslots[] = array(
						"s"=>date("H:i",strtotime($item['start_date'])),
						"e"=>date("H:i",strtotime($item['end_date']))
					);
				}
			}




			$open_hours = $settings['open'][strtolower(date("l",strtotime($currrentDate)))];


			$duration = $return['post']['duration'];

			if (date("Y-m-d",strtotime($currrentDate))==date("Y-m-d",strtotime("now"))){
				$open_hours['start'] = date("H:i:00");
			}


			/*
			$open_hours['start'] = '08:00:00';
			$open_hours['end'] = '16:30:00';
			$settings['timeslots'] = 15;
			$duration = 60;
*/

			$start_hour = date("H:i",strtotime($open_hours['start']));
			$end_hour = date("H:i",strtotime($open_hours['end']));

			$return['extra']['open_hours'] = array(
				"start"=>$start_hour,
				"end"=>$end_hour,
			);


			//$start_hour = date("H:i",strtotime("-".$settings['timeslots']." minute",strtotime($start_hour)));
			//$end_hour = date("H:i",strtotime("+".$settings['timeslots']." minute",strtotime($end_hour)));

			$range=range(strtotime(date("00:00:00",strtotime("now"))),strtotime(date("23:59:59",strtotime("now"))),$settings['timeslots']*60);

			$slots = array();
			$time_slots = array();
			$prev = "";
			$test = array();
			foreach($range as $time){
				$cur = date("H:i",$time);


				if ($cur<=date("H:i",strtotime("-".$duration." minute",strtotime($end_hour)))){
					if ($prev){
						if ($start_hour>$prev && $start_hour < $cur){
							$time_slots[] = $start_hour;
						}
					}

					if ($cur>=$start_hour && $cur <= $end_hour){
						$time_slots[] = $cur;
					}

					$slots[] = $cur;
				}

				$prev = $cur;
			}

			if ($end_hour>$time_slots[count($time_slots)-1]){
				$time_slots[] = $end_hour;
			}

			unset($time_slots[count($time_slots)-1]);
			//$time_slotss = array_pop($time_slots);



			$times = array();
			$prev = "";
			foreach ($time_slots as $item){
				$active = 1;
				foreach ($timeslots as $timeitems){
					$item_start = date("H:i",strtotime("-".$duration." minute",strtotime($timeitems['s'])));


					if (($item_start<=$item && $timeitems['e']>=$item)){
						$active = 0;
					}



				}



				$times[] = array(
					"hour"=>date("H",strtotime($item)),
					"minute"=>date("i",strtotime($item)),
					"value"=>$item,
					"active"=>$active
				);
				$prev = $item;
			}




			//test_array(array($timeslots,$times));
			$return['times'] = $times;
		} else {
			$return['times'] = array();
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
				$return['extra']['services'] = models\services::getInstance()->getAll("services.ID IN ({$serviceids}) AND companyID = '{$company['ID']}'","category ASC, label ASC","",array("format"=>true));

				foreach ($return['extra']['services'] as $item){
					$return['extra']['services_totals']['duration'] = $return['extra']['services_totals']['duration'] + $item['duration'];
					$return['extra']['services_totals']['price'] = $return['extra']['services_totals']['price'] + $item['price'];
				}
			}



		}


		$return['extra']['services_totals']["duration_view"] = seconds_to_time($return['extra']['services_totals']['duration']*60,true);
		$return['extra']['services_totals']["price_view"] = currency($return['extra']['services_totals']['price']);


		if (!count($return['errors'])){
			$return['submit'] = array(
				"appointmentStart"=>$return['post']['appointmentDate_day']." ".$return['post']['appointmentDate_time'].":00",
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







		return $GLOBALS["output"]['data'] = $return;
	}




}
