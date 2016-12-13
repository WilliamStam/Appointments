<?php
/**
# plugin system jvjquerylib - JV JQuery Libraries
# @versions: 1.5.x,1.6.x,1.7.x,2.5.x
# ------------------------------------------------------------------------
# author    Open Source Code Solutions Co
# copyright Copyright (C) 2011 joomlavi.com. All Rights Reserved.
# @license - http://www.gnu.org/licenses/licenses.htmls GNU/GPL or later.
# Websites: http://www.joomlavi.com
# Technical Support:  http://www.joomlavi.com/my-tickets.html
-------------------------------------------------------------------------*/
defined('_JEXEC') or die('Restricted access');
if(JFactory::getApplication()->isAdmin()){
	$jvcustomajax = JRequest::getVar('jvcustomajax');
	if($jvcustomajax) require_once(JPATH_SITE.DS.$jvcustomajax);
	
	if(JVERSION > '1.6'){
		jimport('joomla.form.formfield');
		class JFormFieldJVCustom extends JFormField{
			protected $type = 'Jvcustom';
			protected function getInput()
			{
				$el = (array)$this->element;
				$obj = new JVCustomParam($el["@attributes"]['xmlpath'],$this->fieldname,$this->id);
				$value = $this->value;
				if(!$value) $value = $obj->defaultData($this->fieldname);
				if(!$value) $value = '{}';
				
				return '
                <div class="clr"></div>
                <div class="jvcustomfieldpanel">
                    <textarea
                        style="display:none"
                        name="'.$this->name.'" 
                        id="'.$this->id.'">
                            ' .$value.'
                    </textarea>
                </div>
            ';
			}
			function getParams(){
				return json_encode($this->getJSONField($this->element));
			}
			protected function getLabel() {}
		}
		jimport('joomla.html.parameter.element');
		class JElementJVCustom extends JElement{
			var    $_name = 'JVCustom';
			function fetchTooltip(){}
			function fetchElement($name, $value, &$node, $control_name){
				$id = "JVCustom_".$name;
				$obj = new JVCustomParam($node->_attributes['xmlpath'],$name,$id);
				if(!$value) $value = $obj->defaultData($name);
				if(!$value) $value = '{}';
				
				return '
                <div class="jvcustomfieldpanel">
                    <textarea
                        style="display:none"
                        name="'.$control_name.'['.$name.']" 
                        id="'.$id.'">
                            ' .$value.'
                    </textarea>
                </div>
            ';
			}
		}
	}else{
		jimport('joomla.html.parameter.element');
		class JElementJVCustom extends JElement{
			var    $_name = 'JVCustom';
			function fetchTooltip(){}
			function fetchElement($name, $value, &$node, $control_name){
				$id  = $control_name.$name;
				$obj = new JVCustomParam($node->_attributes['xmlpath'],$name,$id);
				if(!$value) $value = $obj->defaultData($name);
				if(!$value) $value = '{}';
				return '
                <div class="jvcustomfieldpanel">
                    <textarea
                        style="display:none"
                        name="'.$control_name.'['.$name.']" 
                        id="'.$id.'">
                            ' .$value.'
                    </textarea>
                </div>
            ';
			}
		}
	}
}
class JVCustomParam{
	private $xml;
	private $paramsNode;
	static $xmls = array();
	function __construct($path,$name,$id){
		$path = JPATH_SITE .DS. str_replace('/',DS,$path);
		if(self::$xmls[$path]){
			$this->xml = self::$xmls[$path];
		}else {
			$this->xml = simplexml_load_file($path);
			self::$xmls[$path] = $this->xml;
			
			
			$doc = JFactory::getDocument();
			
			if($this->xml->jvcustoms->php) foreach($this->xml->jvcustoms->php as $script){
				eval((string) $script);
			}
			
			if($this->xml->jvcustoms->style) foreach($this->xml->jvcustoms->style as $style){
				$src = ((array)$style);
				$src = trim($src['@attributes']['src']);
				if($src) $doc->addStyleSheet(JURI::root().$src);
				$str = trim((string) $style);
				if($str) $doc->addStyleDeclaration($str);
			}
		}
		$this->paramsNode = $this->xml->jvcustoms->params;
		$this->eventsNode = $this->xml->jvcustoms->events;
		$this->dataNode = $this->xml->jvcustoms->datas;
		
		
		$params = $this->params($name);
		if(JVERSION > '1.6'){
			$this->addScript16("#{$id}",$params,$this->events($name));
		}else{
			$this->addScript15("#{$id}",$params,$this->events($name));
		}
		
	}
	function params($name){
		$node = $this->paramsNode->{$name};
		if(!(bool)$node) return false;
		if(count($node->children()) == 0) return trim((string) $node);
		return json_encode($this->getJSON($node));
	}
	function events($name){
		$node = $this->eventsNode->{$name};
		if(!(bool)$node) return "{}";
		return (string)$node;
	}
	function defaultData($name){
		$node = $this->dataNode->{$name};
		return (string)$node;
	}
	
	function getJSON($xml){
		$json = array();
		foreach($xml->attributes() as $key => $val) $json[$key] = (string) $val;
		foreach(array('label','title') as $key){
			$json[$key] = JText::_($json[$key]);
		}
		
		$json['item'] = array();
		
		foreach($xml->children() as $children){
			$strValue = trim((string)($children));
			if($strValue != '') $json['item'][$children->getName()] = $strValue;
			else $json['item'][$children->getName()] = $this->getJSON($children);
		}
		if(in_array($json['field'],array('multi'))){
			if(isset($json['filter'])) $json['filter'] = (bool) $json['filter'];
			switch(count($json['item'])){
				case 0: unset($json['item']);
					break;
				case 1: foreach($json['item']  as $children) $json['item'] = $children;
					break;
			}
		}
		return $json;
	}
	
