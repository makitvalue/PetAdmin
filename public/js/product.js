
const tbodyProductCategoryList = document.querySelector('.js-tbody-product-category-list');
const tbodyProductBrandList = document.querySelector('.js-tbody-product-brand-list');
const divThumbnail = document.querySelector('.js-div-thumbnail');
const inputThumbnail = document.querySelector('.js-input-thumbnail');
const selectCategory = document.querySelector('.js-select-category');
const selectBrand = document.querySelector('.js-select-brand');
const buttonImageAdd = document.querySelector('.js-button-image-add');
const buttonImageDetailAdd = document.querySelector('.js-button-image-detail-add');
const divImageBox = document.querySelector('.js-div-image-box');
const divImageDetailBox = document.querySelector('.js-div-image-detail-box');
const buttonProductCategoryAdd = document.querySelector('.js-button-product-category-add');
const buttonProductBrandAdd = document.querySelector('.js-button-product-brand-add');
const buttonCancel = document.querySelector('.js-button-cancel');
const buttonProductAdd = document.querySelector('.js-button-product-add');
const buttonProductSave = document.querySelector('.js-button-product-save');

const inputHiddenPId = document.querySelector('.js-input-hidden-p-id');
const inputHiddenPcId = document.querySelector('.js-input-hidden-pc-id');
const inputHiddenFnProt = document.querySelector('.js-input-hidden-fn-prot');
const inputHiddenFnFat = document.querySelector('.js-input-hidden-fn-fat');
const inputHiddenFnFibe = document.querySelector('.js-input-hidden-fn-fibe');
const inputHiddenFnAsh = document.querySelector('.js-input-hidden-fn-ash');
const inputHiddenFnCalc = document.querySelector('.js-input-hidden-fn-calc');
const inputHiddenFnPhos = document.querySelector('.js-input-hidden-fn-phos');
const inputHiddenFnMois = document.querySelector('.js-input-hidden-fn-mois');


function saveProduct(mode, callback) {
    let name = inputName.value.trim();

    if (name === '') {
        alert('제품 이름을 입력해주세요.');
        return;
    }

    let keywordList = [];
    divKeywordList.querySelectorAll('.js-button-keyword').forEach((buttonKeyword) => {
        keywordList.push(buttonKeyword.innerText);
    });

    if (keywordList.length == 0) {
        alert('제품 검색어 키워드를 입력해주세요.');
        return;
    } 

    let keyword = keywordList.join('|');

    fetch('/webapi/product/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            mode: mode,
            name: name,
            keyword: keyword,
            pId: (mode === 'MODIFY') ? inputHiddenPId.value : ''
        })
    })
    .then(function(data) { return data.json(); })
    .then(function(response) {
        if (response.status != 'OK') {
            alert('에러가 발생했습니다.');
            return;
        }

        let pId = (mode === 'MODIFY') ? inputHiddenPId.value : response.result.pId;

        // Thumbnail
        let form = inputThumbnail.parentElement;
        let formData = new FormData(form);
        formData.append('dataId', pId);
        formData.append('mode', 'THUMB');
        formData.append('dataType', 'product');

        // images
        divImageBox.querySelectorAll('.js-div-image-wrapper').forEach((divImageWrapper) => {
            let form = divImageWrapper.querySelector('form');
            let formData = new FormData(form);
            formData.append('dataId', dataId);
            formData.append('mode', 'IMAGE');
            formData.append('dataType', dataType);
        });
        
        callback(response);
    });
}


function getProductCategoryList(callback) {
    fetch('/webapi/product/category/get/all')
    .then((data) => { return data.json(); })
    .then((response) => {
        if (response.status != 'OK') {
            alert('에러가 발생했습니다.');
            return;
        }
        callback(response);
    });
}


function saveProductCategory(mode, pcId, name, callback) {
    fetch('/webapi/product/category/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            mode: mode,
            name: name,
            pcId: pcId
        })
    })
    .then(function(data) { return data.json(); })
    .then(function(response) {
        if (response.status != 'OK') {
            if (response.status == 'ERR_EXISTS_NAME') {
                alert('중복된 카테고리 이름이 존재합니다.');
            } else {
                alert('에러가 발생했습니다.');
            }
            return;
        }
        callback(response);
    });
}


