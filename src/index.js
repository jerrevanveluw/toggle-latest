#!/usr/bin/env node

var fs = require('fs');
var cwd = process.cwd();
var flag = process.argv[2];
var npm = {name: 'package.json', dir: '/node_modules', config: '.npmrc'};
var bower = {name: 'bower.json', dir: '/bower_components', config: '.bowerrc'};

activate();

/////////////////////////////////////////////

function activate() {
    npm.dir = readConfig(npm.config) ? readConfig(npm.config).directory : npm.dir;
    npm.pack = readJSON(npm.name);
    bower.dir = readConfig(bower.config) ? readConfig(bower.config).directory : bower.dir;
    bower.pack = readJSON(bower.name);

    if (flag === '--latest' || flag === '-l') {
        writeJSON(setLatest(npm));
        writeJSON(setLatest(bower));
    } else if (flag === '--version' || flag === '-v') {
        writeJSON(setVersions(npm));
        writeJSON(setVersions(bower));
    } else {
        writeJSON(toggle(npm));
        writeJSON(toggle(bower));
    }
}

function readConfig(configFileName) {
    var rootFiles = fs.readdirSync(cwd);
    if (rootFiles.indexOf(configFileName) !== -1) {
        return require(configFileName);
    }
}

function readJSON(jsonFileName) {
    var files = fs.readdirSync(cwd);
	if (files.indexOf(jsonFileName) !== -1) {
		return require(cwd + '/' + jsonFileName);
	}
}

function writeJSON(package) {
    if (package.pack) {
        // console.log(package.name, package.pack + '\n');
        fs.writeFileSync(package.name, package.pack + '\n');
    }
}

function toggle(package) {
	if (checkIfLatest(package.pack)) {
		return setVersions(package);
	} else {
		return setLatest(package);
	}
}

function checkIfLatest(package) {
	if (package && package.dependencies) {
		return check('d');
	} else if (package && package.devDependencies) {
		return check('devD');
	}
    function check(dev) {
        var c = dev + 'ependencies';
        return package[c][Object.keys(package[c])[0]] === 'latest';
    }
}

function makeJSON(obj) {
    return JSON.stringify(obj, null, 4);
}

function setVersions(package) {
	set('dependencies', 'version');
	set('devDependencies', 'version');

    package.pack = makeJSON(package.pack);

    return package;

	function set(key, value) {
        var setToVersion = value === 'version';
		if (package.pack && package.pack[key]) {
			var keys = Object.keys(package.pack[key]);
			for (var i = 0; i < keys.length; i++) {
                if (setToVersion) {
                    var x = '/' + keys[i] +'/';
                    var version = require(cwd + package.dir + x + package.name).version;
                }

				package.pack[key][keys[i]] = version;
			}
		}
	}
}

function setLatest(package) {
	set('dependencies', 'latest');
	set('devDependencies', 'latest');

    package.pack = makeJSON(package.pack);

	return package;

	function set(key, value) {
		if (package.pack && package.pack[key]) {
			var keys = Object.keys(package.pack[key]);
			for (var i = 0; i < keys.length; i++) {
				package.pack[key][keys[i]] = value;
			}
		}
	}
}
