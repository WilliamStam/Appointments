<?php

namespace controllers\front\save;
use \models as models;

class form extends _ {
	function __construct() {
		parent::__construct();
		$this->errors = array();
	}


	function form(){
		$return = array();
		$ID = isset($_GET['ID'])?$_GET['ID']:"";



		$values = $_POST['submit'];

		$services = array();
		$servie = explode(",",$values['services']);
		$values['servie'] = $values['services'];

		foreach ($servie as $item){
			$services['new-'.$item]=array(
				"serviceID"=>$item
			);
		}
		$values["services"] = $services;
		$values["from"] = "front";
		$values["companyID"] = isset($_POST['companyID'])?$_POST['companyID']:"";

		if ($values["companyID"]==""){
			$this->errors['company'] = "Company needed";
		}

		//$values['appointmentStart'] = "2017-02-14 09:00:00";




		$this->check_timeslots($values);



		//test_array(array($values,$this->errors));


		//$this->errors['error'] = true;

		if (count($this->errors)==0){

			$values['clientID'] = models\clients::_save($values['client']['ID'],$values['client']);
			unset($values['client']);
			$return['clientID'] = $values['clientID'];
			$return['appointmentID'] = models\appointments::_save($ID,$values);

			$_SESSION['data'] = json_encode(array());
		}

		//

		$return['errors'] = $this->errors;

		return $GLOBALS["output"]['data'] = $return;
	}

	function check_timeslots($data){


		$currrentDate = date("Y-m-d",strtotime($data['appointmentStart']));


		$timeslots = array();
		$agenda_items = models\appointments::getInstance()->getAll("DATE_FORMAT(appointmentStart,'%Y-%m-%d') = '{$currrentDate}' AND appointments.companyID ='{$data['companyID']}'","appointmentStart ASC","",array("format"=>true,"services"=>true));

		foreach ($agenda_items as $item){
			$timeslots[] = array(
				"s"=>date("H:i",strtotime($item['time']['start'])),
				"e"=>date("H:i",strtotime($item['time']['end']))
			);
		}
		$reserved_data = \models\timeslots::getInstance()->getAll("companyID = '{$data['companyID']}'");

		foreach ($reserved_data as $item){
			$include_item = false;
			switch ($item['repeat_mode']){
				case "0":
					$item['start_date'] = date("Y-m-d H:i:s",strtotime($item['data']['onceoff'] . " " . $item['start'].":00"));
					$item['end_date'] = date("Y-m-d H:i:s",strtotime($item['data']['onceoff'] . " " . $item['end'].":00"));

					if ($item['data']['onceoff'] == $currrentDate){
						$include_item = true;
					}
					break;
				case "1":
					$item['start_date'] = date("Y-m-d ".$item['start'].":00",strtotime($currrentDate));
					$item['end_date'] = date("Y-m-d ".$item['end'].":00",strtotime($currrentDate));
					$include_item = true;
					break;

				case "2":

					$dow_numeric = date('w',strtotime($currrentDate));

					$dayoftheweek = strtolower(date('l', strtotime("Sunday +{$dow_numeric} days")));
					$days = explode(",",$item['data']['weekly']);

					$item['start_date'] = date("Y-m-d ".$item['start'].":00",strtotime($currrentDate));
					$item['end_date'] = date("Y-m-d ".$item['end'].":00",strtotime($currrentDate));


					$item['dow'] = $dayoftheweek;
					if (count($days)){

						if (in_array($dayoftheweek,$days)){
							$include_item = true;
						}


					}




					break;

				case "3":
					$item['start_date'] = date("Y-m-d ".$item['start'].":00",strtotime($currrentDate));
					$item['end_date'] = date("Y-m-d ".$item['end'].":00",strtotime($currrentDate));
					$daytoday = date("d",strtotime($currrentDate));
					$days = explode(",",$item['data']['monthly']);
					if (count($days)){

						if (in_array($daytoday,$days)){
							$include_item = true;
						}


					}
					break;
			}

			if ($include_item){

				$timeslots[] = array(
					"s"=>date("H:i",strtotime($item['start_date'])),
					"e"=>date("H:i",strtotime($item['end_date']))
				);
			}
		}

		if ($data['servie']){
			$services = models\services::getInstance()->getAll("ID in ({$data['servie']})");

			$duration = 0;
			foreach ($services as $item){
				$duration = $duration + (int) $item['duration'];
			}

			$data['appointmentEnd'] = date("Y-m-d H:i:s",strtotime($data['appointmentStart']." + $duration minute"));
		}


		$timeok = true;



		$appS = strtotime($data['appointmentStart']);
		$appE = strtotime($data['appointmentEnd']);

		foreach ($timeslots as $item){
			$s = strtotime($currrentDate . " " . $item['s']);
			$e = strtotime($currrentDate . " " . $item['e']);




			if (($s < $appE) && ($e > $appS)){
				$timeok = false;
			}
			if (($appS <= $s) && ($appE>=$e)){
				$timeok = false;
			}

			//$timeok = date("Y-m-d H:i:s",strtotime($currrentDate . " " . $item['s']));



		}


		if (!$timeok){

			$this->errors['timeslot'] = "Timeslot already taken";


			$se = json_decode($_SESSION['data'],true);
			$se['appointmentDate_time'] = '';
			$_SESSION['data'] = json_encode($se);



		}








	//	test_array(array("d"=>$data,"services"=>$services,"duration"=>$duration, "ok"=>$timeok, "timeslots"=>$timeslots));

		return $data;


	}



}
