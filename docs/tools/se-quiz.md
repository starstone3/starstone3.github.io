---
comments: true
---

# 软件工程刷题器

感谢[98](https://www.cc98.org/topic/6210402)

<section id="se-quiz-app" class="se-quiz" data-source="../../data/se-tiku.json">
    <header class="se-quiz__header">
        <div>
            <h2>软件工程客观题</h2>
            <p>选择章节范围、判断题数量和选择题数量后开始练习，答案提交后立即显示判题结果。</p>
        </div>
        <div class="se-quiz__meter">
            <span id="se-quiz-score" class="se-quiz__score">0 / 0</span>
            <span>本轮正确</span>
        </div>
    </header>

    <div class="se-quiz__toolbar">
        <div class="se-quiz__field">
            <label for="se-quiz-scope">题目范围</label>
            <select id="se-quiz-scope">
                <option value="all">全部章节</option>
                <option value="chapter">指定章节</option>
                <option value="range">章节范围</option>
            </select>
        </div>
        <div class="se-quiz__field">
            <label for="se-quiz-start-chapter">起始章节</label>
            <input id="se-quiz-start-chapter" type="number" min="1" value="1">
        </div>
        <div class="se-quiz__field">
            <label for="se-quiz-end-chapter">结束章节</label>
            <input id="se-quiz-end-chapter" type="number" min="1" value="5">
        </div>
        <div class="se-quiz__field">
            <label for="se-quiz-judge-count">判断题数量</label>
            <input id="se-quiz-judge-count" type="number" min="0" placeholder="全部">
        </div>
        <div class="se-quiz__field">
            <label for="se-quiz-choice-count">选择题数量</label>
            <input id="se-quiz-choice-count" type="number" min="0" placeholder="全部">
        </div>
        <label class="se-quiz__check">
            <input id="se-quiz-random" type="checkbox" checked>
            <span>随机出题</span>
        </label>
        <label class="se-quiz__check">
            <input id="se-quiz-shuffle-options" type="checkbox">
            <span>打乱选项</span>
        </label>
        <button id="se-quiz-start" class="se-quiz__primary" type="button">开始</button>
    </div>

    <div id="se-quiz-error" class="se-quiz__error" hidden></div>

    <div class="se-quiz__status">
        <div>
            <div id="se-quiz-progress-text" class="se-quiz__progress-text">尚未开始</div>
            <div class="se-quiz__bar" aria-hidden="true">
                <div id="se-quiz-progress-bar" class="se-quiz__bar-fill"></div>
            </div>
        </div>
    </div>

    <article id="se-quiz-card" class="se-quiz__card" hidden>
        <div id="se-quiz-chapter-label" class="se-quiz__chapter"></div>
        <h2 id="se-quiz-topic" class="se-quiz__topic"></h2>
        <div id="se-quiz-options" class="se-quiz__options"></div>
        <div id="se-quiz-feedback" class="se-quiz__feedback" hidden></div>
        <div class="se-quiz__actions">
            <button id="se-quiz-submit" class="se-quiz__primary" type="button">提交答案</button>
            <button id="se-quiz-next" class="se-quiz__secondary" type="button" hidden>下一题</button>
        </div>
    </article>
</section>
