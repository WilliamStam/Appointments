<?php
namespace models;
use \timer as timer;

class settings extends _ {

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
		$where = "(ID = '$ID' OR setting = '$ID')";
		
		
		$result = $this->getData($where,"","0,1",$options);
		

		if (count($result)) {
			$return = $result[0];
			
		} else {
			$return = parent::dbStructure("settings");
		}
		
		if ($options['format']){
			$return = $this->format($return,$options);
		}
		
		
		//test_array($return);
		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return $return;
	}
	public function getAll($where = array(), $options = array()) {
		$result = $this->getData($where,$options);
		$result = $this->format($result,$options);
		return $result;
		
	}
	
	public function getData($where = array(), $options = array()) {
		$timer = new timer();
		$f3 = \Base::instance();

		if ($where) {
			$where = "setting in (".implode(",",$where).")";
			$where = "WHERE " . $where . "";
		} else {
			$where = " ";
		}



		$args = "";
		if (isset($options['args'])) $args = $options['args'];

		$ttl = "";
		if (isset($options['ttl'])) $ttl = $options['ttl'];
		



		$result = $f3->get("DB")->exec("
			 SELECT DISTINCT *
			FROM settings 
			$where
			GROUP BY ID
		", $args, $ttl
		);

		$return = $result;
		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return $return;
	}

	
	
	public static function _save($values = array()) {
		$timer = new timer();
		$f3 = \Base::instance();
		$return = array();
		$a = new \DB\SQL\Mapper($f3->get("DB"), "settings");

		foreach ($values as $key=>$value){
			$a->load("ID='$key' OR setting='$key'");
			$a->setting=$key;
			$a->data=json_encode($value);
			$a->save();
			$a->reset();

		}
		

		
		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return "saved";
	}

	

	public static function _delete($ID) {
		$timer = new timer();
		$f3 = \Base::instance();
		$user = $f3->get("user");


		$a = new \DB\SQL\Mapper($f3->get("DB"),"settings");
		$a->load("ID='$ID' OR settings ='$ID''");

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
		
		$i = 1;
		$n = array();
		foreach ($data as $item) {
			$recordIDs[] = $item['ID'];

			$n[$item['setting']] = json_decode($item['data'],true);




		}
		

		
		
		//test_array($options); 
		
		
		
		
		
		if ($single) $n = $n[0];
		
		
		$records = $n;
		
		
		
		//test_array($records);
		
		
		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return $records;
	}
	
	
	
	
}
