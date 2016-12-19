<?php
namespace models;
use \timer as timer;

class _ {
	private static $instance;
	function __construct() {
		$this->f3 = \Base::instance();
		$this->user = $this->f3->get("user");
		$this->cfg = $this->f3->get("cfg");
		$this->settings = $this->f3->get("settings");

		//test_array($this->cfg);
	}


	public static function dbStructure($table, $additionalFields = array()) {
		$f3 = \Base::instance();
		$result = array();
		foreach ($f3->get("DB")->exec("EXPLAIN $table;") as $key => $value) {
			$result[$value["Field"]] = "";
		}
		foreach ($additionalFields as $key => $value) {
			if ($key) {
				$result[$key] = $value;
			} else {
				$result[$value] = "";
			}
		}
		return $result;
	}
	
	
	
	function lookup($ID, $table) {
		$art = new \DB\SQL\Mapper($this->f3->get("DB"), $table);
		$art->load("ID ='$ID'");
		
		return $art;
	}
	
	public static function getInstance() {
		if (is_null(self::$instance)) {
			self::$instance = new self();
		}
		return self::$instance;
	}
}
