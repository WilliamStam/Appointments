<?php
namespace controllers\admin;
use \timer as timer;
use \models as models;
class notifications extends _ {
	function __construct(){
		parent::__construct();
	}
	function page(){
		//if ($this->user['ID']=="")$this->f3->reroute("/login");
		
		
		$tmpl = new \template("template.twig","ui/admin");
		$tmpl->page = array(
			"section"    => "settings",
			"sub_section"=> "notifications",
			"template"   => "notifications",
			"meta"       => array(
				"title"=> "Admin | Settings | Notifications",
			),
		);
		$tmpl->output();
	}
	
	
	
}
