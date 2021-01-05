
const tbodyNutrientList = document.querySelector('.js-tbody-nutrient-list');
const inputName = document.querySelector('.js-input-name');
const selectEffect = document.querySelector('.js-select-effect');
const textareaDesc = document.querySelector('.js-textarea-desc');
const textareaDescOver = document.querySelector('.js-textarea-desc-over');
const buttonCancel = document.querySelector('.js-button-cancel');
const buttonNutrientAdd = document.querySelector('.js-button-nutrient-add');
const buttonNutrientSave = document.querySelector('.js-button-nutrient-save');
const inputHiddenNId = document.querySelector('.js-input-hidden-n-id');


function getNutrientList() {
    fetch('/webapi/nutrient/get/all')
    .then((data) => { return data.json(); })
    .then((response) => {

        if (response.status != 'OK') {
            alert('에러가 발생했습니다.');
            return;
        }

        let nutrientList = response.result;
        let html = '';
        for (let i = 0; i < nutrientList.length; i++) {
            let nutrient = nutrientList[i];
            html += '<tr class="js-tr-nutrient" nId="' + nutrient.n_id + '">';
            html +=     '<td>' + nutrient.n_id + '</td>';
            html +=     '<td>' + nutrient.n_name + '</td>';
            html +=     '<td>' + effectToString(nutrient.n_effect) + '</td>';
            html +=     '<td class="buttons">';
            html +=         '<a href="/nutrient/detail/' + nutrient.n_id + '"><button class="default">자세히</button></a>';
            html +=         '<button class="js-button-remove default remove">삭제</button>';
            html +=     '</td>';
            html += '</tr>';
        }

        tbodyNutrientList.innerHTML = html;

        tbodyNutrientList.querySelectorAll('.js-button-remove').forEach((buttonRemove) => {
            buttonRemove.addEventListener('click', function() {
                let nId = this.parentElement.parentElement.getAttribute('nId');
                removeNutrient(nId);
            });
        });
    });
}


function removeNutrient(nId) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    fetch('/webapi/nutrient/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nId: nId })
    })
    .then((data) => { return data.json(); })
    .then((response) => {
        if (response.status != 'OK') {
            if (response.status == 'ERR_EXISTS_FOOD') {
                alert('연관된 음식 데이터가 존재합니다.');
            } else if (response.status == 'ERR_EXISTS_SYMPTOM') {
                alert('연관된 증상 데이터가 존재합니다.');
            } else if (response.status == 'ERR_EXISTS_PRODUCT') {
                alert('연관된 제품 데이터가 존재합니다.');
            } else if (response.status == 'ERR_EXISTS_DISEASE') {
                alert('연관된 질병 데이터가 존재합니다.');
            } else {
                alert('에러가 발생했습니다.');
            }
            return;
        }

        alert('영양소가 삭제되었습니다.');
        tbodyNutrientList.querySelector('.js-tr-nutrient[nId="' + nId + '"]').remove();
    });
}


function getNutrient(nId) {
    fetch('/webapi/nutrient/get?nId=' + nId)
    .then((data) => { return data.json(); })
    .then((response) => {
        if (response.status != 'OK') {
            alert('에러가 발생했습니다.');
            return;
        }

        let nutrient = response.result;

        inputName.value = nutrient.n_name;
        selectEffect.value = nutrient.n_effect;
        textareaDesc.value = nutrient.n_desc;
        textareaDescOver.value = nutrient.n_desc_over;

        let keywordList = nutrient.n_keyword.split('|');

        let html = '';
        for (let i = 0; i < keywordList.length; i++) {
            if (keywordList[i] === '') continue;
            html += '<button class="js-button-keyword default keyword">' + keywordList[i] + '</button>';
        }
        divKeywordAdd.insertAdjacentHTML('beforebegin', html);

        divKeywordList.querySelectorAll('.js-button-keyword').forEach((buttonKeyword) => {
            buttonKeyword.addEventListener('click', function() {
                this.remove();
            });
        });
    });
}


function saveNutrient(mode, callback) {
    let name = inputName.value.trim();
    let effect = selectEffect.value;
    let desc = textareaDesc.value.trim();
    let descOver = textareaDescOver.value.trim();

    if (name === '') {
        alert('영양소 이름을 입력해주세요.');
        return;
    }

    let keywordList = [];
    divKeywordList.querySelectorAll('.js-button-keyword').forEach((buttonKeyword) => {
        keywordList.push(buttonKeyword.innerText);
    });

    if (keywordList.length == 0) {
        alert('영양소 검색어 키워드를 입력해주세요.');
        return;
    } 

    let keyword = keywordList.join('|');

    fetch('/webapi/nutrient/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            mode: mode,
            name: name,
            effect: effect,
            desc: desc,
            descOver: descOver,
            keyword: keyword,
            nId: (mode === 'MODIFY') ? inputHiddenNId.value : ''
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


function initNutrient() {
    
    if (menu == 'nutrient') {
        getNutrientList();
    } else if (menu == 'nutrient_detail') {
        getNutrient(inputHiddenNId.value);
    }

    if (buttonCancel) {
        buttonCancel.addEventListener('click', () => {
            location.href = '/nutrient';
        });
    }
    
    if (buttonNutrientAdd) {
        buttonNutrientAdd.addEventListener('click', () => {
            saveNutrient('ADD', (response) => {
                alert('영양소가 추가되었습니다.');
                location.href = '/nutrient';
            });
        });
    }

    if (buttonNutrientSave) {
        buttonNutrientSave.addEventListener('click', () => {
            saveNutrient('MODIFY', (response) => {
                alert('영양소가 수정되었습니다.');
            });
        });
    }
}
initNutrient();
