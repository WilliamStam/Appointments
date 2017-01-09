<?php
namespace controllers\front;
use \timer as timer;
use \models as models;
class _ extends \controllers\_ {

	function __construct() {
		$this->f3 = \Base::instance();
		parent::__construct();
		$this->user = $this->f3->get("user");
		$this->cfg = $this->f3->get("cfg");
		$this->settings = $this->f3->get("settings");

		header( 'X-Frame-Options: ALLOW' );

	}

	function templatefile($class){
		$class = str_replace("controllers\\front\\","",$class);
		return $class;
		
	}

	
}
