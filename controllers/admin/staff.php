<?php
namespace controllers\admin;
use \timer as timer;
use \models as models;
class staff extends _ {
	function __construct(){
		parent::__construct();
	}
	function page(){
		//if ($this->user['ID']=="")$this->f3->reroute("/login");
		
		
		$tmpl = new \template("template.twig","ui/admin");
		$tmpl->page = array(
			"section"    => "staff",
			"sub_section"=> "staff",
			"template"   => "staff",
			"meta"       => array(
				"title"=> "Admin | Staff",
			),
		);
		$tmpl->output();
	}
	
	
	
}
