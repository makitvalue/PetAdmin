
const tbodyFoodList = document.querySelector('.js-tbody-food-list');
const tbodyFoodCategoryList = document.querySelector('.js-tbody-food-category-list');
const divThumbnail = document.querySelector('.js-div-thumbnail');
const inputThumbnail = document.querySelector('.js-input-thumbnail');
const inputName = document.querySelector('.js-input-name');
const textareaDesc = document.querySelector('.js-textarea-desc');
const buttonCancel = document.querySelector('.js-button-cancel');
const buttonFoodAdd = document.querySelector('.js-button-food-add');
const buttonFoodCategoryAdd = document.querySelector('.js-button-food-category-add');
const buttonFoodSave = document.querySelector('.js-button-food-save');
const inputHiddenFId = document.querySelector('.js-input-hidden-f-id');
const divNutrientList = document.querySelector('.js-div-nutrient-list');
const buttonNutrientAdd = document.querySelector('.js-button-nutrient-add');
// const selectCategory = document.querySelector('.js-select-category');
const selectEdible = document.querySelector('.js-select-edible');
const selectCategory1 = document.querySelector('.js-select-category1');
const selectCategory2 = document.querySelector('.js-select-category2');
const inputHiddenFoodCategoryData = document.querySelector('.js-input-hidden-food-category-data');
let category2List = [];


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
            html +=     '<td><div class="thumbnail" style="background-image: url(' + food.f_thumbnail + '), url(/img/no_image.png)"></div></td>';
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
        // selectCategory.value = food.f_fnc_id;
        selectEdible.value = food.f_edible;
        selectCategory1.value = food.f_fc1_id;
        selectCategory2.value = food.f_fc2_id;

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

        divThumbnail.style.backgroundImage = 'url(' + ((food.f_thumbnail) ? food.f_thumbnail : '') + ')';
        divThumbnail.setAttribute("original", ((food.f_thumbnail) ? food.f_thumbnail : ''));

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

        setFoodCategory2(food.f_fc1_id, food.f_fc2_id);
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
        removeSpinner('SAVE_FOOD');
        removeOverlay('SAVE_FOOD');
        return;
    }

    let keywordList = [];
    divKeywordList.querySelectorAll('.js-button-keyword').forEach((buttonKeyword) => {
        keywordList.push(buttonKeyword.innerText);
    });

    let reName = removeSpace(name, '');
    if (!keywordList.includes(name)) {
        keywordList.push(name);
    }
    if (!keywordList.includes(reName)) {
        keywordList.push(reName);
    }

    // if (keywordList.length == 0) {
    //     alert('음식 검색어 키워드를 입력해주세요.');
    //     removeSpinner('SAVE_FOOD');
    //     removeOverlay('SAVE_FOOD');
    //     return;
    // } 

    let keyword = keywordList.join('|');

    let fc1Id = selectCategory1.value;
    let fc2Id = selectCategory2.value;

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
            // fncId: selectCategory.value,
            fc1Id: fc1Id,
            fc2Id: fc2Id,
            edible: selectEdible.value,
            fId: (mode === 'MODIFY') ? inputHiddenFId.value : ''
        })
    })
    .then(function(data) { return data.json(); })
    .then(function(response) {
        if (response.status != 'OK') {
            alert('에러가 발생했습니다.');
            removeSpinner('SAVE_FOOD');
            removeOverlay('SAVE_FOOD');
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


function getFoodCategory1List(callback) {
    fetch('/webapi/food/category1/get/all')
    .then((data) => { return data.json(); })
    .then((response) => {
        if (response.status != 'OK') {
            alert('에러가 발생했습니다.');
            return;
        }
        callback(response);
    });
}


function saveFoodCategory1(mode, fc1Id, name, callback) {
    fetch('/webapi/food/category1/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            mode: mode,
            name: name,
            fc1Id: fc1Id
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


function saveFoodCategory2(mode, fc1Id, fc2Id, name, callback) {
    fetch('/webapi/food/category2/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            mode: mode,
            name: name,
            fc1Id: fc1Id,
            fc2Id: fc2Id
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


function removeFoodCategory1(fc1Id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    fetch('/webapi/food/category1/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fc1Id: fc1Id })
    })
    .then((data) => { return data.json(); })
    .then((response) => {
        if (response.status != 'OK') {
            if (response.status == 'ERR_EXISTS_CATEGORY2') {
                alert('연관된 하위 카테고리 데이터가 존재합니다.');
            } else if (response.status == 'ERR_EXISTS_FOOD') {
                alert('연관된 음식 데이터가 존재합니다.');
            } else {
                alert('에러가 발생했습니다.');
            }
            return;
        }

        alert('상위 카테고리가 삭제되었습니다.');
        location.reload();
        // tbodyProductBrandList.querySelector('.js-tr-food-category1[fc1Id="' + fc1Id + '"]').remove();
    });
}


function removeFoodCategory2(fc2Id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    fetch('/webapi/food/category2/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fc2Id: fc2Id })
    })
    .then((data) => { return data.json(); })
    .then((response) => {
        if (response.status != 'OK') {
            if (response.status == 'ERR_EXISTS_FOOD') {
                alert('연관된 음식 데이터가 존재합니다.');
            } else {
                alert('에러가 발생했습니다.');
            }
            return;
        }

        alert('하위 카테고리가 삭제되었습니다.');
        location.reload();
        // tbodyProductBrandList.querySelector('.js-tr-food-category1[fc1Id="' + fc1Id + '"]').remove();
    });
}


function setFoodCategory2(fc1Id, fc2Id) {
    for (let i = 0; i < category2List.length; i++) {
        let ct = category2List[i];
        if (ct.fc1Id == fc1Id) {
            let html = '';
            for (let j = 0; j < ct.fc2List.length; j++) {
                let fc2 = ct.fc2List[j];
                if (fc2.fc2Id == fc2Id) {
                    html += '<option value="' + fc2.fc2Id + '" selected>' + fc2.fc2Name + '</option>';
                } else {
                    html += '<option value="' + fc2.fc2Id + '">' + fc2.fc2Name + '</option>';
                }
            }
            selectCategory2.innerHTML = html;
            break;
        }
    }
}


function foodInit() {
    if (menu == 'food') {
        getFoodList();
    } else if (menu == 'food_detail') {
        getFood(inputHiddenFId.value);
    } else if (menu == 'food_category') {
        getFoodCategory1List((response) => {

            if (response.status != 'OK') {
                alert('에러가 발생했습니다.');
                return;
            }

            let foodCategory1List = response.result;
            let html = '';
            for (let i = 0; i < foodCategory1List.length; i++) {
                let foodCategory1 = foodCategory1List[i];
                html += '<tr class="js-tr-food-category1" fc1Id="' + foodCategory1.fc1_id + '">';
                html +=     '<td>' + foodCategory1.fc1_id + '</td>';
                html +=     '<td class="js-td-name">' + foodCategory1.fc1_name + '</td>';

                let fc2Info = foodCategory1.fc2_info;
                let fc2Html = '';
                if (fc2Info) {
                    for (let j = 0; j < fc2Info.split('|').length; j++) {
                        let fc2Str = fc2Info.split('|')[j];
                        let fc2Id = fc2Str.split(':')[0];
                        let fc2Name = fc2Str.split(':')[1];
                        fc2Html += '<button class="js-button-food-category2 default" fc2Id="' + fc2Id + '">' + fc2Name + '</button>';
                    }
                }
                
                html +=     '<td class="food-category2">' + fc2Html + '</td>';
                html +=     '<td class="buttons">';
                html +=         '<button class="js-button-add default">하위 카테고리 추가</button>';
                html +=         '<button class="js-button-modify default">수정</button>';
                html +=         '<button class="js-button-remove default remove">삭제</button>';
                html +=     '</td>';
                html += '</tr>';
            }

            tbodyFoodCategoryList.innerHTML = html;
            tbodyFoodCategoryList.querySelectorAll('.js-button-remove').forEach((buttonRemove) => {
                buttonRemove.addEventListener('click', function() {
                    let fc1Id = this.parentElement.parentElement.getAttribute('fc1Id');
                    removeFoodCategory1(fc1Id);
                });
            });
            tbodyFoodCategoryList.querySelectorAll('.js-button-modify').forEach((buttonModify) => {
                buttonModify.addEventListener('click', function() {
                    let origin_name = this.parentElement.parentElement.querySelector('.js-td-name').innerText;
                    let value = prompt('상위 카테고리 이름 변경', origin_name);
                    if (!value) return;
                    let name = value.trim();
                    if (name == '') {
                        alert('상위 카테고리 이름을 입력해주세요.');
                        return;
                    }

                    if (origin_name === name) return;

                    let fc1Id = this.parentElement.parentElement.getAttribute('fc1Id');

                    saveFoodCategory1('MODIFY', fc1Id, name, (response) => {
                        alert('음식 상위 카테고리 이름이 수정되었습니다.');
                        location.reload();
                    });
                });
            });
            tbodyFoodCategoryList.querySelectorAll('.js-button-add').forEach((buttonnAdd) => {
                buttonnAdd.addEventListener('click', function() {
                    let value = prompt('하위 카테고리 추가');
                    if (!value) return;
                    let name = value.trim();
                    if (name == '') {
                        alert('하위 카테고리 이름을 입력해주세요.');
                        return;
                    }

                    let fc1Id = this.parentElement.parentElement.getAttribute('fc1Id');

                    saveFoodCategory2('ADD', fc1Id, null, name, (response) => {
                        alert('하위 카테고리가 추가되었습니다.');
                        location.reload();
                    });
                });
            });
            tbodyFoodCategoryList.querySelectorAll('.js-tr-food-category1').forEach((trFoodCategory1) => {
                // let fc1Id = trFoodCategory1.getAttribute('fc1Id');
                trFoodCategory1.querySelectorAll('.js-button-food-category2').forEach((buttonFoodCategory2) => {
                    buttonFoodCategory2.addEventListener('click', function() {

                        let fc2Id = this.getAttribute('fc2Id');

                        if (confirm('하위 카테고리를 삭제하시겠습니까?')) {
                            removeFoodCategory2(fc2Id);
                        } else {
                            let origin_name = this.innerText;
                            let value = prompt('하위 카테고리 이름 변경', origin_name);
                            if (!value) return;
                            let name = value.trim();
                            if (name == '') {
                                alert('하위 카테고리 이름을 입력해주세요.');
                                return;
                            }

                            if (origin_name === name) return;

                            saveFoodCategory2('MODIFY', null, fc2Id, name, (response) => {
                                alert('음식 하위 카테고리 이름이 수정되었습니다.');
                                location.reload();
                            });
                        }
                    });
                });
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
            createOverlay(999, 'SAVE_FOOD');
            createSpinner(999, 'SAVE_FOOD');
            saveFood('ADD', (response) => {
                let fId = response.fId;

                if (inputThumbnail.value) { // 이미지가 업로드 되었다면
                    let form = inputThumbnail.parentElement;
                    let formData = new FormData(form);
                    formData.append('type', 'THUMB');
                    formData.append('dataType', 'food');
                    formData.append('targetId', fId);

                    uploadImage(formData, (response) => {
                        if (response.status != 'OK') {
                            alert("에러가 발생했습니다.");
                            removeSpinner('SAVE_FOOD');
                            removeOverlay('SAVE_FOOD');
                            return;
                        }

                        alert('음식이 추가되었습니다.');
                        location.href = '/food';
                    });
                } else {
                    alert('음식이 추가되었습니다.');
                    location.href = '/food';
                }
            });
        });
    }

    if (buttonFoodSave) {
        buttonFoodSave.addEventListener('click', () => {
            createOverlay(999, 'SAVE_FOOD');
            createSpinner(999, 'SAVE_FOOD');
            saveFood('MODIFY', (response) => {
                if (inputThumbnail.value) { // 이미지가 업로드 되었다면 (수정되었다면)
                    let form = inputThumbnail.parentElement;
                    let formData = new FormData(form);
                    formData.append('type', 'THUMB');
                    formData.append('dataType', 'food');
                    formData.append('targetId', inputHiddenFId.value);
    
                    uploadImage(formData, (response) => {
                        if (response.status != 'OK') {
                            alert("에러가 발생했습니다.");
                            removeSpinner('SAVE_FOOD');
                            removeOverlay('SAVE_FOOD');
                            return;
                        }

                        let originalUrl = divThumbnail.getAttribute('original');
                        if (originalUrl) {
                            // 수정되었기때문에 기존 이미지 지워줄거임
                            let deleteImageList = [];
                            deleteImageList.push({ type: "THUMB", path: originalUrl });
                            removeImage(deleteImageList, (response) => {
                                if (response.status != 'OK') {
                                    alert("에러가 발생했습니다.");
                                    removeSpinner('SAVE_FOOD');
                                    removeOverlay('SAVE_FOOD');
                                    return;
                                }

                                alert('음식이 수정되었습니다.');
                                location.reload();
                            });
                        } else {
                            alert('음식이 수정되었습니다.');
                            location.reload();
                        }
                    });
                } else {
                    alert('음식이 수정되었습니다.');
                    location.reload();
                }
            });
        });
    }

    if (buttonNutrientAdd) {
        buttonNutrientAdd.addEventListener('click', () => {
            document.querySelector('body').insertAdjacentHTML('beforeend', '<div class="js-div-overlay overlay" key="DIALOG_SEARCH_RELATIONSHIP" style="z-index: 999;"></div>');

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
            // html +=                     '<th>효과</th>';
            html +=                 '</tr>';
            html +=             '</thead>';
            html +=             '<tbody class="js-tbody-nutrient-list"></tbody>';
            html +=         '</table>';
            html +=     '</div>';
            html += '</div>';
            document.querySelector('body').insertAdjacentHTML('beforeend', html);

            let iClose = document.querySelector('.js-div-dialog-search-relationship .js-i-close');
            iClose.addEventListener('click', () => {
                document.querySelector('.js-div-overlay[key="DIALOG_SEARCH_RELATIONSHIP"]').remove();
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
                    // html +=     '<td>' + effectToString(nutrient.n_effect) + '</td>';
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

    if (divThumbnail) {
        divThumbnail.addEventListener('click', () => {
            inputThumbnail.click();
        });

        inputThumbnail.addEventListener('change', (event) => {
            changeInputImage(event, (error, result) => {
                if (error) {
                    divThumbnail.style.backgroundImage = 'url(' + divThumbnail.getAttribute('original') + ')';
                    return;
                }
                divThumbnail.style.backgroundImage = 'url(' + result + ')';
            });
        });
    }

    if (buttonFoodCategoryAdd) {
        buttonFoodCategoryAdd.addEventListener('click', () => {
            let value = prompt('상위 카테고리 추가');
            if (!value) return;
            let name = value.trim();
            if (name == '') {
                alert('상위 카테고리 이름을 입력해주세요.');
                return;
            }

            saveFoodCategory1('ADD', null, name, (response) => {
                alert('상위 카테고리가 추가되었습니다.');
                location.reload();
            });
        });
    }

    if (selectCategory1) {
        selectCategory1.addEventListener('change', function() {
            setFoodCategory2(this.value, null);
        });
    }

    if (inputHiddenFoodCategoryData) {
        category2List = JSON.parse(inputHiddenFoodCategoryData.value);

        // selectCategory2 세팅
        if (selectCategory2) {
            if (category2List.length > 0) {
                setFoodCategory2(category2List[0].fc1Id, null);
            }
        }
    }
}
foodInit();
