<?php
namespace controllers\admin;
use \timer as timer;
use \models as models;
class test extends _ {
	function __construct(){
		parent::__construct();
	}
	function page(){
		//if ($this->user['ID']=="")$this->f3->reroute("/login");

		$selected = array(
			"35"=>"14:30",
			"36"=>"15:30"
		);

		$services = array("35","36","8");

		$date = "2017-02-21";


		$settings = models\companies::getInstance()->get("1",array("format"=>true));


		$services = implode(",",$services);
		$services_ = models\services::getInstance()->getAll("ID in ($services)","","",array("format"=>true, "staff"=>true));

		$services= array();
		foreach ($services_ as $item){
			$services[$item['ID']] = $item;
		}


	//	test_array($services);

		$not_available = array();
		$not_available['1'][] = array(
			"s"=>"10:00",
			"e"=>"10:30",
		);
		$not_available['1'][] = array(
			"s"=>"11:00",
			"e"=>"11:30",
		);
		$not_available['1'][] = array(
			"s"=>"14:00",
			"e"=>"15:30",
		);


		$not_available['2'][] = array(
			"s"=>"10:15",
			"e"=>"10:45",
		);
		$not_available['2'][] = array(
			"s"=>"11:50",
			"e"=>"12:45",
		);


		$potential = array();
		foreach ($selected as $service=>$time){
			$potential[$service] = array(
				"s"=>$time,
				"e"=>date("H:i",strtotime("+ {$services[$service]['duration']} minute",strtotime($time.":00"))),
			);
		}




		$minute_time_slots = 15;

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


			foreach($range as $time){
				$time_end = $time + ($minute_time_slots*60) - 1;
				$cur = date("H:i",$time);




				$locked =1;
				$duration_locked = 0;

				$selected = 0;

				$na_a = array();
				foreach ($not_available as $na_staff_id=>$val){
					$na_a[$na_staff_id] = 0;
					foreach ($val as $na){
						$s = strtotime($na['s'].":00");
						$e = strtotime($na['e'].":00");
						if ($s<=$time_end && $e>$time){
							$na_a[$na_staff_id] = 1;
						}
					}
				}
				if (isset($potential[$service['ID']])){
					$na = $potential[$service['ID']];

					$s = strtotime($na['s'].":00");
					$e = strtotime($na['e'].":00");
					if ($s<=$time_end && $e>$time){
						$selected = '1';
					}


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
					"selected"=>$selected,
					"locked"=>$locked,
					"duration_locked"=>$duration_locked,

					"busy"=>$na_a,
					"no_continuous"=>0,
					"no_continuous_staff"=>$blank_continious

				);





				$slots[] = $item;
			}
			$slots_ = array();
			foreach($slots as $i=>$item){
				$slots_['k-'.$i] = $item;
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
					$range_sa=range($time_start,$time_end,$minute_time_slots*60);
					foreach($range_sa as $time_sa){
						$time_end_sa = $time_sa + ($minute_time_slots*60);
					//	$slots[$i]['debug'][$staffID][] = date("H:i:s",$time_sa)." - " . date("H:i:s",$time_end_sa);
						//test_array(array(date("H:i:s",$time_end_sa)));


						foreach ((array)$not_available[$staffID] as $val){
								$na = $val;

								$s = strtotime($na['s'].":00");
								$e = strtotime($na['e'].":00");
								if ($s<$time_end_sa && $e>$time_sa){


									//test_array(array("na"=>$na,"s"=>array($s,date("H:i:s",$s)),"e"=>array($e,date("H:i:s",$e)),"time_sa"=>array($time_sa,date("H:i:s",$time_sa)),"time_end_sa"=>array($time_end_sa,date("H:i:s",$time_end_sa)),"index"=>$i,"timeslot"=>$slots[$i]));

								//	test_array($i);
									$slots[$i]['no_continuous_staff'][$staffID] = 1;
									//$slots[$i]['no_continuous_staff_reason'][$staffID][] = array("val"=>$val,"s"=>array($s,date("H:i:s",$s)),"e"=>array($e,date("H:i:s",$e)),"time_sa"=>array($time_sa,date("H:i:s",$time_sa)),"time_end_sa"=>array($time_end_sa,date("H:i:s",$time_end_sa)),"time_start"=>array($time_start,date("H:i:s",$time_start)),"time_end"=>array($time_end,date("H:i:s",$time_end),"s<"=>($s<$time_end_sa),"e>="=>($e>$time_sa)));

								//	test_array($slots['1']);
								}

						}




					}





					$i = $i+1;
				}



			}












			foreach ($slots as $key=>$item){

				$staff_available = array();
				foreach($item['no_continuous_staff'] as $sk=>$vk){
					if ($vk=='0'){
						$staff_available[] = $sk;
					}
				}

				$slots[$key]['staff'] = implode(",",$staff_available);



				$status = 1;
				if ($item['locked']=='1'){
					$status = 0;
				}

				if ($item['duration_locked']=='1'){
					$status = 0;
				}

				if (count($staff_available)==0){
					$status = 0;
				}





				$slots[$key]['status'] = $status;




				if (in_array("1",array_values($item['no_continuous_staff']))){
					$slots[$key]['no_continuous'] = 1;
				}
			}



			if (isset($_GET['w'])){
				if ($service['duration']==45){
					//test_array(array($staff_arr,$slots));
					test_array($slots);
				}
			}



			$service['timeslots'] = $slots;
			$serv[] = $service;
		}





		if (isset($_GET['w'])) {
			test_array($serv);

		}
		
		$tmpl = new \template("template.twig","ui/admin");
		$tmpl->page = array(
			"section"    => "test",
			"sub_section"=> "test",
			"template"   => "test",
			"meta"       => array(
				"title"=> "Admin | Dashboard",
			),
			"js"=>array("/ui/_plugins/fullcalendar/fullcalendar.min.js"),
			"css"=>array("/ui/_plugins/fullcalendar/fullcalendar.min.css"),
		);
		$tmpl->services = $serv;
		$tmpl->output();
	}
	
	
	
}
