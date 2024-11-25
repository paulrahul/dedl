let currentIndex = 0;
let previousIndex = 0;
let mode = "read";  // Modes: 'play' or 'revise'

const markedQuestions = new Set();

let categoryCollection = {};

const Mode = {
    Normal: "normal",
    Revise: "revise",

	Image: "image",
	Video: "video",
	Single: "single",

	One: "one",
    Two: "two",
    Three: "three"
}

let currentMode = localStorage.getItem("currentMode");
if (!currentMode) {
    currentMode = Mode.Normal;
}

function getModeIndex(mode) {
    let key = "dedlLast" + mode + "Question";

    if (mode == Mode.Revise) {
        key = 'dedlLastRevisedQuestion';
    } else if (mode == Mode.Normal) {
        key = 'dedlLastNormalQuestion';
    }

    const idx = localStorage.getItem(key);
    if (idx) {
        return parseInt(idx);
    }

    return -1;
}

function getCurrentModeIndex() {
    const index = getModeIndex(currentMode);
    if (currentMode == Mode.Normal) {
        return 0;
    }

    return index;
}

function getDropDownIndex(questions, normalIndex) {
    // Returns which array index 'normalIndex' corresponds to in the
    // given questions array.
    const arr = Array.from(questions); // Convert Set to Array
    return arr.indexOf(normalIndex);
}

function selectDropdownItem(mode, normalIndex) {
    const dropdown = document.getElementById(mode + '-question-index');
    let indexToSelect = getDropDownIndex(categoryCollection[mode]["questions"], normalIndex);

    if (indexToSelect >= 0) {
        categoryCollection[mode]["index"] = indexToSelect;           
        indexToSelect++;
        if (indexToSelect < dropdown.options.length) {
            dropdown.selectedIndex = indexToSelect;
        }            
    }
}

document.addEventListener('DOMContentLoaded', () => {
    categoryCollection = Object.values(Mode).reduce((acc, key) => {
        acc[key] = { questions: new Set(), index: 0 };
        return acc;
    }, {});

    // Load the last mode question.
    currentIndex = getCurrentModeIndex();
    loadQuestion(currentIndex);

    initializeDropdown(data);
    loadMarkedQuestions();

    // Select mode radio and mode drop down item.
    if (currentMode != Mode.Normal && currentMode != Mode.Revise) {
        document.getElementById('radio-' + currentMode).checked = true;        
        selectDropdownItem(currentMode, currentIndex);
    }

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
        currentMode = Mode.Image;
        goToDropDownQuestion(parseInt(event.target.value, 10));
    });
    document.getElementById('video-question-index').addEventListener('change', (event) => {
        currentMode = Mode.Video;
        goToDropDownQuestion(parseInt(event.target.value, 10));
    });
    document.getElementById('single-question-index').addEventListener('change', (event) => {
        currentMode = Mode.Single;
        goToDropDownQuestion(parseInt(event.target.value, 10));
    });
    
    document.getElementById('one-question-index').addEventListener('change', (event) => {
        currentMode = Mode.One;
        goToDropDownQuestion(parseInt(event.target.value, 10));
    });
    document.getElementById('two-question-index').addEventListener('change', (event) => {
        currentMode = Mode.Two;
        goToDropDownQuestion(parseInt(event.target.value, 10));
    });
    document.getElementById('three-question-index').addEventListener('change', (event) => {
        currentMode = Mode.Three;
        goToDropDownQuestion(parseInt(event.target.value, 10));
    });

    const radios = document.querySelectorAll('[id^="radio-"]');
    // Add the event listener to each radio button
    radios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            currentMode = event.target.value;
            let normalIndex = getCurrentModeIndex();
            if (normalIndex >= 0) {
                goToQuestion(normalIndex);
                // Set this mode's drop down index.
                categoryCollection[currentMode]["index"] = getDropDownIndex(
                    categoryCollection[currentMode]["questions"], normalIndex);
                selectDropdownItem(currentMode, normalIndex);                    
            } else {
                // No previous question for this mode persisted. Go to first
                // index.
                goToDropDownQuestion(0);
            }
        });
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
    currentMode = Mode.Revise;
    // Load the last revised question.
    const idx = localStorage.getItem("dedlLastRevisedQuestion");
    if (idx) {
        currentIndex = parseInt(idx);
    }
    loadQuestion(currentIndex);
}

