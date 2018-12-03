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
				"notes" => $this->post("notes"),
			"companyID" => $this->user['company']['ID'],

		);

		$services_ = isset($_POST['service'])?$_POST['service']:array();




		$services = array();

		if (count($services_)){

			foreach ($services_ as $key=>$item){

				$appointmentStart = isset($_POST['appointmentDate'])?$_POST['appointmentDate']:"";
				$appointmentStart = $appointmentStart . " " . $item['time'] .":00";

				$recordID = str_replace("edit-", "", $key);
				if (!is_numeric($recordID)){
					$recordID = "";
				}
				if (!$appointmentStart){
					$this->errors['service-'.$key.'-time'] = "Date is required";
				} else {
					if (date("Y-m-d H:i:s",strtotime($appointmentStart))!=$appointmentStart){
						$this->errors['service-'.$key.'-time'] = "Date isn't in a good format";
					}
				}

				if ($item['staffID']==""){
					$this->errors['service-'.$key.'-staffID'] = "Staff member is required";
				}



				$services[$key] = array(

					"ID"=>$recordID,
					"serviceID"=>$item['ID'],
					"appointmentStart"=>$appointmentStart,
					"staffID"=>$item['staffID'],
				);




			}

		}

		//test_array($values);


		$values['services'] = $services;
		if (!count($services)){

			$this->errors['services-area'] = "Please select at least 1 service";

		}







		//test_array($this->errors);


		if (count($this->errors)==0){
//test_array("woof");
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
				"staffID" => $this->post("staffID"),
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

		if ($values['repeat_mode']=="0"){
			$values['once_off_date'] = $values['data']['onceoff'];
			if ($values['once_off_date']==""){
				$values['once_off_date'] = date("Y-m-d");
			}
		}


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



		if (($this->errors && count($this->errors)==0) || ! $this->errors){
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
