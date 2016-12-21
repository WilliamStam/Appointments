<?php

namespace controllers\admin\data;

use \models as models;

class notification_templates extends _ {
	function __construct() {
		parent::__construct();

	}


	function form() {
		$return = array();

		$notifications_data = models\notifications::getInstance()->defaultNotifications();
		$notifications = array();
		foreach ($notifications_data['notifications'] as $noti=>$noti_val){
			if (isset($this->settings["enable_".$noti_val['type']]) && $this->settings["enable_".$noti_val['type']]){
				$notifications[$noti] = $noti_val;

			}



		}
		$new = array();
		//test_array($notifications);
		foreach ($notifications_data['events'] as $eventID=>$event){

			$event['notifications'] = array();
			$eventshow = false;
			foreach ($notifications as $noti=>$noti_val){

				$noti_val['body'] = false;
				$noti_val['subject'] = false;
				$noti_val['show'] = false;
				if (file_exists("./resources/notification_body/{$noti}-{$eventID}.twig")){

					$noti_val['body'] = (isset($this->settings[$noti . "|" . $eventID . "_body_template"]) && $this->settings[$noti . "|" . $eventID . "_body_template"])?$this->settings[$noti . "|" . $eventID . "_body_template"]:file_get_contents("./resources/notification_body/{$noti}-{$eventID}.twig");

					$noti_val['show'] = true;
					$eventshow = true;
				};
				if (file_exists("./resources/notification_subject/{$noti}-{$eventID}.twig")){

					$noti_val['subject'] = (isset($this->settings[$noti . "|" . $eventID . "_subject_template"]) && $this->settings[$noti . "|" . $eventID . "_subject_template"])?$this->settings[$noti . "|" . $eventID . "_subject_template"]:file_get_contents("./resources/notification_subject/{$noti}-{$eventID}.twig");

				};



				$event['notifications'][$noti] = $noti_val;
			}

			if ($eventshow){
				$event['noti_count'] = count($event['notifications']);
				$new[$eventID] = $event;
			}


		}

		$return['events'] = $new;


		$return['settings'] = $this->f3->get("settings");
		unset($return['settings']['smsportal_password']);


		return $GLOBALS["output"]['data'] = $return;
	}
	function template(){
		$return = array();
		$ID = isset($_GET['ID'])?$_GET['ID']: "";
		$parts = explode("|",$ID);
		$noti = $parts[0];
		$eventID = $parts[1];

		$notifications = models\notifications::getInstance()->defaultNotifications();

		$notification= isset($notifications['notifications'][$parts[0]])? $notifications['notifications'][$parts[0]]:"";
		$event = isset($notifications['events'][$parts[1]])? $notifications['events'][$parts[1]]:"";



		$notification['body'] = (isset($this->settings[$noti . "|" . $eventID . "_body_template"]) && $this->settings[$noti . "|" . $eventID . "_body_template"])?$this->settings[$noti . "|" . $eventID . "_body_template"]:"";
		$notification['subject'] = (isset($this->settings[$noti . "|" . $eventID . "_subject_template"]) && $this->settings[$noti . "|" . $eventID . "_subject_template"])?$this->settings[$noti . "|" . $eventID . "_subject_template"]:"";;

		$notification['body_default'] = false;
		$notification['subject_default'] = false;

		if (file_exists("./resources/notification_body/{$noti}-{$parts[1]}.twig")){
			$notification['body_default'] = file_get_contents("./resources/notification_body/{$noti}-{$eventID}.twig");
		};
		if (file_exists("./resources/notification_subject/{$noti}-{$parts[1]}.twig")){
			$notification['subject_default'] =file_get_contents("./resources/notification_subject/{$noti}-{$eventID}.twig");
		};






		$return = (array("notification"=>$notification,"event"=>$event,"ID"=>$ID));



		return $GLOBALS["output"]['data'] = $return;


	}



}
