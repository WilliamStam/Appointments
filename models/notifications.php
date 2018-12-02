<?php
namespace models;

use \timer as timer;

class notifications extends _ {

	private static $instance;

	function __construct() {
		parent::__construct();


	}

	public static function getInstance() {
		if (is_null(self::$instance)) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	public function getAll($where = "", $orderby = "", $limit = "", $options = array()) {
		$result = $this->getData($where, $orderby, $limit, $options);
		$result = $this->format($result, $options);

		return $result;

	}

	public function getData($where = "", $orderby = "", $limit = "", $options = array()) {
		$timer = new timer();
		$f3 = \Base::instance();

		if ($where) {
			$where = "WHERE " . $where . "";
		}
		else {
			$where = " ";
		}

		if ($orderby) {
			$orderby = " ORDER BY " . $orderby;
		}
		if ($limit) {
			$limit = " LIMIT " . $limit;
		}

		$args = "";
		if (isset($options['args'])) {
			$args = $options['args'];
		}

		$ttl = "";
		if (isset($options['ttl'])) {
			$ttl = $options['ttl'];
		}


		$result = $f3->get("DB")->exec("
			 SELECT DISTINCT *
			FROM notifications 
			$where
			GROUP BY ID
			$orderby
			$limit;
		", $args, $ttl);

		$return = $result;
		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());

		return $return;
	}

	static function format($data, $options) {
		$timer = new timer();
		$single = FALSE;
		$f3 = \Base::instance();
		//	test_array($items);
		if (isset($data['ID'])) {
			$single = TRUE;
			$data = array($data);
		}
		//test_array($items);


		$recordIDs = array();

		$i = 1;
		$n = array();
		foreach ($data as $item) {
			$recordIDs[] = $item['ID'];

			$n[] = $item;
		}

		if ($single) {
			$n = $n[0];
		}
		$records = $n;


		$timer->_stop(__NAMESPACE__, __CLASS__, __FUNCTION__, func_get_args());

		return $records;
	}

	function defaultTemplates(){






	}


	function notify_body($notif, $eventID, $extra,$check_if_exists=false) {
		if (isset($extra['settings'])) {
			$settings = $extra['settings'];
		} else {
			$settings = $this->settings;
		}
		$return = false;
		$body_exists = false;
		if ($settings[$notif . "|" . $eventID . "_body_template"] || file_exists("./resources/notification_body/{$notif}-{$eventID}.twig")){
			$body_exists = $settings[$notif . "|" . $eventID . "_body_template"]?$settings[$notif . "|" . $eventID . "_body_template"]:file_get_contents("./resources/notification_body/{$notif}-{$eventID}.twig");
		};



		if ($check_if_exists){
			$return = $body_exists?true:false;
		} else {
			if ($body_exists){
				$template = $body_exists;
				$tmpl = new \template($template);
				$tmpl->data = $extra;
				$return = $tmpl->render_string();
			}
		}



		return $return;


	}

	function notify_subject($notif, $eventID, $extra,$check_if_exists=false) {
		if (isset($extra['settings'])) {
			$settings = $extra['settings'];
		} else {
			$settings = $this->settings;
		}


		$return = false;
		$body_exists = false;
		if ($settings[$notif . "|" . $eventID . "_body_template"] || file_exists("./resources/notification_subject/{$notif}-{$eventID}.twig")){
			$body_exists = $settings[$notif . "|" . $eventID . "_subject_template"]?$settings[$notif . "|" . $eventID . "_subject_template"]:file_get_contents("./resources/notification_subject/{$notif}-{$eventID}.twig");
		};



		if ($check_if_exists){
			$return = $body_exists?true:false;
		} else {
			if ($body_exists){
				$template = $body_exists;
				$tmpl = new \template($template);
				$tmpl->data = $extra;
				$return = $tmpl->render_string();
			}
		}


		return $return;


	}
	function defaultNotifications($section=""){

		$notifications = array(
			"not_1" => array(
				"label"=>"Notify client by SMS",
				"short"=>"Client SMS",
				"type" => "sms",
				"log_label_prefix" => "Client"
			),
			"not_2" => array(
				"label"=>"Notify client by EMAIL",
				"short" => "Client EMAIL",
				"type" => "email",
				"log_label_prefix" => "Client"),
			"not_3" => array(
				"label"=>"Notify admin by SMS",
				"short"=>"Admin SMS",
				"type" => "sms",
				"log_label_prefix" => "Admin"),
			"not_4" => array(
				"label"=>"Notify admin by EMAIL",
				"short" => "Admin EMAIL",
				"type" => "email",
				"log_label_prefix" => "Admin"
			)
		);

		$events = array(
			"add_1" =>array(
				"label"=>"Record Created FRONT END",
				"description"=>"When a client fills in the form from the book now part"
			),
			"add_2"=>array(
				"label"=>"Record Created by an Admin",
				"description"=>"When an admin places a booking in the backend"
			),
			"edi_1"=>array(
				"label"=>"Record Changed FRONT END",
				"description"=>"When a client changes a booking"
			),
			"edi_2"=>array(
				"label"=>"Record Changed by an Admin",
				"description"=>"When an Admin changes the booking"
			),
			"del_1"=>array(
				"label"=>"Record Deleted FRONT END",
				"description"=>"When a client deletes a record"
			),
			"del_2"=>array(
				"label"=>"Record Deleted by an Admin",
				"description"=>"When an admin deletes a record"
			),
			"rem_1"=>array(
				"label"=>"24 hour prior to appointment start REMINDER",
				"description"=>"A reminder notification about an upcoming appointment"
			)
		);

		$return= array(
			"notifications"=>$notifications,
			"events"=>$events
		);

		if ($section){
			$return = $return[$section];
		}






		return $return;
	}

	function notify($appointment, $eventID, $extra, $forceEnd = FALSE, $settings=false) {

		if ($settings==false){
			$settings = $this->settings;
		}

		if (!isset($settings[0])){
			$company = companies::getInstance()->get($appointment['companyID'],array("format"=>true));
			$settings = $company['settings'];


		}


		$extra['settings'] = $settings;

		$notifications = $this->defaultNotifications("notifications");
		$events = $this->defaultNotifications("events");

		$notifications["not_1"]['to'] = $appointment["client"]['mobile_number'];
		$notifications["not_2"]['to'] = $appointment["client"]['email'];
		$notifications["not_3"]['to'] = $settings['mobile_number'];
		$notifications["not_4"]['to'] = $settings['email'];


	//	test_array(array("notifications"=>$notifications,"eventID"=>$eventID,"settings"=>$settings,"appointment"=>$appointment));

		//test_array(array($eventID,$forceEnd));

		if ($forceEnd) {
			$notifications = array($forceEnd => $notifications[$forceEnd]);
		}


		//test_array($notifications);

		foreach ($notifications as $notif => $notification_settings) {
			$enable_notification = isset($settings[$notif . "|" . $eventID]) && $settings[$notif . "|" . $eventID]=='1' ? TRUE : FALSE;


			//test_array($enable_notification);

			if ($notif=="not_3"){
			//	test_array(array($this->settings[$notif . "|" . $eventID],$notif . "|" . $eventID));
			}

			if ($enable_notification) {



				$log_label = "";
				$log = array(
					"label" => $extra['log_label'],
					"type" => $notification_settings['type']
				);
				$result = FALSE;

				if ($notification_settings['type'])







					switch ($notification_settings['type']) {
						case "sms":
							$log['body'] = $this->notify_body($notif, $eventID, $extra);


							//test_array($notification_settings);
							if ($notification_settings['to'] && $settings['enable_sms'] && $log['body']) {

								$result = notifications::getInstance()->_send_sms($notification_settings['to'], $log['body'], $extra);
								//test_array($result);
								if ($result) {
									$log_label = "{$notification_settings['log_label_prefix']} Notification: " . $notification_settings['to'];
								}
								else {
									$log_label = "{$notification_settings['log_label_prefix']} Notification FAILED: " . $notification_settings['to'];
								}

							}
							break;
						case "email":
							$log['subject'] = $this->notify_subject($notif, $eventID, $extra);
							if (!$log['subject']){
								$log['subject'] =$events[$eventID]['label'];
							}
							$log['body'] = $this->notify_body($notif, $eventID, $extra);
							if ($notification_settings['to'] && $settings['enable_email'] && $log['body']) {

								$result = notifications::getInstance()->_send_email($notification_settings['to'], $log['body'], $log['subject'], $extra);
								if ($result) {
									$log_label = "{$notification_settings['log_label_prefix']} Notification: " . $notification_settings['to'];
								}
								else {
									$log_label = "{$notification_settings['log_label_prefix']} Notification FAILED: " . $notification_settings['to'];
								}
							}
							break;

					}
				if ($log_label) {
					$log['log_label'] = $log_label;
					//logs::getInstance()->_log($appointment['ID'], $log_label, $notif."|".$eventID, $log);
					logs::getInstance()->_notify($appointment['ID'], $notif . "|" . $eventID, $log, $result);
				}


			}


		}


	}

	function _send_sms($to, $body, $extra = array()) {
		if (isset($extra['settings'])) {
			$settings = $extra['settings'];
		} else {
			$settings = $this->settings;
		}

		$result = _sms::getInstance()->sendSms($to, $body, $settings);
//		$result = true;
		$return = TRUE;
		if (!$result) {
			$return = FALSE;
		}
//		file_put_contents("D:\\Work\\Appointed\\tmp\\sms_{$to}.html",$body);
		return $return;

	}

	function _send_email($to, $body, $subject, $extra = array()) {
		if (isset($extra['settings'])) {
			$settings = $extra['settings'];
		} else {
			$settings = $this->settings;
		}
			$settings['email_smtp_host'] = $settings['email_smtp_host'] ? $settings['email_smtp_host'] : "127.0.0.1";
			$settings['email_smtp_port'] = $settings['email_smtp_port'] ? $settings['email_smtp_port'] : "25";
			$settings['email_smtp_scheme'] = $settings['email_smtp_scheme'] ? $settings['email_smtp_scheme'] : "";
			$settings['email_smtp_user'] = $settings['email_smtp_user'] ? $settings['email_smtp_user'] : "";
			$settings['email_smtp_password'] = $settings['email_smtp_password'] ? $settings['email_smtp_password'] : "";

		$headers = "MIME-Version: 1.0\r\n";
		$headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";



			$smtp = new \SMTP ($settings['email_smtp_host'], $settings['email_smtp_port'], $settings['email_smtp_scheme'], $settings['email_smtp_user'], $settings['email_smtp_password']);
			$smtp->set('To', $to);
			$smtp->set('Subject', $subject);
			$smtp->set('From', $settings['email_from']);
			$smtp->set('MIME-Version', '1.0');
			$smtp->set('Content-Type', 'text/html; charset=ISO-8859-1');
			$result = $smtp->send($body);
		
		
//		file_put_contents("D:\\Work\\Appointed\\tmp\\email_{$subject}.html",$body);
		
		$result = true;

		return $result;


	}


}
