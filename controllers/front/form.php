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

		$company = $this->f3->get("PARAMS['companyID']");
		$company = models\companies::getInstance()->get($company,array("format"=>true));

		if ($company['ID']==""){
			$this->f3->error("404");
		}

		$services = models\services::getInstance()->getAll("companyID = '{$company['ID']}'","category ASC, label ASC","", array("format" => true,"group"=>"category"));
		
		$tmpl = new \template("template.twig","ui/front");
		$tmpl->page = array(
			"section"    => "form",
			"sub_section"=> "form",
			"template"   => "form",
			"meta"       => array(
				"title"=> "Booking Form",
			),
		);
		$tmpl->company = $company;
		$tmpl->staff = models\staff::getInstance()->getAll("companyID = '{$company['ID']}'","","", array("format" => true));
		$tmpl->settings = $company['settings'];
		$tmpl->services = $services;
		$tmpl->output();
	}
	function complete(){
		$company = $this->f3->get("PARAMS['companyID']");

		session_destroy();
		unset($_COOKIE['PHPSESSID']);
		setcookie('PHPSESSID', null, -1, '/');



		//test_array($_SESSION);

		$tmpl = new \template("template.twig","ui/front");
		$tmpl->page = array(
			"section"    => "form",
			"sub_section"=> "complete",
			"template"   => "form_complete",
			"meta"       => array(
				"title"=> "Booking Form - Complete",
			),
		);
		$tmpl->company = $company;
		$tmpl->output();
	}
	
	
	
}
