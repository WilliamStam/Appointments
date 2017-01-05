Option Explicit
Dim obj
Set obj = CreateObject("InternetExplorer.Application")
obj.Navigate "http://appointments.impreshin.com/cron.php"
obj.visible = true
While obj.Busy
Wend
obj.Quit
Set obj = Nothing