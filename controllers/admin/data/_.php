<?php
namespace controllers\admin\data;
use models as models;

class _ extends \controllers\_ {
	private static $instance;
	function __construct() {
		$this->f3 = \Base::instance();
		parent::__construct();
		$this->user = $this->f3->get("user");
		
		$this->f3->set("__runJSON", true);
		
		
	}
	


}
