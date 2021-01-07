
const tbodyFoodNutrientCategoryList = document.querySelector('.js-tbody-food-nutrient-category-list');
const buttonFoodNutrientCategoryAdd = document.querySelector('.js-button-food-nutrient-category-add');


function getFoodNutrientCategoryList() {
    fetch('/webapi/food/nutrient/category/get/all')
    .then((data) => { return data.json(); })
    .then((response) => {
        if (response.status != 'OK') {
            alert('에러가 발생했습니다.');
            return;
        }
        
        let foodNutrientCategoryList = response.result;
        let html = '';
        for (let i = 0; i < foodNutrientCategoryList.length; i++) {
            let foodNutrientCategory = foodNutrientCategoryList[i];
            html += '<tr class="js-tr-food-nutrient-category" fncId="' + foodNutrientCategory.fnc_id + '">';
            html +=     '<td>' + foodNutrientCategory.fnc_id + '</td>';
            html +=     '<td class="js-td-name">' + foodNutrientCategory.fnc_name + '</td>';
            html +=     '<td class="buttons">';
            html +=         '<button class="js-button-modify default">수정</button>';
            html +=         '<button class="js-button-remove default remove">삭제</button>';
            html +=     '</td>';
            html += '</tr>';
        }

        tbodyFoodNutrientCategoryList.innerHTML = html;
        tbodyFoodNutrientCategoryList.querySelectorAll('.js-button-remove').forEach((buttonRemove) => {
            buttonRemove.addEventListener('click', function() {
                let fncId = this.parentElement.parentElement.getAttribute('fncId');
                removeFoodNutrientCategory(fncId);
            });
        });
        tbodyFoodNutrientCategoryList.querySelectorAll('.js-button-modify').forEach((buttonModify) => {
            buttonModify.addEventListener('click', function() {
                let origin_name = this.parentElement.parentElement.querySelector('.js-td-name').innerText;
                let value = prompt('카테고리 이름 변경', origin_name);
                if (!value) return;
                let name = value.trim();
                if (name == '') {
                    alert('카테고리 이름을 입력해주세요.');
                    return;
                }

                if (origin_name === name) return;

                let fncId = this.parentElement.parentElement.getAttribute('fncId');

                saveFoodNutrientCategory('MODIFY', fncId, name, (response) => {
                    alert('카테고리가 수정되었습니다.');
                    location.reload();
                });
            });
        });
    });
}


function removeFoodNutrientCategory(fncId) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    fetch('/webapi/food/nutrient/category/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fncId: fncId })
    })
    .then((data) => { return data.json(); })
    .then((response) => {
        if (response.status != 'OK') {
            if (response.status == 'ERR_EXISTS_NUTRIENT') {
                alert('연관된 영양소 데이터가 존재합니다.');
            } else if (response.status == 'ERR_EXISTS_FOOD') {
                alert('연관된 음식 데이터가 존재합니다.');
            } else {
                alert('에러가 발생했습니다.');
            }
            return;
        }

        alert('카테고리가 삭제되었습니다.');
        tbodyFoodNutrientCategoryList.querySelector('.js-tr-food-nutrient-category[fncId="' + fncId + '"]').remove();
    });
}


function saveFoodNutrientCategory(mode, fncId, name, callback) {
    fetch('/webapi/food/nutrient/category/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            mode: mode,
            name: name,
            fncId: fncId
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


function initFoodNutrientCategory () {
    getFoodNutrientCategoryList();

    if (buttonFoodNutrientCategoryAdd) {
        buttonFoodNutrientCategoryAdd.addEventListener('click', () => {
            let value = prompt('카테고리 이름을 입력해주세요.').trim();
            if (!value) return;
            let name = value.trim();
            if (name == '') {
                alert('카테고리 이름을 입력해주세요.');
                return;
            }

            saveFoodNutrientCategory('ADD', null, name, (response) => {
                alert('카테고리가 추가되었습니다.');
                location.reload();
            });
        });
    }
}
initFoodNutrientCategory();
