!macro NSIS_HOOK_POSTINSTALL
  SetOutPath "$INSTDIR"
  File /oname=StartAgro-ServiceDocs.ico "${INSTALLERICON}"

  ${If} $NoShortcutMode = 0
    Delete "$DESKTOP\${PRODUCTNAME}.lnk"
    CreateShortcut "$DESKTOP\${PRODUCTNAME}.lnk" "$INSTDIR\${MAINBINARYNAME}.exe" "" "$INSTDIR\StartAgro-ServiceDocs.ico" 0
  ${EndIf}
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  Delete "$INSTDIR\StartAgro-ServiceDocs.ico"
!macroend
