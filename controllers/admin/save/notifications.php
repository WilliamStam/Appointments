<?php

namespace controllers\admin\save;
use \models as models;

class notifications extends _ {
	function __construct() {
		parent::__construct();
	}


	
	function form() {
		$result = array();

		$values = array();

		$exclude = array("submit","smsportal_password");
		$notifications = models\notifications::getInstance()->defaultNotifications();

		foreach ($notifications['events'] as $eventID=>$events){
			foreach ($notifications['notifications'] as $notiID=>$itemN){
				$values[$notiID."|".$eventID]=0;
			}
		}




		foreach ($_POST as $key=>$value){
			if (!in_array($key,$exclude)){
				$values[$key] = $value;
			}

		}

		if (isset($_POST['smsportal_password'])&&$_POST['smsportal_password']!=""){
			$values["smsportal_password"] = $_POST['smsportal_password'];
		}






//test_array($values);


		$response = "";
		if (count($this->errors)==0){
			//test_array($values);
			$response = models\settings::_save($values);
		}
		$return = array(
				"ID" => $response,
				"errors" => $this->errors
		);
		
		return $GLOBALS["output"]['data'] = $return;
	}
	
	
	function delete() {
		$result = array();
		$ID = isset($_REQUEST['ID'])?$_REQUEST['ID']:"";
		
		
		
		if (count($this->errors)==0){
			
			$result = models\settings::_delete($ID);
		}
		$return = array(
				"result" => $result,
				"errors" => $this->errors
		);
		
		return $GLOBALS["output"]['data'] = $return;
	}
	
	
	
	


}
