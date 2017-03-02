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
		$servie = $values['services'];

		$values['servie'] = $values['services'];

		$ser = array();
		$selected_target = array();
		foreach ($servie as $item=>$val){
			$ser[] = $item;
			$services['new-'.$item]=array(
				"serviceID"=>$servie[$item]['serviceID'],
				"staffID"=>$servie[$item]['staffID'],
				"appointmentStart"=>$values['appointmentDate']." ".$servie[$item]['time'].":00",
			);
			$selected_target[] = array(
				"serviceID"=>$servie[$item]['serviceID'],
				"staffID"=>$servie[$item]['staffID'],
				"time"=>$servie[$item]['time'],
				"ID"=>""
			);

		}
		$values["services"] = $services;


		$values["from"] = "front";
		$values["companyID"] = isset($_POST['companyID'])?$_POST['companyID']:"";

		if ($values["companyID"]==""){
			$this->errors['company'] = "Company needed";
		}

		//$values['appointmentStart'] = "2017-02-14 09:00:00";


		$slots = models\available_timeslots::getInstance()->get($ser,$values['appointmentDate'],$values['companyID'],$selected_target);

		if ($slots['error']){
			$this->errors['appointmentDate_time'] = $slots['error'];
		}

//test_array($slots);



		//test_array(array($values,$this->errors));


		//$this->errors['error'] = true;

		if (count($this->errors)==0){

			$values['clientID'] = models\clients::_save($values['client']['ID'],$values['client']);
			unset($values['client']);
			$return['clientID'] = $values['clientID'];
			$return['appointmentID'] = models\appointments::_save($ID,$values);

			$_SESSION['data'] = json_encode(array());
		}

		//

		$return['errors'] = $this->errors;

		return $GLOBALS["output"]['data'] = $return;
	}





}
