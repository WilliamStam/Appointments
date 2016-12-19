<?php
namespace controllers\admin\data;
use models as models;

class _ extends \controllers\_ {
	private static $instance;
	function __construct() {
		$this->f3 = \Base::instance();
		parent::__construct();
		$this->user = $this->f3->get("user");
		if ($this->user['ID']==""){
			$this->f3->error(403);
		}
		$this->settings = $this->f3->get("settings");
		$this->f3->set("__runJSON", true);
		
		
	}
	


}
