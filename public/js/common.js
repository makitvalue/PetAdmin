

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


function initCommon() {

}
initCommon();
