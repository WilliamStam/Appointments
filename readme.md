#TODO

##Reserved Timeslots
- [x] Reserved timeslot form on dashboard (+ button)
  - [x] Once off
  - [x] Daily
  - [x] Weekly
  - [x] Monthly
- [x] Agenda views to include reserved timeslots
- [x] Show reserved timeslots in the list
- [x] Show reserved timeslots in the day view
- [x] Reserved timeslots are click-able to bring up the form to edit them
- [x] Order reserved timeslots in the list ASC
- [x] Once off timeslots need to be hidden when in the past
- [x] staff members can have their own timeslots assigned


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
- [ ] Warn user if timeslots clash - appointments
- [ ] Warn user if timeslots clash - reserved timeslots
- [ ] Warn user if timeslot goes out of "open hours"
- [ ] Capture who created/edited/deleted the record (log etc)    

##Capture form Front side
- [ ] Capture who created/edited/deleted the record, IP etc
- [ ] Allow editing / canceling of records (subject to admin confirming the action)
- [x] Times to include reserved timeslots
- [x] check available times every step of the way. dont allow double bookings

##Client History
- [x] Show a client history under "clients"
  - [x] Appointments
  - [ ] SMS Replys
  - [ ] Canceled Appointments
  
##Staff members
  - [ ] Timeslots dependent on staff member chosen
  - [ ] Roster for staff members
  - [ ] front form you choose a staff member and then choose services
  - [x] staff members get a list of services they offer
  - [ ] dashboard lists limit it to the current staff member
  - [ ] user gets linked to staff member. so when the user logs in the dashboard is their own list
  - [ ] Badge styles for a staff member
      - [x] font colour
      - [x] background colour
      - [ ] colour pickers
    
    
    
    
##Misc  
- [ ] Include the pipe character in the info block (description) for sms portal new line
- [ ] Agenda lines (details pane, dashboard, agenda view) need to change colours for 
  - [ ] confirmed (as is now)
  - [ ] unconfirmed (striped colour)
  - [ ] staff member (each staff member gets their own color)
  
- [ ] SMS page for buying credits etc

- [ ] Notification when credits are running low


 
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
- [ ] custom 404 page
- [ ] global admin for companies
  - [ ] sms bundles
  - [ ] payed the bill
  - [ ] basic stats
- [ ] SMS bundles for each company




 ##Front 
 ###Company page
 - [ ] Single page profile/website for company (unique url)
   - [ ] Contact Details
   - [ ] Services
   - [ ] Bio
   
   
 ###Form
 - [x] Unique url for each companies form
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
  - [ ] add user to company if user exists
- [ ] Permissions