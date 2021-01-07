
const tbodyBreedList = document.querySelector('.js-tbody-breed-list');
const inputName = document.querySelector('.js-input-name');
const selectType = document.querySelector('.js-select-type');
const buttonCancel = document.querySelector('.js-button-cancel');
const buttonBreedAdd = document.querySelector('.js-button-breed-add');
const buttonBreedSave = document.querySelector('.js-button-breed-save');
const buttonBreedAgeGroupAdd = document.querySelector('.js-button-breed-age-group-add');
const inputHiddenBId = document.querySelector('.js-input-hidden-b-id');
const inputHiddenOriginalBreedAgeGroupData = document.querySelector('.js-input-hidden-original-breed-age-group-data');

const inputHiddenBagId = document.querySelector('.js-input-hidden-bag-id');
const buttonWeakDiseaseAdd = document.querySelector('.js-button-weak-disease-add');
const tbodyWeakDiseaseList = document.querySelector('.js-tbody-breed-weak-disease-list');

let originalBagIdList = [];


function getBreedList() {
    fetch('/webapi/breed/get/all')
    .then((data) => { return data.json(); })
    .then((response) => {

        if (response.status != 'OK') {
            alert('에러가 발생했습니다.');
            return;
        }

        let breedList = response.result;
        let html = '';
        for (let i = 0; i < breedList.length; i++) {
            let breed = breedList[i];
            html += '<tr class="js-tr-breed" bId="' + breed.b_id + '">';
            html +=     '<td>' + breed.b_id + '</td>';
            html +=     '<td>' + breed.b_name + '</td>';
            html +=     '<td class="buttons">';
            html +=         '<a href="/breed/detail/' + breed.b_id + '"><button class="default">자세히</button></a>';
            html +=         '<button class="js-button-remove default remove">삭제</button>';
            html +=     '</td>';
            html += '</tr>';
        }

        tbodyBreedList.innerHTML = html;
        tbodyBreedList.querySelectorAll('.js-button-remove').forEach((buttonRemove) => {
            buttonRemove.addEventListener('click', function() {
                let bId = this.parentElement.parentElement.getAttribute('bId');
                removeBreed(bId);
            });
        });
    });
}


function getBreed(bId) {
    fetch('/webapi/breed/get?bId=' + bId)
    .then((data) => { return data.json(); })
    .then((response) => {
        if (response.status != 'OK') {
            alert('에러가 발생했습니다.');
            return;
        }

        let breed = response.result.breed;
        let breedAgeGroupList = response.result.breedAgeGroupList;

        inputName.value = breed.b_name;
        selectType.value = breed.b_type;

        let keywordList = breed.b_keyword.split('|');

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
        for (let i = 0; i < breedAgeGroupList.length; i++) {
            let breedAgeGroup = breedAgeGroupList[i];
            html += '<div class="js-div-breed-age-group breed-age-group" bagId="' + breedAgeGroup.bag_id + '">';
            html +=     '<label>MIN 나이</label><input class="js-input-min-age default" type="text" value="' + breedAgeGroup.bag_min_age + '" />';
            html +=     '<label class="center">~</label>';
            html +=     '<label>MAX 나이</label><input class="js-input-max-age default" type="text" value="' + breedAgeGroup.bag_max_age + '" />';
            html +=     '<div class="js-div-remove remove"><i class="fal fa-times"></i></div>';
            html +=     '<a href="/breed/weak/disease/' + breedAgeGroup.bag_id + '"><div class="js-div-disease disease"><i class="fal fa-biohazard"></i></div></a>';
            html += '</div>';

            originalBagIdList.push(breedAgeGroup.bag_id);
        }
        buttonBreedAgeGroupAdd.insertAdjacentHTML('beforebegin', html);
        document.querySelectorAll('.js-div-breed-age-group').forEach((divBreedAgeGroup) => {
            divBreedAgeGroup.querySelector('.js-div-remove').addEventListener('click', function() {
                if (!confirm('취약질병과 연관된 데이터가 삭제됩니다. 계속하시겠습니까?')) return;
                divBreedAgeGroup.remove();
            });
            divBreedAgeGroup.querySelectorAll('input').forEach((input) => {
                input.addEventListener('keyup', checkNumber);
            }); 
        });
    });
}


function removeBreed(bId) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    fetch('/webapi/breed/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bId: bId })
    })
    .then((data) => { return data.json(); })
    .then((response) => {
        if (response.status != 'OK') {
            if (response.status == 'ERR_EXISTS_PET') {
                alert('연관된 펫 데이터가 존재합니다.');
            } else if (response.status == 'ERR_EXISTS_BREED_AGE_GROUP') {
                alert('연관된 견종별 나이대 그룹이 존재합니다.');
            } else {
                alert('에러가 발생했습니다.');
            }
            return;
        }

        alert('견종이 삭제되었습니다.');
        tbodyBreedList.querySelector('.js-tr-breed[bId="' + bId + '"]').remove();
    });
}


