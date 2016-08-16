var comments = document.querySelectorAll('.comments');
var commentsBtn = document.querySelector('#comment-modal .btn-comments');
var commentsList = document.querySelector('#comment-modal .modal-footer');
var commentaireForPage = document.querySelector('#comment-modal .page-name');
var title = document.querySelector('#title-comments');
var msg = document.querySelector('#content-comments');
var dropdownItems = document.querySelectorAll('.dropdown-menu a');
var dropdownType = document.querySelector('#dropdownType');

var currentComment = ''
var currentJson = []
var currentUser = {
	username: 'unknow',
  name: 'unknow',
  email: 'unknow',
  role: 'unknow'
};

var singleComment = document.querySelector('.single-comment');
var attrUrl = '';

if(typeof singleComment !== 'undefined' && singleComment !== null){
	attrUrl = singleComment.getAttribute('data-url') + CONFIG.FILEPATH.split('.')[0] + '.json';
	singleComment.setAttribute('data-url', attrUrl);
	var sameCommentBtn = document.querySelector('td [data-url="'+ attrUrl + '"]');
	var sameCount = 0;
	if(typeof sameCommentBtn !== 'undefined' && sameCommentBtn !== null) sameCount = sameCommentBtn.getAttribute('data-count');
	singleComment.setAttribute('data-count', sameCount);
	singleComment.querySelector('.count').textContent = sameCount;
}

function insertAfter(newElement, targetElement) {
  var parent = targetElement.parentNode;
  if(parent.lastchild == targetElement) parent.appendChild(newElement);
  else parent.insertBefore(newElement, targetElement.nextSibling);
}

var addZero = function (number) {
	return number.toString().length === 1 ? ('0' + number) : number
}

var appendHtml = function (obj) {
	var date = new Date(obj.date);
	date = date.toDateString() + ' ' + addZero(date.getHours()) + ':' + addZero(date.getMinutes()) + ':' + addZero(date.getSeconds());
	return `<div class="panel panel-${obj.type}" data-id="${obj.date}">
					  <div class="panel-heading">
					    <h3 class="panel-title">${obj.title}</h3>
					    <div class="pull-right">
								<div class="date">${date}</div>
								<a href="#" class="delete" title="delete comment" data-delete="${obj.date}">
									<span class="glyphicon glyphicon-remove"></span>
								</a>
					    </div>
					  </div>
					  <div class="panel-body">
					  	<div class="text-left underline">Message from ${obj.author} :</div>
					    ${obj.message}
					  </div>
					</div>`;
}

var updateModal = function (data, filePath, jsonPath) {
	var html = ''
	commentaireForPage.textContent = filePath
	commentsBtn.setAttribute('data-url', "/plugin/abe-comments/comments?filePath=" + jsonPath + '&action=write')
		html = '<ul class="comment-list"><li>List comments : <br/><br/></li>'
		data.forEach(function (d) {
			html += `<li class="com">${appendHtml(d)}</li>`
		});
		html += '</ul>'
	commentsList.innerHTML = html
};

Array.prototype.forEach.call(comments, (comment) => {
	comment.addEventListener('click', function (e) {
		e.preventDefault();
		currentComment = comment;
		var url = comment.getAttribute('data-url') + '&action=read';
		var oReq = new XMLHttpRequest();
    oReq.onreadystatechange = function () {
    	if (oReq.readyState != 4 || oReq.status != 200) return;
    	var responseText = JSON.parse(oReq.responseText)
  		var result = JSON.parse(responseText.result)
			currentJson = result
			currentUser = responseText.user
  		updateModal(result, responseText.filePath, responseText.jsonPath)
    };
    oReq.open('GET', url, true);
    oReq.send();
	});
});

var saveJson = function (callBack) {
	var url = commentsBtn.getAttribute('data-url') + '&data=' + JSON.stringify(currentJson)
	var oReq = new XMLHttpRequest();
  oReq.onreadystatechange = function () {
  	if (oReq.readyState != 4 || oReq.status != 200) return;
  	callBack(JSON.parse(oReq.responseText))
  };
  oReq.open('GET', url, true);
  oReq.send();
};

var updateCounter = function (val) {
	var newCount = parseInt(currentComment.querySelector('.count').textContent) + val;
	var btns = document.querySelectorAll('[data-url="'+ currentComment.getAttribute('data-url') + '"]');
	Array.prototype.forEach.call(btns, (btn) => {
		btn.querySelector('.count').textContent = newCount;
		btn.setAttribute('data-count', newCount);
	});
};

commentsBtn.addEventListener('click', function (e) {
	e.preventDefault();
	var commentList = document.querySelector('.comment-list');
	var firstLi = commentList.querySelectorAll('li')[0];
	updateCounter(1);
	var newCom = {
		"date": new Date().toISOString(),
		"title": title.value,
		"message": msg.value,
		"author": currentUser.username,
		"type": dropdownType.getAttribute('data-value')
	};
	currentJson.push(newCom);
	saveJson(function (responseText) {
  	var li = document.createElement('li');
		li.classList.add('com');
		li.innerHTML = appendHtml(newCom);
		insertAfter(li, firstLi);
	});

});

Array.prototype.forEach.call(dropdownItems, (dropdownItem) => {
	var value = dropdownItem.getAttribute('data-value');
	dropdownItem.addEventListener('click', function (e) {
		dropdownType.innerHTML = dropdownItem.innerHTML + '<span class="caret pull-right"></span>';
		dropdownType.setAttribute('data-value', value)
	});
});

var deleteComment = function (id) {
	var commentItem = document.querySelector(`[data-id="${id}"]`);
	var found = -1;
	commentItem.parentNode.removeChild(commentItem);
	currentJson.forEach(function (item, index) {
		if(item.date === id) found = index;
	})
	updateCounter(-1);
	currentJson.splice(found, 1);
	saveJson(function (responseText) {});
};

document.querySelector('#comment-modal .modal-footer').addEventListener('click', function (e) {
	var target = e.target;
	if(target.classList.contains('delete')){
		deleteComment(target.getAttribute('data-delete'));
	}
});


