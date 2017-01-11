<?php

namespace controllers\admin\data;

use \models as models;
use \models\users as user;

class home extends _ {
	function __construct() {
		parent::__construct();

		$this->options = $_GET;

		$return = array();

		$currrentDate = date("Ymd", strtotime("today"));

		$agenda_items = models\appointments::getInstance()->getAll("DATE_FORMAT(appointmentStart,'%Y%m%d') = '{$currrentDate}'", "appointmentStart ASC", "", array("format" => TRUE, "client" => TRUE, "services" => TRUE));
		$n = array();
		$return["stats"] = array("count" => count($agenda_items), "duration" => 0);
		$active = array();
		foreach ($agenda_items as $item) {
			//test_array($item);
			$return["stats"]['duration'] = $return["stats"]['duration'] + $item['duration'];
			if ($item['active'] == 1) {
				$item['status'] = "current";
				$active = $item;
			}
			$n[] = $item;
		}
		$agenda_items = $n;

		$return['agenda'] = models\appointments::getInstance()->agenda_view($agenda_items, date("Y-m-d", strtotime("today")));

		//	if (isset($_GET['debug'])) test_array($return);

		$return["stats"]['duration_view'] = seconds_to_time($return["stats"]['duration'] * 60, TRUE);


		if ($active['ID']) {
			if (isset($active['services'])) {
				$active['services_count'] = count($active['services']);
				$active['services'] = models\services::getInstance()->format($active['services'], array("group" => "category"));
			}


			$active['time']['startsin'] = seconds_to_time(strtotime($active['appointmentStart']) - strtotime("now"), TRUE);
		}


		$return['active'] = $active;


		$return["next"] = models\appointments::getInstance()->getAll("appointmentStart > now()", "appointmentStart ASC", "0,1", array("format" => TRUE, "client" => TRUE, "services" => TRUE));


		if (isset($return["next"][0])) {
			$return["next"] = $return["next"][0];
			$return["next"]['services_count'] = count($return["next"]['services']);
			$return['next']['services'] = models\services::getInstance()->format($return['next']['services'], array("group" => "category"));

			if (date("Y-m-d H:i:s", strtotime("+1 hour")) > date("Y-m-d H:i:s", strtotime($return["next"]['appointmentStart']))) {
				$return["next"]['status'] = "shortly";
			}

			$return["next"]['time']['startsin'] = seconds_to_time(strtotime($return["next"]['appointmentStart']) - strtotime("now"), TRUE);


		}

		//test_array($return["next"]);

		$this->head = $return;
	}

	function appointment() {
		$return = array();

		$ID = isset($_GET['ID']) ? $_GET['ID'] : "";

		$return = models\appointments::getInstance()->get($ID, array("format" => TRUE, "services" => TRUE, "client" => TRUE));
		$return['status'] = "current";

		$currrentDate = date("Ymd", strtotime($return['appointmentStart']));

		$agenda_items = models\appointments::getInstance()->getAll("DATE_FORMAT(appointmentStart,'%Y%m%d') = '{$currrentDate}'", "appointmentStart ASC", "", array("format" => TRUE, "client" => TRUE, "services" => TRUE));


		//	test_array($agenda_items);


		$return['services'] = models\services::getInstance()->format($return['services'], array("group" => "category"));


		if (isset($return['time']['start'])) {

			$return['label']['main'] = date("H:i", strtotime($return['time']['start']));
			$return['label']['small'] = date("D, d M Y", strtotime($return['time']['start']));
			$return['label']['today'] = date("Ymd", strtotime($return['time']['start'])) == date("Ymd", strtotime("now")) ? 1 : 0;

			$return['time']['start_view'] = date("H:i", strtotime($return['time']['start']));
			$return['time']['end_view'] = date("H:i", strtotime($return['time']['end']));
		}

		if ($return['clientID'] == 0) {
			$return['client'] = array("first_name" => "Walk-In");

		}


		$logs = models\logs::getInstance()->getAll("appointmentID='{$return['ID']}'", "datein DESC", "", array("format" => TRUE));
		$notifications = models\notifications::getInstance()->getAll("appointmentID='{$return['ID']}'", "datein DESC", "", array("format" => TRUE));

		$events = array("add_1" => "", "add_2" => " - Front End", "edi_1" => "", "edi_2" => " - Front End",);


		$log_array = array();

		foreach ($logs as $item) {
			$records = array();
			foreach ($item['data'] as $v) {
				$val = "";
				if ($v['o']) {
					$val = "[" . $v['o'] . "] => [" . $v['n'] . "]";
				}
				else {
					$val = $v['n'];
				}
				if ($v['l']) {
					$val = $v['l'];
				}
				$records[] = array("label" => $v['k'], "value" => $val);
			}


			$log_array[] = array("type" => "log", "datein" => $item['datein'], "sort" => date("YmdHis", strtotime($item['datein'])) . "1", "label" => isset($events[$item['eventID']]) ? $item['label'] . $events[$item['eventID']] : $item['label'], "records" => $records);

		}

		foreach ($notifications as $item) {
			$records = array();
			if ($item['subject']) {
				$records[] = array("label" => "Subject", "value" => nl2br($item['subject']));
			}
			if ($item['body']) {
				$records[] = array("label" => "Body", "value" => nl2br($item['body']));
			}


			$log_array[] = array("type" => "notification", "datein" => $item['datein'], "sort" => date("YmdHis", strtotime($item['datein'])) . "2", "label" => $item['log_label'] . " (" . $item['label'] . ")", "status" => $item['status'], "records" => $records);

		}


		usort($log_array, function ($a, $b) {
			return $a['sort'] - $b['sort'];
		});


		//	test_array($notifications);
		//test_array($logs);

		$return['logs'] = $log_array;


		$return['agenda'] = models\appointments::getInstance()->agenda_view($agenda_items);


		return $GLOBALS["output"]['data'] = $return;
	}


