<?php

namespace controllers\admin\save;
use \models as models;

class form extends _ {
	function __construct() {
		parent::__construct();
	}


	
	function client() {
		$result = array();
		$ID = isset($_REQUEST['ID'])?$_REQUEST['ID']:"";
		
		$values = array(
				"first_name" => $this->post("first_name",true),
				"last_name" => $this->post("last_name"),
				"mobile_number" => $this->post("mobile_number",true),
				"mobile_number_notification" => $this->post("mobile_number_notification"),
				"email_notification" => $this->post("email_notification"),
				"email" => $this->post("email"),
				"notes" => $this->post("notes"),
			"companyID" => $this->user['company']['ID'],
		);







		
		if (count($this->errors)==0){
			
			$ID = models\clients::_save($ID,$values);
		}
		$return = array(
				"ID" => $ID,
				"errors" => $this->errors
		);
		
		return $GLOBALS["output"]['data'] = $return;
	}

	function appointment() {
		$result = array();
		$ID = isset($_REQUEST['ID'])?$_REQUEST['ID']:"";




		$values = array(
				"clientID" => $this->post("clientID",true),
				"appointmentStart" => $this->post("appointmentStart",true),
				"notes" => $this->post("notes"),
				"services" => $this->post("services"),
			"companyID" => $this->user['company']['ID'],

		);



		$services = array();

		if (count($values['services']['records'])){

			foreach ($values['services'] as $key=>$item){
				if ($item['serviceID']){
					$services[$key] = $item;
				}
				if (is_numeric($key)&&$item['serviceID']==""){

					$services[$key] = $item;
				}


			}

		}

		$values['services'] = $services;
		if (!count($values['services'])){

			$this->errors['services-area'] = "Please select at least 1 service";

		}

	//	test_array($values);








		if (count($this->errors)==0){

			$ID = models\appointments::_save($ID,$values);
		}
		$return = array(
				"ID" => $ID,
				"errors" => $this->errors
		);

		return $GLOBALS["output"]['data'] = $return;
	}
	function timeslot() {
		$result = array();
		$ID = isset($_REQUEST['ID'])?$_REQUEST['ID']:"";




		$values = array(
				"label" => $this->post("label",true),
				"start" => $this->post("start",true),
				"end" => $this->post("end",true),
				"repeat_mode" => $this->post("repeat_mode"),
				"companyID" => $this->user['company']['ID'],

		);

		$old_start = $values['start'];
		$old_end= $values['end'];

		if ($values['end']<$values['start']){
			$values['end'] = $old_start;
			$values['start'] = $old_end;
		}


		$repeat_onceoff = $this->post("repeat_onceoff");
		$repeat_onceoff = $repeat_onceoff?$repeat_onceoff:date("Y-m-d");

		$values['data'] = array(
			"onceoff"=>$this->post("repeat_data_0"),
			"daily"=>$this->post("repeat_data_1"),
			"weekly"=>$this->post("repeat_data_2"),
			"monthly"=>$this->post("repeat_data_3"),
		);


		//test_array($_POST);
		//test_array($values);



		if (count($this->errors)==0){

			$ID = models\timeslots::_save($ID,$values);
		}
		$return = array(
				"ID" => $ID,
				"errors" => $this->errors
		);

		return $GLOBALS["output"]['data'] = $return;
	}
	function delete_appointment(){
		$result = array();
		$ID = isset($_REQUEST['ID'])?$_REQUEST['ID']:"";



		if (count($this->errors)==0){

			$result = models\appointments::_delete($ID);
		}
		$return = array(
			"result" => $result,
			"errors" => $this->errors
		);

		return $GLOBALS["output"]['data'] = $return;
	}
	function delete_timeslot(){
		$result = array();
		$ID = isset($_REQUEST['ID'])?$_REQUEST['ID']:"";



		if (count($this->errors)==0){

			$result = models\timeslots::_delete($ID);
		}
		$return = array(
			"result" => $result,
			"errors" => $this->errors
		);

		return $GLOBALS["output"]['data'] = $return;
	}


	


}
