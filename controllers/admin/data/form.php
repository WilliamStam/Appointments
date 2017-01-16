<?php

namespace controllers\admin\data;

use \models as models;

class form extends _ {
	function __construct() {
		parent::__construct();

	}


	function appointment() {
		$return = array();
		$ID = isset($_GET['ID']) ? $_GET['ID'] : "";

		$return['details'] = models\appointments::getInstance()->get($ID, array("format" => false,"services"=>true));













		return $GLOBALS["output"]['data'] = $return;
	}
	function clients() {
		$return = array();
		$ID = isset($_GET['ID']) ? $_GET['ID'] : "";
		$search = isset($_GET['search']) ? $_GET['search'] : "";

		if ($ID == "walkin"||$ID==="0"){
			$return['details'] = array(
				"ID"=>"walkin",
				"first_name"=>"Walk-In",
				"last_name"=>"Client"
			);

		} else {
			$return['details'] = models\clients::getInstance()->get($ID, array("format" => false));
		}


		$return['list'] = array();
		$where = "companyID = '{$this->user['company']['ID']}'";

		if ($search){
			$where = $where . " AND (first_name LIKE '%$search%' OR last_name LIKE '%$search%' OR mobile_number LIKE '%$search%' OR email LIKE '%$search%' )";
		}
		$return['list'] = models\clients::getInstance()->getAll($where, "first_name ASC","", array("format" => true));





		return $GLOBALS["output"]['data'] = $return;
	}




}
