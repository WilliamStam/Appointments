<?php

namespace controllers\admin\data;

use \models as models;

class services extends _ {
	function __construct() {
		parent::__construct();

	}


	function form() {
		$return = array();
		$ID = isset($_GET['ID']) ? $_GET['ID'] : "";


		$return = models\services::getInstance()->get($ID);


		return $GLOBALS["output"]['data'] = $return;
	}

	function _list() {
		$return = array();
		$ID = isset($_GET['ID']) ? $_GET['ID'] : "";
		$search = isset($_GET['search']) ? $_GET['search'] : "";

		$where = "";
		if ($search) {
			$where = "label LIKE '%{$search}%' OR category LIKE '%{$search}%'";
		}

		$return['search'] = $search;

		$records = models\services::getInstance()->getAll($where,"","",array("format"=>true,"group"=>"category"));




		$return['list'] = $records;
		$return['categories'] = models\services::getInstance()->getCategories();


		return $GLOBALS["output"]['data'] = $return;
	}


}
