const menu = document.querySelector('.js-input-hidden-menu').value;
const tbodyFoodList = document.querySelector('.js-tbody-food-list');
const inputName = document.querySelector('.js-input-name');
const textareaDesc = document.querySelector('.js-textarea-desc');
const divKeywordList = document.querySelector('.js-div-keyword-list');
const divKeywordAdd = document.querySelector('.js-div-keyword-add');
const inputKeywordAdd = document.querySelector('.js-input-keyword-add');
const buttonKeywordAdd = document.querySelector('.js-button-keyword-add');
const buttonCancel = document.querySelector('.js-button-cancel');
const buttonFoodAdd = document.querySelector('.js-button-food-add');
const buttonFoodSave = document.querySelector('.js-button-food-save');
const inputHiddenFId = document.querySelector('.js-input-hidden-f-id');
const divNutrientList = document.querySelector('.js-div-nutrient-list');
const buttonNutrientAdd = document.querySelector('.js-button-nutrient-add');


function getFoodList() {
    fetch('/webapi/food/get/all')
    .then((data) => { return data.json(); })
    .then((response) => {

        if (response.status != 'OK') {
            alert('에러가 발생했습니다.');
            return;
        }

        let foodList = response.result;
        let html = '';
        for (let i = 0; i < foodList.length; i++) {
            let food = foodList[i];
            html += '<tr class="js-tr-food" fId="' + food.f_id + '">';
            html +=     '<td>' + food.f_id + '</td>';
            html +=     '<td>' + food.f_name + '</td>';
            html +=     '<td>' + food.f_thumbnail + '</td>';
            html +=     '<td>' + noneToDash(food.f_desc) + '</td>';
            html +=     '<td class="buttons">';
            html +=         '<a href="/food/detail/' + food.f_id + '"><button class="default">자세히</button></a>';
            html +=         '<button class="js-button-remove default remove">삭제</button>';
            html +=     '</td>';
            html += '</tr>';
        }

        tbodyFoodList.innerHTML = html;

        tbodyFoodList.querySelectorAll('.js-button-remove').forEach((buttonRemove) => {
            buttonRemove.addEventListener('click', function() {
                let fId = this.parentElement.parentElement.getAttribute('fId');
                removeFood(fId);
            });
        });
    });
}


function getFood(fId) {
    fetch('/webapi/food/get?fId=' + fId)
    .then((data) => { return data.json(); })
    .then((response) => {
        if (response.status != 'OK') {
            alert('에러가 발생했습니다.');
            return;
        }

        let food = response.result.food;
        let nutrientList = response.result.nutrientList;

        inputName.value = food.f_name;
        textareaDesc.value = food.f_desc;

        let keywordList = food.f_keyword.split('|');

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

        html = '';
        for (let i = 0; i < nutrientList.length; i++) {
            let nId = nutrientList[i].n_id;
            let nName = nutrientList[i].n_name;
            html += '<button class="js-button-nutrient relationship default" nId="' + nId + '">' + nName + '</button>';
        } 
        buttonNutrientAdd.insertAdjacentHTML('beforebegin', html);

        divNutrientList.querySelectorAll('.js-button-nutrient').forEach((buttonNutrient) => {
            buttonNutrient.addEventListener('click', function() {
                this.remove();
            });
        });
    });
}


