let isRevising = "normal";
let revisionIndex = 0;

let currentIndex = 0;
let previousIndex = 0;
let mode = "read";  // Modes: 'play' or 'revise'
const markedQuestions = new Set();

document.addEventListener('DOMContentLoaded', () => {
    // Load the last normal question.
    const idx = localStorage.getItem("dedlLastNormalQuestion");
    if (idx) {
        currentIndex = parseInt(idx);
    }

    loadQuestion(currentIndex);
    initializeDropdown(data);
    loadMarkedQuestions();

    document.getElementById('submit').addEventListener('click', checkAnswers);
    document.getElementById('next').addEventListener('click', nextQuestion);
    document.getElementById('previous').addEventListener('click', previousQuestion);
    
    document.getElementById('question-index').addEventListener('change',  function(event) {
        goToQuestion(event.target.value);
    });

    // document.getElementById('question-index').addEventListener('keypress', function(event) {
    //     if (event.key === 'Enter') {
    //         goToQuestion(event.target.value);
    //     }
    // });

    document.getElementById('image-question-index').addEventListener('change', (event) => {
        goToQuestion(event.target.value);
    });
    document.getElementById('video-question-index').addEventListener('change', (event) => {
        goToQuestion(event.target.value);
    });
    document.getElementById('single-question-index').addEventListener('change', (event) => {
        goToQuestion(event.target.value);
    });
    
    
    document.getElementById('onechoice-question-index').addEventListener('change', (event) => {
        goToQuestion(event.target.value);
    });
    document.getElementById('twochoice-question-index').addEventListener('change', (event) => {
        goToQuestion(event.target.value);
    });
    document.getElementById('allchoice-question-index').addEventListener('change', (event) => {
        goToQuestion(event.target.value);
    });        

    document.getElementById('mark').addEventListener('click', markQuestion);
    document.getElementById('unmark').addEventListener('click', unmarkQuestion);

    document.getElementById('mode-switch').addEventListener('change', (event) => {
        if (event.target.checked) {
            mode = 'read'; // Switch to Read Mode
        } else {
            mode = 'play'; // Switch to Play Mode
        }
        loadQuestion(currentIndex); // Reload current question to reflect mode change
    });
    
    document.addEventListener('keydown', function(event) {
        if (document.activeElement !== document.getElementById('user-answer')) {
            event.preventDefault();
            if (event.key === 'n' || event.key === 'N') {
                // If "N" key is pressed, trigger the next question
                nextQuestion();
            } else if (event.key === 'm' || event.key === 'M') {
                // If "M" key is pressed, mark the question
                markQuestion();
            } else if (event.key === 'u' || event.key === 'U') {
                unmarkQuestion();
            } else if (event.key === 'p' || event.key === 'P') {
                previousQuestion();
            }
        }
    });
    
    document.getElementById('modal-close').addEventListener('click', function() {
        const modal = document.getElementById('video-modal');
        modal.style.display = 'none';
        document.getElementById('question-video').src = ''; // Stop video
    });

    window.onclick = function(event) {
        const modal = document.getElementById('video-modal');
        if (event.target == modal) {
            modal.style.display = 'none';
            document.getElementById('question-video').src = ''; // Stop video
        }
    };    
});

function populateMarkedQuestions() {
    initializeDropdown(markedQuestions);
    isRevising = "revise";
    // Load the last revised question.
    const idx = localStorage.getItem("dedlLastRevisedQuestion");
    if (idx) {
        currentIndex = parseInt(idx);
    }
    loadQuestion(currentIndex);
}

function populateNormalQuestions() {
    initializeDropdown(Array.from(Array(data.length).keys()));
    isRevising = "normal";
    // Load the last normal question.
    const idx = localStorage.getItem("dedlLastNormalQuestion");
    if (idx) {
        currentIndex = parseInt(idx);
    }
    loadQuestion();
}

function loadQuestion(index) {
    const question = data[index];
    document.getElementById('question-text').innerText = "[" + (index + 1) + "/" + data.length + "] " +  question.de_text;
    document.getElementById('question-en-text').innerText = question.en_text;
    document.getElementById('asw_text_1').innerText = question.asw_1;
    document.getElementById('asw_text_2').innerText = question.asw_2;
    document.getElementById('asw_text_3').innerText = question.asw_3;

    // Reset checkboxes
    document.getElementById('asw_1').checked = false;
    document.getElementById('asw_2').checked = false;
    document.getElementById('asw_3').checked = false;

    // Handle image
    if (question.picture && question.picture.endsWith(".jpg")) {
        const imgElement = document.getElementById('question-image');
        imgElement.src = "https://t24.theorie24.de/2024-07-v395/assets/img/images/" + question.picture;
        imgElement.style.display = 'inline';
    } else {
        document.getElementById('question-image').style.display = 'none';
    }

    // Handle video
    if (question.picture && question.picture.endsWith(".m4v")) {
        const videoLink = document.getElementById('question-video-link');
        const videoHref = "https://www.theorie24.de/live_images/_current_ws_2024-04-01_2024-10-01/videos/" + question.picture; 
        videoLink.href = videoHref;
        videoLink.style.display = 'inline';
        videoLink.addEventListener('click', function(e) {
            e.preventDefault();
            openVideoModal(videoHref);
        });
    } else {
        document.getElementById('question-video-link').style.display = 'none';
    }    

    // Check if question is marked
    toggleMarkButtons(index);

    // If in 'revise' mode, preselect correct answers
    if (mode === 'read') {
        document.getElementById('asw_1').checked = question.asw_corr1 === 1;
        document.getElementById('asw_2').checked = question.asw_corr2 === 1;
        document.getElementById('asw_3').checked = question.asw_corr3 === 1;
    }

    if (isRevising == "revise") {
        localStorage.setItem('dedlLastRevisedQuestion', currentIndex.toString());
    } else if (isRevising == "normal") {
        localStorage.setItem('dedlLastNormalQuestion', currentIndex.toString());
    }
}

