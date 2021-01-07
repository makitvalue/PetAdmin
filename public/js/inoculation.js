
const tbodyInoculationList = document.querySelector('.js-tbody-inoculation-list');
const buttonInoculationAdd = document.querySelector('.js-button-inoculation-add');


function getInoculationList() {
    fetch('/webapi/inoculation/get/all')
    .then((data) => { return data.json(); })
    .then((response) => {
        if (response.status != 'OK') {
            alert('에러가 발생했습니다.');
            return;
        }
        
        let inoculationList = response.result;
        let html = '';
        for (let i = 0; i < inoculationList.length; i++) {
            let inoculation = inoculationList[i];
            html += '<tr class="js-tr-inoculation" inId="' + inoculation.in_id + '">';
            html +=     '<td>' + inoculation.in_id + '</td>';
            html +=     '<td class="js-td-name">' + inoculation.in_name + '</td>';
            html +=     '<td class="buttons">';
            html +=         '<button class="js-button-modify default">수정</button>';
            html +=         '<button class="js-button-remove default remove">삭제</button>';
            html +=     '</td>';
            html += '</tr>';
        }

        tbodyInoculationList.innerHTML = html;
        tbodyInoculationList.querySelectorAll('.js-button-remove').forEach((buttonRemove) => {
            buttonRemove.addEventListener('click', function() {
                let inId = this.parentElement.parentElement.getAttribute('inId');
                removeInoculation(inId);
            });
        });
        tbodyInoculationList.querySelectorAll('.js-button-modify').forEach((buttonModify) => {
            buttonModify.addEventListener('click', function() {
                let origin_name = this.parentElement.parentElement.querySelector('.js-td-name').innerText;
                let value = prompt('접종 이름 변경', origin_name);
                if (!value) return;
                let name = value.trim();
                if (name == '') {
                    alert('접종 이름을 입력해주세요.');
                    return;
                }

                if (origin_name === name) return;

                let inId = this.parentElement.parentElement.getAttribute('inId');

                saveInoculation('MODIFY', inId, name, (response) => {
                    alert('접종이 수정되었습니다.');
                    location.reload();
                });
            });
        });
    });
}


function removeInoculation(inId) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    fetch('/webapi/inoculation/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inId: inId })
    })
    .then((data) => { return data.json(); })
    .then((response) => {
        if (response.status != 'OK') {
            if (response.status == 'ERR_EXISTS_PET') {
                alert('연관된 펫 데이터가 존재합니다.');
            } else {
                alert('에러가 발생했습니다.');
            }
            return;
        }

        alert('접종이 삭제되었습니다.');
        tbodyInoculationList.querySelector('.js-tr-inoculation[inId="' + inId + '"]').remove();
    });
}


function saveInoculation(mode, inId, name, callback) {
    fetch('/webapi/inoculation/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            mode: mode,
            name: name,
            inId: inId
        })
    })
    .then(function(data) { return data.json(); })
    .then(function(response) {
        if (response.status != 'OK') {
            alert('에러가 발생했습니다.');
            return;
        }
        callback(response);
    });
}


function initInoculation () {
    getInoculationList();

    if (buttonInoculationAdd) {
        buttonInoculationAdd.addEventListener('click', () => {
            let value = prompt('접종 이름을 입력해주세요.').trim();
            if (!value) return;
            let name = value.trim();
            if (name == '') {
                alert('접종 이름을 입력해주세요.');
                return;
            }

            saveInoculation('ADD', null, name, (response) => {
                alert('접종이 추가되었습니다.');
                location.reload();
            });
        });
    }
}
initInoculation();