function populateNormalQuestions() {
    initializeDropdown(Array.from(Array(data.length).keys()));
    currentMode = Mode.Normal;
    currentIndex = getCurrentModeIndex();
    loadQuestion();
}

function loadQuestion(index) {
    const question = data[index];
    document.getElementById('question-text').innerText = "[" + (index) + "/" + data.length + "] " +  question.de_text;
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

    if (currentMode == Mode.Revise) {
        localStorage.setItem('dedlLastRevisedQuestion', currentIndex.toString());
    } else if (currentMode == Mode.Normal) {
        localStorage.setItem('dedlLastNormalQuestion', currentIndex.toString());
    } else {
        let key = "dedlLast" + currentMode + "Question";
        localStorage.setItem(key, currentIndex.toString());
    }

    localStorage.setItem("currentMode", currentMode);
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

    switch (currentMode) {
        case Mode.Revise:
        case Mode.Image:
        case Mode.Video:
        case Mode.Single:
        case Mode.One:
        case Mode.Two:
        case Mode.Three:
            let index = categoryCollection[currentMode]["index"]
            let questions = categoryCollection[currentMode]["questions"]
            index = (index  + 1) % questions.size
            categoryCollection[currentMode]["index"] = index;        
            currentIndex = [...questions][index];
            break;
        default:
            currentIndex = (currentIndex + 1) % data.length;
    }

    loadQuestion(currentIndex);
}

function previousQuestion() {
    currentIndex = previousIndex;
    loadQuestion(previousIndex);
}

function goToDropDownQuestion(index) {
    categoryCollection[currentMode]["index"] = index;
    let questions = categoryCollection[currentMode]["questions"];
    currentIndex = [...questions][index]
    loadQuestion(currentIndex);
}

function goToQuestion(index) {
    currentIndex = parseInt(index, 10);
    loadQuestion(currentIndex);
}

function initializeDropdown(questions) {
    const dropdown = document.getElementById('question-index');

    var option = document.createElement('option');
    option.value = "revise";
    option.text = `Revise Marked Questions`;
    dropdown.appendChild(option);

    option = document.createElement('option');
    option.value = "normal";
    option.text = `Normal Questions`;
    dropdown.appendChild(option);    

    for (var index=0; index < questions.length; index++ ) {
        var question = questions[index];
        const option = document.createElement('option');
        option.value = index;
        option.text = `${index}`;
        dropdown.appendChild(option);

        if (question.picture && question.picture.endsWith(".jpg")) {
            categoryCollection[Mode.Image]["questions"].add(index);
        }

        if (question.picture && question.picture.endsWith(".m4v")) {
            categoryCollection[Mode.Video]["questions"].add(index);
        }

        if (question.asw_2 == undefined && question.asw_3 == undefined) {
            categoryCollection[Mode.Single]["questions"].add(index);            
        }

        var ansCnt = question.asw_corr1 + question.asw_corr2 + question.asw_corr3;

        if (ansCnt == 1) {
            categoryCollection[Mode.One]["questions"].add(index);            
        } else if (ansCnt == 2) {
            categoryCollection[Mode.Two]["questions"].add(index);            
        } else if (ansCnt == 3) {
            categoryCollection[Mode.Three]["questions"].add(index);            
        }
    }

    loadDropDown(document.getElementById('image-question-index'), categoryCollection[Mode.Image]["questions"]);
    loadDropDown(document.getElementById('video-question-index'), categoryCollection[Mode.Video]["questions"]);
    loadDropDown(document.getElementById('single-question-index'), categoryCollection[Mode.Single]["questions"]);

    loadDropDown(document.getElementById('one-question-index'), categoryCollection[Mode.One]["questions"]);
    loadDropDown(document.getElementById('two-question-index'), categoryCollection[Mode.Two]["questions"]);
    loadDropDown(document.getElementById('three-question-index'), categoryCollection[Mode.Three]["questions"]);
}

function loadDropDown(dropdown, dropdownQuestions) {
    var option = document.createElement('option');
    option.value = "select";
    option.text = `Select`;
    dropdown.appendChild(option);
    
    for (var index = 0; index < dropdownQuestions.size; index++) {
        var value = [...dropdownQuestions][index];
        const option = document.createElement('option');
        option.value = index;
        option.text = `${value}`;
        dropdown.appendChild(option);
    }
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
