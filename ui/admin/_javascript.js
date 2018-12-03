/*
 * Toastr
 * Copyright 2012-2015
 * Authors: John Papa, Hans Fjällemark, and Tim Ferrell.
 * All Rights Reserved.
 * Use, reproduction, distribution, and modification of this code is subject to the terms and
 * conditions of the MIT license, available at http://www.opensource.org/licenses/mit-license.php
 *
 * ARIA Support: Greta Krafsig
 *
 * Project: https://github.com/CodeSeven/toastr
 */
/* global define */
(function (define) {
    define(['jquery'], function ($) {
        return (function () {
            var $container;
            var listener;
            var toastId = 0;
            var toastType = {
                error: 'error',
                info: 'info',
                success: 'success',
                warning: 'warning'
            };

            var toastr = {
                clear: clear,
                remove: remove,
                error: error,
                getContainer: getContainer,
                info: info,
                options: {},
                subscribe: subscribe,
                success: success,
                version: '2.1.4',
                warning: warning
            };

            var previousToast;

            return toastr;

            ////////////////

            function error(message, title, optionsOverride) {
                return notify({
                    type: toastType.error,
                    iconClass: getOptions().iconClasses.error,
                    message: message,
                    optionsOverride: optionsOverride,
                    title: title
                });
            }

            function getContainer(options, create) {
                if (!options) { options = getOptions(); }
                $container = $('#' + options.containerId);
                if ($container.length) {
                    return $container;
                }
                if (create) {
                    $container = createContainer(options);
                }
                return $container;
            }

            function info(message, title, optionsOverride) {
                return notify({
                    type: toastType.info,
                    iconClass: getOptions().iconClasses.info,
                    message: message,
                    optionsOverride: optionsOverride,
                    title: title
                });
            }

            function subscribe(callback) {
                listener = callback;
            }

            function success(message, title, optionsOverride) {
                return notify({
                    type: toastType.success,
                    iconClass: getOptions().iconClasses.success,
                    message: message,
                    optionsOverride: optionsOverride,
                    title: title
                });
            }

            function warning(message, title, optionsOverride) {
                return notify({
                    type: toastType.warning,
                    iconClass: getOptions().iconClasses.warning,
                    message: message,
                    optionsOverride: optionsOverride,
                    title: title
                });
            }

            function clear($toastElement, clearOptions) {
                var options = getOptions();
                if (!$container) { getContainer(options); }
                if (!clearToast($toastElement, options, clearOptions)) {
                    clearContainer(options);
                }
            }

            function remove($toastElement) {
                var options = getOptions();
                if (!$container) { getContainer(options); }
                if ($toastElement && $(':focus', $toastElement).length === 0) {
                    removeToast($toastElement);
                    return;
                }
                if ($container.children().length) {
                    $container.remove();
                }
            }

            // internal functions

            function clearContainer (options) {
                var toastsToClear = $container.children();
                for (var i = toastsToClear.length - 1; i >= 0; i--) {
                    clearToast($(toastsToClear[i]), options);
                }
            }

            function clearToast ($toastElement, options, clearOptions) {
                var force = clearOptions && clearOptions.force ? clearOptions.force : false;
                if ($toastElement && (force || $(':focus', $toastElement).length === 0)) {
                    $toastElement[options.hideMethod]({
                        duration: options.hideDuration,
                        easing: options.hideEasing,
                        complete: function () { removeToast($toastElement); }
                    });
                    return true;
                }
                return false;
            }

            function createContainer(options) {
                $container = $('<div/>')
                    .attr('id', options.containerId)
                    .addClass(options.positionClass);

                $container.appendTo($(options.target));
                return $container;
            }

            function getDefaults() {
                return {
                    tapToDismiss: true,
                    toastClass: 'toast',
                    containerId: 'toast-container',
                    debug: false,

                    showMethod: 'fadeIn', //fadeIn, slideDown, and show are built into jQuery
                    showDuration: 300,
                    showEasing: 'swing', //swing and linear are built into jQuery
                    onShown: undefined,
                    hideMethod: 'fadeOut',
                    hideDuration: 1000,
                    hideEasing: 'swing',
                    onHidden: undefined,
                    closeMethod: false,
                    closeDuration: false,
                    closeEasing: false,
                    closeOnHover: true,

                    extendedTimeOut: 1000,
                    iconClasses: {
                        error: 'toast-error',
                        info: 'toast-info',
                        success: 'toast-success',
                        warning: 'toast-warning'
                    },
                    iconClass: 'toast-info',
                    positionClass: 'toast-top-right',
                    timeOut: 5000, // Set timeOut and extendedTimeOut to 0 to make it sticky
                    titleClass: 'toast-title',
                    messageClass: 'toast-message',
                    escapeHtml: false,
                    target: 'body',
                    closeHtml: '<button type="button">&times;</button>',
                    closeClass: 'toast-close-button',
                    newestOnTop: true,
                    preventDuplicates: false,
                    progressBar: false,
                    progressClass: 'toast-progress',
                    rtl: false
                };
            }

            function publish(args) {
                if (!listener) { return; }
                listener(args);
            }

            function notify(map) {
                var options = getOptions();
                var iconClass = map.iconClass || options.iconClass;

                if (typeof (map.optionsOverride) !== 'undefined') {
                    options = $.extend(options, map.optionsOverride);
                    iconClass = map.optionsOverride.iconClass || iconClass;
                }

                if (shouldExit(options, map)) { return; }

                toastId++;

                $container = getContainer(options, true);

                var intervalId = null;
                var $toastElement = $('<div/>');
                var $titleElement = $('<div/>');
                var $messageElement = $('<div/>');
                var $progressElement = $('<div/>');
                var $closeElement = $(options.closeHtml);
                var progressBar = {
                    intervalId: null,
                    hideEta: null,
                    maxHideTime: null
                };
                var response = {
                    toastId: toastId,
                    state: 'visible',
                    startTime: new Date(),
                    options: options,
                    map: map
                };

                personalizeToast();

                displayToast();

                handleEvents();

                publish(response);

                if (options.debug && console) {
                    console.log(response);
                }

                return $toastElement;

                function escapeHtml(source) {
                    if (source == null) {
                        source = '';
                    }

                    return source
                        .replace(/&/g, '&amp;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#39;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
                }

                function personalizeToast() {
                    setIcon();
                    setTitle();
                    setMessage();
                    setCloseButton();
                    setProgressBar();
                    setRTL();
                    setSequence();
                    setAria();
                }

                function setAria() {
                    var ariaValue = '';
                    switch (map.iconClass) {
                        case 'toast-success':
                        case 'toast-info':
                            ariaValue =  'polite';
                            break;
                        default:
                            ariaValue = 'assertive';
                    }
                    $toastElement.attr('aria-live', ariaValue);
                }

                function handleEvents() {
                    if (options.closeOnHover) {
                        $toastElement.hover(stickAround, delayedHideToast);
                    }

                    if (!options.onclick && options.tapToDismiss) {
                        $toastElement.click(hideToast);
                    }

                    if (options.closeButton && $closeElement) {
                        $closeElement.click(function (event) {
                            if (event.stopPropagation) {
                                event.stopPropagation();
                            } else if (event.cancelBubble !== undefined && event.cancelBubble !== true) {
                                event.cancelBubble = true;
                            }

                            if (options.onCloseClick) {
                                options.onCloseClick(event);
                            }

                            hideToast(true);
                        });
                    }

                    if (options.onclick) {
                        $toastElement.click(function (event) {
                            options.onclick(event);
                            hideToast();
                        });
                    }
                }

                function displayToast() {
                    $toastElement.hide();

                    $toastElement[options.showMethod](
                        {duration: options.showDuration, easing: options.showEasing, complete: options.onShown}
                    );

                    if (options.timeOut > 0) {
                        intervalId = setTimeout(hideToast, options.timeOut);
                        progressBar.maxHideTime = parseFloat(options.timeOut);
                        progressBar.hideEta = new Date().getTime() + progressBar.maxHideTime;
                        if (options.progressBar) {
                            progressBar.intervalId = setInterval(updateProgress, 10);
                        }
                    }
                }

                function setIcon() {
                    if (map.iconClass) {
                        $toastElement.addClass(options.toastClass).addClass(iconClass);
                    }
                }

                function setSequence() {
                    if (options.newestOnTop) {
                        $container.prepend($toastElement);
                    } else {
                        $container.append($toastElement);
                    }
                }

                function setTitle() {
                    if (map.title) {
                        var suffix = map.title;
                        if (options.escapeHtml) {
                            suffix = escapeHtml(map.title);
                        }
                        $titleElement.append(suffix).addClass(options.titleClass);
                        $toastElement.append($titleElement);
                    }
                }

                function setMessage() {
                    if (map.message) {
                        var suffix = map.message;
                        if (options.escapeHtml) {
                            suffix = escapeHtml(map.message);
                        }
                        $messageElement.append(suffix).addClass(options.messageClass);
                        $toastElement.append($messageElement);
                    }
                }

                function setCloseButton() {
                    if (options.closeButton) {
                        $closeElement.addClass(options.closeClass).attr('role', 'button');
                        $toastElement.prepend($closeElement);
                    }
                }

                function setProgressBar() {
                    if (options.progressBar) {
                        $progressElement.addClass(options.progressClass);
                        $toastElement.prepend($progressElement);
                    }
                }

                function setRTL() {
                    if (options.rtl) {
                        $toastElement.addClass('rtl');
                    }
                }

                function shouldExit(options, map) {
                    if (options.preventDuplicates) {
                        if (map.message === previousToast) {
                            return true;
                        } else {
                            previousToast = map.message;
                        }
                    }
                    return false;
                }

                function hideToast(override) {
                    var method = override && options.closeMethod !== false ? options.closeMethod : options.hideMethod;
                    var duration = override && options.closeDuration !== false ?
                        options.closeDuration : options.hideDuration;
                    var easing = override && options.closeEasing !== false ? options.closeEasing : options.hideEasing;
                    if ($(':focus', $toastElement).length && !override) {
                        return;
                    }
                    clearTimeout(progressBar.intervalId);
                    return $toastElement[method]({
                        duration: duration,
                        easing: easing,
                        complete: function () {
                            removeToast($toastElement);
                            clearTimeout(intervalId);
                            if (options.onHidden && response.state !== 'hidden') {
                                options.onHidden();
                            }
                            response.state = 'hidden';
                            response.endTime = new Date();
                            publish(response);
                        }
                    });
                }

                function delayedHideToast() {
                    if (options.timeOut > 0 || options.extendedTimeOut > 0) {
                        intervalId = setTimeout(hideToast, options.extendedTimeOut);
                        progressBar.maxHideTime = parseFloat(options.extendedTimeOut);
                        progressBar.hideEta = new Date().getTime() + progressBar.maxHideTime;
                    }
                }

                function stickAround() {
                    clearTimeout(intervalId);
                    progressBar.hideEta = 0;
                    $toastElement.stop(true, true)[options.showMethod](
                        {duration: options.showDuration, easing: options.showEasing}
                    );
                }

                function updateProgress() {
                    var percentage = ((progressBar.hideEta - (new Date().getTime())) / progressBar.maxHideTime) * 100;
                    $progressElement.width(percentage + '%');
                }
            }

            function getOptions() {
                return $.extend({}, getDefaults(), toastr.options);
            }

            function removeToast($toastElement) {
                if (!$container) { $container = getContainer(); }
                if ($toastElement.is(':visible')) {
                    return;
                }
                $toastElement.remove();
                $toastElement = null;
                if ($container.children().length === 0) {
                    $container.remove();
                    previousToast = undefined;
                }
            }

        })();
    });
}(typeof define === 'function' && define.amd ? define : function (deps, factory) {
    if (typeof module !== 'undefined' && module.exports) { //Node
        module.exports = factory(require('jquery'));
    } else {
        window.toastr = factory(window.jQuery);
    }
}));
;/*!
 * @fileOverview TouchSwipe - jQuery Plugin
 * @version 1.6.18
 *
 * @author Matt Bryson http://www.github.com/mattbryson
 * @see https://github.com/mattbryson/TouchSwipe-Jquery-Plugin
 * @see http://labs.rampinteractive.co.uk/touchSwipe/
 * @see http://plugins.jquery.com/project/touchSwipe
 * @license
 * Copyright (c) 2010-2015 Matt Bryson
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 */
!function(factory){"function"==typeof define&&define.amd&&define.amd.jQuery?define(["jquery"],factory):factory("undefined"!=typeof module&&module.exports?require("jquery"):jQuery)}(function($){"use strict";function init(options){return!options||void 0!==options.allowPageScroll||void 0===options.swipe&&void 0===options.swipeStatus||(options.allowPageScroll=NONE),void 0!==options.click&&void 0===options.tap&&(options.tap=options.click),options||(options={}),options=$.extend({},$.fn.swipe.defaults,options),this.each(function(){var $this=$(this),plugin=$this.data(PLUGIN_NS);plugin||(plugin=new TouchSwipe(this,options),$this.data(PLUGIN_NS,plugin))})}function TouchSwipe(element,options){function touchStart(jqEvent){if(!(getTouchInProgress()||$(jqEvent.target).closest(options.excludedElements,$element).length>0)){var event=jqEvent.originalEvent?jqEvent.originalEvent:jqEvent;if(!event.pointerType||"mouse"!=event.pointerType||0!=options.fallbackToMouseEvents){var ret,touches=event.touches,evt=touches?touches[0]:event;return phase=PHASE_START,touches?fingerCount=touches.length:options.preventDefaultEvents!==!1&&jqEvent.preventDefault(),distance=0,direction=null,currentDirection=null,pinchDirection=null,duration=0,startTouchesDistance=0,endTouchesDistance=0,pinchZoom=1,pinchDistance=0,maximumsMap=createMaximumsData(),cancelMultiFingerRelease(),createFingerData(0,evt),!touches||fingerCount===options.fingers||options.fingers===ALL_FINGERS||hasPinches()?(startTime=getTimeStamp(),2==fingerCount&&(createFingerData(1,touches[1]),startTouchesDistance=endTouchesDistance=calculateTouchesDistance(fingerData[0].start,fingerData[1].start)),(options.swipeStatus||options.pinchStatus)&&(ret=triggerHandler(event,phase))):ret=!1,ret===!1?(phase=PHASE_CANCEL,triggerHandler(event,phase),ret):(options.hold&&(holdTimeout=setTimeout($.proxy(function(){$element.trigger("hold",[event.target]),options.hold&&(ret=options.hold.call($element,event,event.target))},this),options.longTapThreshold)),setTouchInProgress(!0),null)}}}function touchMove(jqEvent){var event=jqEvent.originalEvent?jqEvent.originalEvent:jqEvent;if(phase!==PHASE_END&&phase!==PHASE_CANCEL&&!inMultiFingerRelease()){var ret,touches=event.touches,evt=touches?touches[0]:event,currentFinger=updateFingerData(evt);if(endTime=getTimeStamp(),touches&&(fingerCount=touches.length),options.hold&&clearTimeout(holdTimeout),phase=PHASE_MOVE,2==fingerCount&&(0==startTouchesDistance?(createFingerData(1,touches[1]),startTouchesDistance=endTouchesDistance=calculateTouchesDistance(fingerData[0].start,fingerData[1].start)):(updateFingerData(touches[1]),endTouchesDistance=calculateTouchesDistance(fingerData[0].end,fingerData[1].end),pinchDirection=calculatePinchDirection(fingerData[0].end,fingerData[1].end)),pinchZoom=calculatePinchZoom(startTouchesDistance,endTouchesDistance),pinchDistance=Math.abs(startTouchesDistance-endTouchesDistance)),fingerCount===options.fingers||options.fingers===ALL_FINGERS||!touches||hasPinches()){if(direction=calculateDirection(currentFinger.start,currentFinger.end),currentDirection=calculateDirection(currentFinger.last,currentFinger.end),validateDefaultEvent(jqEvent,currentDirection),distance=calculateDistance(currentFinger.start,currentFinger.end),duration=calculateDuration(),setMaxDistance(direction,distance),ret=triggerHandler(event,phase),!options.triggerOnTouchEnd||options.triggerOnTouchLeave){var inBounds=!0;if(options.triggerOnTouchLeave){var bounds=getbounds(this);inBounds=isInBounds(currentFinger.end,bounds)}!options.triggerOnTouchEnd&&inBounds?phase=getNextPhase(PHASE_MOVE):options.triggerOnTouchLeave&&!inBounds&&(phase=getNextPhase(PHASE_END)),phase!=PHASE_CANCEL&&phase!=PHASE_END||triggerHandler(event,phase)}}else phase=PHASE_CANCEL,triggerHandler(event,phase);ret===!1&&(phase=PHASE_CANCEL,triggerHandler(event,phase))}}function touchEnd(jqEvent){var event=jqEvent.originalEvent?jqEvent.originalEvent:jqEvent,touches=event.touches;if(touches){if(touches.length&&!inMultiFingerRelease())return startMultiFingerRelease(event),!0;if(touches.length&&inMultiFingerRelease())return!0}return inMultiFingerRelease()&&(fingerCount=fingerCountAtRelease),endTime=getTimeStamp(),duration=calculateDuration(),didSwipeBackToCancel()||!validateSwipeDistance()?(phase=PHASE_CANCEL,triggerHandler(event,phase)):options.triggerOnTouchEnd||options.triggerOnTouchEnd===!1&&phase===PHASE_MOVE?(options.preventDefaultEvents!==!1&&jqEvent.cancelable!==!1&&jqEvent.preventDefault(),phase=PHASE_END,triggerHandler(event,phase)):!options.triggerOnTouchEnd&&hasTap()?(phase=PHASE_END,triggerHandlerForGesture(event,phase,TAP)):phase===PHASE_MOVE&&(phase=PHASE_CANCEL,triggerHandler(event,phase)),setTouchInProgress(!1),null}function touchCancel(){fingerCount=0,endTime=0,startTime=0,startTouchesDistance=0,endTouchesDistance=0,pinchZoom=1,cancelMultiFingerRelease(),setTouchInProgress(!1)}function touchLeave(jqEvent){var event=jqEvent.originalEvent?jqEvent.originalEvent:jqEvent;options.triggerOnTouchLeave&&(phase=getNextPhase(PHASE_END),triggerHandler(event,phase))}function removeListeners(){$element.unbind(START_EV,touchStart),$element.unbind(CANCEL_EV,touchCancel),$element.unbind(MOVE_EV,touchMove),$element.unbind(END_EV,touchEnd),LEAVE_EV&&$element.unbind(LEAVE_EV,touchLeave),setTouchInProgress(!1)}function getNextPhase(currentPhase){var nextPhase=currentPhase,validTime=validateSwipeTime(),validDistance=validateSwipeDistance(),didCancel=didSwipeBackToCancel();return!validTime||didCancel?nextPhase=PHASE_CANCEL:!validDistance||currentPhase!=PHASE_MOVE||options.triggerOnTouchEnd&&!options.triggerOnTouchLeave?!validDistance&&currentPhase==PHASE_END&&options.triggerOnTouchLeave&&(nextPhase=PHASE_CANCEL):nextPhase=PHASE_END,nextPhase}function triggerHandler(event,phase){var ret,touches=event.touches;return(didSwipe()||hasSwipes())&&(ret=triggerHandlerForGesture(event,phase,SWIPE)),(didPinch()||hasPinches())&&ret!==!1&&(ret=triggerHandlerForGesture(event,phase,PINCH)),didDoubleTap()&&ret!==!1?ret=triggerHandlerForGesture(event,phase,DOUBLE_TAP):didLongTap()&&ret!==!1?ret=triggerHandlerForGesture(event,phase,LONG_TAP):didTap()&&ret!==!1&&(ret=triggerHandlerForGesture(event,phase,TAP)),phase===PHASE_CANCEL&&touchCancel(event),phase===PHASE_END&&(touches?touches.length||touchCancel(event):touchCancel(event)),ret}function triggerHandlerForGesture(event,phase,gesture){var ret;if(gesture==SWIPE){if($element.trigger("swipeStatus",[phase,direction||null,distance||0,duration||0,fingerCount,fingerData,currentDirection]),options.swipeStatus&&(ret=options.swipeStatus.call($element,event,phase,direction||null,distance||0,duration||0,fingerCount,fingerData,currentDirection),ret===!1))return!1;if(phase==PHASE_END&&validateSwipe()){if(clearTimeout(singleTapTimeout),clearTimeout(holdTimeout),$element.trigger("swipe",[direction,distance,duration,fingerCount,fingerData,currentDirection]),options.swipe&&(ret=options.swipe.call($element,event,direction,distance,duration,fingerCount,fingerData,currentDirection),ret===!1))return!1;switch(direction){case LEFT:$element.trigger("swipeLeft",[direction,distance,duration,fingerCount,fingerData,currentDirection]),options.swipeLeft&&(ret=options.swipeLeft.call($element,event,direction,distance,duration,fingerCount,fingerData,currentDirection));break;case RIGHT:$element.trigger("swipeRight",[direction,distance,duration,fingerCount,fingerData,currentDirection]),options.swipeRight&&(ret=options.swipeRight.call($element,event,direction,distance,duration,fingerCount,fingerData,currentDirection));break;case UP:$element.trigger("swipeUp",[direction,distance,duration,fingerCount,fingerData,currentDirection]),options.swipeUp&&(ret=options.swipeUp.call($element,event,direction,distance,duration,fingerCount,fingerData,currentDirection));break;case DOWN:$element.trigger("swipeDown",[direction,distance,duration,fingerCount,fingerData,currentDirection]),options.swipeDown&&(ret=options.swipeDown.call($element,event,direction,distance,duration,fingerCount,fingerData,currentDirection))}}}if(gesture==PINCH){if($element.trigger("pinchStatus",[phase,pinchDirection||null,pinchDistance||0,duration||0,fingerCount,pinchZoom,fingerData]),options.pinchStatus&&(ret=options.pinchStatus.call($element,event,phase,pinchDirection||null,pinchDistance||0,duration||0,fingerCount,pinchZoom,fingerData),ret===!1))return!1;if(phase==PHASE_END&&validatePinch())switch(pinchDirection){case IN:$element.trigger("pinchIn",[pinchDirection||null,pinchDistance||0,duration||0,fingerCount,pinchZoom,fingerData]),options.pinchIn&&(ret=options.pinchIn.call($element,event,pinchDirection||null,pinchDistance||0,duration||0,fingerCount,pinchZoom,fingerData));break;case OUT:$element.trigger("pinchOut",[pinchDirection||null,pinchDistance||0,duration||0,fingerCount,pinchZoom,fingerData]),options.pinchOut&&(ret=options.pinchOut.call($element,event,pinchDirection||null,pinchDistance||0,duration||0,fingerCount,pinchZoom,fingerData))}}return gesture==TAP?phase!==PHASE_CANCEL&&phase!==PHASE_END||(clearTimeout(singleTapTimeout),clearTimeout(holdTimeout),hasDoubleTap()&&!inDoubleTap()?(doubleTapStartTime=getTimeStamp(),singleTapTimeout=setTimeout($.proxy(function(){doubleTapStartTime=null,$element.trigger("tap",[event.target]),options.tap&&(ret=options.tap.call($element,event,event.target))},this),options.doubleTapThreshold)):(doubleTapStartTime=null,$element.trigger("tap",[event.target]),options.tap&&(ret=options.tap.call($element,event,event.target)))):gesture==DOUBLE_TAP?phase!==PHASE_CANCEL&&phase!==PHASE_END||(clearTimeout(singleTapTimeout),clearTimeout(holdTimeout),doubleTapStartTime=null,$element.trigger("doubletap",[event.target]),options.doubleTap&&(ret=options.doubleTap.call($element,event,event.target))):gesture==LONG_TAP&&(phase!==PHASE_CANCEL&&phase!==PHASE_END||(clearTimeout(singleTapTimeout),doubleTapStartTime=null,$element.trigger("longtap",[event.target]),options.longTap&&(ret=options.longTap.call($element,event,event.target)))),ret}function validateSwipeDistance(){var valid=!0;return null!==options.threshold&&(valid=distance>=options.threshold),valid}function didSwipeBackToCancel(){var cancelled=!1;return null!==options.cancelThreshold&&null!==direction&&(cancelled=getMaxDistance(direction)-distance>=options.cancelThreshold),cancelled}function validatePinchDistance(){return null===options.pinchThreshold||pinchDistance>=options.pinchThreshold}function validateSwipeTime(){var result;return result=!options.maxTimeThreshold||!(duration>=options.maxTimeThreshold)}function validateDefaultEvent(jqEvent,direction){if(options.preventDefaultEvents!==!1)if(options.allowPageScroll===NONE)jqEvent.preventDefault();else{var auto=options.allowPageScroll===AUTO;switch(direction){case LEFT:(options.swipeLeft&&auto||!auto&&options.allowPageScroll!=HORIZONTAL)&&jqEvent.preventDefault();break;case RIGHT:(options.swipeRight&&auto||!auto&&options.allowPageScroll!=HORIZONTAL)&&jqEvent.preventDefault();break;case UP:(options.swipeUp&&auto||!auto&&options.allowPageScroll!=VERTICAL)&&jqEvent.preventDefault();break;case DOWN:(options.swipeDown&&auto||!auto&&options.allowPageScroll!=VERTICAL)&&jqEvent.preventDefault();break;case NONE:}}}function validatePinch(){var hasCorrectFingerCount=validateFingers(),hasEndPoint=validateEndPoint(),hasCorrectDistance=validatePinchDistance();return hasCorrectFingerCount&&hasEndPoint&&hasCorrectDistance}function hasPinches(){return!!(options.pinchStatus||options.pinchIn||options.pinchOut)}function didPinch(){return!(!validatePinch()||!hasPinches())}function validateSwipe(){var hasValidTime=validateSwipeTime(),hasValidDistance=validateSwipeDistance(),hasCorrectFingerCount=validateFingers(),hasEndPoint=validateEndPoint(),didCancel=didSwipeBackToCancel(),valid=!didCancel&&hasEndPoint&&hasCorrectFingerCount&&hasValidDistance&&hasValidTime;return valid}function hasSwipes(){return!!(options.swipe||options.swipeStatus||options.swipeLeft||options.swipeRight||options.swipeUp||options.swipeDown)}function didSwipe(){return!(!validateSwipe()||!hasSwipes())}function validateFingers(){return fingerCount===options.fingers||options.fingers===ALL_FINGERS||!SUPPORTS_TOUCH}function validateEndPoint(){return 0!==fingerData[0].end.x}function hasTap(){return!!options.tap}function hasDoubleTap(){return!!options.doubleTap}function hasLongTap(){return!!options.longTap}function validateDoubleTap(){if(null==doubleTapStartTime)return!1;var now=getTimeStamp();return hasDoubleTap()&&now-doubleTapStartTime<=options.doubleTapThreshold}function inDoubleTap(){return validateDoubleTap()}function validateTap(){return(1===fingerCount||!SUPPORTS_TOUCH)&&(isNaN(distance)||distance<options.threshold)}function validateLongTap(){return duration>options.longTapThreshold&&distance<DOUBLE_TAP_THRESHOLD}function didTap(){return!(!validateTap()||!hasTap())}function didDoubleTap(){return!(!validateDoubleTap()||!hasDoubleTap())}function didLongTap(){return!(!validateLongTap()||!hasLongTap())}function startMultiFingerRelease(event){previousTouchEndTime=getTimeStamp(),fingerCountAtRelease=event.touches.length+1}function cancelMultiFingerRelease(){previousTouchEndTime=0,fingerCountAtRelease=0}function inMultiFingerRelease(){var withinThreshold=!1;if(previousTouchEndTime){var diff=getTimeStamp()-previousTouchEndTime;diff<=options.fingerReleaseThreshold&&(withinThreshold=!0)}return withinThreshold}function getTouchInProgress(){return!($element.data(PLUGIN_NS+"_intouch")!==!0)}function setTouchInProgress(val){$element&&(val===!0?($element.bind(MOVE_EV,touchMove),$element.bind(END_EV,touchEnd),LEAVE_EV&&$element.bind(LEAVE_EV,touchLeave)):($element.unbind(MOVE_EV,touchMove,!1),$element.unbind(END_EV,touchEnd,!1),LEAVE_EV&&$element.unbind(LEAVE_EV,touchLeave,!1)),$element.data(PLUGIN_NS+"_intouch",val===!0))}function createFingerData(id,evt){var f={start:{x:0,y:0},last:{x:0,y:0},end:{x:0,y:0}};return f.start.x=f.last.x=f.end.x=evt.pageX||evt.clientX,f.start.y=f.last.y=f.end.y=evt.pageY||evt.clientY,fingerData[id]=f,f}function updateFingerData(evt){var id=void 0!==evt.identifier?evt.identifier:0,f=getFingerData(id);return null===f&&(f=createFingerData(id,evt)),f.last.x=f.end.x,f.last.y=f.end.y,f.end.x=evt.pageX||evt.clientX,f.end.y=evt.pageY||evt.clientY,f}function getFingerData(id){return fingerData[id]||null}function setMaxDistance(direction,distance){direction!=NONE&&(distance=Math.max(distance,getMaxDistance(direction)),maximumsMap[direction].distance=distance)}function getMaxDistance(direction){if(maximumsMap[direction])return maximumsMap[direction].distance}function createMaximumsData(){var maxData={};return maxData[LEFT]=createMaximumVO(LEFT),maxData[RIGHT]=createMaximumVO(RIGHT),maxData[UP]=createMaximumVO(UP),maxData[DOWN]=createMaximumVO(DOWN),maxData}function createMaximumVO(dir){return{direction:dir,distance:0}}function calculateDuration(){return endTime-startTime}function calculateTouchesDistance(startPoint,endPoint){var diffX=Math.abs(startPoint.x-endPoint.x),diffY=Math.abs(startPoint.y-endPoint.y);return Math.round(Math.sqrt(diffX*diffX+diffY*diffY))}function calculatePinchZoom(startDistance,endDistance){var percent=endDistance/startDistance*1;return percent.toFixed(2)}function calculatePinchDirection(){return pinchZoom<1?OUT:IN}function calculateDistance(startPoint,endPoint){return Math.round(Math.sqrt(Math.pow(endPoint.x-startPoint.x,2)+Math.pow(endPoint.y-startPoint.y,2)))}function calculateAngle(startPoint,endPoint){var x=startPoint.x-endPoint.x,y=endPoint.y-startPoint.y,r=Math.atan2(y,x),angle=Math.round(180*r/Math.PI);return angle<0&&(angle=360-Math.abs(angle)),angle}function calculateDirection(startPoint,endPoint){if(comparePoints(startPoint,endPoint))return NONE;var angle=calculateAngle(startPoint,endPoint);return angle<=45&&angle>=0?LEFT:angle<=360&&angle>=315?LEFT:angle>=135&&angle<=225?RIGHT:angle>45&&angle<135?DOWN:UP}function getTimeStamp(){var now=new Date;return now.getTime()}function getbounds(el){el=$(el);var offset=el.offset(),bounds={left:offset.left,right:offset.left+el.outerWidth(),top:offset.top,bottom:offset.top+el.outerHeight()};return bounds}function isInBounds(point,bounds){return point.x>bounds.left&&point.x<bounds.right&&point.y>bounds.top&&point.y<bounds.bottom}function comparePoints(pointA,pointB){return pointA.x==pointB.x&&pointA.y==pointB.y}var options=$.extend({},options),useTouchEvents=SUPPORTS_TOUCH||SUPPORTS_POINTER||!options.fallbackToMouseEvents,START_EV=useTouchEvents?SUPPORTS_POINTER?SUPPORTS_POINTER_IE10?"MSPointerDown":"pointerdown":"touchstart":"mousedown",MOVE_EV=useTouchEvents?SUPPORTS_POINTER?SUPPORTS_POINTER_IE10?"MSPointerMove":"pointermove":"touchmove":"mousemove",END_EV=useTouchEvents?SUPPORTS_POINTER?SUPPORTS_POINTER_IE10?"MSPointerUp":"pointerup":"touchend":"mouseup",LEAVE_EV=useTouchEvents?SUPPORTS_POINTER?"mouseleave":null:"mouseleave",CANCEL_EV=SUPPORTS_POINTER?SUPPORTS_POINTER_IE10?"MSPointerCancel":"pointercancel":"touchcancel",distance=0,direction=null,currentDirection=null,duration=0,startTouchesDistance=0,endTouchesDistance=0,pinchZoom=1,pinchDistance=0,pinchDirection=0,maximumsMap=null,$element=$(element),phase="start",fingerCount=0,fingerData={},startTime=0,endTime=0,previousTouchEndTime=0,fingerCountAtRelease=0,doubleTapStartTime=0,singleTapTimeout=null,holdTimeout=null;try{$element.bind(START_EV,touchStart),$element.bind(CANCEL_EV,touchCancel)}catch(e){$.error("events not supported "+START_EV+","+CANCEL_EV+" on jQuery.swipe")}this.enable=function(){return this.disable(),$element.bind(START_EV,touchStart),$element.bind(CANCEL_EV,touchCancel),$element},this.disable=function(){return removeListeners(),$element},this.destroy=function(){removeListeners(),$element.data(PLUGIN_NS,null),$element=null},this.option=function(property,value){if("object"==typeof property)options=$.extend(options,property);else if(void 0!==options[property]){if(void 0===value)return options[property];options[property]=value}else{if(!property)return options;$.error("Option "+property+" does not exist on jQuery.swipe.options")}return null}}var VERSION="1.6.18",LEFT="left",RIGHT="right",UP="up",DOWN="down",IN="in",OUT="out",NONE="none",AUTO="auto",SWIPE="swipe",PINCH="pinch",TAP="tap",DOUBLE_TAP="doubletap",LONG_TAP="longtap",HORIZONTAL="horizontal",VERTICAL="vertical",ALL_FINGERS="all",DOUBLE_TAP_THRESHOLD=10,PHASE_START="start",PHASE_MOVE="move",PHASE_END="end",PHASE_CANCEL="cancel",SUPPORTS_TOUCH="ontouchstart"in window,SUPPORTS_POINTER_IE10=window.navigator.msPointerEnabled&&!window.navigator.pointerEnabled&&!SUPPORTS_TOUCH,SUPPORTS_POINTER=(window.navigator.pointerEnabled||window.navigator.msPointerEnabled)&&!SUPPORTS_TOUCH,PLUGIN_NS="TouchSwipe",defaults={fingers:1,threshold:75,cancelThreshold:null,pinchThreshold:20,maxTimeThreshold:null,fingerReleaseThreshold:250,longTapThreshold:500,doubleTapThreshold:200,swipe:null,swipeLeft:null,swipeRight:null,swipeUp:null,swipeDown:null,swipeStatus:null,pinchIn:null,pinchOut:null,pinchStatus:null,click:null,tap:null,doubleTap:null,longTap:null,hold:null,triggerOnTouchEnd:!0,triggerOnTouchLeave:!1,allowPageScroll:"auto",fallbackToMouseEvents:!0,excludedElements:".noSwipe",preventDefaultEvents:!0};$.fn.swipe=function(method){var $this=$(this),plugin=$this.data(PLUGIN_NS);if(plugin&&"string"==typeof method){if(plugin[method])return plugin[method].apply(plugin,Array.prototype.slice.call(arguments,1));$.error("Method "+method+" does not exist on jQuery.swipe")}else if(plugin&&"object"==typeof method)plugin.option.apply(plugin,arguments);else if(!(plugin||"object"!=typeof method&&method))return init.apply(this,arguments);return $this},$.fn.swipe.version=VERSION,$.fn.swipe.defaults=defaults,$.fn.swipe.phases={PHASE_START:PHASE_START,PHASE_MOVE:PHASE_MOVE,PHASE_END:PHASE_END,PHASE_CANCEL:PHASE_CANCEL},$.fn.swipe.directions={LEFT:LEFT,RIGHT:RIGHT,UP:UP,DOWN:DOWN,IN:IN,OUT:OUT},$.fn.swipe.pageScroll={NONE:NONE,HORIZONTAL:HORIZONTAL,VERTICAL:VERTICAL,AUTO:AUTO},$.fn.swipe.fingers={ONE:1,TWO:2,THREE:3,FOUR:4,FIVE:5,ALL:ALL_FINGERS}});;/*! Select2 4.0.5 | https://github.com/select2/select2/blob/master/LICENSE.md */!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof module&&module.exports?module.exports=function(b,c){return void 0===c&&(c="undefined"!=typeof window?require("jquery"):require("jquery")(b)),a(c),c}:a(jQuery)}(function(a){var b=function(){if(a&&a.fn&&a.fn.select2&&a.fn.select2.amd)var b=a.fn.select2.amd;var b;return function(){if(!b||!b.requirejs){b?c=b:b={};var a,c,d;!function(b){function e(a,b){return v.call(a,b)}function f(a,b){var c,d,e,f,g,h,i,j,k,l,m,n,o=b&&b.split("/"),p=t.map,q=p&&p["*"]||{};if(a){for(a=a.split("/"),g=a.length-1,t.nodeIdCompat&&x.test(a[g])&&(a[g]=a[g].replace(x,"")),"."===a[0].charAt(0)&&o&&(n=o.slice(0,o.length-1),a=n.concat(a)),k=0;k<a.length;k++)if("."===(m=a[k]))a.splice(k,1),k-=1;else if(".."===m){if(0===k||1===k&&".."===a[2]||".."===a[k-1])continue;k>0&&(a.splice(k-1,2),k-=2)}a=a.join("/")}if((o||q)&&p){for(c=a.split("/"),k=c.length;k>0;k-=1){if(d=c.slice(0,k).join("/"),o)for(l=o.length;l>0;l-=1)if((e=p[o.slice(0,l).join("/")])&&(e=e[d])){f=e,h=k;break}if(f)break;!i&&q&&q[d]&&(i=q[d],j=k)}!f&&i&&(f=i,h=j),f&&(c.splice(0,h,f),a=c.join("/"))}return a}function g(a,c){return function(){var d=w.call(arguments,0);return"string"!=typeof d[0]&&1===d.length&&d.push(null),o.apply(b,d.concat([a,c]))}}function h(a){return function(b){return f(b,a)}}function i(a){return function(b){r[a]=b}}function j(a){if(e(s,a)){var c=s[a];delete s[a],u[a]=!0,n.apply(b,c)}if(!e(r,a)&&!e(u,a))throw new Error("No "+a);return r[a]}function k(a){var b,c=a?a.indexOf("!"):-1;return c>-1&&(b=a.substring(0,c),a=a.substring(c+1,a.length)),[b,a]}function l(a){return a?k(a):[]}function m(a){return function(){return t&&t.config&&t.config[a]||{}}}var n,o,p,q,r={},s={},t={},u={},v=Object.prototype.hasOwnProperty,w=[].slice,x=/\.js$/;p=function(a,b){var c,d=k(a),e=d[0],g=b[1];return a=d[1],e&&(e=f(e,g),c=j(e)),e?a=c&&c.normalize?c.normalize(a,h(g)):f(a,g):(a=f(a,g),d=k(a),e=d[0],a=d[1],e&&(c=j(e))),{f:e?e+"!"+a:a,n:a,pr:e,p:c}},q={require:function(a){return g(a)},exports:function(a){var b=r[a];return void 0!==b?b:r[a]={}},module:function(a){return{id:a,uri:"",exports:r[a],config:m(a)}}},n=function(a,c,d,f){var h,k,m,n,o,t,v,w=[],x=typeof d;if(f=f||a,t=l(f),"undefined"===x||"function"===x){for(c=!c.length&&d.length?["require","exports","module"]:c,o=0;o<c.length;o+=1)if(n=p(c[o],t),"require"===(k=n.f))w[o]=q.require(a);else if("exports"===k)w[o]=q.exports(a),v=!0;else if("module"===k)h=w[o]=q.module(a);else if(e(r,k)||e(s,k)||e(u,k))w[o]=j(k);else{if(!n.p)throw new Error(a+" missing "+k);n.p.load(n.n,g(f,!0),i(k),{}),w[o]=r[k]}m=d?d.apply(r[a],w):void 0,a&&(h&&h.exports!==b&&h.exports!==r[a]?r[a]=h.exports:m===b&&v||(r[a]=m))}else a&&(r[a]=d)},a=c=o=function(a,c,d,e,f){if("string"==typeof a)return q[a]?q[a](c):j(p(a,l(c)).f);if(!a.splice){if(t=a,t.deps&&o(t.deps,t.callback),!c)return;c.splice?(a=c,c=d,d=null):a=b}return c=c||function(){},"function"==typeof d&&(d=e,e=f),e?n(b,a,c,d):setTimeout(function(){n(b,a,c,d)},4),o},o.config=function(a){return o(a)},a._defined=r,d=function(a,b,c){if("string"!=typeof a)throw new Error("See almond README: incorrect module build, no module name");b.splice||(c=b,b=[]),e(r,a)||e(s,a)||(s[a]=[a,b,c])},d.amd={jQuery:!0}}(),b.requirejs=a,b.require=c,b.define=d}}(),b.define("almond",function(){}),b.define("jquery",[],function(){var b=a||$;return null==b&&console&&console.error&&console.error("Select2: An instance of jQuery or a jQuery-compatible library was not found. Make sure that you are including jQuery before Select2 on your web page."),b}),b.define("select2/utils",["jquery"],function(a){function b(a){var b=a.prototype,c=[];for(var d in b){"function"==typeof b[d]&&("constructor"!==d&&c.push(d))}return c}var c={};c.Extend=function(a,b){function c(){this.constructor=a}var d={}.hasOwnProperty;for(var e in b)d.call(b,e)&&(a[e]=b[e]);return c.prototype=b.prototype,a.prototype=new c,a.__super__=b.prototype,a},c.Decorate=function(a,c){function d(){var b=Array.prototype.unshift,d=c.prototype.constructor.length,e=a.prototype.constructor;d>0&&(b.call(arguments,a.prototype.constructor),e=c.prototype.constructor),e.apply(this,arguments)}function e(){this.constructor=d}var f=b(c),g=b(a);c.displayName=a.displayName,d.prototype=new e;for(var h=0;h<g.length;h++){var i=g[h];d.prototype[i]=a.prototype[i]}for(var j=(function(a){var b=function(){};a in d.prototype&&(b=d.prototype[a]);var e=c.prototype[a];return function(){return Array.prototype.unshift.call(arguments,b),e.apply(this,arguments)}}),k=0;k<f.length;k++){var l=f[k];d.prototype[l]=j(l)}return d};var d=function(){this.listeners={}};return d.prototype.on=function(a,b){this.listeners=this.listeners||{},a in this.listeners?this.listeners[a].push(b):this.listeners[a]=[b]},d.prototype.trigger=function(a){var b=Array.prototype.slice,c=b.call(arguments,1);this.listeners=this.listeners||{},null==c&&(c=[]),0===c.length&&c.push({}),c[0]._type=a,a in this.listeners&&this.invoke(this.listeners[a],b.call(arguments,1)),"*"in this.listeners&&this.invoke(this.listeners["*"],arguments)},d.prototype.invoke=function(a,b){for(var c=0,d=a.length;c<d;c++)a[c].apply(this,b)},c.Observable=d,c.generateChars=function(a){for(var b="",c=0;c<a;c++){b+=Math.floor(36*Math.random()).toString(36)}return b},c.bind=function(a,b){return function(){a.apply(b,arguments)}},c._convertData=function(a){for(var b in a){var c=b.split("-"),d=a;if(1!==c.length){for(var e=0;e<c.length;e++){var f=c[e];f=f.substring(0,1).toLowerCase()+f.substring(1),f in d||(d[f]={}),e==c.length-1&&(d[f]=a[b]),d=d[f]}delete a[b]}}return a},c.hasScroll=function(b,c){var d=a(c),e=c.style.overflowX,f=c.style.overflowY;return(e!==f||"hidden"!==f&&"visible"!==f)&&("scroll"===e||"scroll"===f||(d.innerHeight()<c.scrollHeight||d.innerWidth()<c.scrollWidth))},c.escapeMarkup=function(a){var b={"\\":"&#92;","&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#47;"};return"string"!=typeof a?a:String(a).replace(/[&<>"'\/\\]/g,function(a){return b[a]})},c.appendMany=function(b,c){if("1.7"===a.fn.jquery.substr(0,3)){var d=a();a.map(c,function(a){d=d.add(a)}),c=d}b.append(c)},c}),b.define("select2/results",["jquery","./utils"],function(a,b){function c(a,b,d){this.$element=a,this.data=d,this.options=b,c.__super__.constructor.call(this)}return b.Extend(c,b.Observable),c.prototype.render=function(){var b=a('<ul class="select2-results__options" role="tree"></ul>');return this.options.get("multiple")&&b.attr("aria-multiselectable","true"),this.$results=b,b},c.prototype.clear=function(){this.$results.empty()},c.prototype.displayMessage=function(b){var c=this.options.get("escapeMarkup");this.clear(),this.hideLoading();var d=a('<li role="treeitem" aria-live="assertive" class="select2-results__option"></li>'),e=this.options.get("translations").get(b.message);d.append(c(e(b.args))),d[0].className+=" select2-results__message",this.$results.append(d)},c.prototype.hideMessages=function(){this.$results.find(".select2-results__message").remove()},c.prototype.append=function(a){this.hideLoading();var b=[];if(null==a.results||0===a.results.length)return void(0===this.$results.children().length&&this.trigger("results:message",{message:"noResults"}));a.results=this.sort(a.results);for(var c=0;c<a.results.length;c++){var d=a.results[c],e=this.option(d);b.push(e)}this.$results.append(b)},c.prototype.position=function(a,b){b.find(".select2-results").append(a)},c.prototype.sort=function(a){return this.options.get("sorter")(a)},c.prototype.highlightFirstItem=function(){var a=this.$results.find(".select2-results__option[aria-selected]"),b=a.filter("[aria-selected=true]");b.length>0?b.first().trigger("mouseenter"):a.first().trigger("mouseenter"),this.ensureHighlightVisible()},c.prototype.setClasses=function(){var b=this;this.data.current(function(c){var d=a.map(c,function(a){return a.id.toString()});b.$results.find(".select2-results__option[aria-selected]").each(function(){var b=a(this),c=a.data(this,"data"),e=""+c.id;null!=c.element&&c.element.selected||null==c.element&&a.inArray(e,d)>-1?b.attr("aria-selected","true"):b.attr("aria-selected","false")})})},c.prototype.showLoading=function(a){this.hideLoading();var b=this.options.get("translations").get("searching"),c={disabled:!0,loading:!0,text:b(a)},d=this.option(c);d.className+=" loading-results",this.$results.prepend(d)},c.prototype.hideLoading=function(){this.$results.find(".loading-results").remove()},c.prototype.option=function(b){var c=document.createElement("li");c.className="select2-results__option";var d={role:"treeitem","aria-selected":"false"};b.disabled&&(delete d["aria-selected"],d["aria-disabled"]="true"),null==b.id&&delete d["aria-selected"],null!=b._resultId&&(c.id=b._resultId),b.title&&(c.title=b.title),b.children&&(d.role="group",d["aria-label"]=b.text,delete d["aria-selected"]);for(var e in d){var f=d[e];c.setAttribute(e,f)}if(b.children){var g=a(c),h=document.createElement("strong");h.className="select2-results__group";a(h);this.template(b,h);for(var i=[],j=0;j<b.children.length;j++){var k=b.children[j],l=this.option(k);i.push(l)}var m=a("<ul></ul>",{class:"select2-results__options select2-results__options--nested"});m.append(i),g.append(h),g.append(m)}else this.template(b,c);return a.data(c,"data",b),c},c.prototype.bind=function(b,c){var d=this,e=b.id+"-results";this.$results.attr("id",e),b.on("results:all",function(a){d.clear(),d.append(a.data),b.isOpen()&&(d.setClasses(),d.highlightFirstItem())}),b.on("results:append",function(a){d.append(a.data),b.isOpen()&&d.setClasses()}),b.on("query",function(a){d.hideMessages(),d.showLoading(a)}),b.on("select",function(){b.isOpen()&&(d.setClasses(),d.highlightFirstItem())}),b.on("unselect",function(){b.isOpen()&&(d.setClasses(),d.highlightFirstItem())}),b.on("open",function(){d.$results.attr("aria-expanded","true"),d.$results.attr("aria-hidden","false"),d.setClasses(),d.ensureHighlightVisible()}),b.on("close",function(){d.$results.attr("aria-expanded","false"),d.$results.attr("aria-hidden","true"),d.$results.removeAttr("aria-activedescendant")}),b.on("results:toggle",function(){var a=d.getHighlightedResults();0!==a.length&&a.trigger("mouseup")}),b.on("results:select",function(){var a=d.getHighlightedResults();if(0!==a.length){var b=a.data("data");"true"==a.attr("aria-selected")?d.trigger("close",{}):d.trigger("select",{data:b})}}),b.on("results:previous",function(){var a=d.getHighlightedResults(),b=d.$results.find("[aria-selected]"),c=b.index(a);if(0!==c){var e=c-1;0===a.length&&(e=0);var f=b.eq(e);f.trigger("mouseenter");var g=d.$results.offset().top,h=f.offset().top,i=d.$results.scrollTop()+(h-g);0===e?d.$results.scrollTop(0):h-g<0&&d.$results.scrollTop(i)}}),b.on("results:next",function(){var a=d.getHighlightedResults(),b=d.$results.find("[aria-selected]"),c=b.index(a),e=c+1;if(!(e>=b.length)){var f=b.eq(e);f.trigger("mouseenter");var g=d.$results.offset().top+d.$results.outerHeight(!1),h=f.offset().top+f.outerHeight(!1),i=d.$results.scrollTop()+h-g;0===e?d.$results.scrollTop(0):h>g&&d.$results.scrollTop(i)}}),b.on("results:focus",function(a){a.element.addClass("select2-results__option--highlighted")}),b.on("results:message",function(a){d.displayMessage(a)}),a.fn.mousewheel&&this.$results.on("mousewheel",function(a){var b=d.$results.scrollTop(),c=d.$results.get(0).scrollHeight-b+a.deltaY,e=a.deltaY>0&&b-a.deltaY<=0,f=a.deltaY<0&&c<=d.$results.height();e?(d.$results.scrollTop(0),a.preventDefault(),a.stopPropagation()):f&&(d.$results.scrollTop(d.$results.get(0).scrollHeight-d.$results.height()),a.preventDefault(),a.stopPropagation())}),this.$results.on("mouseup",".select2-results__option[aria-selected]",function(b){var c=a(this),e=c.data("data");if("true"===c.attr("aria-selected"))return void(d.options.get("multiple")?d.trigger("unselect",{originalEvent:b,data:e}):d.trigger("close",{}));d.trigger("select",{originalEvent:b,data:e})}),this.$results.on("mouseenter",".select2-results__option[aria-selected]",function(b){var c=a(this).data("data");d.getHighlightedResults().removeClass("select2-results__option--highlighted"),d.trigger("results:focus",{data:c,element:a(this)})})},c.prototype.getHighlightedResults=function(){return this.$results.find(".select2-results__option--highlighted")},c.prototype.destroy=function(){this.$results.remove()},c.prototype.ensureHighlightVisible=function(){var a=this.getHighlightedResults();if(0!==a.length){var b=this.$results.find("[aria-selected]"),c=b.index(a),d=this.$results.offset().top,e=a.offset().top,f=this.$results.scrollTop()+(e-d),g=e-d;f-=2*a.outerHeight(!1),c<=2?this.$results.scrollTop(0):(g>this.$results.outerHeight()||g<0)&&this.$results.scrollTop(f)}},c.prototype.template=function(b,c){var d=this.options.get("templateResult"),e=this.options.get("escapeMarkup"),f=d(b,c);null==f?c.style.display="none":"string"==typeof f?c.innerHTML=e(f):a(c).append(f)},c}),b.define("select2/keys",[],function(){return{BACKSPACE:8,TAB:9,ENTER:13,SHIFT:16,CTRL:17,ALT:18,ESC:27,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT:37,UP:38,RIGHT:39,DOWN:40,DELETE:46}}),b.define("select2/selection/base",["jquery","../utils","../keys"],function(a,b,c){function d(a,b){this.$element=a,this.options=b,d.__super__.constructor.call(this)}return b.Extend(d,b.Observable),d.prototype.render=function(){var b=a('<span class="select2-selection" role="combobox"  aria-haspopup="true" aria-expanded="false"></span>');return this._tabindex=0,null!=this.$element.data("old-tabindex")?this._tabindex=this.$element.data("old-tabindex"):null!=this.$element.attr("tabindex")&&(this._tabindex=this.$element.attr("tabindex")),b.attr("title",this.$element.attr("title")),b.attr("tabindex",this._tabindex),this.$selection=b,b},d.prototype.bind=function(a,b){var d=this,e=(a.id,a.id+"-results");this.container=a,this.$selection.on("focus",function(a){d.trigger("focus",a)}),this.$selection.on("blur",function(a){d._handleBlur(a)}),this.$selection.on("keydown",function(a){d.trigger("keypress",a),a.which===c.SPACE&&a.preventDefault()}),a.on("results:focus",function(a){d.$selection.attr("aria-activedescendant",a.data._resultId)}),a.on("selection:update",function(a){d.update(a.data)}),a.on("open",function(){d.$selection.attr("aria-expanded","true"),d.$selection.attr("aria-owns",e),d._attachCloseHandler(a)}),a.on("close",function(){d.$selection.attr("aria-expanded","false"),d.$selection.removeAttr("aria-activedescendant"),d.$selection.removeAttr("aria-owns"),d.$selection.focus(),d._detachCloseHandler(a)}),a.on("enable",function(){d.$selection.attr("tabindex",d._tabindex)}),a.on("disable",function(){d.$selection.attr("tabindex","-1")})},d.prototype._handleBlur=function(b){var c=this;window.setTimeout(function(){document.activeElement==c.$selection[0]||a.contains(c.$selection[0],document.activeElement)||c.trigger("blur",b)},1)},d.prototype._attachCloseHandler=function(b){a(document.body).on("mousedown.select2."+b.id,function(b){var c=a(b.target),d=c.closest(".select2");a(".select2.select2-container--open").each(function(){var b=a(this);this!=d[0]&&b.data("element").select2("close")})})},d.prototype._detachCloseHandler=function(b){a(document.body).off("mousedown.select2."+b.id)},d.prototype.position=function(a,b){b.find(".selection").append(a)},d.prototype.destroy=function(){this._detachCloseHandler(this.container)},d.prototype.update=function(a){throw new Error("The `update` method must be defined in child classes.")},d}),b.define("select2/selection/single",["jquery","./base","../utils","../keys"],function(a,b,c,d){function e(){e.__super__.constructor.apply(this,arguments)}return c.Extend(e,b),e.prototype.render=function(){var a=e.__super__.render.call(this);return a.addClass("select2-selection--single"),a.html('<span class="select2-selection__rendered"></span><span class="select2-selection__arrow" role="presentation"><b role="presentation"></b></span>'),a},e.prototype.bind=function(a,b){var c=this;e.__super__.bind.apply(this,arguments);var d=a.id+"-container";this.$selection.find(".select2-selection__rendered").attr("id",d),this.$selection.attr("aria-labelledby",d),this.$selection.on("mousedown",function(a){1===a.which&&c.trigger("toggle",{originalEvent:a})}),this.$selection.on("focus",function(a){}),this.$selection.on("blur",function(a){}),a.on("focus",function(b){a.isOpen()||c.$selection.focus()}),a.on("selection:update",function(a){c.update(a.data)})},e.prototype.clear=function(){this.$selection.find(".select2-selection__rendered").empty()},e.prototype.display=function(a,b){var c=this.options.get("templateSelection");return this.options.get("escapeMarkup")(c(a,b))},e.prototype.selectionContainer=function(){return a("<span></span>")},e.prototype.update=function(a){if(0===a.length)return void this.clear();var b=a[0],c=this.$selection.find(".select2-selection__rendered"),d=this.display(b,c);c.empty().append(d),c.prop("title",b.title||b.text)},e}),b.define("select2/selection/multiple",["jquery","./base","../utils"],function(a,b,c){function d(a,b){d.__super__.constructor.apply(this,arguments)}return c.Extend(d,b),d.prototype.render=function(){var a=d.__super__.render.call(this);return a.addClass("select2-selection--multiple"),a.html('<ul class="select2-selection__rendered"></ul>'),a},d.prototype.bind=function(b,c){var e=this;d.__super__.bind.apply(this,arguments),this.$selection.on("click",function(a){e.trigger("toggle",{originalEvent:a})}),this.$selection.on("click",".select2-selection__choice__remove",function(b){if(!e.options.get("disabled")){var c=a(this),d=c.parent(),f=d.data("data");e.trigger("unselect",{originalEvent:b,data:f})}})},d.prototype.clear=function(){this.$selection.find(".select2-selection__rendered").empty()},d.prototype.display=function(a,b){var c=this.options.get("templateSelection");return this.options.get("escapeMarkup")(c(a,b))},d.prototype.selectionContainer=function(){return a('<li class="select2-selection__choice"><span class="select2-selection__choice__remove" role="presentation">&times;</span></li>')},d.prototype.update=function(a){if(this.clear(),0!==a.length){for(var b=[],d=0;d<a.length;d++){var e=a[d],f=this.selectionContainer(),g=this.display(e,f);f.append(g),f.prop("title",e.title||e.text),f.data("data",e),b.push(f)}var h=this.$selection.find(".select2-selection__rendered");c.appendMany(h,b)}},d}),b.define("select2/selection/placeholder",["../utils"],function(a){function b(a,b,c){this.placeholder=this.normalizePlaceholder(c.get("placeholder")),a.call(this,b,c)}return b.prototype.normalizePlaceholder=function(a,b){return"string"==typeof b&&(b={id:"",text:b}),b},b.prototype.createPlaceholder=function(a,b){var c=this.selectionContainer();return c.html(this.display(b)),c.addClass("select2-selection__placeholder").removeClass("select2-selection__choice"),c},b.prototype.update=function(a,b){var c=1==b.length&&b[0].id!=this.placeholder.id;if(b.length>1||c)return a.call(this,b);this.clear();var d=this.createPlaceholder(this.placeholder);this.$selection.find(".select2-selection__rendered").append(d)},b}),b.define("select2/selection/allowClear",["jquery","../keys"],function(a,b){function c(){}return c.prototype.bind=function(a,b,c){var d=this;a.call(this,b,c),null==this.placeholder&&this.options.get("debug")&&window.console&&console.error&&console.error("Select2: The `allowClear` option should be used in combination with the `placeholder` option."),this.$selection.on("mousedown",".select2-selection__clear",function(a){d._handleClear(a)}),b.on("keypress",function(a){d._handleKeyboardClear(a,b)})},c.prototype._handleClear=function(a,b){if(!this.options.get("disabled")){var c=this.$selection.find(".select2-selection__clear");if(0!==c.length){b.stopPropagation();for(var d=c.data("data"),e=0;e<d.length;e++){var f={data:d[e]};if(this.trigger("unselect",f),f.prevented)return}this.$element.val(this.placeholder.id).trigger("change"),this.trigger("toggle",{})}}},c.prototype._handleKeyboardClear=function(a,c,d){d.isOpen()||c.which!=b.DELETE&&c.which!=b.BACKSPACE||this._handleClear(c)},c.prototype.update=function(b,c){if(b.call(this,c),!(this.$selection.find(".select2-selection__placeholder").length>0||0===c.length)){var d=a('<span class="select2-selection__clear">&times;</span>');d.data("data",c),this.$selection.find(".select2-selection__rendered").prepend(d)}},c}),b.define("select2/selection/search",["jquery","../utils","../keys"],function(a,b,c){function d(a,b,c){a.call(this,b,c)}return d.prototype.render=function(b){var c=a('<li class="select2-search select2-search--inline"><input class="select2-search__field" type="search" tabindex="-1" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" role="textbox" aria-autocomplete="list" /></li>');this.$searchContainer=c,this.$search=c.find("input");var d=b.call(this);return this._transferTabIndex(),d},d.prototype.bind=function(a,b,d){var e=this;a.call(this,b,d),b.on("open",function(){e.$search.trigger("focus")}),b.on("close",function(){e.$search.val(""),e.$search.removeAttr("aria-activedescendant"),e.$search.trigger("focus")}),b.on("enable",function(){e.$search.prop("disabled",!1),e._transferTabIndex()}),b.on("disable",function(){e.$search.prop("disabled",!0)}),b.on("focus",function(a){e.$search.trigger("focus")}),b.on("results:focus",function(a){e.$search.attr("aria-activedescendant",a.id)}),this.$selection.on("focusin",".select2-search--inline",function(a){e.trigger("focus",a)}),this.$selection.on("focusout",".select2-search--inline",function(a){e._handleBlur(a)}),this.$selection.on("keydown",".select2-search--inline",function(a){if(a.stopPropagation(),e.trigger("keypress",a),e._keyUpPrevented=a.isDefaultPrevented(),a.which===c.BACKSPACE&&""===e.$search.val()){var b=e.$searchContainer.prev(".select2-selection__choice");if(b.length>0){var d=b.data("data");e.searchRemoveChoice(d),a.preventDefault()}}});var f=document.documentMode,g=f&&f<=11;this.$selection.on("input.searchcheck",".select2-search--inline",function(a){if(g)return void e.$selection.off("input.search input.searchcheck");e.$selection.off("keyup.search")}),this.$selection.on("keyup.search input.search",".select2-search--inline",function(a){if(g&&"input"===a.type)return void e.$selection.off("input.search input.searchcheck");var b=a.which;b!=c.SHIFT&&b!=c.CTRL&&b!=c.ALT&&b!=c.TAB&&e.handleSearch(a)})},d.prototype._transferTabIndex=function(a){this.$search.attr("tabindex",this.$selection.attr("tabindex")),this.$selection.attr("tabindex","-1")},d.prototype.createPlaceholder=function(a,b){this.$search.attr("placeholder",b.text)},d.prototype.update=function(a,b){var c=this.$search[0]==document.activeElement;this.$search.attr("placeholder",""),a.call(this,b),this.$selection.find(".select2-selection__rendered").append(this.$searchContainer),this.resizeSearch(),c&&this.$search.focus()},d.prototype.handleSearch=function(){if(this.resizeSearch(),!this._keyUpPrevented){var a=this.$search.val();this.trigger("query",{term:a})}this._keyUpPrevented=!1},d.prototype.searchRemoveChoice=function(a,b){this.trigger("unselect",{data:b}),this.$search.val(b.text),this.handleSearch()},d.prototype.resizeSearch=function(){this.$search.css("width","25px");var a="";if(""!==this.$search.attr("placeholder"))a=this.$selection.find(".select2-selection__rendered").innerWidth();else{a=.75*(this.$search.val().length+1)+"em"}this.$search.css("width",a)},d}),b.define("select2/selection/eventRelay",["jquery"],function(a){function b(){}return b.prototype.bind=function(b,c,d){var e=this,f=["open","opening","close","closing","select","selecting","unselect","unselecting"],g=["opening","closing","selecting","unselecting"];b.call(this,c,d),c.on("*",function(b,c){if(-1!==a.inArray(b,f)){c=c||{};var d=a.Event("select2:"+b,{params:c});e.$element.trigger(d),-1!==a.inArray(b,g)&&(c.prevented=d.isDefaultPrevented())}})},b}),b.define("select2/translation",["jquery","require"],function(a,b){function c(a){this.dict=a||{}}return c.prototype.all=function(){return this.dict},c.prototype.get=function(a){return this.dict[a]},c.prototype.extend=function(b){this.dict=a.extend({},b.all(),this.dict)},c._cache={},c.loadPath=function(a){if(!(a in c._cache)){var d=b(a);c._cache[a]=d}return new c(c._cache[a])},c}),b.define("select2/diacritics",[],function(){return{"Ⓐ":"A","Ａ":"A","À":"A","Á":"A","Â":"A","Ầ":"A","Ấ":"A","Ẫ":"A","Ẩ":"A","Ã":"A","Ā":"A","Ă":"A","Ằ":"A","Ắ":"A","Ẵ":"A","Ẳ":"A","Ȧ":"A","Ǡ":"A","Ä":"A","Ǟ":"A","Ả":"A","Å":"A","Ǻ":"A","Ǎ":"A","Ȁ":"A","Ȃ":"A","Ạ":"A","Ậ":"A","Ặ":"A","Ḁ":"A","Ą":"A","Ⱥ":"A","Ɐ":"A","Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ⓑ":"B","Ｂ":"B","Ḃ":"B","Ḅ":"B","Ḇ":"B","Ƀ":"B","Ƃ":"B","Ɓ":"B","Ⓒ":"C","Ｃ":"C","Ć":"C","Ĉ":"C","Ċ":"C","Č":"C","Ç":"C","Ḉ":"C","Ƈ":"C","Ȼ":"C","Ꜿ":"C","Ⓓ":"D","Ｄ":"D","Ḋ":"D","Ď":"D","Ḍ":"D","Ḑ":"D","Ḓ":"D","Ḏ":"D","Đ":"D","Ƌ":"D","Ɗ":"D","Ɖ":"D","Ꝺ":"D","Ǳ":"DZ","Ǆ":"DZ","ǲ":"Dz","ǅ":"Dz","Ⓔ":"E","Ｅ":"E","È":"E","É":"E","Ê":"E","Ề":"E","Ế":"E","Ễ":"E","Ể":"E","Ẽ":"E","Ē":"E","Ḕ":"E","Ḗ":"E","Ĕ":"E","Ė":"E","Ë":"E","Ẻ":"E","Ě":"E","Ȅ":"E","Ȇ":"E","Ẹ":"E","Ệ":"E","Ȩ":"E","Ḝ":"E","Ę":"E","Ḙ":"E","Ḛ":"E","Ɛ":"E","Ǝ":"E","Ⓕ":"F","Ｆ":"F","Ḟ":"F","Ƒ":"F","Ꝼ":"F","Ⓖ":"G","Ｇ":"G","Ǵ":"G","Ĝ":"G","Ḡ":"G","Ğ":"G","Ġ":"G","Ǧ":"G","Ģ":"G","Ǥ":"G","Ɠ":"G","Ꞡ":"G","Ᵹ":"G","Ꝿ":"G","Ⓗ":"H","Ｈ":"H","Ĥ":"H","Ḣ":"H","Ḧ":"H","Ȟ":"H","Ḥ":"H","Ḩ":"H","Ḫ":"H","Ħ":"H","Ⱨ":"H","Ⱶ":"H","Ɥ":"H","Ⓘ":"I","Ｉ":"I","Ì":"I","Í":"I","Î":"I","Ĩ":"I","Ī":"I","Ĭ":"I","İ":"I","Ï":"I","Ḯ":"I","Ỉ":"I","Ǐ":"I","Ȉ":"I","Ȋ":"I","Ị":"I","Į":"I","Ḭ":"I","Ɨ":"I","Ⓙ":"J","Ｊ":"J","Ĵ":"J","Ɉ":"J","Ⓚ":"K","Ｋ":"K","Ḱ":"K","Ǩ":"K","Ḳ":"K","Ķ":"K","Ḵ":"K","Ƙ":"K","Ⱪ":"K","Ꝁ":"K","Ꝃ":"K","Ꝅ":"K","Ꞣ":"K","Ⓛ":"L","Ｌ":"L","Ŀ":"L","Ĺ":"L","Ľ":"L","Ḷ":"L","Ḹ":"L","Ļ":"L","Ḽ":"L","Ḻ":"L","Ł":"L","Ƚ":"L","Ɫ":"L","Ⱡ":"L","Ꝉ":"L","Ꝇ":"L","Ꞁ":"L","Ǉ":"LJ","ǈ":"Lj","Ⓜ":"M","Ｍ":"M","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ɯ":"M","Ⓝ":"N","Ｎ":"N","Ǹ":"N","Ń":"N","Ñ":"N","Ṅ":"N","Ň":"N","Ṇ":"N","Ņ":"N","Ṋ":"N","Ṉ":"N","Ƞ":"N","Ɲ":"N","Ꞑ":"N","Ꞥ":"N","Ǌ":"NJ","ǋ":"Nj","Ⓞ":"O","Ｏ":"O","Ò":"O","Ó":"O","Ô":"O","Ồ":"O","Ố":"O","Ỗ":"O","Ổ":"O","Õ":"O","Ṍ":"O","Ȭ":"O","Ṏ":"O","Ō":"O","Ṑ":"O","Ṓ":"O","Ŏ":"O","Ȯ":"O","Ȱ":"O","Ö":"O","Ȫ":"O","Ỏ":"O","Ő":"O","Ǒ":"O","Ȍ":"O","Ȏ":"O","Ơ":"O","Ờ":"O","Ớ":"O","Ỡ":"O","Ở":"O","Ợ":"O","Ọ":"O","Ộ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Ɔ":"O","Ɵ":"O","Ꝋ":"O","Ꝍ":"O","Ƣ":"OI","Ꝏ":"OO","Ȣ":"OU","Ⓟ":"P","Ｐ":"P","Ṕ":"P","Ṗ":"P","Ƥ":"P","Ᵽ":"P","Ꝑ":"P","Ꝓ":"P","Ꝕ":"P","Ⓠ":"Q","Ｑ":"Q","Ꝗ":"Q","Ꝙ":"Q","Ɋ":"Q","Ⓡ":"R","Ｒ":"R","Ŕ":"R","Ṙ":"R","Ř":"R","Ȑ":"R","Ȓ":"R","Ṛ":"R","Ṝ":"R","Ŗ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꝛ":"R","Ꞧ":"R","Ꞃ":"R","Ⓢ":"S","Ｓ":"S","ẞ":"S","Ś":"S","Ṥ":"S","Ŝ":"S","Ṡ":"S","Š":"S","Ṧ":"S","Ṣ":"S","Ṩ":"S","Ș":"S","Ş":"S","Ȿ":"S","Ꞩ":"S","Ꞅ":"S","Ⓣ":"T","Ｔ":"T","Ṫ":"T","Ť":"T","Ṭ":"T","Ț":"T","Ţ":"T","Ṱ":"T","Ṯ":"T","Ŧ":"T","Ƭ":"T","Ʈ":"T","Ⱦ":"T","Ꞇ":"T","Ꜩ":"TZ","Ⓤ":"U","Ｕ":"U","Ù":"U","Ú":"U","Û":"U","Ũ":"U","Ṹ":"U","Ū":"U","Ṻ":"U","Ŭ":"U","Ü":"U","Ǜ":"U","Ǘ":"U","Ǖ":"U","Ǚ":"U","Ủ":"U","Ů":"U","Ű":"U","Ǔ":"U","Ȕ":"U","Ȗ":"U","Ư":"U","Ừ":"U","Ứ":"U","Ữ":"U","Ử":"U","Ự":"U","Ụ":"U","Ṳ":"U","Ų":"U","Ṷ":"U","Ṵ":"U","Ʉ":"U","Ⓥ":"V","Ｖ":"V","Ṽ":"V","Ṿ":"V","Ʋ":"V","Ꝟ":"V","Ʌ":"V","Ꝡ":"VY","Ⓦ":"W","Ｗ":"W","Ẁ":"W","Ẃ":"W","Ŵ":"W","Ẇ":"W","Ẅ":"W","Ẉ":"W","Ⱳ":"W","Ⓧ":"X","Ｘ":"X","Ẋ":"X","Ẍ":"X","Ⓨ":"Y","Ｙ":"Y","Ỳ":"Y","Ý":"Y","Ŷ":"Y","Ỹ":"Y","Ȳ":"Y","Ẏ":"Y","Ÿ":"Y","Ỷ":"Y","Ỵ":"Y","Ƴ":"Y","Ɏ":"Y","Ỿ":"Y","Ⓩ":"Z","Ｚ":"Z","Ź":"Z","Ẑ":"Z","Ż":"Z","Ž":"Z","Ẓ":"Z","Ẕ":"Z","Ƶ":"Z","Ȥ":"Z","Ɀ":"Z","Ⱬ":"Z","Ꝣ":"Z","ⓐ":"a","ａ":"a","ẚ":"a","à":"a","á":"a","â":"a","ầ":"a","ấ":"a","ẫ":"a","ẩ":"a","ã":"a","ā":"a","ă":"a","ằ":"a","ắ":"a","ẵ":"a","ẳ":"a","ȧ":"a","ǡ":"a","ä":"a","ǟ":"a","ả":"a","å":"a","ǻ":"a","ǎ":"a","ȁ":"a","ȃ":"a","ạ":"a","ậ":"a","ặ":"a","ḁ":"a","ą":"a","ⱥ":"a","ɐ":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ⓑ":"b","ｂ":"b","ḃ":"b","ḅ":"b","ḇ":"b","ƀ":"b","ƃ":"b","ɓ":"b","ⓒ":"c","ｃ":"c","ć":"c","ĉ":"c","ċ":"c","č":"c","ç":"c","ḉ":"c","ƈ":"c","ȼ":"c","ꜿ":"c","ↄ":"c","ⓓ":"d","ｄ":"d","ḋ":"d","ď":"d","ḍ":"d","ḑ":"d","ḓ":"d","ḏ":"d","đ":"d","ƌ":"d","ɖ":"d","ɗ":"d","ꝺ":"d","ǳ":"dz","ǆ":"dz","ⓔ":"e","ｅ":"e","è":"e","é":"e","ê":"e","ề":"e","ế":"e","ễ":"e","ể":"e","ẽ":"e","ē":"e","ḕ":"e","ḗ":"e","ĕ":"e","ė":"e","ë":"e","ẻ":"e","ě":"e","ȅ":"e","ȇ":"e","ẹ":"e","ệ":"e","ȩ":"e","ḝ":"e","ę":"e","ḙ":"e","ḛ":"e","ɇ":"e","ɛ":"e","ǝ":"e","ⓕ":"f","ｆ":"f","ḟ":"f","ƒ":"f","ꝼ":"f","ⓖ":"g","ｇ":"g","ǵ":"g","ĝ":"g","ḡ":"g","ğ":"g","ġ":"g","ǧ":"g","ģ":"g","ǥ":"g","ɠ":"g","ꞡ":"g","ᵹ":"g","ꝿ":"g","ⓗ":"h","ｈ":"h","ĥ":"h","ḣ":"h","ḧ":"h","ȟ":"h","ḥ":"h","ḩ":"h","ḫ":"h","ẖ":"h","ħ":"h","ⱨ":"h","ⱶ":"h","ɥ":"h","ƕ":"hv","ⓘ":"i","ｉ":"i","ì":"i","í":"i","î":"i","ĩ":"i","ī":"i","ĭ":"i","ï":"i","ḯ":"i","ỉ":"i","ǐ":"i","ȉ":"i","ȋ":"i","ị":"i","į":"i","ḭ":"i","ɨ":"i","ı":"i","ⓙ":"j","ｊ":"j","ĵ":"j","ǰ":"j","ɉ":"j","ⓚ":"k","ｋ":"k","ḱ":"k","ǩ":"k","ḳ":"k","ķ":"k","ḵ":"k","ƙ":"k","ⱪ":"k","ꝁ":"k","ꝃ":"k","ꝅ":"k","ꞣ":"k","ⓛ":"l","ｌ":"l","ŀ":"l","ĺ":"l","ľ":"l","ḷ":"l","ḹ":"l","ļ":"l","ḽ":"l","ḻ":"l","ſ":"l","ł":"l","ƚ":"l","ɫ":"l","ⱡ":"l","ꝉ":"l","ꞁ":"l","ꝇ":"l","ǉ":"lj","ⓜ":"m","ｍ":"m","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ɯ":"m","ⓝ":"n","ｎ":"n","ǹ":"n","ń":"n","ñ":"n","ṅ":"n","ň":"n","ṇ":"n","ņ":"n","ṋ":"n","ṉ":"n","ƞ":"n","ɲ":"n","ŉ":"n","ꞑ":"n","ꞥ":"n","ǌ":"nj","ⓞ":"o","ｏ":"o","ò":"o","ó":"o","ô":"o","ồ":"o","ố":"o","ỗ":"o","ổ":"o","õ":"o","ṍ":"o","ȭ":"o","ṏ":"o","ō":"o","ṑ":"o","ṓ":"o","ŏ":"o","ȯ":"o","ȱ":"o","ö":"o","ȫ":"o","ỏ":"o","ő":"o","ǒ":"o","ȍ":"o","ȏ":"o","ơ":"o","ờ":"o","ớ":"o","ỡ":"o","ở":"o","ợ":"o","ọ":"o","ộ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","ɔ":"o","ꝋ":"o","ꝍ":"o","ɵ":"o","ƣ":"oi","ȣ":"ou","ꝏ":"oo","ⓟ":"p","ｐ":"p","ṕ":"p","ṗ":"p","ƥ":"p","ᵽ":"p","ꝑ":"p","ꝓ":"p","ꝕ":"p","ⓠ":"q","ｑ":"q","ɋ":"q","ꝗ":"q","ꝙ":"q","ⓡ":"r","ｒ":"r","ŕ":"r","ṙ":"r","ř":"r","ȑ":"r","ȓ":"r","ṛ":"r","ṝ":"r","ŗ":"r","ṟ":"r","ɍ":"r","ɽ":"r","ꝛ":"r","ꞧ":"r","ꞃ":"r","ⓢ":"s","ｓ":"s","ß":"s","ś":"s","ṥ":"s","ŝ":"s","ṡ":"s","š":"s","ṧ":"s","ṣ":"s","ṩ":"s","ș":"s","ş":"s","ȿ":"s","ꞩ":"s","ꞅ":"s","ẛ":"s","ⓣ":"t","ｔ":"t","ṫ":"t","ẗ":"t","ť":"t","ṭ":"t","ț":"t","ţ":"t","ṱ":"t","ṯ":"t","ŧ":"t","ƭ":"t","ʈ":"t","ⱦ":"t","ꞇ":"t","ꜩ":"tz","ⓤ":"u","ｕ":"u","ù":"u","ú":"u","û":"u","ũ":"u","ṹ":"u","ū":"u","ṻ":"u","ŭ":"u","ü":"u","ǜ":"u","ǘ":"u","ǖ":"u","ǚ":"u","ủ":"u","ů":"u","ű":"u","ǔ":"u","ȕ":"u","ȗ":"u","ư":"u","ừ":"u","ứ":"u","ữ":"u","ử":"u","ự":"u","ụ":"u","ṳ":"u","ų":"u","ṷ":"u","ṵ":"u","ʉ":"u","ⓥ":"v","ｖ":"v","ṽ":"v","ṿ":"v","ʋ":"v","ꝟ":"v","ʌ":"v","ꝡ":"vy","ⓦ":"w","ｗ":"w","ẁ":"w","ẃ":"w","ŵ":"w","ẇ":"w","ẅ":"w","ẘ":"w","ẉ":"w","ⱳ":"w","ⓧ":"x","ｘ":"x","ẋ":"x","ẍ":"x","ⓨ":"y","ｙ":"y","ỳ":"y","ý":"y","ŷ":"y","ỹ":"y","ȳ":"y","ẏ":"y","ÿ":"y","ỷ":"y","ẙ":"y","ỵ":"y","ƴ":"y","ɏ":"y","ỿ":"y","ⓩ":"z","ｚ":"z","ź":"z","ẑ":"z","ż":"z","ž":"z","ẓ":"z","ẕ":"z","ƶ":"z","ȥ":"z","ɀ":"z","ⱬ":"z","ꝣ":"z","Ά":"Α","Έ":"Ε","Ή":"Η","Ί":"Ι","Ϊ":"Ι","Ό":"Ο","Ύ":"Υ","Ϋ":"Υ","Ώ":"Ω","ά":"α","έ":"ε","ή":"η","ί":"ι","ϊ":"ι","ΐ":"ι","ό":"ο","ύ":"υ","ϋ":"υ","ΰ":"υ","ω":"ω","ς":"σ"}}),b.define("select2/data/base",["../utils"],function(a){function b(a,c){b.__super__.constructor.call(this)}return a.Extend(b,a.Observable),b.prototype.current=function(a){throw new Error("The `current` method must be defined in child classes.")},b.prototype.query=function(a,b){throw new Error("The `query` method must be defined in child classes.")},b.prototype.bind=function(a,b){},b.prototype.destroy=function(){},b.prototype.generateResultId=function(b,c){var d=b.id+"-result-";return d+=a.generateChars(4),null!=c.id?d+="-"+c.id.toString():d+="-"+a.generateChars(4),d},b}),b.define("select2/data/select",["./base","../utils","jquery"],function(a,b,c){function d(a,b){this.$element=a,this.options=b,d.__super__.constructor.call(this)}return b.Extend(d,a),d.prototype.current=function(a){var b=[],d=this;this.$element.find(":selected").each(function(){var a=c(this),e=d.item(a);b.push(e)}),a(b)},d.prototype.select=function(a){var b=this;if(a.selected=!0,c(a.element).is("option"))return a.element.selected=!0,void this.$element.trigger("change");if(this.$element.prop("multiple"))this.current(function(d){var e=[];a=[a],a.push.apply(a,d);for(var f=0;f<a.length;f++){var g=a[f].id;-1===c.inArray(g,e)&&e.push(g)}b.$element.val(e),b.$element.trigger("change")});else{var d=a.id;this.$element.val(d),this.$element.trigger("change")}},d.prototype.unselect=function(a){var b=this;if(this.$element.prop("multiple")){if(a.selected=!1,c(a.element).is("option"))return a.element.selected=!1,void this.$element.trigger("change");this.current(function(d){for(var e=[],f=0;f<d.length;f++){var g=d[f].id;g!==a.id&&-1===c.inArray(g,e)&&e.push(g)}b.$element.val(e),b.$element.trigger("change")})}},d.prototype.bind=function(a,b){var c=this;this.container=a,a.on("select",function(a){c.select(a.data)}),a.on("unselect",function(a){c.unselect(a.data)})},d.prototype.destroy=function(){this.$element.find("*").each(function(){c.removeData(this,"data")})},d.prototype.query=function(a,b){var d=[],e=this;this.$element.children().each(function(){var b=c(this);if(b.is("option")||b.is("optgroup")){var f=e.item(b),g=e.matches(a,f);null!==g&&d.push(g)}}),b({results:d})},d.prototype.addOptions=function(a){b.appendMany(this.$element,a)},d.prototype.option=function(a){var b;a.children?(b=document.createElement("optgroup"),b.label=a.text):(b=document.createElement("option"),void 0!==b.textContent?b.textContent=a.text:b.innerText=a.text),void 0!==a.id&&(b.value=a.id),a.disabled&&(b.disabled=!0),a.selected&&(b.selected=!0),a.title&&(b.title=a.title);var d=c(b),e=this._normalizeItem(a);return e.element=b,c.data(b,"data",e),d},d.prototype.item=function(a){var b={};if(null!=(b=c.data(a[0],"data")))return b;if(a.is("option"))b={id:a.val(),text:a.text(),disabled:a.prop("disabled"),selected:a.prop("selected"),title:a.prop("title")};else if(a.is("optgroup")){b={text:a.prop("label"),children:[],title:a.prop("title")};for(var d=a.children("option"),e=[],f=0;f<d.length;f++){var g=c(d[f]),h=this.item(g);e.push(h)}b.children=e}return b=this._normalizeItem(b),b.element=a[0],c.data(a[0],"data",b),b},d.prototype._normalizeItem=function(a){c.isPlainObject(a)||(a={id:a,text:a}),a=c.extend({},{text:""},a);var b={selected:!1,disabled:!1};return null!=a.id&&(a.id=a.id.toString()),null!=a.text&&(a.text=a.text.toString()),null==a._resultId&&a.id&&null!=this.container&&(a._resultId=this.generateResultId(this.container,a)),c.extend({},b,a)},d.prototype.matches=function(a,b){return this.options.get("matcher")(a,b)},d}),b.define("select2/data/array",["./select","../utils","jquery"],function(a,b,c){function d(a,b){var c=b.get("data")||[];d.__super__.constructor.call(this,a,b),this.addOptions(this.convertToOptions(c))}return b.Extend(d,a),d.prototype.select=function(a){var b=this.$element.find("option").filter(function(b,c){return c.value==a.id.toString()});0===b.length&&(b=this.option(a),this.addOptions(b)),d.__super__.select.call(this,a)},d.prototype.convertToOptions=function(a){function d(a){return function(){return c(this).val()==a.id}}for(var e=this,f=this.$element.find("option"),g=f.map(function(){return e.item(c(this)).id}).get(),h=[],i=0;i<a.length;i++){var j=this._normalizeItem(a[i]);if(c.inArray(j.id,g)>=0){var k=f.filter(d(j)),l=this.item(k),m=c.extend(!0,{},j,l),n=this.option(m);k.replaceWith(n)}else{var o=this.option(j);if(j.children){var p=this.convertToOptions(j.children);b.appendMany(o,p)}h.push(o)}}return h},d}),b.define("select2/data/ajax",["./array","../utils","jquery"],function(a,b,c){function d(a,b){this.ajaxOptions=this._applyDefaults(b.get("ajax")),null!=this.ajaxOptions.processResults&&(this.processResults=this.ajaxOptions.processResults),d.__super__.constructor.call(this,a,b)}return b.Extend(d,a),d.prototype._applyDefaults=function(a){var b={data:function(a){return c.extend({},a,{q:a.term})},transport:function(a,b,d){var e=c.ajax(a);return e.then(b),e.fail(d),e}};return c.extend({},b,a,!0)},d.prototype.processResults=function(a){return a},d.prototype.query=function(a,b){function d(){var d=f.transport(f,function(d){var f=e.processResults(d,a);e.options.get("debug")&&window.console&&console.error&&(f&&f.results&&c.isArray(f.results)||console.error("Select2: The AJAX results did not return an array in the `results` key of the response.")),b(f)},function(){d.status&&"0"===d.status||e.trigger("results:message",{message:"errorLoading"})});e._request=d}var e=this;null!=this._request&&(c.isFunction(this._request.abort)&&this._request.abort(),this._request=null);var f=c.extend({type:"GET"},this.ajaxOptions);"function"==typeof f.url&&(f.url=f.url.call(this.$element,a)),"function"==typeof f.data&&(f.data=f.data.call(this.$element,a)),this.ajaxOptions.delay&&null!=a.term?(this._queryTimeout&&window.clearTimeout(this._queryTimeout),this._queryTimeout=window.setTimeout(d,this.ajaxOptions.delay)):d()},d}),b.define("select2/data/tags",["jquery"],function(a){function b(b,c,d){var e=d.get("tags"),f=d.get("createTag");void 0!==f&&(this.createTag=f);var g=d.get("insertTag");if(void 0!==g&&(this.insertTag=g),b.call(this,c,d),a.isArray(e))for(var h=0;h<e.length;h++){var i=e[h],j=this._normalizeItem(i),k=this.option(j);this.$element.append(k)}}return b.prototype.query=function(a,b,c){function d(a,f){for(var g=a.results,h=0;h<g.length;h++){var i=g[h],j=null!=i.children&&!d({results:i.children},!0);if((i.text||"").toUpperCase()===(b.term||"").toUpperCase()||j)return!f&&(a.data=g,void c(a))}if(f)return!0;var k=e.createTag(b);if(null!=k){var l=e.option(k);l.attr("data-select2-tag",!0),e.addOptions([l]),e.insertTag(g,k)}a.results=g,c(a)}var e=this;if(this._removeOldTags(),null==b.term||null!=b.page)return void a.call(this,b,c);a.call(this,b,d)},b.prototype.createTag=function(b,c){var d=a.trim(c.term);return""===d?null:{id:d,text:d}},b.prototype.insertTag=function(a,b,c){b.unshift(c)},b.prototype._removeOldTags=function(b){this._lastTag;this.$element.find("option[data-select2-tag]").each(function(){this.selected||a(this).remove()})},b}),b.define("select2/data/tokenizer",["jquery"],function(a){function b(a,b,c){var d=c.get("tokenizer");void 0!==d&&(this.tokenizer=d),a.call(this,b,c)}return b.prototype.bind=function(a,b,c){a.call(this,b,c),this.$search=b.dropdown.$search||b.selection.$search||c.find(".select2-search__field")},b.prototype.query=function(b,c,d){function e(b){var c=g._normalizeItem(b);if(!g.$element.find("option").filter(function(){return a(this).val()===c.id}).length){var d=g.option(c);d.attr("data-select2-tag",!0),g._removeOldTags(),g.addOptions([d])}f(c)}function f(a){g.trigger("select",{data:a})}var g=this;c.term=c.term||"";var h=this.tokenizer(c,this.options,e);h.term!==c.term&&(this.$search.length&&(this.$search.val(h.term),this.$search.focus()),c.term=h.term),b.call(this,c,d)},b.prototype.tokenizer=function(b,c,d,e){for(var f=d.get("tokenSeparators")||[],g=c.term,h=0,i=this.createTag||function(a){return{id:a.term,text:a.term}};h<g.length;){var j=g[h];if(-1!==a.inArray(j,f)){var k=g.substr(0,h),l=a.extend({},c,{term:k}),m=i(l);null!=m?(e(m),g=g.substr(h+1)||"",h=0):h++}else h++}return{term:g}},b}),b.define("select2/data/minimumInputLength",[],function(){function a(a,b,c){this.minimumInputLength=c.get("minimumInputLength"),a.call(this,b,c)}return a.prototype.query=function(a,b,c){if(b.term=b.term||"",b.term.length<this.minimumInputLength)return void this.trigger("results:message",{message:"inputTooShort",args:{minimum:this.minimumInputLength,input:b.term,params:b}});a.call(this,b,c)},a}),b.define("select2/data/maximumInputLength",[],function(){function a(a,b,c){this.maximumInputLength=c.get("maximumInputLength"),a.call(this,b,c)}return a.prototype.query=function(a,b,c){if(b.term=b.term||"",this.maximumInputLength>0&&b.term.length>this.maximumInputLength)return void this.trigger("results:message",{message:"inputTooLong",args:{maximum:this.maximumInputLength,input:b.term,params:b}});a.call(this,b,c)},a}),b.define("select2/data/maximumSelectionLength",[],function(){function a(a,b,c){this.maximumSelectionLength=c.get("maximumSelectionLength"),a.call(this,b,c)}return a.prototype.query=function(a,b,c){var d=this;this.current(function(e){var f=null!=e?e.length:0;if(d.maximumSelectionLength>0&&f>=d.maximumSelectionLength)return void d.trigger("results:message",{message:"maximumSelected",args:{maximum:d.maximumSelectionLength}});a.call(d,b,c)})},a}),b.define("select2/dropdown",["jquery","./utils"],function(a,b){function c(a,b){this.$element=a,this.options=b,c.__super__.constructor.call(this)}return b.Extend(c,b.Observable),c.prototype.render=function(){var b=a('<span class="select2-dropdown"><span class="select2-results"></span></span>');return b.attr("dir",this.options.get("dir")),this.$dropdown=b,b},c.prototype.bind=function(){},c.prototype.position=function(a,b){},c.prototype.destroy=function(){this.$dropdown.remove()},c}),b.define("select2/dropdown/search",["jquery","../utils"],function(a,b){function c(){}return c.prototype.render=function(b){var c=b.call(this),d=a('<span class="select2-search select2-search--dropdown"><input class="select2-search__field" type="search" tabindex="-1" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" role="textbox" /></span>');return this.$searchContainer=d,this.$search=d.find("input"),c.prepend(d),c},c.prototype.bind=function(b,c,d){var e=this;b.call(this,c,d),this.$search.on("keydown",function(a){e.trigger("keypress",a),e._keyUpPrevented=a.isDefaultPrevented()}),this.$search.on("input",function(b){a(this).off("keyup")}),this.$search.on("keyup input",function(a){e.handleSearch(a)}),c.on("open",function(){e.$search.attr("tabindex",0),e.$search.focus(),window.setTimeout(function(){e.$search.focus()},0)}),c.on("close",function(){e.$search.attr("tabindex",-1),e.$search.val("")}),c.on("focus",function(){c.isOpen()||e.$search.focus()}),c.on("results:all",function(a){if(null==a.query.term||""===a.query.term){e.showSearch(a)?e.$searchContainer.removeClass("select2-search--hide"):e.$searchContainer.addClass("select2-search--hide")}})},c.prototype.handleSearch=function(a){if(!this._keyUpPrevented){var b=this.$search.val();this.trigger("query",{term:b})}this._keyUpPrevented=!1},c.prototype.showSearch=function(a,b){return!0},c}),b.define("select2/dropdown/hidePlaceholder",[],function(){function a(a,b,c,d){this.placeholder=this.normalizePlaceholder(c.get("placeholder")),a.call(this,b,c,d)}return a.prototype.append=function(a,b){b.results=this.removePlaceholder(b.results),a.call(this,b)},a.prototype.normalizePlaceholder=function(a,b){return"string"==typeof b&&(b={id:"",text:b}),b},a.prototype.removePlaceholder=function(a,b){for(var c=b.slice(0),d=b.length-1;d>=0;d--){var e=b[d];this.placeholder.id===e.id&&c.splice(d,1)}return c},a}),b.define("select2/dropdown/infiniteScroll",["jquery"],function(a){function b(a,b,c,d){this.lastParams={},a.call(this,b,c,d),this.$loadingMore=this.createLoadingMore(),this.loading=!1}return b.prototype.append=function(a,b){this.$loadingMore.remove(),this.loading=!1,a.call(this,b),this.showLoadingMore(b)&&this.$results.append(this.$loadingMore)},b.prototype.bind=function(b,c,d){var e=this;b.call(this,c,d),c.on("query",function(a){e.lastParams=a,e.loading=!0}),c.on("query:append",function(a){e.lastParams=a,e.loading=!0}),this.$results.on("scroll",function(){var b=a.contains(document.documentElement,e.$loadingMore[0]);if(!e.loading&&b){e.$results.offset().top+e.$results.outerHeight(!1)+50>=e.$loadingMore.offset().top+e.$loadingMore.outerHeight(!1)&&e.loadMore()}})},b.prototype.loadMore=function(){this.loading=!0;var b=a.extend({},{page:1},this.lastParams);b.page++,this.trigger("query:append",b)},b.prototype.showLoadingMore=function(a,b){return b.pagination&&b.pagination.more},b.prototype.createLoadingMore=function(){var b=a('<li class="select2-results__option select2-results__option--load-more"role="treeitem" aria-disabled="true"></li>'),c=this.options.get("translations").get("loadingMore");return b.html(c(this.lastParams)),b},b}),b.define("select2/dropdown/attachBody",["jquery","../utils"],function(a,b){function c(b,c,d){this.$dropdownParent=d.get("dropdownParent")||a(document.body),b.call(this,c,d)}return c.prototype.bind=function(a,b,c){var d=this,e=!1;a.call(this,b,c),b.on("open",function(){d._showDropdown(),d._attachPositioningHandler(b),e||(e=!0,b.on("results:all",function(){d._positionDropdown(),d._resizeDropdown()}),b.on("results:append",function(){d._positionDropdown(),d._resizeDropdown()}))}),b.on("close",function(){d._hideDropdown(),d._detachPositioningHandler(b)}),this.$dropdownContainer.on("mousedown",function(a){a.stopPropagation()})},c.prototype.destroy=function(a){a.call(this),this.$dropdownContainer.remove()},c.prototype.position=function(a,b,c){b.attr("class",c.attr("class")),b.removeClass("select2"),b.addClass("select2-container--open"),b.css({position:"absolute",top:-999999}),this.$container=c},c.prototype.render=function(b){var c=a("<span></span>"),d=b.call(this);return c.append(d),this.$dropdownContainer=c,c},c.prototype._hideDropdown=function(a){this.$dropdownContainer.detach()},c.prototype._attachPositioningHandler=function(c,d){var e=this,f="scroll.select2."+d.id,g="resize.select2."+d.id,h="orientationchange.select2."+d.id,i=this.$container.parents().filter(b.hasScroll);i.each(function(){a(this).data("select2-scroll-position",{x:a(this).scrollLeft(),y:a(this).scrollTop()})}),i.on(f,function(b){var c=a(this).data("select2-scroll-position");a(this).scrollTop(c.y)}),a(window).on(f+" "+g+" "+h,function(a){e._positionDropdown(),e._resizeDropdown()})},c.prototype._detachPositioningHandler=function(c,d){var e="scroll.select2."+d.id,f="resize.select2."+d.id,g="orientationchange.select2."+d.id;this.$container.parents().filter(b.hasScroll).off(e),a(window).off(e+" "+f+" "+g)},c.prototype._positionDropdown=function(){var b=a(window),c=this.$dropdown.hasClass("select2-dropdown--above"),d=this.$dropdown.hasClass("select2-dropdown--below"),e=null,f=this.$container.offset();f.bottom=f.top+this.$container.outerHeight(!1);var g={height:this.$container.outerHeight(!1)};g.top=f.top,g.bottom=f.top+g.height;var h={height:this.$dropdown.outerHeight(!1)},i={top:b.scrollTop(),bottom:b.scrollTop()+b.height()},j=i.top<f.top-h.height,k=i.bottom>f.bottom+h.height,l={left:f.left,top:g.bottom},m=this.$dropdownParent;"static"===m.css("position")&&(m=m.offsetParent());var n=m.offset();l.top-=n.top,l.left-=n.left,c||d||(e="below"),k||!j||c?!j&&k&&c&&(e="below"):e="above",("above"==e||c&&"below"!==e)&&(l.top=g.top-n.top-h.height),null!=e&&(this.$dropdown.removeClass("select2-dropdown--below select2-dropdown--above").addClass("select2-dropdown--"+e),this.$container.removeClass("select2-container--below select2-container--above").addClass("select2-container--"+e)),this.$dropdownContainer.css(l)},c.prototype._resizeDropdown=function(){var a={width:this.$container.outerWidth(!1)+"px"};this.options.get("dropdownAutoWidth")&&(a.minWidth=a.width,a.position="relative",a.width="auto"),this.$dropdown.css(a)},c.prototype._showDropdown=function(a){this.$dropdownContainer.appendTo(this.$dropdownParent),this._positionDropdown(),this._resizeDropdown()},c}),b.define("select2/dropdown/minimumResultsForSearch",[],function(){function a(b){for(var c=0,d=0;d<b.length;d++){var e=b[d];e.children?c+=a(e.children):c++}return c}function b(a,b,c,d){this.minimumResultsForSearch=c.get("minimumResultsForSearch"),this.minimumResultsForSearch<0&&(this.minimumResultsForSearch=1/0),a.call(this,b,c,d)}return b.prototype.showSearch=function(b,c){return!(a(c.data.results)<this.minimumResultsForSearch)&&b.call(this,c)},b}),b.define("select2/dropdown/selectOnClose",[],function(){function a(){}return a.prototype.bind=function(a,b,c){var d=this;a.call(this,b,c),b.on("close",function(a){d._handleSelectOnClose(a)})},a.prototype._handleSelectOnClose=function(a,b){if(b&&null!=b.originalSelect2Event){var c=b.originalSelect2Event;if("select"===c._type||"unselect"===c._type)return}var d=this.getHighlightedResults();if(!(d.length<1)){var e=d.data("data");null!=e.element&&e.element.selected||null==e.element&&e.selected||this.trigger("select",{data:e})}},a}),b.define("select2/dropdown/closeOnSelect",[],function(){function a(){}return a.prototype.bind=function(a,b,c){var d=this;a.call(this,b,c),b.on("select",function(a){d._selectTriggered(a)}),b.on("unselect",function(a){d._selectTriggered(a)})},a.prototype._selectTriggered=function(a,b){var c=b.originalEvent;c&&c.ctrlKey||this.trigger("close",{originalEvent:c,originalSelect2Event:b})},a}),b.define("select2/i18n/en",[],function(){return{errorLoading:function(){return"The results could not be loaded."},inputTooLong:function(a){var b=a.input.length-a.maximum,c="Please delete "+b+" character";return 1!=b&&(c+="s"),c},inputTooShort:function(a){return"Please enter "+(a.minimum-a.input.length)+" or more characters"},loadingMore:function(){return"Loading more results…"},maximumSelected:function(a){var b="You can only select "+a.maximum+" item";return 1!=a.maximum&&(b+="s"),b},noResults:function(){return"No results found"},searching:function(){return"Searching…"}}}),b.define("select2/defaults",["jquery","require","./results","./selection/single","./selection/multiple","./selection/placeholder","./selection/allowClear","./selection/search","./selection/eventRelay","./utils","./translation","./diacritics","./data/select","./data/array","./data/ajax","./data/tags","./data/tokenizer","./data/minimumInputLength","./data/maximumInputLength","./data/maximumSelectionLength","./dropdown","./dropdown/search","./dropdown/hidePlaceholder","./dropdown/infiniteScroll","./dropdown/attachBody","./dropdown/minimumResultsForSearch","./dropdown/selectOnClose","./dropdown/closeOnSelect","./i18n/en"],function(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C){function D(){this.reset()}return D.prototype.apply=function(l){if(l=a.extend(!0,{},this.defaults,l),null==l.dataAdapter){if(null!=l.ajax?l.dataAdapter=o:null!=l.data?l.dataAdapter=n:l.dataAdapter=m,l.minimumInputLength>0&&(l.dataAdapter=j.Decorate(l.dataAdapter,r)),l.maximumInputLength>0&&(l.dataAdapter=j.Decorate(l.dataAdapter,s)),l.maximumSelectionLength>0&&(l.dataAdapter=j.Decorate(l.dataAdapter,t)),l.tags&&(l.dataAdapter=j.Decorate(l.dataAdapter,p)),null==l.tokenSeparators&&null==l.tokenizer||(l.dataAdapter=j.Decorate(l.dataAdapter,q)),null!=l.query){var C=b(l.amdBase+"compat/query");l.dataAdapter=j.Decorate(l.dataAdapter,C)}if(null!=l.initSelection){var D=b(l.amdBase+"compat/initSelection");l.dataAdapter=j.Decorate(l.dataAdapter,D)}}if(null==l.resultsAdapter&&(l.resultsAdapter=c,null!=l.ajax&&(l.resultsAdapter=j.Decorate(l.resultsAdapter,x)),null!=l.placeholder&&(l.resultsAdapter=j.Decorate(l.resultsAdapter,w)),l.selectOnClose&&(l.resultsAdapter=j.Decorate(l.resultsAdapter,A))),null==l.dropdownAdapter){if(l.multiple)l.dropdownAdapter=u;else{var E=j.Decorate(u,v);l.dropdownAdapter=E}if(0!==l.minimumResultsForSearch&&(l.dropdownAdapter=j.Decorate(l.dropdownAdapter,z)),l.closeOnSelect&&(l.dropdownAdapter=j.Decorate(l.dropdownAdapter,B)),null!=l.dropdownCssClass||null!=l.dropdownCss||null!=l.adaptDropdownCssClass){var F=b(l.amdBase+"compat/dropdownCss");l.dropdownAdapter=j.Decorate(l.dropdownAdapter,F)}l.dropdownAdapter=j.Decorate(l.dropdownAdapter,y)}if(null==l.selectionAdapter){if(l.multiple?l.selectionAdapter=e:l.selectionAdapter=d,null!=l.placeholder&&(l.selectionAdapter=j.Decorate(l.selectionAdapter,f)),l.allowClear&&(l.selectionAdapter=j.Decorate(l.selectionAdapter,g)),l.multiple&&(l.selectionAdapter=j.Decorate(l.selectionAdapter,h)),null!=l.containerCssClass||null!=l.containerCss||null!=l.adaptContainerCssClass){var G=b(l.amdBase+"compat/containerCss");l.selectionAdapter=j.Decorate(l.selectionAdapter,G)}l.selectionAdapter=j.Decorate(l.selectionAdapter,i)}if("string"==typeof l.language)if(l.language.indexOf("-")>0){var H=l.language.split("-"),I=H[0];l.language=[l.language,I]}else l.language=[l.language];if(a.isArray(l.language)){var J=new k;l.language.push("en");for(var K=l.language,L=0;L<K.length;L++){var M=K[L],N={};try{N=k.loadPath(M)}catch(a){try{M=this.defaults.amdLanguageBase+M,N=k.loadPath(M)}catch(a){l.debug&&window.console&&console.warn&&console.warn('Select2: The language file for "'+M+'" could not be automatically loaded. A fallback will be used instead.');continue}}J.extend(N)}l.translations=J}else{var O=k.loadPath(this.defaults.amdLanguageBase+"en"),P=new k(l.language);P.extend(O),l.translations=P}return l},D.prototype.reset=function(){function b(a){function b(a){return l[a]||a}return a.replace(/[^\u0000-\u007E]/g,b)}function c(d,e){if(""===a.trim(d.term))return e;if(e.children&&e.children.length>0){for(var f=a.extend(!0,{},e),g=e.children.length-1;g>=0;g--){null==c(d,e.children[g])&&f.children.splice(g,1)}return f.children.length>0?f:c(d,f)}var h=b(e.text).toUpperCase(),i=b(d.term).toUpperCase();return h.indexOf(i)>-1?e:null}this.defaults={amdBase:"./",amdLanguageBase:"./i18n/",closeOnSelect:!0,debug:!1,dropdownAutoWidth:!1,escapeMarkup:j.escapeMarkup,language:C,matcher:c,minimumInputLength:0,maximumInputLength:0,maximumSelectionLength:0,minimumResultsForSearch:0,selectOnClose:!1,sorter:function(a){return a},templateResult:function(a){return a.text},templateSelection:function(a){return a.text},theme:"default",width:"resolve"}},D.prototype.set=function(b,c){var d=a.camelCase(b),e={};e[d]=c;var f=j._convertData(e);a.extend(this.defaults,f)},new D}),b.define("select2/options",["require","jquery","./defaults","./utils"],function(a,b,c,d){function e(b,e){if(this.options=b,null!=e&&this.fromElement(e),this.options=c.apply(this.options),e&&e.is("input")){var f=a(this.get("amdBase")+"compat/inputData");this.options.dataAdapter=d.Decorate(this.options.dataAdapter,f)}}return e.prototype.fromElement=function(a){var c=["select2"];null==this.options.multiple&&(this.options.multiple=a.prop("multiple")),null==this.options.disabled&&(this.options.disabled=a.prop("disabled")),null==this.options.language&&(a.prop("lang")?this.options.language=a.prop("lang").toLowerCase():a.closest("[lang]").prop("lang")&&(this.options.language=a.closest("[lang]").prop("lang"))),null==this.options.dir&&(a.prop("dir")?this.options.dir=a.prop("dir"):a.closest("[dir]").prop("dir")?this.options.dir=a.closest("[dir]").prop("dir"):this.options.dir="ltr"),a.prop("disabled",this.options.disabled),a.prop("multiple",this.options.multiple),a.data("select2Tags")&&(this.options.debug&&window.console&&console.warn&&console.warn('Select2: The `data-select2-tags` attribute has been changed to use the `data-data` and `data-tags="true"` attributes and will be removed in future versions of Select2.'),a.data("data",a.data("select2Tags")),a.data("tags",!0)),a.data("ajaxUrl")&&(this.options.debug&&window.console&&console.warn&&console.warn("Select2: The `data-ajax-url` attribute has been changed to `data-ajax--url` and support for the old attribute will be removed in future versions of Select2."),a.attr("ajax--url",a.data("ajaxUrl")),a.data("ajax--url",a.data("ajaxUrl")));var e={};e=b.fn.jquery&&"1."==b.fn.jquery.substr(0,2)&&a[0].dataset?b.extend(!0,{},a[0].dataset,a.data()):a.data();var f=b.extend(!0,{},e);f=d._convertData(f);for(var g in f)b.inArray(g,c)>-1||(b.isPlainObject(this.options[g])?b.extend(this.options[g],f[g]):this.options[g]=f[g]);return this},e.prototype.get=function(a){return this.options[a]},e.prototype.set=function(a,b){this.options[a]=b},e}),b.define("select2/core",["jquery","./options","./utils","./keys"],function(a,b,c,d){var e=function(a,c){null!=a.data("select2")&&a.data("select2").destroy(),this.$element=a,this.id=this._generateId(a),c=c||{},this.options=new b(c,a),e.__super__.constructor.call(this);var d=a.attr("tabindex")||0;a.data("old-tabindex",d),a.attr("tabindex","-1");var f=this.options.get("dataAdapter");this.dataAdapter=new f(a,this.options);var g=this.render();this._placeContainer(g);var h=this.options.get("selectionAdapter");this.selection=new h(a,this.options),this.$selection=this.selection.render(),this.selection.position(this.$selection,g);var i=this.options.get("dropdownAdapter");this.dropdown=new i(a,this.options),this.$dropdown=this.dropdown.render(),this.dropdown.position(this.$dropdown,g);var j=this.options.get("resultsAdapter");this.results=new j(a,this.options,this.dataAdapter),this.$results=this.results.render(),this.results.position(this.$results,this.$dropdown);var k=this;this._bindAdapters(),this._registerDomEvents(),this._registerDataEvents(),this._registerSelectionEvents(),this._registerDropdownEvents(),this._registerResultsEvents(),this._registerEvents(),this.dataAdapter.current(function(a){k.trigger("selection:update",{data:a})}),a.addClass("select2-hidden-accessible"),a.attr("aria-hidden","true"),this._syncAttributes(),a.data("select2",this)};return c.Extend(e,c.Observable),e.prototype._generateId=function(a){var b="";return b=null!=a.attr("id")?a.attr("id"):null!=a.attr("name")?a.attr("name")+"-"+c.generateChars(2):c.generateChars(4),b=b.replace(/(:|\.|\[|\]|,)/g,""),b="select2-"+b},e.prototype._placeContainer=function(a){a.insertAfter(this.$element);var b=this._resolveWidth(this.$element,this.options.get("width"));null!=b&&a.css("width",b)},e.prototype._resolveWidth=function(a,b){var c=/^width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/i;if("resolve"==b){var d=this._resolveWidth(a,"style");return null!=d?d:this._resolveWidth(a,"element")}if("element"==b){var e=a.outerWidth(!1);return e<=0?"auto":e+"px"}if("style"==b){var f=a.attr("style");if("string"!=typeof f)return null;for(var g=f.split(";"),h=0,i=g.length;h<i;h+=1){var j=g[h].replace(/\s/g,""),k=j.match(c);if(null!==k&&k.length>=1)return k[1]}return null}return b},e.prototype._bindAdapters=function(){this.dataAdapter.bind(this,this.$container),this.selection.bind(this,this.$container),this.dropdown.bind(this,this.$container),this.results.bind(this,this.$container)},e.prototype._registerDomEvents=function(){var b=this;this.$element.on("change.select2",function(){b.dataAdapter.current(function(a){b.trigger("selection:update",{data:a})})}),this.$element.on("focus.select2",function(a){b.trigger("focus",a)}),this._syncA=c.bind(this._syncAttributes,this),this._syncS=c.bind(this._syncSubtree,this),this.$element[0].attachEvent&&this.$element[0].attachEvent("onpropertychange",this._syncA);var d=window.MutationObserver||window.WebKitMutationObserver||window.MozMutationObserver;null!=d?(this._observer=new d(function(c){a.each(c,b._syncA),a.each(c,b._syncS)}),this._observer.observe(this.$element[0],{attributes:!0,childList:!0,subtree:!1})):this.$element[0].addEventListener&&(this.$element[0].addEventListener("DOMAttrModified",b._syncA,!1),this.$element[0].addEventListener("DOMNodeInserted",b._syncS,!1),this.$element[0].addEventListener("DOMNodeRemoved",b._syncS,!1))},e.prototype._registerDataEvents=function(){var a=this;this.dataAdapter.on("*",function(b,c){a.trigger(b,c)})},e.prototype._registerSelectionEvents=function(){var b=this,c=["toggle","focus"];this.selection.on("toggle",function(){b.toggleDropdown()}),this.selection.on("focus",function(a){b.focus(a)}),this.selection.on("*",function(d,e){-1===a.inArray(d,c)&&b.trigger(d,e)})},e.prototype._registerDropdownEvents=function(){var a=this;this.dropdown.on("*",function(b,c){a.trigger(b,c)})},e.prototype._registerResultsEvents=function(){var a=this;this.results.on("*",function(b,c){a.trigger(b,c)})},e.prototype._registerEvents=function(){var a=this;this.on("open",function(){a.$container.addClass("select2-container--open")}),this.on("close",function(){a.$container.removeClass("select2-container--open")}),this.on("enable",function(){a.$container.removeClass("select2-container--disabled")}),this.on("disable",function(){a.$container.addClass("select2-container--disabled")}),this.on("blur",function(){a.$container.removeClass("select2-container--focus")}),this.on("query",function(b){a.isOpen()||a.trigger("open",{}),this.dataAdapter.query(b,function(c){a.trigger("results:all",{data:c,query:b})})}),this.on("query:append",function(b){this.dataAdapter.query(b,function(c){a.trigger("results:append",{data:c,query:b})})}),this.on("keypress",function(b){var c=b.which;a.isOpen()?c===d.ESC||c===d.TAB||c===d.UP&&b.altKey?(a.close(),b.preventDefault()):c===d.ENTER?(a.trigger("results:select",{}),b.preventDefault()):c===d.SPACE&&b.ctrlKey?(a.trigger("results:toggle",{}),b.preventDefault()):c===d.UP?(a.trigger("results:previous",{}),b.preventDefault()):c===d.DOWN&&(a.trigger("results:next",{}),b.preventDefault()):(c===d.ENTER||c===d.SPACE||c===d.DOWN&&b.altKey)&&(a.open(),b.preventDefault())})},e.prototype._syncAttributes=function(){this.options.set("disabled",this.$element.prop("disabled")),this.options.get("disabled")?(this.isOpen()&&this.close(),this.trigger("disable",{})):this.trigger("enable",{})},e.prototype._syncSubtree=function(a,b){var c=!1,d=this;if(!a||!a.target||"OPTION"===a.target.nodeName||"OPTGROUP"===a.target.nodeName){if(b)if(b.addedNodes&&b.addedNodes.length>0)for(var e=0;e<b.addedNodes.length;e++){var f=b.addedNodes[e];f.selected&&(c=!0)}else b.removedNodes&&b.removedNodes.length>0&&(c=!0);else c=!0;c&&this.dataAdapter.current(function(a){d.trigger("selection:update",{data:a})})}},e.prototype.trigger=function(a,b){var c=e.__super__.trigger,d={open:"opening",close:"closing",select:"selecting",unselect:"unselecting"};if(void 0===b&&(b={}),a in d){var f=d[a],g={prevented:!1,name:a,args:b};if(c.call(this,f,g),g.prevented)return void(b.prevented=!0)}c.call(this,a,b)},e.prototype.toggleDropdown=function(){this.options.get("disabled")||(this.isOpen()?this.close():this.open())},e.prototype.open=function(){this.isOpen()||this.trigger("query",{})},e.prototype.close=function(){this.isOpen()&&this.trigger("close",{})},e.prototype.isOpen=function(){return this.$container.hasClass("select2-container--open")},e.prototype.hasFocus=function(){return this.$container.hasClass("select2-container--focus")},e.prototype.focus=function(a){this.hasFocus()||(this.$container.addClass("select2-container--focus"),this.trigger("focus",{}))},e.prototype.enable=function(a){this.options.get("debug")&&window.console&&console.warn&&console.warn('Select2: The `select2("enable")` method has been deprecated and will be removed in later Select2 versions. Use $element.prop("disabled") instead.'),null!=a&&0!==a.length||(a=[!0]);var b=!a[0];this.$element.prop("disabled",b)},e.prototype.data=function(){this.options.get("debug")&&arguments.length>0&&window.console&&console.warn&&console.warn('Select2: Data can no longer be set using `select2("data")`. You should consider setting the value instead using `$element.val()`.');var a=[];return this.dataAdapter.current(function(b){a=b}),a},e.prototype.val=function(b){if(this.options.get("debug")&&window.console&&console.warn&&console.warn('Select2: The `select2("val")` method has been deprecated and will be removed in later Select2 versions. Use $element.val() instead.'),null==b||0===b.length)return this.$element.val();var c=b[0];a.isArray(c)&&(c=a.map(c,function(a){return a.toString()})),this.$element.val(c).trigger("change")},e.prototype.destroy=function(){this.$container.remove(),this.$element[0].detachEvent&&this.$element[0].detachEvent("onpropertychange",this._syncA),null!=this._observer?(this._observer.disconnect(),this._observer=null):this.$element[0].removeEventListener&&(this.$element[0].removeEventListener("DOMAttrModified",this._syncA,!1),this.$element[0].removeEventListener("DOMNodeInserted",this._syncS,!1),this.$element[0].removeEventListener("DOMNodeRemoved",this._syncS,!1)),this._syncA=null,this._syncS=null,this.$element.off(".select2"),this.$element.attr("tabindex",this.$element.data("old-tabindex")),this.$element.removeClass("select2-hidden-accessible"),this.$element.attr("aria-hidden","false"),this.$element.removeData("select2"),this.dataAdapter.destroy(),this.selection.destroy(),this.dropdown.destroy(),this.results.destroy(),this.dataAdapter=null,this.selection=null,this.dropdown=null,this.results=null},e.prototype.render=function(){var b=a('<span class="select2 select2-container"><span class="selection"></span><span class="dropdown-wrapper" aria-hidden="true"></span></span>');return b.attr("dir",this.options.get("dir")),this.$container=b,this.$container.addClass("select2-container--"+this.options.get("theme")),b.data("element",this.$element),b},e}),b.define("select2/compat/utils",["jquery"],function(a){function b(b,c,d){var e,f,g=[];e=a.trim(b.attr("class")),e&&(e=""+e,a(e.split(/\s+/)).each(function(){0===this.indexOf("select2-")&&g.push(this)})),e=a.trim(c.attr("class")),e&&(e=""+e,a(e.split(/\s+/)).each(function(){0!==this.indexOf("select2-")&&null!=(f=d(this))&&g.push(f)})),b.attr("class",g.join(" "))}return{syncCssClasses:b}}),b.define("select2/compat/containerCss",["jquery","./utils"],function(a,b){function c(a){return null}function d(){}return d.prototype.render=function(d){var e=d.call(this),f=this.options.get("containerCssClass")||"";a.isFunction(f)&&(f=f(this.$element));var g=this.options.get("adaptContainerCssClass");if(g=g||c,-1!==f.indexOf(":all:")){f=f.replace(":all:","");var h=g;g=function(a){var b=h(a);return null!=b?b+" "+a:a}}var i=this.options.get("containerCss")||{};return a.isFunction(i)&&(i=i(this.$element)),b.syncCssClasses(e,this.$element,g),e.css(i),e.addClass(f),e},d}),b.define("select2/compat/dropdownCss",["jquery","./utils"],function(a,b){function c(a){return null}function d(){}return d.prototype.render=function(d){var e=d.call(this),f=this.options.get("dropdownCssClass")||"";a.isFunction(f)&&(f=f(this.$element));var g=this.options.get("adaptDropdownCssClass");if(g=g||c,-1!==f.indexOf(":all:")){f=f.replace(":all:","");var h=g;g=function(a){var b=h(a);return null!=b?b+" "+a:a}}var i=this.options.get("dropdownCss")||{};return a.isFunction(i)&&(i=i(this.$element)),b.syncCssClasses(e,this.$element,g),e.css(i),e.addClass(f),e},d}),b.define("select2/compat/initSelection",["jquery"],function(a){function b(a,b,c){c.get("debug")&&window.console&&console.warn&&console.warn("Select2: The `initSelection` option has been deprecated in favor of a custom data adapter that overrides the `current` method. This method is now called multiple times instead of a single time when the instance is initialized. Support will be removed for the `initSelection` option in future versions of Select2"),this.initSelection=c.get("initSelection"),this._isInitialized=!1,a.call(this,b,c)}return b.prototype.current=function(b,c){var d=this;if(this._isInitialized)return void b.call(this,c);this.initSelection.call(null,this.$element,function(b){d._isInitialized=!0,a.isArray(b)||(b=[b]),c(b)})},b}),b.define("select2/compat/inputData",["jquery"],function(a){function b(a,b,c){this._currentData=[],this._valueSeparator=c.get("valueSeparator")||",","hidden"===b.prop("type")&&c.get("debug")&&console&&console.warn&&console.warn("Select2: Using a hidden input with Select2 is no longer supported and may stop working in the future. It is recommended to use a `<select>` element instead."),a.call(this,b,c)}return b.prototype.current=function(b,c){function d(b,c){var e=[];return b.selected||-1!==a.inArray(b.id,c)?(b.selected=!0,e.push(b)):b.selected=!1,b.children&&e.push.apply(e,d(b.children,c)),e}for(var e=[],f=0;f<this._currentData.length;f++){var g=this._currentData[f];e.push.apply(e,d(g,this.$element.val().split(this._valueSeparator)))}c(e)},b.prototype.select=function(b,c){if(this.options.get("multiple")){var d=this.$element.val();d+=this._valueSeparator+c.id,this.$element.val(d),this.$element.trigger("change")}else this.current(function(b){a.map(b,function(a){a.selected=!1})}),this.$element.val(c.id),this.$element.trigger("change")},b.prototype.unselect=function(a,b){var c=this;b.selected=!1,this.current(function(a){for(var d=[],e=0;e<a.length;e++){var f=a[e];b.id!=f.id&&d.push(f.id)}c.$element.val(d.join(c._valueSeparator)),c.$element.trigger("change")})},b.prototype.query=function(a,b,c){for(var d=[],e=0;e<this._currentData.length;e++){var f=this._currentData[e],g=this.matches(b,f);null!==g&&d.push(g)}c({results:d})},b.prototype.addOptions=function(b,c){var d=a.map(c,function(b){return a.data(b[0],"data")});this._currentData.push.apply(this._currentData,d)},b}),b.define("select2/compat/matcher",["jquery"],function(a){function b(b){function c(c,d){var e=a.extend(!0,{},d);if(null==c.term||""===a.trim(c.term))return e;if(d.children){for(var f=d.children.length-1;f>=0;f--){var g=d.children[f];b(c.term,g.text,g)||e.children.splice(f,1)}if(e.children.length>0)return e}return b(c.term,d.text,d)?e:null}return c}return b}),b.define("select2/compat/query",[],function(){function a(a,b,c){c.get("debug")&&window.console&&console.warn&&console.warn("Select2: The `query` option has been deprecated in favor of a custom data adapter that overrides the `query` method. Support will be removed for the `query` option in future versions of Select2."),a.call(this,b,c)}return a.prototype.query=function(a,b,c){b.callback=c,this.options.get("query").call(null,b)},a}),b.define("select2/dropdown/attachContainer",[],function(){function a(a,b,c){a.call(this,b,c)}return a.prototype.position=function(a,b,c){c.find(".dropdown-wrapper").append(b),b.addClass("select2-dropdown--below"),c.addClass("select2-container--below")},a}),b.define("select2/dropdown/stopPropagation",[],function(){function a(){}return a.prototype.bind=function(a,b,c){a.call(this,b,c);var d=["blur","change","click","dblclick","focus","focusin","focusout","input","keydown","keyup","keypress","mousedown","mouseenter","mouseleave","mousemove","mouseover","mouseup","search","touchend","touchstart"];this.$dropdown.on(d.join(" "),function(a){a.stopPropagation()})},a}),b.define("select2/selection/stopPropagation",[],function(){function a(){}return a.prototype.bind=function(a,b,c){a.call(this,b,c);var d=["blur","change","click","dblclick","focus","focusin","focusout","input","keydown","keyup","keypress","mousedown","mouseenter","mouseleave","mousemove","mouseover","mouseup","search","touchend","touchstart"];this.$selection.on(d.join(" "),function(a){a.stopPropagation()})},a}),function(c){"function"==typeof b.define&&b.define.amd?b.define("jquery-mousewheel",["jquery"],c):"object"==typeof exports?module.exports=c:c(a)}(function(a){function b(b){var g=b||window.event,h=i.call(arguments,1),j=0,l=0,m=0,n=0,o=0,p=0;if(b=a.event.fix(g),b.type="mousewheel","detail"in g&&(m=-1*g.detail),"wheelDelta"in g&&(m=g.wheelDelta),"wheelDeltaY"in g&&(m=g.wheelDeltaY),"wheelDeltaX"in g&&(l=-1*g.wheelDeltaX),"axis"in g&&g.axis===g.HORIZONTAL_AXIS&&(l=-1*m,m=0),j=0===m?l:m,"deltaY"in g&&(m=-1*g.deltaY,j=m),"deltaX"in g&&(l=g.deltaX,0===m&&(j=-1*l)),0!==m||0!==l){if(1===g.deltaMode){var q=a.data(this,"mousewheel-line-height");j*=q,m*=q,l*=q}else if(2===g.deltaMode){var r=a.data(this,"mousewheel-page-height");j*=r,m*=r,l*=r}if(n=Math.max(Math.abs(m),Math.abs(l)),(!f||n<f)&&(f=n,d(g,n)&&(f/=40)),d(g,n)&&(j/=40,l/=40,m/=40),j=Math[j>=1?"floor":"ceil"](j/f),l=Math[l>=1?"floor":"ceil"](l/f),m=Math[m>=1?"floor":"ceil"](m/f),k.settings.normalizeOffset&&this.getBoundingClientRect){var s=this.getBoundingClientRect();o=b.clientX-s.left,p=b.clientY-s.top}return b.deltaX=l,b.deltaY=m,b.deltaFactor=f,b.offsetX=o,b.offsetY=p,b.deltaMode=0,h.unshift(b,j,l,m),e&&clearTimeout(e),e=setTimeout(c,200),(a.event.dispatch||a.event.handle).apply(this,h)}}function c(){f=null}function d(a,b){return k.settings.adjustOldDeltas&&"mousewheel"===a.type&&b%120==0}var e,f,g=["wheel","mousewheel","DOMMouseScroll","MozMousePixelScroll"],h="onwheel"in document||document.documentMode>=9?["wheel"]:["mousewheel","DomMouseScroll","MozMousePixelScroll"],i=Array.prototype.slice;if(a.event.fixHooks)for(var j=g.length;j;)a.event.fixHooks[g[--j]]=a.event.mouseHooks;var k=a.event.special.mousewheel={version:"3.1.12",setup:function(){if(this.addEventListener)for(var c=h.length;c;)this.addEventListener(h[--c],b,!1);else this.onmousewheel=b;a.data(this,"mousewheel-line-height",k.getLineHeight(this)),a.data(this,"mousewheel-page-height",k.getPageHeight(this))},teardown:function(){if(this.removeEventListener)for(var c=h.length;c;)this.removeEventListener(h[--c],b,!1);else this.onmousewheel=null;a.removeData(this,"mousewheel-line-height"),a.removeData(this,"mousewheel-page-height")},getLineHeight:function(b){var c=a(b),d=c["offsetParent"in a.fn?"offsetParent":"parent"]();return d.length||(d=a("body")),parseInt(d.css("fontSize"),10)||parseInt(c.css("fontSize"),10)||16},getPageHeight:function(b){return a(b).height()},settings:{adjustOldDeltas:!0,normalizeOffset:!0}};a.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})}),b.define("jquery.select2",["jquery","jquery-mousewheel","./select2/core","./select2/defaults"],function(a,b,c,d){if(null==a.fn.select2){var e=["open","close","destroy"];a.fn.select2=function(b){if("object"==typeof(b=b||{}))return this.each(function(){var d=a.extend(!0,{},b);new c(a(this),d)}),this;if("string"==typeof b){var d,f=Array.prototype.slice.call(arguments,1);return this.each(function(){var c=a(this).data("select2");null==c&&window.console&&console.error&&console.error("The select2('"+b+"') method was called on an element that is not using Select2."),d=c[b].apply(c,f)}),a.inArray(b,e)>-1?this:d}throw new Error("Invalid arguments for Select2: "+b)}}return null==a.fn.select2.defaults&&(a.fn.select2.defaults=d),c}),{define:b.define,require:b.require}}(),c=b.require("jquery.select2");return a.fn.select2.amd=b,c});;/**
 * jQuery Timepicker
 * http://timepicker.co
 *
 * Enhances standard form input fields helping users to select (or type) times.
 *
 * Copyright (c) 2016 Willington Vega; Licensed MIT, GPL
 */

(function (factory) {
    if ( typeof module === 'object' && typeof module.exports === 'object' ) {
        factory(require('jquery'), window, document);
    } else if (typeof jQuery !== 'undefined') {
        factory(jQuery, window, document);
    }
}(function($, window, document, undefined) {
    (function() {

        function pad(str, ch, length) {
            return (new Array(length + 1 - str.length).join(ch)) + str;
        }

        function normalize() {
            if (arguments.length === 1) {
                var date = arguments[0];
                if (typeof date === 'string') {
                    date = $.fn.timepicker.parseTime(date);
                }
                return new Date(0, 0, 0, date.getHours(), date.getMinutes(), date.getSeconds());
            } else if (arguments.length === 3) {
                return new Date(0, 0, 0, arguments[0], arguments[1], arguments[2]);
            } else if (arguments.length === 2) {
                return new Date(0, 0, 0, arguments[0], arguments[1], 0);
            } else {
                return new Date(0, 0, 0);
            }
        }

        $.TimePicker = function() {
            var widget = this;

            widget.container = $('.ui-timepicker-container');
            widget.ui = widget.container.find('.ui-timepicker');

            if (widget.container.length === 0) {
                widget.container = $('<div></div>').addClass('ui-timepicker-container')
                                    .addClass('ui-timepicker-hidden ui-helper-hidden')
                                    .appendTo('body')
                                    .hide();
                widget.ui = $( '<div></div>' ).addClass('ui-timepicker')
                                    .addClass('ui-widget ui-widget-content ui-menu')
                                    .addClass('ui-corner-all')
                                    .appendTo(widget.container);
                widget.viewport = $('<ul></ul>').addClass( 'ui-timepicker-viewport' )
                                    .appendTo( widget.ui );

                if ($.fn.jquery >= '1.4.2') {
                    widget.ui.delegate('a', 'mouseenter.timepicker', function() {
                        // passing false instead of an instance object tells the function
                        // to use the current instance
                        widget.activate(false, $(this).parent());
                    }).delegate('a', 'mouseleave.timepicker', function() {
                        widget.deactivate(false);
                    }).delegate('a', 'click.timepicker', function(event) {
                        event.preventDefault();
                        widget.select(false, $(this).parent());
                    });
                }
            }
        };

        $.TimePicker.count = 0;
        $.TimePicker.instance = function() {
            if (!$.TimePicker._instance) {
                $.TimePicker._instance = new $.TimePicker();
            }
            return $.TimePicker._instance;
        };

        $.TimePicker.prototype = {
            // extracted from from jQuery UI Core
            // http://github,com/jquery/jquery-ui/blob/master/ui/jquery.ui.core.js
            keyCode: {
                ALT: 18,
                BLOQ_MAYUS: 20,
                CTRL: 17,
                DOWN: 40,
                END: 35,
                ENTER: 13,
                HOME: 36,
                LEFT: 37,
                NUMPAD_ENTER: 108,
                PAGE_DOWN: 34,
                PAGE_UP: 33,
                RIGHT: 39,
                SHIFT: 16,
                TAB: 9,
                UP: 38
            },

            _items: function(i, startTime) {
                var widget = this, ul = $('<ul></ul>'), item = null, time, end;

                // interval should be a multiple of 60 if timeFormat is not
                // showing minutes
                if (i.options.timeFormat.indexOf('m') === -1 && i.options.interval % 60 !== 0) {
                    i.options.interval = Math.max(Math.round(i.options.interval / 60), 1) * 60;
                }

                if (startTime) {
                    time = normalize(startTime);
                } else if (i.options.startTime) {
                    time = normalize(i.options.startTime);
                } else {
                    time = normalize(i.options.startHour, i.options.startMinutes);
                }

                end = new Date(time.getTime() + 24 * 60 * 60 * 1000);

                while(time < end) {
                    if (widget._isValidTime(i, time)) {
                        item = $('<li>').addClass('ui-menu-item').appendTo(ul);
                        $('<a>').addClass('ui-corner-all').text($.fn.timepicker.formatTime(i.options.timeFormat, time)).appendTo(item);
                        item.data('time-value', time);
                    }
                    time = new Date(time.getTime() + i.options.interval * 60 * 1000);
                }

                return ul.children();
            },

            _isValidTime: function(i, time) {
                var min = null, max = null;

                time = normalize(time);

                if (i.options.minTime !== null) {
                    min = normalize(i.options.minTime);
                } else if (i.options.minHour !== null || i.options.minMinutes !== null) {
                    min = normalize(i.options.minHour, i.options.minMinutes);
                }

                if (i.options.maxTime !== null) {
                    max = normalize(i.options.maxTime);
                } else if (i.options.maxHour !== null || i.options.maxMinutes !== null) {
                    max = normalize(i.options.maxHour, i.options.maxMinutes);
                }

                if (min !== null && max !== null) {
                    return time >= min && time <= max;
                } else if (min !== null) {
                    return time >= min;
                } else if (max !== null) {
                    return time <= max;
                }

                return true;
            },

            _hasScroll: function() {
                // fix for jQuery 1.6 new prop method
                var m = typeof this.ui.prop !== 'undefined' ? 'prop' : 'attr';
                return this.ui.height() < this.ui[m]('scrollHeight');
            },

            /**
             * TODO: Write me!
             *
             * @param i
             * @param direction
             * @param edge
             * */
            _move: function(i, direction, edge) {
                var widget = this;
                if (widget.closed()) {
                    widget.open(i);
                }
                if (!widget.active) {
                    widget.activate( i, widget.viewport.children( edge ) );
                    return;
                }
                var next = widget.active[direction + 'All']('.ui-menu-item').eq(0);
                if (next.length) {
                    widget.activate(i, next);
                } else {
                    widget.activate( i, widget.viewport.children( edge ) );
                }
            },

            //
            // protected methods
            //

            register: function(node, options) {
                var widget = this, i = {}; // timepicker instance object

                i.element = $(node);

                if (i.element.data('TimePicker')) {
                    return;
                }

                i.options = $.metadata ? $.extend({}, options, i.element.metadata()) : $.extend({}, options);
                i.widget = widget;

                // proxy functions for the exposed api methods
                $.extend(i, {
                    next: function() {return widget.next(i) ;},
                    previous: function() {return widget.previous(i) ;},
                    first: function() { return widget.first(i) ;},
                    last: function() { return widget.last(i) ;},
                    selected: function() { return widget.selected(i) ;},
                    open: function() { return widget.open(i) ;},
                    close: function() { return widget.close(i) ;},
                    closed: function() { return widget.closed(i) ;},
                    destroy: function() { return widget.destroy(i) ;},

                    parse: function(str) { return widget.parse(i, str) ;},
                    format: function(time, format) { return widget.format(i, time, format); },
                    getTime: function() { return widget.getTime(i) ;},
                    setTime: function(time, silent) { return widget.setTime(i, time, silent); },
                    option: function(name, value) { return widget.option(i, name, value); }
                });

                widget._setDefaultTime(i);
                widget._addInputEventsHandlers(i);

                i.element.data('TimePicker', i);
            },

            _setDefaultTime: function(i) {
                if (i.options.defaultTime === 'now') {
                    i.setTime(normalize(new Date()));
                } else if (i.options.defaultTime && i.options.defaultTime.getFullYear) {
                    i.setTime(normalize(i.options.defaultTime));
                } else if (i.options.defaultTime) {
                    i.setTime($.fn.timepicker.parseTime(i.options.defaultTime));
                }
            },

            _addInputEventsHandlers: function(i) {
                var widget = this;

                i.element.bind('keydown.timepicker', function(event) {
                    switch (event.which || event.keyCode) {
                    case widget.keyCode.ENTER:
                    case widget.keyCode.NUMPAD_ENTER:
                        event.preventDefault();
                        if (widget.closed()) {
                            i.element.trigger('change.timepicker');
                        } else {
                            widget.select(i, widget.active);
                        }
                        break;
                    case widget.keyCode.UP:
                        i.previous();
                        break;
                    case widget.keyCode.DOWN:
                        i.next();
                        break;
                    default:
                        if (!widget.closed()) {
                            i.close(true);
                        }
                        break;
                    }
                }).bind('focus.timepicker', function() {
                    i.open();
                }).bind('blur.timepicker', function() {
                    setTimeout(function() {
                        if (i.element.data('timepicker-user-clicked-outside')) {
                            i.close();
                        }
                    });
                }).bind('change.timepicker', function() {
                    if (i.closed()) {
                        i.setTime($.fn.timepicker.parseTime(i.element.val()));
                    }
                });
            },

            select: function(i, item) {
                var widget = this, instance = i === false ? widget.instance : i;
                widget.setTime(instance, $.fn.timepicker.parseTime(item.children('a').text()));
                widget.close(instance, true);
            },

            activate: function(i, item) {
                var widget = this, instance = i === false ? widget.instance : i;

                if (instance !== widget.instance) {
                    return;
                } else {
                    widget.deactivate();
                }

                if (widget._hasScroll()) {
                    var offset = item.offset().top - widget.ui.offset().top,
                        scroll = widget.ui.scrollTop(),
                        height = widget.ui.height();
                    if (offset < 0) {
                        widget.ui.scrollTop(scroll + offset);
                    } else if (offset >= height) {
                        widget.ui.scrollTop(scroll + offset - height + item.height());
                    }
                }

                widget.active = item.eq(0).children('a').addClass('ui-state-hover')
                                                        .attr('id', 'ui-active-item')
                                          .end();
            },

            deactivate: function() {
                var widget = this;
                if (!widget.active) { return; }
                widget.active.children('a').removeClass('ui-state-hover').removeAttr('id');
                widget.active = null;
            },

            /**
             * _activate, _deactivate, first, last, next, previous, _move and
             * _hasScroll were extracted from jQuery UI Menu
             * http://github,com/jquery/jquery-ui/blob/menu/ui/jquery.ui.menu.js
             */

            //
            // public methods
            //

            next: function(i) {
                if (this.closed() || this.instance === i) {
                    this._move(i, 'next', '.ui-menu-item:first');
                }
                return i.element;
            },

            previous: function(i) {
                if (this.closed() || this.instance === i) {
                    this._move(i, 'prev', '.ui-menu-item:last');
                }
                return i.element;
            },

            first: function(i) {
                if (this.instance === i) {
                    return this.active && this.active.prevAll('.ui-menu-item').length === 0;
                }
                return false;
            },

            last: function(i) {
                if (this.instance === i) {
                    return this.active && this.active.nextAll('.ui-menu-item').length === 0;
                }
                return false;
            },

            selected: function(i) {
                if (this.instance === i)  {
                    return this.active ? this.active : null;
                }
                return null;
            },

            open: function(i) {
                var widget = this,
                    selectedTime = i.getTime(),
                    arrange = i.options.dynamic && selectedTime;

                // return if dropdown is disabled
                if (!i.options.dropdown) { return i.element; }

                // fix for issue https://github.com/wvega/timepicker/issues/56
                // idea from https://prototype.lighthouseapp.com/projects/8887/tickets/248-results-popup-from-ajaxautocompleter-disappear-when-user-clicks-on-scrollbars-in-ie6ie7
                i.element.data('timepicker-event-namespace', Math.random());

                $(document).bind('click.timepicker-' + i.element.data('timepicker-event-namespace'), function(event) {
                    if (i.element.get(0) === event.target) {
                        i.element.data('timepicker-user-clicked-outside', false);
                    } else {
                        i.element.data('timepicker-user-clicked-outside', true).blur();
                    }
                });

                // if a date is already selected and options.dynamic is true,
                // arrange the items in the list so the first item is
                // cronologically right after the selected date.
                // TODO: set selectedTime
                if (i.rebuild || !i.items || arrange) {
                    i.items = widget._items(i, arrange ? selectedTime : null);
                }

                // remove old li elements keeping associated events, then append
                // the new li elements to the ul
                if (i.rebuild || widget.instance !== i || arrange) {
                    // handle menu events when using jQuery versions previous to
                    // 1.4.2 (thanks to Brian Link)
                    // http://github.com/wvega/timepicker/issues#issue/4
                    if ($.fn.jquery < '1.4.2') {
                        widget.viewport.children().remove();
                        widget.viewport.append(i.items);
                        widget.viewport.find('a').bind('mouseover.timepicker', function() {
                            widget.activate(i, $(this).parent());
                        }).bind('mouseout.timepicker', function() {
                            widget.deactivate(i);
                        }).bind('click.timepicker', function(event) {
                            event.preventDefault();
                            widget.select(i, $(this).parent());
                        });
                    } else {
                        widget.viewport.children().detach();
                        widget.viewport.append(i.items);
                    }
                }

                i.rebuild = false;

                // theme
                widget.container.removeClass('ui-helper-hidden ui-timepicker-hidden ui-timepicker-standard ui-timepicker-corners').show();

                switch (i.options.theme) {
                case 'standard':
                    widget.container.addClass('ui-timepicker-standard');
                    break;
                case 'standard-rounded-corners':
                    widget.container.addClass('ui-timepicker-standard ui-timepicker-corners');
                    break;
                default:
                    break;
                }

                /* resize ui */

                // we are hiding the scrollbar in the dropdown menu adding a 40px
                // padding to the wrapper element making the scrollbar appear in the
                // part of the wrapper that's hidden by the container (a DIV).
                if ( ! widget.container.hasClass( 'ui-timepicker-no-scrollbar' ) && ! i.options.scrollbar ) {
                    widget.container.addClass( 'ui-timepicker-no-scrollbar' );
                    widget.viewport.css( { paddingRight: 40 } );
                }

                var containerDecorationHeight = widget.container.outerHeight() - widget.container.height(),
                    zindex = i.options.zindex ? i.options.zindex : i.element.offsetParent().css( 'z-index' ),
                    elementOffset = i.element.offset();

                // position the container right below the element, or as close to as possible.
                widget.container.css( {
                    top: elementOffset.top + i.element.outerHeight(),
                    left: elementOffset.left
                } );

                // then show the container so that the browser can consider the timepicker's
                // height to calculate the page's total height and decide if adding scrollbars
                // is necessary.
                widget.container.show();

                // now we need to calculate the element offset and position the container again.
                // If the browser added scrollbars, the container's original position is not aligned
                // with the element's final position. This step fixes that problem.
                widget.container.css( {
                    left: i.element.offset().left,
                    height: widget.ui.outerHeight() + containerDecorationHeight,
                    width: i.element.outerWidth(),
                    zIndex: zindex,
                    cursor: 'default'
                } );

                var calculatedWidth = widget.container.width() - ( widget.ui.outerWidth() - widget.ui.width() );

                // hardcode ui, viewport and item's width. I couldn't get it to work using CSS only
                widget.ui.css( { width: calculatedWidth } );
                widget.viewport.css( { width: calculatedWidth } );
                i.items.css( { width: calculatedWidth } );

                // XXX: what's this line doing here?
                widget.instance = i;

                // try to match input field's current value with an item in the
                // dropdown
                if (selectedTime) {
                    i.items.each(function() {
                        var item = $(this), time;

                        if ($.fn.jquery < '1.4.2') {
                            time = $.fn.timepicker.parseTime(item.find('a').text());
                        } else {
                            time = item.data('time-value');
                        }

                        if (time.getTime() === selectedTime.getTime()) {
                            widget.activate(i, item);
                            return false;
                        }
                        return true;
                    });
                } else {
                    widget.deactivate(i);
                }

                // don't break the chain
                return i.element;
            },

            close: function(i) {
                var widget = this;

                if (widget.instance === i) {
                    widget.container.addClass('ui-helper-hidden ui-timepicker-hidden').hide();
                    widget.ui.scrollTop(0);
                    widget.ui.children().removeClass('ui-state-hover');
                }

                $(document).unbind('click.timepicker-' + i.element.data('timepicker-event-namespace'));

                return i.element;
            },

            closed: function() {
                return this.ui.is(':hidden');
            },

            destroy: function(i) {
                var widget = this;
                widget.close(i, true);
                return i.element.unbind('.timepicker').data('TimePicker', null);
            },

            //

            parse: function(i, str) {
                return $.fn.timepicker.parseTime(str);
            },

            format: function(i, time, format) {
                format = format || i.options.timeFormat;
                return $.fn.timepicker.formatTime(format, time);
            },

            getTime: function(i) {
                var widget = this,
                    current = $.fn.timepicker.parseTime(i.element.val());

                // if current value is not valid, we return null.
                // stored Date object is ignored, because the current value
                // (valid or invalid) always takes priority
                if (current instanceof Date && !widget._isValidTime(i, current)) {
                    return null;
                } else if (current instanceof Date && i.selectedTime) {
                    // if the textfield's value and the stored Date object
                    // have the same representation using current format
                    // we prefer the stored Date object to avoid unnecesary
                    // lost of precision.
                    if (i.format(current) === i.format(i.selectedTime)) {
                        return i.selectedTime;
                    } else {
                        return current;
                    }
                } else if (current instanceof Date) {
                    return current;
                } else {
                    return null;
                }
            },

            setTime: function(i, time, silent) {
                var widget = this, previous = i.selectedTime;

                if (typeof time === 'string') {
                    time = i.parse(time);
                }

                if (time && time.getMinutes && widget._isValidTime(i, time)) {
                    time = normalize(time);
                    i.selectedTime = time;
                    i.element.val(i.format(time, i.options.timeFormat));

                    // TODO: add documentaion about setTime being chainable
                    if (silent) { return i; }
                } else {
                    i.selectedTime = null;
                }

                // custom change event and change callback
                // TODO: add documentation about this event
                if (previous !== null || i.selectedTime !== null) {
                    i.element.trigger('time-change', [time]);
                    if ($.isFunction(i.options.change)) {
                        i.options.change.apply(i.element, [time]);
                    }
                }

                return i.element;
            },

            option: function(i, name, value) {
                if (typeof value === 'undefined') {
                    return i.options[name];
                }

                var time = i.getTime(),
                    options, destructive;

                if (typeof name === 'string') {
                    options = {};
                    options[name] = value;
                } else {
                    options = name;
                }

                // some options require rebuilding the dropdown items
                destructive = ['minHour', 'minMinutes', 'minTime',
                               'maxHour', 'maxMinutes', 'maxTime',
                               'startHour', 'startMinutes', 'startTime',
                               'timeFormat', 'interval', 'dropdown'];


                $.each(options, function(name) {
                    i.options[name] = options[name];
                    i.rebuild = i.rebuild || $.inArray(name, destructive) > -1;
                });

                if (i.rebuild) {
                    i.setTime(time);
                }
            }
        };

        $.TimePicker.defaults =  {
            timeFormat: 'hh:mm p',
            minHour: null,
            minMinutes: null,
            minTime: null,
            maxHour: null,
            maxMinutes: null,
            maxTime: null,
            startHour: null,
            startMinutes: null,
            startTime: null,
            interval: 30,
            dynamic: true,
            theme: 'standard',
            zindex: null,
            dropdown: true,
            scrollbar: false,
            // callbacks
            change: function(/*time*/) {}
        };

        $.TimePicker.methods = {
            chainable: [
                'next',
                'previous',
                'open',
                'close',
                'destroy',
                'setTime'
            ]
        };

        $.fn.timepicker = function(options) {
            // support calling API methods using the following syntax:
            //   $(...).timepicker('parse', '11p');
            if (typeof options === 'string') {
                var args = Array.prototype.slice.call(arguments, 1),
                    method, result;

                // chainable API methods
                if (options === 'option' && arguments.length > 2) {
                    method = 'each';
                } else if ($.inArray(options, $.TimePicker.methods.chainable) !== -1) {
                    method = 'each';
                // API methods that return a value
                } else {
                    method = 'map';
                }

                result = this[method](function() {
                    var element = $(this), i = element.data('TimePicker');
                    if (typeof i === 'object') {
                        return i[options].apply(i, args);
                    }
                });

                if (method === 'map' && this.length === 1) {
                    return $.makeArray(result).shift();
                } else if (method === 'map') {
                    return $.makeArray(result);
                } else {
                    return result;
                }
            }

            // calling the constructor again on a jQuery object with a single
            // element returns a reference to a TimePicker object.
            if (this.length === 1 && this.data('TimePicker')) {
                return this.data('TimePicker');
            }

            var globals = $.extend({}, $.TimePicker.defaults, options);

            return this.each(function() {
                $.TimePicker.instance().register(this, globals);
            });
        };

        /**
         * TODO: documentation
         */
        $.fn.timepicker.formatTime = function(format, time) {
            var hours = time.getHours(),
                hours12 = hours % 12,
                minutes = time.getMinutes(),
                seconds = time.getSeconds(),
                replacements = {
                    hh: pad((hours12 === 0 ? 12 : hours12).toString(), '0', 2),
                    HH: pad(hours.toString(), '0', 2),
                    mm: pad(minutes.toString(), '0', 2),
                    ss: pad(seconds.toString(), '0', 2),
                    h: (hours12 === 0 ? 12 : hours12),
                    H: hours,
                    m: minutes,
                    s: seconds,
                    p: hours > 11 ? 'PM' : 'AM'
                },
                str = format, k = '';
            for (k in replacements) {
                if (replacements.hasOwnProperty(k)) {
                    str = str.replace(new RegExp(k,'g'), replacements[k]);
                }
            }
            // replacements is not guaranteed to be order and the 'p' can cause problems
            str = str.replace(new RegExp('a','g'), hours > 11 ? 'pm' : 'am');
            return str;
        };

        /**
         * Convert a string representing a given time into a Date object.
         *
         * The Date object will have attributes others than hours, minutes and
         * seconds set to current local time values. The function will return
         * false if given string can't be converted.
         *
         * If there is an 'a' in the string we set am to true, if there is a 'p'
         * we set pm to true, if both are present only am is setted to true.
         *
         * All non-digit characters are removed from the string before trying to
         * parse the time.
         *
         * ''       can't be converted and the function returns false.
         * '1'      is converted to     01:00:00 am
         * '11'     is converted to     11:00:00 am
         * '111'    is converted to     01:11:00 am
         * '1111'   is converted to     11:11:00 am
         * '11111'  is converted to     01:11:11 am
         * '111111' is converted to     11:11:11 am
         *
         * Only the first six (or less) characters are considered.
         *
         * Special case:
         *
         * When hours is greater than 24 and the last digit is less or equal than 6, and minutes
         * and seconds are less or equal than 60, we append a trailing zero and
         * start parsing process again. Examples:
         *
         * '95' is treated as '950' and converted to 09:50:00 am
         * '46' is treated as '460' and converted to 05:00:00 am
         * '57' can't be converted and the function returns false.
         *
         * For a detailed list of supported formats check the unit tests at
         * http://github.com/wvega/timepicker/tree/master/tests/
         */
        $.fn.timepicker.parseTime = (function() {
            var patterns = [
                    // 1, 12, 123, 1234, 12345, 123456
                    [/^(\d+)$/, '$1'],
                    // :1, :2, :3, :4 ... :9
                    [/^:(\d)$/, '$10'],
                    // :1, :12, :123, :1234 ...
                    [/^:(\d+)/, '$1'],
                    // 6:06, 5:59, 5:8
                    [/^(\d):([7-9])$/, '0$10$2'],
                    [/^(\d):(\d\d)$/, '$1$2'],
                    [/^(\d):(\d{1,})$/, '0$1$20'],
                    // 10:8, 10:10, 10:34
                    [/^(\d\d):([7-9])$/, '$10$2'],
                    [/^(\d\d):(\d)$/, '$1$20'],
                    [/^(\d\d):(\d*)$/, '$1$2'],
                    // 123:4, 1234:456
                    [/^(\d{3,}):(\d)$/, '$10$2'],
                    [/^(\d{3,}):(\d{2,})/, '$1$2'],
                    //
                    [/^(\d):(\d):(\d)$/, '0$10$20$3'],
                    [/^(\d{1,2}):(\d):(\d\d)/, '$10$2$3']
                ],
                length = patterns.length;

            return function(str) {
                var time = normalize(new Date()),
                    am = false, pm = false, h = false, m = false, s = false;

                if (typeof str === 'undefined' || !str.toLowerCase) { return null; }

                str = str.toLowerCase();
                am = /a/.test(str);
                pm = am ? false : /p/.test(str);
                str = str.replace(/[^0-9:]/g, '').replace(/:+/g, ':');

                for (var k = 0; k < length; k = k + 1) {
                    if (patterns[k][0].test(str)) {
                        str = str.replace(patterns[k][0], patterns[k][1]);
                        break;
                    }
                }
                str = str.replace(/:/g, '');

                if (str.length === 1) {
                    h = str;
                } else if (str.length === 2) {
                    h = str;
                } else if (str.length === 3 || str.length === 5) {
                    h = str.substr(0, 1);
                    m = str.substr(1, 2);
                    s = str.substr(3, 2);
                } else if (str.length === 4 || str.length > 5) {
                    h = str.substr(0, 2);
                    m = str.substr(2, 2);
                    s = str.substr(4, 2);
                }

                if (str.length > 0 && str.length < 5) {
                    if (str.length < 3) {
                        m = 0;
                    }
                    s = 0;
                }

                if (h === false || m === false || s === false) {
                    return false;
                }

                h = parseInt(h, 10);
                m = parseInt(m, 10);
                s = parseInt(s, 10);

                if (am && h === 12) {
                    h = 0;
                } else if (pm && h < 12) {
                    h = h + 12;
                }

                if (h > 24) {
                    if (str.length >= 6) {
                        return $.fn.timepicker.parseTime(str.substr(0,5));
                    } else {
                        return $.fn.timepicker.parseTime(str + '0' + (am ? 'a' : '') + (pm ? 'p' : ''));
                    }
                } else {
                    time.setHours(h, m, s);
                    return time;
                }
            };
        })();
    })();
}));
;/*!
 * typeahead.js 0.11.1
 * https://github.com/twitter/typeahead.js
 * Copyright 2013-2015 Twitter, Inc. and other contributors; Licensed MIT
 */

!function(a,b){"function"==typeof define&&define.amd?define("bloodhound",["jquery"],function(c){return a.Bloodhound=b(c)}):"object"==typeof exports?module.exports=b(require("jquery")):a.Bloodhound=b(jQuery)}(this,function(a){var b=function(){"use strict";return{isMsie:function(){return/(msie|trident)/i.test(navigator.userAgent)?navigator.userAgent.match(/(msie |rv:)(\d+(.\d+)?)/i)[2]:!1},isBlankString:function(a){return!a||/^\s*$/.test(a)},escapeRegExChars:function(a){return a.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&")},isString:function(a){return"string"==typeof a},isNumber:function(a){return"number"==typeof a},isArray:a.isArray,isFunction:a.isFunction,isObject:a.isPlainObject,isUndefined:function(a){return"undefined"==typeof a},isElement:function(a){return!(!a||1!==a.nodeType)},isJQuery:function(b){return b instanceof a},toStr:function(a){return b.isUndefined(a)||null===a?"":a+""},bind:a.proxy,each:function(b,c){function d(a,b){return c(b,a)}a.each(b,d)},map:a.map,filter:a.grep,every:function(b,c){var d=!0;return b?(a.each(b,function(a,e){return(d=c.call(null,e,a,b))?void 0:!1}),!!d):d},some:function(b,c){var d=!1;return b?(a.each(b,function(a,e){return(d=c.call(null,e,a,b))?!1:void 0}),!!d):d},mixin:a.extend,identity:function(a){return a},clone:function(b){return a.extend(!0,{},b)},getIdGenerator:function(){var a=0;return function(){return a++}},templatify:function(b){function c(){return String(b)}return a.isFunction(b)?b:c},defer:function(a){setTimeout(a,0)},debounce:function(a,b,c){var d,e;return function(){var f,g,h=this,i=arguments;return f=function(){d=null,c||(e=a.apply(h,i))},g=c&&!d,clearTimeout(d),d=setTimeout(f,b),g&&(e=a.apply(h,i)),e}},throttle:function(a,b){var c,d,e,f,g,h;return g=0,h=function(){g=new Date,e=null,f=a.apply(c,d)},function(){var i=new Date,j=b-(i-g);return c=this,d=arguments,0>=j?(clearTimeout(e),e=null,g=i,f=a.apply(c,d)):e||(e=setTimeout(h,j)),f}},stringify:function(a){return b.isString(a)?a:JSON.stringify(a)},noop:function(){}}}(),c="0.11.1",d=function(){"use strict";function a(a){return a=b.toStr(a),a?a.split(/\s+/):[]}function c(a){return a=b.toStr(a),a?a.split(/\W+/):[]}function d(a){return function(c){return c=b.isArray(c)?c:[].slice.call(arguments,0),function(d){var e=[];return b.each(c,function(c){e=e.concat(a(b.toStr(d[c])))}),e}}}return{nonword:c,whitespace:a,obj:{nonword:d(c),whitespace:d(a)}}}(),e=function(){"use strict";function c(c){this.maxSize=b.isNumber(c)?c:100,this.reset(),this.maxSize<=0&&(this.set=this.get=a.noop)}function d(){this.head=this.tail=null}function e(a,b){this.key=a,this.val=b,this.prev=this.next=null}return b.mixin(c.prototype,{set:function(a,b){var c,d=this.list.tail;this.size>=this.maxSize&&(this.list.remove(d),delete this.hash[d.key],this.size--),(c=this.hash[a])?(c.val=b,this.list.moveToFront(c)):(c=new e(a,b),this.list.add(c),this.hash[a]=c,this.size++)},get:function(a){var b=this.hash[a];return b?(this.list.moveToFront(b),b.val):void 0},reset:function(){this.size=0,this.hash={},this.list=new d}}),b.mixin(d.prototype,{add:function(a){this.head&&(a.next=this.head,this.head.prev=a),this.head=a,this.tail=this.tail||a},remove:function(a){a.prev?a.prev.next=a.next:this.head=a.next,a.next?a.next.prev=a.prev:this.tail=a.prev},moveToFront:function(a){this.remove(a),this.add(a)}}),c}(),f=function(){"use strict";function c(a,c){this.prefix=["__",a,"__"].join(""),this.ttlKey="__ttl__",this.keyMatcher=new RegExp("^"+b.escapeRegExChars(this.prefix)),this.ls=c||h,!this.ls&&this._noop()}function d(){return(new Date).getTime()}function e(a){return JSON.stringify(b.isUndefined(a)?null:a)}function f(b){return a.parseJSON(b)}function g(a){var b,c,d=[],e=h.length;for(b=0;e>b;b++)(c=h.key(b)).match(a)&&d.push(c.replace(a,""));return d}var h;try{h=window.localStorage,h.setItem("~~~","!"),h.removeItem("~~~")}catch(i){h=null}return b.mixin(c.prototype,{_prefix:function(a){return this.prefix+a},_ttlKey:function(a){return this._prefix(a)+this.ttlKey},_noop:function(){this.get=this.set=this.remove=this.clear=this.isExpired=b.noop},_safeSet:function(a,b){try{this.ls.setItem(a,b)}catch(c){"QuotaExceededError"===c.name&&(this.clear(),this._noop())}},get:function(a){return this.isExpired(a)&&this.remove(a),f(this.ls.getItem(this._prefix(a)))},set:function(a,c,f){return b.isNumber(f)?this._safeSet(this._ttlKey(a),e(d()+f)):this.ls.removeItem(this._ttlKey(a)),this._safeSet(this._prefix(a),e(c))},remove:function(a){return this.ls.removeItem(this._ttlKey(a)),this.ls.removeItem(this._prefix(a)),this},clear:function(){var a,b=g(this.keyMatcher);for(a=b.length;a--;)this.remove(b[a]);return this},isExpired:function(a){var c=f(this.ls.getItem(this._ttlKey(a)));return b.isNumber(c)&&d()>c?!0:!1}}),c}(),g=function(){"use strict";function c(a){a=a||{},this.cancelled=!1,this.lastReq=null,this._send=a.transport,this._get=a.limiter?a.limiter(this._get):this._get,this._cache=a.cache===!1?new e(0):h}var d=0,f={},g=6,h=new e(10);return c.setMaxPendingRequests=function(a){g=a},c.resetCache=function(){h.reset()},b.mixin(c.prototype,{_fingerprint:function(b){return b=b||{},b.url+b.type+a.param(b.data||{})},_get:function(a,b){function c(a){b(null,a),k._cache.set(i,a)}function e(){b(!0)}function h(){d--,delete f[i],k.onDeckRequestArgs&&(k._get.apply(k,k.onDeckRequestArgs),k.onDeckRequestArgs=null)}var i,j,k=this;i=this._fingerprint(a),this.cancelled||i!==this.lastReq||((j=f[i])?j.done(c).fail(e):g>d?(d++,f[i]=this._send(a).done(c).fail(e).always(h)):this.onDeckRequestArgs=[].slice.call(arguments,0))},get:function(c,d){var e,f;d=d||a.noop,c=b.isString(c)?{url:c}:c||{},f=this._fingerprint(c),this.cancelled=!1,this.lastReq=f,(e=this._cache.get(f))?d(null,e):this._get(c,d)},cancel:function(){this.cancelled=!0}}),c}(),h=window.SearchIndex=function(){"use strict";function c(c){c=c||{},c.datumTokenizer&&c.queryTokenizer||a.error("datumTokenizer and queryTokenizer are both required"),this.identify=c.identify||b.stringify,this.datumTokenizer=c.datumTokenizer,this.queryTokenizer=c.queryTokenizer,this.reset()}function d(a){return a=b.filter(a,function(a){return!!a}),a=b.map(a,function(a){return a.toLowerCase()})}function e(){var a={};return a[i]=[],a[h]={},a}function f(a){for(var b={},c=[],d=0,e=a.length;e>d;d++)b[a[d]]||(b[a[d]]=!0,c.push(a[d]));return c}function g(a,b){var c=0,d=0,e=[];a=a.sort(),b=b.sort();for(var f=a.length,g=b.length;f>c&&g>d;)a[c]<b[d]?c++:a[c]>b[d]?d++:(e.push(a[c]),c++,d++);return e}var h="c",i="i";return b.mixin(c.prototype,{bootstrap:function(a){this.datums=a.datums,this.trie=a.trie},add:function(a){var c=this;a=b.isArray(a)?a:[a],b.each(a,function(a){var f,g;c.datums[f=c.identify(a)]=a,g=d(c.datumTokenizer(a)),b.each(g,function(a){var b,d,g;for(b=c.trie,d=a.split("");g=d.shift();)b=b[h][g]||(b[h][g]=e()),b[i].push(f)})})},get:function(a){var c=this;return b.map(a,function(a){return c.datums[a]})},search:function(a){var c,e,j=this;return c=d(this.queryTokenizer(a)),b.each(c,function(a){var b,c,d,f;if(e&&0===e.length)return!1;for(b=j.trie,c=a.split("");b&&(d=c.shift());)b=b[h][d];return b&&0===c.length?(f=b[i].slice(0),void(e=e?g(e,f):f)):(e=[],!1)}),e?b.map(f(e),function(a){return j.datums[a]}):[]},all:function(){var a=[];for(var b in this.datums)a.push(this.datums[b]);return a},reset:function(){this.datums={},this.trie=e()},serialize:function(){return{datums:this.datums,trie:this.trie}}}),c}(),i=function(){"use strict";function a(a){this.url=a.url,this.ttl=a.ttl,this.cache=a.cache,this.prepare=a.prepare,this.transform=a.transform,this.transport=a.transport,this.thumbprint=a.thumbprint,this.storage=new f(a.cacheKey)}var c;return c={data:"data",protocol:"protocol",thumbprint:"thumbprint"},b.mixin(a.prototype,{_settings:function(){return{url:this.url,type:"GET",dataType:"json"}},store:function(a){this.cache&&(this.storage.set(c.data,a,this.ttl),this.storage.set(c.protocol,location.protocol,this.ttl),this.storage.set(c.thumbprint,this.thumbprint,this.ttl))},fromCache:function(){var a,b={};return this.cache?(b.data=this.storage.get(c.data),b.protocol=this.storage.get(c.protocol),b.thumbprint=this.storage.get(c.thumbprint),a=b.thumbprint!==this.thumbprint||b.protocol!==location.protocol,b.data&&!a?b.data:null):null},fromNetwork:function(a){function b(){a(!0)}function c(b){a(null,e.transform(b))}var d,e=this;a&&(d=this.prepare(this._settings()),this.transport(d).fail(b).done(c))},clear:function(){return this.storage.clear(),this}}),a}(),j=function(){"use strict";function a(a){this.url=a.url,this.prepare=a.prepare,this.transform=a.transform,this.transport=new g({cache:a.cache,limiter:a.limiter,transport:a.transport})}return b.mixin(a.prototype,{_settings:function(){return{url:this.url,type:"GET",dataType:"json"}},get:function(a,b){function c(a,c){b(a?[]:e.transform(c))}var d,e=this;if(b)return a=a||"",d=this.prepare(a,this._settings()),this.transport.get(d,c)},cancelLastRequest:function(){this.transport.cancel()}}),a}(),k=function(){"use strict";function d(d){var e;return d?(e={url:null,ttl:864e5,cache:!0,cacheKey:null,thumbprint:"",prepare:b.identity,transform:b.identity,transport:null},d=b.isString(d)?{url:d}:d,d=b.mixin(e,d),!d.url&&a.error("prefetch requires url to be set"),d.transform=d.filter||d.transform,d.cacheKey=d.cacheKey||d.url,d.thumbprint=c+d.thumbprint,d.transport=d.transport?h(d.transport):a.ajax,d):null}function e(c){var d;if(c)return d={url:null,cache:!0,prepare:null,replace:null,wildcard:null,limiter:null,rateLimitBy:"debounce",rateLimitWait:300,transform:b.identity,transport:null},c=b.isString(c)?{url:c}:c,c=b.mixin(d,c),!c.url&&a.error("remote requires url to be set"),c.transform=c.filter||c.transform,c.prepare=f(c),c.limiter=g(c),c.transport=c.transport?h(c.transport):a.ajax,delete c.replace,delete c.wildcard,delete c.rateLimitBy,delete c.rateLimitWait,c}function f(a){function b(a,b){return b.url=f(b.url,a),b}function c(a,b){return b.url=b.url.replace(g,encodeURIComponent(a)),b}function d(a,b){return b}var e,f,g;return e=a.prepare,f=a.replace,g=a.wildcard,e?e:e=f?b:a.wildcard?c:d}function g(a){function c(a){return function(c){return b.debounce(c,a)}}function d(a){return function(c){return b.throttle(c,a)}}var e,f,g;return e=a.limiter,f=a.rateLimitBy,g=a.rateLimitWait,e||(e=/^throttle$/i.test(f)?d(g):c(g)),e}function h(c){return function(d){function e(a){b.defer(function(){g.resolve(a)})}function f(a){b.defer(function(){g.reject(a)})}var g=a.Deferred();return c(d,e,f),g}}return function(c){var f,g;return f={initialize:!0,identify:b.stringify,datumTokenizer:null,queryTokenizer:null,sufficient:5,sorter:null,local:[],prefetch:null,remote:null},c=b.mixin(f,c||{}),!c.datumTokenizer&&a.error("datumTokenizer is required"),!c.queryTokenizer&&a.error("queryTokenizer is required"),g=c.sorter,c.sorter=g?function(a){return a.sort(g)}:b.identity,c.local=b.isFunction(c.local)?c.local():c.local,c.prefetch=d(c.prefetch),c.remote=e(c.remote),c}}(),l=function(){"use strict";function c(a){a=k(a),this.sorter=a.sorter,this.identify=a.identify,this.sufficient=a.sufficient,this.local=a.local,this.remote=a.remote?new j(a.remote):null,this.prefetch=a.prefetch?new i(a.prefetch):null,this.index=new h({identify:this.identify,datumTokenizer:a.datumTokenizer,queryTokenizer:a.queryTokenizer}),a.initialize!==!1&&this.initialize()}var e;return e=window&&window.Bloodhound,c.noConflict=function(){return window&&(window.Bloodhound=e),c},c.tokenizers=d,b.mixin(c.prototype,{__ttAdapter:function(){function a(a,b,d){return c.search(a,b,d)}function b(a,b){return c.search(a,b)}var c=this;return this.remote?a:b},_loadPrefetch:function(){function b(a,b){return a?c.reject():(e.add(b),e.prefetch.store(e.index.serialize()),void c.resolve())}var c,d,e=this;return c=a.Deferred(),this.prefetch?(d=this.prefetch.fromCache())?(this.index.bootstrap(d),c.resolve()):this.prefetch.fromNetwork(b):c.resolve(),c.promise()},_initialize:function(){function a(){b.add(b.local)}var b=this;return this.clear(),(this.initPromise=this._loadPrefetch()).done(a),this.initPromise},initialize:function(a){return!this.initPromise||a?this._initialize():this.initPromise},add:function(a){return this.index.add(a),this},get:function(a){return a=b.isArray(a)?a:[].slice.call(arguments),this.index.get(a)},search:function(a,c,d){function e(a){var c=[];b.each(a,function(a){!b.some(f,function(b){return g.identify(a)===g.identify(b)})&&c.push(a)}),d&&d(c)}var f,g=this;return f=this.sorter(this.index.search(a)),c(this.remote?f.slice():f),this.remote&&f.length<this.sufficient?this.remote.get(a,e):this.remote&&this.remote.cancelLastRequest(),this},all:function(){return this.index.all()},clear:function(){return this.index.reset(),this},clearPrefetchCache:function(){return this.prefetch&&this.prefetch.clear(),this},clearRemoteCache:function(){return g.resetCache(),this},ttAdapter:function(){return this.__ttAdapter()}}),c}();return l}),function(a,b){"function"==typeof define&&define.amd?define("typeahead.js",["jquery"],function(a){return b(a)}):"object"==typeof exports?module.exports=b(require("jquery")):b(jQuery)}(this,function(a){var b=function(){"use strict";return{isMsie:function(){return/(msie|trident)/i.test(navigator.userAgent)?navigator.userAgent.match(/(msie |rv:)(\d+(.\d+)?)/i)[2]:!1},isBlankString:function(a){return!a||/^\s*$/.test(a)},escapeRegExChars:function(a){return a.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&")},isString:function(a){return"string"==typeof a},isNumber:function(a){return"number"==typeof a},isArray:a.isArray,isFunction:a.isFunction,isObject:a.isPlainObject,isUndefined:function(a){return"undefined"==typeof a},isElement:function(a){return!(!a||1!==a.nodeType)},isJQuery:function(b){return b instanceof a},toStr:function(a){return b.isUndefined(a)||null===a?"":a+""},bind:a.proxy,each:function(b,c){function d(a,b){return c(b,a)}a.each(b,d)},map:a.map,filter:a.grep,every:function(b,c){var d=!0;return b?(a.each(b,function(a,e){return(d=c.call(null,e,a,b))?void 0:!1}),!!d):d},some:function(b,c){var d=!1;return b?(a.each(b,function(a,e){return(d=c.call(null,e,a,b))?!1:void 0}),!!d):d},mixin:a.extend,identity:function(a){return a},clone:function(b){return a.extend(!0,{},b)},getIdGenerator:function(){var a=0;return function(){return a++}},templatify:function(b){function c(){return String(b)}return a.isFunction(b)?b:c},defer:function(a){setTimeout(a,0)},debounce:function(a,b,c){var d,e;return function(){var f,g,h=this,i=arguments;return f=function(){d=null,c||(e=a.apply(h,i))},g=c&&!d,clearTimeout(d),d=setTimeout(f,b),g&&(e=a.apply(h,i)),e}},throttle:function(a,b){var c,d,e,f,g,h;return g=0,h=function(){g=new Date,e=null,f=a.apply(c,d)},function(){var i=new Date,j=b-(i-g);return c=this,d=arguments,0>=j?(clearTimeout(e),e=null,g=i,f=a.apply(c,d)):e||(e=setTimeout(h,j)),f}},stringify:function(a){return b.isString(a)?a:JSON.stringify(a)},noop:function(){}}}(),c=function(){"use strict";function a(a){var g,h;return h=b.mixin({},f,a),g={css:e(),classes:h,html:c(h),selectors:d(h)},{css:g.css,html:g.html,classes:g.classes,selectors:g.selectors,mixin:function(a){b.mixin(a,g)}}}function c(a){return{wrapper:'<span class="'+a.wrapper+'"></span>',menu:'<div class="'+a.menu+'"></div>'}}function d(a){var c={};return b.each(a,function(a,b){c[b]="."+a}),c}function e(){var a={wrapper:{position:"relative",display:"inline-block"},hint:{position:"absolute",top:"0",left:"0",borderColor:"transparent",boxShadow:"none",opacity:"1"},input:{position:"relative",verticalAlign:"top",backgroundColor:"transparent"},inputWithNoHint:{position:"relative",verticalAlign:"top"},menu:{position:"absolute",top:"100%",left:"0",zIndex:"100",display:"none"},ltr:{left:"0",right:"auto"},rtl:{left:"auto",right:" 0"}};return b.isMsie()&&b.mixin(a.input,{backgroundImage:"url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)"}),a}var f={wrapper:"twitter-typeahead",input:"tt-input",hint:"tt-hint",menu:"tt-menu",dataset:"tt-dataset",suggestion:"tt-suggestion",selectable:"tt-selectable",empty:"tt-empty",open:"tt-open",cursor:"tt-cursor",highlight:"tt-highlight"};return a}(),d=function(){"use strict";function c(b){b&&b.el||a.error("EventBus initialized without el"),this.$el=a(b.el)}var d,e;return d="typeahead:",e={render:"rendered",cursorchange:"cursorchanged",select:"selected",autocomplete:"autocompleted"},b.mixin(c.prototype,{_trigger:function(b,c){var e;return e=a.Event(d+b),(c=c||[]).unshift(e),this.$el.trigger.apply(this.$el,c),e},before:function(a){var b,c;return b=[].slice.call(arguments,1),c=this._trigger("before"+a,b),c.isDefaultPrevented()},trigger:function(a){var b;this._trigger(a,[].slice.call(arguments,1)),(b=e[a])&&this._trigger(b,[].slice.call(arguments,1))}}),c}(),e=function(){"use strict";function a(a,b,c,d){var e;if(!c)return this;for(b=b.split(i),c=d?h(c,d):c,this._callbacks=this._callbacks||{};e=b.shift();)this._callbacks[e]=this._callbacks[e]||{sync:[],async:[]},this._callbacks[e][a].push(c);return this}function b(b,c,d){return a.call(this,"async",b,c,d)}function c(b,c,d){return a.call(this,"sync",b,c,d)}function d(a){var b;if(!this._callbacks)return this;for(a=a.split(i);b=a.shift();)delete this._callbacks[b];return this}function e(a){var b,c,d,e,g;if(!this._callbacks)return this;for(a=a.split(i),d=[].slice.call(arguments,1);(b=a.shift())&&(c=this._callbacks[b]);)e=f(c.sync,this,[b].concat(d)),g=f(c.async,this,[b].concat(d)),e()&&j(g);return this}function f(a,b,c){function d(){for(var d,e=0,f=a.length;!d&&f>e;e+=1)d=a[e].apply(b,c)===!1;return!d}return d}function g(){var a;return a=window.setImmediate?function(a){setImmediate(function(){a()})}:function(a){setTimeout(function(){a()},0)}}function h(a,b){return a.bind?a.bind(b):function(){a.apply(b,[].slice.call(arguments,0))}}var i=/\s+/,j=g();return{onSync:c,onAsync:b,off:d,trigger:e}}(),f=function(a){"use strict";function c(a,c,d){for(var e,f=[],g=0,h=a.length;h>g;g++)f.push(b.escapeRegExChars(a[g]));return e=d?"\\b("+f.join("|")+")\\b":"("+f.join("|")+")",c?new RegExp(e):new RegExp(e,"i")}var d={node:null,pattern:null,tagName:"strong",className:null,wordsOnly:!1,caseSensitive:!1};return function(e){function f(b){var c,d,f;return(c=h.exec(b.data))&&(f=a.createElement(e.tagName),e.className&&(f.className=e.className),d=b.splitText(c.index),d.splitText(c[0].length),f.appendChild(d.cloneNode(!0)),b.parentNode.replaceChild(f,d)),!!c}function g(a,b){for(var c,d=3,e=0;e<a.childNodes.length;e++)c=a.childNodes[e],c.nodeType===d?e+=b(c)?1:0:g(c,b)}var h;e=b.mixin({},d,e),e.node&&e.pattern&&(e.pattern=b.isArray(e.pattern)?e.pattern:[e.pattern],h=c(e.pattern,e.caseSensitive,e.wordsOnly),g(e.node,f))}}(window.document),g=function(){"use strict";function c(c,e){c=c||{},c.input||a.error("input is missing"),e.mixin(this),this.$hint=a(c.hint),this.$input=a(c.input),this.query=this.$input.val(),this.queryWhenFocused=this.hasFocus()?this.query:null,this.$overflowHelper=d(this.$input),this._checkLanguageDirection(),0===this.$hint.length&&(this.setHint=this.getHint=this.clearHint=this.clearHintIfInvalid=b.noop)}function d(b){return a('<pre aria-hidden="true"></pre>').css({position:"absolute",visibility:"hidden",whiteSpace:"pre",fontFamily:b.css("font-family"),fontSize:b.css("font-size"),fontStyle:b.css("font-style"),fontVariant:b.css("font-variant"),fontWeight:b.css("font-weight"),wordSpacing:b.css("word-spacing"),letterSpacing:b.css("letter-spacing"),textIndent:b.css("text-indent"),textRendering:b.css("text-rendering"),textTransform:b.css("text-transform")}).insertAfter(b)}function f(a,b){return c.normalizeQuery(a)===c.normalizeQuery(b)}function g(a){return a.altKey||a.ctrlKey||a.metaKey||a.shiftKey}var h;return h={9:"tab",27:"esc",37:"left",39:"right",13:"enter",38:"up",40:"down"},c.normalizeQuery=function(a){return b.toStr(a).replace(/^\s*/g,"").replace(/\s{2,}/g," ")},b.mixin(c.prototype,e,{_onBlur:function(){this.resetInputValue(),this.trigger("blurred")},_onFocus:function(){this.queryWhenFocused=this.query,this.trigger("focused")},_onKeydown:function(a){var b=h[a.which||a.keyCode];this._managePreventDefault(b,a),b&&this._shouldTrigger(b,a)&&this.trigger(b+"Keyed",a)},_onInput:function(){this._setQuery(this.getInputValue()),this.clearHintIfInvalid(),this._checkLanguageDirection()},_managePreventDefault:function(a,b){var c;switch(a){case"up":case"down":c=!g(b);break;default:c=!1}c&&b.preventDefault()},_shouldTrigger:function(a,b){var c;switch(a){case"tab":c=!g(b);break;default:c=!0}return c},_checkLanguageDirection:function(){var a=(this.$input.css("direction")||"ltr").toLowerCase();this.dir!==a&&(this.dir=a,this.$hint.attr("dir",a),this.trigger("langDirChanged",a))},_setQuery:function(a,b){var c,d;c=f(a,this.query),d=c?this.query.length!==a.length:!1,this.query=a,b||c?!b&&d&&this.trigger("whitespaceChanged",this.query):this.trigger("queryChanged",this.query)},bind:function(){var a,c,d,e,f=this;return a=b.bind(this._onBlur,this),c=b.bind(this._onFocus,this),d=b.bind(this._onKeydown,this),e=b.bind(this._onInput,this),this.$input.on("blur.tt",a).on("focus.tt",c).on("keydown.tt",d),!b.isMsie()||b.isMsie()>9?this.$input.on("input.tt",e):this.$input.on("keydown.tt keypress.tt cut.tt paste.tt",function(a){h[a.which||a.keyCode]||b.defer(b.bind(f._onInput,f,a))}),this},focus:function(){this.$input.focus()},blur:function(){this.$input.blur()},getLangDir:function(){return this.dir},getQuery:function(){return this.query||""},setQuery:function(a,b){this.setInputValue(a),this._setQuery(a,b)},hasQueryChangedSinceLastFocus:function(){return this.query!==this.queryWhenFocused},getInputValue:function(){return this.$input.val()},setInputValue:function(a){this.$input.val(a),this.clearHintIfInvalid(),this._checkLanguageDirection()},resetInputValue:function(){this.setInputValue(this.query)},getHint:function(){return this.$hint.val()},setHint:function(a){this.$hint.val(a)},clearHint:function(){this.setHint("")},clearHintIfInvalid:function(){var a,b,c,d;a=this.getInputValue(),b=this.getHint(),c=a!==b&&0===b.indexOf(a),d=""!==a&&c&&!this.hasOverflow(),!d&&this.clearHint()},hasFocus:function(){return this.$input.is(":focus")},hasOverflow:function(){var a=this.$input.width()-2;return this.$overflowHelper.text(this.getInputValue()),this.$overflowHelper.width()>=a},isCursorAtEnd:function(){var a,c,d;return a=this.$input.val().length,c=this.$input[0].selectionStart,b.isNumber(c)?c===a:document.selection?(d=document.selection.createRange(),d.moveStart("character",-a),a===d.text.length):!0},destroy:function(){this.$hint.off(".tt"),this.$input.off(".tt"),this.$overflowHelper.remove(),this.$hint=this.$input=this.$overflowHelper=a("<div>")}}),c}(),h=function(){"use strict";function c(c,e){c=c||{},c.templates=c.templates||{},c.templates.notFound=c.templates.notFound||c.templates.empty,c.source||a.error("missing source"),c.node||a.error("missing node"),c.name&&!h(c.name)&&a.error("invalid dataset name: "+c.name),e.mixin(this),this.highlight=!!c.highlight,this.name=c.name||j(),this.limit=c.limit||5,this.displayFn=d(c.display||c.displayKey),this.templates=g(c.templates,this.displayFn),this.source=c.source.__ttAdapter?c.source.__ttAdapter():c.source,this.async=b.isUndefined(c.async)?this.source.length>2:!!c.async,this._resetLastSuggestion(),this.$el=a(c.node).addClass(this.classes.dataset).addClass(this.classes.dataset+"-"+this.name)}function d(a){function c(b){return b[a]}return a=a||b.stringify,b.isFunction(a)?a:c}function g(c,d){function e(b){return a("<div>").text(d(b))}return{notFound:c.notFound&&b.templatify(c.notFound),pending:c.pending&&b.templatify(c.pending),header:c.header&&b.templatify(c.header),footer:c.footer&&b.templatify(c.footer),suggestion:c.suggestion||e}}function h(a){return/^[_a-zA-Z0-9-]+$/.test(a)}var i,j;return i={val:"tt-selectable-display",obj:"tt-selectable-object"},j=b.getIdGenerator(),c.extractData=function(b){var c=a(b);return c.data(i.obj)?{val:c.data(i.val)||"",obj:c.data(i.obj)||null}:null},b.mixin(c.prototype,e,{_overwrite:function(a,b){b=b||[],b.length?this._renderSuggestions(a,b):this.async&&this.templates.pending?this._renderPending(a):!this.async&&this.templates.notFound?this._renderNotFound(a):this._empty(),this.trigger("rendered",this.name,b,!1)},_append:function(a,b){b=b||[],b.length&&this.$lastSuggestion.length?this._appendSuggestions(a,b):b.length?this._renderSuggestions(a,b):!this.$lastSuggestion.length&&this.templates.notFound&&this._renderNotFound(a),this.trigger("rendered",this.name,b,!0)},_renderSuggestions:function(a,b){var c;c=this._getSuggestionsFragment(a,b),this.$lastSuggestion=c.children().last(),this.$el.html(c).prepend(this._getHeader(a,b)).append(this._getFooter(a,b))},_appendSuggestions:function(a,b){var c,d;c=this._getSuggestionsFragment(a,b),d=c.children().last(),this.$lastSuggestion.after(c),this.$lastSuggestion=d},_renderPending:function(a){var b=this.templates.pending;this._resetLastSuggestion(),b&&this.$el.html(b({query:a,dataset:this.name}))},_renderNotFound:function(a){var b=this.templates.notFound;this._resetLastSuggestion(),b&&this.$el.html(b({query:a,dataset:this.name}))},_empty:function(){this.$el.empty(),this._resetLastSuggestion()},_getSuggestionsFragment:function(c,d){var e,g=this;return e=document.createDocumentFragment(),b.each(d,function(b){var d,f;f=g._injectQuery(c,b),d=a(g.templates.suggestion(f)).data(i.obj,b).data(i.val,g.displayFn(b)).addClass(g.classes.suggestion+" "+g.classes.selectable),e.appendChild(d[0])}),this.highlight&&f({className:this.classes.highlight,node:e,pattern:c}),a(e)},_getFooter:function(a,b){return this.templates.footer?this.templates.footer({query:a,suggestions:b,dataset:this.name}):null},_getHeader:function(a,b){return this.templates.header?this.templates.header({query:a,suggestions:b,dataset:this.name}):null},_resetLastSuggestion:function(){this.$lastSuggestion=a()},_injectQuery:function(a,c){return b.isObject(c)?b.mixin({_query:a},c):c},update:function(b){function c(a){g||(g=!0,a=(a||[]).slice(0,e.limit),h=a.length,e._overwrite(b,a),h<e.limit&&e.async&&e.trigger("asyncRequested",b))}function d(c){c=c||[],!f&&h<e.limit&&(e.cancel=a.noop,h+=c.length,e._append(b,c.slice(0,e.limit-h)),e.async&&e.trigger("asyncReceived",b))}var e=this,f=!1,g=!1,h=0;this.cancel(),this.cancel=function(){f=!0,e.cancel=a.noop,e.async&&e.trigger("asyncCanceled",b)},this.source(b,c,d),!g&&c([])},cancel:a.noop,clear:function(){this._empty(),this.cancel(),this.trigger("cleared")},isEmpty:function(){return this.$el.is(":empty")},destroy:function(){this.$el=a("<div>")}}),c}(),i=function(){"use strict";function c(c,d){function e(b){var c=f.$node.find(b.node).first();return b.node=c.length?c:a("<div>").appendTo(f.$node),new h(b,d)}var f=this;c=c||{},c.node||a.error("node is required"),d.mixin(this),this.$node=a(c.node),this.query=null,this.datasets=b.map(c.datasets,e)}return b.mixin(c.prototype,e,{_onSelectableClick:function(b){this.trigger("selectableClicked",a(b.currentTarget))},_onRendered:function(a,b,c,d){this.$node.toggleClass(this.classes.empty,this._allDatasetsEmpty()),this.trigger("datasetRendered",b,c,d)},_onCleared:function(){this.$node.toggleClass(this.classes.empty,this._allDatasetsEmpty()),this.trigger("datasetCleared")},_propagate:function(){this.trigger.apply(this,arguments)},_allDatasetsEmpty:function(){function a(a){return a.isEmpty()}return b.every(this.datasets,a)},_getSelectables:function(){return this.$node.find(this.selectors.selectable)},_removeCursor:function(){var a=this.getActiveSelectable();a&&a.removeClass(this.classes.cursor)},_ensureVisible:function(a){var b,c,d,e;b=a.position().top,c=b+a.outerHeight(!0),d=this.$node.scrollTop(),e=this.$node.height()+parseInt(this.$node.css("paddingTop"),10)+parseInt(this.$node.css("paddingBottom"),10),0>b?this.$node.scrollTop(d+b):c>e&&this.$node.scrollTop(d+(c-e))},bind:function(){var a,c=this;return a=b.bind(this._onSelectableClick,this),this.$node.on("click.tt",this.selectors.selectable,a),b.each(this.datasets,function(a){a.onSync("asyncRequested",c._propagate,c).onSync("asyncCanceled",c._propagate,c).onSync("asyncReceived",c._propagate,c).onSync("rendered",c._onRendered,c).onSync("cleared",c._onCleared,c)}),this},isOpen:function(){return this.$node.hasClass(this.classes.open)},open:function(){this.$node.addClass(this.classes.open)},close:function(){this.$node.removeClass(this.classes.open),this._removeCursor()},setLanguageDirection:function(a){this.$node.attr("dir",a)},selectableRelativeToCursor:function(a){var b,c,d,e;return c=this.getActiveSelectable(),b=this._getSelectables(),d=c?b.index(c):-1,e=d+a,e=(e+1)%(b.length+1)-1,e=-1>e?b.length-1:e,-1===e?null:b.eq(e)},setCursor:function(a){this._removeCursor(),(a=a&&a.first())&&(a.addClass(this.classes.cursor),this._ensureVisible(a))},getSelectableData:function(a){return a&&a.length?h.extractData(a):null},getActiveSelectable:function(){var a=this._getSelectables().filter(this.selectors.cursor).first();return a.length?a:null},getTopSelectable:function(){var a=this._getSelectables().first();return a.length?a:null},update:function(a){function c(b){b.update(a)}var d=a!==this.query;return d&&(this.query=a,b.each(this.datasets,c)),d},empty:function(){function a(a){a.clear()}b.each(this.datasets,a),this.query=null,this.$node.addClass(this.classes.empty)},destroy:function(){function c(a){a.destroy()}this.$node.off(".tt"),this.$node=a("<div>"),b.each(this.datasets,c)}}),c}(),j=function(){"use strict";function a(){i.apply(this,[].slice.call(arguments,0))}var c=i.prototype;return b.mixin(a.prototype,i.prototype,{open:function(){return!this._allDatasetsEmpty()&&this._show(),c.open.apply(this,[].slice.call(arguments,0))},close:function(){return this._hide(),c.close.apply(this,[].slice.call(arguments,0))},_onRendered:function(){return this._allDatasetsEmpty()?this._hide():this.isOpen()&&this._show(),c._onRendered.apply(this,[].slice.call(arguments,0))},_onCleared:function(){return this._allDatasetsEmpty()?this._hide():this.isOpen()&&this._show(),c._onCleared.apply(this,[].slice.call(arguments,0))},setLanguageDirection:function(a){return this.$node.css("ltr"===a?this.css.ltr:this.css.rtl),c.setLanguageDirection.apply(this,[].slice.call(arguments,0))},_hide:function(){this.$node.hide()},_show:function(){this.$node.css("display","block")}}),a}(),k=function(){"use strict";function c(c,e){var f,g,h,i,j,k,l,m,n,o,p;c=c||{},c.input||a.error("missing input"),c.menu||a.error("missing menu"),c.eventBus||a.error("missing event bus"),e.mixin(this),this.eventBus=c.eventBus,this.minLength=b.isNumber(c.minLength)?c.minLength:1,this.input=c.input,this.menu=c.menu,this.enabled=!0,this.active=!1,this.input.hasFocus()&&this.activate(),this.dir=this.input.getLangDir(),this._hacks(),this.menu.bind().onSync("selectableClicked",this._onSelectableClicked,this).onSync("asyncRequested",this._onAsyncRequested,this).onSync("asyncCanceled",this._onAsyncCanceled,this).onSync("asyncReceived",this._onAsyncReceived,this).onSync("datasetRendered",this._onDatasetRendered,this).onSync("datasetCleared",this._onDatasetCleared,this),f=d(this,"activate","open","_onFocused"),g=d(this,"deactivate","_onBlurred"),h=d(this,"isActive","isOpen","_onEnterKeyed"),i=d(this,"isActive","isOpen","_onTabKeyed"),j=d(this,"isActive","_onEscKeyed"),k=d(this,"isActive","open","_onUpKeyed"),l=d(this,"isActive","open","_onDownKeyed"),m=d(this,"isActive","isOpen","_onLeftKeyed"),n=d(this,"isActive","isOpen","_onRightKeyed"),o=d(this,"_openIfActive","_onQueryChanged"),p=d(this,"_openIfActive","_onWhitespaceChanged"),this.input.bind().onSync("focused",f,this).onSync("blurred",g,this).onSync("enterKeyed",h,this).onSync("tabKeyed",i,this).onSync("escKeyed",j,this).onSync("upKeyed",k,this).onSync("downKeyed",l,this).onSync("leftKeyed",m,this).onSync("rightKeyed",n,this).onSync("queryChanged",o,this).onSync("whitespaceChanged",p,this).onSync("langDirChanged",this._onLangDirChanged,this)}function d(a){var c=[].slice.call(arguments,1);return function(){var d=[].slice.call(arguments);b.each(c,function(b){return a[b].apply(a,d)})}}return b.mixin(c.prototype,{_hacks:function(){var c,d;c=this.input.$input||a("<div>"),d=this.menu.$node||a("<div>"),c.on("blur.tt",function(a){var e,f,g;
e=document.activeElement,f=d.is(e),g=d.has(e).length>0,b.isMsie()&&(f||g)&&(a.preventDefault(),a.stopImmediatePropagation(),b.defer(function(){c.focus()}))}),d.on("mousedown.tt",function(a){a.preventDefault()})},_onSelectableClicked:function(a,b){this.select(b)},_onDatasetCleared:function(){this._updateHint()},_onDatasetRendered:function(a,b,c,d){this._updateHint(),this.eventBus.trigger("render",c,d,b)},_onAsyncRequested:function(a,b,c){this.eventBus.trigger("asyncrequest",c,b)},_onAsyncCanceled:function(a,b,c){this.eventBus.trigger("asynccancel",c,b)},_onAsyncReceived:function(a,b,c){this.eventBus.trigger("asyncreceive",c,b)},_onFocused:function(){this._minLengthMet()&&this.menu.update(this.input.getQuery())},_onBlurred:function(){this.input.hasQueryChangedSinceLastFocus()&&this.eventBus.trigger("change",this.input.getQuery())},_onEnterKeyed:function(a,b){var c;(c=this.menu.getActiveSelectable())&&this.select(c)&&b.preventDefault()},_onTabKeyed:function(a,b){var c;(c=this.menu.getActiveSelectable())?this.select(c)&&b.preventDefault():(c=this.menu.getTopSelectable())&&this.autocomplete(c)&&b.preventDefault()},_onEscKeyed:function(){this.close()},_onUpKeyed:function(){this.moveCursor(-1)},_onDownKeyed:function(){this.moveCursor(1)},_onLeftKeyed:function(){"rtl"===this.dir&&this.input.isCursorAtEnd()&&this.autocomplete(this.menu.getTopSelectable())},_onRightKeyed:function(){"ltr"===this.dir&&this.input.isCursorAtEnd()&&this.autocomplete(this.menu.getTopSelectable())},_onQueryChanged:function(a,b){this._minLengthMet(b)?this.menu.update(b):this.menu.empty()},_onWhitespaceChanged:function(){this._updateHint()},_onLangDirChanged:function(a,b){this.dir!==b&&(this.dir=b,this.menu.setLanguageDirection(b))},_openIfActive:function(){this.isActive()&&this.open()},_minLengthMet:function(a){return a=b.isString(a)?a:this.input.getQuery()||"",a.length>=this.minLength},_updateHint:function(){var a,c,d,e,f,h,i;a=this.menu.getTopSelectable(),c=this.menu.getSelectableData(a),d=this.input.getInputValue(),!c||b.isBlankString(d)||this.input.hasOverflow()?this.input.clearHint():(e=g.normalizeQuery(d),f=b.escapeRegExChars(e),h=new RegExp("^(?:"+f+")(.+$)","i"),i=h.exec(c.val),i&&this.input.setHint(d+i[1]))},isEnabled:function(){return this.enabled},enable:function(){this.enabled=!0},disable:function(){this.enabled=!1},isActive:function(){return this.active},activate:function(){return this.isActive()?!0:!this.isEnabled()||this.eventBus.before("active")?!1:(this.active=!0,this.eventBus.trigger("active"),!0)},deactivate:function(){return this.isActive()?this.eventBus.before("idle")?!1:(this.active=!1,this.close(),this.eventBus.trigger("idle"),!0):!0},isOpen:function(){return this.menu.isOpen()},open:function(){return this.isOpen()||this.eventBus.before("open")||(this.menu.open(),this._updateHint(),this.eventBus.trigger("open")),this.isOpen()},close:function(){return this.isOpen()&&!this.eventBus.before("close")&&(this.menu.close(),this.input.clearHint(),this.input.resetInputValue(),this.eventBus.trigger("close")),!this.isOpen()},setVal:function(a){this.input.setQuery(b.toStr(a))},getVal:function(){return this.input.getQuery()},select:function(a){var b=this.menu.getSelectableData(a);return b&&!this.eventBus.before("select",b.obj)?(this.input.setQuery(b.val,!0),this.eventBus.trigger("select",b.obj),this.close(),!0):!1},autocomplete:function(a){var b,c,d;return b=this.input.getQuery(),c=this.menu.getSelectableData(a),d=c&&b!==c.val,d&&!this.eventBus.before("autocomplete",c.obj)?(this.input.setQuery(c.val),this.eventBus.trigger("autocomplete",c.obj),!0):!1},moveCursor:function(a){var b,c,d,e,f;return b=this.input.getQuery(),c=this.menu.selectableRelativeToCursor(a),d=this.menu.getSelectableData(c),e=d?d.obj:null,f=this._minLengthMet()&&this.menu.update(b),f||this.eventBus.before("cursorchange",e)?!1:(this.menu.setCursor(c),d?this.input.setInputValue(d.val):(this.input.resetInputValue(),this._updateHint()),this.eventBus.trigger("cursorchange",e),!0)},destroy:function(){this.input.destroy(),this.menu.destroy()}}),c}();!function(){"use strict";function e(b,c){b.each(function(){var b,d=a(this);(b=d.data(p.typeahead))&&c(b,d)})}function f(a,b){return a.clone().addClass(b.classes.hint).removeData().css(b.css.hint).css(l(a)).prop("readonly",!0).removeAttr("id name placeholder required").attr({autocomplete:"off",spellcheck:"false",tabindex:-1})}function h(a,b){a.data(p.attrs,{dir:a.attr("dir"),autocomplete:a.attr("autocomplete"),spellcheck:a.attr("spellcheck"),style:a.attr("style")}),a.addClass(b.classes.input).attr({autocomplete:"off",spellcheck:!1});try{!a.attr("dir")&&a.attr("dir","auto")}catch(c){}return a}function l(a){return{backgroundAttachment:a.css("background-attachment"),backgroundClip:a.css("background-clip"),backgroundColor:a.css("background-color"),backgroundImage:a.css("background-image"),backgroundOrigin:a.css("background-origin"),backgroundPosition:a.css("background-position"),backgroundRepeat:a.css("background-repeat"),backgroundSize:a.css("background-size")}}function m(a){var c,d;c=a.data(p.www),d=a.parent().filter(c.selectors.wrapper),b.each(a.data(p.attrs),function(c,d){b.isUndefined(c)?a.removeAttr(d):a.attr(d,c)}),a.removeData(p.typeahead).removeData(p.www).removeData(p.attr).removeClass(c.classes.input),d.length&&(a.detach().insertAfter(d),d.remove())}function n(c){var d,e;return d=b.isJQuery(c)||b.isElement(c),e=d?a(c).first():[],e.length?e:null}var o,p,q;o=a.fn.typeahead,p={www:"tt-www",attrs:"tt-attrs",typeahead:"tt-typeahead"},q={initialize:function(e,l){function m(){var c,m,q,r,s,t,u,v,w,x,y;b.each(l,function(a){a.highlight=!!e.highlight}),c=a(this),m=a(o.html.wrapper),q=n(e.hint),r=n(e.menu),s=e.hint!==!1&&!q,t=e.menu!==!1&&!r,s&&(q=f(c,o)),t&&(r=a(o.html.menu).css(o.css.menu)),q&&q.val(""),c=h(c,o),(s||t)&&(m.css(o.css.wrapper),c.css(s?o.css.input:o.css.inputWithNoHint),c.wrap(m).parent().prepend(s?q:null).append(t?r:null)),y=t?j:i,u=new d({el:c}),v=new g({hint:q,input:c},o),w=new y({node:r,datasets:l},o),x=new k({input:v,menu:w,eventBus:u,minLength:e.minLength},o),c.data(p.www,o),c.data(p.typeahead,x)}var o;return l=b.isArray(l)?l:[].slice.call(arguments,1),e=e||{},o=c(e.classNames),this.each(m)},isEnabled:function(){var a;return e(this.first(),function(b){a=b.isEnabled()}),a},enable:function(){return e(this,function(a){a.enable()}),this},disable:function(){return e(this,function(a){a.disable()}),this},isActive:function(){var a;return e(this.first(),function(b){a=b.isActive()}),a},activate:function(){return e(this,function(a){a.activate()}),this},deactivate:function(){return e(this,function(a){a.deactivate()}),this},isOpen:function(){var a;return e(this.first(),function(b){a=b.isOpen()}),a},open:function(){return e(this,function(a){a.open()}),this},close:function(){return e(this,function(a){a.close()}),this},select:function(b){var c=!1,d=a(b);return e(this.first(),function(a){c=a.select(d)}),c},autocomplete:function(b){var c=!1,d=a(b);return e(this.first(),function(a){c=a.autocomplete(d)}),c},moveCursor:function(a){var b=!1;return e(this.first(),function(c){b=c.moveCursor(a)}),b},val:function(a){var b;return arguments.length?(e(this,function(b){b.setVal(a)}),this):(e(this.first(),function(a){b=a.getVal()}),b)},destroy:function(){return e(this,function(a,b){m(b),a.destroy()}),this}},a.fn.typeahead=function(a){return q[a]?q[a].apply(this,[].slice.call(arguments,1)):q.initialize.apply(this,arguments)},a.fn.typeahead.noConflict=function(){return a.fn.typeahead=o,this}}()});;/*!
 * Bootstrap Colorpicker - Bootstrap Colorpicker is a modular color picker plugin for Bootstrap 4.
 * @package bootstrap-colorpicker
 * @version v3.0.3
 * @license MIT
 * @link https://farbelous.github.io/bootstrap-colorpicker/
 * @link https://github.com/farbelous/bootstrap-colorpicker.git
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("jQuery"));
	else if(typeof define === 'function' && define.amd)
		define("bootstrap-colorpicker", ["jQuery"], factory);
	else if(typeof exports === 'object')
		exports["bootstrap-colorpicker"] = factory(require("jQuery"));
	else
		root["bootstrap-colorpicker"] = factory(root["jQuery"]);
})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE_0__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jquery = __webpack_require__(0);

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Colorpicker extension class.
 */
var Extension = function () {
  /**
   * @param {Colorpicker} colorpicker
   * @param {Object} options
   */
  function Extension(colorpicker) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Extension);

    /**
     * The colorpicker instance
     * @type {Colorpicker}
     */
    this.colorpicker = colorpicker;
    /**
     * Extension options
     *
     * @type {Object}
     */
    this.options = options;

    if (!(this.colorpicker.element && this.colorpicker.element.length)) {
      throw new Error('Extension: this.colorpicker.element is not valid');
    }

    this.colorpicker.element.on('colorpickerCreate.colorpicker-ext', _jquery2.default.proxy(this.onCreate, this));
    this.colorpicker.element.on('colorpickerDestroy.colorpicker-ext', _jquery2.default.proxy(this.onDestroy, this));
    this.colorpicker.element.on('colorpickerUpdate.colorpicker-ext', _jquery2.default.proxy(this.onUpdate, this));
    this.colorpicker.element.on('colorpickerChange.colorpicker-ext', _jquery2.default.proxy(this.onChange, this));
    this.colorpicker.element.on('colorpickerInvalid.colorpicker-ext', _jquery2.default.proxy(this.onInvalid, this));
    this.colorpicker.element.on('colorpickerShow.colorpicker-ext', _jquery2.default.proxy(this.onShow, this));
    this.colorpicker.element.on('colorpickerHide.colorpicker-ext', _jquery2.default.proxy(this.onHide, this));
    this.colorpicker.element.on('colorpickerEnable.colorpicker-ext', _jquery2.default.proxy(this.onEnable, this));
    this.colorpicker.element.on('colorpickerDisable.colorpicker-ext', _jquery2.default.proxy(this.onDisable, this));
  }

  /**
   * Function called every time a new color needs to be created.
   * Return false to skip this resolver and continue with other extensions' ones
   * or return anything else to consider the color resolved.
   *
   * @param {ColorItem|String|*} color
   * @param {boolean} realColor if true, the color should resolve into a real (not named) color code
   * @return {ColorItem|String|*}
   */


  _createClass(Extension, [{
    key: 'resolveColor',
    value: function resolveColor(color) {
      var realColor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      return false;
    }

    /**
     * Method called after the colorpicker is created
     *
     * @listens Colorpicker#colorpickerCreate
     * @param {Event} event
     */

  }, {
    key: 'onCreate',
    value: function onCreate(event) {}
    // to be extended


    /**
     * Method called after the colorpicker is destroyed
     *
     * @listens Colorpicker#colorpickerDestroy
     * @param {Event} event
     */

  }, {
    key: 'onDestroy',
    value: function onDestroy(event) {
      this.colorpicker.element.off('.colorpicker-ext');
    }

    /**
     * Method called after the colorpicker is updated
     *
     * @listens Colorpicker#colorpickerUpdate
     * @param {Event} event
     */

  }, {
    key: 'onUpdate',
    value: function onUpdate(event) {}
    // to be extended


    /**
     * Method called after the colorpicker color is changed
     *
     * @listens Colorpicker#colorpickerChange
     * @param {Event} event
     */

  }, {
    key: 'onChange',
    value: function onChange(event) {}
    // to be extended


    /**
     * Method called when the colorpicker color is invalid
     *
     * @listens Colorpicker#colorpickerInvalid
     * @param {Event} event
     */

  }, {
    key: 'onInvalid',
    value: function onInvalid(event) {}
    // to be extended


    /**
     * Method called after the colorpicker is hidden
     *
     * @listens Colorpicker#colorpickerHide
     * @param {Event} event
     */

  }, {
    key: 'onHide',
    value: function onHide(event) {}
    // to be extended


    /**
     * Method called after the colorpicker is shown
     *
     * @listens Colorpicker#colorpickerShow
     * @param {Event} event
     */

  }, {
    key: 'onShow',
    value: function onShow(event) {}
    // to be extended


    /**
     * Method called after the colorpicker is disabled
     *
     * @listens Colorpicker#colorpickerDisable
     * @param {Event} event
     */

  }, {
    key: 'onDisable',
    value: function onDisable(event) {}
    // to be extended


    /**
     * Method called after the colorpicker is enabled
     *
     * @listens Colorpicker#colorpickerEnable
     * @param {Event} event
     */

  }, {
    key: 'onEnable',
    value: function onEnable(event) {
      // to be extended
    }
  }]);

  return Extension;
}();

exports.default = Extension;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ColorItem = exports.HSVAColor = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Color manipulation class, specific for Bootstrap Colorpicker
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _color = __webpack_require__(16);

var _color2 = _interopRequireDefault(_color);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * HSVA color data class, containing the hue, saturation, value and alpha
 * information.
 */
var HSVAColor = function () {
  /**
   * @param {number|int} h
   * @param {number|int} s
   * @param {number|int} v
   * @param {number|int} a
   */
  function HSVAColor(h, s, v, a) {
    _classCallCheck(this, HSVAColor);

    this.h = isNaN(h) ? 0 : h;
    this.s = isNaN(s) ? 0 : s;
    this.v = isNaN(v) ? 0 : v;
    this.a = isNaN(h) ? 1 : a;
  }

  _createClass(HSVAColor, [{
    key: 'toString',
    value: function toString() {
      return this.h + ', ' + this.s + '%, ' + this.v + '%, ' + this.a;
    }
  }]);

  return HSVAColor;
}();

/**
 * HSVA color manipulation
 */


var ColorItem = function () {
  _createClass(ColorItem, [{
    key: 'api',


    /**
     * Applies a method of the QixColor API and returns a new Color object or
     * the return value of the method call.
     *
     * If no argument is provided, the internal QixColor object is returned.
     *
     * @param {String} fn QixColor function name
     * @param args QixColor function arguments
     * @example let darkerColor = color.api('darken', 0.25);
     * @example let luminosity = color.api('luminosity');
     * @example color = color.api('negate');
     * @example let qColor = color.api().negate();
     * @returns {ColorItem|QixColor|*}
     */
    value: function api(fn) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      if (arguments.length === 0) {
        return this._color;
      }

      var result = this._color[fn].apply(this._color, args);

      if (!(result instanceof _color2.default)) {
        // return result of the method call
        return result;
      }

      return new ColorItem(result, this.format);
    }

    /**
     * Returns the original ColorItem constructor data,
     * plus a 'valid' flag to know if it's valid or not.
     *
     * @returns {{color: *, format: String, valid: boolean}}
     */

  }, {
    key: 'original',
    get: function get() {
      return this._original;
    }

    /**
     * @param {ColorItem|HSVAColor|QixColor|String|*|null} color Color data
     * @param {String|null} format Color model to convert to by default. Supported: 'rgb', 'hsl', 'hex'.
     */

  }], [{
    key: 'HSVAColor',


    /**
     * Returns the HSVAColor class
     *
     * @static
     * @example let colorData = new ColorItem.HSVAColor(360, 100, 100, 1);
     * @returns {HSVAColor}
     */
    get: function get() {
      return HSVAColor;
    }
  }]);

  function ColorItem() {
    var color = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    _classCallCheck(this, ColorItem);

    this.replace(color, format);
  }

  /**
   * Replaces the internal QixColor object with a new one.
   * This also replaces the internal original color data.
   *
   * @param {ColorItem|HSVAColor|QixColor|String|*|null} color Color data to be parsed (if needed)
   * @param {String|null} format Color model to convert to by default. Supported: 'rgb', 'hsl', 'hex'.
   * @example color.replace('rgb(255,0,0)', 'hsl');
   * @example color.replace(hsvaColorData);
   */


  _createClass(ColorItem, [{
    key: 'replace',
    value: function replace(color) {
      var format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var fallback = null;

      format = ColorItem.sanitizeFormat(format);

      /**
       * @type {{color: *, format: String}}
       * @private
       */
      this._original = {
        color: color,
        format: format,
        valid: true
      };
      /**
       * @type {QixColor}
       * @private
       */
      this._color = ColorItem.parse(color);

      if (this._color === null) {
        this._color = (0, _color2.default)(fallback);
        this._original.valid = false;
        return;
      }

      /**
       * @type {*|string}
       * @private
       */
      this._format = format ? format : ColorItem.isHex(color) ? 'hex' : this._color.model;
    }

    /**
     * Parses the color returning a Qix Color object or null if cannot be
     * parsed.
     *
     * @param {ColorItem|HSVAColor|QixColor|String|*|null} color Color data
     * @example let qColor = ColorItem.parse('rgb(255,0,0)');
     * @static
     * @returns {QixColor|null}
     */

  }, {
    key: 'isValid',


    /**
     * Returns true if the color is valid, false if not.
     *
     * @returns {boolean}
     */
    value: function isValid() {
      return this._original.valid === true;
    }

    /**
     * Hue value from 0 to 360
     *
     * @returns {int}
     */

  }, {
    key: 'setHueRatio',


    /**
     * Sets the hue ratio, where 1.0 is 0, 0.5 is 180 and 0.0 is 360.
     *
     * @ignore
     * @param {number} h Ratio from 1.0 to 0.0
     */
    value: function setHueRatio(h) {
      this.hue = (1 - h) * 360;
    }

    /**
     * Sets the saturation value
     *
     * @param {int} value Integer from 0 to 100
     */

  }, {
    key: 'setSaturationRatio',


    /**
     * Sets the saturation ratio, where 1.0 is 100 and 0.0 is 0.
     *
     * @ignore
     * @param {number} s Ratio from 0.0 to 1.0
     */
    value: function setSaturationRatio(s) {
      this.saturation = s * 100;
    }

    /**
     * Sets the 'value' channel value
     *
     * @param {int} value Integer from 0 to 100
     */

  }, {
    key: 'setValueRatio',


    /**
     * Sets the value ratio, where 1.0 is 0 and 0.0 is 100.
     *
     * @ignore
     * @param {number} v Ratio from 1.0 to 0.0
     */
    value: function setValueRatio(v) {
      this.value = (1 - v) * 100;
    }

    /**
     * Sets the alpha value. It will be rounded to 2 decimals.
     *
     * @param {int} value Float from 0.0 to 1.0
     */

  }, {
    key: 'setAlphaRatio',


    /**
     * Sets the alpha ratio, where 1.0 is 0.0 and 0.0 is 1.0.
     *
     * @ignore
     * @param {number} a Ratio from 1.0 to 0.0
     */
    value: function setAlphaRatio(a) {
      this.alpha = 1 - a;
    }

    /**
     * Sets the default color format
     *
     * @param {String} value Supported: 'rgb', 'hsl', 'hex'
     */

  }, {
    key: 'isDesaturated',


    /**
     * Returns true if the saturation value is zero, false otherwise
     *
     * @returns {boolean}
     */
    value: function isDesaturated() {
      return this.saturation === 0;
    }

    /**
     * Returns true if the alpha value is zero, false otherwise
     *
     * @returns {boolean}
     */

  }, {
    key: 'isTransparent',
    value: function isTransparent() {
      return this.alpha === 0;
    }

    /**
     * Returns true if the alpha value is numeric and less than 1, false otherwise
     *
     * @returns {boolean}
     */

  }, {
    key: 'hasTransparency',
    value: function hasTransparency() {
      return this.hasAlpha() && this.alpha < 1;
    }

    /**
     * Returns true if the alpha value is numeric, false otherwise
     *
     * @returns {boolean}
     */

  }, {
    key: 'hasAlpha',
    value: function hasAlpha() {
      return !isNaN(this.alpha);
    }

    /**
     * Returns a new HSVAColor object, based on the current color
     *
     * @returns {HSVAColor}
     */

  }, {
    key: 'toObject',
    value: function toObject() {
      return new HSVAColor(this.hue, this.saturation, this.value, this.alpha);
    }

    /**
     * Alias of toObject()
     *
     * @returns {HSVAColor}
     */

  }, {
    key: 'toHsva',
    value: function toHsva() {
      return this.toObject();
    }

    /**
     * Returns a new HSVAColor object with the ratio values (from 0.0 to 1.0),
     * based on the current color.
     *
     * @ignore
     * @returns {HSVAColor}
     */

  }, {
    key: 'toHsvaRatio',
    value: function toHsvaRatio() {
      return new HSVAColor(this.hue / 360, this.saturation / 100, this.value / 100, this.alpha);
    }

    /**
     * Converts the current color to its string representation,
     * using the internal format of this instance.
     *
     * @returns {String}
     */

  }, {
    key: 'toString',
    value: function toString() {
      return this.string();
    }

    /**
     * Converts the current color to its string representation,
     * using the given format.
     *
     * @param {String|null} format Format to convert to. If empty or null, the internal format will be used.
     * @returns {String}
     */

  }, {
    key: 'string',
    value: function string() {
      var format = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      format = ColorItem.sanitizeFormat(format ? format : this.format);

      if (!format) {
        return this._color.round().string();
      }

      if (this._color[format] === undefined) {
        throw new Error('Unsupported color format: \'' + format + '\'');
      }

      var str = this._color[format]();

      return str.round ? str.round().string() : str;
    }

    /**
     * Returns true if the given color values equals this one, false otherwise.
     * The format is not compared.
     * If any of the colors is invalid, the result will be false.
     *
     * @param {ColorItem|HSVAColor|QixColor|String|*|null} color Color data
     *
     * @returns {boolean}
     */

  }, {
    key: 'equals',
    value: function equals(color) {
      color = color instanceof ColorItem ? color : new ColorItem(color);

      if (!color.isValid() || !this.isValid()) {
        return false;
      }

      return this.hue === color.hue && this.saturation === color.saturation && this.value === color.value && this.alpha === color.alpha;
    }

    /**
     * Creates a copy of this instance
     *
     * @returns {ColorItem}
     */

  }, {
    key: 'getClone',
    value: function getClone() {
      return new ColorItem(this._color, this.format);
    }

    /**
     * Creates a copy of this instance, only copying the hue value,
     * and setting the others to its max value.
     *
     * @returns {ColorItem}
     */

  }, {
    key: 'getCloneHueOnly',
    value: function getCloneHueOnly() {
      return new ColorItem([this.hue, 100, 100, 1], this.format);
    }

    /**
     * Creates a copy of this instance setting the alpha to the max.
     *
     * @returns {ColorItem}
     */

  }, {
    key: 'getCloneOpaque',
    value: function getCloneOpaque() {
      return new ColorItem(this._color.alpha(1), this.format);
    }

    /**
     * Converts the color to a RGB string
     *
     * @returns {String}
     */

  }, {
    key: 'toRgbString',
    value: function toRgbString() {
      return this.string('rgb');
    }

    /**
     * Converts the color to a Hexadecimal string
     *
     * @returns {String}
     */

  }, {
    key: 'toHexString',
    value: function toHexString() {
      return this.string('hex');
    }

    /**
     * Converts the color to a HSL string
     *
     * @returns {String}
     */

  }, {
    key: 'toHslString',
    value: function toHslString() {
      return this.string('hsl');
    }

    /**
     * Returns true if the color is dark, false otherwhise.
     * This is useful to decide a text color.
     *
     * @returns {boolean}
     */

  }, {
    key: 'isDark',
    value: function isDark() {
      return this._color.isDark();
    }

    /**
     * Returns true if the color is light, false otherwhise.
     * This is useful to decide a text color.
     *
     * @returns {boolean}
     */

  }, {
    key: 'isLight',
    value: function isLight() {
      return this._color.isLight();
    }

    /**
     * Generates a list of colors using the given hue-based formula or the given array of hue values.
     * Hue formulas can be extended using ColorItem.colorFormulas static property.
     *
     * @param {String|Number[]} formula Examples: 'complementary', 'triad', 'tetrad', 'splitcomplement', [180, 270]
     * @example let colors = color.generate('triad');
     * @example let colors = color.generate([45, 80, 112, 200]);
     * @returns {ColorItem[]}
     */

  }, {
    key: 'generate',
    value: function generate(formula) {
      var hues = [];

      if (Array.isArray(formula)) {
        hues = formula;
      } else if (!ColorItem.colorFormulas.hasOwnProperty(formula)) {
        throw new Error('No color formula found with the name \'' + formula + '\'.');
      } else {
        hues = ColorItem.colorFormulas[formula];
      }

      var colors = [],
          mainColor = this._color,
          format = this.format;

      hues.forEach(function (hue) {
        var levels = [hue ? (mainColor.hue() + hue) % 360 : mainColor.hue(), mainColor.saturationv(), mainColor.value(), mainColor.alpha()];

        colors.push(new ColorItem(levels, format));
      });

      return colors;
    }
  }, {
    key: 'hue',
    get: function get() {
      return this._color.hue();
    }

    /**
     * Saturation value from 0 to 100
     *
     * @returns {int}
     */
    ,


    /**
     * Sets the hue value
     *
     * @param {int} value Integer from 0 to 360
     */
    set: function set(value) {
      this._color = this._color.hue(value);
    }
  }, {
    key: 'saturation',
    get: function get() {
      return this._color.saturationv();
    }

    /**
     * Value channel value from 0 to 100
     *
     * @returns {int}
     */
    ,
    set: function set(value) {
      this._color = this._color.saturationv(value);
    }
  }, {
    key: 'value',
    get: function get() {
      return this._color.value();
    }

    /**
     * Alpha value from 0.0 to 1.0
     *
     * @returns {number}
     */
    ,
    set: function set(value) {
      this._color = this._color.value(value);
    }
  }, {
    key: 'alpha',
    get: function get() {
      var a = this._color.alpha();

      return isNaN(a) ? 1 : a;
    }

    /**
     * Default color format to convert to when calling toString() or string()
     *
     * @returns {String} 'rgb', 'hsl', 'hex' or ''
     */
    ,
    set: function set(value) {
      // 2 decimals max
      this._color = this._color.alpha(Math.round(value * 100) / 100);
    }
  }, {
    key: 'format',
    get: function get() {
      return this._format ? this._format : this._color.model;
    },
    set: function set(value) {
      this._format = ColorItem.sanitizeFormat(value);
    }
  }], [{
    key: 'parse',
    value: function parse(color) {
      if (color instanceof _color2.default) {
        return color;
      }

      if (color instanceof ColorItem) {
        return color._color;
      }

      var format = null;

      if (color instanceof HSVAColor) {
        color = [color.h, color.s, color.v, isNaN(color.a) ? 1 : color.a];
      } else {
        color = ColorItem.sanitizeString(color);
      }

      if (Array.isArray(color)) {
        format = 'hsv';
      }

      try {
        return (0, _color2.default)(color, format);
      } catch (e) {
        return null;
      }
    }

    /**
     * Sanitizes a color string, adding missing hash to hexadecimal colors
     * and converting 'transparent' to a color code.
     *
     * @param {String|*} str Color string
     * @example let colorStr = ColorItem.sanitizeString('ffaa00');
     * @static
     * @returns {String|*}
     */

  }, {
    key: 'sanitizeString',
    value: function sanitizeString(str) {
      if (!(typeof str === 'string' || str instanceof String)) {
        return str;
      }

      if (str.match(/^[0-9a-f]{2,}$/i)) {
        return '#' + str;
      }

      if (str.toLowerCase() === 'transparent') {
        return '#FFFFFF00';
      }

      return str;
    }

    /**
     * Detects if a value is a string and a color in hexadecimal format (in any variant).
     *
     * @param {String} str
     * @example ColorItem.isHex('rgba(0,0,0)'); // false
     * @example ColorItem.isHex('ffaa00'); // true
     * @example ColorItem.isHex('#ffaa00'); // true
     * @static
     * @returns {boolean}
     */

  }, {
    key: 'isHex',
    value: function isHex(str) {
      if (!(typeof str === 'string' || str instanceof String)) {
        return false;
      }

      return !!str.match(/^#?[0-9a-f]{2,}$/i);
    }

    /**
     * Sanitizes a color format to one supported by web browsers.
     * Returns an empty string of the format can't be recognised.
     *
     * @param {String|*} format
     * @example ColorItem.sanitizeFormat('rgba'); // 'rgb'
     * @example ColorItem.isHex('hex8'); // 'hex'
     * @example ColorItem.isHex('invalid'); // ''
     * @static
     * @returns {String} 'rgb', 'hsl', 'hex' or ''.
     */

  }, {
    key: 'sanitizeFormat',
    value: function sanitizeFormat(format) {
      switch (format) {
        case 'hex':
        case 'hex3':
        case 'hex4':
        case 'hex6':
        case 'hex8':
          return 'hex';
        case 'rgb':
        case 'rgba':
        case 'keyword':
        case 'name':
          return 'rgb';
        case 'hsl':
        case 'hsla':
        case 'hsv':
        case 'hsva':
        case 'hwb': // HWB this is supported by Qix Color, but not by browsers
        case 'hwba':
          return 'hsl';
        default:
          return '';
      }
    }
  }]);

  return ColorItem;
}();

/**
 * List of hue-based color formulas used by ColorItem.prototype.generate()
 *
 * @static
 * @type {{complementary: number[], triad: number[], tetrad: number[], splitcomplement: number[]}}
 */


ColorItem.colorFormulas = {
  complementary: [180],
  triad: [0, 120, 240],
  tetrad: [0, 90, 180, 270],
  splitcomplement: [0, 72, 216]
};

exports.default = ColorItem;
exports.HSVAColor = HSVAColor;
exports.ColorItem = ColorItem;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * @module
 */

// adjust these values accordingly to the sass vars

Object.defineProperty(exports, "__esModule", {
  value: true
});
var sassVars = {
  'bar_size_short': 16,
  'base_margin': 6,
  'columns': 6
};

var sliderSize = sassVars.bar_size_short * sassVars.columns + sassVars.base_margin * (sassVars.columns - 1);

/**
 * Colorpicker default options
 */
exports.default = {
  /**
   * Custom class to be added to the `.colorpicker-element` element
   *
   * @type {String|null}
   * @default null
   */
  customClass: null,
  /**
   * Sets a initial color, ignoring the one from the element/input value or the data-color attribute.
   *
   * @type {(String|ColorItem|boolean)}
   * @default false
   */
  color: false,
  /**
   * Fallback color to use when the given color is invalid.
   * If false, the latest valid color will be used as a fallback.
   *
   * @type {String|ColorItem|boolean}
   * @default false
   */
  fallbackColor: false,
  /**
   * Forces an specific color format. If 'auto', it will be automatically detected the first time only,
   * but if null it will be always recalculated.
   *
   * Note that the ending 'a' of the format meaning "alpha" has currently no effect, meaning that rgb is the same as
   * rgba excepting if the alpha channel is disabled (see useAlpha).
   *
   * @type {('rgb'|'hex'|'hsl'|'auto'|null)}
   * @default null
   */
  format: null,
  /**
   * Horizontal mode layout.
   *
   * If true, the hue and alpha channel bars will be rendered horizontally, above the saturation selector.
   *
   * @type {boolean}
   * @default false
   */
  horizontal: false,
  /**
   * Forces to show the colorpicker as an inline element.
   *
   * Note that if there is no container specified, the inline element
   * will be added to the body, so you may want to set the container option.
   *
   * @type {boolean}
   * @default false
   */
  inline: false,
  /**
   * Container where the colorpicker is appended to in the DOM.
   *
   * If is a string (CSS selector), the colorpicker will be placed inside this container.
   * If true, the `.colorpicker-element` element itself will be used as the container.
   * If false, the document body is used as the container, unless it is a popover (in this case it is appended to the
   * popover body instead).
   *
   * @type {String|boolean}
   * @default false
   */
  container: false,
  /**
   * Bootstrap Popover options.
   * The trigger, content and html options are always ignored.
   *
   * @type {boolean}
   * @default Object
   */
  popover: {
    animation: true,
    placement: 'bottom',
    fallbackPlacement: 'flip'
  },
  /**
   * If true, loads the 'debugger' extension automatically, which logs the events in the console
   * @type {boolean}
   * @default false
   */
  debug: false,
  /**
   * Child CSS selector for the colorpicker input.
   *
   * @type {String}
   * @default 'input'
   */
  input: 'input',
  /**
   * Child CSS selector for the colorpicker addon.
   * If it exists, the child <i> element background will be changed on color change.
   *
   * @type {String}
   * @default '.colorpicker-trigger, .colorpicker-input-addon'
   */
  addon: '.colorpicker-input-addon',
  /**
   * If true, the input content will be replaced always with a valid color,
   * if false, the invalid color will be left in the input,
   *   while the internal color object will still resolve into a valid one.
   *
   * @type {boolean}
   * @default true
   */
  autoInputFallback: true,
  /**
   * If true a hash will be prepended to hexadecimal colors.
   * If false, the hash will be removed.
   * This only affects the input values in hexadecimal format.
   *
   * @type {boolean}
   * @default true
   */
  useHashPrefix: true,
  /**
   * If true, the alpha channel bar will be displayed no matter what.
   *
   * If false, it will be always hidden and alpha channel will be disabled also programmatically, meaning that
   * the selected or typed color will be always opaque.
   *
   * If null, the alpha channel will be automatically disabled/enabled depending if the initial color format supports
   * alpha or not.
   *
   * @type {boolean}
   * @default true
   */
  useAlpha: true,
  /**
   * Colorpicker widget template
   * @type {String}
   * @example
   * <!-- This is the default template: -->
   * <div class="colorpicker">
   *   <div class="colorpicker-saturation"><i class="colorpicker-guide"></i></div>
   *   <div class="colorpicker-hue"><i class="colorpicker-guide"></i></div>
   *   <div class="colorpicker-alpha">
   *     <div class="colorpicker-alpha-color"></div>
   *     <i class="colorpicker-guide"></i>
   *   </div>
   * </div>
   */
  template: '<div class="colorpicker">\n      <div class="colorpicker-saturation"><i class="colorpicker-guide"></i></div>\n      <div class="colorpicker-hue"><i class="colorpicker-guide"></i></div>\n      <div class="colorpicker-alpha">\n        <div class="colorpicker-alpha-color"></div>\n        <i class="colorpicker-guide"></i>\n      </div>\n    </div>',
  /**
   *
   * Associative object with the extension class name and its config.
   * Colorpicker comes with many bundled extensions: debugger, palette, preview and swatches (a superset of palette).
   *
   * @type {Object[]}
   * @example
   *   extensions: [
   *     {
   *       name: 'swatches'
   *       options: {
   *         colors: {
   *           'primary': '#337ab7',
   *           'success': '#5cb85c',
   *           'info': '#5bc0de',
   *           'warning': '#f0ad4e',
   *           'danger': '#d9534f'
   *         },
   *         namesAsValues: true
   *       }
   *     }
   *   ]
   */
  extensions: [{
    name: 'preview',
    options: {
      showText: true
    }
  }],
  /**
   * Vertical sliders configuration
   * @type {Object}
   */
  sliders: {
    saturation: {
      selector: '.colorpicker-saturation',
      maxLeft: sliderSize,
      maxTop: sliderSize,
      callLeft: 'setSaturationRatio',
      callTop: 'setValueRatio'
    },
    hue: {
      selector: '.colorpicker-hue',
      maxLeft: 0,
      maxTop: sliderSize,
      callLeft: false,
      callTop: 'setHueRatio'
    },
    alpha: {
      selector: '.colorpicker-alpha',
      childSelector: '.colorpicker-alpha-color',
      maxLeft: 0,
      maxTop: sliderSize,
      callLeft: false,
      callTop: 'setAlphaRatio'
    }
  },
  /**
   * Horizontal sliders configuration
   * @type {Object}
   */
  slidersHorz: {
    saturation: {
      selector: '.colorpicker-saturation',
      maxLeft: sliderSize,
      maxTop: sliderSize,
      callLeft: 'setSaturationRatio',
      callTop: 'setValueRatio'
    },
    hue: {
      selector: '.colorpicker-hue',
      maxLeft: sliderSize,
      maxTop: 0,
      callLeft: 'setHueRatio',
      callTop: false
    },
    alpha: {
      selector: '.colorpicker-alpha',
      childSelector: '.colorpicker-alpha-color',
      maxLeft: sliderSize,
      maxTop: 0,
      callLeft: 'setAlphaRatio',
      callTop: false
    }
  }
};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Extension2 = __webpack_require__(1);

var _Extension3 = _interopRequireDefault(_Extension2);

var _jquery = __webpack_require__(0);

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var defaults = {
  /**
   * Key-value pairs defining a color alias and its CSS color representation.
   *
   * They can also be just an array of values. In that case, no special names are used, only the real colors.
   *
   * @type {Object|Array}
   * @default null
   * @example
   *  {
   *   'black': '#000000',
   *   'white': '#ffffff',
   *   'red': '#FF0000',
   *   'default': '#777777',
   *   'primary': '#337ab7',
   *   'success': '#5cb85c',
   *   'info': '#5bc0de',
   *   'warning': '#f0ad4e',
   *   'danger': '#d9534f'
   *  }
   *
   * @example ['#f0ad4e', '#337ab7', '#5cb85c']
   */
  colors: null,
  /**
   * If true, when a color swatch is selected the name (alias) will be used as input value,
   * otherwise the swatch real color value will be used.
   *
   * @type {boolean}
   * @default true
   */
  namesAsValues: true
};

/**
 * Palette extension
 * @ignore
 */

var Palette = function (_Extension) {
  _inherits(Palette, _Extension);

  _createClass(Palette, [{
    key: 'colors',


    /**
     * @returns {Object|Array}
     */
    get: function get() {
      return this.options.colors;
    }
  }]);

  function Palette(colorpicker) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Palette);

    var _this = _possibleConstructorReturn(this, (Palette.__proto__ || Object.getPrototypeOf(Palette)).call(this, colorpicker, _jquery2.default.extend(true, {}, defaults, options)));

    if (!Array.isArray(_this.options.colors) && _typeof(_this.options.colors) !== 'object') {
      _this.options.colors = null;
    }
    return _this;
  }

  /**
   * @returns {int}
   */


  _createClass(Palette, [{
    key: 'getLength',
    value: function getLength() {
      if (!this.options.colors) {
        return 0;
      }

      if (Array.isArray(this.options.colors)) {
        return this.options.colors.length;
      }

      if (_typeof(this.options.colors) === 'object') {
        return Object.keys(this.options.colors).length;
      }

      return 0;
    }
  }, {
    key: 'resolveColor',
    value: function resolveColor(color) {
      var realColor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      if (this.getLength() <= 0) {
        return false;
      }

      // Array of colors
      if (Array.isArray(this.options.colors)) {
        if (this.options.colors.indexOf(color) >= 0) {
          return color;
        }
        if (this.options.colors.indexOf(color.toUpperCase()) >= 0) {
          return color.toUpperCase();
        }
        if (this.options.colors.indexOf(color.toLowerCase()) >= 0) {
          return color.toLowerCase();
        }
        return false;
      }

      if (_typeof(this.options.colors) !== 'object') {
        return false;
      }

      // Map of objects
      if (!this.options.namesAsValues || realColor) {
        return this.getValue(color, false);
      }
      return this.getName(color, this.getName('#' + color));
    }

    /**
     * Given a color value, returns the corresponding color name or defaultValue.
     *
     * @param {String} value
     * @param {*} defaultValue
     * @returns {*}
     */

  }, {
    key: 'getName',
    value: function getName(value) {
      var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (!(typeof value === 'string') || !this.options.colors) {
        return defaultValue;
      }
      for (var name in this.options.colors) {
        if (!this.options.colors.hasOwnProperty(name)) {
          continue;
        }
        if (this.options.colors[name].toLowerCase() === value.toLowerCase()) {
          return name;
        }
      }
      return defaultValue;
    }

    /**
     * Given a color name, returns the corresponding color value or defaultValue.
     *
     * @param {String} name
     * @param {*} defaultValue
     * @returns {*}
     */

  }, {
    key: 'getValue',
    value: function getValue(name) {
      var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (!(typeof name === 'string') || !this.options.colors) {
        return defaultValue;
      }
      if (this.options.colors.hasOwnProperty(name)) {
        return this.options.colors[name];
      }
      return defaultValue;
    }
  }]);

  return Palette;
}(_Extension3.default);

exports.default = Palette;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = {
	"aliceblue": [240, 248, 255],
	"antiquewhite": [250, 235, 215],
	"aqua": [0, 255, 255],
	"aquamarine": [127, 255, 212],
	"azure": [240, 255, 255],
	"beige": [245, 245, 220],
	"bisque": [255, 228, 196],
	"black": [0, 0, 0],
	"blanchedalmond": [255, 235, 205],
	"blue": [0, 0, 255],
	"blueviolet": [138, 43, 226],
	"brown": [165, 42, 42],
	"burlywood": [222, 184, 135],
	"cadetblue": [95, 158, 160],
	"chartreuse": [127, 255, 0],
	"chocolate": [210, 105, 30],
	"coral": [255, 127, 80],
	"cornflowerblue": [100, 149, 237],
	"cornsilk": [255, 248, 220],
	"crimson": [220, 20, 60],
	"cyan": [0, 255, 255],
	"darkblue": [0, 0, 139],
	"darkcyan": [0, 139, 139],
	"darkgoldenrod": [184, 134, 11],
	"darkgray": [169, 169, 169],
	"darkgreen": [0, 100, 0],
	"darkgrey": [169, 169, 169],
	"darkkhaki": [189, 183, 107],
	"darkmagenta": [139, 0, 139],
	"darkolivegreen": [85, 107, 47],
	"darkorange": [255, 140, 0],
	"darkorchid": [153, 50, 204],
	"darkred": [139, 0, 0],
	"darksalmon": [233, 150, 122],
	"darkseagreen": [143, 188, 143],
	"darkslateblue": [72, 61, 139],
	"darkslategray": [47, 79, 79],
	"darkslategrey": [47, 79, 79],
	"darkturquoise": [0, 206, 209],
	"darkviolet": [148, 0, 211],
	"deeppink": [255, 20, 147],
	"deepskyblue": [0, 191, 255],
	"dimgray": [105, 105, 105],
	"dimgrey": [105, 105, 105],
	"dodgerblue": [30, 144, 255],
	"firebrick": [178, 34, 34],
	"floralwhite": [255, 250, 240],
	"forestgreen": [34, 139, 34],
	"fuchsia": [255, 0, 255],
	"gainsboro": [220, 220, 220],
	"ghostwhite": [248, 248, 255],
	"gold": [255, 215, 0],
	"goldenrod": [218, 165, 32],
	"gray": [128, 128, 128],
	"green": [0, 128, 0],
	"greenyellow": [173, 255, 47],
	"grey": [128, 128, 128],
	"honeydew": [240, 255, 240],
	"hotpink": [255, 105, 180],
	"indianred": [205, 92, 92],
	"indigo": [75, 0, 130],
	"ivory": [255, 255, 240],
	"khaki": [240, 230, 140],
	"lavender": [230, 230, 250],
	"lavenderblush": [255, 240, 245],
	"lawngreen": [124, 252, 0],
	"lemonchiffon": [255, 250, 205],
	"lightblue": [173, 216, 230],
	"lightcoral": [240, 128, 128],
	"lightcyan": [224, 255, 255],
	"lightgoldenrodyellow": [250, 250, 210],
	"lightgray": [211, 211, 211],
	"lightgreen": [144, 238, 144],
	"lightgrey": [211, 211, 211],
	"lightpink": [255, 182, 193],
	"lightsalmon": [255, 160, 122],
	"lightseagreen": [32, 178, 170],
	"lightskyblue": [135, 206, 250],
	"lightslategray": [119, 136, 153],
	"lightslategrey": [119, 136, 153],
	"lightsteelblue": [176, 196, 222],
	"lightyellow": [255, 255, 224],
	"lime": [0, 255, 0],
	"limegreen": [50, 205, 50],
	"linen": [250, 240, 230],
	"magenta": [255, 0, 255],
	"maroon": [128, 0, 0],
	"mediumaquamarine": [102, 205, 170],
	"mediumblue": [0, 0, 205],
	"mediumorchid": [186, 85, 211],
	"mediumpurple": [147, 112, 219],
	"mediumseagreen": [60, 179, 113],
	"mediumslateblue": [123, 104, 238],
	"mediumspringgreen": [0, 250, 154],
	"mediumturquoise": [72, 209, 204],
	"mediumvioletred": [199, 21, 133],
	"midnightblue": [25, 25, 112],
	"mintcream": [245, 255, 250],
	"mistyrose": [255, 228, 225],
	"moccasin": [255, 228, 181],
	"navajowhite": [255, 222, 173],
	"navy": [0, 0, 128],
	"oldlace": [253, 245, 230],
	"olive": [128, 128, 0],
	"olivedrab": [107, 142, 35],
	"orange": [255, 165, 0],
	"orangered": [255, 69, 0],
	"orchid": [218, 112, 214],
	"palegoldenrod": [238, 232, 170],
	"palegreen": [152, 251, 152],
	"paleturquoise": [175, 238, 238],
	"palevioletred": [219, 112, 147],
	"papayawhip": [255, 239, 213],
	"peachpuff": [255, 218, 185],
	"peru": [205, 133, 63],
	"pink": [255, 192, 203],
	"plum": [221, 160, 221],
	"powderblue": [176, 224, 230],
	"purple": [128, 0, 128],
	"rebeccapurple": [102, 51, 153],
	"red": [255, 0, 0],
	"rosybrown": [188, 143, 143],
	"royalblue": [65, 105, 225],
	"saddlebrown": [139, 69, 19],
	"salmon": [250, 128, 114],
	"sandybrown": [244, 164, 96],
	"seagreen": [46, 139, 87],
	"seashell": [255, 245, 238],
	"sienna": [160, 82, 45],
	"silver": [192, 192, 192],
	"skyblue": [135, 206, 235],
	"slateblue": [106, 90, 205],
	"slategray": [112, 128, 144],
	"slategrey": [112, 128, 144],
	"snow": [255, 250, 250],
	"springgreen": [0, 255, 127],
	"steelblue": [70, 130, 180],
	"tan": [210, 180, 140],
	"teal": [0, 128, 128],
	"thistle": [216, 191, 216],
	"tomato": [255, 99, 71],
	"turquoise": [64, 224, 208],
	"violet": [238, 130, 238],
	"wheat": [245, 222, 179],
	"white": [255, 255, 255],
	"whitesmoke": [245, 245, 245],
	"yellow": [255, 255, 0],
	"yellowgreen": [154, 205, 50]
};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

/* MIT license */
var cssKeywords = __webpack_require__(5);

// NOTE: conversions should only return primitive values (i.e. arrays, or
//       values that give correct `typeof` results).
//       do not use box values types (i.e. Number(), String(), etc.)

var reverseKeywords = {};
for (var key in cssKeywords) {
	if (cssKeywords.hasOwnProperty(key)) {
		reverseKeywords[cssKeywords[key]] = key;
	}
}

var convert = module.exports = {
	rgb: {channels: 3, labels: 'rgb'},
	hsl: {channels: 3, labels: 'hsl'},
	hsv: {channels: 3, labels: 'hsv'},
	hwb: {channels: 3, labels: 'hwb'},
	cmyk: {channels: 4, labels: 'cmyk'},
	xyz: {channels: 3, labels: 'xyz'},
	lab: {channels: 3, labels: 'lab'},
	lch: {channels: 3, labels: 'lch'},
	hex: {channels: 1, labels: ['hex']},
	keyword: {channels: 1, labels: ['keyword']},
	ansi16: {channels: 1, labels: ['ansi16']},
	ansi256: {channels: 1, labels: ['ansi256']},
	hcg: {channels: 3, labels: ['h', 'c', 'g']},
	apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
	gray: {channels: 1, labels: ['gray']}
};

// hide .channels and .labels properties
for (var model in convert) {
	if (convert.hasOwnProperty(model)) {
		if (!('channels' in convert[model])) {
			throw new Error('missing channels property: ' + model);
		}

		if (!('labels' in convert[model])) {
			throw new Error('missing channel labels property: ' + model);
		}

		if (convert[model].labels.length !== convert[model].channels) {
			throw new Error('channel and label counts mismatch: ' + model);
		}

		var channels = convert[model].channels;
		var labels = convert[model].labels;
		delete convert[model].channels;
		delete convert[model].labels;
		Object.defineProperty(convert[model], 'channels', {value: channels});
		Object.defineProperty(convert[model], 'labels', {value: labels});
	}
}

convert.rgb.hsl = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var min = Math.min(r, g, b);
	var max = Math.max(r, g, b);
	var delta = max - min;
	var h;
	var s;
	var l;

	if (max === min) {
		h = 0;
	} else if (r === max) {
		h = (g - b) / delta;
	} else if (g === max) {
		h = 2 + (b - r) / delta;
	} else if (b === max) {
		h = 4 + (r - g) / delta;
	}

	h = Math.min(h * 60, 360);

	if (h < 0) {
		h += 360;
	}

	l = (min + max) / 2;

	if (max === min) {
		s = 0;
	} else if (l <= 0.5) {
		s = delta / (max + min);
	} else {
		s = delta / (2 - max - min);
	}

	return [h, s * 100, l * 100];
};

convert.rgb.hsv = function (rgb) {
	var rdif;
	var gdif;
	var bdif;
	var h;
	var s;

	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var v = Math.max(r, g, b);
	var diff = v - Math.min(r, g, b);
	var diffc = function (c) {
		return (v - c) / 6 / diff + 1 / 2;
	};

	if (diff === 0) {
		h = s = 0;
	} else {
		s = diff / v;
		rdif = diffc(r);
		gdif = diffc(g);
		bdif = diffc(b);

		if (r === v) {
			h = bdif - gdif;
		} else if (g === v) {
			h = (1 / 3) + rdif - bdif;
		} else if (b === v) {
			h = (2 / 3) + gdif - rdif;
		}
		if (h < 0) {
			h += 1;
		} else if (h > 1) {
			h -= 1;
		}
	}

	return [
		h * 360,
		s * 100,
		v * 100
	];
};

convert.rgb.hwb = function (rgb) {
	var r = rgb[0];
	var g = rgb[1];
	var b = rgb[2];
	var h = convert.rgb.hsl(rgb)[0];
	var w = 1 / 255 * Math.min(r, Math.min(g, b));

	b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

	return [h, w * 100, b * 100];
};

convert.rgb.cmyk = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var c;
	var m;
	var y;
	var k;

	k = Math.min(1 - r, 1 - g, 1 - b);
	c = (1 - r - k) / (1 - k) || 0;
	m = (1 - g - k) / (1 - k) || 0;
	y = (1 - b - k) / (1 - k) || 0;

	return [c * 100, m * 100, y * 100, k * 100];
};

/**
 * See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
 * */
function comparativeDistance(x, y) {
	return (
		Math.pow(x[0] - y[0], 2) +
		Math.pow(x[1] - y[1], 2) +
		Math.pow(x[2] - y[2], 2)
	);
}

convert.rgb.keyword = function (rgb) {
	var reversed = reverseKeywords[rgb];
	if (reversed) {
		return reversed;
	}

	var currentClosestDistance = Infinity;
	var currentClosestKeyword;

	for (var keyword in cssKeywords) {
		if (cssKeywords.hasOwnProperty(keyword)) {
			var value = cssKeywords[keyword];

			// Compute comparative distance
			var distance = comparativeDistance(rgb, value);

			// Check if its less, if so set as closest
			if (distance < currentClosestDistance) {
				currentClosestDistance = distance;
				currentClosestKeyword = keyword;
			}
		}
	}

	return currentClosestKeyword;
};

convert.keyword.rgb = function (keyword) {
	return cssKeywords[keyword];
};

convert.rgb.xyz = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;

	// assume sRGB
	r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
	g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
	b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

	var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
	var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
	var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

	return [x * 100, y * 100, z * 100];
};

convert.rgb.lab = function (rgb) {
	var xyz = convert.rgb.xyz(rgb);
	var x = xyz[0];
	var y = xyz[1];
	var z = xyz[2];
	var l;
	var a;
	var b;

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

	l = (116 * y) - 16;
	a = 500 * (x - y);
	b = 200 * (y - z);

	return [l, a, b];
};

convert.hsl.rgb = function (hsl) {
	var h = hsl[0] / 360;
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var t1;
	var t2;
	var t3;
	var rgb;
	var val;

	if (s === 0) {
		val = l * 255;
		return [val, val, val];
	}

	if (l < 0.5) {
		t2 = l * (1 + s);
	} else {
		t2 = l + s - l * s;
	}

	t1 = 2 * l - t2;

	rgb = [0, 0, 0];
	for (var i = 0; i < 3; i++) {
		t3 = h + 1 / 3 * -(i - 1);
		if (t3 < 0) {
			t3++;
		}
		if (t3 > 1) {
			t3--;
		}

		if (6 * t3 < 1) {
			val = t1 + (t2 - t1) * 6 * t3;
		} else if (2 * t3 < 1) {
			val = t2;
		} else if (3 * t3 < 2) {
			val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
		} else {
			val = t1;
		}

		rgb[i] = val * 255;
	}

	return rgb;
};

convert.hsl.hsv = function (hsl) {
	var h = hsl[0];
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var smin = s;
	var lmin = Math.max(l, 0.01);
	var sv;
	var v;

	l *= 2;
	s *= (l <= 1) ? l : 2 - l;
	smin *= lmin <= 1 ? lmin : 2 - lmin;
	v = (l + s) / 2;
	sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

	return [h, sv * 100, v * 100];
};

convert.hsv.rgb = function (hsv) {
	var h = hsv[0] / 60;
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;
	var hi = Math.floor(h) % 6;

	var f = h - Math.floor(h);
	var p = 255 * v * (1 - s);
	var q = 255 * v * (1 - (s * f));
	var t = 255 * v * (1 - (s * (1 - f)));
	v *= 255;

	switch (hi) {
		case 0:
			return [v, t, p];
		case 1:
			return [q, v, p];
		case 2:
			return [p, v, t];
		case 3:
			return [p, q, v];
		case 4:
			return [t, p, v];
		case 5:
			return [v, p, q];
	}
};

convert.hsv.hsl = function (hsv) {
	var h = hsv[0];
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;
	var vmin = Math.max(v, 0.01);
	var lmin;
	var sl;
	var l;

	l = (2 - s) * v;
	lmin = (2 - s) * vmin;
	sl = s * vmin;
	sl /= (lmin <= 1) ? lmin : 2 - lmin;
	sl = sl || 0;
	l /= 2;

	return [h, sl * 100, l * 100];
};

// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
convert.hwb.rgb = function (hwb) {
	var h = hwb[0] / 360;
	var wh = hwb[1] / 100;
	var bl = hwb[2] / 100;
	var ratio = wh + bl;
	var i;
	var v;
	var f;
	var n;

	// wh + bl cant be > 1
	if (ratio > 1) {
		wh /= ratio;
		bl /= ratio;
	}

	i = Math.floor(6 * h);
	v = 1 - bl;
	f = 6 * h - i;

	if ((i & 0x01) !== 0) {
		f = 1 - f;
	}

	n = wh + f * (v - wh); // linear interpolation

	var r;
	var g;
	var b;
	switch (i) {
		default:
		case 6:
		case 0: r = v; g = n; b = wh; break;
		case 1: r = n; g = v; b = wh; break;
		case 2: r = wh; g = v; b = n; break;
		case 3: r = wh; g = n; b = v; break;
		case 4: r = n; g = wh; b = v; break;
		case 5: r = v; g = wh; b = n; break;
	}

	return [r * 255, g * 255, b * 255];
};

convert.cmyk.rgb = function (cmyk) {
	var c = cmyk[0] / 100;
	var m = cmyk[1] / 100;
	var y = cmyk[2] / 100;
	var k = cmyk[3] / 100;
	var r;
	var g;
	var b;

	r = 1 - Math.min(1, c * (1 - k) + k);
	g = 1 - Math.min(1, m * (1 - k) + k);
	b = 1 - Math.min(1, y * (1 - k) + k);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.rgb = function (xyz) {
	var x = xyz[0] / 100;
	var y = xyz[1] / 100;
	var z = xyz[2] / 100;
	var r;
	var g;
	var b;

	r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
	g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
	b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

	// assume sRGB
	r = r > 0.0031308
		? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055)
		: r * 12.92;

	g = g > 0.0031308
		? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055)
		: g * 12.92;

	b = b > 0.0031308
		? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055)
		: b * 12.92;

	r = Math.min(Math.max(0, r), 1);
	g = Math.min(Math.max(0, g), 1);
	b = Math.min(Math.max(0, b), 1);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.lab = function (xyz) {
	var x = xyz[0];
	var y = xyz[1];
	var z = xyz[2];
	var l;
	var a;
	var b;

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

	l = (116 * y) - 16;
	a = 500 * (x - y);
	b = 200 * (y - z);

	return [l, a, b];
};

convert.lab.xyz = function (lab) {
	var l = lab[0];
	var a = lab[1];
	var b = lab[2];
	var x;
	var y;
	var z;

	y = (l + 16) / 116;
	x = a / 500 + y;
	z = y - b / 200;

	var y2 = Math.pow(y, 3);
	var x2 = Math.pow(x, 3);
	var z2 = Math.pow(z, 3);
	y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
	x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
	z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

	x *= 95.047;
	y *= 100;
	z *= 108.883;

	return [x, y, z];
};

convert.lab.lch = function (lab) {
	var l = lab[0];
	var a = lab[1];
	var b = lab[2];
	var hr;
	var h;
	var c;

	hr = Math.atan2(b, a);
	h = hr * 360 / 2 / Math.PI;

	if (h < 0) {
		h += 360;
	}

	c = Math.sqrt(a * a + b * b);

	return [l, c, h];
};

convert.lch.lab = function (lch) {
	var l = lch[0];
	var c = lch[1];
	var h = lch[2];
	var a;
	var b;
	var hr;

	hr = h / 360 * 2 * Math.PI;
	a = c * Math.cos(hr);
	b = c * Math.sin(hr);

	return [l, a, b];
};

convert.rgb.ansi16 = function (args) {
	var r = args[0];
	var g = args[1];
	var b = args[2];
	var value = 1 in arguments ? arguments[1] : convert.rgb.hsv(args)[2]; // hsv -> ansi16 optimization

	value = Math.round(value / 50);

	if (value === 0) {
		return 30;
	}

	var ansi = 30
		+ ((Math.round(b / 255) << 2)
		| (Math.round(g / 255) << 1)
		| Math.round(r / 255));

	if (value === 2) {
		ansi += 60;
	}

	return ansi;
};

convert.hsv.ansi16 = function (args) {
	// optimization here; we already know the value and don't need to get
	// it converted for us.
	return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
};

convert.rgb.ansi256 = function (args) {
	var r = args[0];
	var g = args[1];
	var b = args[2];

	// we use the extended greyscale palette here, with the exception of
	// black and white. normal palette only has 4 greyscale shades.
	if (r === g && g === b) {
		if (r < 8) {
			return 16;
		}

		if (r > 248) {
			return 231;
		}

		return Math.round(((r - 8) / 247) * 24) + 232;
	}

	var ansi = 16
		+ (36 * Math.round(r / 255 * 5))
		+ (6 * Math.round(g / 255 * 5))
		+ Math.round(b / 255 * 5);

	return ansi;
};

convert.ansi16.rgb = function (args) {
	var color = args % 10;

	// handle greyscale
	if (color === 0 || color === 7) {
		if (args > 50) {
			color += 3.5;
		}

		color = color / 10.5 * 255;

		return [color, color, color];
	}

	var mult = (~~(args > 50) + 1) * 0.5;
	var r = ((color & 1) * mult) * 255;
	var g = (((color >> 1) & 1) * mult) * 255;
	var b = (((color >> 2) & 1) * mult) * 255;

	return [r, g, b];
};

convert.ansi256.rgb = function (args) {
	// handle greyscale
	if (args >= 232) {
		var c = (args - 232) * 10 + 8;
		return [c, c, c];
	}

	args -= 16;

	var rem;
	var r = Math.floor(args / 36) / 5 * 255;
	var g = Math.floor((rem = args % 36) / 6) / 5 * 255;
	var b = (rem % 6) / 5 * 255;

	return [r, g, b];
};

convert.rgb.hex = function (args) {
	var integer = ((Math.round(args[0]) & 0xFF) << 16)
		+ ((Math.round(args[1]) & 0xFF) << 8)
		+ (Math.round(args[2]) & 0xFF);

	var string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.hex.rgb = function (args) {
	var match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
	if (!match) {
		return [0, 0, 0];
	}

	var colorString = match[0];

	if (match[0].length === 3) {
		colorString = colorString.split('').map(function (char) {
			return char + char;
		}).join('');
	}

	var integer = parseInt(colorString, 16);
	var r = (integer >> 16) & 0xFF;
	var g = (integer >> 8) & 0xFF;
	var b = integer & 0xFF;

	return [r, g, b];
};

convert.rgb.hcg = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var max = Math.max(Math.max(r, g), b);
	var min = Math.min(Math.min(r, g), b);
	var chroma = (max - min);
	var grayscale;
	var hue;

	if (chroma < 1) {
		grayscale = min / (1 - chroma);
	} else {
		grayscale = 0;
	}

	if (chroma <= 0) {
		hue = 0;
	} else
	if (max === r) {
		hue = ((g - b) / chroma) % 6;
	} else
	if (max === g) {
		hue = 2 + (b - r) / chroma;
	} else {
		hue = 4 + (r - g) / chroma + 4;
	}

	hue /= 6;
	hue %= 1;

	return [hue * 360, chroma * 100, grayscale * 100];
};

convert.hsl.hcg = function (hsl) {
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var c = 1;
	var f = 0;

	if (l < 0.5) {
		c = 2.0 * s * l;
	} else {
		c = 2.0 * s * (1.0 - l);
	}

	if (c < 1.0) {
		f = (l - 0.5 * c) / (1.0 - c);
	}

	return [hsl[0], c * 100, f * 100];
};

convert.hsv.hcg = function (hsv) {
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;

	var c = s * v;
	var f = 0;

	if (c < 1.0) {
		f = (v - c) / (1 - c);
	}

	return [hsv[0], c * 100, f * 100];
};

convert.hcg.rgb = function (hcg) {
	var h = hcg[0] / 360;
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	if (c === 0.0) {
		return [g * 255, g * 255, g * 255];
	}

	var pure = [0, 0, 0];
	var hi = (h % 1) * 6;
	var v = hi % 1;
	var w = 1 - v;
	var mg = 0;

	switch (Math.floor(hi)) {
		case 0:
			pure[0] = 1; pure[1] = v; pure[2] = 0; break;
		case 1:
			pure[0] = w; pure[1] = 1; pure[2] = 0; break;
		case 2:
			pure[0] = 0; pure[1] = 1; pure[2] = v; break;
		case 3:
			pure[0] = 0; pure[1] = w; pure[2] = 1; break;
		case 4:
			pure[0] = v; pure[1] = 0; pure[2] = 1; break;
		default:
			pure[0] = 1; pure[1] = 0; pure[2] = w;
	}

	mg = (1.0 - c) * g;

	return [
		(c * pure[0] + mg) * 255,
		(c * pure[1] + mg) * 255,
		(c * pure[2] + mg) * 255
	];
};

convert.hcg.hsv = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	var v = c + g * (1.0 - c);
	var f = 0;

	if (v > 0.0) {
		f = c / v;
	}

	return [hcg[0], f * 100, v * 100];
};

convert.hcg.hsl = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	var l = g * (1.0 - c) + 0.5 * c;
	var s = 0;

	if (l > 0.0 && l < 0.5) {
		s = c / (2 * l);
	} else
	if (l >= 0.5 && l < 1.0) {
		s = c / (2 * (1 - l));
	}

	return [hcg[0], s * 100, l * 100];
};

convert.hcg.hwb = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;
	var v = c + g * (1.0 - c);
	return [hcg[0], (v - c) * 100, (1 - v) * 100];
};

convert.hwb.hcg = function (hwb) {
	var w = hwb[1] / 100;
	var b = hwb[2] / 100;
	var v = 1 - b;
	var c = v - w;
	var g = 0;

	if (c < 1) {
		g = (v - c) / (1 - c);
	}

	return [hwb[0], c * 100, g * 100];
};

convert.apple.rgb = function (apple) {
	return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
};

convert.rgb.apple = function (rgb) {
	return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
};

convert.gray.rgb = function (args) {
	return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
};

convert.gray.hsl = convert.gray.hsv = function (args) {
	return [0, 0, args[0]];
};

convert.gray.hwb = function (gray) {
	return [0, 100, gray[0]];
};

convert.gray.cmyk = function (gray) {
	return [0, 0, 0, gray[0]];
};

convert.gray.lab = function (gray) {
	return [gray[0], 0, 0];
};

convert.gray.hex = function (gray) {
	var val = Math.round(gray[0] / 100 * 255) & 0xFF;
	var integer = (val << 16) + (val << 8) + val;

	var string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.rgb.gray = function (rgb) {
	var val = (rgb[0] + rgb[1] + rgb[2]) / 3;
	return [val / 255 * 100];
};


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _Colorpicker = __webpack_require__(8);

var _Colorpicker2 = _interopRequireDefault(_Colorpicker);

var _jquery = __webpack_require__(0);

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var plugin = 'colorpicker';

_jquery2.default[plugin] = _Colorpicker2.default;

// Colorpicker jQuery Plugin API
_jquery2.default.fn[plugin] = function (option) {
  var fnArgs = Array.prototype.slice.call(arguments, 1),
      isSingleElement = this.length === 1,
      returnValue = null;

  var $elements = this.each(function () {
    var $this = (0, _jquery2.default)(this),
        inst = $this.data(plugin),
        options = (typeof option === 'undefined' ? 'undefined' : _typeof(option)) === 'object' ? option : {};

    // Create instance if does not exist
    if (!inst) {
      inst = new _Colorpicker2.default(this, options);
      $this.data(plugin, inst);
    }

    if (!isSingleElement) {
      return;
    }

    returnValue = $this;

    if (typeof option === 'string') {
      if (option === 'colorpicker') {
        // Return colorpicker instance: e.g. .colorpicker('colorpicker')
        returnValue = inst;
      } else if (_jquery2.default.isFunction(inst[option])) {
        // Return method call return value: e.g. .colorpicker('isEnabled')
        returnValue = inst[option].apply(inst, fnArgs);
      } else {
        // Return property value: e.g. .colorpicker('element')
        returnValue = inst[option];
      }
    }
  });

  return isSingleElement ? returnValue : $elements;
};

_jquery2.default.fn[plugin].constructor = _Colorpicker2.default;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Extension = __webpack_require__(1);

var _Extension2 = _interopRequireDefault(_Extension);

var _options = __webpack_require__(3);

var _options2 = _interopRequireDefault(_options);

var _extensions = __webpack_require__(9);

var _extensions2 = _interopRequireDefault(_extensions);

var _jquery = __webpack_require__(0);

var _jquery2 = _interopRequireDefault(_jquery);

var _SliderHandler = __webpack_require__(13);

var _SliderHandler2 = _interopRequireDefault(_SliderHandler);

var _PopupHandler = __webpack_require__(14);

var _PopupHandler2 = _interopRequireDefault(_PopupHandler);

var _InputHandler = __webpack_require__(15);

var _InputHandler2 = _interopRequireDefault(_InputHandler);

var _ColorHandler = __webpack_require__(22);

var _ColorHandler2 = _interopRequireDefault(_ColorHandler);

var _PickerHandler = __webpack_require__(23);

var _PickerHandler2 = _interopRequireDefault(_PickerHandler);

var _AddonHandler = __webpack_require__(24);

var _AddonHandler2 = _interopRequireDefault(_AddonHandler);

var _ColorItem = __webpack_require__(2);

var _ColorItem2 = _interopRequireDefault(_ColorItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var colorPickerIdCounter = 0;
var root = typeof self !== 'undefined' ? self : undefined; // window

/**
 * Colorpicker widget class
 */

var Colorpicker = function () {
  _createClass(Colorpicker, [{
    key: 'color',


    /**
     * Internal color object
     *
     * @type {Color|null}
     */
    get: function get() {
      return this.colorHandler.color;
    }

    /**
     * Internal color format
     *
     * @type {String|null}
     */

  }, {
    key: 'format',
    get: function get() {
      return this.colorHandler.format;
    }

    /**
     * Getter of the picker element
     *
     * @returns {jQuery|HTMLElement}
     */

  }, {
    key: 'picker',
    get: function get() {
      return this.pickerHandler.picker;
    }

    /**
     * @fires Colorpicker#colorpickerCreate
     * @param {Object|String} element
     * @param {Object} options
     * @constructor
     */

  }], [{
    key: 'Color',

    /**
     * Color class
     *
     * @static
     * @type {Color}
     */
    get: function get() {
      return _ColorItem2.default;
    }

    /**
     * Extension class
     *
     * @static
     * @type {Extension}
     */

  }, {
    key: 'Extension',
    get: function get() {
      return _Extension2.default;
    }
  }]);

  function Colorpicker(element, options) {
    _classCallCheck(this, Colorpicker);

    colorPickerIdCounter += 1;
    /**
     * The colorpicker instance number
     * @type {number}
     */
    this.id = colorPickerIdCounter;

    /**
     * Latest colorpicker event
     *
     * @type {{name: String, e: *}}
     */
    this.lastEvent = {
      alias: null,
      e: null
    };

    /**
     * The element that the colorpicker is bound to
     *
     * @type {*|jQuery}
     */
    this.element = (0, _jquery2.default)(element).addClass('colorpicker-element').attr('data-colorpicker-id', this.id);

    /**
     * @type {defaults}
     */
    this.options = _jquery2.default.extend(true, {}, _options2.default, options, this.element.data());

    /**
     * @type {boolean}
     * @private
     */
    this.disabled = false;

    /**
     * Extensions added to this instance
     *
     * @type {Extension[]}
     */
    this.extensions = [];

    /**
     * The element where the
     * @type {*|jQuery}
     */
    this.container = this.options.container === true || this.options.container !== true && this.options.inline === true ? this.element : this.options.container;

    this.container = this.container !== false ? (0, _jquery2.default)(this.container) : false;

    /**
     * @type {InputHandler}
     */
    this.inputHandler = new _InputHandler2.default(this);
    /**
     * @type {ColorHandler}
     */
    this.colorHandler = new _ColorHandler2.default(this);
    /**
     * @type {SliderHandler}
     */
    this.sliderHandler = new _SliderHandler2.default(this);
    /**
     * @type {PopupHandler}
     */
    this.popupHandler = new _PopupHandler2.default(this, root);
    /**
     * @type {PickerHandler}
     */
    this.pickerHandler = new _PickerHandler2.default(this);
    /**
     * @type {AddonHandler}
     */
    this.addonHandler = new _AddonHandler2.default(this);

    this.init();

    // Emit a create event
    (0, _jquery2.default)(_jquery2.default.proxy(function () {
      /**
       * (Colorpicker) When the Colorpicker instance has been created and the DOM is ready.
       *
       * @event Colorpicker#colorpickerCreate
       */
      this.trigger('colorpickerCreate');
    }, this));
  }

  /**
   * Initializes the plugin
   * @private
   */


  _createClass(Colorpicker, [{
    key: 'init',
    value: function init() {
      // Init addon
      this.addonHandler.bind();

      // Init input
      this.inputHandler.bind();

      // Init extensions (before initializing the color)
      this.initExtensions();

      // Init color
      this.colorHandler.bind();

      // Init picker
      this.pickerHandler.bind();

      // Init sliders and popup
      this.sliderHandler.bind();
      this.popupHandler.bind();

      // Inject into the DOM (this may make it visible)
      this.pickerHandler.attach();

      // Update all components
      this.update();

      if (this.inputHandler.isDisabled()) {
        this.disable();
      }
    }

    /**
     * Initializes the plugin extensions
     * @private
     */

  }, {
    key: 'initExtensions',
    value: function initExtensions() {
      var _this = this;

      if (!Array.isArray(this.options.extensions)) {
        this.options.extensions = [];
      }

      if (this.options.debug) {
        this.options.extensions.push({ name: 'debugger' });
      }

      // Register and instantiate extensions
      this.options.extensions.forEach(function (ext) {
        _this.registerExtension(Colorpicker.extensions[ext.name.toLowerCase()], ext.options || {});
      });
    }

    /**
     * Creates and registers the given extension
     *
     * @param {Extension} ExtensionClass The extension class to instantiate
     * @param {Object} [config] Extension configuration
     * @returns {Extension}
     */

  }, {
    key: 'registerExtension',
    value: function registerExtension(ExtensionClass) {
      var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var ext = new ExtensionClass(this, config);

      this.extensions.push(ext);
      return ext;
    }

    /**
     * Destroys the current instance
     *
     * @fires Colorpicker#colorpickerDestroy
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      var color = this.color;

      this.sliderHandler.unbind();
      this.inputHandler.unbind();
      this.popupHandler.unbind();
      this.colorHandler.unbind();
      this.addonHandler.unbind();
      this.pickerHandler.unbind();

      this.element.removeClass('colorpicker-element').removeData('colorpicker', 'color').off('.colorpicker');

      /**
       * (Colorpicker) When the instance is destroyed with all events unbound.
       *
       * @event Colorpicker#colorpickerDestroy
       */
      this.trigger('colorpickerDestroy', color);
    }

    /**
     * Shows the colorpicker widget if hidden.
     * If the colorpicker is disabled this call will be ignored.
     *
     * @fires Colorpicker#colorpickerShow
     * @param {Event} [e]
     */

  }, {
    key: 'show',
    value: function show(e) {
      this.popupHandler.show(e);
    }

    /**
     * Hides the colorpicker widget.
     *
     * @fires Colorpicker#colorpickerHide
     * @param {Event} [e]
     */

  }, {
    key: 'hide',
    value: function hide(e) {
      this.popupHandler.hide(e);
    }

    /**
     * Toggles the colorpicker between visible and hidden.
     *
     * @fires Colorpicker#colorpickerShow
     * @fires Colorpicker#colorpickerHide
     * @param {Event} [e]
     */

  }, {
    key: 'toggle',
    value: function toggle(e) {
      this.popupHandler.toggle(e);
    }

    /**
     * Returns the current color value as string
     *
     * @param {String|*} [defaultValue]
     * @returns {String|*}
     */

  }, {
    key: 'getValue',
    value: function getValue() {
      var defaultValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      var val = this.colorHandler.color;

      val = val instanceof _ColorItem2.default ? val : defaultValue;

      if (val instanceof _ColorItem2.default) {
        return val.string(this.format);
      }

      return val;
    }

    /**
     * Sets the color manually
     *
     * @fires Colorpicker#colorpickerChange
     * @param {String|Color} val
     */

  }, {
    key: 'setValue',
    value: function setValue(val) {
      if (this.isDisabled()) {
        return;
      }
      var ch = this.colorHandler;

      if (ch.hasColor() && !!val && ch.color.equals(val) || !ch.hasColor() && !val) {
        // same color or still empty
        return;
      }

      ch.color = val ? ch.createColor(val, this.options.autoInputFallback) : null;

      /**
       * (Colorpicker) When the color is set programmatically with setValue().
       *
       * @event Colorpicker#colorpickerChange
       */
      this.trigger('colorpickerChange', ch.color, val);

      // force update if color has changed to empty
      this.update();
    }

    /**
     * Updates the UI and the input color according to the internal color.
     *
     * @fires Colorpicker#colorpickerUpdate
     */

  }, {
    key: 'update',
    value: function update() {
      if (this.colorHandler.hasColor()) {
        this.inputHandler.update();
      } else {
        this.colorHandler.assureColor();
      }

      this.addonHandler.update();
      this.pickerHandler.update();

      /**
       * (Colorpicker) Fired when the widget is updated.
       *
       * @event Colorpicker#colorpickerUpdate
       */
      this.trigger('colorpickerUpdate');
    }

    /**
     * Enables the widget and the input if any
     *
     * @fires Colorpicker#colorpickerEnable
     * @returns {boolean}
     */

  }, {
    key: 'enable',
    value: function enable() {
      this.inputHandler.enable();
      this.disabled = false;
      this.picker.removeClass('colorpicker-disabled');

      /**
       * (Colorpicker) When the widget has been enabled.
       *
       * @event Colorpicker#colorpickerEnable
       */
      this.trigger('colorpickerEnable');
      return true;
    }

    /**
     * Disables the widget and the input if any
     *
     * @fires Colorpicker#colorpickerDisable
     * @returns {boolean}
     */

  }, {
    key: 'disable',
    value: function disable() {
      this.inputHandler.disable();
      this.disabled = true;
      this.picker.addClass('colorpicker-disabled');

      /**
       * (Colorpicker) When the widget has been disabled.
       *
       * @event Colorpicker#colorpickerDisable
       */
      this.trigger('colorpickerDisable');
      return true;
    }

    /**
     * Returns true if this instance is enabled
     * @returns {boolean}
     */

  }, {
    key: 'isEnabled',
    value: function isEnabled() {
      return !this.isDisabled();
    }

    /**
     * Returns true if this instance is disabled
     * @returns {boolean}
     */

  }, {
    key: 'isDisabled',
    value: function isDisabled() {
      return this.disabled === true;
    }

    /**
     * Triggers a Colorpicker event.
     *
     * @param eventName
     * @param color
     * @param value
     */

  }, {
    key: 'trigger',
    value: function trigger(eventName) {
      var color = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var value = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      this.element.trigger({
        type: eventName,
        colorpicker: this,
        color: color ? color : this.color,
        value: value ? value : this.getValue()
      });
    }
  }]);

  return Colorpicker;
}();

/**
 * Colorpicker extension classes, indexed by extension name
 *
 * @static
 * @type {Object} a map between the extension name and its class
 */


Colorpicker.extensions = _extensions2.default;

exports.default = Colorpicker;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Palette = exports.Swatches = exports.Preview = exports.Debugger = undefined;

var _Debugger = __webpack_require__(10);

var _Debugger2 = _interopRequireDefault(_Debugger);

var _Preview = __webpack_require__(11);

var _Preview2 = _interopRequireDefault(_Preview);

var _Swatches = __webpack_require__(12);

var _Swatches2 = _interopRequireDefault(_Swatches);

var _Palette = __webpack_require__(4);

var _Palette2 = _interopRequireDefault(_Palette);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Debugger = _Debugger2.default;
exports.Preview = _Preview2.default;
exports.Swatches = _Swatches2.default;
exports.Palette = _Palette2.default;
exports.default = {
  'debugger': _Debugger2.default,
  'preview': _Preview2.default,
  'swatches': _Swatches2.default,
  'palette': _Palette2.default
};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _Extension2 = __webpack_require__(1);

var _Extension3 = _interopRequireDefault(_Extension2);

var _jquery = __webpack_require__(0);

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Debugger extension class
 * @alias DebuggerExtension
 * @ignore
 */
var Debugger = function (_Extension) {
  _inherits(Debugger, _Extension);

  function Debugger(colorpicker) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Debugger);

    /**
     * @type {number}
     */
    var _this = _possibleConstructorReturn(this, (Debugger.__proto__ || Object.getPrototypeOf(Debugger)).call(this, colorpicker, options));

    _this.eventCounter = 0;
    if (_this.colorpicker.inputHandler.hasInput()) {
      _this.colorpicker.inputHandler.input.on('change.colorpicker-ext', _jquery2.default.proxy(_this.onChangeInput, _this));
    }
    return _this;
  }

  /**
   * @fires DebuggerExtension#colorpickerDebug
   * @param {string} eventName
   * @param {*} args
   */


  _createClass(Debugger, [{
    key: 'log',
    value: function log(eventName) {
      var _console;

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      this.eventCounter += 1;

      var logMessage = '#' + this.eventCounter + ': Colorpicker#' + this.colorpicker.id + ' [' + eventName + ']';

      (_console = console).debug.apply(_console, [logMessage].concat(args));

      /**
       * Whenever the debugger logs an event, this other event is emitted.
       *
       * @event DebuggerExtension#colorpickerDebug
       * @type {object} The event object
       * @property {Colorpicker} colorpicker The Colorpicker instance
       * @property {ColorItem} color The color instance
       * @property {{debugger: DebuggerExtension, eventName: String, logArgs: Array, logMessage: String}} debug
       *  The debug info
       */
      this.colorpicker.element.trigger({
        type: 'colorpickerDebug',
        colorpicker: this.colorpicker,
        color: this.color,
        value: null,
        debug: {
          debugger: this,
          eventName: eventName,
          logArgs: args,
          logMessage: logMessage
        }
      });
    }
  }, {
    key: 'resolveColor',
    value: function resolveColor(color) {
      var realColor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      this.log('resolveColor()', color, realColor);
      return false;
    }
  }, {
    key: 'onCreate',
    value: function onCreate(event) {
      this.log('colorpickerCreate');
      return _get(Debugger.prototype.__proto__ || Object.getPrototypeOf(Debugger.prototype), 'onCreate', this).call(this, event);
    }
  }, {
    key: 'onDestroy',
    value: function onDestroy(event) {
      this.log('colorpickerDestroy');
      this.eventCounter = 0;

      if (this.colorpicker.inputHandler.hasInput()) {
        this.colorpicker.inputHandler.input.off('.colorpicker-ext');
      }

      return _get(Debugger.prototype.__proto__ || Object.getPrototypeOf(Debugger.prototype), 'onDestroy', this).call(this, event);
    }
  }, {
    key: 'onUpdate',
    value: function onUpdate(event) {
      this.log('colorpickerUpdate');
    }

    /**
     * @listens Colorpicker#change
     * @param {Event} event
     */

  }, {
    key: 'onChangeInput',
    value: function onChangeInput(event) {
      this.log('input:change.colorpicker', event.value, event.color);
    }
  }, {
    key: 'onChange',
    value: function onChange(event) {
      this.log('colorpickerChange', event.value, event.color);
    }
  }, {
    key: 'onInvalid',
    value: function onInvalid(event) {
      this.log('colorpickerInvalid', event.value, event.color);
    }
  }, {
    key: 'onHide',
    value: function onHide(event) {
      this.log('colorpickerHide');
      this.eventCounter = 0;
    }
  }, {
    key: 'onShow',
    value: function onShow(event) {
      this.log('colorpickerShow');
    }
  }, {
    key: 'onDisable',
    value: function onDisable(event) {
      this.log('colorpickerDisable');
    }
  }, {
    key: 'onEnable',
    value: function onEnable(event) {
      this.log('colorpickerEnable');
    }
  }]);

  return Debugger;
}(_Extension3.default);

exports.default = Debugger;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _Extension2 = __webpack_require__(1);

var _Extension3 = _interopRequireDefault(_Extension2);

var _jquery = __webpack_require__(0);

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Color preview extension
 * @ignore
 */
var Preview = function (_Extension) {
  _inherits(Preview, _Extension);

  function Preview(colorpicker) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Preview);

    var _this = _possibleConstructorReturn(this, (Preview.__proto__ || Object.getPrototypeOf(Preview)).call(this, colorpicker, _jquery2.default.extend(true, {}, {
      template: '<div class="colorpicker-bar colorpicker-preview"><div /></div>',
      showText: true,
      format: colorpicker.format
    }, options)));

    _this.element = (0, _jquery2.default)(_this.options.template);
    _this.elementInner = _this.element.find('div');
    return _this;
  }

  _createClass(Preview, [{
    key: 'onCreate',
    value: function onCreate(event) {
      _get(Preview.prototype.__proto__ || Object.getPrototypeOf(Preview.prototype), 'onCreate', this).call(this, event);
      this.colorpicker.picker.append(this.element);
    }
  }, {
    key: 'onUpdate',
    value: function onUpdate(event) {
      _get(Preview.prototype.__proto__ || Object.getPrototypeOf(Preview.prototype), 'onUpdate', this).call(this, event);

      if (!event.color) {
        this.elementInner.css('backgroundColor', null).css('color', null).html('');
        return;
      }

      this.elementInner.css('backgroundColor', event.color.toRgbString());

      if (this.options.showText) {
        this.elementInner.html(event.color.string(this.options.format || this.colorpicker.format));

        if (event.color.isDark() && event.color.alpha > 0.5) {
          this.elementInner.css('color', 'white');
        } else {
          this.elementInner.css('color', 'black');
        }
      }
    }
  }]);

  return Preview;
}(_Extension3.default);

exports.default = Preview;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _Palette2 = __webpack_require__(4);

var _Palette3 = _interopRequireDefault(_Palette2);

var _jquery = __webpack_require__(0);

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var defaults = {
  barTemplate: '<div class="colorpicker-bar colorpicker-swatches">\n                    <div class="colorpicker-swatches--inner"></div>\n                </div>',
  swatchTemplate: '<i class="colorpicker-swatch"><i class="colorpicker-swatch--inner"></i></i>'
};

/**
 * Color swatches extension
 * @ignore
 */

var Swatches = function (_Palette) {
  _inherits(Swatches, _Palette);

  function Swatches(colorpicker) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Swatches);

    var _this = _possibleConstructorReturn(this, (Swatches.__proto__ || Object.getPrototypeOf(Swatches)).call(this, colorpicker, _jquery2.default.extend(true, {}, defaults, options)));

    _this.element = null;
    return _this;
  }

  _createClass(Swatches, [{
    key: 'isEnabled',
    value: function isEnabled() {
      return this.getLength() > 0;
    }
  }, {
    key: 'onCreate',
    value: function onCreate(event) {
      _get(Swatches.prototype.__proto__ || Object.getPrototypeOf(Swatches.prototype), 'onCreate', this).call(this, event);

      if (!this.isEnabled()) {
        return;
      }

      this.element = (0, _jquery2.default)(this.options.barTemplate);
      this.load();
      this.colorpicker.picker.append(this.element);
    }
  }, {
    key: 'load',
    value: function load() {
      var _this2 = this;

      var colorpicker = this.colorpicker,
          swatchContainer = this.element.find('.colorpicker-swatches--inner'),
          isAliased = this.options.namesAsValues === true && !Array.isArray(this.colors);

      swatchContainer.empty();

      _jquery2.default.each(this.colors, function (name, value) {
        var $swatch = (0, _jquery2.default)(_this2.options.swatchTemplate).attr('data-name', name).attr('data-value', value).attr('title', isAliased ? name + ': ' + value : value).on('mousedown.colorpicker touchstart.colorpicker', function (e) {
          var $sw = (0, _jquery2.default)(this);

          // e.preventDefault();

          colorpicker.setValue(isAliased ? $sw.attr('data-name') : $sw.attr('data-value'));
        });

        $swatch.find('.colorpicker-swatch--inner').css('background-color', value);

        swatchContainer.append($swatch);
      });

      swatchContainer.append((0, _jquery2.default)('<i class="colorpicker-clear"></i>'));
    }
  }]);

  return Swatches;
}(_Palette3.default);

exports.default = Swatches;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jquery = __webpack_require__(0);

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Class that handles all configured sliders on mouse or touch events.
 * @ignore
 */
var SliderHandler = function () {
  /**
   * @param {Colorpicker} colorpicker
   */
  function SliderHandler(colorpicker) {
    _classCallCheck(this, SliderHandler);

    /**
     * @type {Colorpicker}
     */
    this.colorpicker = colorpicker;
    /**
     * @type {*|String}
     * @private
     */
    this.currentSlider = null;
    /**
     * @type {{left: number, top: number}}
     * @private
     */
    this.mousePointer = {
      left: 0,
      top: 0
    };

    /**
     * @type {Function}
     */
    this.onMove = _jquery2.default.proxy(this.defaultOnMove, this);
  }

  /**
   * This function is called every time a slider guide is moved
   * The scope of "this" is the SliderHandler object.
   *
   * @param {int} top
   * @param {int} left
   */


  _createClass(SliderHandler, [{
    key: 'defaultOnMove',
    value: function defaultOnMove(top, left) {
      if (!this.currentSlider) {
        return;
      }

      var slider = this.currentSlider,
          cp = this.colorpicker,
          ch = cp.colorHandler;

      // Create a color object
      var color = !ch.hasColor() ? ch.getFallbackColor() : ch.color.getClone();

      // Adjust the guide position
      slider.guideStyle.left = left + 'px';
      slider.guideStyle.top = top + 'px';

      // Adjust the color
      if (slider.callLeft) {
        color[slider.callLeft].call(color, left / slider.maxLeft);
      }
      if (slider.callTop) {
        color[slider.callTop].call(color, top / slider.maxTop);
      }

      // Set the new color
      cp.setValue(color);
      cp.popupHandler.focus();
    }

    /**
     * Binds the colorpicker sliders to the mouse/touch events
     */

  }, {
    key: 'bind',
    value: function bind() {
      var sliders = this.colorpicker.options.horizontal ? this.colorpicker.options.slidersHorz : this.colorpicker.options.sliders;
      var sliderClasses = [];

      for (var sliderName in sliders) {
        if (!sliders.hasOwnProperty(sliderName)) {
          continue;
        }

        sliderClasses.push(sliders[sliderName].selector);
      }

      this.colorpicker.picker.find(sliderClasses.join(', ')).on('mousedown.colorpicker touchstart.colorpicker', _jquery2.default.proxy(this.pressed, this));
    }

    /**
     * Unbinds any event bound by this handler
     */

  }, {
    key: 'unbind',
    value: function unbind() {
      (0, _jquery2.default)(this.colorpicker.picker).off({
        'mousemove.colorpicker': _jquery2.default.proxy(this.moved, this),
        'touchmove.colorpicker': _jquery2.default.proxy(this.moved, this),
        'mouseup.colorpicker': _jquery2.default.proxy(this.released, this),
        'touchend.colorpicker': _jquery2.default.proxy(this.released, this)
      });
    }

    /**
     * Function triggered when clicking in one of the color adjustment bars
     *
     * @private
     * @fires Colorpicker#mousemove
     * @param {Event} e
     */

  }, {
    key: 'pressed',
    value: function pressed(e) {
      if (this.colorpicker.isDisabled()) {
        return;
      }
      this.colorpicker.lastEvent.alias = 'pressed';
      this.colorpicker.lastEvent.e = e;

      if (!e.pageX && !e.pageY && e.originalEvent && e.originalEvent.touches) {
        e.pageX = e.originalEvent.touches[0].pageX;
        e.pageY = e.originalEvent.touches[0].pageY;
      }
      // e.stopPropagation();
      // e.preventDefault();

      var target = (0, _jquery2.default)(e.target);

      // detect the slider and set the limits and callbacks
      var zone = target.closest('div');
      var sliders = this.colorpicker.options.horizontal ? this.colorpicker.options.slidersHorz : this.colorpicker.options.sliders;

      if (zone.is('.colorpicker')) {
        return;
      }

      this.currentSlider = null;

      for (var sliderName in sliders) {
        if (!sliders.hasOwnProperty(sliderName)) {
          continue;
        }

        var slider = sliders[sliderName];

        if (zone.is(slider.selector)) {
          this.currentSlider = _jquery2.default.extend({}, slider, { name: sliderName });
          break;
        } else if (slider.childSelector !== undefined && zone.is(slider.childSelector)) {
          this.currentSlider = _jquery2.default.extend({}, slider, { name: sliderName });
          zone = zone.parent(); // zone.parents(slider.selector).first() ?
          break;
        }
      }

      var guide = zone.find('.colorpicker-guide').get(0);

      if (this.currentSlider === null || guide === null) {
        return;
      }

      var offset = zone.offset();

      // reference to guide's style
      this.currentSlider.guideStyle = guide.style;
      this.currentSlider.left = e.pageX - offset.left;
      this.currentSlider.top = e.pageY - offset.top;
      this.mousePointer = {
        left: e.pageX,
        top: e.pageY
      };

      // TODO: fix moving outside the picker makes the guides to keep moving. The event needs to be bound to the window.
      /**
       * (window.document) Triggered on mousedown for the document object,
       * so the color adjustment guide is moved to the clicked position.
       *
       * @event Colorpicker#mousemove
       */
      (0, _jquery2.default)(this.colorpicker.picker).on({
        'mousemove.colorpicker': _jquery2.default.proxy(this.moved, this),
        'touchmove.colorpicker': _jquery2.default.proxy(this.moved, this),
        'mouseup.colorpicker': _jquery2.default.proxy(this.released, this),
        'touchend.colorpicker': _jquery2.default.proxy(this.released, this)
      }).trigger('mousemove');
    }

    /**
     * Function triggered when dragging a guide inside one of the color adjustment bars.
     *
     * @private
     * @param {Event} e
     */

  }, {
    key: 'moved',
    value: function moved(e) {
      this.colorpicker.lastEvent.alias = 'moved';
      this.colorpicker.lastEvent.e = e;

      if (!e.pageX && !e.pageY && e.originalEvent && e.originalEvent.touches) {
        e.pageX = e.originalEvent.touches[0].pageX;
        e.pageY = e.originalEvent.touches[0].pageY;
      }

      // e.stopPropagation();
      e.preventDefault(); // prevents scrolling on mobile

      var left = Math.max(0, Math.min(this.currentSlider.maxLeft, this.currentSlider.left + ((e.pageX || this.mousePointer.left) - this.mousePointer.left)));

      var top = Math.max(0, Math.min(this.currentSlider.maxTop, this.currentSlider.top + ((e.pageY || this.mousePointer.top) - this.mousePointer.top)));

      this.onMove(top, left);
    }

    /**
     * Function triggered when releasing the click in one of the color adjustment bars.
     *
     * @private
     * @param {Event} e
     */

  }, {
    key: 'released',
    value: function released(e) {
      this.colorpicker.lastEvent.alias = 'released';
      this.colorpicker.lastEvent.e = e;

      // e.stopPropagation();
      // e.preventDefault();

      (0, _jquery2.default)(this.colorpicker.picker).off({
        'mousemove.colorpicker': this.moved,
        'touchmove.colorpicker': this.moved,
        'mouseup.colorpicker': this.released,
        'touchend.colorpicker': this.released
      });
    }
  }]);

  return SliderHandler;
}();

exports.default = SliderHandler;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jquery = __webpack_require__(0);

var _jquery2 = _interopRequireDefault(_jquery);

var _options = __webpack_require__(3);

var _options2 = _interopRequireDefault(_options);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Handles everything related to the UI of the colorpicker popup: show, hide, position,...
 * @ignore
 */
var PopupHandler = function () {
  /**
   * @param {Colorpicker} colorpicker
   * @param {Window} root
   */
  function PopupHandler(colorpicker, root) {
    _classCallCheck(this, PopupHandler);

    /**
     * @type {Window}
     */
    this.root = root;
    /**
     * @type {Colorpicker}
     */
    this.colorpicker = colorpicker;
    /**
     * @type {jQuery}
     */
    this.popoverTarget = null;
    /**
     * @type {jQuery}
     */
    this.popoverTip = null;

    /**
     * If true, the latest click was inside the popover
     * @type {boolean}
     */
    this.clicking = false;
    /**
     * @type {boolean}
     */
    this.hidding = false;
    /**
     * @type {boolean}
     */
    this.showing = false;
  }

  /**
   * @private
   * @returns {jQuery|false}
   */


  _createClass(PopupHandler, [{
    key: 'bind',


    /**
     * Binds the different colorpicker elements to the focus/mouse/touch events so it reacts in order to show or
     * hide the colorpicker popup accordingly. It also adds the proper classes.
     */
    value: function bind() {
      var cp = this.colorpicker;

      if (cp.options.inline) {
        cp.picker.addClass('colorpicker-inline colorpicker-visible');
        return; // no need to bind show/hide events for inline elements
      }

      cp.picker.addClass('colorpicker-popup colorpicker-hidden');

      // there is no input or addon
      if (!this.hasInput && !this.hasAddon) {
        return;
      }

      // create Bootstrap 4 popover
      if (cp.options.popover) {
        this.createPopover();
      }

      // bind addon show/hide events
      if (this.hasAddon) {
        // enable focus on addons
        if (!this.addon.attr('tabindex')) {
          this.addon.attr('tabindex', 0);
        }

        this.addon.on({
          'mousedown.colorpicker touchstart.colorpicker': _jquery2.default.proxy(this.toggle, this)
        });

        this.addon.on({
          'focus.colorpicker': _jquery2.default.proxy(this.show, this)
        });

        this.addon.on({
          'focusout.colorpicker': _jquery2.default.proxy(this.hide, this)
        });
      }

      // bind input show/hide events
      if (this.hasInput && !this.hasAddon) {
        this.input.on({
          'mousedown.colorpicker touchstart.colorpicker': _jquery2.default.proxy(this.show, this),
          'focus.colorpicker': _jquery2.default.proxy(this.show, this)
        });

        this.input.on({
          'focusout.colorpicker': _jquery2.default.proxy(this.hide, this)
        });
      }

      // reposition popup on window resize
      (0, _jquery2.default)(this.root).on('resize.colorpicker', _jquery2.default.proxy(this.reposition, this));
    }

    /**
     * Unbinds any event bound by this handler
     */

  }, {
    key: 'unbind',
    value: function unbind() {
      if (this.hasInput) {
        this.input.off({
          'mousedown.colorpicker touchstart.colorpicker': _jquery2.default.proxy(this.show, this),
          'focus.colorpicker': _jquery2.default.proxy(this.show, this)
        });
        this.input.off({
          'focusout.colorpicker': _jquery2.default.proxy(this.hide, this)
        });
      }

      if (this.hasAddon) {
        this.addon.off({
          'mousedown.colorpicker touchstart.colorpicker': _jquery2.default.proxy(this.toggle, this)
        });
        this.addon.off({
          'focus.colorpicker': _jquery2.default.proxy(this.show, this)
        });
        this.addon.off({
          'focusout.colorpicker': _jquery2.default.proxy(this.hide, this)
        });
      }

      if (this.popoverTarget) {
        this.popoverTarget.popover('dispose');
      }

      (0, _jquery2.default)(this.root).off('resize.colorpicker', _jquery2.default.proxy(this.reposition, this));
      (0, _jquery2.default)(this.root.document).off('mousedown.colorpicker touchstart.colorpicker', _jquery2.default.proxy(this.hide, this));
      (0, _jquery2.default)(this.root.document).off('mousedown.colorpicker touchstart.colorpicker', _jquery2.default.proxy(this.onClickingInside, this));
    }
  }, {
    key: 'isClickingInside',
    value: function isClickingInside(e) {
      if (!e) {
        return false;
      }

      return this.isOrIsInside(this.popoverTip, e.currentTarget) || this.isOrIsInside(this.popoverTip, e.target) || this.isOrIsInside(this.colorpicker.picker, e.currentTarget) || this.isOrIsInside(this.colorpicker.picker, e.target);
    }
  }, {
    key: 'isOrIsInside',
    value: function isOrIsInside(container, element) {
      if (!container || !element) {
        return false;
      }

      element = (0, _jquery2.default)(element);

      return element.is(container) || container.find(element).length > 0;
    }
  }, {
    key: 'onClickingInside',
    value: function onClickingInside(e) {
      this.clicking = this.isClickingInside(e);
    }
  }, {
    key: 'createPopover',
    value: function createPopover() {
      var cp = this.colorpicker;

      this.popoverTarget = this.hasAddon ? this.addon : this.input;

      cp.picker.addClass('colorpicker-bs-popover-content');

      this.popoverTarget.popover(_jquery2.default.extend(true, {}, _options2.default.popover, cp.options.popover, { trigger: 'manual', content: cp.picker, html: true }));

      this.popoverTip = (0, _jquery2.default)(this.popoverTarget.popover('getTipElement').data('bs.popover').tip);
      this.popoverTip.addClass('colorpicker-bs-popover');

      this.popoverTarget.on('shown.bs.popover', _jquery2.default.proxy(this.fireShow, this));
      this.popoverTarget.on('hidden.bs.popover', _jquery2.default.proxy(this.fireHide, this));
    }

    /**
     * If the widget is not inside a container or inline, rearranges its position relative to its element offset.
     *
     * @param {Event} [e]
     * @private
     */

  }, {
    key: 'reposition',
    value: function reposition(e) {
      if (this.popoverTarget && this.isVisible()) {
        this.popoverTarget.popover('update');
      }
    }

    /**
     * Toggles the colorpicker between visible or hidden
     *
     * @fires Colorpicker#colorpickerShow
     * @fires Colorpicker#colorpickerHide
     * @param {Event} [e]
     */

  }, {
    key: 'toggle',
    value: function toggle(e) {
      if (this.isVisible()) {
        this.hide(e);
      } else {
        this.show(e);
      }
    }

    /**
     * Shows the colorpicker widget if hidden.
     *
     * @fires Colorpicker#colorpickerShow
     * @param {Event} [e]
     */

  }, {
    key: 'show',
    value: function show(e) {
      if (this.isVisible() || this.showing || this.hidding) {
        return;
      }

      this.showing = true;
      this.hidding = false;
      this.clicking = false;

      var cp = this.colorpicker;

      cp.lastEvent.alias = 'show';
      cp.lastEvent.e = e;

      // Prevent showing browser native HTML5 colorpicker
      if (e && (!this.hasInput || this.input.attr('type') === 'color') && e && e.preventDefault) {
        e.stopPropagation();
        e.preventDefault();
      }

      // If it's a popover, add event to the document to hide the picker when clicking outside of it
      if (this.isPopover) {
        (0, _jquery2.default)(this.root).on('resize.colorpicker', _jquery2.default.proxy(this.reposition, this));
      }

      // add visible class before popover is shown
      cp.picker.addClass('colorpicker-visible').removeClass('colorpicker-hidden');

      if (this.popoverTarget) {
        this.popoverTarget.popover('show');
      } else {
        this.fireShow();
      }
    }
  }, {
    key: 'fireShow',
    value: function fireShow() {
      this.hidding = false;
      this.showing = false;

      if (this.isPopover) {
        // Add event to hide on outside click
        (0, _jquery2.default)(this.root.document).on('mousedown.colorpicker touchstart.colorpicker', _jquery2.default.proxy(this.hide, this));
        (0, _jquery2.default)(this.root.document).on('mousedown.colorpicker touchstart.colorpicker', _jquery2.default.proxy(this.onClickingInside, this));
      }

      /**
       * (Colorpicker) When show() is called and the widget can be shown.
       *
       * @event Colorpicker#colorpickerShow
       */
      this.colorpicker.trigger('colorpickerShow');
    }

    /**
     * Hides the colorpicker widget.
     * Hide is prevented when it is triggered by an event whose target element has been clicked/touched.
     *
     * @fires Colorpicker#colorpickerHide
     * @param {Event} [e]
     */

  }, {
    key: 'hide',
    value: function hide(e) {
      if (this.isHidden() || this.showing || this.hidding) {
        return;
      }

      var cp = this.colorpicker,
          clicking = this.clicking || this.isClickingInside(e);

      this.hidding = true;
      this.showing = false;
      this.clicking = false;

      cp.lastEvent.alias = 'hide';
      cp.lastEvent.e = e;

      // TODO: fix having to click twice outside when losing focus and last 2 clicks where inside the colorpicker

      // Prevent hide if triggered by an event and an element inside the colorpicker has been clicked/touched
      if (clicking) {
        this.hidding = false;
        return;
      }

      if (this.popoverTarget) {
        this.popoverTarget.popover('hide');
      } else {
        this.fireHide();
      }
    }
  }, {
    key: 'fireHide',
    value: function fireHide() {
      this.hidding = false;
      this.showing = false;

      var cp = this.colorpicker;

      // add hidden class after popover is hidden
      cp.picker.addClass('colorpicker-hidden').removeClass('colorpicker-visible');

      // Unbind window and document events, since there is no need to keep them while the popup is hidden
      (0, _jquery2.default)(this.root).off('resize.colorpicker', _jquery2.default.proxy(this.reposition, this));
      (0, _jquery2.default)(this.root.document).off('mousedown.colorpicker touchstart.colorpicker', _jquery2.default.proxy(this.hide, this));
      (0, _jquery2.default)(this.root.document).off('mousedown.colorpicker touchstart.colorpicker', _jquery2.default.proxy(this.onClickingInside, this));

      /**
       * (Colorpicker) When hide() is called and the widget can be hidden.
       *
       * @event Colorpicker#colorpickerHide
       */
      cp.trigger('colorpickerHide');
    }
  }, {
    key: 'focus',
    value: function focus() {
      if (this.hasAddon) {
        return this.addon.focus();
      }
      if (this.hasInput) {
        return this.input.focus();
      }
      return false;
    }

    /**
     * Returns true if the colorpicker element has the colorpicker-visible class and not the colorpicker-hidden one.
     * False otherwise.
     *
     * @returns {boolean}
     */

  }, {
    key: 'isVisible',
    value: function isVisible() {
      return this.colorpicker.picker.hasClass('colorpicker-visible') && !this.colorpicker.picker.hasClass('colorpicker-hidden');
    }

    /**
     * Returns true if the colorpicker element has the colorpicker-hidden class and not the colorpicker-visible one.
     * False otherwise.
     *
     * @returns {boolean}
     */

  }, {
    key: 'isHidden',
    value: function isHidden() {
      return this.colorpicker.picker.hasClass('colorpicker-hidden') && !this.colorpicker.picker.hasClass('colorpicker-visible');
    }
  }, {
    key: 'input',
    get: function get() {
      return this.colorpicker.inputHandler.input;
    }

    /**
     * @private
     * @returns {boolean}
     */

  }, {
    key: 'hasInput',
    get: function get() {
      return this.colorpicker.inputHandler.hasInput();
    }

    /**
     * @private
     * @returns {jQuery|false}
     */

  }, {
    key: 'addon',
    get: function get() {
      return this.colorpicker.addonHandler.addon;
    }

    /**
     * @private
     * @returns {boolean}
     */

  }, {
    key: 'hasAddon',
    get: function get() {
      return this.colorpicker.addonHandler.hasAddon();
    }

    /**
     * @private
     * @returns {boolean}
     */

  }, {
    key: 'isPopover',
    get: function get() {
      return !this.colorpicker.options.inline && !!this.popoverTip;
    }
  }]);

  return PopupHandler;
}();

exports.default = PopupHandler;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jquery = __webpack_require__(0);

var _jquery2 = _interopRequireDefault(_jquery);

var _ColorItem = __webpack_require__(2);

var _ColorItem2 = _interopRequireDefault(_ColorItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Handles everything related to the colorpicker input
 * @ignore
 */
var InputHandler = function () {
  /**
   * @param {Colorpicker} colorpicker
   */
  function InputHandler(colorpicker) {
    _classCallCheck(this, InputHandler);

    /**
     * @type {Colorpicker}
     */
    this.colorpicker = colorpicker;
    /**
     * @type {jQuery|false}
     */
    this.input = this.colorpicker.element.is('input') ? this.colorpicker.element : this.colorpicker.options.input ? this.colorpicker.element.find(this.colorpicker.options.input) : false;

    if (this.input && this.input.length === 0) {
      this.input = false;
    }

    this._initValue();
  }

  _createClass(InputHandler, [{
    key: 'bind',
    value: function bind() {
      if (!this.hasInput()) {
        return;
      }
      this.input.on({
        'keyup.colorpicker': _jquery2.default.proxy(this.onkeyup, this)
      });
      this.input.on({
        'change.colorpicker': _jquery2.default.proxy(this.onchange, this)
      });
    }
  }, {
    key: 'unbind',
    value: function unbind() {
      if (!this.hasInput()) {
        return;
      }
      this.input.off('.colorpicker');
    }
  }, {
    key: '_initValue',
    value: function _initValue() {
      if (!this.hasInput()) {
        return;
      }

      var val = '';

      [
      // candidates:
      this.input.val(), this.input.data('color'), this.input.attr('data-color')].map(function (item) {
        if (item && val === '') {
          val = item;
        }
      });

      if (val instanceof _ColorItem2.default) {
        val = this.getFormattedColor(val.string(this.colorpicker.format));
      } else if (!(typeof val === 'string' || val instanceof String)) {
        val = '';
      }

      this.input.prop('value', val);
    }

    /**
     * Returns the color string from the input value.
     * If there is no input the return value is false.
     *
     * @returns {String|boolean}
     */

  }, {
    key: 'getValue',
    value: function getValue() {
      if (!this.hasInput()) {
        return false;
      }

      return this.input.val();
    }

    /**
     * If the input element is present, it updates the value with the current color object color string.
     * If the value is changed, this method fires a "change" event on the input element.
     *
     * @param {String} val
     *
     * @fires Colorpicker#change
     */

  }, {
    key: 'setValue',
    value: function setValue(val) {
      if (!this.hasInput()) {
        return;
      }

      var inputVal = this.input.prop('value');

      val = val ? val : '';

      if (val === (inputVal ? inputVal : '')) {
        // No need to set value or trigger any event if nothing changed
        return;
      }

      this.input.prop('value', val);

      /**
       * (Input) Triggered on the input element when a new color is selected.
       *
       * @event Colorpicker#change
       */
      this.input.trigger({
        type: 'change',
        colorpicker: this.colorpicker,
        color: this.colorpicker.color,
        value: val
      });
    }

    /**
     * Returns the formatted color string, with the formatting options applied
     * (e.g. useHashPrefix)
     *
     * @param {String|null} val
     *
     * @returns {String}
     */

  }, {
    key: 'getFormattedColor',
    value: function getFormattedColor() {
      var val = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      val = val ? val : this.colorpicker.colorHandler.getColorString();

      if (!val) {
        return '';
      }

      val = this.colorpicker.colorHandler.resolveColorDelegate(val, false);

      if (this.colorpicker.options.useHashPrefix === false) {
        val = val.replace(/^#/g, '');
      }

      return val;
    }

    /**
     * Returns true if the widget has an associated input element, false otherwise
     * @returns {boolean}
     */

  }, {
    key: 'hasInput',
    value: function hasInput() {
      return this.input !== false;
    }

    /**
     * Returns true if the input exists and is disabled
     * @returns {boolean}
     */

  }, {
    key: 'isEnabled',
    value: function isEnabled() {
      return this.hasInput() && !this.isDisabled();
    }

    /**
     * Returns true if the input exists and is disabled
     * @returns {boolean}
     */

  }, {
    key: 'isDisabled',
    value: function isDisabled() {
      return this.hasInput() && this.input.prop('disabled') === true;
    }

    /**
     * Disables the input if any
     *
     * @fires Colorpicker#colorpickerDisable
     * @returns {boolean}
     */

  }, {
    key: 'disable',
    value: function disable() {
      if (this.hasInput()) {
        this.input.prop('disabled', true);
      }
    }

    /**
     * Enables the input if any
     *
     * @fires Colorpicker#colorpickerEnable
     * @returns {boolean}
     */

  }, {
    key: 'enable',
    value: function enable() {
      if (this.hasInput()) {
        this.input.prop('disabled', false);
      }
    }

    /**
     * Calls setValue with the current internal color value
     *
     * @fires Colorpicker#change
     */

  }, {
    key: 'update',
    value: function update() {
      if (!this.hasInput()) {
        return;
      }

      if (this.colorpicker.options.autoInputFallback === false && this.colorpicker.colorHandler.isInvalidColor()) {
        // prevent update if color is invalid, autoInputFallback is disabled and the last event is keyup.
        return;
      }

      this.setValue(this.getFormattedColor());
    }

    /**
     * Function triggered when the input has changed, so the colorpicker gets updated.
     *
     * @private
     * @param {Event} e
     * @returns {boolean}
     */

  }, {
    key: 'onchange',
    value: function onchange(e) {
      this.colorpicker.lastEvent.alias = 'input.change';
      this.colorpicker.lastEvent.e = e;

      var val = this.getValue();

      if (val !== e.value) {
        this.colorpicker.setValue(val);
      }
    }

    /**
     * Function triggered after a keyboard key has been released.
     *
     * @private
     * @param {Event} e
     * @returns {boolean}
     */

  }, {
    key: 'onkeyup',
    value: function onkeyup(e) {
      this.colorpicker.lastEvent.alias = 'input.keyup';
      this.colorpicker.lastEvent.e = e;

      var val = this.getValue();

      if (val !== e.value) {
        this.colorpicker.setValue(val);
      }
    }
  }]);

  return InputHandler;
}();

exports.default = InputHandler;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var colorString = __webpack_require__(17);
var convert = __webpack_require__(20);

var _slice = [].slice;

var skippedModels = [
	// to be honest, I don't really feel like keyword belongs in color convert, but eh.
	'keyword',

	// gray conflicts with some method names, and has its own method defined.
	'gray',

	// shouldn't really be in color-convert either...
	'hex'
];

var hashedModelKeys = {};
Object.keys(convert).forEach(function (model) {
	hashedModelKeys[_slice.call(convert[model].labels).sort().join('')] = model;
});

var limiters = {};

function Color(obj, model) {
	if (!(this instanceof Color)) {
		return new Color(obj, model);
	}

	if (model && model in skippedModels) {
		model = null;
	}

	if (model && !(model in convert)) {
		throw new Error('Unknown model: ' + model);
	}

	var i;
	var channels;

	if (!obj) {
		this.model = 'rgb';
		this.color = [0, 0, 0];
		this.valpha = 1;
	} else if (obj instanceof Color) {
		this.model = obj.model;
		this.color = obj.color.slice();
		this.valpha = obj.valpha;
	} else if (typeof obj === 'string') {
		var result = colorString.get(obj);
		if (result === null) {
			throw new Error('Unable to parse color from string: ' + obj);
		}

		this.model = result.model;
		channels = convert[this.model].channels;
		this.color = result.value.slice(0, channels);
		this.valpha = typeof result.value[channels] === 'number' ? result.value[channels] : 1;
	} else if (obj.length) {
		this.model = model || 'rgb';
		channels = convert[this.model].channels;
		var newArr = _slice.call(obj, 0, channels);
		this.color = zeroArray(newArr, channels);
		this.valpha = typeof obj[channels] === 'number' ? obj[channels] : 1;
	} else if (typeof obj === 'number') {
		// this is always RGB - can be converted later on.
		obj &= 0xFFFFFF;
		this.model = 'rgb';
		this.color = [
			(obj >> 16) & 0xFF,
			(obj >> 8) & 0xFF,
			obj & 0xFF
		];
		this.valpha = 1;
	} else {
		this.valpha = 1;

		var keys = Object.keys(obj);
		if ('alpha' in obj) {
			keys.splice(keys.indexOf('alpha'), 1);
			this.valpha = typeof obj.alpha === 'number' ? obj.alpha : 0;
		}

		var hashedKeys = keys.sort().join('');
		if (!(hashedKeys in hashedModelKeys)) {
			throw new Error('Unable to parse color from object: ' + JSON.stringify(obj));
		}

		this.model = hashedModelKeys[hashedKeys];

		var labels = convert[this.model].labels;
		var color = [];
		for (i = 0; i < labels.length; i++) {
			color.push(obj[labels[i]]);
		}

		this.color = zeroArray(color);
	}

	// perform limitations (clamping, etc.)
	if (limiters[this.model]) {
		channels = convert[this.model].channels;
		for (i = 0; i < channels; i++) {
			var limit = limiters[this.model][i];
			if (limit) {
				this.color[i] = limit(this.color[i]);
			}
		}
	}

	this.valpha = Math.max(0, Math.min(1, this.valpha));

	if (Object.freeze) {
		Object.freeze(this);
	}
}

Color.prototype = {
	toString: function () {
		return this.string();
	},

	toJSON: function () {
		return this[this.model]();
	},

	string: function (places) {
		var self = this.model in colorString.to ? this : this.rgb();
		self = self.round(typeof places === 'number' ? places : 1);
		var args = self.valpha === 1 ? self.color : self.color.concat(this.valpha);
		return colorString.to[self.model](args);
	},

	percentString: function (places) {
		var self = this.rgb().round(typeof places === 'number' ? places : 1);
		var args = self.valpha === 1 ? self.color : self.color.concat(this.valpha);
		return colorString.to.rgb.percent(args);
	},

	array: function () {
		return this.valpha === 1 ? this.color.slice() : this.color.concat(this.valpha);
	},

	object: function () {
		var result = {};
		var channels = convert[this.model].channels;
		var labels = convert[this.model].labels;

		for (var i = 0; i < channels; i++) {
			result[labels[i]] = this.color[i];
		}

		if (this.valpha !== 1) {
			result.alpha = this.valpha;
		}

		return result;
	},

	unitArray: function () {
		var rgb = this.rgb().color;
		rgb[0] /= 255;
		rgb[1] /= 255;
		rgb[2] /= 255;

		if (this.valpha !== 1) {
			rgb.push(this.valpha);
		}

		return rgb;
	},

	unitObject: function () {
		var rgb = this.rgb().object();
		rgb.r /= 255;
		rgb.g /= 255;
		rgb.b /= 255;

		if (this.valpha !== 1) {
			rgb.alpha = this.valpha;
		}

		return rgb;
	},

	round: function (places) {
		places = Math.max(places || 0, 0);
		return new Color(this.color.map(roundToPlace(places)).concat(this.valpha), this.model);
	},

	alpha: function (val) {
		if (arguments.length) {
			return new Color(this.color.concat(Math.max(0, Math.min(1, val))), this.model);
		}

		return this.valpha;
	},

	// rgb
	red: getset('rgb', 0, maxfn(255)),
	green: getset('rgb', 1, maxfn(255)),
	blue: getset('rgb', 2, maxfn(255)),

	hue: getset(['hsl', 'hsv', 'hsl', 'hwb', 'hcg'], 0, function (val) { return ((val % 360) + 360) % 360; }), // eslint-disable-line brace-style

	saturationl: getset('hsl', 1, maxfn(100)),
	lightness: getset('hsl', 2, maxfn(100)),

	saturationv: getset('hsv', 1, maxfn(100)),
	value: getset('hsv', 2, maxfn(100)),

	chroma: getset('hcg', 1, maxfn(100)),
	gray: getset('hcg', 2, maxfn(100)),

	white: getset('hwb', 1, maxfn(100)),
	wblack: getset('hwb', 2, maxfn(100)),

	cyan: getset('cmyk', 0, maxfn(100)),
	magenta: getset('cmyk', 1, maxfn(100)),
	yellow: getset('cmyk', 2, maxfn(100)),
	black: getset('cmyk', 3, maxfn(100)),

	x: getset('xyz', 0, maxfn(100)),
	y: getset('xyz', 1, maxfn(100)),
	z: getset('xyz', 2, maxfn(100)),

	l: getset('lab', 0, maxfn(100)),
	a: getset('lab', 1),
	b: getset('lab', 2),

	keyword: function (val) {
		if (arguments.length) {
			return new Color(val);
		}

		return convert[this.model].keyword(this.color);
	},

	hex: function (val) {
		if (arguments.length) {
			return new Color(val);
		}

		return colorString.to.hex(this.rgb().round().color);
	},

	rgbNumber: function () {
		var rgb = this.rgb().color;
		return ((rgb[0] & 0xFF) << 16) | ((rgb[1] & 0xFF) << 8) | (rgb[2] & 0xFF);
	},

	luminosity: function () {
		// http://www.w3.org/TR/WCAG20/#relativeluminancedef
		var rgb = this.rgb().color;

		var lum = [];
		for (var i = 0; i < rgb.length; i++) {
			var chan = rgb[i] / 255;
			lum[i] = (chan <= 0.03928) ? chan / 12.92 : Math.pow(((chan + 0.055) / 1.055), 2.4);
		}

		return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
	},

	contrast: function (color2) {
		// http://www.w3.org/TR/WCAG20/#contrast-ratiodef
		var lum1 = this.luminosity();
		var lum2 = color2.luminosity();

		if (lum1 > lum2) {
			return (lum1 + 0.05) / (lum2 + 0.05);
		}

		return (lum2 + 0.05) / (lum1 + 0.05);
	},

	level: function (color2) {
		var contrastRatio = this.contrast(color2);
		if (contrastRatio >= 7.1) {
			return 'AAA';
		}

		return (contrastRatio >= 4.5) ? 'AA' : '';
	},

	isDark: function () {
		// YIQ equation from http://24ways.org/2010/calculating-color-contrast
		var rgb = this.rgb().color;
		var yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
		return yiq < 128;
	},

	isLight: function () {
		return !this.isDark();
	},

	negate: function () {
		var rgb = this.rgb();
		for (var i = 0; i < 3; i++) {
			rgb.color[i] = 255 - rgb.color[i];
		}
		return rgb;
	},

	lighten: function (ratio) {
		var hsl = this.hsl();
		hsl.color[2] += hsl.color[2] * ratio;
		return hsl;
	},

	darken: function (ratio) {
		var hsl = this.hsl();
		hsl.color[2] -= hsl.color[2] * ratio;
		return hsl;
	},

	saturate: function (ratio) {
		var hsl = this.hsl();
		hsl.color[1] += hsl.color[1] * ratio;
		return hsl;
	},

	desaturate: function (ratio) {
		var hsl = this.hsl();
		hsl.color[1] -= hsl.color[1] * ratio;
		return hsl;
	},

	whiten: function (ratio) {
		var hwb = this.hwb();
		hwb.color[1] += hwb.color[1] * ratio;
		return hwb;
	},

	blacken: function (ratio) {
		var hwb = this.hwb();
		hwb.color[2] += hwb.color[2] * ratio;
		return hwb;
	},

	grayscale: function () {
		// http://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
		var rgb = this.rgb().color;
		var val = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
		return Color.rgb(val, val, val);
	},

	fade: function (ratio) {
		return this.alpha(this.valpha - (this.valpha * ratio));
	},

	opaquer: function (ratio) {
		return this.alpha(this.valpha + (this.valpha * ratio));
	},

	rotate: function (degrees) {
		var hsl = this.hsl();
		var hue = hsl.color[0];
		hue = (hue + degrees) % 360;
		hue = hue < 0 ? 360 + hue : hue;
		hsl.color[0] = hue;
		return hsl;
	},

	mix: function (mixinColor, weight) {
		// ported from sass implementation in C
		// https://github.com/sass/libsass/blob/0e6b4a2850092356aa3ece07c6b249f0221caced/functions.cpp#L209
		var color1 = mixinColor.rgb();
		var color2 = this.rgb();
		var p = weight === undefined ? 0.5 : weight;

		var w = 2 * p - 1;
		var a = color1.alpha() - color2.alpha();

		var w1 = (((w * a === -1) ? w : (w + a) / (1 + w * a)) + 1) / 2.0;
		var w2 = 1 - w1;

		return Color.rgb(
				w1 * color1.red() + w2 * color2.red(),
				w1 * color1.green() + w2 * color2.green(),
				w1 * color1.blue() + w2 * color2.blue(),
				color1.alpha() * p + color2.alpha() * (1 - p));
	}
};

// model conversion methods and static constructors
Object.keys(convert).forEach(function (model) {
	if (skippedModels.indexOf(model) !== -1) {
		return;
	}

	var channels = convert[model].channels;

	// conversion methods
	Color.prototype[model] = function () {
		if (this.model === model) {
			return new Color(this);
		}

		if (arguments.length) {
			return new Color(arguments, model);
		}

		var newAlpha = typeof arguments[channels] === 'number' ? channels : this.valpha;
		return new Color(assertArray(convert[this.model][model].raw(this.color)).concat(newAlpha), model);
	};

	// 'static' construction methods
	Color[model] = function (color) {
		if (typeof color === 'number') {
			color = zeroArray(_slice.call(arguments), channels);
		}
		return new Color(color, model);
	};
});

function roundTo(num, places) {
	return Number(num.toFixed(places));
}

function roundToPlace(places) {
	return function (num) {
		return roundTo(num, places);
	};
}

function getset(model, channel, modifier) {
	model = Array.isArray(model) ? model : [model];

	model.forEach(function (m) {
		(limiters[m] || (limiters[m] = []))[channel] = modifier;
	});

	model = model[0];

	return function (val) {
		var result;

		if (arguments.length) {
			if (modifier) {
				val = modifier(val);
			}

			result = this[model]();
			result.color[channel] = val;
			return result;
		}

		result = this[model]().color[channel];
		if (modifier) {
			result = modifier(result);
		}

		return result;
	};
}

function maxfn(max) {
	return function (v) {
		return Math.max(0, Math.min(max, v));
	};
}

function assertArray(val) {
	return Array.isArray(val) ? val : [val];
}

function zeroArray(arr, length) {
	for (var i = 0; i < length; i++) {
		if (typeof arr[i] !== 'number') {
			arr[i] = 0;
		}
	}

	return arr;
}

module.exports = Color;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

/* MIT license */
var colorNames = __webpack_require__(5);
var swizzle = __webpack_require__(18);

var reverseNames = {};

// create a list of reverse color names
for (var name in colorNames) {
	if (colorNames.hasOwnProperty(name)) {
		reverseNames[colorNames[name]] = name;
	}
}

var cs = module.exports = {
	to: {}
};

cs.get = function (string) {
	var prefix = string.substring(0, 3).toLowerCase();
	var val;
	var model;
	switch (prefix) {
		case 'hsl':
			val = cs.get.hsl(string);
			model = 'hsl';
			break;
		case 'hwb':
			val = cs.get.hwb(string);
			model = 'hwb';
			break;
		default:
			val = cs.get.rgb(string);
			model = 'rgb';
			break;
	}

	if (!val) {
		return null;
	}

	return {model: model, value: val};
};

cs.get.rgb = function (string) {
	if (!string) {
		return null;
	}

	var abbr = /^#([a-f0-9]{3,4})$/i;
	var hex = /^#([a-f0-9]{6})([a-f0-9]{2})?$/i;
	var rgba = /^rgba?\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
	var per = /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
	var keyword = /(\D+)/;

	var rgb = [0, 0, 0, 1];
	var match;
	var i;
	var hexAlpha;

	if (match = string.match(hex)) {
		hexAlpha = match[2];
		match = match[1];

		for (i = 0; i < 3; i++) {
			// https://jsperf.com/slice-vs-substr-vs-substring-methods-long-string/19
			var i2 = i * 2;
			rgb[i] = parseInt(match.slice(i2, i2 + 2), 16);
		}

		if (hexAlpha) {
			rgb[3] = Math.round((parseInt(hexAlpha, 16) / 255) * 100) / 100;
		}
	} else if (match = string.match(abbr)) {
		match = match[1];
		hexAlpha = match[3];

		for (i = 0; i < 3; i++) {
			rgb[i] = parseInt(match[i] + match[i], 16);
		}

		if (hexAlpha) {
			rgb[3] = Math.round((parseInt(hexAlpha + hexAlpha, 16) / 255) * 100) / 100;
		}
	} else if (match = string.match(rgba)) {
		for (i = 0; i < 3; i++) {
			rgb[i] = parseInt(match[i + 1], 0);
		}

		if (match[4]) {
			rgb[3] = parseFloat(match[4]);
		}
	} else if (match = string.match(per)) {
		for (i = 0; i < 3; i++) {
			rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
		}

		if (match[4]) {
			rgb[3] = parseFloat(match[4]);
		}
	} else if (match = string.match(keyword)) {
		if (match[1] === 'transparent') {
			return [0, 0, 0, 0];
		}

		rgb = colorNames[match[1]];

		if (!rgb) {
			return null;
		}

		rgb[3] = 1;

		return rgb;
	} else {
		return null;
	}

	for (i = 0; i < 3; i++) {
		rgb[i] = clamp(rgb[i], 0, 255);
	}
	rgb[3] = clamp(rgb[3], 0, 1);

	return rgb;
};

cs.get.hsl = function (string) {
	if (!string) {
		return null;
	}

	var hsl = /^hsla?\(\s*([+-]?\d*[\.]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
	var match = string.match(hsl);

	if (match) {
		var alpha = parseFloat(match[4]);
		var h = ((parseFloat(match[1]) % 360) + 360) % 360;
		var s = clamp(parseFloat(match[2]), 0, 100);
		var l = clamp(parseFloat(match[3]), 0, 100);
		var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);

		return [h, s, l, a];
	}

	return null;
};

cs.get.hwb = function (string) {
	if (!string) {
		return null;
	}

	var hwb = /^hwb\(\s*([+-]?\d*[\.]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
	var match = string.match(hwb);

	if (match) {
		var alpha = parseFloat(match[4]);
		var h = ((parseFloat(match[1]) % 360) + 360) % 360;
		var w = clamp(parseFloat(match[2]), 0, 100);
		var b = clamp(parseFloat(match[3]), 0, 100);
		var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
		return [h, w, b, a];
	}

	return null;
};

cs.to.hex = function () {
	var rgba = swizzle(arguments);

	return (
		'#' +
		hexDouble(rgba[0]) +
		hexDouble(rgba[1]) +
		hexDouble(rgba[2]) +
		(rgba[3] < 1
			? (hexDouble(Math.round(rgba[3] * 255)))
			: '')
	);
};

cs.to.rgb = function () {
	var rgba = swizzle(arguments);

	return rgba.length < 4 || rgba[3] === 1
		? 'rgb(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ')'
		: 'rgba(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ', ' + rgba[3] + ')';
};

cs.to.rgb.percent = function () {
	var rgba = swizzle(arguments);

	var r = Math.round(rgba[0] / 255 * 100);
	var g = Math.round(rgba[1] / 255 * 100);
	var b = Math.round(rgba[2] / 255 * 100);

	return rgba.length < 4 || rgba[3] === 1
		? 'rgb(' + r + '%, ' + g + '%, ' + b + '%)'
		: 'rgba(' + r + '%, ' + g + '%, ' + b + '%, ' + rgba[3] + ')';
};

cs.to.hsl = function () {
	var hsla = swizzle(arguments);
	return hsla.length < 4 || hsla[3] === 1
		? 'hsl(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%)'
		: 'hsla(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%, ' + hsla[3] + ')';
};

// hwb is a bit different than rgb(a) & hsl(a) since there is no alpha specific syntax
// (hwb have alpha optional & 1 is default value)
cs.to.hwb = function () {
	var hwba = swizzle(arguments);

	var a = '';
	if (hwba.length >= 4 && hwba[3] !== 1) {
		a = ', ' + hwba[3];
	}

	return 'hwb(' + hwba[0] + ', ' + hwba[1] + '%, ' + hwba[2] + '%' + a + ')';
};

cs.to.keyword = function (rgb) {
	return reverseNames[rgb.slice(0, 3)];
};

// helpers
function clamp(num, min, max) {
	return Math.min(Math.max(min, num), max);
}

function hexDouble(num) {
	var str = num.toString(16).toUpperCase();
	return (str.length < 2) ? '0' + str : str;
}


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isArrayish = __webpack_require__(19);

var concat = Array.prototype.concat;
var slice = Array.prototype.slice;

var swizzle = module.exports = function swizzle(args) {
	var results = [];

	for (var i = 0, len = args.length; i < len; i++) {
		var arg = args[i];

		if (isArrayish(arg)) {
			// http://jsperf.com/javascript-array-concat-vs-push/98
			results = concat.call(results, slice.call(arg));
		} else {
			results.push(arg);
		}
	}

	return results;
};

swizzle.wrap = function (fn) {
	return function () {
		return fn(swizzle(arguments));
	};
};


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function isArrayish(obj) {
	if (!obj) {
		return false;
	}

	return obj instanceof Array || Array.isArray(obj) ||
		(obj.length >= 0 && obj.splice instanceof Function);
};


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

var conversions = __webpack_require__(6);
var route = __webpack_require__(21);

var convert = {};

var models = Object.keys(conversions);

function wrapRaw(fn) {
	var wrappedFn = function (args) {
		if (args === undefined || args === null) {
			return args;
		}

		if (arguments.length > 1) {
			args = Array.prototype.slice.call(arguments);
		}

		return fn(args);
	};

	// preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

function wrapRounded(fn) {
	var wrappedFn = function (args) {
		if (args === undefined || args === null) {
			return args;
		}

		if (arguments.length > 1) {
			args = Array.prototype.slice.call(arguments);
		}

		var result = fn(args);

		// we're assuming the result is an array here.
		// see notice in conversions.js; don't use box types
		// in conversion functions.
		if (typeof result === 'object') {
			for (var len = result.length, i = 0; i < len; i++) {
				result[i] = Math.round(result[i]);
			}
		}

		return result;
	};

	// preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

models.forEach(function (fromModel) {
	convert[fromModel] = {};

	Object.defineProperty(convert[fromModel], 'channels', {value: conversions[fromModel].channels});
	Object.defineProperty(convert[fromModel], 'labels', {value: conversions[fromModel].labels});

	var routes = route(fromModel);
	var routeModels = Object.keys(routes);

	routeModels.forEach(function (toModel) {
		var fn = routes[toModel];

		convert[fromModel][toModel] = wrapRounded(fn);
		convert[fromModel][toModel].raw = wrapRaw(fn);
	});
});

module.exports = convert;


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

var conversions = __webpack_require__(6);

/*
	this function routes a model to all other models.

	all functions that are routed have a property `.conversion` attached
	to the returned synthetic function. This property is an array
	of strings, each with the steps in between the 'from' and 'to'
	color models (inclusive).

	conversions that are not possible simply are not included.
*/

function buildGraph() {
	var graph = {};
	// https://jsperf.com/object-keys-vs-for-in-with-closure/3
	var models = Object.keys(conversions);

	for (var len = models.length, i = 0; i < len; i++) {
		graph[models[i]] = {
			// http://jsperf.com/1-vs-infinity
			// micro-opt, but this is simple.
			distance: -1,
			parent: null
		};
	}

	return graph;
}

// https://en.wikipedia.org/wiki/Breadth-first_search
function deriveBFS(fromModel) {
	var graph = buildGraph();
	var queue = [fromModel]; // unshift -> queue -> pop

	graph[fromModel].distance = 0;

	while (queue.length) {
		var current = queue.pop();
		var adjacents = Object.keys(conversions[current]);

		for (var len = adjacents.length, i = 0; i < len; i++) {
			var adjacent = adjacents[i];
			var node = graph[adjacent];

			if (node.distance === -1) {
				node.distance = graph[current].distance + 1;
				node.parent = current;
				queue.unshift(adjacent);
			}
		}
	}

	return graph;
}

function link(from, to) {
	return function (args) {
		return to(from(args));
	};
}

function wrapConversion(toModel, graph) {
	var path = [graph[toModel].parent, toModel];
	var fn = conversions[graph[toModel].parent][toModel];

	var cur = graph[toModel].parent;
	while (graph[cur].parent) {
		path.unshift(graph[cur].parent);
		fn = link(conversions[graph[cur].parent][cur], fn);
		cur = graph[cur].parent;
	}

	fn.conversion = path;
	return fn;
}

module.exports = function (fromModel) {
	var graph = deriveBFS(fromModel);
	var conversion = {};

	var models = Object.keys(graph);
	for (var len = models.length, i = 0; i < len; i++) {
		var toModel = models[i];
		var node = graph[toModel];

		if (node.parent === null) {
			// no possible conversion, or this node is the source model.
			continue;
		}

		conversion[toModel] = wrapConversion(toModel, graph);
	}

	return conversion;
};



/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jquery = __webpack_require__(0);

var _jquery2 = _interopRequireDefault(_jquery);

var _ColorItem = __webpack_require__(2);

var _ColorItem2 = _interopRequireDefault(_ColorItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Handles everything related to the colorpicker color
 * @ignore
 */
var ColorHandler = function () {
  /**
   * @param {Colorpicker} colorpicker
   */
  function ColorHandler(colorpicker) {
    _classCallCheck(this, ColorHandler);

    /**
     * @type {Colorpicker}
     */
    this.colorpicker = colorpicker;
  }

  /**
   * @returns {*|String|ColorItem}
   */


  _createClass(ColorHandler, [{
    key: 'bind',
    value: function bind() {
      // if the color option is set
      if (this.colorpicker.options.color) {
        this.color = this.createColor(this.colorpicker.options.color);
        return;
      }

      // if element[color] is empty and the input has a value
      if (!this.color && !!this.colorpicker.inputHandler.getValue()) {
        this.color = this.createColor(this.colorpicker.inputHandler.getValue(), this.colorpicker.options.autoInputFallback);
      }
    }
  }, {
    key: 'unbind',
    value: function unbind() {
      this.colorpicker.element.removeData('color');
    }

    /**
     * Returns the color string from the input value or the 'data-color' attribute of the input or element.
     * If empty, it returns the defaultValue parameter.
     *
     * @returns {String|*}
     */

  }, {
    key: 'getColorString',
    value: function getColorString() {
      if (!this.hasColor()) {
        return '';
      }

      return this.color.string(this.format);
    }

    /**
     * Sets the color value
     *
     * @param {String|ColorItem} val
     */

  }, {
    key: 'setColorString',
    value: function setColorString(val) {
      var color = val ? this.createColor(val) : null;

      this.color = color ? color : null;
    }

    /**
     * Creates a new color using the widget instance options (fallbackColor, format).
     *
     * @fires Colorpicker#colorpickerInvalid
     * @param {*} val
     * @param {boolean} fallbackOnInvalid
     * @returns {ColorItem}
     */

  }, {
    key: 'createColor',
    value: function createColor(val) {
      var fallbackOnInvalid = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      var color = new _ColorItem2.default(this.resolveColorDelegate(val), this.format);

      if (!color.isValid()) {
        if (fallbackOnInvalid) {
          color = this.getFallbackColor();
        }

        /**
         * (Colorpicker) Fired when the color is invalid and the fallback color is going to be used.
         *
         * @event Colorpicker#colorpickerInvalid
         */
        this.colorpicker.trigger('colorpickerInvalid', color, val);
      }

      if (!this.isAlphaEnabled()) {
        // Alpha is disabled
        color.alpha = 1;
      }

      return color;
    }
  }, {
    key: 'getFallbackColor',
    value: function getFallbackColor() {
      if (this.fallback && this.fallback === this.color) {
        return this.color;
      }

      var fallback = this.resolveColorDelegate(this.fallback);
      var color = new _ColorItem2.default(fallback, this.format);

      if (!color.isValid()) {
        throw new Error('The fallback color is invalid.');
      }

      return color;
    }

    /**
     * @returns {ColorItem}
     */

  }, {
    key: 'assureColor',
    value: function assureColor() {
      if (!this.hasColor()) {
        this.color = this.getFallbackColor();
      }

      return this.color;
    }

    /**
     * Delegates the color resolution to the colorpicker extensions.
     *
     * @param {String|*} color
     * @param {boolean} realColor if true, the color should resolve into a real (not named) color code
     * @returns {ColorItem|String|*|null}
     */

  }, {
    key: 'resolveColorDelegate',
    value: function resolveColorDelegate(color) {
      var realColor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      var extResolvedColor = false;

      _jquery2.default.each(this.colorpicker.extensions, function (name, ext) {
        if (extResolvedColor !== false) {
          // skip if resolved
          return;
        }
        extResolvedColor = ext.resolveColor(color, realColor);
      });

      return extResolvedColor ? extResolvedColor : color;
    }

    /**
     * Checks if there is a color object, that it is valid and it is not a fallback
     * @returns {boolean}
     */

  }, {
    key: 'isInvalidColor',
    value: function isInvalidColor() {
      return !this.hasColor() || !this.color.isValid();
    }

    /**
     * Returns true if the useAlpha option is exactly true, false otherwise
     * @returns {boolean}
     */

  }, {
    key: 'isAlphaEnabled',
    value: function isAlphaEnabled() {
      return this.colorpicker.options.useAlpha !== false;
    }

    /**
     * Returns true if the current color object is an instance of Color, false otherwise.
     * @returns {boolean}
     */

  }, {
    key: 'hasColor',
    value: function hasColor() {
      return this.color instanceof _ColorItem2.default;
    }
  }, {
    key: 'fallback',
    get: function get() {
      return this.colorpicker.options.fallbackColor ? this.colorpicker.options.fallbackColor : this.hasColor() ? this.color : null;
    }

    /**
     * @returns {String|null}
     */

  }, {
    key: 'format',
    get: function get() {
      if (this.colorpicker.options.format) {
        return this.colorpicker.options.format;
      }

      if (this.hasColor() && this.color.hasTransparency() && this.color.format.match(/^hex/)) {
        return this.isAlphaEnabled() ? 'rgba' : 'hex';
      }

      if (this.hasColor()) {
        return this.color.format;
      }

      return 'rgb';
    }

    /**
     * Internal color getter
     *
     * @type {ColorItem|null}
     */

  }, {
    key: 'color',
    get: function get() {
      return this.colorpicker.element.data('color');
    }

    /**
     * Internal color setter
     *
     * @ignore
     * @param {ColorItem|null} value
     */
    ,
    set: function set(value) {
      this.colorpicker.element.data('color', value);

      if (value instanceof _ColorItem2.default && this.colorpicker.options.format === 'auto') {
        // If format is 'auto', use the first parsed one from now on
        this.colorpicker.options.format = this.color.format;
      }
    }
  }]);

  return ColorHandler;
}();

exports.default = ColorHandler;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jquery = __webpack_require__(0);

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Handles everything related to the colorpicker UI
 * @ignore
 */
var PickerHandler = function () {
  /**
   * @param {Colorpicker} colorpicker
   */
  function PickerHandler(colorpicker) {
    _classCallCheck(this, PickerHandler);

    /**
     * @type {Colorpicker}
     */
    this.colorpicker = colorpicker;
    /**
     * @type {jQuery}
     */
    this.picker = null;
  }

  _createClass(PickerHandler, [{
    key: 'bind',
    value: function bind() {
      /**
       * @type {jQuery|HTMLElement}
       */
      var picker = this.picker = (0, _jquery2.default)(this.options.template);

      if (this.options.customClass) {
        picker.addClass(this.options.customClass);
      }

      if (this.options.horizontal) {
        picker.addClass('colorpicker-horizontal');
      }

      if (this._supportsAlphaBar()) {
        this.options.useAlpha = true;
        picker.addClass('colorpicker-with-alpha');
      } else {
        this.options.useAlpha = false;
      }
    }
  }, {
    key: 'attach',
    value: function attach() {
      // Inject the colorpicker element into the DOM
      var pickerParent = this.colorpicker.container ? this.colorpicker.container : null;

      if (pickerParent) {
        this.picker.appendTo(pickerParent);
      }
    }
  }, {
    key: 'unbind',
    value: function unbind() {
      this.picker.remove();
    }
  }, {
    key: '_supportsAlphaBar',
    value: function _supportsAlphaBar() {
      return (this.options.useAlpha || this.colorpicker.colorHandler.hasColor() && this.color.hasTransparency()) && this.options.useAlpha !== false && (!this.options.format || this.options.format && !this.options.format.match(/^hex([36])?$/i));
    }

    /**
     * Changes the color adjustment bars using the current color object information.
     */

  }, {
    key: 'update',
    value: function update() {
      if (!this.colorpicker.colorHandler.hasColor()) {
        return;
      }

      var vertical = this.options.horizontal !== true,
          slider = vertical ? this.options.sliders : this.options.slidersHorz;

      var saturationGuide = this.picker.find('.colorpicker-saturation .colorpicker-guide'),
          hueGuide = this.picker.find('.colorpicker-hue .colorpicker-guide'),
          alphaGuide = this.picker.find('.colorpicker-alpha .colorpicker-guide');

      var hsva = this.color.toHsvaRatio();

      // Set guides position
      if (hueGuide.length) {
        hueGuide.css(vertical ? 'top' : 'left', (vertical ? slider.hue.maxTop : slider.hue.maxLeft) * (1 - hsva.h));
      }
      if (alphaGuide.length) {
        alphaGuide.css(vertical ? 'top' : 'left', (vertical ? slider.alpha.maxTop : slider.alpha.maxLeft) * (1 - hsva.a));
      }
      if (saturationGuide.length) {
        saturationGuide.css({
          'top': slider.saturation.maxTop - hsva.v * slider.saturation.maxTop,
          'left': hsva.s * slider.saturation.maxLeft
        });
      }

      // Set saturation hue background
      this.picker.find('.colorpicker-saturation').css('backgroundColor', this.color.getCloneHueOnly().toHexString()); // we only need hue

      // Set alpha color gradient
      var hexColor = this.color.toHexString();
      var alphaBg = '';

      if (this.options.horizontal) {
        alphaBg = 'linear-gradient(to right, ' + hexColor + ' 0%, transparent 100%)';
      } else {
        alphaBg = 'linear-gradient(to bottom, ' + hexColor + ' 0%, transparent 100%)';
      }

      this.picker.find('.colorpicker-alpha-color').css('background', alphaBg);
    }
  }, {
    key: 'options',
    get: function get() {
      return this.colorpicker.options;
    }
  }, {
    key: 'color',
    get: function get() {
      return this.colorpicker.colorHandler.color;
    }
  }]);

  return PickerHandler;
}();

exports.default = PickerHandler;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Handles everything related to the colorpicker addon
 * @ignore
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AddonHandler = function () {
  /**
   * @param {Colorpicker} colorpicker
   */
  function AddonHandler(colorpicker) {
    _classCallCheck(this, AddonHandler);

    /**
     * @type {Colorpicker}
     */
    this.colorpicker = colorpicker;
    /**
     * @type {jQuery}
     */
    this.addon = null;
  }

  _createClass(AddonHandler, [{
    key: 'hasAddon',
    value: function hasAddon() {
      return !!this.addon;
    }
  }, {
    key: 'bind',
    value: function bind() {
      /**
       * @type {*|jQuery}
       */
      this.addon = this.colorpicker.options.addon ? this.colorpicker.element.find(this.colorpicker.options.addon) : null;

      if (this.addon && this.addon.length === 0) {
        // not found
        this.addon = null;
      }
    }
  }, {
    key: 'unbind',
    value: function unbind() {
      if (this.hasAddon()) {
        this.addon.off('.colorpicker');
      }
    }

    /**
     * If the addon element is present, its background color is updated
     */

  }, {
    key: 'update',
    value: function update() {
      if (!this.colorpicker.colorHandler.hasColor() || !this.hasAddon()) {
        return;
      }

      var colorStr = this.colorpicker.colorHandler.getColorString();
      var styles = { 'background': colorStr };

      var icn = this.addon.find('i').eq(0);

      if (icn.length > 0) {
        icn.css(styles);
      } else {
        this.addon.css(styles);
      }
    }
  }]);

  return AddonHandler;
}();

exports.default = AddonHandler;

/***/ })
/******/ ]);
});

;/*!
 * ClockPicker v0.0.7 (http://weareoutman.github.io/clockpicker/)
 * Copyright 2014 Wang Shenwei.
 * Licensed under MIT (https://github.com/weareoutman/clockpicker/blob/gh-pages/LICENSE)
 */
!function(){function t(t){return document.createElementNS(p,t)}function i(t){return(10>t?"0":"")+t}function e(t){var i=++m+"";return t?t+i:i}function s(s,r){function p(t,i){var e=u.offset(),s=/^touch/.test(t.type),o=e.left+b,n=e.top+b,p=(s?t.originalEvent.touches[0]:t).pageX-o,h=(s?t.originalEvent.touches[0]:t).pageY-n,k=Math.sqrt(p*p+h*h),v=!1;if(!i||!(g-y>k||k>g+y)){t.preventDefault();var m=setTimeout(function(){c.addClass("clockpicker-moving")},200);l&&u.append(x.canvas),x.setHand(p,h,!i,!0),a.off(d).on(d,function(t){t.preventDefault();var i=/^touch/.test(t.type),e=(i?t.originalEvent.touches[0]:t).pageX-o,s=(i?t.originalEvent.touches[0]:t).pageY-n;(v||e!==p||s!==h)&&(v=!0,x.setHand(e,s,!1,!0))}),a.off(f).on(f,function(t){a.off(f),t.preventDefault();var e=/^touch/.test(t.type),s=(e?t.originalEvent.changedTouches[0]:t).pageX-o,l=(e?t.originalEvent.changedTouches[0]:t).pageY-n;(i||v)&&s===p&&l===h&&x.setHand(s,l),"hours"===x.currentView?x.toggleView("minutes",A/2):r.autoclose&&(x.minutesView.addClass("clockpicker-dial-out"),setTimeout(function(){x.done()},A/2)),u.prepend(j),clearTimeout(m),c.removeClass("clockpicker-moving"),a.off(d)})}}var h=n(V),u=h.find(".clockpicker-plate"),v=h.find(".clockpicker-hours"),m=h.find(".clockpicker-minutes"),T=h.find(".clockpicker-am-pm-block"),C="INPUT"===s.prop("tagName"),H=C?s:s.find("input"),P=s.find(".input-group-addon"),x=this;if(this.id=e("cp"),this.element=s,this.options=r,this.isAppended=!1,this.isShown=!1,this.currentView="hours",this.isInput=C,this.input=H,this.addon=P,this.popover=h,this.plate=u,this.hoursView=v,this.minutesView=m,this.amPmBlock=T,this.spanHours=h.find(".clockpicker-span-hours"),this.spanMinutes=h.find(".clockpicker-span-minutes"),this.spanAmPm=h.find(".clockpicker-span-am-pm"),this.amOrPm="PM",r.twelvehour){{var S=['<div class="clockpicker-am-pm-block">','<button type="button" class="btn btn-sm btn-default clockpicker-button clockpicker-am-button">',"AM</button>",'<button type="button" class="btn btn-sm btn-default clockpicker-button clockpicker-pm-button">',"PM</button>","</div>"].join("");n(S)}n('<button type="button" class="btn btn-sm btn-default clockpicker-button am-button">AM</button>').on("click",function(){x.amOrPm="AM",n(".clockpicker-span-am-pm").empty().append("AM")}).appendTo(this.amPmBlock),n('<button type="button" class="btn btn-sm btn-default clockpicker-button pm-button">PM</button>').on("click",function(){x.amOrPm="PM",n(".clockpicker-span-am-pm").empty().append("PM")}).appendTo(this.amPmBlock)}r.autoclose||n('<button type="button" class="btn btn-sm btn-default btn-block clockpicker-button">'+r.donetext+"</button>").click(n.proxy(this.done,this)).appendTo(h),"top"!==r.placement&&"bottom"!==r.placement||"top"!==r.align&&"bottom"!==r.align||(r.align="left"),"left"!==r.placement&&"right"!==r.placement||"left"!==r.align&&"right"!==r.align||(r.align="top"),h.addClass(r.placement),h.addClass("clockpicker-align-"+r.align),this.spanHours.click(n.proxy(this.toggleView,this,"hours")),this.spanMinutes.click(n.proxy(this.toggleView,this,"minutes")),H.on("focus.clockpicker click.clockpicker",n.proxy(this.show,this)),P.on("click.clockpicker",n.proxy(this.toggle,this));var E,D,I,B,z=n('<div class="clockpicker-tick"></div>');if(r.twelvehour)for(E=1;13>E;E+=1)D=z.clone(),I=E/6*Math.PI,B=g,D.css("font-size","120%"),D.css({left:b+Math.sin(I)*B-y,top:b-Math.cos(I)*B-y}),D.html(0===E?"00":E),v.append(D),D.on(k,p);else for(E=0;24>E;E+=1){D=z.clone(),I=E/6*Math.PI;var O=E>0&&13>E;B=O?w:g,D.css({left:b+Math.sin(I)*B-y,top:b-Math.cos(I)*B-y}),O&&D.css("font-size","120%"),D.html(0===E?"00":E),v.append(D),D.on(k,p)}for(E=0;60>E;E+=5)D=z.clone(),I=E/30*Math.PI,D.css({left:b+Math.sin(I)*g-y,top:b-Math.cos(I)*g-y}),D.css("font-size","120%"),D.html(i(E)),m.append(D),D.on(k,p);if(u.on(k,function(t){0===n(t.target).closest(".clockpicker-tick").length&&p(t,!0)}),l){var j=h.find(".clockpicker-canvas"),L=t("svg");L.setAttribute("class","clockpicker-svg"),L.setAttribute("width",M),L.setAttribute("height",M);var U=t("g");U.setAttribute("transform","translate("+b+","+b+")");var W=t("circle");W.setAttribute("class","clockpicker-canvas-bearing"),W.setAttribute("cx",0),W.setAttribute("cy",0),W.setAttribute("r",2);var N=t("line");N.setAttribute("x1",0),N.setAttribute("y1",0);var X=t("circle");X.setAttribute("class","clockpicker-canvas-bg"),X.setAttribute("r",y);var Y=t("circle");Y.setAttribute("class","clockpicker-canvas-fg"),Y.setAttribute("r",3.5),U.appendChild(N),U.appendChild(X),U.appendChild(Y),U.appendChild(W),L.appendChild(U),j.append(L),this.hand=N,this.bg=X,this.fg=Y,this.bearing=W,this.g=U,this.canvas=j}o(this.options.init)}function o(t){t&&"function"==typeof t&&t()}var c,n=window.jQuery,r=n(window),a=n(document),p="http://www.w3.org/2000/svg",l="SVGAngle"in window&&function(){var t,i=document.createElement("div");return i.innerHTML="<svg/>",t=(i.firstChild&&i.firstChild.namespaceURI)==p,i.innerHTML="",t}(),h=function(){var t=document.createElement("div").style;return"transition"in t||"WebkitTransition"in t||"MozTransition"in t||"msTransition"in t||"OTransition"in t}(),u="ontouchstart"in window,k="mousedown"+(u?" touchstart":""),d="mousemove.clockpicker"+(u?" touchmove.clockpicker":""),f="mouseup.clockpicker"+(u?" touchend.clockpicker":""),v=navigator.vibrate?"vibrate":navigator.webkitVibrate?"webkitVibrate":null,m=0,b=100,g=80,w=54,y=13,M=2*b,A=h?350:1,V=['<div class="popover clockpicker-popover">','<div class="arrow"></div>','<div class="popover-title">','<span class="clockpicker-span-hours text-primary"></span>'," : ",'<span class="clockpicker-span-minutes"></span>','<span class="clockpicker-span-am-pm"></span>',"</div>",'<div class="popover-content">','<div class="clockpicker-plate">','<div class="clockpicker-canvas"></div>','<div class="clockpicker-dial clockpicker-hours"></div>','<div class="clockpicker-dial clockpicker-minutes clockpicker-dial-out"></div>',"</div>",'<span class="clockpicker-am-pm-block">',"</span>","</div>","</div>"].join("");s.DEFAULTS={"default":"",fromnow:0,placement:"bottom",align:"left",donetext:"完成",autoclose:!1,twelvehour:!1,vibrate:!0},s.prototype.toggle=function(){this[this.isShown?"hide":"show"]()},s.prototype.locate=function(){var t=this.element,i=this.popover,e=t.offset(),s=t.outerWidth(),o=t.outerHeight(),c=this.options.placement,n=this.options.align,r={};switch(i.show(),c){case"bottom":r.top=e.top+o;break;case"right":r.left=e.left+s;break;case"top":r.top=e.top-i.outerHeight();break;case"left":r.left=e.left-i.outerWidth()}switch(n){case"left":r.left=e.left;break;case"right":r.left=e.left+s-i.outerWidth();break;case"top":r.top=e.top;break;case"bottom":r.top=e.top+o-i.outerHeight()}i.css(r)},s.prototype.show=function(){if(!this.isShown){o(this.options.beforeShow);var t=this;this.isAppended||(c=n(document.body).append(this.popover),r.on("resize.clockpicker"+this.id,function(){t.isShown&&t.locate()}),this.isAppended=!0);var e=((this.input.prop("value")||this.options["default"]||"")+"").split(":");if("now"===e[0]){var s=new Date(+new Date+this.options.fromnow);e=[s.getHours(),s.getMinutes()]}this.hours=+e[0]||0,this.minutes=+e[1]||0,this.spanHours.html(i(this.hours)),this.spanMinutes.html(i(this.minutes)),this.toggleView("hours"),this.locate(),this.isShown=!0,a.on("click.clockpicker."+this.id+" focusin.clockpicker."+this.id,function(i){var e=n(i.target);0===e.closest(t.popover).length&&0===e.closest(t.addon).length&&0===e.closest(t.input).length&&t.hide()}),a.on("keyup.clockpicker."+this.id,function(i){27===i.keyCode&&t.hide()}),o(this.options.afterShow)}},s.prototype.hide=function(){o(this.options.beforeHide),this.isShown=!1,a.off("click.clockpicker."+this.id+" focusin.clockpicker."+this.id),a.off("keyup.clockpicker."+this.id),this.popover.hide(),o(this.options.afterHide)},s.prototype.toggleView=function(t,i){var e=!1;"minutes"===t&&"visible"===n(this.hoursView).css("visibility")&&(o(this.options.beforeHourSelect),e=!0);var s="hours"===t,c=s?this.hoursView:this.minutesView,r=s?this.minutesView:this.hoursView;this.currentView=t,this.spanHours.toggleClass("text-primary",s),this.spanMinutes.toggleClass("text-primary",!s),r.addClass("clockpicker-dial-out"),c.css("visibility","visible").removeClass("clockpicker-dial-out"),this.resetClock(i),clearTimeout(this.toggleViewTimer),this.toggleViewTimer=setTimeout(function(){r.css("visibility","hidden")},A),e&&o(this.options.afterHourSelect)},s.prototype.resetClock=function(t){var i=this.currentView,e=this[i],s="hours"===i,o=Math.PI/(s?6:30),c=e*o,n=s&&e>0&&13>e?w:g,r=Math.sin(c)*n,a=-Math.cos(c)*n,p=this;l&&t?(p.canvas.addClass("clockpicker-canvas-out"),setTimeout(function(){p.canvas.removeClass("clockpicker-canvas-out"),p.setHand(r,a)},t)):this.setHand(r,a)},s.prototype.setHand=function(t,e,s,o){var c,r=Math.atan2(t,-e),a="hours"===this.currentView,p=Math.PI/(a||s?6:30),h=Math.sqrt(t*t+e*e),u=this.options,k=a&&(g+w)/2>h,d=k?w:g;if(u.twelvehour&&(d=g),0>r&&(r=2*Math.PI+r),c=Math.round(r/p),r=c*p,u.twelvehour?a?0===c&&(c=12):(s&&(c*=5),60===c&&(c=0)):a?(12===c&&(c=0),c=k?0===c?12:c:0===c?0:c+12):(s&&(c*=5),60===c&&(c=0)),this[this.currentView]!==c&&v&&this.options.vibrate&&(this.vibrateTimer||(navigator[v](10),this.vibrateTimer=setTimeout(n.proxy(function(){this.vibrateTimer=null},this),100))),this[this.currentView]=c,this[a?"spanHours":"spanMinutes"].html(i(c)),!l)return void this[a?"hoursView":"minutesView"].find(".clockpicker-tick").each(function(){var t=n(this);t.toggleClass("active",c===+t.html())});o||!a&&c%5?(this.g.insertBefore(this.hand,this.bearing),this.g.insertBefore(this.bg,this.fg),this.bg.setAttribute("class","clockpicker-canvas-bg clockpicker-canvas-bg-trans")):(this.g.insertBefore(this.hand,this.bg),this.g.insertBefore(this.fg,this.bg),this.bg.setAttribute("class","clockpicker-canvas-bg"));var f=Math.sin(r)*d,m=-Math.cos(r)*d;this.hand.setAttribute("x2",f),this.hand.setAttribute("y2",m),this.bg.setAttribute("cx",f),this.bg.setAttribute("cy",m),this.fg.setAttribute("cx",f),this.fg.setAttribute("cy",m)},s.prototype.done=function(){o(this.options.beforeDone),this.hide();var t=this.input.prop("value"),e=i(this.hours)+":"+i(this.minutes);this.options.twelvehour&&(e+=this.amOrPm),this.input.prop("value",e),e!==t&&(this.input.triggerHandler("change"),this.isInput||this.element.trigger("change")),this.options.autoclose&&this.input.trigger("blur"),o(this.options.afterDone)},s.prototype.remove=function(){this.element.removeData("clockpicker"),this.input.off("focus.clockpicker click.clockpicker"),this.addon.off("click.clockpicker"),this.isShown&&this.hide(),this.isAppended&&(r.off("resize.clockpicker"+this.id),this.popover.remove())},n.fn.clockpicker=function(t){var i=Array.prototype.slice.call(arguments,1);return this.each(function(){var e=n(this),o=e.data("clockpicker");if(o)"function"==typeof o[t]&&o[t].apply(o,i);else{var c=n.extend({},s.DEFAULTS,e.data(),"object"==typeof t&&t);e.data("clockpicker",new s(e,c))}})}}();;/*

 highlight v5

 Highlights arbitrary terms.

 <http://johannburkard.de/blog/programming/javascript/highlight-javascript-text-higlighting-jquery-plugin.html>

 MIT license.

 Johann Burkard
 <http://johannburkard.de>
 <mailto:jb@eaio.com>

 */

jQuery.fn.highlight = function(pat) {
	function innerHighlight(node, pat) {
		var skip = 0;
		if (node.nodeType == 3) {
			var pos = node.data.toUpperCase().indexOf(pat);
			pos -= (node.data.substr(0, pos).toUpperCase().length - node.data.substr(0, pos).length);
			if (pos >= 0) {
				var spannode = document.createElement('span');
				spannode.className = 'highlight';
				var middlebit = node.splitText(pos);
				var endbit = middlebit.splitText(pat.length);
				var middleclone = middlebit.cloneNode(true);
				spannode.appendChild(middleclone);
				middlebit.parentNode.replaceChild(spannode, middlebit);
				skip = 1;
			}
		}
		else if (node.nodeType == 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
			for (var i = 0; i < node.childNodes.length; ++i) {
				i += innerHighlight(node.childNodes[i], pat);
			}
		}
		return skip;
	}
	return this.length && pat && pat.length ? this.each(function() {
		innerHighlight(this, pat.toUpperCase());
	}) : this;
};

jQuery.fn.removeHighlight = function() {
	return this.find("span.highlight").each(function() {
		this.parentNode.firstChild.nodeName;
		with (this.parentNode) {
			replaceChild(this.firstChild, this);
			normalize();
		}
	}).end();
};;;
toastr.options = {
	"closeButton": true,
	"debug": false,
	"newestOnTop": false,
	"progressBar": false,
	"positionClass": "toast-top-center",
	"preventDuplicates": true,
	"onclick": null,
	"showDuration": "300",
	"hideDuration": "1000",
	"timeOut": "3000",
	"extendedTimeOut": "1000",
	"showEasing": "swing",
	"hideEasing": "linear",
	"showMethod": "show",
	"hideMethod": "hide"
};
toastr.options['positionClass'] = 'toast-bottom-right';


$.fn.modal.Constructor.prototype.enforceFocus = function () {
};


$(document).ready(function () {


});


function resize() {
	var wh = $(window).height();
	var ww = $(window).width();
	var mh = wh - $("#navbar-header").outerHeight() - 6;
	$("#menu-bar").css({"max-height": mh});
	scroll();

	$(".panel-fixed").each(function () {
		var $this = $(this);
		var h = $this.find("> .panel-heading").outerHeight();
		var f = $this.find("> .panel-footer").outerHeight();
		var $body = $this.find("> .panel-body");
		$body.css({top: h, bottom: f});


		//	console.log(h)
	});
}
function scroll() {
	var ww = $(window).width();
	var $toolbar = $("#toolbar");

	if ($toolbar.length) {


		var toolbartop = $toolbar.offset().top;
		var navbarheight = $(".navbar-fixed-top").outerHeight();
		var toolbarheight = $toolbar.outerHeight();
		var scrollTop = $(window).scrollTop();

		$nextElement = $toolbar.next();

		var contentOffset = $nextElement.offset().top;

		var toolboxtopscroll = (contentOffset - toolbarheight) - 15

		//	console.log("toolbartop: "+toolbartop+" | navbarheight: "+navbarheight+" | scroll:"+scrollTop + " | toolbar fixed: "+$toolbar.hasClass("fixed")+" | v:"+toolboxtopscroll);

		if ((scrollTop > (toolboxtopscroll - navbarheight)) && ww > 768) {
			$toolbar.addClass("fixed").css({"top": navbarheight - 1});
			$nextElement.css({"margin-top": $toolbar.outerHeight() + 31});
		} else {
			$toolbar.removeClass("fixed");
			$nextElement.css({"margin-top": 0});
		}

	}

}

$(document).ready(function () {
	resize();
	$(window).resize(function () {
		$.doTimeout(250, function () {
			resize();

		});
	});

	$(window).scroll(function (event) {
		scroll();
		// Do something
	});

	$(".select2").select2();
})
$(document).on("change", ".has-error input", function () {
	var $field = $(this);
	$field.closest(".has-error").removeClass("has-error").find(".form-validation").remove();
	submitBtnCounter($field.closest("form"));
})


function validationErrors(data, $form) {

	if (!$.isEmptyObject(data['errors']) && data['errors'].length >0 ) {

		var i = 0;
		//console.log(data.errors);
		$(".form-validation", $form).remove();
		$.each(data.errors, function (k, v) {
			i = i + 1;
			var $field = $("#" + k);
			//console.info(k)
			var $block = $field.closest(".form-group");

			$block.addClass("has-error");
			if ($field.parent().hasClass("input-group")) $field = $field.parent();


			if (v != "") {

				$field.after('<span class="help-block s form-validation">' + v + '</span>');
			}
			if ($block.hasClass("has-feedback")) {
				$field.after('<span class="fa fa-times form-control-feedback form-validation" aria-hidden="true"></span>')
			}
		});


		$("button[type='submit']", $form).addClass("btn-danger").html("(" + i + ") Error(s) Found");

		if (i > 1) {
			toastr["error"]("There were " + i + " errors saving the form", "Error");
		} else {
			toastr["error"]("There was an error saving the form", "Error");
		}


	} else {
		toastr["success"]("Record Saved", "Success");

	}

	//submitBtnCounter($form);


}

function submitBtnCounter($form) {
	var c = $(".has-error", $form).length;
	var $btn = $("button[type='submit']", $form);
	if (c) {
		$btn.addClass("btn-danger").html("(" + c + ") Error(s) Found");
	} else {

		var tx = $btn.attr("data-text") || "Save";

		$btn.html(tx).removeClass("btn-danger");
	}
}


var datetimepickerOptions = {
	inline: true,
	sideBySide: true,
	format: "YYYY-MM-DD HH:mm:00",
	icons: {
		time: "fa fa-clock-o",
		date: "fa fa-calendar",
		up: "fa fa-arrow-up",
		down: "fa fa-arrow-down",

		previous: 'fa fa-chevron-left',
		next: 'fa fa-chevron-right',
		today: 'fa fa-screenshot',
		clear: 'fa fa-trash',
		close: 'fa fa-remove'
	}
};
$(document).ready(function () {

	$("body").addClass("load-font");

	$(document).on("click", ".form-appointment-btn", function (e) {

		e.preventDefault();
		e.stopPropagation();
		var $this = $(this);

		var ID = $this.attr("data-id");

		$.bbq.pushState({"appID": ID, "form": true});


		getAppointmentForm();

	});
	$(document).on("click", ".form-timeslot-btn", function (e) {

		e.preventDefault();
		e.stopPropagation();
		var $this = $(this);

		var ID = $this.attr("data-id");

		$.bbq.pushState({"timeslotID": ID, "form": true});


		getTimeslotForm();

	});












	$(document).on("click", ".appointment-row", function (e) {
		e.preventDefault();
		var $this = $(this);
		var ID = $this.attr("data-id");
		if (ID) {
			$.bbq.pushState({"appID": ID});
			getAppointmentView()
		}


	});
	$(document).on("click", ".timeslot-row", function (e) {
		e.preventDefault();
		var $this = $(this);
		var ID = $this.attr("data-id");
		if (ID) {
			$.bbq.pushState({"timeslotID": ID});
			getTimeslotForm()
		}


	});


	$(document).on("click", "#form-appointment .appointment-row", function (e) {
		e.preventDefault();
		$.bbq.removeState("form")
	});


});
$(document).ready(function () {

	setTimeout(function () {
		$.getData("/admin/data/general/sms_credit?hiddenajax=true", {}, function (data) {

			//console.log(data.credits);
			if (data.credits) {
				$(".sms-credit-block").each(function () {
					$(this).html('SMS credits: <strong>' + data.credits + '</strong>')
				});
			}


		}, "sms-credit");
	}, 300)


	$(document).on("click", ".form-modal-forms-btn", function (e) {
		e.preventDefault();
		var $this = $(this);
		var form = $this.attr("data-form");


		if (form == "walkin-form") {


			setClient("walkin");
			show_form("appointment-form");

		} else {
			show_form(form);
		}


	});
	$(document).on("click", ".toggle-checkboxes", function (e) {
		var $table = $("#" + $(this).attr("data-target"));
		$table.find("input[type='checkbox']").each(function () {
			var $checkbox = $(this);
			$checkbox.attr('checked', !$checkbox.attr('checked'));
		});

		record_table_active($table);
	});

	$(document).on("click", ".table-checkbox tbody tr.record", function (e) {

		if (e.target.type == "checkbox") {
			e.stopPropagation();
		} else {
			var $checkbox = $(this).find(':checkbox');
			$checkbox.attr('checked', !$checkbox.attr('checked')).trigger("change");
		}
	});

	$(document).on("change", ".table-checkbox tbody tr.record input[type='checkbox']", function (e) {
		var $table = $(this).closest(".table-checkbox");
		record_table_active($table);
	});


	$(document).on("click", ".form-modal-forms-btn-client", function (e) {
		e.preventDefault();
		var $this = $(this);


	});


	$(document).on("click", ".clear-client-search", function (e) {
		e.preventDefault();
		var $this = $(this);

		$("#client-search").val("");

		$("#client-select-area").html("");

	});


	$(document).on("submit", "#client-form #form-client-capture", function (e) {
		e.preventDefault();

		var $this = $(this);

		$.post("/admin/save/form/client", $this.serialize(), function (result) {
			result = result.data;
			validationErrors(result, $this);
			if ($.isEmptyObject(result['errors']) || result['errors'].length == 0 ) {

				setClient(result.ID);
				show_form("appointment-form");
			}
		})


	})

	$(document).on("submit", "#form-appointment-capture", function (e) {
		e.preventDefault();

		var $this = $(this);
		var ID = $.bbq.getState("appID");

		$.post("/admin/save/form/appointment?ID=" + ID, $this.serialize(), function (result) {
			result = result.data;
			validationErrors(result, $this);
			if ($.isEmptyObject(result['errors']) || result['errors'].length == 0 ) {
				$.bbq.pushState({"appID": result.ID});
				getAppointmentView();
			}
		})
	});


	$(document).on("click", "#form-appointment #btn-delete-record", function (e) {
		e.preventDefault();
		var ID = $.bbq.getState("appID");
		if (confirm("Are you sure you want to delete this record?")) {
			$.post("/admin/save/form/delete_appointment?ID=" + ID, {}, function (result) {
				result = result.data;

				if ($.isEmptyObject(result['errors']) || result['errors'].length == 0 ) {
					toastr["success"]("Record Deleted", "Success");
					//getData();
					$.bbq.removeState("appID");
					$.bbq.removeState("form");
					$("#modal-window").modal("hide");
				} else {
					toastr["error"]("There was an error deleting this record", "Error");
				}
			})
		}


	});
	$(document).on("submit", "#form-timeslot-capture", function (e) {
		e.preventDefault();

		var $this = $(this);
		var ID = $.bbq.getState("timeslotID");

		$.post("/admin/save/form/timeslot?ID=" + ID, $this.serialize(), function (result) {
			result = result.data;
			validationErrors(result, $this);
			if ($.isEmptyObject(result['errors']) || result['errors'].length == 0 ) {
				$.bbq.pushState({"timeslotID": ""});
				$("#modal-window").modal("hide");
			}
		})
	});
	$(document).on("click", "#form-timeslot #btn-delete-record", function (e) {
		e.preventDefault();
		var ID = $.bbq.getState("timeslotID");
		if (confirm("Are you sure you want to delete this record?")) {
			$.post("/admin/save/form/delete_timeslot?ID=" + ID, {}, function (result) {
				result = result.data;

				if ($.isEmptyObject(result['errors']) || result['errors'].length == 0 ) {
					toastr["success"]("Record Deleted", "Success");
					//getData();
					$.bbq.removeState("timeslotID");
					$.bbq.removeState("form");
					$("#modal-window").modal("hide");
				} else {
					toastr["error"]("There was an error deleting this record", "Error");
				}
			})
		}


	});

	$(document).on("keyup", "#client-search", function (e) {
		e.preventDefault();
		var $this = $(this)
		$this.doTimeout('client-search', 500, function () {

			var search = $(this).val();

			$.getData("/admin/data/form/clients", {"search": search, "hiddenajax": true}, function (data) {
				$("#client-select-area").jqotesub($("#template-client-list"), data);

				if (data.list.length == 1) {
					setClient(data.list[0].ID);
					setTimeout(function () {
						$("#appointment-form textarea:first").focus()
					}, 500);
				}
				if (data.list.length == 0 && search) {
					$("#client-select-area").html("<thead><tr><td class='text-center'>No records found matching: " + search + "</td></tr></thead>")
				}

			}, "client-data-search")


		});
	})

	$(document).on("click", "#client-select-area .client-record", function (e) {
		e.preventDefault();
		var $this = $(this);
		var ID = $this.attr("data-id");

		setClient(ID);
		show_form("appointment-form");

	})
	$(document).on("click", ".client-edit-btn", function (e) {
		e.preventDefault();
		var $this = $(this);
		var ID = $this.attr("data-id");

		$.getData("/admin/data/form/clients", {"ID": ID}, function (data) {
			$("#client-form").jqotesub($("#template-form-client"), data);
			show_form("client-form");
		}, "client-data")
	})
	$(document).on("click", "#client-form button[type='reset']", function (e) {
		e.preventDefault();
		if ($("#clientID").val()) {
			show_form("appointment-form");
		} else {
			show_form("");
		}
		//	console.log($("#clientID").val())


	})
	$(document).on("click", "#form-timeslot-capture button[type='reset']", function (e) {
		e.preventDefault();
		$.bbq.pushState("timeslotID", "");

		$("#modal-window").modal("hide")


	})

	$(document).on("click", "#details-appointment .btn[data-dismiss='modal']", function (e) {
		e.preventDefault();
		$.bbq.pushState("appID", "");
	});

	$(document).on("click", "#form-timeslot .btn[data-dismiss='modal']", function (e) {
		e.preventDefault();
		$.bbq.pushState("timeslotID", "");
	});


	$(document).on("change", "#form-timeslot-capture input[name='repeat_mode']", function (e) {
		getTimeslotFormRepeats();


	});


	$(document).on("offcanvas.open", ".offcanvas-left", function () {
		var w = $(window).width();
		$(this).addClass("in");
		offcanvas();

	});
	$(document).on("offcanvas.close", ".offcanvas-left", function () {
		var w = $(window).width();
		$(this).removeClass("in");
		offcanvas();
	});
	$(document).on("offcanvas.open", ".offcanvas-right", function () {
		var w = $(window).width();
		$(this).addClass("in");
		offcanvas();
	});
	$(document).on("offcanvas.close", ".offcanvas-right", function () {
		var w = $(window).width();
		$(this).removeClass("in");
		offcanvas();
	});


	$(document).on("click", ".offcanvas-strip-close", function () {
		$(this).closest(".offcanvas").trigger("offcanvas.close");
	});


	$(document).on("change", "#appointmentDate_time .timeslots input[type='radio']", function () {
		var $this = $(this);
		var $panel = $this.closest(".panel");
		var $timepicker = $(".timepicker", $panel);
		var v = $this.val()

		$timepicker.val(v).timepicker({"defaultTime":v});
		$timepicker.trigger("change")

		//postServiceTimes();

		console.log($panel.attr("data-key"))

	})

	$(document).on("change", "#appointmentDate_time .staff-area input[type='radio']", function () {
		postServiceTimes();
	})

	$(document).on("change", "#appointmentDate_time select", function () {
		postServiceTimes();
	})
	$(document).on("change", "#appointmentDate_time .timepicker", function () {
		postServiceTimes();
	})


	$(document).on("mouseenter", ".timeslot", function () {
		var $this = $(this);
		var $panel = $this.closest(".panel");

		$panel.addClass("showing")

		var staff = $(this).attr("data-staff");
		//console.log(staff)
		$(".staff .item.showing", $panel).removeClass("showing");
		if (staff) {
			staff = staff.split(",");

			for (var i in staff) {

				$(".staff .item[data-id=" + staff[i] + "]", $panel.find(".panel-footer")).addClass("showing");
			}

		}
	});

	$(document).on("mouseleave", ".timeslot", function () {
		var $this = $(this);
		var $panel = $this.closest(".panel");
		$panel.removeClass("showing")

		showStaff();
	});




	$(document).on("click", ".btn-new-service", function () {
		add_new_service_action();
	});



});
function add_new_service_action(){

	var data = {
		ID:"",
		staffID:"",
		appointmentStart:"",
		key:"new-n-"+$("#services-area > .panel").length,
		slots:{
			errors:{},
			warnings:{},
			times:{},
			clashing:{}
		},
		times: {
			day:$("#appointmentDate").val(),
			time:""
		}
	};
	$("#services-area").jqoteapp($("#template-appointment-form-services"), data);

	setupServicesTimes();

}
function record_table_active($table) {
	var c = 0;
	$("tbody tr.record", $table).each(function () {
		var $this = $(this);
		if ($this.find(':checkbox').is(":checked")) {
			$this.addClass("active");
			c = c + 1;
		} else {
			$this.removeClass("active");
		}
	});
}
function show_form(form) {
	$("#modal-window .forms").stop(true, true).hide(400);
	if (form) {
		$("#modal-window #" + form).stop(true, true).show(400);
	}
	if (form == "client-form") {
		$('#client-form textarea#notes').summernote({
			minHeight: 200,
			toolbar: [
				['headline', ['style']],
				['style', ['bold', 'italic', 'underline', 'superscript', 'subscript', 'strikethrough', 'clear']],
				['textsize', ['fontsize']],
				['alignment', ['ul', 'ol', 'paragraph', 'lineheight']]
			]
		});
	}


}
function setClient(ID) {
	if (typeof ID == "object") {
		$("#client-area-form").jqotesub($("#template-client-form-display"), ID);
		$("#clientID").val(ID.ID).attr("data-old-clientID", $("#clientID").val());
	} else {
		$.getData("/admin/data/form/clients", {"ID": ID}, function (data) {


			$("#client-area-form").jqotesub($("#template-client-form-display"), data);
			$("#clientID").val(data.details.ID).attr("data-old-clientID", $("#clientID").val());
			show_form("appointment-form");


		}, "client-data")
	}


}


if ($.bbq.getState("appID")) {
	if ($.bbq.getState("form")) {
		getAppointmentForm()
	} else {
		getAppointmentView()
	}
}

if ($.bbq.getState("timeslotID")) {

	getTimeslotForm();

}

function getAppointmentView() {

	var ID = $.bbq.getState("appID");


	$.getData("/admin/data/home/appointment", {"ID": ID}, function (data) {

		$("#modal-window").jqotesub($("#template-modal-appointment"), data).modal("show");

		//$("#content-area").jqotesub($("#template-view-" + section), data);
		//	console.log(data);
		appointmentArrowButtons();
		$('*[data-toggle="tooltip"]').tooltip();
	}, "data-appointment")


}

function appointmentArrowButtons() {

	var $btn_prev = $("#details-appointment .record-direction-btns .btn-prev").attr("disabled", "disabled");
	var $btn_next = $("#details-appointment .record-direction-btns .btn-next").attr("disabled", "disabled");


	var $agenda = $("#details-appointment .agenda-view");


	var id = $(".agenda-item.current", $agenda).find(".appointment-row").attr("data-id");
	var $current = $(".agenda-item.current", $agenda);

	var prev = $current.prevAll(".agenda-item:not([data-appid='" + id + "'])").attr("data-appid");
	var next = $current.nextAll(".agenda-item:not([data-appid='" + id + "'])").attr("data-appid");


	console.log(prev);
	if (prev) {
		$btn_prev.removeAttr("disabled").attr("data-id", prev);
	}
	if (next) {
		$btn_next.removeAttr("disabled").attr("data-id", next);
	}


}


function getAppointmentForm() {
	var ID = $.bbq.getState("appID");

	$.getData("/admin/data/form/appointment", {"ID": ID}, function (data) {
		$("#modal-window").jqotesub($("#template-modal-form-appointment"), data).modal("show").on("hide.bs.modal", function () {
			$.bbq.removeState("form")
		});

		if (data.details.ID == "") {
			setTimeout(function () {
				$("#client-search").focus()
			}, 500);
		}


		if (!$("#appointmentDate").val() || $("#appointmentDate").val() == "undefined") {
			$("#appointmentDate").val(moment().format('YYYY-MM-DD'));
		}


		datetimepickerOptions.format = "YYY-MM-DD";
		datetimepickerOptions.defaultDate = moment($("#appointmentDate").val(), 'YYYY-MM-DD');


		$('#appointmentDate-inline').datetimepicker(datetimepickerOptions);
		$("#appointmentDate-inline").on("dp.change", function (e) {
			$("#appointmentDate").val(moment(e.date).format('YYYY-MM-DD')).trigger("change");
			postServiceTimes()
		});

		$("#services-area").attr("data-timeslots",data.time_interval);

		setTimeout(function(){
			setupServicesTimes(data)
		},400)




		//getServiceTimes()

		//getAppointmentFormServices();

		$('textarea#notes').summernote({
			minHeight: 200,
			toolbar: [
				['headline', ['style']],
				['style', ['bold', 'italic', 'underline', 'superscript', 'subscript', 'strikethrough', 'clear']],
				['textsize', ['fontsize']],
				['alignment', ['ul', 'ol', 'paragraph', 'lineheight']]
			]
		});

		if (data.details.ID==""){
			add_new_service_action();
		}


	}, "form-data")

};
function setupServicesTimes(data) {
	$("#services-area > .panel").each(function () {
		var $panel = $(this);
		var $timepicker = $('.timepicker', $panel);
		$timepicker.timepicker({
			zindex: 10000000,
			timeFormat: 'HH:mm',

			interval:$("#services-area").attr("data-timeslots"),
			dynamic: false,
			dropdown: true,
			scrollbar: true,
			change:function(){
				//postServiceTimes();
			}
		});
		if ($timepicker.val()){
			$timepicker.timepicker({"defaultTime":$timepicker.val()});
		}


	})
	$("#services-area select").select2({
		templateResult: formatServiceSelect2,
		templateSelection: formatServiceSelect2
	});
	showStaff();
}
function postServiceTimes() {
	var ID = $.bbq.getState("appID");
	var data = $("#form-appointment-capture").serialize();


	$.post("/admin/data/form/appointment_services?ID="+ID, data, function (data) {
		data = data.data;
		$("#services-area").jqotesub($("#template-appointment-form-services"), data.services);


		setupServicesTimes(data)

	})

}
function formatServiceSelect2(item) {
	if (!item.id) {
		return item.text;
	}
	var $item = $(
		'<span class="pull-right" style="color:#ccc"> (' + $(item.element).attr("data-category") + ') ' + $(item.element).attr("data-duration-view") + '</span>' + '<span>' + item.text + '</span>'
	);
	return $item;
};
function showStaff() {
	$("#appointmentDate_time .panel").each(function () {
		var $panel = $(this);
		var $footer = $panel.find(".panel-footer");
		var duration = $panel.attr("data-duration");

		var $timeslots = $panel.find(".timeslots");

		$(".staff .item.showing", $footer).removeClass("showing");

		var staff = $(".selected:first", $timeslots).attr("data-staff")
		//console.log(staff)
		if (staff) {
			staff = staff.split(",");


			for (var i in staff) {
				$(".staff .item[data-id=" + staff[i] + "]", $footer).addClass("showing");
			}

		}

	})

}
function ObjectLength(object) {
	var length = 0;
	for (var key in object) {
		if (object.hasOwnProperty(key)) {
			++length;
		}
	}
	return length;
};


function update_services_duration() {
	var dur = 0;

	$("#services-area .services-select").each(function () {
		var $this = $(this);
		var d = $("option:selected", this).attr("data-duration");
		if (d) {
			dur = dur + (d * 1);
		}
	})

	$("#services-area-duration").html(minutes_to_time(dur, true)).attr("data-duration", dur);

	var start = $("#appointmentStart").val();

	if (start) {


		start = moment(start, "YYYY-MM-DD HH:mm:ss");
		end = moment(start).add(dur, 'minutes');
		//	$("#appointmentEnd").html(end.format("ddd, D MMM YYYY  HH:mm"));

		if (moment(start).isSame(end, 'day')) {
			$("#appointmentEnd").html(end.format("HH:mm"));
		} else {
			$("#appointmentEnd").html(end.format("YYYY-MM-DD HH:mm"));
		}

		$("#appointmentEnd").closest(".row").show();

	} else {
		$("#appointmentEnd").closest(".row").hide()
	}


}


function getTimeslotForm() {
	var ID = $.bbq.getState("timeslotID");

	$.getData("/admin/data/form/timeslot", {"ID": ID}, function (data) {
		$("#modal-window").jqotesub($("#template-modal-form-timeslots"), data).modal("show").on("hide.bs.modal", function () {
			$.bbq.removeState("form")
		});

		var dpOptions = datetimepickerOptions;
		dpOptions.format = "HH:mm";
		dpOptions.defaultDate = false;
		if ($("#start").val()) {
			dpOptions.defaultDate = moment($("#start").val(), 'HH:mm:00');
		}


		dpOptions.useCurrent = false;
		$('#start-inline').datetimepicker(dpOptions);
		$("#start-inline").on("dp.change", function (e) {
			$("#start").val(moment(e.date).format('HH:mm:00')).trigger("change");
		});


		if ($("#end").val()) {
			dpOptions.defaultDate = moment($("#end").val(), 'HH:mm:00');
		}


		$('#end-inline').datetimepicker(dpOptions);
		$("#end-inline").on("dp.change", function (e) {
			$("#end").val(moment(e.date).format('HH:mm:00')).trigger("change");
		});

		record_table_active($("#timeslot-staff-table"));

		//console.info(data.details.data.onceoff)

		getTimeslotFormRepeats();


		$("#modal-window .select2").select2();


	}, "form-data")

};

function getTimeslotFormRepeats() {
	var repeatVal = $("#form-timeslot-capture input[name='repeat_mode']:checked").val();
	$("#form-timeslot-capture input[name='repeat_mode']").closest(".btn").removeClass("btn-info").addClass("btn-default");

	$("#form-timeslot-capture input[name='repeat_mode']:checked").closest(".btn").removeClass("btn-default").addClass("btn-info");


	//console.log($("#form-timeslot-capture input[name='repeat']:checked"))
	//$("#form-timeslot-capture #repeat-"+repeatVal).trigger("click");

	var dpOptions = datetimepickerOptions;

	$("#form-timeslot-capture .repeat-forms").hide();
	$("#form-timeslot-capture #repeat-form-" + repeatVal).show();

	dpOptions.format = "YYYY-MM-DD";


	if ($("#repeat_data_0").val()) {
		dpOptions.defaultDate = moment($("#repeat_data_0").val()).format('YYYY-MM-DD');
	} else {
		dpOptions.useCurrent = true;
	}


	$('#repeat_onceoff-inline').datetimepicker(dpOptions);
	$("#repeat_onceoff-inline").on("dp.change", function (e) {
		$("#repeat_data_0").val(moment(e.date).format('YYYY-MM-DD'));
	});

	//console.log($("#repeat_data_0").val())

	$("#repeat-weekly-buttons label.active").removeClass("active");


	repeat_checkboxes($("#repeat-weekly-buttons"), $("#repeat_data_2"));

	$("#repeat-weekly-buttons input").on("change", function () {

		repeat_checkboxes($("#repeat-weekly-buttons"), $("#repeat_data_2"));
	})


	repeat_checkboxes($("#repeat-monthly-buttons"), $("#repeat_data_3"));
	$("#repeat-monthly-buttons input").on("change", function () {
		repeat_checkboxes($("#repeat-monthly-buttons"), $("#repeat_data_3"));
	})


}
function repeat_checkboxes($area, $updatefield) {
	$("label.active", $area).removeClass("active");
	var value = [];
	$("input", $area).each(function () {
		var $this = $(this);
		var $label = $this.closest("label");

		if ($this.is(":checked")) {
			$label.addClass("active");
			value.push($this.val());
		}

	});

	saveVal = value.join(",");

	if ($updatefield) {
		$updatefield.val(saveVal);
	}


}


function offcanvas() {
	$(".offcanvas").each(function () {
		var $this = $(this);
		var w = $(window).width();
		$this.css({"width": w, "top": $("#main-nav-bar").outerHeight()})
		if ($this.hasClass("offcanvas-right")) {
			if ($this.hasClass("in")) {
				$this.stop(true, true).animate({
					right: 0,
				}, 500, function () {
					// Animation complete.
				})

			} else {
				$this.stop(true, true).animate({
					right: -w,
				}, 500, function () {
					// Animation complete.
				})
			}

		}
	})
}

(function ($) {
	'use strict';

	$.fn.scrollToSimple = function ($target) {
		var $container = this.first();      // Only scrolls the first matched container

		var pos = $target.position(), height = $target.outerHeight();
		var containerScrollTop = $container.scrollTop(), containerHeight = $container.height();
		var top = pos.top + containerScrollTop;     // position.top is relative to the scrollTop of the containing element

		var paddingPx = containerHeight * 0.15;      // padding keeps the target from being butted up against the top / bottom of the container after scroll

		if (top < containerScrollTop) {     // scroll up
			$container.scrollTop(top - paddingPx);
		}
		else if (top + height > containerScrollTop + containerHeight) {     // scroll down
			$container.scrollTop(top + height - containerHeight + paddingPx);
		}
	};
})(jQuery);