	function data() {
		$return = array();
		$return['options'] = $this->options;

		$defaultSection = user::settings("home_list_section") ? user::settings("home_list_section") : "list";
		$section = isset($_GET['section']) ? $_GET['section'] : $defaultSection;

		switch ($section) {
			case "list":
				$allowedViews = array("day", "week", "month");
				$section_viewDefault = "day";
				break;
			case "day":
				$allowedViews = array("day");
				$section_viewDefault = "day";
				break;
			case "calendar":
				$allowedViews = array("month");
				$section_viewDefault = "month";
				break;
			default:
				$allowedViews = array("day");
				$section_viewDefault = "day";
				break;

		}

		$section_view = isset($_GET['list_view']) ? $_GET['list_view'] : $section_viewDefault;

		if (!in_array($section_view, $allowedViews)) {
			$section_view = $section_viewDefault;
		}


		user::settings("home_list_section", $section);
		user::settings("home_list_view", $section_view);

		$day_value = isset($_GET['day_value']) ? $_GET['day_value'] : user::settings("home_list_day_value");
		$week_value = isset($_GET['week_value']) ? $_GET['week_value'] : user::settings("home_list_week_value");
		$month_value = isset($_GET['month_value']) ? $_GET['month_value'] : user::settings("home_list_month_value");


		user::settings("home_list_day_value", $day_value);
		user::settings("home_list_week_value", $week_value);
		user::settings("home_list_month_value", $month_value);


		if ($day_value == "") {
			$day_value = date("Y-m-d", strtotime("now"));
		}

		if ($week_value == "") {
			$week_value = date("W-Y");
		}
		if ($month_value == "") {
			$month_value = date("m-Y");
		}


		//test_array($array)


		$search = isset($_GET['search']) ? $_GET['search'] : "";


		$next = "";
		$prev = "";
		$label = "";
		$current = "";
		$where = "1";

		if ($search) {

			$fields = array("clients.first_name", "clients.last_name", "clients.mobile_number", "clients.email", "clients.notes", "services.label", "services.category", "appointments.notes", "appointments.appointmentStart",

			);

			$fields_str = implode(" LIKE '%$search%' OR ", $fields) . " LIKE '%$search%'";

			$where .= " AND ($fields_str) ";
		}

		//test_array($where);

		$list_value = "";

		switch ($section_view) {
			case "day":

				$list_value = $day_value ? $day_value : date("Y-m-d", strtotime("now"));

				$next = date("Y-m-d", strtotime("+1 day", strtotime($list_value)));
				$prev = date("Y-m-d", strtotime("-1 day", strtotime($list_value)));
				$current = date("Y-m-d", strtotime("now"));

				$label = date("D, d M Y", strtotime($list_value));
				$currrentDate = date("Y-m-d", strtotime($list_value));

				$where .= " AND (DATE_FORMAT(appointmentStart,'%Y-%m-%d') = '{$currrentDate}')";

				break;

			case "week":


				$list_value = $week_value ? $week_value : date("W-Y");
				$val_parts = explode("-", $list_value);


				$week_start = date("Y-m-d", strtotime($val_parts[1] . 'W' . str_pad($val_parts[0], 2, 0, STR_PAD_LEFT)));
				$week_end = date("Y-m-d", strtotime($val_parts[1] . 'W' . str_pad($val_parts[0], 2, 0, STR_PAD_LEFT) . ' +6 days'));


				//test_array(array($week_start,$week_end));


				$next = date("W-Y", strtotime("+1 week", strtotime($week_start)));
				$prev = date("W-Y", strtotime("-1 week", strtotime($week_start)));
				$current = date("W-Y", strtotime("now"));


				$label = date("d M", strtotime($week_start)) . " - " . date("d M", strtotime($week_end)) . " (Week " . date("W", strtotime($week_start)) . ")";

				$where .= " AND ((DATE_FORMAT(appointmentStart,'%Y-%m-%d') >= '{$week_start}' AND DATE_FORMAT(appointmentStart,'%Y-%m-%d') <= '{$week_end}'))";

				break;


			case "month":


				$list_value = $month_value ? $month_value : date("m-Y");
				$val_parts = explode("-", $list_value);


				$month_start = date("Y-m-d", strtotime($val_parts[1] . "-" . $val_parts[0] . "-01"));
				$month_end = date("Y-m-d", strtotime($val_parts[1] . "-" . $val_parts[0] . "-" . date('t', strtotime($month_start))));

				$label = date("F Y", strtotime($month_start));


				//test_array(array($month_start,$list_value,$month_end,$label));


				$next = date("m-Y", strtotime("+1 month", strtotime($month_start)));
				$prev = date("m-Y", strtotime("-1 month", strtotime($month_start)));
				$current = date("m-Y", strtotime("now"));


				$where .= " AND ((DATE_FORMAT(appointmentStart,'%Y-%m-%d') >= '{$month_start}' AND DATE_FORMAT(appointmentStart,'%Y-%m-%d') <= '{$month_end}'))";

				break;


		}


		$return['settings'] = array("section" => $section, "search" => $search, "day_value" => $day_value, "week_value" => $week_value, "month_value" => $month_value, "list_view" => $section_view, "label" => $label, "nav" => array("current" => $list_value, "now" => $current, "next" => $next, "prev" => $prev,)

		);


		$records = models\appointments::getInstance()->getAll($where, "appointmentStart", "", array("services" => TRUE, "client" => TRUE));


		$return = $this->view($return, $records, $section);


		//test_array($list);


		$return['head'] = $this->head;

		return $GLOBALS["output"]['data'] = $return;
	}

