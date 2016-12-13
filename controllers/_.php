<?php
namespace controllers;
use \timer as timer;
use \models as models;
class _ {

	function __construct() {
		$this->f3 = \base::instance();
		$this->user = $this->f3->get("user");
		$this->cfg = $this->f3->get("cfg");

		
		
	}

	function templatefile($class){
		$class = str_replace("controllers\\","",$class);
		return $class;
		
	}

	
}
