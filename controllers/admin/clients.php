<?php
namespace controllers\admin;
use \timer as timer;
use \models as models;
class clients extends _ {
	function __construct(){
		parent::__construct();
	}
	function page(){
		//if ($this->user['ID']=="")$this->f3->reroute("/login");
		
		
		$tmpl = new \template("template.twig","ui/admin");
		$tmpl->page = array(
			"section"    => "clients",
			"sub_section"=> "clients",
			"template"   => "clients",
			"meta"       => array(
				"title"=> "Admin | Clients",
			),
		);
		$tmpl->output();
	}
	
	
	
}
