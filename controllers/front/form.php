<?php
namespace controllers\front;
use \timer as timer;
use \models as models;
class form extends _ {
	function __construct(){
		parent::__construct();
		$this->version = $this->f3->get('_version');
		$this->sessionName = 'front-form-'.$this->version;
	}
	function page(){
		//if ($this->user['ID']=="")$this->f3->reroute("/login");

		$company = $this->f3->get("PARAMS['companyID']");
		$company = models\companies::getInstance()->get($company,array("format"=>true));

		if ($company['ID']==""){
			$this->f3->error("404");
		}

		$services = models\services::getInstance()->getAll("companyID = '{$company['ID']}' AND  (SELECT count(ID) FROM staff WHERE staff.companyID = services.companyID AND find_in_set(services.ID,staff.services))>0","category ASC, label ASC","", array("format" => true,"group"=>"category"));



		
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

		if (isset($_COOKIE[$this->sessionName])) {
			unset($_COOKIE[$this->sessionName]);
			setcookie($this->sessionName, NULL, -1, '/');
		}



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