	function view($return, $records, $section) {
		switch ($section) {
			case "list":
				return $this->list_view($return, $records);
				break;
			case "day":
				return $this->day_view($return, $records);
				break;
			case "calendar":
				return $this->calendar_view($return, $records);
				break;
		}

		return $this->list_view($return, $records);

	}

	function list_view($return, $records) {
		$list = array();
		foreach ($records as $item) {
			$dateKey = date("Ymd", strtotime($item['appointmentStart']));


			$item['time']['start_view'] = date("H:i", strtotime($item['time']['start']));
			$item['time']['end_view'] = date("H:i", strtotime($item['time']['end']));


			if ($item['clientID'] == 0) {
				$item['client'] = array("first_name" => "Walk-In");
			}


			if (!isset($list[date("Ymd", strtotime($item['appointmentStart']))])) {
				$list[$dateKey]['label']['day'] = date("l", strtotime($item['appointmentStart']));
				$list[$dateKey]['label']['date'] = date("d F Y", strtotime($item['appointmentStart']));
				$list[$dateKey]['label']['duration'] = 0;
				$list[$dateKey]['label']['duration_view'] = "";
				$list[$dateKey]['label']['status'] = 0;

				if ($dateKey < date("Ymd", strtotime('now'))) {
					$list[$dateKey]['label']['status'] = 1;
				}
				if ($dateKey > date("Ymd", strtotime('now'))) {
					$list[$dateKey]['label']['status'] = 2;
				}


			}
			$list[$dateKey]['records'][] = $item;
			$list[$dateKey]['label']['duration'] = $list[$dateKey]['label']['duration'] + $item['duration'];
			$list[$dateKey]['label']['duration_view'] = seconds_to_time($list[$dateKey]['label']['duration'] * 60, TRUE);


		}

		$list_ = array();
		foreach ($list as $item) {
			$list_[] = $item;
		}


		$return['list'] = $list_;

		return $return;
	}

