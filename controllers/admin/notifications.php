<?php
namespace controllers\admin;
use \timer as timer;
use \models as models;
class notifications extends _ {
	function __construct(){
		parent::__construct();
	}
	function page(){
		//if ($this->user['ID']=="")$this->f3->reroute("/login");
		$notifications = models\notifications::getInstance()->defaultNotifications();
		$new = array();
		$notificationTypes = array();
		foreach ($notifications['notifications'] as $noti=>$noti_val){

			$notificationTypes[$noti] = false;



		}



		foreach ($notifications['events'] as $eventID=>$event){

			$event['notifications'] = array();
			$eventshow = false;
			foreach ($notifications['notifications'] as $noti=>$noti_val){
				$body_exists = false;
				if (file_exists("./resources/notification_body/{$noti}-{$eventID}.twig")){
					$body_exists = file_get_contents("./resources/notification_body/{$noti}-{$eventID}.twig");

					if ($body_exists==""){
						$body_exists = false;
					} else {
						$body_exists = true;
						$eventshow = true;
					}
				};


				$event['notifications'][$noti] = $body_exists;
			}

			if ($eventshow){
				foreach ($event['notifications'] as $notifi=>$no){
					if ($no){
						$notificationTypes[$notifi] = true;
					}
					//test_array($notifi);
				}

				$new[$eventID] = $event;
			}


		}

		//test_array($notificationTypes);

		
		$tmpl = new \template("template.twig","ui/admin");
		$tmpl->page = array(
			"section"    => "settings",
			"sub_section"=> "notifications",
			"template"   => "notifications",
			"meta"       => array(
				"title"=> "Admin | Settings | Notifications",
			),
		);
		$tmpl->events = $new;
		$tmpl->notifications = $notifications;
		$tmpl->notificationTypes = $notificationTypes;
		$tmpl->output();
	}
	
	
	
}
