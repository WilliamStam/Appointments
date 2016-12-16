<?php

namespace controllers\admin\data;

use \models as models;

class settings extends _ {
	function __construct() {
		parent::__construct();

	}


	function form() {
		$return = array();


		$return['settings'] = $this->f3->get("settings");


		return $GLOBALS["output"]['data'] = $return;
	}




}
