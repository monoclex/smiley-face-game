#!/bin/bash

cd client/src/libcore
rm core

echo Creating syslink for client core...
ln -s ../../../core core

cd ../../../

cd server/libcore
rm core

echo Creating syslink for server core...
ln -s ../../core core

cd ../../
echo Completed!
