<?php

namespace controllers\admin\save;
use \models as models;

class staff extends _ {
	function __construct() {
		parent::__construct();
	}


	
	function form() {
		$result = array();
		$ID = isset($_REQUEST['ID'])?$_REQUEST['ID']:"";
		
		$values = array(
			"first_name" => $this->post("first_name",true),
			"last_name" => $this->post("last_name",true),
			"companyID" => $this->user['company']['ID'],
			"services" => (array) $this->post("services"),
			"badge_style" => $this->post("badge_style"),

		);
		$values['services'] = implode(",",$values['services']);


		//test_array($values);
		
		if (count($this->errors)==0){
			
			$ID = models\staff::_save($ID,$values);
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
			
			$result = models\staff::_delete($ID);
		}
		$return = array(
				"result" => $result,
				"errors" => $this->errors
		);
		
		return $GLOBALS["output"]['data'] = $return;
	}
	
	
	
	


}
