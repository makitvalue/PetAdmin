
const tbodyQuestionList = document.querySelector('.js-tbody-question-list');
const pUId = document.querySelector('.js-p-u-id');
const pUNickName = document.querySelector('.js-p-nick-name');
const pTitle = document.querySelector('.js-p-title');
const pContents = document.querySelector('.js-p-contents');
const buttonCancel = document.querySelector('.js-button-cancel');
const buttonQuestionSave = document.querySelector('.js-button-question-save');
const inputHiddenQId = document.querySelector('.js-input-hidden-q-id');
const textareaAnswer = document.querySelector('.js-textarea-answer');


function getQuestionList() {
    fetch('/webapi/question/get/all')
    .then((data) => { return data.json(); })
    .then((response) => {

        if (response.status != 'OK') {
            alert('에러가 발생했습니다.');
            return;
        }

        let questionList = response.result;
        let html = '';
        for (let i = 0; i < questionList.length; i++) {
            let question = questionList[i];
            html += '<tr class="js-tr-question" qId="' + question.q_id + '">';
            html +=     '<td>' + question.q_id + '</td>';
            html +=     '<td>' + question.q_u_id + '</td>';
            html +=     '<td>' + question.u_nick_name + '</td>';
            html +=     '<td>' + question.q_title + '</td>';
            html +=     '<td class="' + question.q_status + '">' + ((question.q_status == 'Q') ? '답변필요' : '답변완료') + '</td>';
            html +=     '<td>' + question.q_created_date + '</td>';
            html +=     '<td class="buttons">';
            html +=         '<a href="/question/detail/' + question.q_id + '"><button class="default">자세히</button></a>';
            html +=     '</td>';
            html += '</tr>';
        }

        tbodyQuestionList.innerHTML = html;
    });
}


function getQuestion(qId) {
    fetch('/webapi/question/get?qId=' + qId)
    .then((data) => { return data.json(); })
    .then((response) => {
        if (response.status != 'OK') {
            alert('에러가 발생했습니다.');
            return;
        }

        let question = response.result;
        pUId.innerText = '문의자 UID: ' + question.q_u_id;
        pUNickName.innerText = '문의자 닉네임: ' + question.u_nick_name;
        pTitle.innerText = '문의 제목: ' + question.q_title;
        pContents.innerText = '문의 내용\n' + question.q_contents;

        if (question.q_status == 'A') {
            textareaAnswer.value = question.q_answer;
        }
    });
}


function initQuestion() {
    if (menu == 'question') {
        getQuestionList();
    } else if (menu == 'question_detail') {
        getQuestion(inputHiddenQId.value);
    }

    if (buttonQuestionSave) {
        buttonQuestionSave.addEventListener('click', () => {
            let answer = textareaAnswer.value.trim();

            createOverlay(999, 'SAVE_QUESTION');
            createSpinner(999, 'SAVE_QUESTION');
            fetch('/webapi/question/answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    answer: answer,
                    qId: inputHiddenQId.value
                })
            })
            .then(function(data) { return data.json(); })
            .then(function(response) {
                if (response.status != 'OK') {
                    alert('에러가 발생했습니다.');
                    removeSpinner('SAVE_QUESTION');
                    removeOverlay('SAVE_QUESTION');
                    return;
                }

                alert('답변이 완료되었습니다.');
                location.href = '/question';
            });
        });
    }
}
initQuestion();
