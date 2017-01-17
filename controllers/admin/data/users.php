<?php

namespace controllers\admin\data;

use \models as models;

class users extends _ {
	function __construct() {
		parent::__construct();

	}


	function form() {
		$return = array();
		$ID = isset($_GET['ID']) ? $_GET['ID'] : "";


		$return = models\users::getInstance()->get($ID);
		unset($return['password']);


		return $GLOBALS["output"]['data'] = $return;
	}

	function _list() {
		$return = array();
		$ID = isset($_GET['ID']) ? $_GET['ID'] : "";
		$search = isset($_GET['search']) ? $_GET['search'] : "";

		$where = "companyID = '{$this->user['company']['ID']}'";
		if ($search) {
			$where = " AND label LIKE '%{$search}%'";
		}

		$return['search'] = $search;

		$return['list'] = models\users::getInstance()->getAll($where,"fullname ASC","",array("format"=>true));


		return $GLOBALS["output"]['data'] = $return;
	}


}
