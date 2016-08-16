'use strict';

var User;

try{
	User = require('../../../abe-users/modules/User');
}
catch(e){}

var route = function route(req, res, next, abe) {
	var user = {username: 'unknow', name: 'unknow', email: 'unknow', role: 'unknow'};
	if(User) user = User.decodeUser(req, res, abe);
	var action = req.query.action
	var json
	var commentsPath = 'comments'
	var realFilePath = req.query.filePath.replace('.json', '.' + abe.config.files.templates.extension)
	var jsonPath = req.query.filePath.split('/')
	var jsonFile = jsonPath.pop()
	jsonPath = abe.fileUtils.concatPath(abe.config.root, commentsPath, jsonPath.join('/'))
	abe.folderUtils.createFolder(jsonPath)
	jsonFile = abe.fileUtils.concatPath(jsonPath, jsonFile)

	switch(req.query.action){
		case 'read': 
			try{
				var json = abe.FileParser.getJson(jsonFile, true)
				if(JSON.stringify(json) === '{}') json = []
			}
			catch(e){ console.log(e) }
		break;
		case 'write':
			json = req.query.data ? JSON.parse(req.query.data) : []
			abe.folderUtils.createFile(jsonFile, json)
		break;
	}

	json.sort(function(a, b){
    var keyA = new Date(a.date),
        keyB = new Date(b.date);
    if(keyA > keyB) return -1;
    if(keyA < keyB) return 1;
    return 0;
	});

	res.set('Content-Type', 'application/json')
	res.send(JSON.stringify({
		route: 'comments',
		success: 1,
		filePath: realFilePath,
		jsonPath: req.query.filePath,
		user: user,
		result: JSON.stringify(json)
	}))
}

exports.default = route;