<?php
namespace controllers\front;
use \timer as timer;
use \models as models;
class cron extends _ {
	function __construct(){
		parent::__construct();
	}
	function page(){

		$f3 = \Base::instance();

		$records = models\appointments::getInstance()->getAll("appointmentStart BETWEEN NOW() AND NOW() + INTERVAL 25 HOUR","","",array("format"=>true,"services"=>true,"client"=>true));

		$settings = $f3->get("settings");

		//test_array($settings);

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

		$notification_array = models\notifications::getInstance()->defaultNotifications("notifications");

	//	test_array($notification_array);

		$notificationRecord = array();
		$counting = 0;
		$r = array();
		foreach ($records as $item){
			$item_notifications = isset($noti[$item['ID']])?$noti[$item['ID']]:array();
			$item['notify'] = array();
			$sending_notification = false;
			foreach ($notification_array as $n=>$value){
				$v = true;
				//test_array($n);
				if (isset($item_notifications[$n.'|rem_1'])){
					$v = false;
				}
				$item['notify'][$n.'|rem_1'] = $v;
				if ($v){


					$enable_notification = isset($settings[$n . "|rem_1"]) && $settings[$n. "|rem_1"]=='1' ? TRUE : FALSE;
					//test_array(array($enable_notification,$n . "|rem_1",$settings[$n . "|rem_1"]));

					if ($enable_notification){
						$sending_notification = true;
						$extra = array("appointment" => $item);
						$extra['log_label'] = "Booking Reminder";
						models\notifications::getInstance()->notify($item,'rem_1',$extra,$n);
					}

				}
			}
			if ($sending_notification){
				$counting = $counting + 1;
				$notificationRecord[] = $item;
			}

			$r[] = $item;
		}

		$records = $r;








		$result = "found <strong>".count($records). "</strong> records sent off notifications to <strong>{$counting}</strong>";
		$log = array(
			"found"=>count($records),
			"sent"=>$counting,
			"records"=>$notificationRecord
		);

		models\logs::getInstance()->_log(null,"Cron task (".count($records)." notified ".$counting.")","cron",$log);



		echo $result;


		

	}
	
	
	
}
