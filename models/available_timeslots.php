<?php
namespace models;
use controllers\admin\test;
use \timer as timer;

class available_timeslots extends _ {

	private static $instance;
	function __construct() {
		parent::__construct();
		$this->error_types = array(
			"staff_other"=>"Staff member not available"
		);
		$this->warning_types = array(
			"overlaps"=>"Time overlaps another selection",
			"closed"=>"Appointment overlaps closed"
		);

	}
	public static function getInstance(){
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}
	function timeslots($companyID,$services=array(),$not_available=false,$appointmentID=false,$appDate=false,$min=false,$max=false){
		$timer = new timer();
		$error = array();
		$return = array();
		$appointmentDate = array(
			"start"=>"",
			"end"=>""
		);
	//	$appDate = false;


		if ($appDate){
			$appointmentDate = array(
				"start"=>$appDate,
				"end"=>$appDate
			);
		}

		//test_array($services);

		$services_ = array();

		foreach((array)$services as $service){

			$service["internal_AT_key"] = uniqid();


			if (strlen($service['appointmentStart'])>11){

				$appointmentStartTime = strtotime($service['appointmentStart']);
				$date_s= date("Y-m-d",$appointmentStartTime);
				$date_e =  date("Y-m-d",strtotime("+{$service['duration']} minute",$appointmentStartTime));

				if ($date_s<$appointmentDate['start']||$appointmentDate['start']==""){
					$appointmentDate['start'] = $date_s;
				}
				if ($date_e>$appointmentDate['end']||$appointmentDate['end']==""){
					$appointmentDate['end'] = $date_e;
				}
				$service["s"] = strtotime($service['appointmentStart']);
				$service["e"] = strtotime("+{$service['duration']} minute",strtotime($service['appointmentStart']));
				$service['appointmentEnd'] = date("Y-m-d H:i:s",$service["e"]);
			}
			$services_[] = $service;
		}

		$services = $services_;


		//test_array($appointmentDate);




		if ($not_available===false){
			$not_available = array();

			$appointmentIDsql = $appointmentID?" AND appointments.ID != '$appointmentID'":"";

			$appointmentIDsqlwhere = "appointments.companyID = '{$companyID}' AND DATE_FORMAT(appser.appointmentStart,'%Y-%m-%d') BETWEEN '{$appointmentDate['start']}' AND '{$appointmentDate['end']}' $appointmentIDsql";
			//test_array($appointmentIDsqlwhere);

			$appointments = appointments::getInstance()->getAll($appointmentIDsqlwhere,"","",array("services"=>true));
			foreach($appointments as $appointment){
				foreach($appointment['services'] as $app_service){
					$not_available[] = array(
						"s"=>strtotime($app_service['appointmentStart']),
						"e"=>strtotime("+{$app_service['duration']} minute",strtotime($app_service['appointmentStart'])),
						"ID"=>"a-".$appointment['ID'],
						"staffID"=>$app_service['staffID'],

					);
				}
			}








		

			$timeslot_where = "companyID='{$companyID}'";

			//	test_string($timeslot_where);

			$reserved_timeslots = timeslots::getInstance()->getAll($timeslot_where, "repeat_mode ASC, ID DESC", "", array("format" => TRUE));


			$repeat_mode_label = array(
				"_0"=>"Once Off",
				"_1"=>"Daily",
				"_2"=>"Weekly",
				"_3"=>"Monthly"
			);

			$r = array();

			//test_array($reserved_timeslots);

			//$date_reserved= date("Y-m-d",$appointmentStartTime);




			foreach((array)$services as $service){

				$appointmentStartTime = strtotime($service['appointmentStart']);
				$now = date("Y-m-d H:i:s",$appointmentStartTime);

				foreach ($reserved_timeslots as $item){

					$include = false;

					SWITCH ($item['repeat_mode']){
						CASE "0":
							$item['start_date'] = date("Y-m-d H:i:s",strtotime($item['data']['onceoff'] . " " . $item['start'].":00"));
							$item['end_date'] = date("Y-m-d H:i:s",strtotime($item['data']['onceoff'] . " " . $item['end'].":00"));

							if ($item['start_date']<=$now AND $item['end_date']>=$now)	$include = true;


							break;
						CASE "1":
							$appointmentStartDay = date("Y-m-d",($appointmentStartTime));
							$item['start_date'] = date("Y-m-d H:i:s",strtotime($appointmentStartDay . " " . $item['start'].":00"));
							$item['end_date'] = date("Y-m-d H:i:s",strtotime($appointmentStartDay . " " . $item['end'].":00"));
							$item['d'] = $service['appointmentStart'];
							if ($item['start_date']<=$now AND $item['end_date']>=$now)	$include = true;
							break;
						CASE "2":

							$dayofweek = date("l",$appointmentStartTime);



							$weekdays = explode(",",$item['data']['weekly']);
							//test_array(array(strtolower($dayofweek),$item['data']['weekly'],$weekdays));



							if (in_array(strtolower($dayofweek), $weekdays)){
								$appointmentStartDay = date("Y-m-d",($appointmentStartTime));
								$item['start_date'] = date("Y-m-d H:i:s",strtotime($appointmentStartDay . " " . $item['start'].":00"));
								$item['end_date'] = date("Y-m-d H:i:s",strtotime($appointmentStartDay . " " . $item['end'].":00"));

								if ($item['start_date']<=$now AND $item['end_date']>=$now)	$include = true;

								
							}
							break;
						CASE "3":
							$dayofmonth = date("d",$appointmentStartTime);
							$monthdays = explode(",",$item['data']['monthly']);

							if (in_array(strtolower($dayofmonth), $monthdays)){
								$appointmentStartDay = date("Y-m-d",($appointmentStartTime));
								$item['start_date'] = date("Y-m-d H:i:s",strtotime($appointmentStartDay . " " . $item['start'].":00"));
								$item['end_date'] = date("Y-m-d H:i:s",strtotime($appointmentStartDay . " " . $item['end'].":00"));

								if ($item['start_date']<=$now AND $item['end_date']>=$now)	$include = true;


							}
							break;

					}
					$item['inc'] = $include;

					//if ($include){
						$r[] = $item;
					//}

					$not_available[] = array(
						"s"=>strtotime($item['start_date']),
						"e"=>strtotime($item['end_date']),
						"ID"=>"r-".$item['ID'],
						"staffID"=>$item['staffID'],

					);



				}
			}





		}

		$n = array();
		foreach ($not_available as $item){
			$item["ds"] = date("Y-m-d H:i:s",$item['s']);
			$item["de"] = date("Y-m-d H:i:s",$item['e']);
			$n[] = $item;
		}

		//test_array(array($appointmentDate,$n));

	//

		$settings = companies::getInstance()->get($companyID,array("format"=>true));



		//test_array($appointmentDate);



		$slots = $this->_slots($appointmentDate['start'],$appointmentDate['end'],$settings,$min,$max);


		//test_array($slots);

		foreach ($services as $item){




			$item['slots'] = $this->_status_slots($slots, $item, $not_available, $services,$settings['settings']['timeslots'],$min,$max);
			//test_array($item);
			$item['slots'] = $this->_cleanup_slots($item['slots'],$min,$max);

			unset($item['internal_AT_key']);


			$return[] = $item;
		}





		//test_array($return);



		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return $return;
	}
	function _slots($start_date, $end_date, $settings,$min=false,$max=false){
		$timer = new timer();
		$return = array();

		$start_hour = $start_date." 00:00:00";
		$end_hour = $end_date." 23:59:59";

		$minute_time_slots = $settings['settings']['timeslots'];



		$range=range(strtotime($start_hour),strtotime($end_hour),$minute_time_slots*60);

		//test_array(array($start_hour,$end_hour,$minute_time_slots,$range));

		foreach($range as $time) {
			$time_end = $time + ($minute_time_slots * 60) - 1;

			$day = date("Y-m-d", $time);

			$open_hours = $settings['settings']['open'][strtolower(date("l",$time))];
			$start_hour = strtotime($day." ".$open_hours['start'].":00");
			$end_hour = strtotime($day." ".$open_hours['end'].":00");

			$open = 1;

			if ($time<$start_hour || $time>=$end_hour){
				$open = 0;
			}

			if ($min!==false && $start_hour<$min) $open = 0;
			if ($max!==false && $end_hour>$max) $open = 0;

			$return[] = array(
				"label"=>date("H:i", $time),
				"s"=>$time,
				"e"=>$time_end,
				"status"=>array(
					"open"=>$open
				),
				"open_hours"=>array(
					"s"=>$start_hour,
					"e"=>$end_hour
				),
				"date"=>date("Y-m-d H:i:s",$time)
			);
		}
		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return $return;
	}
	function _status_slots($slots, $service, $unavailable,$otherservices,$minute_time_slots,$min=false,$max=false){
		$timer = new timer();

		$return = array();
		$errors = array();
		$warnings = array();
		$clashing = array();
		$busy_blank = array();
		foreach ((array)$service['staff'] as $staff_item){
			$busy_blank['staff-'.$staff_item['ID']] = array(
				"ID"=>$staff_item['ID'],
				"busy"=>array()
			);
		}



		foreach ($slots as $slot_item){
			$busy =$busy_blank;
			$busy_soft_closed =$busy_blank;



			$t = array();
			foreach ($unavailable as $unavailable_item){

				$unavailable_item_soft_closed_s = strtotime("+{$minute_time_slots} minute",strtotime("-{$service['duration']} minute",$unavailable_item['s']));
				$unavailable_item_soft_closed_e = $unavailable_item['s'];

				if ($unavailable_item_soft_closed_s<=$slot_item['e'] && $unavailable_item_soft_closed_e>$slot_item['s']){
					if ($unavailable_item['staffID']==0 || $unavailable_item['staffID']==""){
						$busy_ = array();
						foreach($busy as $busy_key=>$busy_item){
							$busy_item['busy'][] = $unavailable_item['ID'];
							if (!in_array( $unavailable_item['ID'],(array)$busy['staff-'.$unavailable_item['staffID']]['busy'])) {
								$busy_[$busy_key] = $busy_item;
							}
						}
						$busy_soft_closed = $busy_;
					} else {
						if (!in_array( $unavailable_item['ID'],(array)$busy['staff-'.$unavailable_item['staffID']]['busy'])){
							$busy_soft_closed['staff-'.$unavailable_item['staffID']]['busy'][] = $unavailable_item['ID'];
						}
					}
				}


				if ($unavailable_item['s']<=$slot_item['e'] && $unavailable_item['e']>$slot_item['s']){
					if ($unavailable_item['staffID']==0 || $unavailable_item['staffID']==""){
						$busy_ = array();
						foreach($busy as $busy_key=>$busy_item){
							$busy_item['busy'][] = $unavailable_item['ID'];
							if (!in_array( $unavailable_item['ID'],(array)$busy['staff-'.$unavailable_item['staffID']]['busy'])) {
								$busy_[$busy_key] = $busy_item;
							}
						}
						$busy = $busy_;
					} else {
						if (!in_array( $unavailable_item['ID'],(array)$busy['staff-'.$unavailable_item['staffID']]['busy'])){
							$busy['staff-'.$unavailable_item['staffID']]['busy'][] = $unavailable_item['ID'];
						}
					}
				}

					$t[] = $unavailable_item;




			}



			if ($slot_item['label']=="13:45"){
				//test_array($t);
			//	test_array($unavailable);
			//	test_array($busy);
			}
			$error = 0;
			$available = 0;

			foreach($busy as $busy_item){
				if (count($busy_item['busy'])==0){
					$available = 1;
				}
			}


			if (count($busy["staff-".$service['staffID']]['busy'])>0){
				$available = 0;
			}

			$selected = 0;
			if ($service['s']<=$slot_item['e'] && $service['e']>$slot_item['s']){
				$selected = 1;
			}

			$soft_closed = 0;
			if (count($busy_soft_closed["staff-".$service['staffID']]['busy'])>0){
				$soft_closed = 1;
			}
			$other_selected = 0;
			//test_array($otherservices);
			foreach ($otherservices as $otherservices_item){
				if ($otherservices_item['internal_AT_key']!=$service['internal_AT_key']){
					$item_soft_closed_s = strtotime("+{$minute_time_slots} minute",strtotime("-{$service['duration']} minute",$otherservices_item['s']));
					$item_soft_closed_e = $otherservices_item['s'];
					if ($item_soft_closed_s<=$slot_item['e'] && $item_soft_closed_e>$slot_item['s']){
						$soft_closed = 1;
					}

					if ($otherservices_item['s']<=$slot_item['e'] && $otherservices_item['e']>$slot_item['s']){
						$other_selected = 1;
					}
				}
			}

			if ($min!==false && $slot_item['date']<$min) $available = 0;
			if ($max!==false && $slot_item['date']>$max) $available = 0;




			if ($selected==1 && $available==0){
				$error = 1;
				$errors['staff_other'][] = $slot_item['label'];
				foreach((array)$busy["staff-".$service['staffID']]['busy'] as $clas_busy){
					if (!in_array($clas_busy,$clashing)){
						$clashing[] = $clas_busy;
					}
				}
			}

			$soft_error = 0;
			if($selected ==1 && $other_selected==1){
				$soft_error = 1;
				$warnings['overlaps'][] = $slot_item['label'];
			}

			if($selected ==1 && $slot_item['status']['open']==0){
				$soft_error = 1;
				$warnings['closed'][] = $slot_item['label'];
			}


			//test_array($busy_soft_closed);


			$slot_item['status']['available'] = $available;
			$slot_item['status']['selected'] = $selected;
			$slot_item['status']['other_selected'] = $other_selected;
			$slot_item['status']['error'] = $error;
			$slot_item['status']['soft_error'] = $soft_error;
			$slot_item['status']['staff'] = $busy;
			$slot_item['status']['soft_closed'] = $soft_closed;


			$item = array(
				"l"=>$slot_item['label'], // label
				"s"=>$slot_item['status'], // status
			);
			$return[] =$slot_item;
		}


		$errors_ = array();
		foreach($errors as $k=>$v){
			$errors_[] = $this->error_types[$k] . " | " . implode(",",$v);
		}

		$warnings_ = array();
		foreach($warnings as $k=>$v){
			$warnings_[] = $this->warning_types[$k] . " | " . implode(",",$v);
		}



		$return = array(
			"errors"=>$errors_,
			"warnings"=>$warnings_,
			"clashing"=>$clashing,
			"times"=>$return

		);
		//test_array($return);

		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return $return;
	}
	function _cleanup_slots($data,$min=false,$max=false){
		$timer = new timer();

		$return = $data;

		$times = array();

	//	test_array($data);


		foreach( $return['times'] as $item){
			if ($item['status']['open']==1 || $item['status']['selected']){
				$status = 1;

				$classes = array();
				if($item['status']['open']==0){
					$classes[] = "closed";
					$status = 0;
				}
				if($item['status']['available']==0) {
					$classes[] = "no_available";
					$status = 0;
				}

				if($item['status']['selected']==1) {
					$classes[] = "selected";
				}

				if($item['status']['error']==1) {
					$classes[] = "error";

				}

				if($item['status']['soft_error']==1) {
					$classes[] = "soft_error";
					$status = 0;
				}
				if($item['status']['other_selected']==1) {
					$classes[] = "other_selected";
					$status = 0;
				}



				if($item['status']['soft_closed']==1) {
					$classes[] = "soft_closed";
					$status = 0;
				}




				if($status==1) {
					$classes[] = "selectable";

				}





				$item['classes'] = implode(" ",$classes);
				$staff_available = array();



				foreach ($item['status']['staff'] as $s_){
					if (count($s_['busy'])==0){
						$staff_available[] = $s_['ID'];
					}

				}


				$ret = array(
					"l"=>$item['label'],
					"v"=>$item['label'],
					"s"=>$status,
					"c"=>$item['classes'],
					"a"=>implode(",",$staff_available)
				);



				$times[] = $ret;



			}

		}
		$return['times'] = $times;


	//	test_array($return);




		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return $return;
	}



	
	
	
}
