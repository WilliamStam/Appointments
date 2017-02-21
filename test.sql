UPDATE appointments_services t1
	INNER JOIN appointments t2
		ON t1.ID = t2.appointmentID
SET t1.appointmentStart = t2.appointmentStart