	function day_view($return, $records) {
		$currentDay = $return['settings']['day_value'];
		$settings = $this->f3->get("settings");


		$dayofweek = strtolower(date('l', strtotime($currentDay)));

		//test_array($currentDay);

		$business_hours = FALSE;
		if (isset($settings['open'][$dayofweek])) {
			if (($settings['open'][$dayofweek]['start'] && $settings['open'][$dayofweek]['end']) && !in_array(date('d-m', strtotime($currentDay)), $settings['closed'])) {
				$business_hours = array(
					"start" => date("Y-m-d H:i:s", strtotime($currentDay. " " . $settings['open'][$dayofweek]['start'] . ":00")),
					"end" => date("Y-m-d H:i:s", strtotime($currentDay. " " . $settings['open'][$dayofweek]['end'] . ":00",strtotime("Y-m-d")))
				);
			}

		}
		//test_array($business_hours);
		$bussiness_hours_active = TRUE;
		if (!$business_hours) {
			$bussiness_hours_active = FALSE;
			$business_hours = array(
				"start" => date("$currentDay H:i:s", strtotime("06:00:00")),
				"end" => date("$currentDay H:i:s", strtotime("18:00:00"))
			);
		}
		//test_array($business_hours);

		$earliest_record = date("H:i", strtotime($business_hours['start']));
		$latest_record = date("H:i", strtotime($business_hours['end']));



		foreach ($records as $item) {
			//test_array($item['time']['start_view_short']);
			if ($item['time']['start_view_short'] < $earliest_record) {
				$earliest_record = $item['time']['start_view_short'];
			}
			if ($item['time']['end_view_short'] > $latest_record) {
				$latest_record = $item['time']['end_view_short'];
			}
		}

		$st_earliest_record = explode(":", $earliest_record);
		$st_latest_record = explode(":", $latest_record);


		$latest_hour = $st_latest_record[0];
		if ($st_latest_record[1] > 0) {
			$latest_hour = $st_latest_record[0] + 1;
		}
		$earliest_record = $st_earliest_record[0] . ":00";
		$latest_record = str_pad($latest_hour, 2, "0", STR_PAD_LEFT) . ":00";


		$first_item = $earliest_record . ":00";
		$last_item = $latest_record . ":00";

		//test_array($st_latest_record);

		$return_view = array();

		$return_view['closed_hours'] = array("l" => 0, "r" => 0,

		);


		$business_hours['start_l'] = $first_item;
		$business_hours['end_r'] = $last_item;


		$day_s = strtotime(date("Y-m-d $first_item", strtotime($currentDay)));
		$day_e = strtotime(date("Y-m-d $last_item", strtotime($currentDay)));
		$day = $day_e - $day_s;


		//test_array(array(date("Y-m-d H:i:s",$day_s),$day_s,date("Y-m-d H:i:s",$day_e),$day_e));




		$new_records = array();
		foreach ($records as $item) {
			$s = strtotime($item['time']['start']);
			$e = strtotime($item['time']['end']);
			$day_ = $e - $s;




			$l_ = $s - $day_s;
			if ($l_<0){
				$l = 0;
			} else {
				$l = ($l_ / $day)*100;
			}


			$r_ = $day_e - $e;
			$r = ($r_ / $day)*100;








			$item['agenda']['top'] = $l;
			$item['agenda']['bottom'] = $r;
			$new_records[] = $item;
		}


		$return_view['items'] = $new_records;




		//test_array(6 * 60 * 60);

		//test_array($business_hours);

	//	$business_hours['start'] = date("Y-m-21 06:00:00");
	//	$business_hours['end'] = date("Y-m-21 12:00:00");

		$s = strtotime($business_hours['start']);
		$e = strtotime($business_hours['end']);

		//test_array(array($business_hours,date("Y-m-d H:i:s",$day_s)));




		if ($s && $e){

			$l_ = $s - $day_s;
			if ($l_<0){
				$l = 100;
			} else {
				$l = 100-($l_ / $day)*100;
			}




			$r_ = $day_e - $e;
			$r = (($r_ / $day)*100);



			if ($r>100){
				$r = 100;
			}
			if ($r<0){
				$r = 0;
			}
			if ($l>100){
				$l = 100;
			}
			if ($l<0){
				$l = 0;
			}
		} else {
			$l = 100;
			$r = 0;
		}

		//test_array(array($l,$r));

		if (!$bussiness_hours_active)$r = 100;

			//test_array(array($day_e,$e,$r_,$r,$business_hours));

		$s_close =  $l;
		$e_close= 100-$r;





		//test_array($l);
		//	test_array($e_close);
// 68.65 | 80.7

		$return_view['closed_hours'] = array(
			"morning_till" => $s_close,
			"night_start" => $e_close,
			"start" => $business_hours['start'],
			"end" => $business_hours['end'],
			"start_l" => $business_hours['start_l'],
			"end_r" => $business_hours['end_r'],
			"start_view" => date("H:i",strtotime($business_hours['start'])),
			"end_view" => date("H:i",strtotime($business_hours['end'])),
		);

		//test_array($business_hours);


		$startTime = strtotime(date("Y-m-d " . $first_item, strtotime($currentDay)));
		$endTime = strtotime(date("Y-m-d " . $last_item, strtotime($currentDay)));


		//test_array(array($startTime,$endTime,$first_item,$last_item));
// Loop between timestamps, 24 hours at a time

		$return_view['table'] = array();
		for ($i = $startTime; $i < $endTime; $i = $i + (60 * 60)) {
			$return_view['table'][] = date('H:00', $i); // 2010-05-01, 2010-05-02, etc
		}


		//test_array($return_view['table']);



		$s = strtotime("now");
		$l_ = $s - $day_s;
		//test_array($l_);
		if ($l_<0){
			$l = false;
		} else {
			$l = ($l_ / $day)*100;
			if ($l > 100){
				$l = false;
			}
		}


		//$l = 100 - $l;


		$return_view['settings']['now']  = $l;



		$return_view['settings']['active'] = $bussiness_hours_active;


		$return['list'] = $return_view;

		//test_array($return);


		return $return;
	}

