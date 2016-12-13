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
		$where = "(ID = '$ID' OR MD5(ID) = '$ID')";
		
		
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
			$orderby = " ORDER BY " . $orderby;
		}
		if ($limit) {
			$limit = " LIMIT " . $limit;
		}

		$args = "";
		if (isset($options['args'])) $args = $options['args'];

		$ttl = "";
		if (isset($options['ttl'])) $ttl = $options['ttl'];
		



		$result = $f3->get("DB")->exec("
			 SELECT DISTINCT *
			FROM appointments 
			$where
			GROUP BY ID
			$orderby
			$limit;
		", $args, $ttl
		);

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

		foreach ($values as $key => $value) {
			if (isset($a->$key)) {
				$a->$key = $value;
			}
		}

		$a->save();
		$ID = ($a->ID) ? $a->ID : $a->_id;


		if (isset($values['services'])){

			$b = new \DB\SQL\Mapper($f3->get("DB"), "appointments_services");
			foreach ($values['services'] as $key=>$val){
				$b->load("ID='$key'");

				if ($val['serviceID']==""){
					$b->erase();
				} else {
					$b->appointmentID = $ID;
					$b->staffID = $val['staffID']?$val['staffID']:null;
					$b->serviceID = $val['serviceID'];
				}
				$b->save();




			}



		}


		
		
		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return $ID;
	}

	

	public static function _delete($ID) {
		$timer = new timer();
		$f3 = \Base::instance();
		$user = $f3->get("user");


		$a = new \DB\SQL\Mapper($f3->get("DB"),"appointments");
		$a->load("ID='$ID'");

		$a->erase();

		$a->save();


		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return "done";

	}

	function services($records){
		$recordIDs = array();
		$timer = new timer();
		$f3 = \Base::instance();
		foreach ($records as $item) {
			$recordIDs[] = $item['ID'];
		}
		if (count($recordIDs)){
			$recordIDs_str = implode(",", $recordIDs);

//test_array($recordIDs);

			$data = $f3->get("DB")->exec("SELECT * FROM appointments_services WHERE appointmentID in ({$recordIDs_str})");

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


			$staff = count($ids['staff'])?staff::getInstance()->getAll("ID in (".implode(",",$ids['staff']).")"):array();
			$services = count($ids['services'])?services::getInstance()->getAll("ID in (".implode(",",$ids['services']).")"):array();

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


			//	test_array($data_arr);
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

						$serv['staff'] = $staff_arr[$ser["ID"]];
						$serv['recordID'] = $ser['ID'];
						$s[] = $serv;

					}


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



			$item['time'] = array(
				"start"=> date("Y-m-d H:i:s",strtotime($item['appointmentStart'])),
				"end"=> date("Y-m-d H:i:s",strtotime(" + ".$item['duration']." minutes",strtotime($item['appointmentStart']))),
			);

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
				$clients = clients::getInstance()->getALL("ID IN ($ids)","");

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
	
	
	
	
}
