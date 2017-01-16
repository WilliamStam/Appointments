<?php

namespace controllers\admin\save;
use \models as models;

class settings extends _ {
	function __construct() {
		parent::__construct();
	}


	
	function form() {
		$result = array();

		$settings = array();

		if (isset($_POST['open'])){
			$settings['open']=$_POST['open'];
		}
		if (isset($_POST['closed'])){
			$settings['closed']=$_POST['closed'];
		}
		if (isset($_POST['daysAhead'])){
			$settings['daysAhead']=$_POST['daysAhead'];
		}
		if (isset($_POST['timeslots'])){
			$settings['timeslots']=$_POST['timeslots'];
		}
		if (isset($_POST['client_form_branding'])){
			$settings['client_form_branding']=$_POST['client_form_branding'];
		}

		//test_array($_POST);


		$values = array(
			"company"=>$_POST['company'],
			"url"=>strtolower($_POST['url']),
			"settings"=>$settings,

		);


		$urllookup = models\companies::getInstance()->get($values['url']);

		if ($urllookup['ID'] && $urllookup['ID']!=$this->user['company']['ID']){
			$this->errors['url'] = "Url exists for another company";
		}



		$response = "";
		if (count($this->errors)==0){
			//test_array($values);
			$response = models\companies::_save($this->user['company']['ID'],$values);
		}
		$return = array(
				"ID" => $response,
				"errors" => $this->errors
		);
		
		return $GLOBALS["output"]['data'] = $return;
	}
	
	

	
	
	
	


}
