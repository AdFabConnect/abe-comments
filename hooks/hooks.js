'use strict';

var hooks = {
  afterListPage: (res, file, index, text, abe) => {
  	var url = res.match(/file-path".*>((\r|\t|\n|.)*?)<\/a>/g)[0]
		  						.replace(/file-path".*>/, '')
		  						.replace(/<\/a>/, '')
		  						.trim()
    url = url.split('.')[0] + '.json'

    var count = 0;
    var commentUrl = abe.fileUtils.concatPath(abe.config.root, 'comments', url)
    var commentJson = abe.FileParser.getJson(commentUrl, false)
    if(JSON.stringify(commentJson) !== '{}' && commentJson.length) count = commentJson.length

    url = '/plugin/abe-comments/comments?filePath=' + url
    return res.replace(
    	/(file-path".*>(\r|\t|\n|.)*?<\/a>)/g,
    	'$1<a href="#" data-url="' + url + '" title="view comments" class="comments" data-count="' + count + '">' +
    	'<span class="glyphicon glyphicon-comment" data-toggle="modal" data-target="#comment-modal"></span><span class="count">' + count + '</span></a><\/a>'
  	)
  }
};

exports.default = hooks;
