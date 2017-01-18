<?php

namespace controllers\admin\data;

use \models as models;

class clients extends _ {
	function __construct() {
		parent::__construct();

	}


	function form() {
		$return = array();
		$ID = isset($_GET['ID']) ? $_GET['ID'] : "";


		$return['details'] = models\clients::getInstance()->get($ID);


		return $GLOBALS["output"]['data'] = $return;
	}

	function _list() {
		$return = array();
		$ID = isset($_GET['ID']) ? $_GET['ID'] : "";
		$search = isset($_GET['search']) ? $_GET['search'] : "";

		$where = "companyID = '{$this->user['company']['ID']}'";
		if ($search) {
			$where .= " AND (first_name LIKE '%{$search}%' OR last_name LIKE '%{$search}%' OR notes LIKE '%{$search}%' OR mobile_number LIKE '%{$search}%' OR 	email LIKE '%{$search}%')";
		}

		$return['search'] = $search;

		$return['list'] = models\clients::getInstance()->getAll($where,"first_name ASC");


		return $GLOBALS["output"]['data'] = $return;
	}


}