function removeProductCategory(pcId) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    fetch('/webapi/product/category/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pcId: pcId })
    })
    .then((data) => { return data.json(); })
    .then((response) => {
        if (response.status != 'OK') {
            if (response.status == 'ERR_EXISTS_PRODUCT') {
                alert('연관된 제품 데이터가 존재합니다.');
            } else {
                alert('에러가 발생했습니다.');
            }
            return;
        }

        alert('제품 카테고리가 삭제되었습니다.');
        tbodyProductCategoryList.querySelector('.js-tr-product-category[pcId="' + pcId + '"]').remove();
    });
}


function getProductBrandList(callback) {
    fetch('/webapi/product/brand/get/all')
    .then((data) => { return data.json(); })
    .then((response) => {
        if (response.status != 'OK') {
            alert('에러가 발생했습니다.');
            return;
        }
        callback(response);
    });
}


function saveProductBrand(mode, pbId, name, callback) {
    fetch('/webapi/product/brand/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            mode: mode,
            name: name,
            pbId: pbId
        })
    })
    .then(function(data) { return data.json(); })
    .then(function(response) {
        if (response.status != 'OK') {
            if (response.status == 'ERR_EXISTS_NAME') {
                alert('중복된 브랜드 이름이 존재합니다.');
            } else {
                alert('에러가 발생했습니다.');
            }
            return;
        }
        callback(response);
    });
}


function removeProductBrand(pbId) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    fetch('/webapi/product/brand/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pbId: pbId })
    })
    .then((data) => { return data.json(); })
    .then((response) => {
        if (response.status != 'OK') {
            if (response.status == 'ERR_EXISTS_PRODUCT') {
                alert('연관된 제품 데이터가 존재합니다.');
            } else {
                alert('에러가 발생했습니다.');
            }
            return;
        }

        alert('제품 브랜드가 삭제되었습니다.');
        tbodyProductBrandList.querySelector('.js-tr-product-brand[pbId="' + pbId + '"]').remove();
    });
}