function saveBreed(mode, callback) {
    let name = inputName.value.trim();

    if (name === '') {
        alert('견종 이름을 입력해주세요.');
        return;
    }

    let keywordList = [];
    divKeywordList.querySelectorAll('.js-button-keyword').forEach((buttonKeyword) => {
        keywordList.push(buttonKeyword.innerText);
    });

    if (keywordList.length == 0) {
        alert('견종 검색어 키워드를 입력해주세요.');
        return;
    } 

    let keyword = keywordList.join('|');

    let isBreedAgeGroupValid = true;
    let breedAgeGroupList = [];
    let divBreedAgeGroupList = document.querySelectorAll('.js-div-breed-age-group');
    divBreedAgeGroupList.forEach((divBreedAgeGroup) => {
        let bagId = divBreedAgeGroup.getAttribute('bagId');
        let minAge = divBreedAgeGroup.querySelector('.js-input-min-age').value;
        let maxAge = divBreedAgeGroup.querySelector('.js-input-max-age').value;
        breedAgeGroupList.push({ bagId: bagId, minAge: minAge, maxAge: maxAge });
        if (minAge.trim() === '' || maxAge.trim() === '') {
            isBreedAgeGroupValid = false;
            return false;
        }
    });

    if (!isBreedAgeGroupValid) {
        alert('견종 나이대별 그룹 MIN나이 또는 MAX나이를 입력해주세요.');
        return;
    }

    // breed_detail인 경우 삭제된 데이터 세팅해주기
    let deleteBreedAgeGroupList = [];
    if (menu == 'breed_detail') {
        for (let i = 0; i < originalBagIdList.length; i++) {
            let bagId = originalBagIdList[i];
            let isFind = false;
            for (let j = 0; j < breedAgeGroupList.length; j++) {
                let searchBagId = breedAgeGroupList[j].bagId;
                if (bagId == searchBagId) {
                    isFind = true;
                    break;
                }
            }
            if (!isFind) deleteBreedAgeGroupList.push(bagId);
        }
    }

    fetch('/webapi/breed/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            mode: mode,
            name: name,
            keyword: keyword,
            breedAgeGroups: breedAgeGroupList,
            deleteBreedAgeGroups: deleteBreedAgeGroupList,
            bType: selectType.value,
            bId: (mode === 'MODIFY') ? inputHiddenBId.value : ''
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


function getBreedWeakDiseaseList() {
    // ORDER BY bcs
    fetch('/webapi/breed/weak/disease/get?bagId=' + inputHiddenBagId.value)
    .then((data) => { return data.json(); })
    .then((response) => {
        if (response.status != 'OK') {
            alert('에러가 발생했습니다.');
            return;
        }
        
        let weakDiseaseList = response.result;
        let html = '';
        for (let i = 0; i < weakDiseaseList.length; i++) {
            let weakDisease = weakDiseaseList[i];
            html += '<tr class="js-tr-weak-disease" mbagdId="' + weakDisease.mbagd_id + '">';
            html +=     '<td>' + weakDisease.mbagd_id + '</td>';
            html +=     '<td>' + weakDisease.d_name + '(' + weakDisease.mbagd_d_id + ')</td>';
            html +=     '<td>' + weakDisease.mbagd_bcs + '</td>';
            html +=     '<td class="buttons">';
            html +=         '<button class="js-button-remove default remove">삭제</button>';
            html +=     '</td>';
            html += '</tr>';
        }

        tbodyWeakDiseaseList.innerHTML = html;
        tbodyWeakDiseaseList.querySelectorAll('.js-button-remove').forEach((buttonRemove) => {
            buttonRemove.addEventListener('click', function() {
                let mbagdId = this.parentElement.parentElement.getAttribute('mbagdId');
                removeWeakDisease(mbagdId);
            });
        });
    });
}


function removeWeakDisease(mbagdId) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    fetch('/webapi/breed/weak/disease/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mbagdId: mbagdId })
    })
    .then((data) => { return data.json(); })
    .then((response) => {
        if (response.status != 'OK') {
            alert('에러가 발생했습니다.');
            return;
        }

        alert('취약질병이 삭제되었습니다.');
        tbodyWeakDiseaseList.querySelector('.js-tr-weak-disease[mbagdId="' + mbagdId + '"]').remove();
    });
}


function addWeakDisease(dId, bcs) {
    fetch('/webapi/breed/weak/disease/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            bagId: inputHiddenBagId.value,
            dId: dId,
            bcs: bcs
        })
    })
    .then((data) => { return data.json(); })
    .then((response) => {
        if (response.status != 'OK') {
            alert('에러가 발생했습니다.');
            return;
        }

        alert('취약질병이 추가되었습니다.');
        location.reload();
    });
}


function getDiseaseList(callback) {
    fetch('/webapi/disease/get/all')
    .then((data) => { return data.json(); })
    .then((response) => {
        if (response.status != 'OK') {
            alert('에러가 발생했습니다.');
            return;
        }
        callback(response.result);
    });
}


