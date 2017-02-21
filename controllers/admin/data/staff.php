<?php

namespace controllers\admin\data;

use \models as models;

class staff extends _ {
	function __construct() {
		parent::__construct();

	}


	function form() {
		$return = array();
		$ID = isset($_GET['ID']) ? $_GET['ID'] : "";


		$return = models\staff::getInstance()->get($ID);
		if (isset($return['badge_style'])) {
			$return['badge_style'] = json_decode($return['badge_style'],true);
		} else {
			$return['badge_style'] = array();
		}

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

		$return['list'] = models\staff::getInstance()->getAll($where);


		return $GLOBALS["output"]['data'] = $return;
	}


}
