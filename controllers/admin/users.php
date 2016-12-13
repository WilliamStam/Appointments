<?php
namespace controllers\admin;
use \timer as timer;
use \models as models;
class users extends _ {
	function __construct(){
		parent::__construct();
	}
	function page(){
		//if ($this->user['ID']=="")$this->f3->reroute("/login");
		
		
		$tmpl = new \template("template.twig","ui/admin");
		$tmpl->page = array(
			"section"    => "users",
			"sub_section"=> "users",
			"template"   => "users",
			"meta"       => array(
				"title"=> "Admin | Users",
			),
		);
		$tmpl->output();
	}
	
	
	
}
