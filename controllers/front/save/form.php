<?php

namespace controllers\front\save;
use \models as models;

class form extends _ {
	function __construct() {
		parent::__construct();
		$this->errors = array();
	}


	function form(){
		$return = array();
		$ID = isset($_GET['ID'])?$_GET['ID']:"";



		$values = $_POST['submit'];

		$services = array();
		$servie = explode(",",$values['services']);

		foreach ($servie as $item){
			$services['new-'.$item]=array(
				"serviceID"=>$item
			);
		}
		$values["services"] = $services;
		$values["from"] = "front";



		//$this->errors['error'] = true;

		if (count($this->errors)==0){

			$values['clientID'] = models\clients::_save($values['client']['ID'],$values['client']);
			unset($values['client']);
			$return['clientID'] = $values['clientID'];
			$return['appointmentID'] = models\appointments::_save($ID,$values);

		}

		$_SESSION['data'] = json_encode(array());


		return $GLOBALS["output"]['data'] = $return;
	}




}
