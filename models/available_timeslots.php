<?php
namespace models;
use \timer as timer;

class available_timeslots extends _ {

	private static $instance;
	function __construct() {
		parent::__construct();


	}
	public static function getInstance(){
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}


	
	function get($service,$staffID,$date,$appointmentID="") {
		$timer = new timer();
		$return = array();
		if (!is_array($service)){
			$service = services::getInstance()->get($service,array("format"=>true));
		}
		$companyID = $service['companyID'];




		$company = companies::getInstance()->get($companyID,array("format"=>true));

		//test_array($company);

		$settings = array(
			"staffID"=>$staffID,
			"companyID"=>$companyID,
			"serviceID"=>$service['ID'],
			"duration"=>$service['duration'],
			"date"=>$date,
			"company"=>$company
		);
		$timeslots = array();

		$appointments = appointments::getInstance()->getAll("appointments.companyID = '{$settings['companyID']}' AND DATE_FORMAT(appointmentStart,'%Y-%m-%d') = '{$settings['date']}'","","",array("services"=>true));

		foreach ($appointments as $appointment){
			foreach ($appointment['services'] as $item){
				$include = false;
				if ($item['staff']['ID']==$settings['staffID']){
					$include = true;

				}
				//test_array($item);

				if ($include){
					$timeslots[] = array(
						"app_id"=>$appointment['ID'],
						"current"=>$appointment['ID']==$appointmentID?1:0,
						"s"=>date("H:i",strtotime($item['time']['start'])),
						"e"=>date("H:i",strtotime($item['time']['end']))
					);
				}

			}
		}

//test_array($timeslots);

		$reserved_data = \models\timeslots::getInstance()->getAll("companyID = '{$settings['companyID']}' AND (staffID = '{$settings['staffID']}' OR staffID = '0')");

		foreach ($reserved_data as $item){
			$include_item = false;
			switch ($item['repeat_mode']){
				case "0":
					$item['start_date'] = date("Y-m-d H:i:s",strtotime($item['data']['onceoff'] . " " . $item['start'].":00"));
					$item['end_date'] = date("Y-m-d H:i:s",strtotime($item['data']['onceoff'] . " " . $item['end'].":00"));

					if ($item['data']['onceoff'] == $date){
						$include_item = true;
					}
					break;
				case "1":
					$item['start_date'] = date("Y-m-d ".$item['start'].":00",strtotime($date));
					$item['end_date'] = date("Y-m-d ".$item['end'].":00",strtotime($date));
					$include_item = true;
					break;

				case "2":

					$dow_numeric = date('w',strtotime($date));

					$dayoftheweek = strtolower(date('l', strtotime("Sunday +{$dow_numeric} days")));
					$days = explode(",",$item['data']['weekly']);

					$item['start_date'] = date("Y-m-d ".$item['start'].":00",strtotime($date));
					$item['end_date'] = date("Y-m-d ".$item['end'].":00",strtotime($date));


					$item['dow'] = $dayoftheweek;
					if (count($days)){

						if (in_array($dayoftheweek,$days)){
							$include_item = true;
						}


					}




					break;

				case "3":
					$item['start_date'] = date("Y-m-d ".$item['start'].":00",strtotime($date));
					$item['end_date'] = date("Y-m-d ".$item['end'].":00",strtotime($date));
					$daytoday = date("d",strtotime($date));
					$days = explode(",",$item['data']['monthly']);
					if (count($days)){

						if (in_array($daytoday,$days)){
							$include_item = true;
						}


					}




					break;


			}


		//	test_array($item);

			if ($include_item){

				$timeslots[] = array(
					"tim_id" => $item['ID'],
					"s"=>date("H:i",strtotime($item['start_date'])),
					"e"=>date("H:i",strtotime($item['end_date']))
				);
			}
		}



		//test_array($timeslots);

		$open_hours = $settings['company']['settings']['open'][strtolower(date("l",strtotime($date)))];


		$duration = $service['duration'];

		if (date("Y-m-d",strtotime($date))==date("Y-m-d",strtotime("now"))){
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




		//$start_hour = date("H:i",strtotime("-".$settings['timeslots']." minute",strtotime($start_hour)));
		//$end_hour = date("H:i",strtotime("+".$settings['timeslots']." minute",strtotime($end_hour)));

		//test_array($settings['company']['settings']['timeslots']);
		$range=range(strtotime(date("00:00:00",strtotime("now"))),strtotime(date("23:59:59",strtotime("now"))),$settings['company']['settings']['timeslots']*60);

		//test_array($range);
		$slots = array();
		$time_slots = array();
		$prev = "";
		foreach($range as $time){
			$cur = date("H:i",$time);

		//	test_array($cur);

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
			$cur = false;
			$rec = array();
			foreach ($timeslots as $timeitems){
				$item_start = date("H:i",strtotime("-".$duration." minute",strtotime($timeitems['s'])));

				//test_array($item);

				if (($item_start<=$item && $timeitems['e']>=$item)){
					$active = 0;
					$rec[] = $timeitems;
				}




			}





			$times[] = array(
				"hour"=>date("H",strtotime($item)),
				"minute"=>date("i",strtotime($item)),
				"value"=>$item,
				"active"=>$active,
				"records"=>$rec,

			);
			$prev = $item;
		}

	//	test_array($times);


		unset($settings['company']);
		$return = array(
			"settings"=>$settings,
			"times"=>$times
		);

		
		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return $return;
	}
	function getAll($services,$staffID,$date){

		if (is_array($services)){
			$services = implode(",",$services);
		}

		$services = services::getInstance()->getAll("ID in ($services)","","",array("format"=>true));
		$return = array();
		foreach ($services as $service){
			$return[] = $this->get($service,$staffID,$date);
		}



		return $return;
	}
	
	
	
}
