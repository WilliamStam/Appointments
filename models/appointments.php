<?php
namespace models;
use \timer as timer;

class appointments extends _ {
	/**
	 *
	 * OPTIONS
	 *
	 * boolean - format - must the formater be run on the results
	 * array - args - array of arguments to send to the sql statement
	 * integer - ttl - TTL time the result should be cached for
	 *
	 */
	
	
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

	function get($ID,$options=array()) {
		$timer = new timer();
		$where = "(appointments.ID = '$ID' OR MD5(appointments.ID) = '$ID')";
		
		
		$result = $this->getData($where,"","0,1",$options);

		//test_array($options);
		if ($options['services']){
			$result = $this->services($result,$options);
		}

		if (count($result)) {
			$return = $result[0];
			
		} else {
			$return = parent::dbStructure("appointments");
		}
		

		if ($options['format']){
			$return = $this->format($return,$options);
		}
		
		
		//test_array($return);
		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return $return;
	}
	public function getAll($where = "", $orderby = "", $limit = "", $options = array()) {
		$result = $this->getData($where,$orderby,$limit,$options);
		if ($options['services']){
			$result = $this->services($result,$options);
		}
		$result = $this->format($result,$options);
		return $result;
		
	}
	
	public function getData($where = "", $orderby = "", $limit = "", $options = array()) {
		$timer = new timer();
		$f3 = \Base::instance();

		if ($where) {
			$where = "WHERE " . $where . "";
		} else {
			$where = " ";
		}




		if ($orderby) {
			$orderby =  $orderby.", ";
		}
		$orderby = " ORDER BY $orderby appser.appointmentStart ASC";


		if ($limit) {
			$limit = " LIMIT " . $limit;
		}

		$args = "";
		if (isset($options['args'])) $args = $options['args'];

		$ttl = "";
		if (isset($options['ttl'])) $ttl = $options['ttl'];
		


		$sql = "
			 SELECT DISTINCT appointments.*, min(appser.appointmentStart) AS appointmentStart, max(appser.appointmentStart + INTERVAL services.duration MINUTE) AS appointmentEnd
			FROM 
			(((`appointments` LEFT JOIN clients ON clients.ID = appointments.clientID) left join appointments_services appser ON appointments.ID = appser.appointmentID) left join services ON services.ID = appser.serviceID)
			$where
			GROUP BY appointments.ID
			$orderby
			$limit;
		";

		//test_array($sql);
		$result = $f3->get("DB")->exec($sql, $args, $ttl);

		$return = $result;
		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return $return;
	}

	
	
	public static function _save($ID, $values = array()) {
		$timer = new timer();
		$f3 = \Base::instance();
		$return = array();

		//test_array($values);

		if (isset($values['data']))$values['data'] = json_encode($values['data']);


		$a = new \DB\SQL\Mapper($f3->get("DB"), "appointments");
		$a->load("ID='$ID'");
		$action = ($a->dry())?"added":"edit";


		$log = array();
		foreach ($values as $key => $value) {
			if (isset($a->$key)) {
				if ($a->$key != $value){
					$log[] = array(
						"k"=>$key,
						"o"=>$a->$key,
						"n"=>$value,
					);
				}

				$a->$key = $value;
			}
		}

		$a->save();
		$ID = ($a->ID) ? $a->ID : $a->_id;


		if (isset($values['services'])){


			$where = "";
			if ($values['companyID']){
				$where = "companyID = '{$values['companyID']}'";
			}

			$services_data = services::getInstance()->getAll($where);
			$services = array();

			foreach ($services_data as $item){
				$item['log_label'] = $item['label'];
				if ($item['category']){
					$item['log_label'] = $item['label'] ." (".$item['category'].")";
				}
				$services[$item['ID']] = $item;
			}

			//test_array($services);


			$b = new \DB\SQL\Mapper($f3->get("DB"), "appointments_services");
			foreach ($values['services'] as $key=>$val){
				$b->load("ID='{$val['ID']}'");

				if ($val['serviceID']==""){
					if (!$b->dry()){
						$log[] = array(
							"k"=>"services-removed",
							"o"=>$b->serviceID,
							"n"=>"",
							"l"=>"Service Removed - [".$services[$b->serviceID]['log_label']."] - ".$b->appointmentStart
						);
						$b->erase();
					}
				} else {
					if ($b->dry()){
						$log[] = array(
							"k"=>"services-added",
							"o"=>"",
							"n"=>$val['serviceID'],
							"l"=>"Service Added - [".$services[$val['serviceID']]['log_label']."] - ".$val['appointmentStart']
						);
					} else {
						$appointmentStart = "";
						if ($b->appointmentStart != $val['appointmentStart']){
							$appointmentStart = " - ".$b->appointmentStart . "->" . $val['appointmentStart'];
						}

						if ($b->serviceID != $val['serviceID']){
							$log[] = array(
								"k"=>"services-changed",
								"o"=>$b->serviceID,
								"n"=>$val['serviceID'],
								"l"=>"Service Changed - [".$services[$b->serviceID]['log_label']."] => [" .$services[$val['serviceID']]['log_label']."]".$appointmentStart
							);
						}
					}


					$b->appointmentID = $ID;
					$b->staffID = $val['staffID']?$val['staffID']:null;
					$b->serviceID = $val['serviceID'];
					$b->appointmentStart = $val['appointmentStart'];
				}
				$b->save();




			}



		}

		if(isset($values['from'])&&$values['from']=="front"){
			$action = $action . "-front";
		}

		//test_array(array($action,$values));
		action::getInstance()->call($ID,$action,$log);



		
		
		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return $ID;
	}

	

