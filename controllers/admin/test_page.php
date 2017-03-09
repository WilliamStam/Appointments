<?php
namespace controllers\admin;
use \timer as timer;
use \models as models;
class test_page extends _ {
	function __construct(){
		parent::__construct();
	}
	function page(){
		//if ($this->user['ID']=="")$this->f3->reroute("/login");
		$services = array();
		$day = "2017-03-07";
		$services_ = models\services::getInstance()->getAll("ID in (35,37)","","",array("staff"=>true));
		foreach ($services_ as $service){

			$selected_date = $day;
			if ($service['ID']=='35'){
				$service['staffID'] = "1";
				$selected_date = $selected_date." 09:15:00";
			}
			if ($service['ID']=='37'){
				//$service['staffID'] = "2";
				//$selected_date = $selected_date." 13:15:00";

			}

			$service['appointmentStart'] = $selected_date;
			$services[] = $service;
		}




		//test_array($services);




		$not_available = array();

		$appointments = models\appointments::getInstance()->getAll("appointments.companyID = '1' AND DATE_FORMAT(appser.appointmentStart,'%Y-%m-%d') BETWEEN '{$day}' AND '{$day}'","","",array("services"=>true));
		foreach($appointments as $appointment){
			foreach($appointment['services'] as $app_service){
				$not_available[] = array(
					"s"=>strtotime($app_service['appointmentStart']),
					"e"=>strtotime("+{$app_service['duration']} minute",strtotime($app_service['appointmentStart'])),
					"ID"=>"a-".$appointment['ID'],
					"staffID"=>$app_service['staffID'],

				);
			}
		}
		//test_array($appointments);




		$data = models\available_timeslots::getInstance()->timeslots(1,$services);








		if (isset($_GET['w'])) {
			test_array($data);

		}
		
		$tmpl = new \template("template.twig","ui/admin");
		$tmpl->page = array(
			"section"    => "test",
			"sub_section"=> "test",
			"template"   => "test",
			"meta"       => array(
				"title"=> "Admin | Dashboard",
			),
			"js"=>array("/ui/_plugins/fullcalendar/fullcalendar.min.js"),
			"css"=>array("/ui/_plugins/fullcalendar/fullcalendar.min.css"),
		);
		$tmpl->appointments = $appointments;
		$tmpl->services = $data;
		$tmpl->output();
	}
	
	
	
}
