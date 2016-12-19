<?php
namespace models;
use \timer as timer;

class logs extends _ {
	/*
	 * EVENT ID's
	 * add_1 	added - admin
	 * add_2 	added - front
	 * edi_1 changed - admin
	 * edi_2 changed - front
	 * del_1 deleted
	 * rem_1 Reminder
	 * not_1 notified client mobile
	 * not_2 notified client email
	 * not_3 notified admin mobile
	 * not_4 notified admin email
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
			FROM logs 
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

		if ($single) $n = $n[0];
		$records = $n;


		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return $records;
	}

	function _log($appointmentID,$label,$eventID,$log){

		$timer = new timer();
		$f3 = \Base::instance();
		$return = array();



		if (isset($values['data']))$values['data'] = json_encode($values['data']);


		$a = new \DB\SQL\Mapper($f3->get("DB"), "logs");
		$a->appointmentID = $appointmentID;
		$a->label = $label;
		$a->eventID = $eventID;
		$a->data = json_encode($log);


		$a->save();
		$ID = ($a->ID) ? $a->ID : $a->_id;


		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return $ID;



	}
	function _notify($appointmentID,$eventID,$log,$status){

		$timer = new timer();
		$f3 = \Base::instance();
		$return = array();



		if (isset($values['data']))$values['data'] = json_encode($values['data']);


		$a = new \DB\SQL\Mapper($f3->get("DB"), "notifications");
		$a->appointmentID = $appointmentID;
		$a->eventID = $eventID;
		$a->status = ($status)?1:0;

		foreach ($log as $key => $value) {
			if (isset($a->$key)) {
				$a->$key = $value;
			}
		}


		$a->save();
		$ID = ($a->ID) ? $a->ID : $a->_id;


		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return $ID;



	}

	
	
}
