<?php
namespace controllers\admin;
use \timer as timer;
use \models as models;
class test extends _ {
	function __construct(){
		parent::__construct();
	}
	function page(){
		//if ($this->user['ID']=="")$this->f3->reroute("/login");




		$services = array("35","36","8");
		$date = "2017-02-21";
		$companyID = "1";


		$selected_target = array();
		$selected_target[] = array(
			"serviceID"=>"35",
			"staffID"=>"1",
			"time"=>"15:45",
			"ID"=>""
		);
		$selected_target[] = array(
			"serviceID"=>"36",
			"staffID"=>"1",
			"time"=>"16:30",
			"ID"=>"5"
		);

		//$selected_target = array();

		$not_available = array();
		$not_available[] = array(
			"s"=>"12:45",
			"e"=>"13:00",
			"ID"=>"5",
			"staffID"=>"1",
			"serviceID"=>"35"
		);
		$not_available[] = array(
			"s"=>"10:00",
			"e"=>"10:15",
			"ID"=>"5",
			"staffID"=>"1",
			"serviceID"=>"35"
		);
		$not_available[] = array(
			"s"=>"11:15",
			"e"=>"11:30",
			"ID"=>"",
			"staffID"=>"1",
			"serviceID"=>"36"
		);
		$not_available[] = array(
			"s"=>"14:00",
			"e"=>"15:30",
			"ID"=>"",
			"staffID"=>"1",
			"serviceID"=>"36"
		);


		$not_available[] = array(
			"s"=>"10:15",
			"e"=>"10:45",
			"ID"=>"",
			"staffID"=>"2",
			"serviceID"=>"35"
		);
		$not_available[] = array(
			"s"=>"11:50",
			"e"=>"12:45",
			"ID"=>"",
			"staffID"=>"2",
			"serviceID"=>""
		);




		$data = models\available_timeslots::getInstance()->get($services,$date,$companyID);






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
		$tmpl->error = $data['error'];
		$tmpl->services = $data['services'];
		$tmpl->output();
	}
	
	
	
}
