@echo off
setlocal

set "ROOT=%~dp0"
set "SERVER=%ROOT%dino-quiz\server.js"
set "BUNDLED_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

where node >nul 2>nul
if %errorlevel%==0 (
  node "%SERVER%"
  goto :done
)

if exist "%BUNDLED_NODE%" (
  "%BUNDLED_NODE%" "%SERVER%"
  goto :done
)

echo Node.js was not found.
echo Install Node.js from https://nodejs.org/ or run this from Codex where the bundled runtime is available.
pause

:done
endlocal
