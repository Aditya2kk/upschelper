$task = Get-ScheduledTask -TaskName 'UPSCNewsHubSync'
$task.Settings.DisallowStartIfOnBatteries = $false
$task.Settings.StopIfGoingOnBatteries = $false
$task.Settings.StartWhenAvailable = $true
$task.Settings.ExecutionTimeLimit = 'PT15M'
Set-ScheduledTask -InputObject $task
Write-Output "[OK] UPSCNewsHubSync task configured to run on AC and Battery power every 20 minutes."
