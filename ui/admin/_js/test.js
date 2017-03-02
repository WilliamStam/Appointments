$(document).ready(function(){

	$(document).on("mouseenter",".timeslot",function(){
		var $this = $(this);
		var $panel = $this.closest(".panel");


		var staff = $(this).attr("data-staff");
		$(".staff .item.showing",$panel).removeClass("showing");
		if (staff){
			staff = staff.split(",");

			for(var i in staff){

				$(".staff .item[data-id="+staff[i]+"]",$panel.find(".panel-footer")).addClass("showing");
			}

		}
	})

	$(document).on("mouseleave",".timeslot",function(){
		showStaff()
	})


	$(document).on("click",".timeslot.selectable",function(){
		var $this = $(this);
		var $panel = $this.closest(".panel");
		$panel.find(".timeslot.active").removeClass("active");
		$this.addClass("active");

		var serviceID =$panel.attr("data-id");
		var time = $this.attr("data-value");
		var staffID = $panel.find(".panel-footer .item.active").attr("data-id");

		$panel.addClass("choosing");


		showStaff()
	})

	showStaff()

	function showStaff(){
		$("#calendar .panel").each(function(){
			var $panel = $(this);
			var duration = $panel.attr("data-duration");

			var $timeslots = $panel.find(".timeslots");

			$(".staff .item.showing",$panel.find(".panel-footer")).removeClass("showing");

			var staff = $(".active",$timeslots).attr("data-staff")
			if (staff){
				staff = staff.split(",");

				for(var i in staff){

					$(".staff .item[data-id="+staff[i]+"]",$panel.find(".panel-footer")).addClass("showing");
				}

			}

		})

	}

});
