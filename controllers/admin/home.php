<?php
namespace controllers\admin;
use \timer as timer;
use \models as models;
class home extends _ {
	function __construct(){
		parent::__construct();
	}
	function page(){
		//if ($this->user['ID']=="")$this->f3->reroute("/login");
		
		
		$tmpl = new \template("template.twig","ui/admin");
		$tmpl->page = array(
			"section"    => "home",
			"sub_section"=> "home",
			"template"   => "home",
			"meta"       => array(
				"title"=> "Admin | Dashboard",
			),
			"js"=>array("/ui/_plugins/fullcalendar/fullcalendar.min.js"),
			"css"=>array("/ui/_plugins/fullcalendar/fullcalendar.min.css"),
		);
		$tmpl->output();
	}
	
	
	
}
