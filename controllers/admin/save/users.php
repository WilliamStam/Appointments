<?php

namespace controllers\admin\save;
use \models as models;

class users extends _ {
	function __construct() {
		parent::__construct();
	}


	
	function form() {
		$result = array();
		$ID = isset($_REQUEST['ID'])?$_REQUEST['ID']:"";
		$values = array(
				"fullname" => $this->post("fullname",true),
				"username" => $this->post("username",true),
				"password" => $this->post("password"),
				"staffID" => $this->post("staffID"),
				"companyID" => $this->user['company']['ID'],

				
		);


		if ($ID=="" && $values['password']==""){
			$this->errors['password'] = "Password is required";
		}



		
		if (count($this->errors)==0){
			
			$ID = models\users::_save($ID,$values);
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
			
			$result = models\users::_delete($ID);
		}
		$return = array(
				"result" => $result,
				"errors" => $this->errors
		);
		
		return $GLOBALS["output"]['data'] = $return;
	}
	
	
	
	


}
