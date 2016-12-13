<?php
namespace controllers\admin;
use \timer as timer;
use \models as models;
class services extends _ {
	function __construct(){
		parent::__construct();
	}
	function page(){
		//if ($this->user['ID']=="")$this->f3->reroute("/login");
		
		
		$tmpl = new \template("template.twig","ui/admin");
		$tmpl->page = array(
			"section"    => "services",
			"sub_section"=> "services",
			"template"   => "services",
			"meta"       => array(
				"title"=> "Admin | Services",
			),
		);
		$tmpl->output();
	}
	
	
	
}
