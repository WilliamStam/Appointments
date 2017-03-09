<?php
namespace models;
use \timer as timer;

class timeslots extends _ {
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
		$where = "(timeslots.ID = '$ID' OR MD5(timeslots.ID) = '$ID')";
		
		
		$result = $this->getData($where,"","0,1",$options);

		//test_array($options);

		if (count($result)) {
			$return = $result[0];
			
		} else {
			$return = parent::dbStructure("timeslots");
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
		


		$sql = "
			 SELECT DISTINCT timeslots.*
			FROM timeslots
			$where
			GROUP BY timeslots.ID
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


		$a = new \DB\SQL\Mapper($f3->get("DB"), "timeslots");
		$a->load("ID='$ID'");




		$log = array();
		foreach ($values as $key => $value) {
			if (isset($a->$key)) {
				$a->$key = $value;
			}
		}

		$a->save();
		$ID = ($a->ID) ? $a->ID : $a->_id;


		
		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return $ID;
	}

	

	public static function _delete($ID) {
		$timer = new timer();
		$f3 = \Base::instance();
		$user = $f3->get("user");



		$a = new \DB\SQL\Mapper($f3->get("DB"),"timeslots");
		$a->load("ID='$ID'");

		$a->erase();

		$a->save();




		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return "done";

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
		$staffIDs = array();

		$i = 1;
		$records = array();
		foreach ($data as $item) {
			$recordIDs[] = $item['ID'];
			if (!in_array($item['staffID'],$staffIDs)&&$item['staffID']) $staffIDs[] = $item['staffID'];
			if (isset($item['data'])) {
				$item['data'] = (array) json_decode($item['data'],true);
			} else {
				$item['data'] = array();
			}

			$item['repeat_data'] = "";
			switch($item['repeat_mode']){
				case "0":
					$item['repeat_data'] = $item['data']['onceoff'];
					break;
				case "1":
					$item['repeat_data'] = $item['data']['daily'];
					break;
				case "2":
					$item['repeat_data'] = $item['data']['weekly'];
					break;
				case "3":
					$item['repeat_data'] = $item['data']['monthly'];
					break;

			}

			$item['start'] = substr($item['start'],0,5);
			$item['end'] = substr($item['end'],0,5);





			$records[] = $item;
		}


		if (isset($options['staff'])&&$options['staff']){
			$staff = array();
			if (count($staffIDs)){
				$staffIDs = implode(",",$staffIDs);
				//test_array("ID IN ({$staffIDs})");
				$staff_ = staff::getInstance()->getAll("ID IN ({$staffIDs})","first_name","",array("format"=>true));

				foreach ($staff_ as $item){
					$staff[$item['ID']] = $item;
				}
			}

			$n = array();
			foreach ($records as $item){

				if (isset($staff[$item['staffID']])){
					$item['staff_member'] = $staff[$item['staffID']];
				} else {
					if ($item['staffID']==0){
						$item['staff_member'] = array(
							"ID"=>"all",
							"first_name"=>"All staff",
							"color"=>""
						);
					}
				}

				$n[] = $item;
			}
			$records = $n;


		}


		
		
		if ($single) $records = $records[0];
		
		

		
		
		//test_array($records);
		
		
		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return $records;
	}

	
}
