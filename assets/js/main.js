import "../css/style.scss";

// global variables
let alphabets = null;
let defaultAlphabets = "hiragana";

// UI Select
const container = document.querySelector(".container");
const flipAllCheckBox = document.getElementById("flipCheck");
const shuffleCheckBox = document.getElementById("shuffleCheck");
const filterList = document.querySelector(".filterList");
const filterBtn = document.getElementById("filterBtn");
const checkboxContainer = document.querySelector(".selectGroup ul");
const selectTypeDropdown = document.getElementById("selectTypeDropdown");
const dropdownContainer = document.querySelector(".dropdown");
const selectTypeOptions = dropdownContainer.querySelectorAll("input[type='radio']");

const wasShuffled = () => shuffleCheckBox.checked;
const wasFliped = () => flipAllCheckBox.checked;

const shuffle = (arr) => {
    let result = [...arr];

    for (let currIdx = result.length - 1; currIdx >= 0; currIdx--) {
        let rndIdx = Math.floor(Math.random() * currIdx + 1);
        let temp = result[currIdx];
        result[currIdx] = result[rndIdx];
        result[rndIdx] = temp;
    }

    return result;
};

const fetchData = async (url = "data.json") => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    return data;
};

const createFilterBtn = (name, id) => {
    const divElm = document.createElement("div");
    let capitalizedName = [...name]
        .map((letter, idx) => (idx === 0 ? letter.toUpperCase() : letter))
        .join("");

    divElm.className = "inputGroup";
    divElm.id = id;
    divElm.innerHTML = `
            <span>${capitalizedName}</span>
            <span class="closeIcon">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 -960 960 960"
                    width="24"
                >
                    <path
                        d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"
                    />
                </svg>
            </span>
        `;
    return divElm;
};

const renderFilterBtn = (name, id) => {
    const filterBtn = createFilterBtn(name, id);
    filterList.appendChild(filterBtn);
};

const removeFilterBtn = (id) => {
    const filterBtns = document.querySelectorAll(".inputGroup");

    filterBtns.forEach((filterBtn) => {
        if (filterBtn.id === id) {
            filterBtn.classList.add("hide");

            setTimeout(() => {
                filterBtn.remove();
            }, 300);
        }
    });
};

const createCard = (frontVal, backVal, cardType = "") => {
    const divElm = document.createElement("div");
    divElm.className = cardType === "fliped" ? "card active" : "card";
    divElm.innerHTML = `
            <span class="front">${frontVal}</span>
            <span class="back">${backVal}</span>
        `;
    return divElm;
};

const renderCards = (alphabets, containerElm, cardType = "") => {
    alphabets.forEach(({ alphabet, romaji }, idx) => {
        const card = createCard(alphabet, romaji, cardType);
        card.style.animationDelay = idx * 0.04 + "s";

        containerElm.appendChild(card);
    });

    return document.querySelectorAll(".container .card");
};

const flipCards = () => {
    document.querySelectorAll(".container .card").forEach((card, idx) => {
        card.style.transitionDelay = 0.01 * idx + "s";
        if (wasFliped()) {
            if (!card.classList.contains("active")) {
                card.classList.add("active");
            }
        } else {
            if (card.classList.contains("active")) {
                card.classList.remove("active");
            }
        }
        setTimeout(() => {
            card.style.transitionDelay = 0 + "s";
        }, 100);
    });

    if (wasFliped()) {
        renderFilterBtn("flip", "flipBtn");
    } else {
        removeFilterBtn("flipBtn");
    }
};

const shuffleCards = () => {
    let shuffledAlphabets = shuffle(alphabets[defaultAlphabets]);
    let cardType = wasFliped() ? "fliped" : "";
    container.innerHTML = "";

    if (wasShuffled()) {
        renderCards(shuffledAlphabets, container, cardType);
        renderFilterBtn("shuffle", "shuffleBtn");
    } else {
        renderCards(alphabets[defaultAlphabets], container, cardType);
        removeFilterBtn("shuffleBtn");
    }
};

document.querySelectorAll("input[type=checkbox]").forEach((checkboxElm) => {
    checkboxElm.addEventListener("input", () => {
        const checkboxId = checkboxElm.id;

        switch (checkboxId) {
            case "flipCheck":
                flipCards();
                break;
            case "shuffleCheck":
                shuffleCards();
            default:
                break;
        }
    });
});

filterBtn.addEventListener("click", () => {
    checkboxContainer.classList.toggle("open");
});

document.addEventListener("click", (event) => {
    let target = event.target;
    const cardElm = target.closest(".card");

    // Close Filter box when outside of the box is clicked
    if (!checkboxContainer.contains(target) && !filterBtn.contains(target)) {
        checkboxContainer.classList.remove("open");
    }

    // Close if close icon is clicked
    if (target.classList.contains("closeIcon")) {
        let btnName = target.previousSibling.previousSibling.textContent;
        let btnId = btnName.toLowerCase() + "Btn";

        removeFilterBtn(btnId);

        switch (btnId) {
            case "flipBtn":
                flipAllCheckBox.checked = false;
                flipCards();
                break;
            case "shuffleBtn":
                shuffleCheckBox.checked = false;
                shuffleCards();
                break;
            default:
                break;
        }
    }

    // Flip if card is clicked
    if (cardElm) {
        cardElm.classList.toggle("active");
    }

    // Close select dropdown if outside of it is clicked
    if (!dropdownContainer.contains(target)) {
        dropdownContainer.classList.remove("active");
    }
});

/*
 * remove loading,
 * fetch data and
 * render cards
 */
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(async () => {
        document.querySelector(".loading").classList.add("hide");
        document.body.classList.remove("bodyFixed");
        let data = await fetchData("data.json");
        alphabets = data;

        if (alphabets) {
            renderCards(alphabets[defaultAlphabets], container);
        }
    }, 500);
});

selectTypeDropdown.addEventListener("click", () => {
    dropdownContainer.classList.toggle("active");
});

selectTypeOptions.forEach((option) => {
    option.addEventListener("input", () => {
        if (option.checked) {
            let currSelectType = option.nextElementSibling.dataset.selectType;
            let currSelectName = option.nextElementSibling.textContent;

            if (currSelectType === "hi") {
                defaultAlphabets = "hiragana";
            } else if (currSelectType === "ka") {
                defaultAlphabets = "katakana";
            }

            selectTypeDropdown.textContent = currSelectName;

            container.innerHTML = "";
            if (wasFliped() && wasShuffled()) {
                let shuffledAlphabets = shuffle(alphabets[defaultAlphabets]);
                renderCards(shuffledAlphabets, container, "fliped");
            } else if (wasFliped()) {
                renderCards(alphabets[defaultAlphabets], container, "fliped");
            } else if (wasShuffled()) {
                let shuffledAlphabets = shuffle(alphabets[defaultAlphabets]);
                renderCards(shuffledAlphabets, container);
            } else {
                renderCards(alphabets[defaultAlphabets], container);
            }
        }
    });

    option.addEventListener("click", () => {
        dropdownContainer.classList.toggle("active");
    });
});
