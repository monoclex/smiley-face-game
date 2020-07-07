@echo off

:: Make sure they're running as administrator
net session >nul 2>&1
if not %errorLevel% == 0 (
    echo Make sure to run this as an administrator.
    exit /b 1
)

pushd client\src\libcore

del /q core

echo Creating syslink for client core...
mklink /D core ..\..\..\core 2>nul
popd

pushd server\libcore
del /q core
echo Creating syslink for server core...
mklink /D core ..\..\core 2>nul
popd

echo Completed!
