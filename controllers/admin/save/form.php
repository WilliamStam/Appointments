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


	


}
