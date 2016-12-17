<?php
namespace controllers\front;
use \timer as timer;
use \models as models;
class form extends _ {
	function __construct(){
		parent::__construct();
	}
	function page(){
		//if ($this->user['ID']=="")$this->f3->reroute("/login");
		
		
		$tmpl = new \template("template.twig","ui/front");
		$tmpl->page = array(
			"section"    => "form",
			"sub_section"=> "form",
			"template"   => "form",
			"meta"       => array(
				"title"=> "Booking Form",
			),
		);
		$tmpl->output();
	}
	
	
	
}