	function calendar_view($return, $records) {
		$return_view = array();
		$return_view['items'] = array();
		$settings = $this->settings;

		foreach ($records as $item){

			$label = $item['client']['ID']?$item['client']['first_name'] . " ".  $item['client']['last_name']:"Walk-In";


			$return_view['items'][] = array(
				"ID"  => $item['ID'],
				"title"  => $label,
				"start" => $item['time']['start'],
				"end" => $item['time']['end']
			);
		};


		$return_view['closed'] = array();


		$month_ = explode("-",$return['settings']['month_value']);

		$startTime = (date("{$month_[1]}-{$month_[0]}-01"));
		$endTime = (date("Y-m-t",strtotime($startTime)));



		//test_array(array($startTime,$endTime,$first_item,$last_item));
// Loop between timestamps, 24 hours at a time


		for ($i = strtotime("-7 days",strtotime($startTime)); $i <= strtotime("+7 days",strtotime($endTime)); $i = $i + (60 * 60)*24) {
			$d = date('Y-m-d', $i);
			$dayofweek = strtolower(date('l', strtotime($d)));

			//test_array($currentDay);

			$business_hours = FALSE;
			if (isset($settings['open'][$dayofweek])) {
				if (($settings['open'][$dayofweek]['start'] && $settings['open'][$dayofweek]['end']) && !in_array(date('d-m', strtotime($d)), $settings['closed'])) {
					$business_hours = true;
				}

			}

			if (!$business_hours){
				$return_view['closed'][] = $d;
			}


		}

		//test_array(array($startTime,$endTime,$return_view['closed']));





		$return_view['settings']['current'] = $return['settings']['month_value'];
		$return_view['settings']['start'] = $startTime;
		$return_view['settings']['end'] = $endTime;

		$return['list'] = $return_view;
		return $return;
	}


}
