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

#!/bin/bash

dir='./node_modules'

# Checking if Node.js is installed
if which node > /dev/null;
then
    # Checking if Node.js deps are installed
    if [ ! -d $dir ]
    then
        echo 'The "'$dir'" folder is not present, so Node.js deps are going to be automatically installed ...'
        npm i
    fi
    # Starting
    node bin/blueboxClient.js
else
    echo 'Node.js is not present, install it (http://nodejs.org/) and start again, please.'
fi