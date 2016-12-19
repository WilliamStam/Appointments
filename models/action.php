<?php
namespace models;

use \timer as timer;

class action extends _ {

	private static $instance;

	function __construct() {
		parent::__construct();


	}

	public static function getInstance() {
		if (is_null(self::$instance)) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	function call($appointment, $action, $log,$do=true) {

		if (is_array($appointment) && isset($appointment['ID'])) {

		}
		else {
			$appointment = appointments::getInstance()->get($appointment, array("format" => TRUE, "client" => TRUE, "services" => TRUE));
		}

		if (isset($appointment['client']) && isset($appointment['client']['ID'])) {

		}
		else {
			$appointment["client"] = clients::getInstance()->get($appointment['clientID']);
		}



		$extra = array("appointment" => $appointment, "log" => $log);


		$log_label = "";
		$eventID = "";
		switch ($action) {
			case "edit":
				$log_label = "Record Edited";
				$eventID = "edi_1";
				break;
			case "edit-front":
				$log_label = "Record Edited - Front End";
				$eventID = "edi_2";
				break;
			case "added":
				$log_label = "Record Added";
				$eventID = "add_1";
				break;
			case "added-front":
				$log_label = "Record Added - Front End";
				$eventID = "add_2";
				break;
			default:
				$log_label = "showing only";
				$eventID = "showing";
				break;
		}
		$extra['log_label'] = $log_label;
		$extra['eventID'] = $eventID;


		if (count($log)&&$do){
			logs::getInstance()->_log($appointment['ID'], $log_label, $eventID, $log);
			notifications::getInstance()->notify($appointment,$eventID,$extra);
		}

		if ($do==false){
			$extra['log'] = logs::getInstance()->getAll("appointmentID='{$extra['appointment']['ID']}'");
			$extra['log'] =$extra['log'][0]['data'];
				test_array($extra);
		}






	}
	function show_data(){
		$data = appointments::getInstance()->getAll("","ID DESC","0,1",array("format" => TRUE, "client" => TRUE, "services" => TRUE));
		$data = $data[0];

		$this->call($data,"",array(),false);
	}


}
