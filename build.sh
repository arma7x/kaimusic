#!/bin/sh

rm -R ./.v2
mkdir ./.v2 && cp -R * ./.v2
cd ./.v2
rm "./manifest.webmanifest"
rm "./build.sh"
rm "./README.md"
zip -r "./application.zip" *
cd ../

rm -R ./.v3
mkdir ./.v3 && cp -R * ./.v3
cd ./.v3
rm "./manifest.webapp"
rm "./build.sh"
rm "./README.md"
zip -r "./applicationV3.zip" *
cp ./applicationV3.zip ../
cd ../

cd ./.v2 && cp ./application.zip ../
cd ../
rm -R ./.v2
rm -R ./.v3
