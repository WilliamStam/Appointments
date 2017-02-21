$(document).ready(function(){

	$(document).on("click",".timeslot.selectable",function(){
		var $this = $(this);
		$this.closest(".panel").find(".timeslot.active").removeClass("active");
		$this.addClass("active");
		showStaff()
	})

	showStaff()

	function showStaff(){
		$("#calendar .panel").each(function(){
			var $panel = $(this);
			var duration = $panel.attr("data-duration");

			var $timeslots = $panel.find(".timeslots");

			$(".staff .item",$panel.find(".panel-footer")).hide();

			var staff = $(".selected:first",$timeslots).attr("data-staff")
				if (staff){
					staff = staff.split(",");

					for(var i in staff){

						$(".staff .item[data-id="+staff[i]+"]",$panel.find(".panel-footer")).show();
					}

				}

		})

	}

});
