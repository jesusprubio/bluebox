#!/bin/bash

# Copyright   Jesús Pérez <jesusprubio@gmail.com>
#             Aan Wahyu <cacaddv@gmail.com>
#
# This code may only be used under the MIT license found at
# https://opensource.org/licenses/MIT.


# Script to install Bluebox-ng in Kali 2 GNU/Linux

sourcesFile='/etc/apt/sources.list.d/nodesource.list'

echo "Checking aptitude..."

# Check for aptitude is installed or not. Because default kali linux does not provide aptitude
if dpkg-query -s "aptitude" 1>/dev/null 2>&1; then
  echo "OK. Aptitude is installed ..."
else
  if apt-cache show aptitude 1>/dev/null 2>&1; then
	  echo "Installing aptitude ..."
	  apt-get -y install aptitude
  fi
fi

# Just in case the first boot (or Live cd)
echo "Updating sources ... (just in case)"
aptitude update

echo "Installing Node.js binaries ..."
curl -sL https://deb.nodesource.com/setup_6.x | bash -
aptitude install -y nodejs

echo "Installing Bluebox-ng, wait a moment please ..."
npm i -g bluebox-ng
echo "Done, just type 'bluebox-ng' :)"
