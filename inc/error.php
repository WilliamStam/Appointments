<?php

/**
 * Custom error handling
 */
class Error {
	/**
	 * Handle error/s for specific error codes
	 *
	 * @param  object $f3 FatFree instance
	 * @return mixed      Custom error/Default FatFree error
	 */
	public static function handler($f3) {
		$error = $f3->get('ERROR');
		
	
		switch ($error['code']) {



			default:
				$f3->mset(array(
					'ONERROR' => null, 
					'ERROR' => null
			    ));
				$f3->error($error['code'], $error['text'], $error['trace']);

			
				
		}
	}
}