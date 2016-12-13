<?php
namespace controllers\front\data;
use models as models;

class _ extends \controllers\_ {
	private static $instance;
	function __construct() {
		$this->f3 = \Base::instance();
		parent::__construct();
		$this->user = $this->f3->get("user");
		
		$this->f3->set("__runJSON", true);
		
		
	}
	public static function getInstance() {
		if (is_null(self::$instance)) {
			self::$instance = new self();
		}
		return self::$instance;
	}


}
