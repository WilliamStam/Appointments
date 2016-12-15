<?php
namespace controllers\front;
use \timer as timer;
use \models as models;
class login extends _ {
	function __construct(){
		parent::__construct();
	}
	function page(){
		//if ($this->user['ID']=="")$this->f3->reroute("/login");
		$username = isset($_REQUEST['login_username']) ? $_REQUEST['login_username'] : "";
		$password = isset($_REQUEST['login_password']) ? $_REQUEST['login_password'] : "";
		$response = array();
		if ($username && $password) {
			$response = $this->login();
		}
		
		
		$tmpl = new \template("template.twig","ui/front");
		$tmpl->page = array(
				"section"    => "login",
				"sub_section"=> "login",
				"template"   => "login",
				"meta"       => array(
						"title"=> "Admin Login",
				),
		);
		$tmpl->username = $username;
		$tmpl->response = $response;
		$tmpl->output();
	}
	function login(){
		$username = isset($_REQUEST['login_username']) ? $_REQUEST['login_username'] : "";
		$password = isset($_REQUEST['login_password']) ? $_REQUEST['login_password'] : "";
		
		
		$userO = new \models\users();
		$uID = $userO->login($username, $password);
		
		$user = $userO->get($uID);
		
		
		
		//test_array($user); 
		if ($user['ID']){
			$this->f3->reroute("/admin");
		} else {
			return array(
				"failed"=>true,
				"msg"=>"Login Failed"
			);
		}
		
		
		
	}
}
