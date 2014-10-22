#!/bin/bash

# Copyright Jesus Perez <jesusprubio gmail com>
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


# Script to install Bluebox-ng in Kali GNU/Linux

sourcesFile='/etc/apt/sources.list.d/nodesource.list'

# Adding Backbports repo
curl -s https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add -
echo "# Debian Wheezy Backports" >> $sourcesFile
echo 'deb https://deb.nodesource.com/node wheezy main' > $sourcesFile
echo 'deb-src https://deb.nodesource.com/node wheezy main' >> $sourcesFile

# Installing Node
aptitude update
aptitude install nodejs

# Installing Bluebox-ng
npm i -g bluebox-ng
