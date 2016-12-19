<?php

namespace controllers\admin\data;

use \models as models;

class notifications extends _ {
	function __construct() {
		parent::__construct();

	}


	function form() {
		$return = array();


		$return['settings'] = $this->f3->get("settings");
		unset($return['settings']['smsportal_password']);


		return $GLOBALS["output"]['data'] = $return;
	}




}