function initBreed() {
    if (menu == 'breed') {
        getBreedList();
    } else if (menu == 'breed_detail') {
        getBreed(inputHiddenBId.value);
    } else if (menu == 'breed_weak_disease') {
        getBreedWeakDiseaseList();
    }

    if (buttonCancel) {
        buttonCancel.addEventListener('click', () => {
            location.href = '/breed';
        });
    }
    
    if (buttonBreedAdd) {
        buttonBreedAdd.addEventListener('click', () => {
            saveBreed('ADD', (response) => {
                alert('견종이 추가되었습니다.');
                location.href = '/breed';
            });
        });
    }

    if (buttonBreedSave) {
        buttonBreedSave.addEventListener('click', () => {
            saveBreed('MODIFY', (response) => {
                alert('견종이 수정되었습니다.');
            });
        });
    }
    
    if (buttonBreedAgeGroupAdd) {
        buttonBreedAgeGroupAdd.addEventListener('click', () => {
            let html = '';
            html += '<div class="js-div-breed-age-group breed-age-group" bagId="0">';
            html +=     '<label>MIN 나이</label><input class="js-input-min-age default" type="text" />';
            html +=     '<label class="center">~</label>';
            html +=     '<label>MAX 나이</label><input class="js-input-max-age default" type="text" />';
            html +=     '<div class="js-div-remove remove"><i class="fal fa-times"></i></div>';
            html += '</div>';

            buttonBreedAgeGroupAdd.insertAdjacentHTML('beforebegin', html);

            let divBreedAgeGroupList = document.querySelectorAll('.js-div-breed-age-group');
            let divBreedAgeGroup = divBreedAgeGroupList[divBreedAgeGroupList.length - 1];
            divBreedAgeGroup.querySelector('.js-div-remove').addEventListener('click', function() {
                divBreedAgeGroup.remove();
            });
            divBreedAgeGroup.querySelectorAll('input').forEach((input) => {
                input.addEventListener('keyup', checkNumber);
            }); 
        });
    }

    if (buttonWeakDiseaseAdd) {
        buttonWeakDiseaseAdd.addEventListener('click', () => {
            document.querySelector('body').insertAdjacentHTML('beforeend', '<div class="js-div-overlay overlay" key="DIALOG_ADD_WEAK_DISEASE" style="z-index: 999;"></div>');

            let html = '';
            html += '<div class="js-div-dialog-add-weak-disease dialog-add-weak-disease">';
            html +=     '<div class="header">';
            html +=         '<h1 class="title">취약질병 추가</h1>';
            html +=         '<i class="js-i-close fal fa-times"></i>';
            html +=     '</div>';
            html +=     '<div class="body">';
            html +=         '<div class="form-box">';
            html +=             '<p>질병 선택</p>';
            html +=             '<select class="js-select-disease default"></select>';
            html +=         '</div>';
            html +=         '<div class="form-box">';
            html +=             '<p>신체지수 선택</p>';
            html +=             '<select class="js-select-bcs default"></select>';
            html +=         '</div>';
            html +=     '</div>';
            html +=     '<div class="footer">';
            html +=         '<button class="js-button-add-weak-disease-cancel default">취소</button>';
            html +=         '<button class="js-button-add-weak-disease default">확인</button>';
            html +=     '</div>';
            html += '</div>';
            document.querySelector('body').insertAdjacentHTML('beforeend', html);

            let iClose = document.querySelector('.js-div-dialog-add-weak-disease .js-i-close');
            iClose.addEventListener('click', () => {
                document.querySelector('.js-div-overlay[key="DIALOG_ADD_WEAK_DISEASE"]').remove();
                document.querySelector('.js-div-dialog-add-weak-disease').remove();
            });

            let buttonAddWeakDiseaseCancel = document.querySelector('.js-div-dialog-add-weak-disease .js-button-add-weak-disease-cancel');
            buttonAddWeakDiseaseCancel.addEventListener('click', () => {
                document.querySelector('.js-div-overlay[key="DIALOG_ADD_WEAK_DISEASE"]').remove();
                document.querySelector('.js-div-dialog-add-weak-disease').remove();
            });

            let selectDisease = document.querySelector('.js-div-dialog-add-weak-disease .js-select-disease');
            let selectBcs = document.querySelector('.js-div-dialog-add-weak-disease .js-select-bcs');

            getDiseaseList((diseaseList) => {
                let html = '';
                for (let i = 0; i < diseaseList.length; i++) {
                    let disease = diseaseList[i];
                    html += '<option value="' + disease.d_id + '" ' + ((i == 0) ? 'selected' : '') + '>' + disease.d_name + '(' + disease.d_id + ')</option>';
                }
                selectDisease.innerHTML = html;
            });

            html = '';
            for (let i = 1; i < 5; i++) {
                html += '<option value="' + i + '" ' + ((i == 1) ? 'selected' : '') + '>' + i + '</option>';
            }
            selectBcs.innerHTML = html;

            let buttonAddWeakDisease = document.querySelector('.js-div-dialog-add-weak-disease .js-button-add-weak-disease');
            buttonAddWeakDisease.addEventListener('click', () => {
                let dId = selectDisease.value;
                let bcs = selectBcs.value;
                addWeakDisease(dId, bcs);
            });
        });
    }

}
initBreed();
