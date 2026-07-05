!macro NSIS_HOOK_POSTINSTALL
  SetOutPath "$INSTDIR"
  File /oname=StartAgro-ServiceDocs.ico "${INSTALLERICON}"

  ${If} $UpdateMode = 0
  ${AndIf} $NoShortcutMode = 0
    CreateShortcut "$DESKTOP\${PRODUCTNAME}.lnk" "$INSTDIR\${MAINBINARYNAME}.exe" "" "$INSTDIR\StartAgro-ServiceDocs.ico" 0
    !insertmacro SetLnkAppUserModelId "$DESKTOP\${PRODUCTNAME}.lnk"
  ${EndIf}
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  Delete "$INSTDIR\StartAgro-ServiceDocs.ico"
!macroend
