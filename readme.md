#TODO

##Reserved Timeslots
- [ ] Reserved timeslot form on dashboard (+ button)
  - [ ] Once off
  - [ ] Daily at this time
- [ ] Agenda views to include reserved timeslots
- [ ] Show reserved timeslots in the list
- [ ] Show reserved timeslots in the day view
- [ ] Reserved timeslots are click-able to bring up the form to edit them

##Appointment Actions *(on details pane)*

- [ ] Admin confirmation of appointment when created on front end
- [ ] Admin confirmation of appointment when changed on front end

  ####Appointment Confirmed
  - [ ] Mark confirmed/unconfirmed bookings differently in the lists
   - (unconfirmed bookings still block timeslots)
      
  ####Appointment Canceled
  - [ ] Hide from the lists
  - [ ] Exclude canceled records from the available timeslot limitations



 ##Notifications
- [ ] Notify when admin has confirmed appointment (client notifications should be on this)
  - Notification templates
    - [ ] not_1 - client sms
    - [ ] not_2 - client email
    - [ ] not_3 - admin sms
    - [ ] not_4 - admin email
- [ ] Notify when admin has canceled the appointment
  - Notification templates
    - [ ] not_1 - client sms
    - [ ] not_2 - client email
    - [ ] not_3 - admin sms
    - [ ] not_4 - admin email
- [ ] Notify when an admin confirms changes to an appointment
  - Notification templates
    - [ ] not_1 - client sms
    - [ ] not_2 - client email
    - [ ] not_3 - admin sms
    - [ ] not_4 - admin email
- [ ] Notify when an admin confirms a cancellation of an appointment
  - Notification templates
    - [ ] not_1 - client sms
    - [ ] not_2 - client email
    - [ ] not_3 - admin sms
    - [ ] not_4 - admin email
- [ ] Notify when an admin deletes an appointment
  - Notification templates
    - [ ] not_1 - client sms
    - [ ] not_2 - client email
    - [ ] not_3 - admin sms
    - [ ] not_4 - admin email

##Recieved / replyed to sms's
- [ ] Add messages recieved to the top menu bar
- [ ] Add messages to client log
- [ ] Notify admin of sms replys
  - Notification templates
    - [ ] not_3 - admin sms
    - [ ] not_4 - admin email
    
##Capture form Admin side
- [ ] Show timeslots used
- [ ] Warn user if timeslots clash
- [ ] Warn user if timeslot goes out of "open hours"
- [ ] Capture who created/edited/deleted the record (log etc)    

##Capture form Front side
- [ ] Capture who created/edited/deleted the record, IP etc
- [ ] Allow editing / canceling of records (subject to admin confirming the action)

##Client History
- [ ] Show a client history under "clients"
  - [ ] Appointments
  - [ ] SMS Replys
  - [ ] Canceled Appointments
  
    
##Misc  
- [ ] Include the pipe character in the info block (description) for sms portal new line
- [ ] Agenda lines (details pane, dashboard, agenda view) need to change colours for confirmed / unconfirmed

 
---
*wip section - subject to change a lot*
#v2 - *Resale system*
##System
- [x] Multiple Companies on same install base 
- [x] Allow a user to be a part of multiple companies
- [ ] Capture form for capturing a new company (front end)
- [ ] Super Admin section for companies (mark them as not paying and boot them etc)
- [ ] Companies can use custom domains instead of unique urls
- [x] SSL on whole project (security)
- [ ] SMS administration

  ###Staff members
  - [ ] Timeslots dependent on staff member chosen
  - [ ] Roster for staff members



 ##Front 
 ###Company page
 - [ ] Single page profile/website for company (unique url)
   - [ ] Contact Details
   - [ ] Services
   - [ ] Bio
   
   
 ###Form
 - [ ] Unique url for each companies form
 - [ ] Use template for front end form (from admin)
 
 
##Admin

###Staff
- [ ] Staff notification settings

###Settings

#####Company Page
- [ ] Template for the company page
- [ ] Contact Details

#####Front form
- [ ] Template for the front form (welcome to etc)

#####Users
- [ ] Make sure the username is unique
- [ ] Permissions