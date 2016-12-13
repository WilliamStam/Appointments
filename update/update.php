<?php
class update {
	function __construct($cfg){


	}
	public static function code($cfg,$alreadyRun=false){
		$root_folder = dirname(dirname(__FILE__));


		chdir($root_folder);
		$return = "";
		if (!file_exists($root_folder."\\.git")) {
			shell_exec('git init');
		} else {

			//shell_exec('git stash');
			shell_exec('git reset --hard HEAD');
		}



		$output = shell_exec('git pull https://'.$cfg['git']['username'] .':'.$cfg['git']['password'] .'@'.$cfg['git']['path'] .' ' . $cfg['git']['branch'] . ' 2>&1');


		if (strpos($output, "Please move or remove them before you can merge.") && $alreadyRun != true) {
			shell_exec('git stash');
			self::code($cfg, true);
		}

		
	//	$str = str_replace(".git","",$cfg['git']['path']);
	//	$output = str_replace("From $str","", $output);
		$output = str_replace("* branch            ". $cfg['git']['branch'] ."     -> FETCH_HEAD","", $output);
		$output .= "</hr>\n\n";
		
		
		
		
		shell_exec('composer self-update');
		$output .= shell_exec('composer install');
		
		$return .= trim($output);

		return $return;
	}

	public static function db($cfg){
		$link = mysqli_connect($cfg['DB']['host'], $cfg['DB']['username'], $cfg['DB']['password'], $cfg['DB']['database']);

		/* check connection */
		if (mysqli_connect_errno()) {
			printf("Connect failed: %s\n", mysqli_connect_error());
			exit();
		}

		$sql = 'SELECT ID, system, value FROM system WHERE `system`="db_version" LIMIT 1';
		$result = mysqli_query($link,$sql);

		//mysqli_free_result($result);
		if(empty($result)) {
			$query = mysqli_query($link,"CREATE TABLE IF NOT EXISTS `system` (  `ID` int(6) NOT NULL AUTO_INCREMENT,  `system` varchar(100) DEFAULT NULL,  `value` varchar(100) DEFAULT NULL,  PRIMARY KEY (`ID`))");
			
			$query = mysqli_query($link,"INSERT INTO `system` (`system`,`value`) values ('db_version','0')");

			$sql = 'SELECT * FROM system WHERE `system`="db_version" LIMIT 1';
			$result = mysqli_query($link,$sql);
			
		} 
		$version = $result->fetch_array();
		
		
		
		

		
		
		if (isset($version['value'])){
			$version = $version['value'];
		} 


		
		

		

		$v = $version*1;
		
	

		include_once("db_update.php");

		
		$updates = 0;
		$result = "";
		$return = "";
		$filename = "backup_" . $v;
		$result = self::db_backup($cfg, $filename);
	

		if (count($sql) != $v) {

			$nsql = array();
			$i = 0;
			foreach ($sql as $exec) {
				$i = $i+ 1;
				if ($i > $v) {
					

						$nsql[] = $exec;

				}	
				
			}
			$sql = array_values($nsql);
			

			foreach ($sql as $e) {
				//echo $e . "<br>";
				if ($e) {
					$updates++;
					self::db_execute($cfg,$e);
				}
			}


			if ($updates>0){
				mysqli_query($link,"UPDATE system SET `value`='{$i}' WHERE `system`='db_version'") or die(mysqli_error($link));
			}
			


		} 

		if ($result){
			$return .= "Backup name: " . $result."<br>";
		}
		if ($updates!=0){
			$return .= "Updates: " . $updates."<br>";
		} else {
			$return .= "Already up-to-date.<br>";
		}

		return $return;
	}
	static function db_backup($cfg,$append_file_name){

		$filename = $cfg['backup'] . date("Y_m_d_H_i_s") . "_". $append_file_name . ".sql";

		$dbhost = $cfg['DB']['host'];
		$dbuser = $cfg['DB']['username'];
		$dbpwd = $cfg['DB']['password'];
		$dbname = $cfg['DB']['database'];

		if (!file_exists($cfg['backup'])) @mkdir($cfg['backup'], 0777, true);
		
		$str = "mysqldump --opt --single-transaction --host=$dbhost --user=$dbuser --password=$dbpwd $dbname > $filename";
	//	echo $str;
//exit(); 
		passthru($str);
		
		return "$filename";// passthru("tail -1 $filename");


	}
	static function db_execute($cfg,$sql){
		$link = mysqli_connect($cfg['DB']['host'], $cfg['DB']['username'], $cfg['DB']['password'], $cfg['DB']['database']);

		/* check connection */
		if (mysqli_connect_errno()) {
			printf("Connect failed: %s\n", mysqli_connect_error());
			exit();
		}

		$query = $sql;

		/* execute multi query */
		if (mysqli_multi_query($link, $query)) {
			do {
				/* store first result set */
				if ($result = mysqli_store_result($link)) {
					while ($row = mysqli_fetch_row($result)) {
						//printf("%s\n", $row[0]);
					}
					mysqli_free_result($result);
				}
				/* print divider */
				if (mysqli_more_results($link)) {
					//printf("-----------------\n");
				}
			} while (@mysqli_next_result($link));
		}

		/* close connection */
		mysqli_close($link);

	}
}
