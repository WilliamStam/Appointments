<?php
namespace models;
use \timer as timer;

class users extends _ {
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
		$where = "ID = '$ID'";
		if (!is_numeric($ID)) {
			$where = "username = '$ID'";
		}


		$result = $this->f3->get("DB")->exec("
			SELECT *
			FROM users
			WHERE $where;
		"
		);


		if (count($result)) {
			$return = $result[0];
			
		} else {
			$return = parent::dbStructure("users");
		}
		
		//test_array($return);
		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return $return;
	}

	public function getAll($where = "", $orderby = "", $limit = "", $options = array()) {
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
			FROM users
			$where
			$orderby
			$limit;
		", $args, $ttl
		);

		$return = $result;
		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return $return;
	}

	public static function login($username, $password) {
		$f3 = \Base::instance();
		$timer = new timer();

		$ID = "";


		setcookie("username", $username, time() + 31536000, "/");


		$password_hash = md5(md5('salt').$password);
		


		$result = $f3->get("DB")->exec("
			SELECT ID, username FROM users WHERE `username` ='$username' AND `password` = '$password_hash'
		");


		if (count($result)) {
			$result = $result[0];
			$ID = $result['ID'];
			$f3->get("DB")->exec("UPDATE users SET lastlogin = now() WHERE ID = '$ID';");


			$_SESSION['uID'] = base64_encode($ID);
			if (isset($_COOKIE['username'])) {
				$_COOKIE['username'] = $result['username'];
			} else {
				setcookie("username", $result['username'], time() + 31536000, "/");
			}

			
			
		}

		$return = $ID;
		$timer->stop(array("Models" => array("Class" => __CLASS__, "Method" => __FUNCTION__)), func_get_args());
		return $return;
	}

	public static function _save($ID, $values = array()) {
		$timer = new timer();
		$f3 = \Base::instance();
		$return = array();
		$domain=$f3->get("domain");
		$domainID = $domain['ID'];
		
		if (isset($values['ID'])) unset($values['ID']);
		if (isset($values['password'])){
			if ($values['password']!=""){
				$values['password'] = md5(md5('salt') . $values['password']);
			} else {
				unset($values['password']);
			}

		}


		//test_array($values);

		$a = new \DB\SQL\Mapper($f3->get("DB"), "users");
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


		$a = new \DB\SQL\Mapper($f3->get("DB"),"users");
		$a->load("ID='$ID'");

		$a->erase();

		$a->save();


		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return "done";

	}
	
	
	static function format($data) {
		$timer = new timer();
		$single = false;
		//	test_array($items); 
		if (isset($data['ID'])) {
			$single = true;
			$data = array($data);
		}
		//test_array($items);
		
		$i = 1;
		$n = array();
		foreach ($data as $item) {
			
			
			$n[] = $item;
		}
		
		if ($single) $n = $n[0];
		
		
		$records = $n;
		
		
		
		//test_array($n); 
		
		
		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());
		return $n;
	}
	
	
	static function lastActivity($user){
		if ($user['ID']){
			//self::_save($user['ID'],array("lastActivity"=>date("Y-m-d H:i:s")));
		}
		
		
		//test_array($settings); 
	}
	
	
}