	public static function _delete($ID) {
		$timer = new timer();
		$f3 = \Base::instance();
		$user = $f3->get("user");

		$action = "deleted";

		if(isset($values['from'])&&$values['from']=="front"){
			$action = $action . "-front";
		}

		//test_array(array($action,$values));


		$a = new \DB\SQL\Mapper($f3->get("DB"),"appointments");
		$a->load("ID='$ID'");


		$log = array();


		action::getInstance()->call($ID,$action,$log);
		$a->erase();

		$a->save();
		$f3->get("DB")->exec("DELETE FROM appointments_services WHERE appointmentID ='$ID'");
		$f3->get("DB")->exec("DELETE FROM logs WHERE appointmentID ='$ID'");
		$f3->get("DB")->exec("DELETE FROM notifications WHERE appointmentID ='$ID'");



		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return "done";

	}

	function services($records,$options){
		$recordIDs = array();
		$timer = new timer();
		$f3 = \Base::instance();
		foreach ($records as $item) {
			$recordIDs[] = $item['ID'];
		}
		//test_array($records);
		if (count($recordIDs)){
			$recordIDs_str = implode(",", $recordIDs);
			$staff_sql = "";
			if ($options['staffID']){
				$staff_sql = " AND staffID = '{$options['staffID']}'";

			}
//test_array($recordIDs);

			$data = $f3->get("DB")->exec("SELECT * FROM appointments_services WHERE appointmentID in ({$recordIDs_str}) $staff_sql");

			$ids = array(
				"staff"=>array(),
				"services"=>array(),
				"clients"=>array(),
			);
			$lookup = array();
			foreach ($data as $item){
				if ($item['staffID'] && !in_array($item['staffID'],$ids['staff']))$ids['staff'][] = $item['staffID'];
				if ($item['serviceID'] && !in_array($item['serviceID'],$ids['services']))$ids['services'][] = $item['serviceID'];
				//if ($item['serviceID'] && !in_array($item['serviceID'],$ids['services']))$ids['services'][] = $item['serviceID'];

				$lookup[$item['appointmentID']][$item['serviceID']][] = $item['staffID'];

			}


			$staff = count($ids['staff'])?staff::getInstance()->getAll("ID in (".implode(",",$ids['staff']).")","first_name ASC"):array();
			$services = count($ids['services'])?services::getInstance()->getAll("ID in (".implode(",",$ids['services']).")","category ASC, label ASC"):array();

			$data_arr = array();
			foreach ($data as $item){
				$data_arr[$item["appointmentID"]][] = $item;
			}
			$staff_arr = array();
			foreach ($staff as $item){
				$staff_arr[$item["ID"]] = $item;
			}

			$services_arr = array();
			foreach ($services as $item){
				$services_arr[$item["ID"]] = $item;
			}



			//test_array($lookup);
			$rec = array();
			foreach ($records as $item){
				$item['price'] = 0;
				$item['duration'] = 0;
				$item['duration_view'] = "";
				$item['services'] = array();


				if (isset($data_arr[$item['ID']])){
					$s = array();
					foreach ($data_arr[$item['ID']] as $ser){
						$serv = $services_arr[$ser['serviceID']];

						if (is_numeric($serv['duration'])) $item['duration'] = $item['duration'] + $serv['duration'];
						if (is_numeric($serv['price'])) $item['price'] = $item['price'] + $serv['price'];

						$serv['staffID'] = $ser["staffID"];
						$serv['staff_member'] = $staff_arr[$ser["staffID"]];
						$serv['recordID'] = $ser['ID'];
						$serv['appointmentStart'] = $ser['appointmentStart'];
						$serv['appointmentEnd'] = date("Y-m-d H:i:s",strtotime(" + ".$serv['duration']." minutes",strtotime($serv['appointmentStart'])));
						$serv['time'] = array(
							"start"=> date("Y-m-d H:i:s",strtotime($serv['appointmentStart'])),
							"end"=> $serv['appointmentEnd'],
						);
						$serv['time']['start_view'] = date("H:i:s",strtotime($serv['time']['start']));
						$serv['time']['start_view_short'] = date("H:i",strtotime($serv['time']['start']));
						$serv['time']['end_view'] = date("H:i:s",strtotime($serv['time']['end']));
						$serv['time']['end_view_short'] = date("H:i",strtotime($serv['time']['end']));
						$serv['time']['day_view'] = date("D, d M Y",strtotime($serv['time']['start']));


						$s[] = $serv;


					}

					$s_arr = array();
					foreach ($s as $s_item){
						$s_arr[(int)strtotime($s_item['appointmentStart']).".".$s_item['ID']] = $s_item;
					}

					usort($s_arr, function($a, $b) {
						if(strtotime($a['appointmentStart'])==strtotime($b['appointmentStart'])) return 0;
						return strtotime($a['appointmentStart']) > strtotime($b['appointmentStart'])?1:-1;
					});

					$s = $s_arr;

					//if ($item['ID']=="89"){
					//	test_array($s);
					//}




					//$item['ser'] = $data_arr[$item['ID']];
					$item['services'] = $s;

				}

				$item['duration_view'] = seconds_to_time($item['duration']*60,true);

				$rec[] = $item;

			}
			$records = $rec;
		}



		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return $records;
	}
	