function removeFood(fId) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    fetch('/webapi/food/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fId: fId })
    })
    .then((data) => { return data.json(); })
    .then((response) => {
        if (response.status != 'OK') {
            if (response.status == 'ERR_EXISTS_SYMPTOM') {
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

        alert('음식이 삭제되었습니다.');
        tbodyFoodList.querySelector('.js-tr-food[fId="' + fId + '"]').remove();
    });
}


function saveFood(mode, callback) {
    let name = inputName.value.trim();
    let desc = textareaDesc.value.trim();

    if (name === '') {
        alert('음식 이름을 입력해주세요.');
        return;
    }

    let keywordList = [];
    divKeywordList.querySelectorAll('.js-button-keyword').forEach((buttonKeyword) => {
        keywordList.push(buttonKeyword.innerText);
    });

    if (keywordList.length == 0) {
        alert('음식 검색어 키워드를 입력해주세요.');
        return;
    } 

    let keyword = keywordList.join('|');

    let nutrientList = [];
    divNutrientList.querySelectorAll('.js-button-nutrient').forEach((buttonNutrient) => {
        nutrientList.push(buttonNutrient.getAttribute('nId'));
    });

    fetch('/webapi/food/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            mode: mode,
            name: name,
            desc: desc,
            keyword: keyword,
            nutrients: nutrientList,
            fId: (mode === 'MODIFY') ? inputHiddenFId.value : ''
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


function getNutrientList(callback) {
    fetch('/webapi/nutrient/get/all')
    .then((data) => { return data.json(); })
    .then((response) => {
        if (response.status != 'OK') {
            alert('에러가 발생했습니다.');
            return;
        }
        callback(response.result);
    });
}


function foodInit() {
    if (menu == 'food') {
        getFoodList();
    } else if (menu == 'food_detail') {
        getFood(inputHiddenFId.value);
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

    if (buttonCancel) {
        buttonCancel.addEventListener('click', () => {
            location.href = '/food';
        });
    }
    
    if (buttonFoodAdd) {
        buttonFoodAdd.addEventListener('click', () => {
            saveFood('ADD', (response) => {
                alert('음식이 추가되었습니다.');
                location.href = '/food';
            });
        });
    }

    if (buttonFoodSave) {
        buttonFoodSave.addEventListener('click', () => {
            saveFood('MODIFY', (response) => {
                alert('음식이 수정되었습니다.');
            });
        });
    }

    if (buttonNutrientAdd) {
        buttonNutrientAdd.addEventListener('click', () => {
            document.querySelector('body').insertAdjacentHTML('beforeend', '<div class="js-div-overlay overlay"></div>');

            let html = '';
            html += '<div class="js-div-dialog-search-relationship dialog-search-relationship">';
            html +=     '<div class="header">';
            html +=         '<h1 class="title">영양소 검색</h1>';
            html +=         '<i class="js-i-close fal fa-times"></i>';
            html +=     '</div>';
            html +=     '<div class="body">';
            html +=         '<table class="data-list">';
            html +=             '<thead>';
            html +=                 '<tr>';
            html +=                     '<th>ID</th>';
            html +=                     '<th>이름</th>';
            html +=                     '<th>효과</th>';
            html +=                     '<th>설명</th>';
            html +=                     '<th>과다섭취시</th>';
            html +=                 '</tr>';
            html +=             '</thead>';
            html +=             '<tbody class="js-tbody-nutrient-list"></tbody>';
            html +=         '</table>';
            html +=     '</div>';
            html += '</div>';
            document.querySelector('body').insertAdjacentHTML('beforeend', html);

            let iClose = document.querySelector('.js-div-dialog-search-relationship .js-i-close');
            iClose.addEventListener('click', () => {
                document.querySelector('.js-div-overlay').remove();
                document.querySelector('.js-div-dialog-search-relationship').remove();
            });

            getNutrientList((nutrientList) => {
                let selectedNIdList = [];
                divNutrientList.querySelectorAll('.js-button-nutrient').forEach((buttonNutrient) => {
                    selectedNIdList.push(parseInt(buttonNutrient.getAttribute('nId')));
                });

                let tbodyNutrientList = document.querySelector('.js-div-dialog-search-relationship .js-tbody-nutrient-list');

                let html = '';
                for (let i = 0; i < nutrientList.length; i++) {
                    let nutrient = nutrientList[i];
                    html += '<tr class="js-tr-nutrient ' + ((selectedNIdList.indexOf(nutrient.n_id) === -1) ? '': 'selected') + '" nId="' + nutrient.n_id + '" nName="' + nutrient.n_name + '" >';
                    html +=     '<td>' + nutrient.n_id + '</td>';
                    html +=     '<td>' + nutrient.n_name + '</td>';
                    html +=     '<td>' + nutrient.n_effect + '</td>';
                    html +=     '<td>' + noneToDash(nutrient.n_desc) + '</td>';
                    html +=     '<td>' + noneToDash(nutrient.n_desc_over) + '</td>';
                    html += '</tr>';
                }
                tbodyNutrientList.innerHTML = html;

                tbodyNutrientList.querySelectorAll('.js-tr-nutrient').forEach((trNutrient) => {
                    trNutrient.addEventListener('click', function() {
                        let nId = this.getAttribute('nId');

                        if (this.classList.contains('selected')) {
                            this.classList.remove('selected');
                            divNutrientList.querySelector('.js-button-nutrient[nId="' + nId + '"]').remove();
                            
                        } else {
                            this.classList.add('selected');
                            let nName = this.getAttribute('nName');

                            let html = '<button class="js-button-nutrient relationship default" nId="' + nId + '">' + nName + '</button>';
                            buttonNutrientAdd.insertAdjacentHTML('beforebegin', html);
    
                            let buttonNutrientList = divNutrientList.querySelectorAll('.js-button-nutrient');
                            let buttonNutrient = buttonNutrientList[buttonNutrientList.length - 1];
    
                            buttonNutrient.addEventListener('click', function() {
                                this.remove();
                            });
                        }
                    });
                });
            });
        });
    }
}
foodInit();
