<?php

namespace controllers\admin\data;

use \models as models;

class form extends _ {
	function __construct() {
		parent::__construct();

	}


	function appointment() {
		$return = array();
		$ID = isset($_GET['ID']) ? $_GET['ID'] : "";
		$company = $this->user['company'];

		$return['details'] = models\appointments::getInstance()->get($ID, array("format" => FALSE, "services" => TRUE));
		if ($return['details']['appointmentStart']==""){
			$return['details']['appointmentStart'] = date("Y-m-d");
		}
		$return['details']['appointmentDate'] = date("Y-m-d", strtotime($return['details']['appointmentStart']));


		$return['services'] = $this->appointment_services($return['details']);

		unset($return['details']['services']);

		$return['time_interval'] = $company['settings']['timeslots'];


		//test_array(	$return['services'] );

		return $GLOBALS["output"]['data'] = $return;
	}

	function appointment_services_c() {
		test_array($_POST);
	}

	function appointment_services($record = FALSE) {
		$return = array();
		$company = $this->user['company'];
		$ID = isset($_GET['ID']) ? $_GET['ID'] : "";

	//	test_array($_POST);
		/*

			$_POST = array(
				"clientID"=>"74",
				"appointmentDate"=>"2017-02-14",
				"service"=>array(
					"5-261"=>array(
						"ID"=>5,
						"time"=>"09:00"
					),
					"39-262"=>array(
						"ID"=>39,
						"time"=>"09:40"
					),
					"47-263"=>array(
						"ID"=>47,
						"time"=>"09:55"
					),
					"new-3"=>array(
						"ID"=>39,
						"time"=>""
					)
				),
				"appointmentDate_time"=>array(
					"5-5-261"=>array(
						"time"=>"11:00"
					),
		,
				"notes"=>""
			);

			*/


		if ($record) {
			$appointmentDate = date("Y-m-d", strtotime($record['appointmentStart']));
			$services = $record['services'];
			$ID = $record['ID'];
			$details = $record;
		} else {
			$ser = isset($_POST['service'])?$_POST['service']:array();
			$serviceIDs = array();
			foreach ($ser as $item){
				if ($item['ID'])$serviceIDs[] = $item['ID'];
			}
			$services = array();
			if (count($serviceIDs)){
				$serviceIDs = implode(",",$serviceIDs);
				$services_ = models\services::getInstance()->getAll("ID in ($serviceIDs)");
				$services__ = array();
				foreach ($services_ as $item){
					$services_[$item['ID']] = $item;
				}

				$services = array();
				foreach ((array)$ser as $item){
					if ($item['ID']){
						$appointmentStart = $_POST['appointmentDate']." " .$item['time'].":00";

						if (strlen($appointmentStart)>15){
							if (date("Y-m-d H:i:s",strtotime($appointmentStart))!=$appointmentStart){

								$appointmentStart = "";
							}

						} else {
							$appointmentStart = "";
						}

						//test_array($appointmentStart);

						$i = $services_[$item['ID']];
						$i['appointmentStart'] = $appointmentStart;
						$i['staffID'] = $item['staffID'];
						$i['recordID'] = $item['recordID'];

						$services[] = $i;
					}

				}
			}

			$details = models\appointments::getInstance()->get($ID, array("format" => FALSE));


		}
		$services = models\services::format((array)$services, array("staff" => TRUE));
		$return_ = models\available_timeslots::getInstance()->timeslots($company['ID'], $services, FALSE, $ID);
		//test_array($return_);




		$return = array();
		$key_ = array();
		foreach ((array)$return_ as $item) {
			if (!isset($key_[$item['ID']])) {
				$key_[$item['ID']] = 0;
			}
			$key = "new-" . $item['ID']. "-".$key_[$item['ID']];
			if (isset($item['recordID']) && $item['recordID']) {
				$key = "edit-".$item['recordID'];
			}

			$item['key'] = $key;


			if (count($item['slots']['clashing'])) {
				$appointments = array();
				$timeslots = array();
				//test_array($item['slots']['clashing']);
				foreach ((array)$item['slots']['clashing'] as $clash_item) {
					if (substr($clash_item, 0, 2) == "a-") {
						$appointments[] = str_replace("a-", "", $clash_item);
					}
					if (substr($clash_item, 0, 2) == "t-") {
						$timeslots[] = str_replace("t-", "", $clash_item);
					}
				}

				if (count($appointments)) {
					$appointments = implode(",", $appointments);

					$item['clashing']['appointments'] = models\appointments::getInstance()->getAll("appointments.ID IN ($appointments)", "", "", array("client" => TRUE));
				}




			}

			$item['times'] = array(
				"day" => date("Y-m-d",strtotime("now")),
				"time" => ""
			);


			$appointmentStart = $item['appointmentStart'];
			if (strlen($appointmentStart)>15) {
				if (date("Y-m-d H:i:s", strtotime($appointmentStart)) == $appointmentStart) {
					$item['times'] = array(
						"day" => date("Y-m-d", strtotime($appointmentStart)),
						"time" => date("H:i", strtotime($appointmentStart))
					);
				}
			}

			//$key = $item['ID'];



			$key_[$item['ID']] = $key_[$item['ID']] + 1;


			$return[] = $item;
		}

		//test_array($return);
		if (!$record){
			$return = array(
				"details"=>$details,
				"services"=>$return,
				"time_interval"=> $company['settings']['timeslots']
			);
		}

//test_array($return);


//	$return['times'] = models\available_timeslots::getInstance()->get($services,$return['post']['appointmentDate_day'],$company['ID'],$selected_target);

		return $GLOBALS["output"]['data'] = $return;
	}


	function timeslot() {
		$return = array();
		$ID = isset($_GET['ID']) ? $_GET['ID'] : "";

		$return['details'] = models\timeslots::getInstance()->get($ID, array("format" => FALSE));


		if (isset($return['details']['data'])) {
			$return['details']['data'] = (array)json_decode($return['details']['data'], TRUE);
		}


		return $GLOBALS["output"]['data'] = $return;
	}

	function clients() {
		$return = array();
		$ID = isset($_GET['ID']) ? $_GET['ID'] : "";
		$search = isset($_GET['search']) ? $_GET['search'] : "";

		if ($ID == "walkin" || $ID === "0") {
			$return['details'] = array("ID" => "walkin", "first_name" => "Walk-In", "last_name" => "Client");

		}
		else {
			$return['details'] = models\clients::getInstance()->get($ID, array("format" => FALSE));
		}


		$return['list'] = array();
		$where = "companyID = '{$this->user['company']['ID']}'";

		if ($search) {
			$where = $where . " AND (first_name LIKE '%$search%' OR last_name LIKE '%$search%' OR mobile_number LIKE '%$search%' OR email LIKE '%$search%' )";
		}
		$return['list'] = models\clients::getInstance()->getAll($where, "first_name ASC", "", array("format" => TRUE));


		return $GLOBALS["output"]['data'] = $return;
	}


}