	static function format($data,$options) {
		$timer = new timer();
		$single = false;
		$f3 = \Base::instance();
		//	test_array($items); 
		if (isset($data['ID'])) {
			$single = true;
			$data = array($data);
		}
		//test_array($items);
		
		
		
		$recordIDs = array();
		
		$i = 1;
		$records = array();
		foreach ($data as $item) {
			$recordIDs[] = $item['ID'];
			if (isset($item['data'])) $item['data'] = json_decode($item['data'],true);


			$item['past'] = strtotime(" + ".$item['duration']." minutes",strtotime($item['appointmentStart'])) < strtotime("now")?1:0;
			$item['active'] = 0;


//			test_array($item);

			$item['time'] = array(
				"start"=> date("Y-m-d H:i:s",strtotime($item['appointmentStart'])),
				"end"=> date("Y-m-d H:i:s",strtotime($item['appointmentEnd'])),
			);
			$item['time']['start_view'] = date("H:i:s",strtotime($item['time']['start']));
			$item['time']['start_view_short'] = date("H:i",strtotime($item['time']['start']));
			$item['time']['end_view'] = date("H:i:s",strtotime($item['time']['end']));
			$item['time']['end_view_short'] = date("H:i",strtotime($item['time']['end']));
			$item['time']['day_view'] = date("D, d M Y",strtotime($item['time']['start']));


			if (strtotime($item['time']['start'])<=strtotime("now") && strtotime($item['time']['end'])>=strtotime("now")){
				$item['active'] = 1;
			}


			$records[] = $item;
		}
		$recordIDs_str = implode(",", $recordIDs);




		if (isset($options['client']) && $options['client']){
			$clientIDs = array();
			$r = array();
			foreach ($records as $item) {
				if (!in_array($item['clientID'],$clientIDs))$clientIDs[] = $item['clientID'];
			}

			if (count($clientIDs)){
				$ids = implode(",", $clientIDs);
				$clients = clients::getInstance()->getALL("clients.ID IN ($ids)","");

				$c = array();
				foreach ($clients as $item){
					$c[$item['ID']] = $item;
				}



				foreach ($records as $item) {
					$item['client']=isset($c[$item['clientID']])?$c[$item['clientID']]:array();
					$r[] = $item;

				}


			}



			$records = $r;

		}






		
		
		//test_array($options); 
		
		
		
		
		
		if ($single) $records = $records[0];
		
		

		
		
		//test_array($records);
		
		
		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return $records;
	}
	function agenda_view($records,$day="",$staffID=""){
		$single = false;
		if (isset($records['ID'])) {
			$single = true;
			$records = array($records);
		}

		$settings = $this->f3->get("settings");
		$dateForNow = array();
		foreach ($records as $item) {

			if (!in_array(date("Y-m-d", strtotime($item['appointmentStart'])), $dateForNow)) {
				$dateForNow[] = date("Y-m-d", strtotime($item['appointmentStart']));
			}

		}

		if ($day){
			$dateForNow = array(date("Y-m-d", strtotime($day)));
		}
		$business_hours = false;
		if (count($dateForNow)==1){
			if (isset($dateForNow[0])){

				$dayofweek = strtolower(date('l', strtotime($dateForNow[0])));




				if (isset($settings['open'][$dayofweek])){
					//test_array($settings['open'][$dayofweek]);

					if (($settings['open'][$dayofweek]['start'] && $settings['open'][$dayofweek]['end']) && !in_array(date('d-m', strtotime($dateForNow[0])),(array) $settings['closed'])){
						$business_hours = array(
							"start"=>date("Y-m-d H:i:s",strtotime($settings['open'][$dayofweek]['start'].":00")),
							"end"=>date("Y-m-d H:i:s",strtotime($settings['open'][$dayofweek]['end'].":00"))
						);
					}

				}


			}

		}
		$bussiness_hours_active = true;
		if (!$business_hours){
			$bussiness_hours_active = false;
			$business_hours = array(
				"start"=>date("Y-m-d H:i:s",strtotime("00:00:00")),
				"end"=>date("Y-m-d H:i:s",strtotime("00:00:00"))
			);
		}


		//test_array($business_hours);
		$return = array();

		$return['closed_hours'] = array(
			"l"=>0,
			"r"=>0,
		);




		//test_array($records);

		$business_hours['start_l'] = "23:59:59";
		$business_hours['end_r'] = "00:00:00";
		if ($bussiness_hours_active){
			$business_hours['start_l'] = date("H:i:s",strtotime($business_hours['start']));
			$business_hours['end_r'] = date("H:i:s",strtotime($business_hours['end']));
		}





		$day_s = strtotime(date("Y-m-d 00:00:00",strtotime($business_hours['start'])));
		$day_e = strtotime(date("Y-m-d 23:59:59",strtotime($business_hours['end'])));
		$day = $day_e - $day_s;




		//test_array($business_hours);
		$new_records = array();
		foreach ($records as $appointment){





			foreach ($appointment['services'] as $item){

				unset($appointment['services']);
				$item['appointment'] = $appointment;

				$day_s_item = strtotime(date("Y-m-d 00:00:00",strtotime($item['time']['start'])));
				$day_e_item = strtotime(date("Y-m-d 23:59:59",strtotime($item['time']['end'])));
				$day_item = $day_e_item - $day_s_item;

				$s = strtotime($item['time']['start']);
				$e = strtotime($item['time']['end']);


				if (date("His",$s)<date("His",strtotime($business_hours['start_l']))){
					$business_hours['start_l'] = date("H:i:s",$s);
				}
				if (date("His",$e)>date("His",strtotime($business_hours['end_r']))){
					$business_hours['end_r'] = date("H:i:s",$e);
				}



				if ($item['ID']=='1'){
				//	if (isset($_GET['debug'])) test_array(array($business_hours,date("His",$s),date("His",strtotime($business_hours['start_l'])),$comp));
				}


				$l = $s - $day_s_item;


				$l= ($l / $day_item)*100;

				//test_array(date("Y-m-d H:i:s",$day_e_item));


				$r = $day_e_item - $e;

				if ($r < 0){
					$r = 0;
				} else {
					$r = ($r / $day_item)*100;
				}

				//$r = 100 - $r;

				if ($l < 0)$l = 0;
				// if ($r < 0)$l = 0;

				//test_array(array("day s"=>$day_s,"day e"=>$day_e, "day"=> $day,"s"=>$s,"e"=>$e,"l"=>$l ));



				$item['agenda']['l'] = $l;
				$item['agenda']['r'] = $r;
				$new_records[] = $item;
			}
		}


		$return['settings'] = array(
			"width"=>(100 / 24)
		);

		if ($single) $new_records = $new_records[0];
		$return['items'] = $new_records;







		$reserved_timeslots = array();
		$staffsql = "";
		if ($staffID){
			$staffsql = " AND (staffID ='0' OR staffID is null OR staffID='$staffID')";
		}


		$reserved_data = \models\timeslots::getInstance()->getAll("companyID = '{$this->user['company']['ID']}' $staffsql","","",array("staff"=>true));

		$day = $dateForNow[0];
		foreach ($reserved_data as $item){

			$include_item = false;
			switch ($item['repeat_mode']){
				case "0":
					$item['start_date'] = date("Y-m-d H:i:s",strtotime($item['data']['onceoff'] . " " . $item['start'].":00"));
					$item['end_date'] = date("Y-m-d H:i:s",strtotime($item['data']['onceoff'] . " " . $item['end'].":00"));

					if ($item['data']['onceoff'] == $day){
						$include_item = true;
					}
					break;
				case "1":
					$item['start_date'] = date("Y-m-d ".$item['start'].":00",strtotime($day));
					$item['end_date'] = date("Y-m-d ".$item['end'].":00",strtotime($day));
					$include_item = true;
					break;

				case "2":

					$dow_numeric = date('w',strtotime($day));

					$dayoftheweek = strtolower(date('l', strtotime("Sunday +{$dow_numeric} days")));
					$days = explode(",",$item['data']['weekly']);

					$item['start_date'] = date("Y-m-d ".$item['start'].":00",strtotime($day));
					$item['end_date'] = date("Y-m-d ".$item['end'].":00",strtotime($day));


					$item['dow'] = $dayoftheweek;
					if (count($days)){

						if (in_array($dayoftheweek,$days)){
							$include_item = true;
						}


					}




					break;

				case "3":
					$item['start_date'] = date("Y-m-d ".$item['start'].":00",strtotime($day));
					$item['end_date'] = date("Y-m-d ".$item['end'].":00",strtotime($day));
					$daytoday = date("d",strtotime($day));
					$days = explode(",",$item['data']['monthly']);
					if (count($days)){

						if (in_array($daytoday,$days)){
							$include_item = true;
						}


					}




					break;


			}



			if ($include_item){

				$item['time']['start_view_short'] = date("H:i",strtotime($item['start_date']));
				$item['time']['end_view_short'] = date("H:i",strtotime($item['end_date']));

				$day_s_item = strtotime(date("Y-m-d 00:00:00",strtotime($item['start_date'])));
				$day_e_item = strtotime(date("Y-m-d 23:59:59",strtotime($item['end_date'])));
				$day_item = $day_e_item - $day_s_item;

				$s = strtotime($item['start_date']);
				$e = strtotime($item['end_date']);


				$l = $s - $day_s_item;


				$l= ($l / $day_item)*100;

				//test_array(date("Y-m-d H:i:s",$day_e_item));


				$r = $day_e_item - $e;

				if ($r < 0){
					$r = 0;
				} else {
					$r = ($r / $day_item)*100;
				}

				//$r = 100 - $r;

				if ($l < 0)$l = 0;
				// if ($r < 0)$l = 0;

				//test_array(array("day s"=>$day_s,"day e"=>$day_e, "day"=> $day,"s"=>$s,"e"=>$e,"l"=>$l ));



				$item['agenda']['l'] = $l;
				$item['agenda']['r'] = $r;


				$reserved_timeslots[] = $item;
			}
		}









		//test_array($reserved_data);
		//test_array($reserved_timeslots);
		$return['reserved'] = $reserved_timeslots;




		$endh = strtotime($business_hours['end_r']);
		$starth = strtotime($business_hours['start_l']);

		$secinday = 60 * 60 * 24;
		$starth_ = (($starth - $day_s));
		$endh_ = (($day_e - $endh));

		$s = ($starth_ / $secinday)*100;
		$e = ($endh_ / $secinday)*100;


		$m = $starth_ +  $endh_;
		$m_ = $secinday / ($secinday - $m);


		$multiplier = $m_;

		$now = strtotime("now");

		$nowh_ = (($now - $day_s));
		$n = ($nowh_ / $secinday)*100;


		if (count($dateForNow)==1){
			if (isset($dateForNow[0])){
				if (date("Y-m-d",$now) == $dateForNow[0]){
					$return['today'] = $n;
				}


			}

		}

		$endh_close = strtotime($business_hours['end']);

		$starth_close = strtotime($business_hours['start']);
		$starth_close_ = (($starth_close - $day_s));
		$s_close = 100 - ($starth_close_ / $secinday)*100;

		$endh_close = strtotime($business_hours['end']);
		$endh_close_ = (($day_e-$endh_close));
		$e_close = 100 - ($endh_close_ / $secinday)*100;


	//	test_array($e_close);
// 68.65 | 80.7

		$return['closed_hours'] = array(
			"l"=>$s_close,
			"r"=>$e_close,
		);




		$return['settings']['l'] = $s *$multiplier;
		$return['settings']['r'] = $e*$multiplier;
		$return['settings']['m'] = $multiplier;
		$return['settings']['d'] = $day;
		$return['settings']['active'] = $bussiness_hours_active;


		//test_array($return);
		return $return;

	}
	
	
	
}
