<?php
namespace controllers\admin;
use \timer as timer;
use \models as models;
class login extends _ {
	function __construct(){
		parent::__construct();
	}
	function page(){
		//if ($this->user['ID']=="")$this->f3->reroute("/login");
		
		
		
		$tmpl = new \template("template.twig");
		$tmpl->page = array(
				"section"    => "login",
				"sub_section"=> "login",
				"template"   => "login",
				"meta"       => array(
						"title"=> "Elections 2016 | Admin Login",
				),
		);
		$tmpl->msg = isset($_GET['msg'])?$_GET['msg']:"";
		$tmpl->output();
	}
	function login(){
		$username = isset($_REQUEST['login_email']) ? $_REQUEST['login_email'] : "";
		$password = isset($_REQUEST['login_password']) ? $_REQUEST['login_password'] : "";
		
		
		$userO = new \models\user();
		$uID = $userO->login($username, $password);
		
		$user = $userO->get($uID);
		
		
		
		//test_array($user); 
		if ($user['ID']){
			$this->f3->reroute("/admin");
		} else {
			$this->f3->reroute("/login?msg=Login+Failed");
		}
		
		
		
		return "Login Failed";
	}
}
