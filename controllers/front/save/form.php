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


		$servie = $values['services'];

		$serverIDS = array();

		$services = array();
		foreach ($servie as $item){
			$serverIDS[] = $item['serviceID'];
			$ser[] = $item;
			$services[]=array(
				"serviceID"=>$item['serviceID'],
				"staffID"=>$item['staffID'],
				"appointmentStart"=>$item['appointmentStart'],
			);


		}
		$values["services"] = $services;


		$values["from"] = "front";
		$values["companyID"] = isset($_POST['companyID'])?$_POST['companyID']:"";

		if ($values["companyID"]==""){
			$this->errors['company'] = "Company needed";
		}
		$serverIDS = implode(",",$serverIDS);
		$services_array = models\services::getInstance()->getAll("companyID='{$values['companyID']}' AND ID in ({$serverIDS})","","",array("staff"=>true));

		$service_ = array();
		foreach ($services_array as $item){
			$service_[$item['ID']] = $item;
		}

		$check_arr = array();
		foreach ($services as $item){
			$check_arr[] = array_merge($item,$service_[$item['serviceID']]);


		}



		//$values['appointmentStart'] = "2017-02-14 09:00:00";

		$slots = models\available_timeslots::getInstance()->timeslots($values['companyID'],$check_arr);;


		foreach ($slots as $item){
			if (count($item['slots']['errors'])){
				$this->errors['appointmentDate_time'] = $item['slots']['errors'];
			}

		}

		//test_array(array("check"=>$check_arr,"slots"=>$slots,"errors"=>$this->errors));



//test_array($slots);

$company = models\companies::getInstance()->get($values["companyID"],array("format"=>true));

		//test_array(array($values,$this->errors));


		//$this->errors['error'] = true;

		if (count($this->errors)==0){

			$values['clientID'] = models\clients::_save($values['client']['ID'],$values['client']);
			unset($values['client']);
			$return['clientID'] = $values['clientID'];
			$return['appointmentID'] = models\appointments::_save($ID,$values);

			$_SESSION['data'] = json_encode(array("woof"));
			session_unset();
			session_destroy();
			session_write_close();
			setcookie(session_name(),'',0,'/');
			unset($_SESSION['data']);

		}

		//

		$redirect = "/{$company['url']}/form/complete";



		$return['errors'] = $this->errors;
		$return['redirect'] = $redirect;

		return $GLOBALS["output"]['data'] = $return;
	}





}
