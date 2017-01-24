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

		$settings_array = array();

		//test_array($settings);

		$companies = array();
		$recordsIDs = array();
		foreach ($records as $item){
			$recordsIDs[] = $item['ID'];
			if (!in_array($item['companyID'], $companies)){
				$companies[] = $item['companyID'];
			}

		}

		if (count($companies)){
			$companies = implode(",",$companies);
			$companies = models\companies::getInstance()->getAll("ID in ($companies)");

			foreach($companies as $item){

				$s = $item['settings'];



				$settings_array[$item['ID']] = $s;
			}

		}

		//test_array($settings);




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

		$debug = array(
			"notifications"=>$notification_array,
			"records"=>array(),
		);
		$notificationRecord = array();
		$counting = 0;
		$r = array();
		foreach ($records as $item){
			//test_array($item);
			$item_notifications = isset($noti[$item['ID']])?$noti[$item['ID']]:array();
			$item['notify'] = array();
			$item['debug'] = array();
			$sending_notification = false;

			$settings = $settings_array[$item['companyID']];

			foreach ($notification_array as $n=>$value){
				$v = true;
				//test_array($n);
				if (isset($item_notifications[$n.'|rem_1'])){
					$v = false;
				}
				$item['notify'][$n.'|rem_1'] = $v;
				$item['debug'][$n.'|rem_1'] = array(
					"can"=>$v,
					"settings"=>$settings[$n.'|rem_1']
				);
				if ($v){


					$enable_notification = isset($settings[$n . "|rem_1"]) && $settings[$n. "|rem_1"]=='1' ? TRUE : FALSE;
					//test_array(array($enable_notification,$n . "|rem_1",$settings[$n . "|rem_1"]));

					if ($enable_notification){
						$sending_notification = true;
						$extra = array("appointment" => $item);
						$extra['log_label'] = "Booking Reminder";
						$extra['settings'] = $settings;
						//test_array($item);

						if (!isset($_GET['debug'])) {
							models\notifications::getInstance()->notify($item, 'rem_1', $extra, $n, $settings);
						}
					}

				}
			}

			$debug["records"][] = $item;
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

		if (isset($_GET['debug'])){
			test_array($debug);
		} else {
			models\logs::getInstance()->_log(null,"Cron task (".count($records)." notified ".$counting.")","cron",$log);

		}



		echo $result;


		

	}
	
	
	
}
