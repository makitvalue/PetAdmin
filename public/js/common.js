const navSideMenu = document.querySelector('.js-nav-side-menu');
const divMobileMenu = document.querySelector('.js-div-mobile-menu');
const selectBodyPart = document.querySelector('.js-select-bodypart');


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

        if (file.size > 2000000) {
            alert('최대 2MB 크기의 이미지 파일을 업로드할 수 있습니다.');
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
}
initCommon();