function initProduct() {
    if (menu == 'product') {
        // getProductList();
    } else if (menu == 'product_detail') {
        // getProduct(inputHiddenPId.value);
    } else if (menu == 'product_category') {
        getProductCategoryList((response) => {
            let productCategoryList = response.result;
            let html = '';
            for (let i = 0; i < productCategoryList.length; i++) {
                let productCategory = productCategoryList[i];
                html += '<tr class="js-tr-product-category" pcId="' + productCategory.pc_id + '">';
                html +=     '<td>' + productCategory.pc_id + '</td>';
                html +=     '<td class="js-td-name">' + productCategory.pc_name + '</td>';
                html +=     '<td class="buttons">';
                html +=         '<button class="js-button-modify default">수정</button>';
                html +=         '<button class="js-button-remove default remove">삭제</button>';
                html +=     '</td>';
                html += '</tr>';
            }

            tbodyProductCategoryList.innerHTML = html;
            tbodyProductCategoryList.querySelectorAll('.js-button-remove').forEach((buttonRemove) => {
                buttonRemove.addEventListener('click', function() {
                    let pcId = this.parentElement.parentElement.getAttribute('pcId');
                    removeProductCategory(pcId);
                });
            });
            tbodyProductCategoryList.querySelectorAll('.js-button-modify').forEach((buttonModify) => {
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

                    let pcId = this.parentElement.parentElement.getAttribute('pcId');

                    saveProductCategory('MODIFY', pcId, name, (response) => {
                        alert('제품 카테고리가 수정되었습니다.');
                        location.reload();
                    });
                });
            });
        });

    } else if (menu == 'product_brand') {
        getProductBrandList((response) => {
            let productBrandList = response.result;
            let html = '';
            for (let i = 0; i < productBrandList.length; i++) {
                let productBrand = productBrandList[i];
                html += '<tr class="js-tr-product-brand" pbId="' + productBrand.pb_id + '">';
                html +=     '<td>' + productBrand.pb_id + '</td>';
                html +=     '<td class="js-td-name">' + productBrand.pb_name + '</td>';
                html +=     '<td class="buttons">';
                html +=         '<button class="js-button-modify default">수정</button>';
                html +=         '<button class="js-button-remove default remove">삭제</button>';
                html +=     '</td>';
                html += '</tr>';
            }

            tbodyProductBrandList.innerHTML = html;
            tbodyProductBrandList.querySelectorAll('.js-button-remove').forEach((buttonRemove) => {
                buttonRemove.addEventListener('click', function() {
                    let pbId = this.parentElement.parentElement.getAttribute('pbId');
                    removeProductBrand(pbId);
                });
            });
            tbodyProductBrandList.querySelectorAll('.js-button-modify').forEach((buttonModify) => {
                buttonModify.addEventListener('click', function() {
                    let origin_name = this.parentElement.parentElement.querySelector('.js-td-name').innerText;
                    let value = prompt('브랜드 이름 변경', origin_name);
                    if (!value) return;
                    let name = value.trim();
                    if (name == '') {
                        alert('브랜드 이름을 입력해주세요.');
                        return;
                    }

                    if (origin_name === name) return;

                    let pbId = this.parentElement.parentElement.getAttribute('pbId');

                    saveProductBrand('MODIFY', pbId, name, (response) => {
                        alert('제품 브랜드가 수정되었습니다.');
                        location.reload();
                    });
                });
            });
        });
    }

    if (buttonCancel) {
        buttonCancel.addEventListener('click', () => {
            location.href = '/product';
        });
    }
    
    if (buttonProductAdd) {
        buttonProductAdd.addEventListener('click', () => {
            saveProduct('ADD', (response) => {
                alert('제품이 추가되었습니다.');
                location.href = '/product';
            });
        });
    }

    if (buttonProductSave) {
        buttonProductSave.addEventListener('click', () => {
            saveProduct('MODIFY', (response) => {
                alert('제품이 수정되었습니다.');
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
                    divThumbnail.style.backgroundImage = 'url()';
                    return;
                }
                divThumbnail.style.backgroundImage = 'url(' + result + ')';
            });
        });
    }

    if (buttonImageAdd) {
        buttonImageAdd.addEventListener('click', () => {
            let html = '';
            html += '<div class="js-div-image-wrapper image-wrapper">';
            html +=     '<form method="post" enctype="multipart/form-data"><input class="js-input-image" name="image" type="file" accept="image/jpeg,image/png" /></form>';
            html +=     '<div class="js-div-remove remove"><i class="fal fa-times"></i></div>';
            html +=     '<div class="js-div-image image"></div>';
            html += '</div>';

            buttonImageAdd.insertAdjacentHTML('beforebegin', html);

            let divImageWrapperList = divImageBox.querySelectorAll('.js-div-image-wrapper');
            let divImageWrapper = divImageWrapperList[divImageWrapperList.length - 1];
            divImageWrapper.querySelector('.js-div-remove').addEventListener('click', function() {
                divImageWrapper.remove();
            });
            divImageWrapper.querySelector('.js-div-image').addEventListener('click', () => {
                divImageWrapper.querySelector('.js-input-image').click();
            });
            divImageWrapper.querySelector('.js-input-image').addEventListener('change', (event) => {
                changeInputImage(event, (error, result) => {
                    if (error) {
                        divImageWrapper.querySelector('.js-div-image').style.backgroundImage = 'url()';
                        return;
                    }
                    divImageWrapper.querySelector('.js-div-image').style.backgroundImage = 'url(' + result + ')';
                });
            });
        });
    }

    if (buttonImageDetailAdd) {
        buttonImageDetailAdd.addEventListener('click', () => {
            let html = '';
            html += '<div class="js-div-image-wrapper image-wrapper">';
            html +=     '<form method="post" enctype="multipart/form-data"><input class="js-input-image" name="image" type="file" accept="image/jpeg,image/png" /></form>';
            html +=     '<div class="js-div-remove remove"><i class="fal fa-times"></i></div>';
            html +=     '<div class="js-div-image image"></div>';
            html += '</div>';

            buttonImageDetailAdd.insertAdjacentHTML('beforebegin', html);

            let divImageWrapperList = divImageDetailBox.querySelectorAll('.js-div-image-wrapper');
            let divImageWrapper = divImageWrapperList[divImageWrapperList.length - 1];
            divImageWrapper.querySelector('.js-div-remove').addEventListener('click', function() {
                divImageWrapper.remove();
            });
            divImageWrapper.querySelector('.js-div-image').addEventListener('click', () => {
                divImageWrapper.querySelector('.js-input-image').click();
            });
            divImageWrapper.querySelector('.js-input-image').addEventListener('change', (event) => {
                changeInputImage(event, (error, result) => {
                    if (error) {
                        divImageWrapper.querySelector('.js-div-image').style.backgroundImage = 'url()';
                        return;
                    }
                    divImageWrapper.querySelector('.js-div-image').style.backgroundImage = 'url(' + result + ')';
                });
            });
        });
    }

    if (buttonProductCategoryAdd) {
        buttonProductCategoryAdd.addEventListener('click', () => {
            let value = prompt('카테고리 이름을 입력해주세요.');
            if (!value) return;
            let name = value.trim();
            if (name == '') {
                alert('카테고리 이름을 입력해주세요.');
                return;
            }

            saveProductCategory('ADD', null, name, (response) => {
                alert('제품 카테고리가 추가되었습니다.');
                location.reload();
            });
        });
    }

    if (buttonProductBrandAdd) {
        buttonProductBrandAdd.addEventListener('click', () => {
            let value = prompt('브랜드 이름을 입력해주세요.').trim();
            if (!value) return;
            let name = value.trim();
            if (name == '') {
                alert('브랜드 이름을 입력해주세요.');
                return;
            }

            saveProductBrand('ADD', null, name, (response) => {
                alert('제품 브랜드가 추가되었습니다.');
                location.reload();
            });
        });
    }

    if (selectCategory) {
        getProductCategoryList((response) => {
            let html = '';
            let categoryList = response.result;
            for (let i = 0; i < categoryList.length; i++) {
                let category = categoryList[i];
                html += '<option value="' + category.pc_id + '">' + category.pc_name + '(' + category.pc_id + ')</option>';
            }
            selectCategory.innerHTML = html;

            // value 세팅 (ADD면 1, DETAIL이면 가져와서 세팅)
            if (menu == 'product_add') selectCategory.value = 1;
            else if (menu == 'product_detail') selectCategory.value = 1;
            selectCategory.dispatchEvent(new Event('change')); // select event trigger
        });

        selectCategory.addEventListener('change', function() {
            console.log('changed');
            let pbId = this.value;
            if (pbId == 1) { // 사료일 경우
                let html = '';
                html += '<div class="form-box">';
                html +=     '<p>등록 성분 (%)</p>';
                html +=     '<table class="js-table-feed-nutrient-wrapper feed-nutrient-wrapper">';
                html +=         '<thead>';
                html +=             '<tr><th>조단백</th><th>조지방</th><th>조섬유</th><th>조회분</th><th>칼슘</th><th>인</th><th>수분</th></tr>';
                html +=         '</thead>';
                html +=         '<tbody>';
                html +=             '<tr>';
                html +=                 '<td><input class="default" type="text" /></td>';
                html +=                 '<td><input class="default" type="text" /></td>';
                html +=                 '<td><input class="default" type="text" /></td>';
                html +=                 '<td><input class="default" type="text" /></td>';
                html +=                 '<td><input class="default" type="text" /></td>';
                html +=                 '<td><input class="default" type="text" /></td>';
                html +=                 '<td><input class="default" type="text" /></td>';
                html +=             '</tr>';
                html +=         '</tbody>';
                html +=     '</table>';
                html += '</div>';
                
                selectCategory.parentElement.insertAdjacentHTML('afterend', html);

                // 원래 사료였다면 값 가져와서 넣어줘야됨
                if (menu == 'product_detail') {

                }
            } else {
                let tableFeedNutrientWrapper = document.querySelector('.js-table-feed-nutrient-wrapper');
                if (tableFeedNutrientWrapper) tableFeedNutrientWrapper.parentElement.remove();
            }
        });
    }

    if (selectBrand) {
        getProductBrandList((response) => {
            let html = '';
            let brandList = response.result;
            for (let i = 0; i < brandList.length; i++) {
                let brand = brandList[i];
                html += '<option value="' + brand.pb_id + '" ' + ((i == 0) ? 'selected' : '') + '>' + brand.pb_name + '(' + brand.pb_id + ')</option>';
            }
            selectBrand.innerHTML = html;
        });
    }
}
initProduct();
