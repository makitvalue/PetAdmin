
const menu = document.querySelector('.js-input-hidden-menu').value;
const navSideMenu = document.querySelector('.js-nav-side-menu');
const divMobileMenu = document.querySelector('.js-div-mobile-menu');
const selectBodyPart = document.querySelector('.js-select-bodypart');
const divKeywordList = document.querySelector('.js-div-keyword-list');
const divKeywordAdd = document.querySelector('.js-div-keyword-add');
const inputKeywordAdd = document.querySelector('.js-input-keyword-add');
const buttonKeywordAdd = document.querySelector('.js-button-keyword-add');


function noneToDash(value) {
    if (isNone(value)) return '-';
    else return value;
}


function isNone(value) {
    if (typeof value === 'undefined' || value === null || value === '') return true;
    return false;
}


function idToBodyPart(bpId) {
    return bodyParts[bpId];
}


// 이미지 인풋 onchange 처리 함수
function changeInputImage(event, callback) {
    var files = event.target.files;
    var file_list = Array.prototype.slice.call(files);

    // 취소
    if (file_list.length == 0) {
        callback('canceled', null);
    }

    file_list.forEach(function(file) {
        if (!file.type.match('image.*')) {
            alert('이미지 파일만 업로드할 수 있습니다.');
            return;
        }

        if (file.size > 3000000) {
            alert('최대 3MB 크기의 이미지 파일을 업로드할 수 있습니다.');
            return;
        }

        var reader = new FileReader();
        reader.onload = function(e) { callback(null, e.target.result); };
        reader.readAsDataURL(file);
    });
}


function effectToString(effect) {
    if (effect == 'POSITIVE') {
        return '긍정적';
    } else if (effect == 'NEGATIVE') {
        return '부정적';
    } else {
        return '효과없음';
    }
}


function uploadImage(formData, callback) {
    fetch('/webapi/upload/image', {
        method: 'POST',
        body: formData
    })
    .then(data => data.json())
    .then((response) => {
        callback(response);
    });
}


function removeImage(deleteImageList, callback) {
    console.log(deleteImageList);
    fetch('/webapi/delete/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleteList: deleteImageList })
    })
    .then(data => data.json())
    .then((response) => {
        callback(response);
    });
}


function toggleSideMenu() {
    if (navSideMenu.classList.contains('mobile')) {
        document.querySelector('.js-div-overlay[key="SIDE_MENU"]').remove();
        navSideMenu.classList.remove('mobile');
    } else {
        let html = '<div class="js-div-overlay overlay" onclick="toggleSideMenu()" key="SIDE_MENU" style="z-index: 997;"></div>';
        document.querySelector('body').insertAdjacentHTML('beforeend', html);
        navSideMenu.classList.add('mobile');
    }
}

function createOverlay(zIndex, key) {
    let html = '<div class="js-div-overlay overlay" key="' + key + '" style="z-index: ' + zIndex + '"></div>';
    document.querySelector('body').insertAdjacentHTML('beforeend', html);
}
function removeOverlay(key) {
    document.querySelector('.js-div-overlay[key="' + key + '"]').remove();
}
function createSpinner(zIndex, key) {
    let html = '<div class="js-div-spinner spinner" style="z-index: ' + zIndex + '" key="' + key + '"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';
    document.querySelector('body').insertAdjacentHTML('beforeend', html);
}
function removeSpinner(key) {
    document.querySelector('.js-div-spinner[key="' + key + '"]').remove();
}


function checkNumber(event) {
    this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
}


function initCommon() {

    divMobileMenu.addEventListener('click', toggleSideMenu);

    window.addEventListener('resize', function() {
        let width = document.body.clientWidth;
        
        if (width > 1024) {
            if (navSideMenu.classList.contains('mobile')) {
                document.querySelector('.js-div-overlay[key="SIDE_MENU"]').remove();
                navSideMenu.classList.remove('mobile');
            }
        }
    });

    if (selectBodyPart) {
        let html = '';
        for (let key in bodyParts) {
            let value = bodyParts[key];
            html += '<option value="' + key + '" ' + ((key == 0) ? 'selected' : '') + '>' + value + '(' + key + ')</option>';
        }
        selectBodyPart.innerHTML = html;
    }

    if (buttonKeywordAdd) {
        buttonKeywordAdd.addEventListener('click', () => {
            let keyword = inputKeywordAdd.value.trim();
    
            if (keyword === '') {
                alert('키워드를 입력해주세요.');
                return;
            }
            
            let html = '<button class="js-button-keyword default keyword">' + keyword + '</button>';
            divKeywordAdd.insertAdjacentHTML('beforebegin', html);
    
            inputKeywordAdd.value = '';
    
            let buttonKeywordList = divKeywordList.querySelectorAll('.js-button-keyword');
            let buttonKeyword = buttonKeywordList[buttonKeywordList.length - 1];
    
            buttonKeyword.addEventListener('click', function() {
                this.remove();
            });
        });
    }
}
initCommon();
