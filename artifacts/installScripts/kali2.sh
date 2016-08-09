#!/bin/bash

# Copyright 	Jesus Perez <jesusprubio gmail com>
#		Aan Wahyu <cacaddv gmail com>	
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.


# Script to install Bluebox-ng in Kali 2 GNU/Linux

sourcesFile='/etc/apt/sources.list.d/nodesource.list'

echo "Checking aptitude..."

# Check for aptitude is installed or not. Because default kali linux does not provide aptitude
if dpkg-query -s "aptitude" 1>/dev/null 2>&1; then
    echo "OK. Aptitude is installed..."
  else
    if apt-cache show aptitude 1>/dev/null 2>&1; then
	echo "Installing aptitude..."
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
# still commented because bluebox-ng in npm repo not updated. just comment this if already launched
#npm i -g bluebox-ng
echo "Done, just type 'bluebox-ng' :)"
