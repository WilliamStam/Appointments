<?php
namespace models;
use \timer as timer;

class products extends _ {
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
		

		if (count($result)) {
			$return = $result[0];
			
		} else {
			$return = parent::dbStructure("products");
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
		



		$result = $f3->get("DB")->exec("
			 SELECT DISTINCT *
			FROM products 
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



		if (isset($values['data']))$values['data'] = json_encode($values['data']);


		$a = new \DB\SQL\Mapper($f3->get("DB"), "products");
		$a->load("ID='$ID'");

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


		$a = new \DB\SQL\Mapper($f3->get("DB"),"products");
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
		
		$i = 1;
		$n = array();
		foreach ($data as $item) {
			$recordIDs[] = $item['ID'];
			if (isset($item['data'])) $item['data'] = json_decode($item['data'],true);




			$n[] = $item;
		}
		

		
		
		//test_array($options); 
		
		
		
		
		
		if ($single) $n = $n[0];
		
		
		$records = $n;
		
		
		
		//test_array($records);
		
		
		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return $records;
	}
	
	
	
	
}