	function addScript15($id,$params,$events = '{}'){
		$editor = JFactory::getEditor();
		$editor->display('','',200,200,20,10,false);
		$doc = JFactory::getDocument();
		JQuery('customfield');
		$doc->addScriptDeclaration("
            jQuery(function($){
                var initialize = function(){
                        var 
                            formData = $('{$id}'),
                            params = (function(param){return param ||{};})({$params}),
                            custom = new CustomField(params,{$events}),
                            _submit = submitbutton,
                            data
                        ;
                        try{ data = JSON.parse(formData.val()) }catch(e){}
                        submitbutton = function(){
                            formData.val(JSON.stringify(custom.data().data()));
                            _submit.apply(window,arguments);
                        }
                        formData.after(custom);
                        custom.data().data(data);
                    }
                    
                ;
                if(!JSON.parse || !JSON.stringify ){
                    $.getScript('http://ajax.cdnjs.com/ajax/libs/json2/20110223/json2.js',function(){
                        initialize();
                    });
                }else initialize();
            });                        
         ");
		$doc = JFactory::getDocument();
		if($this->xml->jvcustoms->script) foreach($this->xml->jvcustoms->script as $script){
			$src = ((array)$script);
			$src = trim($src['@attributes']['src']);
			if($src) $doc->addScript(JURI::root().$src);
			$str = trim((string) $script);
			if($str) $doc->addScriptDeclaration($str);
		}
	}
	function addScript16($id,$params,$events = '{}'){
		$editor = JFactory::getEditor();
		$editor->display('','',200,200,20,10,false);
		$doc = JFactory::getDocument();
		JQuery('customfield');
		
		$doc->addScriptDeclaration("
            jQuery(function($){
                var initialize = function(){
                    var 
                        formData = $('{$id}'),
                        params = (function(param){return param ||{};})({$params}),
                        custom = new CustomField(params,{$events}),
                        _submit = Joomla.submitbutton,
                        data
                        
                    ;
                    if(!custom) return;
                    try{ data = JSON.parse(formData.val()) }catch(e){}
                    Joomla.submitbutton = function(){
                        formData.val(JSON.stringify(custom.data().data()));
                        _submit.apply(Joomla,arguments);
                    }
                    custom.data().data(data);
                    formData.after(custom);
                }
                if(!JSON.parse || !JSON.stringify ){
                    $.getScript('http://ajax.cdnjs.com/ajax/libs/json2/20110223/json2.js',function(){
                        initialize();
                    });
                }else initialize();
            });
         ");
		$doc = JFactory::getDocument();
		if($this->xml->jvcustoms->script) foreach($this->xml->jvcustoms->script as $script){
			$src = ((array)$script);
			$src = trim($src['@attributes']['src']);
			if($src) $doc->addScript(JURI::root().$src);
			$str = trim((string) $script);
			if($str) $doc->addScriptDeclaration($str);
		}
	}
	
	function parse($data){
		if(is_string($data)) $data = json_decode($data);
		return self::parseData($data);
	}
	
	private static function parseData($param){
		if(is_array($param)) return self::parseDataArray($param);
		else if(is_object($param)) return self::parseDataObject($param);
		else if(is_string($param)) return  self::unescape($param);
		return $param;
	}
	
	private static function parseDataObject($datas){
		$selected = $datas->{'@selected'};
		if($selected){
			$data = new stdClass();
			$data->{'@selected'} = $selected;
			$data->{$selected} = self::parseData($datas->{$selected});
			return $data;
		}
		if($datas->_disabled) return null;
		foreach($datas as $key => $value) $datas->{$key} = self::parseData($value);
		return $datas;
	}
	private static function parseDataArray($datas){
		$arrdata = array();
		if(count($datas) == 0) return $datas;
		if(!is_object($datas[0])) return $datas;
		foreach($datas as $item){
			$checked = $item->{'@check'};
			if($checked === false) continue;
			$arrdata[] = self::parseData($item->{'@data'});
		}
		return $arrdata;
	}
	
	function code2utf($num){
		if($num<128)
			return chr($num);
		if($num<1024)
			return chr(($num>>6)+192).chr(($num&63)+128);
		if($num<32768)
			return chr(($num>>12)+224).chr((($num>>6)&63)+128)
			.chr(($num&63)+128);
		if($num<2097152)
			return chr(($num>>18)+240).chr((($num>>12)&63)+128)
			.chr((($num>>6)&63)+128).chr(($num&63)+128);
		return '';
	}
	
	function unescape($strIn, $iconv_to = 'UTF-8') {
		$strOut = '';
		$iPos = 0;
		$len = strlen ($strIn);
		while ($iPos < $len) {
			$charAt = substr ($strIn, $iPos, 1);
			if ($charAt == '%') {
				$iPos++;
				$charAt = substr ($strIn, $iPos, 1);
				if ($charAt == 'u') {
					// Unicode character
					$iPos++;
					$unicodeHexVal = substr ($strIn, $iPos, 4);
					$unicode = hexdec ($unicodeHexVal);
					$strOut .= self::code2utf($unicode);
					$iPos += 4;
				}
				else {
					// Escaped ascii character
					$hexVal = substr ($strIn, $iPos, 2);
					if (hexdec($hexVal) > 127) {
						// Convert to Unicode
						$strOut .= self::code2utf(hexdec ($hexVal));
					}
					else {
						$strOut .= chr (hexdec ($hexVal));
					}
					$iPos += 2;
				}
			}
			else {
				$strOut .= $charAt;
				$iPos++;
			}
		}
		if ($iconv_to != "UTF-8") {
			$strOut = iconv("UTF-8", $iconv_to, $strOut);
		}
		return $strOut;
	}
}
?>