function openVideoModal(videoUrl) {
    const modal = document.getElementById('video-modal');
    const videoElement = document.getElementById('question-video');
    videoElement.src = videoUrl;
    modal.style.display = 'block';
}

function checkAnswers() {
    const question = data[currentIndex];
    const userAnswers = [
        document.getElementById('asw_1').checked,
        document.getElementById('asw_2').checked,
        document.getElementById('asw_3').checked
    ];

    const correctAnswers = [
        question.asw_corr1 === 1,
        question.asw_corr2 === 1,
        question.asw_corr3 === 1
    ];

    // Compare user answers to correct answers and show results
    userAnswers.forEach((answer, index) => {
        const result = answer === correctAnswers[index] ? 'Correct' : 'Incorrect';
        alert(`Answer ${index + 1} is ${result}`);
    });
}

function nextQuestion() {
    previousIndex = currentIndex;

    if (isRevising == "revise") {
        revisionIndex++;
        if (revisionIndex >= markedQuestions.length) {
            alert("All marked questions revised, switching to normal questions.");
            isRevising = "normal";
            const idx = localStorage.getItem("dedlLastNormalQuestion");
            if (idx) {
                currentIndex = parseInt(idx);
            } else {
                currentIndex = 0;
            }
        
            nextQuestion();
            return;
        }
        currentIndex = markedQuestions[revisionIndex];
    } else {
        currentIndex = (currentIndex + 1) % data.length;
    }

    loadQuestion(currentIndex);
}

function previousQuestion() {
    currentIndex = previousIndex;
    loadQuestion(previousIndex);
}

function goToQuestion(index) {
    currentIndex = parseInt(index, 10);
    loadQuestion(currentIndex);
}

function initializeDropdown(questions) {
    const dropdown = document.getElementById('question-index');
    const imageDropdown = document.getElementById('image-question-index');
    const videoDropdown = document.getElementById('video-question-index');
    const singleDropdown = document.getElementById('single-question-index');

    const oneChoiceDropdown = document.getElementById('onechoice-question-index');
    const twoChoiceDropdown = document.getElementById('twochoice-question-index');    
    const allChoiceDropdown = document.getElementById('allchoice-question-index');

    var option = document.createElement('option');
    option.value = "revise";
    option.text = `Revise Marked Questions`;
    dropdown.appendChild(option);

    option = document.createElement('option');
    option.value = "normal";
    option.text = `Normal Questions`;
    dropdown.appendChild(option);    

    questions.forEach((question, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.text = `${index + 1}`;
        dropdown.appendChild(option);

        if (question.picture && question.picture.endsWith(".jpg")) {
            const option = document.createElement('option');
            option.value = index;
            option.text = `${index + 1}`;
            imageDropdown.appendChild(option);    
        }

        if (question.picture && question.picture.endsWith(".m4v")) {
            const option = document.createElement('option');
            option.value = index;
            option.text = `${index + 1}`;
            videoDropdown.appendChild(option);    
        }

        if (question.asw_2 == undefined && question.asw_3 == undefined) {
            const option = document.createElement('option');
            option.value = index;
            option.text = `${index + 1}`;
            singleDropdown.appendChild(option); 
        }

        var ansCnt = question.asw_corr1 + question.asw_corr2 + question.asw_corr3;

        if (ansCnt == 1) {
            const option = document.createElement('option');
            option.value = index;
            option.text = `${index + 1}`;
            oneChoiceDropdown.appendChild(option); 
        } else if (ansCnt == 2) {
            const option = document.createElement('option');
            option.value = index;
            option.text = `${index + 1}`;
            twoChoiceDropdown.appendChild(option); 
        } else if (ansCnt == 3) {
            const option = document.createElement('option');
            option.value = index;
            option.text = `${index + 1}`;
            allChoiceDropdown.appendChild(option); 
        }
    });
}

function markQuestion() {
    markedQuestions.add(currentIndex);
    localStorage.setItem('dedlMarkedQuestions', JSON.stringify([...markedQuestions]));
    toggleMarkButtons(currentIndex);
}

function unmarkQuestion() {
    markedQuestions.delete(currentIndex);
    localStorage.setItem('dedlMarkedQuestions', JSON.stringify([...markedQuestions]));
    toggleMarkButtons(currentIndex);
}

function toggleMarkButtons(index) {
    if (markedQuestions.has(index)) {
        document.getElementById('mark').style.display = 'none';
        document.getElementById('unmark').style.display = 'inline-block';
    } else {
        document.getElementById('mark').style.display = 'inline-block';
        document.getElementById('unmark').style.display = 'none';
    }
}

function loadMarkedQuestions() {
    const storedMarkedQuestions = JSON.parse(localStorage.getItem('dedlMarkedQuestions')) || [];
    storedMarkedQuestions.forEach(index => markedQuestions.add(index));
}
