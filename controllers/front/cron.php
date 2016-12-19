<?php
namespace controllers\front;
use \timer as timer;
use \models as models;
class cron extends _ {
	function __construct(){
		parent::__construct();
	}
	function page(){
		$records = models\appointments::getInstance()->getAll("appointmentStart BETWEEN NOW() AND NOW() + INTERVAL 25 HOUR","","",array("format"=>true,"services"=>true,"client"=>true));


		$recordsIDs = array();
		foreach ($records as $item){
			$recordsIDs[] = $item['ID'];
		}


		if (count($recordsIDs)){
			$recordsIDs = implode(",",$recordsIDs);
			$filteronrem_1 = "AND eventID LIKE '%|rem_1'";
			$filteronrem_1 = "";
			$notifications = models\notifications::getInstance()->getAll("appointmentID in ({$recordsIDs}) $filteronrem_1");
			$noti = array();
			foreach ($notifications as $item){
				$noti[$item['appointmentID']][$item['eventID']][] = $item;
			}
		}

		$notification_array = array("not_1","not_2","not_3","not_4");

		$r = array();
		foreach ($records as $item){
			$item_notifications = isset($noti[$item['ID']])?$noti[$item['ID']]:array();
			$item['notify'] = array();
			foreach ($notification_array as $n){
				$v = true;
				if (isset($item_notifications[$n.'|rem_1'])){
					$v = false;
				}
				$item['notify'][$n.'|rem_1'] = $v;
				if ($v){
					$extra = array("appointment" => $item);
					$extra['log_label'] = "Booking Reminder";
					models\notifications::getInstance()->notify($item,'rem_1',$extra,$n);
				}


			}

			$r[] = $item;
		}

		$records = $r;











		echo "found <strong>".count($records). "</strong> records sent off notifications";


		

	}
	
	
	
}
