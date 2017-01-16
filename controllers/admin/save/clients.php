<?php

namespace controllers\admin\save;
use \models as models;

class clients extends _ {
	function __construct() {
		parent::__construct();
	}


	
	function form() {
		$result = array();
		$ID = isset($_REQUEST['ID'])?$_REQUEST['ID']:"";
		
		$values = array(
				"first_name" => $this->post("first_name",true),
				"last_name" => $this->post("last_name"),
				"mobile_number" => $this->post("mobile_number",true),
				"mobile_number_notification" => $this->post("mobile_number_notification"),
				"email" => $this->post("email"),
				"email_notification" => $this->post("email_notification"),
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
	
	
	function delete() {
		$result = array();
		$ID = isset($_REQUEST['ID'])?$_REQUEST['ID']:"";
		
		
		
		if (count($this->errors)==0){
			
			$result = models\clients::_delete($ID);
		}
		$return = array(
				"result" => $result,
				"errors" => $this->errors
		);
		
		return $GLOBALS["output"]['data'] = $return;
	}
	
	
	
	


}
