<?php
namespace controllers\admin;
use \timer as timer;
use \models as models;
class notification_templates extends _ {
	function __construct(){
		parent::__construct();
	}
	function page(){
		//if ($this->user['ID']=="")$this->f3->reroute("/login");


		//test_array($new);

		
		$tmpl = new \template("template.twig","ui/admin");
		$tmpl->page = array(
			"section"    => "settings",
			"sub_section"=> "notification_templates",
			"template"   => "notification_templates",
			"meta"       => array(
				"title"=> "Admin | Settings | Notification Templates",
			),
		);
		$tmpl->output();
	}
	
	
	
}
