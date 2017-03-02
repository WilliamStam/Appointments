<?php
namespace models;
use controllers\admin\test;
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


	
	function get($services=array(),$date="",$companyID,$selected_target=array(),$not_available=false) {
		$timer = new timer();
		$error = array();

		if ($date==""){
			$date=date("Y-m-d");
		}

		if (!$not_available){
			$not_available = array();

			$appointments = appointments::getInstance()->getAll("appointments.companyID = '{$companyID}' AND DATE_FORMAT(appser.appointmentStart,'%Y-%m-%d') = '{$date}'","","",array("services"=>true));

		//	test_array($appointments);

			foreach($appointments as $appointment){
				foreach($appointment['services'] as $app_service){
					$not_available[] = array(
						"s"=>$app_service['time']['start_view_short'],
						"e"=>$app_service['time']['end_view_short'],
						"ID"=>$appointment['ID'],
						"staffID"=>$app_service['staff']['ID'],
						"serviceID"=>$app_service['ID']
					);
				}
			}
		}


	//	test_array($not_available);


		/*
		$selected_target[] = array(
			"serviceID"=>"35",
			"staffID"=>"1",
			"time"=>"15:45",
			"ID"=>""
		);
		*/


		/*
		$not_available[] = array(
			"s"=>"12:45",
			"e"=>"13:00",
			"ID"=>"5",
			"staffID"=>"1",
			"serviceID"=>"35"
		);
		*/










		$settings = companies::getInstance()->get($companyID,array("format"=>true));

		$minute_time_slots = $settings['settings']['timeslots'];


		$services = implode(",",$services);
		$services = services::getInstance()->getAll("ID in ($services)","","",array("format"=>true, "staff"=>true));




		$potential = array();
		foreach ((array)$selected_target as $time){

			$service = $services[array_search($time['serviceID'], array_column($services, 'ID'))];
			$time['s'] = $time['time'];
			$time['e'] = date("H:i",strtotime("+ {$service['duration']} minute",strtotime($time['time'].":00")));

			$potential[$service['ID']] = $time;
		}


		//test_array($potential);



		$open_hours = $settings['settings']['open'][strtolower(date("l",strtotime($date)))];
		$start_hour = date("H:i",strtotime($open_hours['start']));
		$end_hour = date("H:i",strtotime($open_hours['end']));
		$range=range(strtotime($start_hour.":00"),strtotime($end_hour.":00"),$minute_time_slots*60);


		$serv = array();
		foreach ($services as $service){
			$staff_arr = array();
			$slots = array();




			$blank_continious  = array();
			foreach ((array)$service['staff'] as $si){
				$staff_arr[$si['ID']]=array();
				$blank_continious[$si['ID']] = 0;

			}




			if($potential){
				//	test_array($potential);
			}


			foreach($range as $time){
				$time_end = $time + ($minute_time_slots*60) - 1;
				$cur = date("H:i",$time);




				$locked =1;
				$duration_locked = 0;

				$selected = 0;

				$na_a = $blank_continious;
				//test_array($not_available);
				foreach ($not_available as $val){


					$na = $val;
					$s = strtotime($na['s'].":00");
					$e = strtotime($na['e'].":00");


					if ($s<=$time_end && $e>$time){
						if ($potential[$service['ID']]['ID']=="" || ($potential[$service['ID']]['ID']!= $na['ID'])){
							$na_a[$val['staffID']] = 1;
						}
					}

				}


				if ($service['duration']=='45'&&$cur=="10:00")	{
					//test_array($not_available);
					//test_array($na_a);
				}

				if (in_array("0",array_values($na_a))){
					$locked = 0;
				}



				//foreach ((array)$service['staff'] as $si){
				//$staff_arr[$si['ID']][$cur] = 1;
				//}
				//if ($na_a[$na_staff_id])








				foreach ((array)$service['staff'] as $si){
					//test_array($si);
					$staff_arr[$si['ID']][$cur] = $na_a[$si['ID']];
				}


				$item = array(
					"v"=>$cur,
					"l"=>$cur,
					"other_selected"=>"0",
					"active"=>"0",
					"selected"=>"0",
					"selected_ID"=>"",
					"selected_staffID"=>"",
					"locked"=>$locked,
					"duration_locked"=>$duration_locked,

					"busy"=>$na_a,
					"no_continuous"=>0,
					"no_continuous_staff"=>$blank_continious,
					"error"=>0,
					"disabled"=>0

				);


				foreach ($potential as $pot_item){
					$na = $pot_item;
					$s = strtotime($na['s'].":00");
					$e = strtotime($na['e'].":00");
					if ($pot_item['serviceID']==$service['ID']){
						if ($s<=$time_end && $e>$time){
							$item['selected'] = 1;
							$item['selected_ID'] = $na['ID'];
							$item['selected_staffID'] = $na['staffID'];
						}
					} else {
						if ($s<=$time_end && $e>$time){
							$item['other_selected'] = 1;
							$item['locked'] = 1;

						}
					}


				}





				$slots[] = $item;
			}
			$slots_ = array();
			foreach($slots as $i=>$item){
				$slots_['k-'.$i] = $item;
			}


			if (isset($_GET['w'])){
				if ($service['duration']==45){
					//test_array(array($staff_arr,$slots));
					//	test_array($slots);
				}
			}
			arsort($slots_);

			$s = array();
			$dur = "";
			$loop = 0;

			$con = array();

			foreach($slots_ as $i=>$item){
				$v = $item['v'];
				$k = $i;

				$slot_index = str_replace("k-", "", $i);

				if ($item['locked']==1 || $loop==0){
					$dur = date("H:i",strtotime($item['v'].":00")-($service['duration']*60)+1);
				}

				if ($dur){
					$sd = strtotime($dur.":00");
					$ed = strtotime($v.":00");

					if ($ed>$sd){
						$item['soft_lock'] = '1';
						$slots[$slot_index]['duration_locked'] = 1;
					}
				}

				$item['dur'] = date("H:i",strtotime($item['v'].":00")-($service['duration']*60)+1);

				$s[$k] = $item;
				$loop = $loop+1;
			}








			foreach ($staff_arr as $staffID=>$staff_item){


				$i = 0;
				foreach($staff_item as $k=>$v){
					//	test_array($staff_item);

					$time_start = strtotime($k.":00");
					$time_end = strtotime($k.":00")+($service['duration']*60)-1;

					if ($minute_time_slots >= $service['duration']){

						$time_end = strtotime($k.":00")+($minute_time_slots*60);
						//test_array(date("H:i:s",$time_end));
					}





					$range_sa=range($time_start,$time_end,$minute_time_slots*60);
					foreach($range_sa as $time_sa){
						$time_end_sa = $time_sa + ($minute_time_slots*60);
						$slots[$i]['debug'][$staffID][] = date("H:i:s",$time_sa)." - " . date("H:i:s",$time_end_sa);
						//test_array(array(date("H:i:s",$time_end_sa)));


						foreach ((array)$not_available as $val){
							$na = $val;
							if ($val['staffID']==$staffID){
								$s = strtotime($na['s'].":00");
								$e = strtotime($na['e'].":00");
								if ($s<$time_end_sa && $e>$time_sa){

									if ($potential['ID']=="" || ($potential['ID']!= $na['ID'])){
										$slots[$i]['no_continuous_staff'][$staffID] = 1;
									}



									//test_array(array("na"=>$na,"s"=>array($s,date("H:i:s",$s)),"e"=>array($e,date("H:i:s",$e)),"time_sa"=>array($time_sa,date("H:i:s",$time_sa)),"time_end_sa"=>array($time_end_sa,date("H:i:s",$time_end_sa)),"index"=>$i,"timeslot"=>$slots[$i]));

									//	test_array($i);

									//$slots[$i]['no_continuous_staff_reason'][$staffID][] = array("val"=>$val,"s"=>array($s,date("H:i:s",$s)),"e"=>array($e,date("H:i:s",$e)),"time_sa"=>array($time_sa,date("H:i:s",$time_sa)),"time_end_sa"=>array($time_end_sa,date("H:i:s",$time_end_sa)),"time_start"=>array($time_start,date("H:i:s",$time_start)),"time_end"=>array($time_end,date("H:i:s",$time_end),"s<"=>($s<$time_end_sa),"e>="=>($e>$time_sa)));

									//	test_array($slots['1']);
								}

							}


						}




					}





					$i = $i+1;
				}



			}











			$selected_check = array();

			foreach ($slots as $key=>$item){

				$staff_available = array();
				foreach($item['no_continuous_staff'] as $sk=>$vk){
					if ($vk=='0'){
						$staff_available[] = $sk;
					}
				}

				$slots[$key]['staff'] = implode(",",$staff_available);

				$error_status = 1;
				$status = 1;

				if ($item['locked']=='1'){
					$status = 0;
					$error_status = 0;
					//$error[$service['ID']]["locked"] = "Cell Locked";
				}

				if ($item['duration_locked']=='1'){
					$status = 0;
				}

				if (count($staff_available)==0){
					$status = 0;
				}

				$slots[$key]['status'] = $status;

				if ($status=='0')$slots[$key]['disabled'] = 1;

				if (in_array("1",array_values($item['no_continuous_staff']))){
					$slots[$key]['no_continuous'] = 1;
				}


				if ($item['selected']==1){
					if($potential[$service['ID']]['s']==$item['v']){
						$slots[$key]['active'] = '1';
						if($item['duration_locked']==1){
							$error_status = 0;
							$error[$service['ID']]["duration_locked"] = "Time goes into locked cells";
						}

						//test_array(array($potential[$service['ID']]['s'],$item));
					}
					//test_array($item);


					//$selected_check[$item['v']][] = (in_array($potential[$service['ID']]['staffID'],$staff_available))?1:0;
					$selected_check[$item['v']] = $item['busy'];//array($potential[$service['ID']]['staffID'],$staff_available);
					//$selected_check[$item['v']] = $staff_available;//array($potential[$service['ID']]['staffID'],$staff_available);

					//$selected_check[$item['v']] = $item;
					if ($item['busy'][$potential[$service['ID']]['staffID']]==1){
						$error_status=0;
						$error[$service['ID']]["staff_busy"] = "The staff member selected cant complete this appointment time slot";
					}


					if ($error_status==0){
						$slots[$key]['error'] = 1;
						//$error[$service['ID']] = true;
					}



				}

			}







			if (isset($_GET['w'])){
				if ($service['duration']==45){
					//test_array(array($staff_arr,$slots));
					//test_array($selected_check);
				}
			}




			$service['timeslots'] = $slots;
			$service['timeslots_error'] = isset($error[$service['ID']])?$error[$service['ID']]:false;
			$serv[] = $service;
		}



		if (count($error))$error = true;


		$return = array(
			"error"=>$error,
			"services"=>$serv
		);
		
		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return $return;
	}

	
	
	
}
