(function () {
    const state = {
        app: null,
        questions: [],
        sessionQuestions: [],
        currentIndex: 0,
        selectedAnswers: new Set(),
        displayAnswer: "",
        visibleOptionCount: 0,
        answered: false,
        correctCount: 0,
    };

    function parseAnswer(value) {
        const mapping = {
            "1": "A",
            "2": "B",
            "3": "C",
            "4": "D",
            "A": "A",
            "B": "B",
            "C": "C",
            "D": "D",
        };
        return Array.from(new Set(String(value).toUpperCase().split("").map((char) => mapping[char]).filter(Boolean))).sort().join("");
    }

    function shuffle(items) {
        const copied = items.slice();
        for (let index = copied.length - 1; index > 0; index -= 1) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            [copied[index], copied[swapIndex]] = [copied[swapIndex], copied[index]];
        }
        return copied;
    }

    function splitOption(choice) {
        if (choice.length >= 2 && /^[A-Za-z]$/.test(choice[0]) && [".", "、", ")"].includes(choice[1])) {
            return {
                label: choice[0].toUpperCase(),
                text: choice.slice(2).trim(),
            };
        }
        return {
            label: choice[0].toUpperCase(),
            text: choice,
        };
    }

    function normalizeQuestions(rawQuestions) {
        if (Array.isArray(rawQuestions)) {
            return rawQuestions.map((entry) => {
                if (Array.isArray(entry) && entry.length >= 2) {
                    return { chapter: String(entry[0]), ...entry[1] };
                }
                return { chapter: "错题", ...entry };
            });
        }

        return Object.entries(rawQuestions)
            .sort(([left], [right]) => Number(left) - Number(right))
            .flatMap(([chapter, list]) => list.map((question) => ({ chapter, ...question })));
    }

    function getElements(app) {
        return {
            scope: app.querySelector("#se-quiz-scope"),
            startChapter: app.querySelector("#se-quiz-start-chapter"),
            endChapter: app.querySelector("#se-quiz-end-chapter"),
            count: app.querySelector("#se-quiz-count"),
            random: app.querySelector("#se-quiz-random"),
            shuffleOptions: app.querySelector("#se-quiz-shuffle-options"),
            start: app.querySelector("#se-quiz-start"),
            error: app.querySelector("#se-quiz-error"),
            progressText: app.querySelector("#se-quiz-progress-text"),
            progressBar: app.querySelector("#se-quiz-progress-bar"),
            score: app.querySelector("#se-quiz-score"),
            card: app.querySelector("#se-quiz-card"),
            chapterLabel: app.querySelector("#se-quiz-chapter-label"),
            topic: app.querySelector("#se-quiz-topic"),
            options: app.querySelector("#se-quiz-options"),
            feedback: app.querySelector("#se-quiz-feedback"),
            submit: app.querySelector("#se-quiz-submit"),
            next: app.querySelector("#se-quiz-next"),
        };
    }

    function showError(elements, message) {
        elements.error.textContent = message;
        elements.error.hidden = false;
    }

    function clearError(elements) {
        elements.error.textContent = "";
        elements.error.hidden = true;
    }

    function buildQuestionPool(elements) {
        const scope = elements.scope.value;
        const startChapter = Number(elements.startChapter.value);
        const endChapter = Number(elements.endChapter.value);

        if (scope === "all") {
            return state.questions.slice();
        }

        if (!Number.isInteger(startChapter) || startChapter <= 0) {
            throw new Error("起始章节必须是正整数。");
        }

        if (scope === "chapter") {
            return state.questions.filter((question) => Number(question.chapter) === startChapter);
        }

        if (!Number.isInteger(endChapter) || endChapter <= 0) {
            throw new Error("结束章节必须是正整数。");
        }

        if (startChapter > endChapter) {
            throw new Error("起始章节不能大于结束章节。");
        }

        return state.questions.filter((question) => {
            const chapter = Number(question.chapter);
            return chapter >= startChapter && chapter <= endChapter;
        });
    }

    function syncScopeControls(elements) {
        const scope = elements.scope.value;
        const isAll = scope === "all";
        const isChapter = scope === "chapter";

        elements.startChapter.disabled = isAll;
        elements.endChapter.disabled = isAll || isChapter;
        elements.startChapter.closest(".se-quiz__field").classList.toggle("is-disabled", isAll);
        elements.endChapter.closest(".se-quiz__field").classList.toggle("is-disabled", isAll || isChapter);
    }

    function prepareSessionQuestions(elements) {
        const countValue = elements.count.value.trim();
        const count = countValue === "" ? null : Number(countValue);
        let pool = buildQuestionPool(elements);

        if (count !== null && (!Number.isInteger(count) || count <= 0)) {
            throw new Error("题目数量必须是正整数。");
        }

        if (pool.length === 0) {
            throw new Error("当前范围内没有题目。");
        }

        if (elements.random.checked) {
            pool = shuffle(pool);
        }

        return count === null ? pool : pool.slice(0, Math.min(count, pool.length));
    }

    function buildDisplayOptions(question, shouldShuffleOptions) {
        const visibleOptions = question.options.filter((choice) => choice && choice[0].toUpperCase() !== "E");
        const optionPool = shouldShuffleOptions ? shuffle(visibleOptions) : visibleOptions;
        const answerMapping = {};
        const displayOptions = optionPool.map((choice, index) => {
            const originalOption = splitOption(choice);
            const displayLabel = String.fromCharCode(65 + index);
            answerMapping[originalOption.label] = displayLabel;
            return {
                label: displayLabel,
                text: shouldShuffleOptions ? originalOption.text : choice.slice(2).trim(),
            };
        });
        const displayAnswer = parseAnswer(question.answer.split("").map((label) => answerMapping[label] || label).join(""));

        return { displayOptions, displayAnswer };
    }

    function updateStatus(elements) {
        const total = state.sessionQuestions.length;
        const shown = total === 0 ? 0 : state.currentIndex + 1;
        const finished = total === 0 ? 0 : state.currentIndex + (state.answered ? 1 : 0);
        const percentage = total === 0 ? 0 : Math.round((finished / total) * 100);

        elements.progressText.textContent = total === 0 ? "尚未开始" : `${shown} / ${total}`;
        elements.progressBar.style.width = `${percentage}%`;
        elements.score.textContent = `${state.correctCount} / ${finished}`;
    }

    function renderQuestion(elements) {
        const question = state.sessionQuestions[state.currentIndex];
        const { displayOptions, displayAnswer } = buildDisplayOptions(question, elements.shuffleOptions.checked);

        state.selectedAnswers = new Set();
        state.displayAnswer = displayAnswer;
        state.visibleOptionCount = displayOptions.length;
        state.answered = false;

        elements.card.hidden = false;
        elements.feedback.hidden = true;
        elements.feedback.textContent = "";
        elements.feedback.className = "se-quiz__feedback";
        elements.submit.hidden = false;
        elements.next.hidden = true;
        elements.chapterLabel.textContent = `Chapter ${question.chapter}`;
        elements.topic.textContent = question.topic;
        elements.options.innerHTML = "";

        displayOptions.forEach((option) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "se-quiz__option";
            button.dataset.answer = option.label;
            button.innerHTML = `<span class="se-quiz__option-label">${option.label}</span><span>${option.text}</span>`;
            button.addEventListener("click", () => toggleOption(button));
            elements.options.appendChild(button);
        });

        updateStatus(elements);
    }

    function toggleOption(button) {
        if (state.answered) {
            return;
        }

        const answer = button.dataset.answer;
        const isSelected = state.selectedAnswers.has(answer);
        const isSingleChoice = state.visibleOptionCount <= 2;

        if (isSingleChoice) {
            state.selectedAnswers.clear();
            button.parentElement.querySelectorAll(".se-quiz__option").forEach((optionButton) => {
                optionButton.classList.remove("is-selected");
            });

            if (!isSelected) {
                state.selectedAnswers.add(answer);
                button.classList.add("is-selected");
            }
            return;
        }

        if (isSelected) {
            state.selectedAnswers.delete(answer);
            button.classList.remove("is-selected");
        } else {
            state.selectedAnswers.add(answer);
            button.classList.add("is-selected");
        }
    }

    function submitAnswer(elements) {
        if (state.answered) {
            return;
        }

        const answer = Array.from(state.selectedAnswers).sort().join("");
        if (!answer) {
            showError(elements, "请先选择一个答案。");
            return;
        }

        clearError(elements);
        state.answered = true;

        const isCorrect = answer === state.displayAnswer;
        if (isCorrect) {
            state.correctCount += 1;
        }

        elements.options.querySelectorAll(".se-quiz__option").forEach((button) => {
            const value = button.dataset.answer;
            if (state.displayAnswer.includes(value)) {
                button.classList.add("is-correct");
            } else if (state.selectedAnswers.has(value)) {
                button.classList.add("is-wrong");
            }
        });

        elements.feedback.hidden = false;
        elements.feedback.textContent = isCorrect ? "正确" : `错误，正确答案是 ${state.displayAnswer}`;
        elements.feedback.classList.add(isCorrect ? "is-correct" : "is-wrong");
        elements.submit.hidden = true;
        elements.next.hidden = false;
        elements.next.textContent = state.currentIndex + 1 >= state.sessionQuestions.length ? "完成" : "下一题";
        updateStatus(elements);
    }

    function nextQuestion(elements) {
        if (state.currentIndex + 1 >= state.sessionQuestions.length) {
            elements.feedback.hidden = false;
            elements.feedback.textContent = `本轮完成：${state.correctCount} / ${state.sessionQuestions.length}`;
            elements.feedback.className = "se-quiz__feedback is-correct";
            elements.submit.hidden = true;
            elements.next.hidden = true;
            return;
        }

        state.currentIndex += 1;
        renderQuestion(elements);
    }

    function startSession(elements) {
        clearError(elements);

        try {
            state.sessionQuestions = prepareSessionQuestions(elements);
        } catch (error) {
            showError(elements, error.message);
            return;
        }

        state.currentIndex = 0;
        state.correctCount = 0;
        renderQuestion(elements);
    }

    async function initQuiz(app) {
        if (app.dataset.ready === "true") {
            return;
        }

        const elements = getElements(app);
        app.dataset.ready = "true";
        state.app = app;

        try {
            const response = await fetch(app.dataset.source, { cache: "no-store" });
            if (!response.ok) {
                throw new Error(`题库加载失败：HTTP ${response.status}`);
            }
            state.questions = normalizeQuestions(await response.json());
        } catch (error) {
            showError(elements, error.message);
            return;
        }

        elements.start.addEventListener("click", () => startSession(elements));
        elements.submit.addEventListener("click", () => submitAnswer(elements));
        elements.next.addEventListener("click", () => nextQuestion(elements));
        elements.scope.addEventListener("change", () => syncScopeControls(elements));
        syncScopeControls(elements);
    }

    function boot() {
        const app = document.querySelector("#se-quiz-app");
        if (!app) {
            return;
        }
        initQuiz(app);
    }

    if (typeof document$ !== "undefined") {
        document$.subscribe(boot);
    } else {
        document.addEventListener("DOMContentLoaded", boot);
    }
})();
