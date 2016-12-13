<?php
namespace controllers\admin;
use \timer as timer;
use \models as models;
class products extends _ {
	function __construct(){
		parent::__construct();
	}
	function page(){
		//if ($this->user['ID']=="")$this->f3->reroute("/login");
		
		
		$tmpl = new \template("template.twig","ui/admin");
		$tmpl->page = array(
			"section"    => "products",
			"sub_section"=> "products",
			"template"   => "products",
			"meta"       => array(
				"title"=> "Admin | Products",
			),
		);
		$tmpl->output();
	}
	
	
	
}
