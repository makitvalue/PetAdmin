
const divThumbnail = document.querySelector('.js-div-thumbnail');
const inputThumbnail = document.querySelector('.js-input-thumbnail');
const buttonImageAdd = document.querySelector('.js-button-image-add');
const buttonImageDetailAdd = document.querySelector('.js-button-image-detail-add');
const divImageBox = document.querySelector('.js-div-image-box');
const divImageDetailBox = document.querySelector('.js-div-image-detail-box');
const buttonProductCategoryAdd = document.querySelector('.js-button-product-category-add');
const buttonProductBrandAdd = document.querySelector('.js-button-product-brand-add');


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


function initProduct() {
    
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
            let name = prompt('카테고리 이름을 입력해주세요.').trim();
            if (name == '') {
                alert('이름을 입력해주세요.');
                return;
            }

            saveProductCategory('ADD', null, name, (response) => {
                alert('제품 카테고리가 추가되었습니다.');
                location.replace();
            });
        });
    }

    if (buttonProductBrandAdd) {
        buttonProductBrandAdd.addEventListener('click', () => {
            let name = prompt('브랜드 이름을 입력해주세요.').trim();
            if (name == '') {
                alert('이름을 입력해주세요.');
                return;
            }

            saveProductBrand('ADD', null, name, (response) => {
                alert('제품 브랜드가 추가되었습니다.');
                location.replace();
            });
        });
    }
}
initProduct();
