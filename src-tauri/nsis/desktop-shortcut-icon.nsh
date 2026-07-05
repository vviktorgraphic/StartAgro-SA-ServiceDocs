!macro NSIS_HOOK_POSTINSTALL
  SetOutPath "$INSTDIR"
  Delete "$INSTDIR\StartAgro-ServiceDocs.ico"
  File /oname=StartAgro-ServiceDocs-icon-v2.ico "${INSTALLERICON}"

  ${If} $NoShortcutMode = 0
    Delete "$DESKTOP\${PRODUCTNAME}.lnk"
    CreateShortcut "$DESKTOP\${PRODUCTNAME}.lnk" "$INSTDIR\${MAINBINARYNAME}.exe" "" "$INSTDIR\StartAgro-ServiceDocs-icon-v2.ico" 0
  ${EndIf}
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  Delete "$INSTDIR\StartAgro-ServiceDocs.ico"
  Delete "$INSTDIR\StartAgro-ServiceDocs-icon-v2.ico"
!macroend
