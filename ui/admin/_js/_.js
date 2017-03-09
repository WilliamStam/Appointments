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

		$.post("/admin/save/form/appointment?ID=" + ID, $this.serialize(), function (result) {
			result = result.data;
			validationErrors(result, $this);
			if (!result.errors) {
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

				if (!result.errors) {
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
			if (!result.errors) {
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

				if (!result.errors) {
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