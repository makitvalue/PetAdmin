
const tbodyNoticeList = document.querySelector('.js-tbody-notice-list');
const inputTitle = document.querySelector('.js-input-title');
const textareaContents = document.querySelector('.js-textarea-contents');
const buttonCancel = document.querySelector('.js-button-cancel');
const buttonNoticeAdd = document.querySelector('.js-button-notice-add');
const buttonNoticeSave = document.querySelector('.js-button-notice-save');
const inputHiddenNoId = document.querySelector('.js-input-hidden-no-id');


function getNoticeList() {
    fetch('/webapi/notice/get/all')
    .then((data) => { return data.json(); })
    .then((response) => {

        if (response.status != 'OK') {
            alert('에러가 발생했습니다.');
            return;
        }

        let noticeList = response.result;
        let html = '';
        for (let i = 0; i < noticeList.length; i++) {
            let notice = noticeList[i];
            html += '<tr class="js-tr-notice" noId="' + notice.no_id + '">';
            html +=     '<td>' + notice.no_id + '</td>';
            html +=     '<td>' + notice.no_title + '</td>';
            html +=     '<td>' + notice.no_created_date + '</td>';
            html +=     '<td class="buttons">';
            html +=         '<a href="/notice/detail/' + notice.no_id + '"><button class="default">자세히</button></a>';
            html +=         '<button class="js-button-remove default remove">삭제</button>';
            html +=     '</td>';
            html += '</tr>';
        }

        tbodyNoticeList.innerHTML = html;

        tbodyNoticeList.querySelectorAll('.js-button-remove').forEach((buttonRemove) => {
            buttonRemove.addEventListener('click', function() {
                let noId = this.parentElement.parentElement.getAttribute('noId');
                removeNotice(noId);
            });
        });
    });
}


function removeNotice(noId) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    fetch('/webapi/notice/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noId: noId })
    })
    .then((data) => { return data.json(); })
    .then((response) => {
        if (response.status != 'OK') {
            alert('에러가 발생했습니다.');
            return;
        }

        alert('공지사항이 삭제되었습니다.');
        tbodyNoticeList.querySelector('.js-tr-notice[noId="' + noId + '"]').remove();
    });
}


function saveNotice(mode, callback) {
    let title = inputTitle.value.trim();
    let contents = textareaContents.value.trim();

    fetch('/webapi/notice/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            mode: mode,
            title: title,
            contents: contents,
            noId: (mode === 'MODIFY') ? inputHiddenNoId.value : ''
        })
    })
    .then(function(data) { return data.json(); })
    .then(function(response) {
        if (response.status != 'OK') {
            alert('에러가 발생했습니다.');
            removeSpinner('SAVE_NOTICE');
            removeOverlay('SAVE_NOTICE');
            return;
        }

        callback(response);
    });
}


function getNotice(noId) {
    fetch('/webapi/notice/get?noId=' + noId)
    .then((data) => { return data.json(); })
    .then((response) => {
        if (response.status != 'OK') {
            alert('에러가 발생했습니다.');
            return;
        }

        let notice = response.result;
        inputTitle.value = notice.no_title;
        textareaContents.value = notice.no_contents;
    });
}


function initNotice() {
    if (menu == 'notice') {
        getNoticeList();
    } else if (menu == 'notice_detail') {
        getNotice(inputHiddenNoId.value);
    }

    if (buttonCancel) {
        buttonCancel.addEventListener('click', () => {
            location.href = '/notice';
        });
    }

    if (buttonNoticeAdd) {
        buttonNoticeAdd.addEventListener('click', () => {
            createOverlay(999, 'SAVE_NOTICE');
            createSpinner(999, 'SAVE_NOTICE');
            saveNotice('ADD', (response) => {
                alert('공지사항이 추가되었습니다.');
                location.href = '/notice';
            });
        });
    }

    if (buttonNoticeSave) {
        buttonNoticeSave.addEventListener('click', () => {
            createOverlay(999, 'SAVE_NOTICE');
            createSpinner(999, 'SAVE_NOTICE');
            saveNotice('MODIFY', (response) => {
                alert('공지사항이 수정되었습니다.');
                location.reload();
            });
        });
    }
}
initNotice();
