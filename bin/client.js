#!/usr/bin/env node

/*
    Copyright Jesus Perez <jesusprubio gmail com>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';

var async = require('async'),
    readline = require('readline'),
    shell = require('shelljs'),
    lodash = require('lodash'),
    Bluebox = require('../'),
    printer = require('../utils/printer'),
    PROMPT = 'Bluebox-ng> ',
    PORT_FROM_TRANSPORT = {
        udp: 5060,
        tcp: 5060,
        tls: 5061,
        ws: 8080,
        wss: 4443
    },
    modulesInfo = {},
    modulesGeneralOptions = {
    },
    modulesList = [],
    modulesSetVars = [],	
    exitNext = false,
    commCases, bluebox, rl, autoCompType = 'command';

function completer(line) {
    switch (autoCompType){
        case 'command':
            var completions = modulesList.join(' '),
                hits;
            hits = modulesList.filter(function (c) {
                return c.indexOf(line) === 0;
            });
        break;
        case 'variable':
            var completions = modulesSetVars.join(' '),
                hits;
            hits = modulesSetVars.filter(function (c) {
                return c.indexOf(line) === 0;
            });
        break; 
        default:
            var completions = [],
                hits;
                hits = 0;
    }

    return [(hits.length + 1 ? hits : completions), line];
}


function runModule(moduleName, rl) {
    var moduleInfo = modulesInfo[moduleName].help,
        moduleOptions = {},
	chosenTransport = null;

    function cb(err, result) {
        printer.bold('\nRESULT:\n');
        if (!err) {
            if (!result || result.length === 0) {
                printer.highlight('No result');
            } else {
                printer.json(result);
            }
        } else {
            printer.error('ERROR: run(): ' + JSON.stringify(err));
        }
        printer.regular('\n');
        rl.prompt();
    }

    // Asking for the parameters (if any)
    if (!moduleInfo.options) {
        printer.infoHigh('\nStarting ...');
  	printer.infoHigh('Not asking for the parameters\n');
        bluebox.runModule(moduleName, moduleOptions, cb);

        return;
    }
    async.eachSeries(
        Object.keys(moduleInfo.options),
        function (option, callback) {
            if (modulesGeneralOptions[option]) {
                var defaultValue = modulesGeneralOptions[option], 
                printDefault;
            } else {
                var defaultValue = moduleInfo.options[option].defaultValue,
                printDefault;
            }	
            // TODO: Move these checks outside here (if possible) to avoid
            // check in every iteration
            // Default exceptions to get a friendly interaction with the user
            // Tricking the info to shown to cover this case
            if (option === 'ports') {
                defaultValue = PORT_FROM_TRANSPORT[chosenTransport];
            }
            if (defaultValue) {
                printDefault = defaultValue;
            } else {
                printDefault = 'required';
            }
            // Avoiding to ask for not needed params
            if ((['wsPath', 'wsProto'].indexOf(option) !== -1 &&
                 ['ws', 'wss'].indexOf(chosenTransport) === -1)) {
                callback();
            } else {
                rl.question(
                    '* ' + option +
                    ': ' + moduleInfo.options[option].description +
                    ' (' + printDefault + '): ',
                    function (answer) {
                        if (answer !== '') {
                            answer = answer.trim();
                        } else {
			    answer = defaultValue;
                            // Tricking the info to pass to the module to cover this case
                            if (option === 'port') {
                                answer = PORT_FROM_TRANSPORT[chosenTransport];
                            }
                        }
                        if (option === 'transport') {
                            if (answer === '') {
                                chosenTransport = 'udp';
                            } else {
                                chosenTransport = answer.toLowerCase();
                            }
                        }
                        // The parser will stop if:
                        // - the type doesn't exist
                        // - param not passed & not defaultValue (required)
                        moduleOptions[option] = answer;
                        callback();
                    }
                );
            }
        },
        function (err) {
            if (!err) {
                printer.infoHigh('\nStarting ...\n');
                bluebox.runModule(moduleName, moduleOptions, cb);
            }
        }
    );
}

function exitFine() {
    printer.bold('\nSee you! ;)');
    process.exit();
}

function runCommand(comm, rl) {
    // Deleting not needed params
    var splitComm = comm.split(' ');

    if (commCases[splitComm[0]]) {
        commCases[splitComm[0]](splitComm);
    } else {
        if (modulesList.indexOf(comm) !== -1) {
            runModule(comm, rl);
        } else {
            shell.exec(comm, { silent : true }, function (code, output) {
                if (code === 127) {
                    printer.error('ERROR: module/command not found');
                } else {
                    printer.regular(output);
                }
                rl.prompt();
            });
        }
    }
}

function createPrompt() {
    var rl = readline.createInterface(process.stdin, process.stdout, completer);

    rl.setPrompt(PROMPT);
    rl.prompt();

    // On new line
    rl.on('line', function (line) {
        runCommand(line.trim(), rl);
    });

    // On Ctrl+C, Ctrl+D, etc.
    rl.on('close', function () {
        if (!exitNext) {
            printer.bold('\nPress Ctrl+C again to quit.');
            exitNext = true;
            createPrompt();
            // If more than 5 secs. the user will need
            // to push the keys combination twice again
            setTimeout(
                function () {
                    exitNext = false;
                },
                5000
            );
        } else {
            exitFine();
        }
    });

    return rl;
}


// Creating the Bluebox object
printer.info('\nInitializing...\n');
bluebox = new Bluebox({});

// Generating the modules list
printer.info('Charging modules...\n');
modulesInfo = bluebox.getModulesInfo();

lodash.each(modulesInfo, function (v, k) {
    modulesList.push(k);
    if ('options' in v.help){
        if(v.help.options != undefined){
            lodash.each(v.help.options, function (subv, subk){
            if (modulesSetVars.indexOf(subk) === -1)
                modulesSetVars.push(subk);
            });
       }
    }
});

// Client commands not included as modules
commCases = {
    // To avoid command not found on empty string
    '': function () {
        rl.prompt();
    },
    'quit': function () {
        exitFine();
    },
    'exit': function () {
        exitFine();
    },
    'help': function (commArrr) {
        if (commArrr.length > 1) {
        	if (modulesList.indexOf(commArrr[1]) !== -1) {
                if (commArrr[1] === 'help') {
                    printer.error('Really? xD');
                } else {
                    printer.json(modulesInfo[commArrr[1]].help);
                }
            } else {
                printer.error('ERROR: Module not found');
            }
        } else {
            lodash.each(modulesList, function (module) {
                if (modulesInfo[module]) {
	                printer.highlight(module); 
    	            if (modulesInfo[module].help) { // TO-DO: Delete this condition?
        	        	printer.regular(modulesInfo[module].help.description);
            	    }
            	}
            });

            printer.infoHigh('\n' + 'You can get more info about a module ' +
                              'using "help MODULE" (ie: "help sipScan")');
        }
        rl.prompt();
    },
    'shodanKey': function () {
        rl.question(
            '* Enter your key: ',
            function (answer) {
                if (answer) {
                    answer = answer.trim();
                    bluebox.setShodanKey(answer);
                    printer.infoHigh('Using SHODAN key: ');
                    printer.highlight(answer + '\n');
                } else {
                    printer.error('Empty key');
                }
                rl.prompt();
            }
        );
    },	
    'setg': function () {
        autoCompType = 'variable';	
        rl.question(
            '* variable: ',
            function (answerVar) {
                if (answerVar) {
                    answerVar = answerVar.trim();
                    if (modulesSetVars.indexOf(answerVar) != -1){
                        autoCompType = 'value';
                        rl.question(
                            '* value: ',
                            function (answerVal) {
                                modulesGeneralOptions[answerVar] = answerVal;
                                printer.infoHigh('Variable stored\n');
                                autoCompType = 'command';
                                rl.prompt();
                            }
                        );
                    } else {
                        autoCompType = 'command';
                        printer.error('Variable \'' + answerVar + '\' not exist\n');
                        rl.prompt();
                    }
                } else {
                    autoCompType = 'command';
                    printer.error('Empty value\n');
                    rl.prompt();v 
                }
            }
        );
    },
    'getg': function () {
        lodash.each(modulesGeneralOptions, function (v, k) {
            printer.nrinfoHigh(k + ': ');
            printer.info(v);
        });
        printer.info('\n');
        rl.prompt();
    }
};


// Adding client modules (avoiding the empty string)
modulesList = modulesList.concat(Object.keys(commCases).splice(1));

// Welcome info is printed
printer.welcome('\n\tWelcome to Bluebox-ng');
printer.info('\t(v' + bluebox.version() + ')\n');

// The prompt is started
rl = createPrompt();
