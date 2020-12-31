const navSideMenu = document.querySelector('.js-nav-side-menu');
const divMobileMenu = document.querySelector('.js-div-mobile-menu');


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
}
initCommon();
