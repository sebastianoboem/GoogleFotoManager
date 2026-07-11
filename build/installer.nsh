!macro killGoogleFotoManagerProcesses
  DetailPrint "Chiusura eventuali istanze di Google Foto Manager..."
  nsExec::ExecToLog 'cmd /c taskkill /F /T /IM "Google Foto Manager.exe" 2>nul'
  nsExec::ExecToLog 'cmd /c taskkill /F /T /IM "Google Foto Manager Helper.exe" 2>nul'
  nsExec::ExecToLog 'cmd /c taskkill /F /T /IM "Google Foto Manager Helper (Renderer).exe" 2>nul'
  nsExec::ExecToLog 'cmd /c taskkill /F /T /IM "Google Foto Manager Helper (GPU).exe" 2>nul'
  nsExec::ExecToLog 'cmd /c taskkill /F /T /IM "Google Foto Manager Helper (Plugin).exe" 2>nul'
  Sleep 1000
!macroend

!macro customInit
  !insertmacro killGoogleFotoManagerProcesses
!macroend

!macro customInstall
  !insertmacro killGoogleFotoManagerProcesses
!macroend
