<?php
namespace controllers\front\save;
use models as models;

class _ extends \controllers\_ {
	public $errors;
	function __construct() {
		parent::__construct();
		$this->user = $this->f3->get("user");
		$this->cfg = $this->f3->get("cfg");
		

		$this->f3->set("__runJSON", true);
	}
	
	function post($key, $required = false, $default="") {
		$val = isset($_POST[$key]) ? $_POST[$key] : "";
		if ($required && $val == "") {
			$this->errors[$key] = $required === true ? "" : $required;
		}
		if ($default!="" && $val ==""){
			$val = $default;
		}
		return $val;
	}
	

	
}
