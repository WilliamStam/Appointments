<?php

namespace controllers\admin\data;

use \models as models;

class products extends _ {
	function __construct() {
		parent::__construct();

	}


	function form() {
		$return = array();
		$ID = isset($_GET['ID']) ? $_GET['ID'] : "";


		$return = models\products::getInstance()->get($ID);


		return $GLOBALS["output"]['data'] = $return;
	}

	function _list() {
		$return = array();
		$ID = isset($_GET['ID']) ? $_GET['ID'] : "";
		$search = isset($_GET['search']) ? $_GET['search'] : "";

		$where = "companyID = '{$this->user['company']['ID']}'";
		if ($search) {
			$where = "AND label LIKE '%{$search}%'";
		}

		$return['search'] = $search;

		$return['list'] = models\products::getInstance()->getAll($where);


		return $GLOBALS["output"]['data'] = $return;
	}


}
