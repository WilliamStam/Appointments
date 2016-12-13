<?php

namespace controllers\admin\save;
use \models as models;

class settings_open extends _ {
	function __construct() {
		parent::__construct();
	}


	
	function form() {
		$result = array();
		$ID = isset($_REQUEST['ID'])?$_REQUEST['ID']:"";
		
		$values = array(
				"label" => $this->post("label",true),
				
				
		);
	
		
		if (count($this->errors)==0){
			
			$ID = models\products::_save($ID,$values);
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
			
			$result = models\products::_delete($ID);
		}
		$return = array(
				"result" => $result,
				"errors" => $this->errors
		);
		
		return $GLOBALS["output"]['data'] = $return;
	}
	
	
	
	


}
