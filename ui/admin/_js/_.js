;
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


	$(document).on("submit","#form-capture",function(e){
		e.preventDefault();
 		var $this = $(this);
		var data = $(this).serialize();
		var ID = $.bbq.getState("advertID");
		$.post("/admin/save/form/appointment?ID="+ID,data,function(result){
			result = result.data;
			validationErrors(result, $this);
			if (!result.errors && typeof getData == 'function') {
				getData();
				$this.closest(".modal").modal("hide")
			}
		})
	});






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

    if (!$.isEmptyObject(data['errors'])) {

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

        $.bbq.pushState({"appID": ID,"form":true});


        getAppointmentForm();

    });



	$(document).on("change","#services-area .services-select",function(){
		var $this = $(this);
		$this.closest(".input-groups").find(".form-control-static").html(minutes_to_time($("option:selected",this).attr("data-duration"),true));
		update_services_duration();
	});
	$(document).on("click",".btn-new-service",function(){
		$("#services-area").jqoteapp($("#template-appointment-services-area-item"),{});
		$("#services-area select").select2();

		var $field = $(this);
		$field.closest(".has-error").removeClass("has-error").find(".form-validation").remove();
		submitBtnCounter($field.closest("form"));
		update_services_duration();
	});

	$(document).on("click",".appointment-row",function(e){
		e.preventDefault();
		var $this = $(this);
		var ID = $this.attr("data-id");
		if (ID){
			$.bbq.pushState({"appID":ID});
			getAppointmentView()
		}


	});


	$(document).on("click","#form-appointment .appointment-row",function(e){
		e.preventDefault();
		$.bbq.removeState("form")
	});




});
$(document).ready(function () {

	$(document).on("click", ".form-modal-forms-btn", function (e) {
		e.preventDefault();
		var $this = $(this);
		var form = $this.attr("data-form");




		if (form=="walkin-form"){



			setClient("walkin");
			show_form("appointment-form");

		} else {
			show_form(form);
		}



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

		$.post("/admin/save/form/client",$this.serialize(),function(result){
			result = result.data;
			validationErrors(result, $this);
			if (!result.errors) {

				setClient(result.ID);
				show_form("appointment-form");
			}
		})



	})

	$(document).on("submit", "#form-appointment-capture", function (e) {
		e.preventDefault();

		var $this = $(this);
		var ID = $.bbq.getState("appID");

		$.post("/admin/save/form/appointment?ID="+ID,$this.serialize(),function(result){
			result = result.data;
			validationErrors(result, $this);
			if (!result.errors) {
				$.bbq.pushState({"appID":result.ID});
				getAppointmentView();
			}
		})



	})

	$(document).on("keyup", "#client-search", function (e) {
		e.preventDefault();
		var $this = $(this)
		$this.doTimeout( 'client-search', 500, function(){

			var search = $(this).val();

			$.getData("/admin/data/form/clients",{"search":search,"hiddenajax":true},function(data){
				$("#client-select-area").jqotesub($("#template-client-list"),data);

				if (data.list.length==1){
					setClient(data.list[0].ID);
					setTimeout(function() { $("#appointment-form textarea:first").focus() }, 500);
				}
				if (data.list.length==0 && search){
					$("#client-select-area").html("<thead><tr><td class='text-center'>No records found matching: "+search+"</td></tr></thead>")
				}

			},"client-data-search")


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

		$.getData("/admin/data/form/clients",{"ID":ID},function(data){
			$("#client-form").jqotesub($("#template-form-client"),data);
			show_form("client-form");
		},"client-data")
	})
	$(document).on("click", "#client-form button[type='reset']", function (e) {
		e.preventDefault();
		if ($("#clientID").val()){
			show_form("appointment-form");
		} else{
			show_form("");
		}
	//	console.log($("#clientID").val())


	})
	$(document).on("click", "#details-appointment .btn[data-dismiss='modal']", function (e) {
		e.preventDefault();
		$.bbq.pushState("appID","");


	});


	$(document).on("offcanvas.open",".offcanvas-left",function(){
		var w = $(window).width();
		$(this).addClass("in");
		offcanvas();

	});
	$(document).on("offcanvas.close",".offcanvas-left",function(){
		var w = $(window).width();
		$(this).removeClass("in");
		offcanvas();
	});
	$(document).on("offcanvas.open",".offcanvas-right",function(){
		var w = $(window).width();
		$(this).addClass("in");
		offcanvas();
	});
	$(document).on("offcanvas.close",".offcanvas-right",function(){
		var w = $(window).width();
		$(this).removeClass("in");
		offcanvas();
	});


	$(document).on("click",".offcanvas-strip-close",function(){
		$(this).closest(".offcanvas").trigger("offcanvas.close");
	})

});
function show_form(form){
	$("#modal-window .forms").stop(true, true).hide(400);
	if (form){
		$("#modal-window #" + form).stop(true, true).show(400);
	}
	if (form == "client-form"){
		$('#client-form textarea#notes').summernote({
			minHeight:200,
			toolbar: [
				['headline', ['style']],
				['style', ['bold', 'italic', 'underline', 'superscript', 'subscript', 'strikethrough', 'clear']],
				['textsize', ['fontsize']],
				['alignment', ['ul', 'ol', 'paragraph', 'lineheight']]
			]
		});
	}






}
function setClient(ID){
	if (typeof ID == "object"){
		$("#client-area-form").jqotesub($("#template-client-form-display"),ID);
		$("#clientID").val(ID.ID).attr("data-old-clientID",$("#clientID").val());
	} else {
		$.getData("/admin/data/form/clients",{"ID":ID},function(data){


			$("#client-area-form").jqotesub($("#template-client-form-display"),data);
			$("#clientID").val(data.details.ID).attr("data-old-clientID",$("#clientID").val());
			show_form("appointment-form");



		},"client-data")
	}




}



if ($.bbq.getState("appID")) {
	if ($.bbq.getState("form")){
		getAppointmentForm()
	} else {
		getAppointmentView()
	}
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

function appointmentArrowButtons(){

	var $btn_prev = $("#details-appointment .record-direction-btns .btn-prev").attr("disabled","disabled");
	var $btn_next = $("#details-appointment .record-direction-btns .btn-next").attr("disabled","disabled");


	var $agenda = $("#details-appointment .agenda-view");


	var id = $(".agenda-item.current",$agenda).find(".appointment-row").attr("data-id");
	var $current = $(".agenda-item.current",$agenda);

	var prev = $current.prev(".agenda-item").find(".appointment-row").attr("data-id");
	var next = $current.next(".agenda-item").find(".appointment-row").attr("data-id");

	if (prev){
		$btn_prev.removeAttr("disabled").attr("data-id",prev);
	}
	if (next){
		$btn_next.removeAttr("disabled").attr("data-id",next);
	}







}




function getAppointmentForm() {
    var ID = $.bbq.getState("appID");

    $.getData("/admin/data/form/appointment", {"ID": ID}, function (data) {
        $("#modal-window").jqotesub($("#template-modal-form-appointment"), data).modal("show").on("hide.bs.modal",function(){
        	$.bbq.removeState("form")
		});

        if (data.details.ID==""){
			setTimeout(function() { $("#client-search").focus() }, 500);
		}

		  if ($("#appointmentStart").val()==""){
			  $("#appointmentStart").val(moment().format('YYYY-MM-DD HH:mm:00'));

		  }


	  datetimepickerOptions.defaultDate = moment($("#appointmentStart").val(),'YYYY-MM-DD HH:mm:ss');

		$('#appointmentStart-inline').datetimepicker(datetimepickerOptions);
		$("#appointmentStart-inline").on("dp.change", function (e) {
			$("#appointmentStart").val(moment(e.date).format('YYYY-MM-DD HH:mm:00')).trigger("change");
			update_services_duration();
		});


		$("#services-area select").select2();

		$("#services-area .services-select").each(function(){
			var $this = $(this);
			$this.closest(".input-groups").find(".form-control-static").html(minutes_to_time($("option:selected",this).attr("data-duration"),true))
		})

		update_services_duration();

		$('textarea#notes').summernote({
			minHeight:200,
			toolbar: [
				['headline', ['style']],
				['style', ['bold', 'italic', 'underline', 'superscript', 'subscript', 'strikethrough', 'clear']],
				['textsize', ['fontsize']],
				['alignment', ['ul', 'ol', 'paragraph', 'lineheight']]
			]
		});






    }, "form-data")

};
function update_services_duration(){
	var dur = 0;

	$("#services-area .services-select").each(function(){
		var $this = $(this);
		var d = $("option:selected",this).attr("data-duration");
		if (d) {
			dur = dur + (d*1);
		}
	})

	$("#services-area-duration").html( minutes_to_time(dur,true)).attr("data-duration",dur);

	var start = $("#appointmentStart").val();

	if (start){



		start = moment(start, "YYYY-MM-DD HH:mm:ss");
		end = moment(start).add(dur, 'minutes');
	//	$("#appointmentEnd").html(end.format("ddd, D MMM YYYY  HH:mm"));

		if (moment(start).isSame(end, 'day')){
			$("#appointmentEnd").html(end.format("HH:mm"));
		} else {
			$("#appointmentEnd").html(end.format("YYYY-MM-DD HH:mm"));
		}

		$("#appointmentEnd").closest(".row").show();

	} else {
		$("#appointmentEnd").closest(".row").hide()
	}



}
function offcanvas(){
	$(".offcanvas").each(function(){
		var $this = $(this);
		var w = $(window).width();
		$this.css({"width":w,"top":$("#main-nav-bar").outerHeight()})
		if ($this.hasClass("offcanvas-right")){
			if ($this.hasClass("in")){
				$this.stop(true,true).animate({
					right: 0,
				}, 500, function() {
					// Animation complete.
				})

			} else {
				$this.stop(true,true).animate({
					right: -w,
				}, 500, function() {
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