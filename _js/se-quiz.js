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
        correctQuestionIds: new Set(),
        isSessionFinished: false,
        keyboardHandler: null,
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

    function formatLabelList(labels) {
        if (labels.length <= 1) {
            return labels.join("");
        }
        if (labels.length === 2) {
            return `${labels[0]} and ${labels[1]}`;
        }
        return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
    }

    function remapReferencedLabels(text, originalLabel, originalLabels, answerMapping) {
        const remapLabel = (label) => answerMapping[label.toUpperCase()] || label.toUpperCase();
        const originalIndex = originalLabels.indexOf(originalLabel);
        const aboveLabels = originalLabels
            .slice(0, originalIndex < 0 ? 0 : originalIndex)
            .map(remapLabel)
            .sort();
        const aboveText = formatLabelList(aboveLabels);

        const rewritten = text
            .replace(/\b([a-d])\s+and\s+([a-d])\b/gi, (_match, left, right) => {
                return `${remapLabel(left)} and ${remapLabel(right)}`;
            })
            .replace(/\b([a-d])\s*,\s*([a-d])\s*,?\s*and\s*([a-d])\b/gi, (_match, first, second, third) => {
                return formatLabelList([remapLabel(first), remapLabel(second), remapLabel(third)]);
            })
            .replace(/\b([a-d])\s*,\s*([a-d])\b/gi, (_match, first, second) => {
                return `${remapLabel(first)}, ${remapLabel(second)}`;
            });

        if (!aboveText) {
            return rewritten;
        }

        return rewritten
            .replace(/\ball\s+of\s+the\s+above\b/gi, `all of ${aboveText}`)
            .replace(/\bnone\s+of\s+the\s+above\b/gi, `none of ${aboveText}`)
            .replace(/\bany\s+of\s+the\s+above\b/gi, `any of ${aboveText}`)
            .replace(/\bthe\s+above\b/gi, aboveText);
    }

    function buildQuestionId(chapter, question, index) {
        const topicNumber = String(question.topic || "").match(/^\s*(\d+)\./);
        return `${chapter}:${topicNumber ? topicNumber[1] : index + 1}`;
    }

    function normalizeQuestions(rawQuestions) {
        if (Array.isArray(rawQuestions)) {
            return rawQuestions.map((entry, index) => {
                if (Array.isArray(entry) && entry.length >= 2) {
                    const chapter = String(entry[0]);
                    return { id: buildQuestionId(chapter, entry[1], index), chapter, ...entry[1] };
                }
                return { id: buildQuestionId("错题", entry, index), chapter: "错题", ...entry };
            });
        }

        return Object.entries(rawQuestions)
            .sort(([left], [right]) => Number(left) - Number(right))
            .flatMap(([chapter, list]) => {
                return list.map((question, index) => ({ id: buildQuestionId(chapter, question, index), chapter, ...question }));
            });
    }

    function getElements(app) {
        return {
            scope: app.querySelector("#se-quiz-scope"),
            startChapter: app.querySelector("#se-quiz-start-chapter"),
            endChapter: app.querySelector("#se-quiz-end-chapter"),
            judgeCount: app.querySelector("#se-quiz-judge-count"),
            choiceCount: app.querySelector("#se-quiz-choice-count"),
            random: app.querySelector("#se-quiz-random"),
            shuffleOptions: app.querySelector("#se-quiz-shuffle-options"),
            avoidCorrect: app.querySelector("#se-quiz-avoid-correct"),
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

    function getVisibleOptions(question) {
        return question.options.filter((choice) => choice && choice[0].toUpperCase() !== "E");
    }

    function isJudgeQuestion(question) {
        return getVisibleOptions(question).length <= 2;
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

    function parseQuestionCount(value, label) {
        const trimmedValue = value.trim();
        if (trimmedValue === "") {
            return null;
        }

        const count = Number(trimmedValue);
        if (!Number.isInteger(count) || count < 0) {
            throw new Error(`${label}必须是非负整数。`);
        }

        return count;
    }

    function takeQuestions(questions, count, randomMode, avoidCorrect) {
        const questionPool = randomMode ? shuffle(questions) : questions.slice();
        if (!avoidCorrect) {
            return count === null ? questionPool : questionPool.slice(0, Math.min(count, questionPool.length));
        }

        const unansweredQuestions = questionPool.filter((question) => !state.correctQuestionIds.has(question.id));
        const correctQuestions = questionPool.filter((question) => state.correctQuestionIds.has(question.id));

        if (count === null) {
            return unansweredQuestions;
        }

        const selectedQuestions = unansweredQuestions.slice(0, Math.min(count, unansweredQuestions.length));
        if (selectedQuestions.length < count) {
            selectedQuestions.push(...correctQuestions.slice(0, count - selectedQuestions.length));
        }
        return selectedQuestions;
    }

    function prepareSessionQuestions(elements) {
        const judgeCount = parseQuestionCount(elements.judgeCount.value, "判断题数量");
        const choiceCount = parseQuestionCount(elements.choiceCount.value, "选择题数量");
        const pool = buildQuestionPool(elements);

        if (pool.length === 0) {
            throw new Error("当前范围内没有题目。");
        }

        if (elements.random.checked) {
            const selectedJudgeQuestions = takeQuestions(pool.filter(isJudgeQuestion), judgeCount, true, elements.avoidCorrect.checked);
            const selectedChoiceQuestions = takeQuestions(pool.filter((question) => !isJudgeQuestion(question)), choiceCount, true, elements.avoidCorrect.checked);
            const selectedQuestions = shuffle([...selectedJudgeQuestions, ...selectedChoiceQuestions]);

            if (selectedQuestions.length === 0) {
                throw new Error("当前题量设置下没有题目。");
            }

            return selectedQuestions;
        }

        const selectedJudgeQuestions = takeQuestions(pool.filter(isJudgeQuestion), judgeCount, false, elements.avoidCorrect.checked);
        const selectedChoiceQuestions = takeQuestions(pool.filter((question) => !isJudgeQuestion(question)), choiceCount, false, elements.avoidCorrect.checked);
        const selectedQuestionIds = new Set([...selectedJudgeQuestions, ...selectedChoiceQuestions].map((question) => question.id));
        const selectedQuestions = pool.filter((question) => selectedQuestionIds.has(question.id));

        if (selectedQuestions.length === 0) {
            throw new Error("当前题量设置下没有题目。");
        }

        return selectedQuestions;
    }

    function buildDisplayOptions(question, shouldShuffleOptions) {
        const visibleOptions = getVisibleOptions(question);
        const canShuffleOptions = shouldShuffleOptions && visibleOptions.length > 2;
        const optionPool = canShuffleOptions ? shuffle(visibleOptions) : visibleOptions;
        const originalLabels = visibleOptions.map((choice) => splitOption(choice).label);
        const answerMapping = {};
        const parsedOptions = optionPool.map((choice, index) => {
            const originalOption = splitOption(choice);
            const displayLabel = String.fromCharCode(65 + index);
            answerMapping[originalOption.label] = displayLabel;
            return {
                label: displayLabel,
                originalLabel: originalOption.label,
                originalText: originalOption.text,
            };
        });
        const displayOptions = parsedOptions.map((option) => {
            return {
                label: option.label,
                text: canShuffleOptions
                    ? remapReferencedLabels(option.originalText, option.originalLabel, originalLabels, answerMapping)
                    : option.originalText,
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
            state.correctQuestionIds.add(state.sessionQuestions[state.currentIndex].id);
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
            state.isSessionFinished = true;
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
        state.isSessionFinished = false;
        renderQuestion(elements);
    }

    function getKeyboardOptionIndex(event) {
        if (/^[1-4]$/.test(event.key)) {
            return Number(event.key);
        }

        const digitMatch = event.code.match(/^(?:Digit|Numpad)([1-4])$/);
        return digitMatch ? Number(digitMatch[1]) : null;
    }

    function handleKeyboard(event, elements) {
        if (event.isComposing) {
            return;
        }

        const target = event.target;
        if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement) {
            return;
        }
        if (target instanceof HTMLElement && target.isContentEditable) {
            return;
        }

        if (event.key === "Enter" && (elements.card.hidden || state.isSessionFinished)) {
            event.preventDefault();
            startSession(elements);
            return;
        }

        if (event.key === "Enter") {
            event.preventDefault();
            if (state.answered) {
                if (!elements.next.hidden) {
                    nextQuestion(elements);
                }
                return;
            }

            submitAnswer(elements);
            return;
        }

        const optionIndex = getKeyboardOptionIndex(event);
        if (optionIndex !== null && !elements.card.hidden && !state.answered) {
            if (optionIndex > state.visibleOptionCount) {
                return;
            }

            const answerLabel = String.fromCharCode(64 + optionIndex);
            const optionButton = elements.options.querySelector(`[data-answer="${answerLabel}"]`);
            if (!optionButton) {
                return;
            }

            event.preventDefault();
            toggleOption(optionButton);
        }
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
        if (state.keyboardHandler) {
            document.removeEventListener("keydown", state.keyboardHandler);
        }
        state.keyboardHandler = (event) => handleKeyboard(event, elements);
        document.addEventListener("keydown", state.keyboardHandler);
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
