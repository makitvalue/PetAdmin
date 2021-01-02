
const buttonBreedAgeGroupAdd = document.querySelector('.js-button-breed-age-group-add');


function initBreed() {
    
    if (buttonBreedAgeGroupAdd) {
        buttonBreedAgeGroupAdd.addEventListener('click', () => {
            let html = '';
            html += '<div class="js-div-breed-age-group breed-age-group">';
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
        });
    }

}
initBreed();
