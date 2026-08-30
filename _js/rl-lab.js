(() => {
    "use strict";

    const svgNamespace = "http://www.w3.org/2000/svg";
    const actions = [
        { key: "up", label: "上", arrow: "↑", dx: 0, dy: -1 },
        { key: "right", label: "右", arrow: "→", dx: 1, dy: 0 },
        { key: "down", label: "下", arrow: "↓", dx: 0, dy: 1 },
        { key: "left", label: "左", arrow: "←", dx: -1, dy: 0 },
    ];
    const actionByKey = new Map(actions.map((action) => [action.key, action]));
    const gridWorld = {
        width: 5,
        height: 5,
        start: { x: 0, y: 4 },
        goal: { x: 4, y: 0 },
        trap: { x: 4, y: 2 },
        walls: new Set(["1,1", "3,2"]),
        stepReward: -0.04,
        goalReward: 1,
        trapReward: -1,
    };
    const activeControllersKey = Symbol.for("starstone3.rl-lab.active-controllers");
    const activeControllers = window[activeControllersKey] instanceof Map
        ? window[activeControllersKey]
        : new Map();
    window[activeControllersKey] = activeControllers;

    function createElement(tagName, className, textContent) {
        const element = document.createElement(tagName);
        if (className) {
            element.className = className;
        }
        if (textContent !== undefined) {
            element.textContent = textContent;
        }
        return element;
    }

    function createSvgElement(tagName, attributes = {}) {
        const element = document.createElementNS(svgNamespace, tagName);
        Object.entries(attributes).forEach(([name, value]) => {
            element.setAttribute(name, String(value));
        });
        return element;
    }

    function clamp(value, minimum, maximum) {
        return Math.min(maximum, Math.max(minimum, value));
    }

    function formatNumber(value, digits = 3) {
        const normalized = Math.abs(value) < 1e-10 ? 0 : value;
        return normalized.toFixed(digits).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
    }

    function stateKey(state) {
        return `${state.x},${state.y}`;
    }

    function sameState(left, right) {
        return left.x === right.x && left.y === right.y;
    }

    function formatState(state) {
        return `(${state.x + 1}, ${gridWorld.height - state.y})`;
    }

    function createSeededRandom(seed) {
        let state = Number(seed) >>> 0;
        if (state === 0) {
            state = 0x6d2b79f5;
        }
        return () => {
            state += 0x6d2b79f5;
            let value = state;
            value = Math.imul(value ^ (value >>> 15), value | 1);
            value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
            return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
        };
    }

    function discountedReturn(rewards, gamma, startIndex = 0) {
        let total = 0;
        let discount = 1;
        for (let index = startIndex; index < rewards.length; index += 1) {
            total += discount * rewards[index];
            discount *= gamma;
        }
        return total;
    }

    function isTerminal(state) {
        return sameState(state, gridWorld.goal) || sameState(state, gridWorld.trap);
    }

    function isAvailable(state) {
        return state.x >= 0
            && state.x < gridWorld.width
            && state.y >= 0
            && state.y < gridWorld.height
            && !gridWorld.walls.has(stateKey(state));
    }

    function applyAction(state, action) {
        const candidate = { x: state.x + action.dx, y: state.y + action.dy };
        return isAvailable(candidate) ? candidate : { ...state };
    }

    function rewardForState(state) {
        if (sameState(state, gridWorld.goal)) {
            return gridWorld.goalReward;
        }
        if (sameState(state, gridWorld.trap)) {
            return gridWorld.trapReward;
        }
        return gridWorld.stepReward;
    }

    function transitionOutcomes(state, intendedActionKey, slipProbability) {
        if (isTerminal(state)) {
            return [{ probability: 1, state: { ...state }, reward: 0, actualActions: [intendedActionKey] }];
        }

        const intendedIndex = actions.findIndex((action) => action.key === intendedActionKey);
        const leftIndex = (intendedIndex + actions.length - 1) % actions.length;
        const rightIndex = (intendedIndex + 1) % actions.length;
        const candidates = [
            { action: actions[intendedIndex], probability: 1 - slipProbability },
            { action: actions[leftIndex], probability: slipProbability / 2 },
            { action: actions[rightIndex], probability: slipProbability / 2 },
        ];
        const grouped = new Map();

        candidates.forEach(({ action, probability }) => {
            if (probability <= 0) {
                return;
            }
            const nextState = applyAction(state, action);
            const key = stateKey(nextState);
            if (!grouped.has(key)) {
                grouped.set(key, {
                    probability: 0,
                    state: nextState,
                    reward: rewardForState(nextState),
                    actualActions: [],
                });
            }
            const outcome = grouped.get(key);
            outcome.probability += probability;
            outcome.actualActions.push(action.key);
        });

        return Array.from(grouped.values());
    }

    function sampleTransition(state, actionKey, slipProbability, random) {
        const outcomes = transitionOutcomes(state, actionKey, slipProbability);
        const draw = random();
        let cumulative = 0;
        for (const outcome of outcomes) {
            cumulative += outcome.probability;
            if (draw <= cumulative + Number.EPSILON) {
                return outcome;
            }
        }
        return outcomes[outcomes.length - 1];
    }

    function getStates() {
        const states = [];
        for (let y = 0; y < gridWorld.height; y += 1) {
            for (let x = 0; x < gridWorld.width; x += 1) {
                const state = { x, y };
                if (isAvailable(state)) {
                    states.push(state);
                }
            }
        }
        return states;
    }

    function qValue(state, actionKey, values, gamma, slipProbability) {
        return transitionOutcomes(state, actionKey, slipProbability).reduce((total, outcome) => {
            const nextValue = isTerminal(outcome.state) ? 0 : (values.get(stateKey(outcome.state)) || 0);
            return total + outcome.probability * (outcome.reward + gamma * nextValue);
        }, 0);
    }

    function greedyAction(state, values, gamma, slipProbability) {
        let bestAction = actions[0].key;
        let bestValue = -Infinity;
        actions.forEach((action) => {
            const candidate = qValue(state, action.key, values, gamma, slipProbability);
            if (candidate > bestValue + 1e-10) {
                bestValue = candidate;
                bestAction = action.key;
            }
        });
        return bestAction;
    }

    function createInitialPolicy() {
        const policy = new Map();
        getStates().forEach((state) => {
            if (!isTerminal(state)) {
                policy.set(stateKey(state), (state.x + state.y) % 2 === 0 ? "right" : "up");
            }
        });
        return policy;
    }

    function sweepValues(values, mode, gamma, slipProbability, policy = null) {
        const nextValues = new Map();
        let residual = 0;
        let changedState = null;
        let changedFrom = 0;
        let changedTo = 0;

        getStates().forEach((state) => {
            const key = stateKey(state);
            if (isTerminal(state)) {
                nextValues.set(key, 0);
                return;
            }
            const qValues = actions.map((action) => qValue(state, action.key, values, gamma, slipProbability));
            let nextValue;
            if (mode === "optimal") {
                nextValue = Math.max(...qValues);
            } else if (mode === "policy" && policy) {
                const actionKey = policy.get(key) || actions[0].key;
                nextValue = qValues[actions.findIndex((action) => action.key === actionKey)];
            } else {
                nextValue = qValues.reduce((sum, value) => sum + value, 0) / qValues.length;
            }
            const previousValue = values.get(key) || 0;
            const difference = Math.abs(nextValue - previousValue);
            nextValues.set(key, nextValue);
            if (difference > residual) {
                residual = difference;
                changedState = state;
                changedFrom = previousValue;
                changedTo = nextValue;
            }
        });

        return { values: nextValues, residual, changedState, changedFrom, changedTo };
    }

    function evaluateValues(mode, gamma, slipProbability, policy = null, maximumIterations = 600) {
        let values = new Map(getStates().map((state) => [stateKey(state), 0]));
        let residual = Infinity;
        let iteration = 0;
        while (residual > 1e-9 && iteration < maximumIterations) {
            const result = sweepValues(values, mode, gamma, slipProbability, policy);
            values = result.values;
            residual = result.residual;
            iteration += 1;
        }
        return values;
    }

    function policyFromValues(values, gamma, slipProbability) {
        const policy = new Map();
        getStates().forEach((state) => {
            if (!isTerminal(state)) {
                policy.set(stateKey(state), greedyAction(state, values, gamma, slipProbability));
            }
        });
        return policy;
    }

    function setRootContent(root, markup) {
        root.innerHTML = markup;
        root.dataset.ready = "true";
        root.classList.add("is-mounted");
    }

    function createGridSvg({ values = null, policy = null, agent = null, selected = null, path = [], onSelect = null, label }) {
        const cellSize = 88;
        const width = gridWorld.width * cellSize;
        const height = gridWorld.height * cellSize;
        const svg = createSvgElement("svg", {
            class: "rl-grid",
            viewBox: `0 0 ${width} ${height}`,
            role: onSelect ? "group" : "img",
            "aria-label": label,
        });
        const maximumMagnitude = values
            ? Math.max(0.001, ...Array.from(values.values(), (value) => Math.abs(value)))
            : 1;

        if (path.length > 1) {
            const points = path.map((state) => `${state.x * cellSize + cellSize / 2},${state.y * cellSize + cellSize / 2}`).join(" ");
            svg.appendChild(createSvgElement("polyline", { class: "rl-grid__path", points }));
        }

        for (let y = 0; y < gridWorld.height; y += 1) {
            for (let x = 0; x < gridWorld.width; x += 1) {
                const state = { x, y };
                const key = stateKey(state);
                const group = createSvgElement("g", {
                    class: `rl-grid__cell${selected && sameState(selected, state) ? " is-current" : ""}`,
                    role: onSelect && isAvailable(state) ? "button" : "img",
                    "aria-label": isAvailable(state) ? `状态 ${formatState(state)}` : "不可进入的格子",
                });
                if (onSelect && isAvailable(state)) {
                    group.setAttribute("tabindex", "0");
                    group.setAttribute("aria-pressed", String(Boolean(selected && sameState(selected, state))));
                    group.addEventListener("click", () => onSelect(state));
                    group.addEventListener("keydown", (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onSelect(state);
                        }
                    });
                }
                const baseClass = gridWorld.walls.has(key)
                    ? "rl-grid__base rl-grid__wall"
                    : sameState(state, gridWorld.goal)
                        ? "rl-grid__base rl-grid__goal"
                        : sameState(state, gridWorld.trap)
                            ? "rl-grid__base rl-grid__trap"
                            : "rl-grid__base";
                group.appendChild(createSvgElement("rect", {
                    class: baseClass,
                    x: x * cellSize + 2,
                    y: y * cellSize + 2,
                    width: cellSize - 4,
                    height: cellSize - 4,
                    rx: 10,
                }));

                if (values && isAvailable(state) && !isTerminal(state)) {
                    const value = values.get(key) || 0;
                    const opacity = 0.08 + 0.34 * Math.abs(value) / maximumMagnitude;
                    const heatColor = value >= 0 ? `rgba(21, 159, 175, ${opacity})` : `rgba(220, 98, 123, ${opacity})`;
                    group.appendChild(createSvgElement("rect", {
                        class: "rl-grid__heat",
                        x: x * cellSize + 5,
                        y: y * cellSize + 5,
                        width: cellSize - 10,
                        height: cellSize - 10,
                        rx: 8,
                        fill: heatColor,
                    }));
                    const valueText = createSvgElement("text", {
                        class: "rl-grid__value",
                        x: x * cellSize + cellSize / 2,
                        y: y * cellSize + cellSize - 12,
                    });
                    valueText.textContent = formatNumber(value, 2);
                    group.appendChild(valueText);
                }

                let labelText = "";
                if (gridWorld.walls.has(key)) {
                    labelText = "墙";
                } else if (sameState(state, gridWorld.goal)) {
                    labelText = "+1 终点";
                } else if (sameState(state, gridWorld.trap)) {
                    labelText = "−1 陷阱";
                } else if (sameState(state, gridWorld.start)) {
                    labelText = "起点";
                }
                if (labelText) {
                    const text = createSvgElement("text", {
                        class: "rl-grid__label",
                        x: x * cellSize + cellSize / 2,
                        y: y * cellSize + 20,
                    });
                    text.textContent = labelText;
                    group.appendChild(text);
                }

                if (policy && policy.has(key) && !isTerminal(state)) {
                    const policyText = createSvgElement("text", {
                        class: "rl-grid__policy",
                        x: x * cellSize + cellSize / 2,
                        y: y * cellSize + cellSize / 2 + 8,
                    });
                    policyText.textContent = actionByKey.get(policy.get(key)).arrow;
                    group.appendChild(policyText);
                }
                svg.appendChild(group);
            }
        }

        if (agent) {
            svg.appendChild(createSvgElement("circle", {
                class: "rl-grid__agent",
                cx: agent.x * cellSize + cellSize / 2,
                cy: agent.y * cellSize + cellSize / 2,
                r: 13,
            }));
        }
        return svg;
    }

    function createLineChart(series, options = {}) {
        const width = 460;
        const height = 190;
        const padding = { top: 14, right: 16, bottom: 30, left: 38 };
        const allValues = series.flatMap((entry) => entry.values).filter(Number.isFinite);
        const minimum = options.minimum !== undefined ? options.minimum : Math.min(0, ...allValues);
        const maximum = options.maximum !== undefined ? options.maximum : Math.max(1, ...allValues);
        const span = Math.max(1e-9, maximum - minimum);
        const maximumLength = Math.max(2, ...series.map((entry) => entry.values.length));
        const xForIndex = (index) => padding.left + index / (maximumLength - 1) * (width - padding.left - padding.right);
        const yForValue = (value) => padding.top + (maximum - value) / span * (height - padding.top - padding.bottom);
        const svg = createSvgElement("svg", {
            class: "rl-chart",
            viewBox: `0 0 ${width} ${height}`,
            role: "img",
            "aria-label": options.label || "数值变化曲线",
        });

        for (let index = 0; index <= 4; index += 1) {
            const y = padding.top + index / 4 * (height - padding.top - padding.bottom);
            svg.appendChild(createSvgElement("line", {
                class: "rl-chart__grid",
                x1: padding.left,
                x2: width - padding.right,
                y1: y,
                y2: y,
            }));
            const label = createSvgElement("text", {
                class: "rl-chart__label",
                x: padding.left - 7,
                y: y + 3,
                "text-anchor": "end",
            });
            label.textContent = formatNumber(maximum - index / 4 * span, 2);
            svg.appendChild(label);
        }
        svg.appendChild(createSvgElement("line", {
            class: "rl-chart__axis",
            x1: padding.left,
            x2: width - padding.right,
            y1: height - padding.bottom,
            y2: height - padding.bottom,
        }));

        series.forEach((entry, seriesIndex) => {
            if (entry.values.length === 0) {
                return;
            }
            const points = entry.values.map((value, index) => `${xForIndex(index)},${yForValue(value)}`).join(" ");
            const className = seriesIndex === 0
                ? "rl-chart__line"
                : seriesIndex === 1
                    ? "rl-chart__line rl-chart__line--secondary"
                    : "rl-chart__line rl-chart__line--tertiary";
            svg.appendChild(createSvgElement("polyline", { class: className, points }));
        });

        if (options.xLabels) {
            options.xLabels.forEach((text, index) => {
                const label = createSvgElement("text", {
                    class: "rl-chart__label",
                    x: xForIndex(index),
                    y: height - 10,
                    "text-anchor": "middle",
                });
                label.textContent = text;
                svg.appendChild(label);
            });
        }
        return svg;
    }

    function mountMdpLab(root) {
        setRootContent(root, `
            <div class="rl-lab__shell">
                <header class="rl-lab__header">
                    <div class="rl-lab__header-copy">
                        <p class="rl-lab__eyebrow">MDP</p>
                        <h2>走几步，看看记录里多了什么</h2>
                        <p>用方向键、WASD 或按钮移动。左边走格子，右边记下每一步的状态、动作和奖励。</p>
                    </div>
                    <span class="rl-lab__status-chip">相同种子可复现</span>
                </header>
                <div class="rl-lab__controls">
                    <div class="rl-lab__field rl-lab__field--wide">
                        <label for="rl-mdp-gamma">折扣因子 γ：<span class="rl-lab__range-value" data-output="gamma">0.90</span></label>
                        <input id="rl-mdp-gamma" data-control="gamma" type="range" min="0" max="1" step="0.05" value="0.9">
                    </div>
                    <div class="rl-lab__field rl-lab__field--wide">
                        <label for="rl-mdp-slip">打滑概率：<span class="rl-lab__range-value" data-output="slip">0.10</span></label>
                        <input id="rl-mdp-slip" data-control="slip" type="range" min="0" max="0.6" step="0.05" value="0.1">
                    </div>
                    <div class="rl-lab__field">
                        <label for="rl-mdp-seed">随机种子</label>
                        <input id="rl-mdp-seed" data-control="seed" type="number" min="1" step="1" value="7">
                    </div>
                    <div class="rl-lab__actions">
                        <button data-action="reset" type="button">回到起点</button>
                    </div>
                </div>
                <div class="rl-lab__workspace">
                    <div class="rl-lab__stage">
                        <div class="rl-lab__stage-head"><h3>网格世界</h3><span>选中实验区后可按方向键</span></div>
                        <div class="rl-grid-wrap" data-view="grid"></div>
                        <div class="rl-dpad" aria-label="移动智能体">
                            <button data-action="up" type="button" aria-label="向上">↑</button>
                            <button data-action="left" type="button" aria-label="向左">←</button>
                            <button data-action="down" type="button" aria-label="向下">↓</button>
                            <button data-action="right" type="button" aria-label="向右">→</button>
                        </div>
                    </div>
                    <div class="rl-lab__inspector">
                        <div class="rl-lab__inspector-head"><h3>刚才走过的路</h3><span data-view="position"></span></div>
                        <div class="rl-equation" data-view="equation"></div>
                        <ol class="rl-timeline" data-view="timeline"></ol>
                        <p class="rl-lab__summary" data-view="summary" aria-live="polite"></p>
                    </div>
                </div>
            </div>
        `);

        const grid = root.querySelector('[data-view="grid"]');
        const equation = root.querySelector('[data-view="equation"]');
        const timeline = root.querySelector('[data-view="timeline"]');
        const summary = root.querySelector('[data-view="summary"]');
        const position = root.querySelector('[data-view="position"]');
        const gammaInput = root.querySelector('[data-control="gamma"]');
        const slipInput = root.querySelector('[data-control="slip"]');
        const seedInput = root.querySelector('[data-control="seed"]');
        const gammaOutput = root.querySelector('[data-output="gamma"]');
        const slipOutput = root.querySelector('[data-output="slip"]');
        let state;
        let history;
        let random;

        function reset() {
            state = { ...gridWorld.start };
            history = [];
            random = createSeededRandom(Number(seedInput.value));
            summary.textContent = "还没走。智能体在起点，选一个方向就会得到下一状态和奖励。";
            render();
        }

        function renderEquation() {
            const gamma = Number(gammaInput.value);
            const rewards = history.map((entry) => entry.reward);
            if (rewards.length === 0) {
                equation.innerHTML = "<strong>G₀</strong> = R₁ + γR₂ + γ²R₃ + ⋯<br>走一步，这里就会换成实际数字。";
                return;
            }
            const visibleRewards = rewards.slice(0, 6);
            const terms = visibleRewards.map((reward, index) => {
                const coefficient = index === 0 ? "" : index === 1 ? `${formatNumber(gamma, 2)} × ` : `${formatNumber(gamma, 2)}<sup>${index}</sup> × `;
                return `${coefficient}(${formatNumber(reward, 2)})`;
            });
            if (rewards.length > visibleRewards.length) {
                terms.push("⋯");
            }
            equation.innerHTML = `<strong>G₀</strong> = ${terms.join(" + ")}<br><strong>= ${formatNumber(discountedReturn(rewards, gamma), 3)}</strong>`;
        }

        function renderTimeline() {
            timeline.replaceChildren();
            history.slice(-9).forEach((entry, index) => {
                const item = createElement("li", "rl-timeline__item");
                const step = createElement("span", "rl-timeline__step", `t=${history.length - Math.min(9, history.length) + index}`);
                const transition = createElement(
                    "span",
                    "rl-timeline__transition",
                    `${formatState(entry.from)} · ${actionByKey.get(entry.action).arrow} → ${formatState(entry.to)}`,
                );
                const rewardClass = entry.reward >= 0 ? "is-positive" : "is-negative";
                const reward = createElement("span", `rl-timeline__reward ${rewardClass}`, `r=${formatNumber(entry.reward, 2)}`);
                item.append(step, transition, reward);
                timeline.appendChild(item);
            });
        }

        function render() {
            gammaOutput.textContent = Number(gammaInput.value).toFixed(2);
            slipOutput.textContent = Number(slipInput.value).toFixed(2);
            position.textContent = `当前状态 ${formatState(state)}`;
            grid.replaceChildren(createGridSvg({
                agent: state,
                path: [gridWorld.start, ...history.map((entry) => entry.to)],
                label: `五乘五网格世界，智能体位于 ${formatState(state)}`,
            }));
            renderEquation();
            renderTimeline();
        }

        function takeAction(actionKey) {
            if (isTerminal(state)) {
                summary.textContent = "这一回合结束了。点“回到起点”可以重来。";
                return;
            }
            const from = { ...state };
            const outcome = sampleTransition(state, actionKey, Number(slipInput.value), random);
            state = { ...outcome.state };
            history.push({ from, to: { ...state }, action: actionKey, reward: outcome.reward });
            const terminalText = sameState(state, gridWorld.goal)
                ? "到达终点，这一回合结束。"
                : sameState(state, gridWorld.trap)
                    ? "掉进陷阱，这一回合结束。"
                : "还没结束，可以继续走。";
            summary.innerHTML = `你选择了<strong>向${actionByKey.get(actionKey).label}</strong>，这次得到 <strong>${formatNumber(outcome.reward, 2)}</strong> 分。${terminalText}`;
            render();
        }

        root.querySelectorAll("[data-action]").forEach((button) => {
            button.addEventListener("click", () => {
                if (button.dataset.action === "reset") {
                    reset();
                } else {
                    takeAction(button.dataset.action);
                }
            });
        });
        gammaInput.addEventListener("input", render);
        slipInput.addEventListener("input", render);
        seedInput.addEventListener("change", reset);

        const keyboardHandler = (event) => {
            const target = event.target;
            if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement) {
                return;
            }
            const mapping = {
                ArrowUp: "up",
                w: "up",
                W: "up",
                ArrowRight: "right",
                d: "right",
                D: "right",
                ArrowDown: "down",
                s: "down",
                S: "down",
                ArrowLeft: "left",
                a: "left",
                A: "left",
            };
            if (mapping[event.key]) {
                event.preventDefault();
                takeAction(mapping[event.key]);
            }
        };
        root.setAttribute("tabindex", "0");
        root.addEventListener("keydown", keyboardHandler);
        reset();
        return {
            cleanup() {
                root.removeEventListener("keydown", keyboardHandler);
            },
        };
    }

    function mountBellmanLab(root) {
        const initialMode = root.dataset.mode === "optimal" ? "optimal" : "policy-average";
        setRootContent(root, `
            <div class="rl-lab__shell">
                <header class="rl-lab__header">
                    <div class="rl-lab__header-copy">
                        <p class="rl-lab__eyebrow">Bellman 更新</p>
                        <h2>这一格到底值多少</h2>
                        <p>点一个普通格子。右边会分别算出四个动作的即时奖励和后续价值。</p>
                    </div>
                    <span class="rl-lab__status-chip">策略平均 / 取最大值</span>
                </header>
                <div class="rl-lab__controls">
                    <div class="rl-lab__segmented" aria-label="Bellman 计算方式">
                        <button data-mode="policy-average" type="button">按策略平均</button>
                        <button data-mode="optimal" type="button">选择最大值</button>
                    </div>
                    <div class="rl-lab__field rl-lab__field--wide">
                        <label for="rl-bellman-gamma">折扣因子 γ：<span class="rl-lab__range-value" data-output="gamma">0.90</span></label>
                        <input id="rl-bellman-gamma" data-control="gamma" type="range" min="0" max="0.99" step="0.05" value="0.9">
                    </div>
                    <div class="rl-lab__field rl-lab__field--wide">
                        <label for="rl-bellman-slip">打滑概率：<span class="rl-lab__range-value" data-output="slip">0.10</span></label>
                        <input id="rl-bellman-slip" data-control="slip" type="range" min="0" max="0.6" step="0.05" value="0.1">
                    </div>
                </div>
                <div class="rl-lab__workspace">
                    <div class="rl-lab__stage">
                        <div class="rl-lab__stage-head"><h3>价值地图</h3><span>点击任意可进入格</span></div>
                        <div class="rl-grid-wrap" data-view="grid"></div>
                    </div>
                    <div class="rl-lab__inspector">
                        <div class="rl-lab__inspector-head"><h3>这一步怎么算</h3><span data-view="selected"></span></div>
                        <div class="rl-equation" data-view="equation"></div>
                        <div class="rl-ledger" data-view="ledger"></div>
                        <ul class="rl-branch-list" data-view="branches"></ul>
                        <p class="rl-lab__summary" data-view="summary" aria-live="polite"></p>
                    </div>
                </div>
            </div>
        `);

        const grid = root.querySelector('[data-view="grid"]');
        const equation = root.querySelector('[data-view="equation"]');
        const ledger = root.querySelector('[data-view="ledger"]');
        const branches = root.querySelector('[data-view="branches"]');
        const selectedLabel = root.querySelector('[data-view="selected"]');
        const summary = root.querySelector('[data-view="summary"]');
        const gammaInput = root.querySelector('[data-control="gamma"]');
        const slipInput = root.querySelector('[data-control="slip"]');
        const gammaOutput = root.querySelector('[data-output="gamma"]');
        const slipOutput = root.querySelector('[data-output="slip"]');
        const modeButtons = Array.from(root.querySelectorAll("[data-mode]"));
        let mode = initialMode;
        let selected = { x: 2, y: 3 };
        let selectedAction = null;

        function render() {
            const gamma = Number(gammaInput.value);
            const slip = Number(slipInput.value);
            const valueMode = mode === "optimal" ? "optimal" : "policy-average";
            const values = evaluateValues(valueMode, gamma, slip);
            const policy = mode === "optimal" ? policyFromValues(values, gamma, slip) : null;
            const qValues = actions.map((action) => ({
                action,
                value: qValue(selected, action.key, values, gamma, slip),
            }));
            const best = qValues.reduce((current, candidate) => candidate.value > current.value ? candidate : current);
            if (!qValues.some((entry) => entry.action.key === selectedAction)) {
                selectedAction = best.action.key;
            }

            gammaOutput.textContent = gamma.toFixed(2);
            slipOutput.textContent = slip.toFixed(2);
            selectedLabel.textContent = `状态 ${formatState(selected)}`;
            modeButtons.forEach((button) => {
                const active = button.dataset.mode === mode;
                button.classList.toggle("is-active", active);
                button.setAttribute("aria-pressed", String(active));
            });
            grid.replaceChildren(createGridSvg({
                values,
                policy,
                selected,
                onSelect(state) {
                    if (isTerminal(state)) {
                        summary.textContent = "终止状态没有下一步。换个普通格子试试。";
                        return;
                    }
                    selected = state;
                    summary.textContent = `现在看状态 ${formatState(state)}。右边已经按这个位置重算。`;
                    render();
                },
                label: `Bellman 价值地图，当前选择状态 ${formatState(selected)}`,
            }));

            const qText = qValues.map((entry) => `${entry.action.arrow} ${formatNumber(entry.value, 3)}`).join("，");
            if (mode === "optimal") {
                equation.innerHTML = `<strong>V*(s)</strong> = maxₐ Q*(s,a)<br>= max{ ${qText} }<br><strong>= ${formatNumber(best.value, 3)}</strong>`;
            } else {
                const average = qValues.reduce((total, entry) => total + entry.value, 0) / qValues.length;
                equation.innerHTML = `<strong>Vπ(s)</strong> = ¼ Σₐ Qπ(s,a)<br>= ¼ × (${qValues.map((entry) => formatNumber(entry.value, 3)).join(" + ")})<br><strong>= ${formatNumber(average, 3)}</strong>`;
            }

            const maximumMagnitude = Math.max(0.001, ...qValues.map((entry) => Math.abs(entry.value)));
            ledger.replaceChildren();
            qValues.forEach((entry) => {
                const row = createElement("button", `rl-ledger__row${selectedAction === entry.action.key ? " is-active" : ""}`);
                row.type = "button";
                row.setAttribute("aria-label", `查看向${entry.action.label}的分支明细`);
                row.setAttribute("aria-pressed", String(selectedAction === entry.action.key));
                const action = createElement("span", "", entry.action.arrow);
                const bar = createElement("span", "rl-ledger__bar");
                const barFill = createElement("span");
                barFill.style.width = `${Math.max(4, Math.abs(entry.value) / maximumMagnitude * 100)}%`;
                bar.appendChild(barFill);
                const value = createElement("span", "rl-ledger__value", formatNumber(entry.value, 3));
                row.append(action, bar, value);
                row.addEventListener("click", () => {
                    selectedAction = entry.action.key;
                    summary.textContent = `下面列的是向${entry.action.label}时可能出现的结果。`;
                    render();
                });
                ledger.appendChild(row);
            });

            branches.replaceChildren();
            transitionOutcomes(selected, selectedAction, slip).forEach((outcome) => {
                const nextValue = isTerminal(outcome.state) ? 0 : (values.get(stateKey(outcome.state)) || 0);
                const contribution = outcome.probability * (outcome.reward + gamma * nextValue);
                const item = createElement("li");
                item.append(
                    createElement("span", "", `${formatNumber(outcome.probability, 2)} × [${formatNumber(outcome.reward, 2)} + ${formatNumber(gamma, 2)} × ${formatNumber(nextValue, 3)}]`),
                    createElement("strong", "", formatNumber(contribution, 3)),
                );
                branches.appendChild(item);
            });
            if (!summary.textContent) {
                summary.innerHTML = mode === "optimal"
                    ? "这里的 <strong>max</strong> 是在四个动作中选最大值，不是在猜环境会走向哪里。"
                    : "这里假设四个动作等概率，因此先分别计算，再取平均。";
            }
        }

        modeButtons.forEach((button) => {
            button.addEventListener("click", () => {
                mode = button.dataset.mode;
                selectedAction = mode === "optimal" ? null : selectedAction;
                summary.textContent = mode === "optimal"
                    ? "已切到最优方程：四个动作不取平均，只留最大值。"
                    : "已切回策略方程：四个动作按等概率计算。";
                render();
            });
        });
        gammaInput.addEventListener("input", render);
        slipInput.addEventListener("input", render);
        render();
        return { cleanup() {} };
    }

    function improvePolicy(policy, values, gamma, slipProbability) {
        const nextPolicy = new Map(policy);
        let stable = true;
        getStates().forEach((state) => {
            if (isTerminal(state)) {
                return;
            }
            const key = stateKey(state);
            const actionKey = greedyAction(state, values, gamma, slipProbability);
            if (nextPolicy.get(key) !== actionKey) {
                stable = false;
                nextPolicy.set(key, actionKey);
            }
        });
        return { policy: nextPolicy, stable };
    }

    function maximumValueDifference(left, right) {
        let residual = 0;
        let changedState = null;
        let changedFrom = 0;
        let changedTo = 0;
        getStates().forEach((state) => {
            const key = stateKey(state);
            const leftValue = left.get(key) || 0;
            const rightValue = right.get(key) || 0;
            const difference = Math.abs(leftValue - rightValue);
            if (difference > residual) {
                residual = difference;
                changedState = state;
                changedFrom = leftValue;
                changedTo = rightValue;
            }
        });
        return { residual, changedState, changedFrom, changedTo };
    }

    function mountIterationLab(root) {
        setRootContent(root, `
            <div class="rl-lab__shell">
                <header class="rl-lab__header">
                    <div class="rl-lab__header-copy">
                        <p class="rl-lab__eyebrow">值迭代 / 策略迭代</p>
                        <h2>一轮一轮算，什么时候停</h2>
                        <p>每点一次“算一轮”，值迭代会做一次同步更新；策略迭代会评估并改进策略；截断版本只评估三次。</p>
                    </div>
                    <span class="rl-lab__status-chip" data-view="run-status" role="status" aria-live="polite">等待开始</span>
                </header>
                <div class="rl-lab__controls">
                    <div class="rl-lab__field">
                        <label for="rl-iteration-algorithm">算法</label>
                        <select id="rl-iteration-algorithm" data-control="algorithm">
                            <option value="value">值迭代</option>
                            <option value="policy">策略迭代</option>
                            <option value="truncated">截断策略迭代</option>
                        </select>
                    </div>
                    <div class="rl-lab__field rl-lab__field--wide">
                        <label for="rl-iteration-gamma">折扣因子 γ：<span class="rl-lab__range-value" data-output="gamma">0.90</span></label>
                        <input id="rl-iteration-gamma" data-control="gamma" type="range" min="0.1" max="0.99" step="0.05" value="0.9">
                    </div>
                    <div class="rl-lab__field rl-lab__field--wide">
                        <label for="rl-iteration-slip">打滑概率：<span class="rl-lab__range-value" data-output="slip">0.10</span></label>
                        <input id="rl-iteration-slip" data-control="slip" type="range" min="0" max="0.5" step="0.05" value="0.1">
                    </div>
                    <div class="rl-lab__actions">
                        <button class="rl-lab__primary" data-action="step" type="button">算一轮</button>
                        <button data-action="auto" type="button">连续计算</button>
                        <button data-action="reset" type="button">重置</button>
                    </div>
                </div>
                <div class="rl-lab__workspace">
                    <div class="rl-lab__stage">
                        <div class="rl-lab__stage-head"><h3>价值与策略</h3><span data-view="iteration-label">第 0 轮</span></div>
                        <div class="rl-grid-wrap" data-view="grid"></div>
                    </div>
                    <div class="rl-lab__inspector">
                        <div class="rl-lab__inspector-head"><h3>还差多少</h3><span>每次按当前算法完成一轮</span></div>
                        <div class="rl-metric-strip">
                            <div class="rl-metric"><span>迭代轮数</span><strong data-view="iteration">0</strong></div>
                            <div class="rl-metric"><span>Bellman residual</span><strong data-view="residual">—</strong></div>
                            <div class="rl-metric"><span>策略状态</span><strong data-view="policy-status">未稳定</strong></div>
                        </div>
                        <div class="rl-equation" data-view="equation"></div>
                        <div class="rl-chart-wrap" data-view="chart"></div>
                        <div class="rl-legend"><span>residual</span></div>
                        <p class="rl-lab__summary" data-view="summary"></p>
                    </div>
                </div>
            </div>
        `);

        const algorithmInput = root.querySelector('[data-control="algorithm"]');
        const gammaInput = root.querySelector('[data-control="gamma"]');
        const slipInput = root.querySelector('[data-control="slip"]');
        const gammaOutput = root.querySelector('[data-output="gamma"]');
        const slipOutput = root.querySelector('[data-output="slip"]');
        const grid = root.querySelector('[data-view="grid"]');
        const chart = root.querySelector('[data-view="chart"]');
        const iterationValue = root.querySelector('[data-view="iteration"]');
        const iterationLabel = root.querySelector('[data-view="iteration-label"]');
        const residualValue = root.querySelector('[data-view="residual"]');
        const policyStatus = root.querySelector('[data-view="policy-status"]');
        const equation = root.querySelector('[data-view="equation"]');
        const summary = root.querySelector('[data-view="summary"]');
        const runStatus = root.querySelector('[data-view="run-status"]');
        const autoButton = root.querySelector('[data-action="auto"]');
        let values;
        let policy;
        let iteration;
        let residualHistory;
        let lastChange;
        let currentResidual;
        let policyStable;
        let autoTimer = null;

        function stopAuto() {
            if (autoTimer !== null) {
                window.clearInterval(autoTimer);
                autoTimer = null;
            }
            autoButton.textContent = "连续计算";
            autoButton.setAttribute("aria-pressed", "false");
            runStatus.textContent = iteration === 0 ? "等待开始" : "已暂停";
        }

        function reset() {
            stopAuto();
            values = new Map(getStates().map((state) => [stateKey(state), 0]));
            policy = createInitialPolicy();
            iteration = 0;
            residualHistory = [];
            lastChange = null;
            currentResidual = null;
            policyStable = false;
            runStatus.textContent = "等待开始";
            summary.textContent = "普通格子的初值都是 0。先算一轮，终点附近的格子会最先发生变化。";
            render();
        }

        function stepOnce() {
            const gamma = Number(gammaInput.value);
            const slip = Number(slipInput.value);
            const algorithm = algorithmInput.value;
            const previousValues = values;

            if (algorithm === "value") {
                const result = sweepValues(values, "optimal", gamma, slip);
                values = result.values;
                lastChange = result;
                policy = policyFromValues(values, gamma, slip);
            } else if (algorithm === "policy") {
                values = evaluateValues("policy", gamma, slip, policy);
                const difference = maximumValueDifference(previousValues, values);
                const improvement = improvePolicy(policy, values, gamma, slip);
                policy = improvement.policy;
                policyStable = improvement.stable;
                lastChange = difference;
            } else {
                let result = null;
                for (let sweep = 0; sweep < 3; sweep += 1) {
                    result = sweepValues(values, "policy", gamma, slip, policy);
                    values = result.values;
                }
                const difference = maximumValueDifference(previousValues, values);
                const improvement = improvePolicy(policy, values, gamma, slip);
                policy = improvement.policy;
                policyStable = improvement.stable;
                lastChange = difference;
            }

            const residualMode = algorithm === "value" ? "optimal" : "policy";
            currentResidual = sweepValues(
                values,
                residualMode,
                gamma,
                slip,
                algorithm === "value" ? null : policy,
            ).residual;
            policyStable = policyStable && currentResidual < 0.001;
            if (algorithm === "value") {
                policyStable = currentResidual < 0.001;
            }

            iteration += 1;
            residualHistory.push(currentResidual);
            residualHistory = residualHistory.slice(-50);
            if (policyStable) {
                summary.textContent = algorithm === "value"
                    ? `算到第 ${iteration} 轮，最大变化已小于 0.001。再算下去只会动后面几位小数。`
                    : `算到第 ${iteration} 轮，策略改进没有再换箭头，可以停了。`;
                stopAuto();
                runStatus.textContent = "已收敛";
            } else {
                summary.textContent = `这轮变化最大的是 ${formatState(lastChange.changedState)}：${formatNumber(lastChange.changedFrom, 3)} → ${formatNumber(lastChange.changedTo, 3)}。`;
            }
            render();
        }

        function render() {
            const gamma = Number(gammaInput.value);
            const slip = Number(slipInput.value);
            gammaOutput.textContent = gamma.toFixed(2);
            slipOutput.textContent = slip.toFixed(2);
            iterationValue.textContent = String(iteration);
            iterationLabel.textContent = `第 ${iteration} 轮`;
            residualValue.textContent = currentResidual === null ? "—" : formatNumber(currentResidual, 5);
            policyStatus.textContent = policyStable ? "稳定" : "仍在变化";
            grid.replaceChildren(createGridSvg({
                values,
                policy,
                label: `第 ${iteration} 轮价值函数和贪心策略`,
            }));

            if (lastChange && lastChange.changedState) {
                const state = lastChange.changedState;
                const roundLabel = algorithmInput.value === "value"
                    ? "同步 Bellman backup"
                    : algorithmInput.value === "policy"
                        ? "策略评估到收敛后再改进"
                        : "策略评估三轮后再改进";
                equation.innerHTML = `<strong>${formatState(state)}</strong>：${roundLabel}<br>V：${formatNumber(lastChange.changedFrom, 3)} → <strong>${formatNumber(lastChange.changedTo, 3)}</strong><br>本轮最大价值改变量 = ${formatNumber(lastChange.residual, 5)}；当前 Bellman residual = ${formatNumber(currentResidual, 5)}`;
            } else {
                equation.innerHTML = "<strong>V₀(s)=0</strong><br>第一轮先改变那些一步就能到终点的状态。";
            }
            chart.replaceChildren(createLineChart(
                [{ values: residualHistory.length > 0 ? residualHistory : [0] }],
                {
                    minimum: 0,
                    maximum: Math.max(0.01, ...residualHistory, 0.01),
                    label: "Bellman residual 随迭代轮数的变化",
                },
            ));
        }

        root.querySelector('[data-action="step"]').addEventListener("click", stepOnce);
        autoButton.addEventListener("click", () => {
            if (autoTimer !== null) {
                stopAuto();
                return;
            }
            autoButton.textContent = "暂停";
            autoButton.setAttribute("aria-pressed", "true");
            runStatus.textContent = "自动运行中";
            autoTimer = window.setInterval(stepOnce, 520);
            stepOnce();
        });
        root.querySelector('[data-action="reset"]').addEventListener("click", reset);
        algorithmInput.addEventListener("change", reset);
        gammaInput.addEventListener("input", reset);
        slipInput.addEventListener("input", reset);
        reset();
        return { cleanup: stopAuto };
    }

    function generateRandomWalk(random, startState = 3) {
        const states = [startState];
        const rewards = [];
        const directions = [];
        let state = startState;
        let guard = 0;
        while (state > 0 && state < 6 && guard < 200) {
            const direction = random() < 0.5 ? -1 : 1;
            const nextState = state + direction;
            states.push(nextState);
            rewards.push(nextState === 6 ? 1 : 0);
            directions.push(direction < 0 ? "左" : "右");
            state = nextState;
            guard += 1;
        }
        return { states, rewards, directions };
    }

    function renderRandomWalkTrajectory(container, trajectory) {
        container.replaceChildren();
        trajectory.states.forEach((state, index) => {
            const stateElement = createElement(
                "span",
                `rl-trajectory__state${state === 0 || state === 6 ? " is-terminal" : ""}`,
                state === 0 ? "左终点" : state === 6 ? "右终点" : String.fromCharCode(64 + state),
            );
            container.appendChild(stateElement);
            if (index < trajectory.rewards.length) {
                container.appendChild(createElement(
                    "span",
                    "rl-trajectory__arrow",
                    `${trajectory.directions[index]} / r=${formatNumber(trajectory.rewards[index], 1)} →`,
                ));
            }
        });
    }

    function createValueProfileChart(profiles, label) {
        return createLineChart(profiles, {
            minimum: 0,
            maximum: 1,
            xLabels: ["A", "B", "C", "D", "E"],
            label,
        });
    }

    function mountMcEstimation(root) {
        setRootContent(root, `
            <div class="rl-lab__shell">
                <header class="rl-lab__header">
                    <div class="rl-lab__header-copy">
                        <p class="rl-lab__eyebrow">蒙特卡洛</p>
                        <h2>先走到终点，再更新</h2>
                        <p>随机游走先生成一条完整轨迹。看到终点以后，MC 才能算出途中各状态的回报。</p>
                    </div>
                    <span class="rl-lab__status-chip">Every-visit MC</span>
                </header>
                <div class="rl-lab__controls">
                    <div class="rl-lab__field rl-lab__field--wide">
                        <label for="rl-mc-gamma">折扣因子 γ：<span class="rl-lab__range-value" data-output="gamma">0.90</span></label>
                        <input id="rl-mc-gamma" data-control="gamma" type="range" min="0.1" max="1" step="0.05" value="0.9">
                    </div>
                    <div class="rl-lab__field rl-lab__field--wide">
                        <label for="rl-mc-alpha">步长 α：<span class="rl-lab__range-value" data-output="alpha">0.20</span></label>
                        <input id="rl-mc-alpha" data-control="alpha" type="range" min="0.05" max="1" step="0.05" value="0.2">
                    </div>
                    <div class="rl-lab__field">
                        <label for="rl-mc-step-mode">更新步长</label>
                        <select id="rl-mc-step-mode" data-control="step-mode">
                            <option value="average">1 / 访问次数</option>
                            <option value="constant">固定 α</option>
                        </select>
                    </div>
                    <div class="rl-lab__field">
                        <label for="rl-mc-start">起点</label>
                        <select id="rl-mc-start" data-control="start">
                            <option value="fixed">固定从 C 开始</option>
                            <option value="random">随机起点（exploring starts）</option>
                        </select>
                    </div>
                    <div class="rl-lab__field">
                        <label for="rl-mc-seed">随机种子</label>
                        <input id="rl-mc-seed" data-control="seed" type="number" min="1" step="1" value="11">
                    </div>
                    <div class="rl-lab__actions">
                        <button data-action="generate" type="button">重新走一回</button>
                        <button class="rl-lab__primary" data-action="update" type="button">用这条轨迹更新</button>
                        <button data-action="reset" type="button">重置</button>
                    </div>
                </div>
                <div class="rl-lab__workspace">
                    <div class="rl-lab__stage">
                        <div class="rl-lab__stage-head"><h3>这一回合</h3><span>左终点奖励 0，右终点奖励 1</span></div>
                        <div class="rl-trajectory" data-view="trajectory"></div>
                        <div class="rl-chart-wrap" data-view="chart"></div>
                        <div class="rl-legend"><span>当前 V</span><span class="is-secondary">真实值（γ=1 时）</span></div>
                    </div>
                    <div class="rl-lab__inspector">
                        <div class="rl-lab__inspector-head"><h3>这次怎么更新</h3><span data-view="episode">第 0 次更新</span></div>
                        <div class="rl-equation" data-view="equation"></div>
                        <ul class="rl-value-list" data-view="values"></ul>
                        <p class="rl-lab__summary" data-view="summary" aria-live="polite"></p>
                    </div>
                </div>
            </div>
        `);

        const gammaInput = root.querySelector('[data-control="gamma"]');
        const alphaInput = root.querySelector('[data-control="alpha"]');
        const stepModeInput = root.querySelector('[data-control="step-mode"]');
        const startInput = root.querySelector('[data-control="start"]');
        const seedInput = root.querySelector('[data-control="seed"]');
        const gammaOutput = root.querySelector('[data-output="gamma"]');
        const alphaOutput = root.querySelector('[data-output="alpha"]');
        const trajectoryView = root.querySelector('[data-view="trajectory"]');
        const chart = root.querySelector('[data-view="chart"]');
        const equation = root.querySelector('[data-view="equation"]');
        const valuesView = root.querySelector('[data-view="values"]');
        const summary = root.querySelector('[data-view="summary"]');
        const episode = root.querySelector('[data-view="episode"]');
        let random;
        let trajectory;
        let estimates;
        let visitCounts;
        let updateCount;

        function generateTrajectory() {
            const start = startInput.value === "random" ? 1 + Math.floor(random() * 5) : 3;
            trajectory = generateRandomWalk(random, start);
            summary.textContent = `这条轨迹走了 ${trajectory.rewards.length} 步。终点已经出现，可以从后往前算回报了。`;
            render();
        }

        function reset() {
            random = createSeededRandom(Number(seedInput.value));
            estimates = [0, 0.5, 0.5, 0.5, 0.5, 0.5, 0];
            visitCounts = [0, 0, 0, 0, 0, 0, 0];
            updateCount = 0;
            generateTrajectory();
            summary.textContent = "各状态先从 0.5 开始估。看完这条轨迹，再点一次更新。";
            render();
        }

        function update() {
            const gamma = Number(gammaInput.value);
            const alpha = Number(alphaInput.value);
            let lastUpdate = null;
            for (let time = 0; time < trajectory.rewards.length; time += 1) {
                const state = trajectory.states[time];
                const target = discountedReturn(trajectory.rewards, gamma, time);
                const previous = estimates[state];
                visitCounts[state] += 1;
                const stepSize = stepModeInput.value === "average" ? 1 / visitCounts[state] : alpha;
                estimates[state] += stepSize * (target - estimates[state]);
                lastUpdate = { state, target, previous, next: estimates[state], stepSize };
            }
            updateCount += 1;
            equation.innerHTML = `<strong>最后一笔：</strong>V(${String.fromCharCode(64 + lastUpdate.state)}) ← ${formatNumber(lastUpdate.previous, 3)} + ${formatNumber(lastUpdate.stepSize, 3)} × (${formatNumber(lastUpdate.target, 3)} − ${formatNumber(lastUpdate.previous, 3)})<br><strong>= ${formatNumber(lastUpdate.next, 3)}</strong>`;
            summary.textContent = "同一状态在一条轨迹里出现几次，every-visit MC 就更新几次。";
            render(false);
        }

        function render(updateEquation = true) {
            const gamma = Number(gammaInput.value);
            gammaOutput.textContent = gamma.toFixed(2);
            alphaOutput.textContent = Number(alphaInput.value).toFixed(2);
            alphaInput.disabled = stepModeInput.value === "average";
            episode.textContent = `第 ${updateCount} 次更新`;
            renderRandomWalkTrajectory(trajectoryView, trajectory);
            chart.replaceChildren(createValueProfileChart([
                { values: estimates.slice(1, 6) },
                { values: [1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6] },
            ], "蒙特卡洛状态价值估计"));
            valuesView.replaceChildren();
            estimates.slice(1, 6).forEach((value, index) => {
                const item = createElement("li");
                item.append(
                    createElement("span", "", `V(${String.fromCharCode(65 + index)})`),
                    createElement("strong", "", formatNumber(value, 3)),
                );
                valuesView.appendChild(item);
            });
            if (updateEquation) {
                const firstTarget = discountedReturn(trajectory.rewards, gamma, 0);
                equation.innerHTML = `<strong>G₀</strong> = ${trajectory.rewards.slice(0, 6).map((reward, index) => `${index === 0 ? "" : `${formatNumber(gamma, 2)}<sup>${index}</sup> × `}${formatNumber(reward, 1)}`).join(" + ")}${trajectory.rewards.length > 6 ? " + ⋯" : ""}<br><strong>= ${formatNumber(firstTarget, 3)}</strong>`;
            }
        }

        root.querySelector('[data-action="generate"]').addEventListener("click", generateTrajectory);
        root.querySelector('[data-action="update"]').addEventListener("click", update);
        root.querySelector('[data-action="reset"]').addEventListener("click", reset);
        gammaInput.addEventListener("input", reset);
        alphaInput.addEventListener("input", render);
        stepModeInput.addEventListener("change", reset);
        startInput.addEventListener("change", generateTrajectory);
        seedInput.addEventListener("change", reset);
        reset();
        return { cleanup() {} };
    }

    function randomNormal(random) {
        const first = Math.max(Number.EPSILON, random());
        const second = random();
        return Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second);
    }

    function mountStochasticEstimation(root) {
        setRootContent(root, `
            <div class="rl-lab__shell">
                <header class="rl-lab__header">
                    <div class="rl-lab__header-copy">
                        <p class="rl-lab__eyebrow">随机近似</p>
                        <h2>同一批样本，换个步长会怎样</h2>
                        <p>两个估计器每次收到同一个带噪样本，一个用 αₜ=1/t，另一个始终使用固定步长。</p>
                    </div>
                    <span class="rl-lab__status-chip" data-view="run-status" role="status" aria-live="polite">等待采样</span>
                </header>
                <div class="rl-lab__controls">
                    <div class="rl-lab__field rl-lab__field--wide">
                        <label for="rl-stochastic-mean">真实均值 μ：<span class="rl-lab__range-value" data-output="mean">0.65</span></label>
                        <input id="rl-stochastic-mean" data-control="mean" type="range" min="-0.25" max="1.25" step="0.05" value="0.65">
                    </div>
                    <div class="rl-lab__field rl-lab__field--wide">
                        <label for="rl-stochastic-alpha">固定步长 α：<span class="rl-lab__range-value" data-output="alpha">0.12</span></label>
                        <input id="rl-stochastic-alpha" data-control="alpha" type="range" min="0.02" max="0.5" step="0.01" value="0.12">
                    </div>
                    <div class="rl-lab__field">
                        <label for="rl-stochastic-seed">随机种子</label>
                        <input id="rl-stochastic-seed" data-control="seed" type="number" min="1" step="1" value="19">
                    </div>
                    <div class="rl-lab__actions">
                        <button class="rl-lab__primary" data-action="sample" type="button">取 1 个样本</button>
                        <button data-action="batch" type="button">再取 20 个</button>
                        <button data-action="auto" type="button">连续采样</button>
                        <button data-action="reset" type="button">重置</button>
                    </div>
                </div>
                <div class="rl-lab__workspace">
                    <div class="rl-lab__stage">
                        <div class="rl-lab__stage-head"><h3>估计值怎么走</h3><span>每个点只用一个新样本</span></div>
                        <div class="rl-chart-wrap" data-view="chart"></div>
                        <div class="rl-legend"><span>αₜ=1/t</span><span class="is-secondary">固定 α</span><span class="is-tertiary">真实 μ</span></div>
                    </div>
                    <div class="rl-lab__inspector">
                        <div class="rl-lab__inspector-head"><h3>刚才这一步</h3><span data-view="sample-count">n=0</span></div>
                        <div class="rl-metric-strip">
                            <div class="rl-metric"><span>新样本 Xₜ</span><strong data-view="sample">—</strong></div>
                            <div class="rl-metric"><span>递减步长估计</span><strong data-view="decay">0</strong></div>
                            <div class="rl-metric"><span>固定步长估计</span><strong data-view="constant">0</strong></div>
                        </div>
                        <div class="rl-equation" data-view="equation"></div>
                        <p class="rl-lab__summary" data-view="summary"></p>
                    </div>
                </div>
            </div>
        `);

        const meanInput = root.querySelector('[data-control="mean"]');
        const alphaInput = root.querySelector('[data-control="alpha"]');
        const seedInput = root.querySelector('[data-control="seed"]');
        const meanOutput = root.querySelector('[data-output="mean"]');
        const alphaOutput = root.querySelector('[data-output="alpha"]');
        const chart = root.querySelector('[data-view="chart"]');
        const sampleCount = root.querySelector('[data-view="sample-count"]');
        const sampleValue = root.querySelector('[data-view="sample"]');
        const decayValue = root.querySelector('[data-view="decay"]');
        const constantValue = root.querySelector('[data-view="constant"]');
        const equation = root.querySelector('[data-view="equation"]');
        const summary = root.querySelector('[data-view="summary"]');
        const runStatus = root.querySelector('[data-view="run-status"]');
        const autoButton = root.querySelector('[data-action="auto"]');
        let random;
        let count;
        let lastSample;
        let decayEstimate;
        let constantEstimate;
        let decayHistory;
        let constantHistory;
        let meanHistory;
        let autoTimer = null;

        function stopAuto() {
            if (autoTimer !== null) {
                window.clearInterval(autoTimer);
                autoTimer = null;
            }
            autoButton.textContent = "连续采样";
            autoButton.setAttribute("aria-pressed", "false");
            runStatus.textContent = count === 0 ? "等待采样" : "已暂停";
        }

        function reset() {
            stopAuto();
            random = createSeededRandom(Number(seedInput.value));
            count = 0;
            lastSample = null;
            decayEstimate = 0;
            constantEstimate = 0;
            decayHistory = [0];
            constantHistory = [0];
            meanHistory = [Number(meanInput.value)];
            runStatus.textContent = "等待采样";
            summary.textContent = "两个估计器从 0 出发，收到的样本完全相同，只改步长。";
            render();
        }

        function sampleOnce(shouldRender = true) {
            const mean = Number(meanInput.value);
            const alpha = Number(alphaInput.value);
            const sample = mean + 0.42 * randomNormal(random);
            const oldDecay = decayEstimate;
            count += 1;
            const decayAlpha = 1 / count;
            decayEstimate += decayAlpha * (sample - decayEstimate);
            constantEstimate += alpha * (sample - constantEstimate);
            lastSample = { sample, oldDecay, decayAlpha };
            decayHistory.push(decayEstimate);
            constantHistory.push(constantEstimate);
            meanHistory.push(mean);
            if (decayHistory.length > 121) {
                decayHistory.shift();
                constantHistory.shift();
                meanHistory.shift();
            }
            if (shouldRender) {
                summary.textContent = decayAlpha < alpha
                    ? "现在 1/t 已经小于固定步长。它的曲线更稳，但真实均值若突然变化，也会追得更慢。"
                    : "前几次的 1/t 很大，估计值会很快离开 0；以后样本越多，步长越小。";
                render();
            }
        }

        function render() {
            const mean = Number(meanInput.value);
            const alpha = Number(alphaInput.value);
            meanOutput.textContent = mean.toFixed(2);
            alphaOutput.textContent = alpha.toFixed(2);
            sampleCount.textContent = `n=${count}`;
            sampleValue.textContent = lastSample ? formatNumber(lastSample.sample, 3) : "—";
            decayValue.textContent = formatNumber(decayEstimate, 3);
            constantValue.textContent = formatNumber(constantEstimate, 3);
            const allValues = [...decayHistory, ...constantHistory, ...meanHistory];
            chart.replaceChildren(createLineChart([
                { values: decayHistory },
                { values: constantHistory },
                { values: meanHistory },
            ], {
                minimum: Math.min(-0.5, ...allValues),
                maximum: Math.max(1.5, ...allValues),
                label: "递减步长和固定步长的在线均值估计",
            }));
            if (lastSample) {
                equation.innerHTML = `<strong>样本损失</strong> J(θ)=½(θ−Xₜ)²，所以 ∇J=θ−Xₜ<br>θ ← θ − α(θ−Xₜ) = θ + α(Xₜ−θ)<br><strong>1/t：</strong>${formatNumber(lastSample.oldDecay, 3)} + ${formatNumber(lastSample.decayAlpha, 3)} × (${formatNumber(lastSample.sample, 3)} − ${formatNumber(lastSample.oldDecay, 3)}) = ${formatNumber(decayEstimate, 3)}`;
            } else {
                equation.innerHTML = "<strong>θₜ₊₁</strong> = θₜ + αₜ(Xₜ − θₜ)<br>括号里的差值既能看作观测误差，也给出了平方损失的负梯度方向。";
            }
        }

        root.querySelector('[data-action="sample"]').addEventListener("click", () => sampleOnce(true));
        root.querySelector('[data-action="batch"]').addEventListener("click", () => {
            for (let index = 0; index < 20; index += 1) {
                sampleOnce(false);
            }
            summary.textContent = "刚才连续做了 20 次单样本 SGD。只是没有把中间 19 次逐帧画出来。";
            render();
        });
        autoButton.addEventListener("click", () => {
            if (autoTimer !== null) {
                stopAuto();
                return;
            }
            autoButton.textContent = "暂停";
            autoButton.setAttribute("aria-pressed", "true");
            runStatus.textContent = "持续采样中";
            autoTimer = window.setInterval(() => sampleOnce(true), 420);
            sampleOnce(true);
        });
        root.querySelector('[data-action="reset"]').addEventListener("click", reset);
        meanInput.addEventListener("input", reset);
        alphaInput.addEventListener("input", render);
        seedInput.addEventListener("change", reset);
        reset();
        return { cleanup: stopAuto };
    }

    function nStepReturn(trajectory, time, n, values, gamma) {
        const terminalTime = trajectory.rewards.length;
        const upperBound = Math.min(time + n, terminalTime);
        let total = 0;
        for (let index = time; index < upperBound; index += 1) {
            total += gamma ** (index - time) * trajectory.rewards[index];
        }
        if (time + n < terminalTime) {
            total += gamma ** n * values[trajectory.states[time + n]];
        }
        return total;
    }

    function mountTdEstimation(root) {
        setRootContent(root, `
            <div class="rl-lab__shell">
                <header class="rl-lab__header">
                    <div class="rl-lab__header-copy">
                        <p class="rl-lab__eyebrow">MC / TD</p>
                        <h2>三种 target 分别用了哪些信息</h2>
                        <p>MC 用到终点前的全部奖励，TD(0) 只用下一步，n-step 使用前 n 步再接上一个估值。</p>
                    </div>
                    <span class="rl-lab__status-chip">三种方法共用一条轨迹</span>
                </header>
                <div class="rl-lab__controls">
                    <div class="rl-lab__field rl-lab__field--wide">
                        <label for="rl-td-gamma">折扣因子 γ：<span class="rl-lab__range-value" data-output="gamma">0.90</span></label>
                        <input id="rl-td-gamma" data-control="gamma" type="range" min="0" max="1" step="0.05" value="0.9">
                    </div>
                    <div class="rl-lab__field rl-lab__field--wide">
                        <label for="rl-td-alpha">步长 α：<span class="rl-lab__range-value" data-output="alpha">0.20</span></label>
                        <input id="rl-td-alpha" data-control="alpha" type="range" min="0.05" max="1" step="0.05" value="0.2">
                    </div>
                    <div class="rl-lab__field">
                        <label for="rl-td-n">n-step 的 n</label>
                        <input id="rl-td-n" data-control="n" type="number" min="1" max="200" step="1" value="3">
                    </div>
                    <div class="rl-lab__field">
                        <label for="rl-td-seed">随机种子</label>
                        <input id="rl-td-seed" data-control="seed" type="number" min="1" step="1" value="23">
                    </div>
                    <div class="rl-lab__actions">
                        <button data-action="generate" type="button">重新走一回</button>
                        <button class="rl-lab__primary" data-action="update" type="button">更新 1 回合</button>
                        <button data-action="batch" type="button">再学 20 回合</button>
                        <button data-action="reset" type="button">重置</button>
                    </div>
                </div>
                <div class="rl-lab__workspace">
                    <div class="rl-lab__stage">
                        <div class="rl-lab__stage-head"><h3>这一条轨迹</h3><span>三种方法使用相同的数据</span></div>
                        <div class="rl-trajectory" data-view="trajectory"></div>
                        <div class="rl-chart-wrap" data-view="chart"></div>
                        <div class="rl-legend"><span>MC</span><span class="is-secondary">TD(0)</span><span class="is-tertiary">n-step</span></div>
                    </div>
                    <div class="rl-lab__inspector">
                        <div class="rl-lab__inspector-head"><h3>第一步的 target</h3><span><span data-view="episode">0 回合</span> · <span data-view="target-mode">按当前估值预览</span></span></div>
                        <div class="rl-metric-strip">
                            <div class="rl-metric"><span>MC target</span><strong data-view="mc-target">—</strong></div>
                            <div class="rl-metric"><span>TD target</span><strong data-view="td-target">—</strong></div>
                            <div class="rl-metric"><span>n-step target</span><strong data-view="n-target">—</strong></div>
                        </div>
                        <div class="rl-equation" data-view="equation"></div>
                        <p class="rl-lab__summary" data-view="summary" aria-live="polite"></p>
                    </div>
                </div>
            </div>
        `);

        const gammaInput = root.querySelector('[data-control="gamma"]');
        const alphaInput = root.querySelector('[data-control="alpha"]');
        const nInput = root.querySelector('[data-control="n"]');
        const seedInput = root.querySelector('[data-control="seed"]');
        const gammaOutput = root.querySelector('[data-output="gamma"]');
        const alphaOutput = root.querySelector('[data-output="alpha"]');
        const trajectoryView = root.querySelector('[data-view="trajectory"]');
        const chart = root.querySelector('[data-view="chart"]');
        const equation = root.querySelector('[data-view="equation"]');
        const summary = root.querySelector('[data-view="summary"]');
        const episodeLabel = root.querySelector('[data-view="episode"]');
        const targetMode = root.querySelector('[data-view="target-mode"]');
        const mcTargetView = root.querySelector('[data-view="mc-target"]');
        const tdTargetView = root.querySelector('[data-view="td-target"]');
        const nTargetView = root.querySelector('[data-view="n-target"]');
        let random;
        let trajectory;
        let estimates;
        let episodeCount;
        let lastComparison;

        function makeEstimates() {
            return [0, 0.5, 0.5, 0.5, 0.5, 0.5, 0];
        }

        function reset() {
            random = createSeededRandom(Number(seedInput.value));
            trajectory = generateRandomWalk(random);
            estimates = { mc: makeEstimates(), td: makeEstimates(), nstep: makeEstimates() };
            episodeCount = 0;
            lastComparison = null;
            summary.textContent = "右边三个 target 都来自左边这条轨迹，区别只是各自用了多少信息。";
            render();
        }

        function updateFromTrajectory(currentTrajectory) {
            const gamma = Number(gammaInput.value);
            const alpha = Number(alphaInput.value);
            const n = clamp(Number.parseInt(nInput.value, 10) || 1, 1, 200);
            let firstComparison = null;
            for (let time = 0; time < currentTrajectory.rewards.length; time += 1) {
                const state = currentTrajectory.states[time];
                const nextState = currentTrajectory.states[time + 1];
                const mcTarget = discountedReturn(currentTrajectory.rewards, gamma, time);
                const tdTarget = currentTrajectory.rewards[time]
                    + gamma * ((nextState === 0 || nextState === 6) ? 0 : estimates.td[nextState]);
                const multiStepTarget = nStepReturn(currentTrajectory, time, n, estimates.nstep, gamma);
                if (time === 0) {
                    firstComparison = { mcTarget, tdTarget, multiStepTarget, n };
                }
                estimates.mc[state] += alpha * (mcTarget - estimates.mc[state]);
                estimates.td[state] += alpha * (tdTarget - estimates.td[state]);
                estimates.nstep[state] += alpha * (multiStepTarget - estimates.nstep[state]);
            }
            return firstComparison;
        }

        function updateOne() {
            lastComparison = updateFromTrajectory(trajectory);
            episodeCount += 1;
            summary.textContent = "更新了一回合。TD 把自己的旧估值放进 target，因此不用等到终点，但也会把估计误差带进去。";
            render();
        }

        function updateBatch() {
            for (let index = 0; index < 20; index += 1) {
                trajectory = generateRandomWalk(random);
                lastComparison = updateFromTrajectory(trajectory);
                episodeCount += 1;
            }
            summary.textContent = "又学了 20 个回合。三条曲线可能逐渐靠近，但三种更新仍在使用不同的 target。";
            render();
        }

        function generateTrajectoryOnly() {
            trajectory = generateRandomWalk(random);
            lastComparison = null;
            summary.textContent = "这里只换了轨迹，还没有更新估值。右边显示的是用当前估值算出的三个 target。";
            render();
        }

        function render() {
            const gamma = Number(gammaInput.value);
            const n = clamp(Number.parseInt(nInput.value, 10) || 1, 1, 200);
            nInput.value = String(n);
            gammaOutput.textContent = gamma.toFixed(2);
            alphaOutput.textContent = Number(alphaInput.value).toFixed(2);
            episodeLabel.textContent = `${episodeCount} 回合`;
            renderRandomWalkTrajectory(trajectoryView, trajectory);
            chart.replaceChildren(createValueProfileChart([
                { values: estimates.mc.slice(1, 6) },
                { values: estimates.td.slice(1, 6) },
                { values: estimates.nstep.slice(1, 6) },
            ], "MC、TD 零和 n-step 状态价值估计"));

            const firstState = trajectory.states[0];
            const nextState = trajectory.states[1];
            const preview = {
                mcTarget: discountedReturn(trajectory.rewards, gamma, 0),
                tdTarget: trajectory.rewards[0]
                    + gamma * ((nextState === 0 || nextState === 6) ? 0 : estimates.td[nextState]),
                multiStepTarget: nStepReturn(trajectory, 0, n, estimates.nstep, gamma),
                n,
            };
            const comparison = lastComparison || preview;
            targetMode.textContent = lastComparison ? "刚才实际使用的 target" : "按当前估值预览";
            const { mcTarget, tdTarget, multiStepTarget } = comparison;
            mcTargetView.textContent = formatNumber(mcTarget, 3);
            tdTargetView.textContent = formatNumber(tdTarget, 3);
            nTargetView.textContent = formatNumber(multiStepTarget, 3);
            equation.innerHTML = `<strong>从 ${String.fromCharCode(64 + firstState)} 出发：</strong><br>MC 看完剩余 ${trajectory.rewards.length} 步：G₀=${formatNumber(mcTarget, 3)}<br>TD(0) 看 1 步：R₁+γV(S₁)=${formatNumber(tdTarget, 3)}<br>${comparison.n}-step 看 ${Math.min(comparison.n, trajectory.rewards.length)} 步${comparison.n < trajectory.rewards.length ? "再 bootstrap" : "并在终点截断"}：${formatNumber(multiStepTarget, 3)}`;
        }

        root.querySelector('[data-action="generate"]').addEventListener("click", generateTrajectoryOnly);
        root.querySelector('[data-action="update"]').addEventListener("click", updateOne);
        root.querySelector('[data-action="batch"]').addEventListener("click", updateBatch);
        root.querySelector('[data-action="reset"]').addEventListener("click", reset);
        gammaInput.addEventListener("input", reset);
        alphaInput.addEventListener("input", render);
        nInput.addEventListener("change", reset);
        seedInput.addEventListener("change", reset);
        reset();
        return { cleanup() {} };
    }

    function mountEstimationLab(root) {
        if (root.dataset.mode === "stochastic") {
            return mountStochasticEstimation(root);
        }
        if (root.dataset.mode === "td") {
            return mountTdEstimation(root);
        }
        return mountMcEstimation(root);
    }

    const cliffWorld = {
        width: 6,
        height: 4,
        start: { x: 0, y: 3 },
        goal: { x: 5, y: 3 },
    };

    function isCliffCell(state) {
        return state.y === cliffWorld.height - 1 && state.x > 0 && state.x < cliffWorld.width - 1;
    }

    function isCliffGoal(state) {
        return state.x === cliffWorld.goal.x && state.y === cliffWorld.goal.y;
    }

    function getCliffStates() {
        const states = [];
        for (let y = 0; y < cliffWorld.height; y += 1) {
            for (let x = 0; x < cliffWorld.width; x += 1) {
                const state = { x, y };
                if (!isCliffCell(state)) {
                    states.push(state);
                }
            }
        }
        return states;
    }

    function createQTable() {
        return new Map(getCliffStates().map((state) => [stateKey(state), [0, 0, 0, 0]]));
    }

    function qRow(qTable, state) {
        return qTable.get(stateKey(state));
    }

    function bestActionIndices(qValues) {
        const maximum = Math.max(...qValues);
        return qValues
            .map((value, index) => ({ value, index }))
            .filter((entry) => Math.abs(entry.value - maximum) < 1e-10)
            .map((entry) => entry.index);
    }

    function chooseEpsilonGreedy(qTable, state, epsilon, random) {
        const row = qRow(qTable, state);
        if (random() < epsilon) {
            return Math.floor(random() * actions.length);
        }
        const best = bestActionIndices(row);
        return best[Math.floor(random() * best.length)];
    }

    function expectedEpsilonGreedyValue(qTable, state, epsilon) {
        const row = qRow(qTable, state);
        const best = new Set(bestActionIndices(row));
        return row.reduce((total, value, index) => {
            const probability = epsilon / actions.length + (best.has(index) ? (1 - epsilon) / best.size : 0);
            return total + probability * value;
        }, 0);
    }

    function takeCliffStep(state, actionIndex) {
        const action = actions[actionIndex];
        const candidate = {
            x: clamp(state.x + action.dx, 0, cliffWorld.width - 1),
            y: clamp(state.y + action.dy, 0, cliffWorld.height - 1),
        };
        if (isCliffCell(candidate)) {
            return { state: { ...cliffWorld.start }, reward: -100, terminal: false, fell: true };
        }
        return {
            state: candidate,
            reward: -1,
            terminal: isCliffGoal(candidate),
            fell: false,
        };
    }

    function createCliffSvg(qTable, path) {
        const cellSize = 76;
        const width = cliffWorld.width * cellSize;
        const height = cliffWorld.height * cellSize;
        const svg = createSvgElement("svg", {
            class: "rl-grid",
            viewBox: `0 0 ${width} ${height}`,
            role: "img",
            "aria-label": "悬崖行走环境、当前贪心策略和最近一回合路径",
        });
        const labels = [];
        const maximumMagnitude = Math.max(1, ...Array.from(qTable.values(), (row) => Math.abs(Math.max(...row))));

        for (let y = 0; y < cliffWorld.height; y += 1) {
            for (let x = 0; x < cliffWorld.width; x += 1) {
                const state = { x, y };
                const key = stateKey(state);
                const group = createSvgElement("g", { class: "rl-grid__cell" });
                const className = isCliffCell(state)
                    ? "rl-grid__base rl-grid__cliff"
                    : isCliffGoal(state)
                        ? "rl-grid__base rl-grid__goal"
                        : "rl-grid__base";
                group.appendChild(createSvgElement("rect", {
                    class: className,
                    x: x * cellSize + 2,
                    y: y * cellSize + 2,
                    width: cellSize - 4,
                    height: cellSize - 4,
                    rx: 9,
                }));
                if (!isCliffCell(state) && !isCliffGoal(state)) {
                    const maximumQ = Math.max(...qRow(qTable, state));
                    const opacity = 0.06 + 0.28 * Math.abs(maximumQ) / maximumMagnitude;
                    group.appendChild(createSvgElement("rect", {
                        class: "rl-grid__heat",
                        x: x * cellSize + 5,
                        y: y * cellSize + 5,
                        width: cellSize - 10,
                        height: cellSize - 10,
                        rx: 7,
                        fill: maximumQ >= 0 ? `rgba(21, 159, 175, ${opacity})` : `rgba(220, 98, 123, ${opacity})`,
                    }));
                }
                svg.appendChild(group);

                let text = "";
                if (isCliffCell(state)) {
                    text = "悬崖";
                } else if (isCliffGoal(state)) {
                    text = "终点";
                } else if (state.x === cliffWorld.start.x && state.y === cliffWorld.start.y) {
                    text = "起点";
                }
                labels.push({ state, text, key });
            }
        }

        const pathSegments = [];
        let currentSegment = [];
        path.slice(-45).forEach((state, index, visiblePath) => {
            if (index > 0) {
                const previous = visiblePath[index - 1];
                const distance = Math.abs(previous.x - state.x) + Math.abs(previous.y - state.y);
                if (distance > 1) {
                    if (currentSegment.length > 1) {
                        pathSegments.push(currentSegment);
                    }
                    currentSegment = [];
                }
            }
            currentSegment.push(state);
        });
        if (currentSegment.length > 1) {
            pathSegments.push(currentSegment);
        }
        pathSegments.forEach((segment) => {
            const points = segment.map((state) => `${state.x * cellSize + cellSize / 2},${state.y * cellSize + cellSize / 2}`).join(" ");
            svg.appendChild(createSvgElement("polyline", { class: "rl-grid__path", points }));
        });

        labels.forEach(({ state, text, key }) => {
            if (text) {
                const label = createSvgElement("text", {
                    class: "rl-grid__label",
                    x: state.x * cellSize + cellSize / 2,
                    y: state.y * cellSize + 18,
                });
                label.textContent = text;
                svg.appendChild(label);
            }
            if (!isCliffCell(state) && !isCliffGoal(state)) {
                const bestIndex = bestActionIndices(qRow(qTable, state))[0];
                const arrow = createSvgElement("text", {
                    class: "rl-grid__policy",
                    x: state.x * cellSize + cellSize / 2,
                    y: state.y * cellSize + cellSize / 2 + 7,
                });
                arrow.textContent = actions[bestIndex].arrow;
                svg.appendChild(arrow);
                const value = createSvgElement("text", {
                    class: "rl-grid__value",
                    x: state.x * cellSize + cellSize / 2,
                    y: state.y * cellSize + cellSize - 9,
                });
                value.textContent = formatNumber(Math.max(...qTable.get(key)), 1);
                svg.appendChild(value);
            }
        });
        const current = path[path.length - 1] || cliffWorld.start;
        svg.appendChild(createSvgElement("circle", {
            class: "rl-grid__agent",
            cx: current.x * cellSize + cellSize / 2,
            cy: current.y * cellSize + cellSize / 2,
            r: 10,
        }));
        return svg;
    }

    function mountControlLab(root) {
        setRootContent(root, `
            <div class="rl-lab__shell">
                <header class="rl-lab__header">
                    <div class="rl-lab__header-copy">
                        <p class="rl-lab__eyebrow">Sarsa / Q-learning</p>
                        <h2>Sarsa 和 Q-learning 会走哪条路</h2>
                        <p>Sarsa 用实际选出的下一动作更新；Q-learning 用下一状态中最大的 Q。悬崖世界很容易看出两者的区别。</p>
                    </div>
                    <span class="rl-lab__status-chip" data-view="algorithm-status">Sarsa</span>
                </header>
                <div class="rl-lab__controls">
                    <div class="rl-lab__field rl-lab__field--wide">
                        <label for="rl-control-algorithm">控制算法</label>
                        <select id="rl-control-algorithm" data-control="algorithm">
                            <option value="sarsa">Sarsa</option>
                            <option value="expected">Expected Sarsa</option>
                            <option value="nstep">n-step Sarsa</option>
                            <option value="qlearning">Q-learning</option>
                        </select>
                    </div>
                    <div class="rl-lab__field">
                        <label for="rl-control-epsilon">ε：<span class="rl-lab__range-value" data-output="epsilon">0.10</span></label>
                        <input id="rl-control-epsilon" data-control="epsilon" type="range" min="0" max="0.5" step="0.05" value="0.1">
                    </div>
                    <div class="rl-lab__field">
                        <label for="rl-control-alpha">α：<span class="rl-lab__range-value" data-output="alpha">0.50</span></label>
                        <input id="rl-control-alpha" data-control="alpha" type="range" min="0.05" max="1" step="0.05" value="0.5">
                    </div>
                    <div class="rl-lab__field">
                        <label for="rl-control-gamma">γ：<span class="rl-lab__range-value" data-output="gamma">1.00</span></label>
                        <input id="rl-control-gamma" data-control="gamma" type="range" min="0" max="1" step="0.05" value="1">
                    </div>
                    <div class="rl-lab__field">
                        <label for="rl-control-n">n-step 的 n</label>
                        <input id="rl-control-n" data-control="n" type="number" min="1" max="8" step="1" value="3">
                    </div>
                    <div class="rl-lab__field">
                        <label for="rl-control-seed">随机种子</label>
                        <input id="rl-control-seed" data-control="seed" type="number" min="1" step="1" value="31">
                    </div>
                    <div class="rl-lab__actions">
                        <button class="rl-lab__primary" data-action="episode" type="button">训练 1 回合</button>
                        <button data-action="batch" type="button">训练 25 回合</button>
                        <button data-action="auto" type="button">连续训练</button>
                        <button data-action="reset" type="button">重置</button>
                    </div>
                </div>
                <div class="rl-lab__workspace">
                    <div class="rl-lab__stage">
                        <div class="rl-lab__stage-head"><h3>悬崖世界</h3><span>箭头表示当前贪心动作</span></div>
                        <div class="rl-grid-wrap" data-view="grid"></div>
                    </div>
                    <div class="rl-lab__inspector">
                        <div class="rl-lab__inspector-head"><h3>最后一次更新</h3><span data-view="episode-count">0 回合</span></div>
                        <div class="rl-metric-strip">
                            <div class="rl-metric"><span>本回合回报</span><strong data-view="return">—</strong></div>
                            <div class="rl-metric"><span>步数</span><strong data-view="steps">—</strong></div>
                            <div class="rl-metric"><span>坠崖次数</span><strong data-view="falls">—</strong></div>
                        </div>
                        <div class="rl-equation" data-view="equation"></div>
                        <div class="rl-chart-wrap" data-view="chart"></div>
                        <div class="rl-legend"><span>每回合总奖励</span></div>
                        <p class="rl-lab__summary" data-view="summary"></p>
                    </div>
                </div>
            </div>
        `);

        const algorithmInput = root.querySelector('[data-control="algorithm"]');
        const epsilonInput = root.querySelector('[data-control="epsilon"]');
        const alphaInput = root.querySelector('[data-control="alpha"]');
        const gammaInput = root.querySelector('[data-control="gamma"]');
        const nInput = root.querySelector('[data-control="n"]');
        const seedInput = root.querySelector('[data-control="seed"]');
        const epsilonOutput = root.querySelector('[data-output="epsilon"]');
        const alphaOutput = root.querySelector('[data-output="alpha"]');
        const gammaOutput = root.querySelector('[data-output="gamma"]');
        const grid = root.querySelector('[data-view="grid"]');
        const chart = root.querySelector('[data-view="chart"]');
        const episodeCountView = root.querySelector('[data-view="episode-count"]');
        const returnView = root.querySelector('[data-view="return"]');
        const stepsView = root.querySelector('[data-view="steps"]');
        const fallsView = root.querySelector('[data-view="falls"]');
        const equation = root.querySelector('[data-view="equation"]');
        const summary = root.querySelector('[data-view="summary"]');
        const algorithmStatus = root.querySelector('[data-view="algorithm-status"]');
        const autoButton = root.querySelector('[data-action="auto"]');
        let qTable;
        let random;
        let episodeCount;
        let returnHistory;
        let lastEpisode;
        let autoTimer = null;

        function stopAuto() {
            if (autoTimer !== null) {
                window.clearInterval(autoTimer);
                autoTimer = null;
            }
            autoButton.textContent = "连续训练";
            autoButton.setAttribute("aria-pressed", "false");
        }

        function reset() {
            stopAuto();
            qTable = createQTable();
            random = createSeededRandom(Number(seedInput.value));
            episodeCount = 0;
            returnHistory = [];
            lastEpisode = null;
            summary.textContent = "Q 表目前全是 0，格子里的箭头只是并列时的默认选择。训练后再看它们怎么变。";
            render();
        }

        function runOnlineEpisode(algorithm) {
            const epsilon = Number(epsilonInput.value);
            const alpha = Number(alphaInput.value);
            const gamma = Number(gammaInput.value);
            let state = { ...cliffWorld.start };
            let actionIndex = chooseEpsilonGreedy(qTable, state, epsilon, random);
            const path = [{ ...state }];
            let totalReward = 0;
            let falls = 0;
            let lastUpdate = null;
            let steps = 0;

            while (steps < 300) {
                const result = takeCliffStep(state, actionIndex);
                const row = qRow(qTable, state);
                const oldValue = row[actionIndex];
                let target = result.reward;
                let nextActionIndex = null;
                let greedyNextIndex = null;
                if (!result.terminal) {
                    const nextRow = qRow(qTable, result.state);
                    nextActionIndex = chooseEpsilonGreedy(qTable, result.state, epsilon, random);
                    if (algorithm === "sarsa") {
                        target += gamma * nextRow[nextActionIndex];
                    } else if (algorithm === "expected") {
                        target += gamma * expectedEpsilonGreedyValue(qTable, result.state, epsilon);
                    } else {
                        greedyNextIndex = bestActionIndices(nextRow)[0];
                        target += gamma * nextRow[greedyNextIndex];
                    }
                }
                row[actionIndex] += alpha * (target - oldValue);
                lastUpdate = {
                    nextActionIndex,
                    greedyNextIndex,
                    oldValue,
                    newValue: row[actionIndex],
                    target,
                };
                totalReward += result.reward;
                falls += result.fell ? 1 : 0;
                path.push({ ...result.state });
                steps += 1;
                if (result.terminal) {
                    break;
                }
                state = result.state;
                actionIndex = nextActionIndex;
            }
            return { path, totalReward, falls, steps, lastUpdate };
        }

        function runNStepEpisode() {
            const epsilon = Number(epsilonInput.value);
            const alpha = Number(alphaInput.value);
            const gamma = Number(gammaInput.value);
            const n = clamp(Number.parseInt(nInput.value, 10) || 1, 1, 8);
            const states = [{ ...cliffWorld.start }];
            const actionIndices = [chooseEpsilonGreedy(qTable, states[0], epsilon, random)];
            const rewards = [0];
            const path = [{ ...cliffWorld.start }];
            let falls = 0;
            let steps = 0;
            let totalReward = 0;
            let terminalTime = Infinity;
            let time = 0;
            let lastUpdate = null;

            while (true) {
                if (time < terminalTime) {
                    const result = takeCliffStep(states[time], actionIndices[time]);
                    rewards[time + 1] = result.reward;
                    states[time + 1] = { ...result.state };
                    path.push({ ...result.state });
                    totalReward += result.reward;
                    falls += result.fell ? 1 : 0;
                    steps += 1;
                    if (result.terminal || steps >= 300) {
                        terminalTime = time + 1;
                    } else {
                        actionIndices[time + 1] = chooseEpsilonGreedy(qTable, result.state, epsilon, random);
                    }
                }

                const updateTime = time - n + 1;
                if (updateTime >= 0) {
                    const upperBound = Math.min(updateTime + n, terminalTime);
                    let target = 0;
                    for (let index = updateTime + 1; index <= upperBound; index += 1) {
                        target += gamma ** (index - updateTime - 1) * rewards[index];
                    }
                    const bootstrapped = updateTime + n < terminalTime;
                    if (bootstrapped) {
                        target += gamma ** n * qRow(qTable, states[updateTime + n])[actionIndices[updateTime + n]];
                    }
                    const row = qRow(qTable, states[updateTime]);
                    const oldValue = row[actionIndices[updateTime]];
                    row[actionIndices[updateTime]] += alpha * (target - oldValue);
                    const updateRecord = {
                        oldValue,
                        newValue: row[actionIndices[updateTime]],
                        target,
                        n,
                        stepsUsed: upperBound - updateTime,
                        bootstrapped,
                    };
                    if (bootstrapped || lastUpdate === null) {
                        lastUpdate = updateRecord;
                    }
                }

                if (updateTime === terminalTime - 1) {
                    break;
                }
                time += 1;
            }

            return {
                path,
                totalReward,
                falls,
                steps,
                lastUpdate,
            };
        }

        function runEpisode() {
            const algorithm = algorithmInput.value;
            lastEpisode = algorithm === "nstep" ? runNStepEpisode() : runOnlineEpisode(algorithm);
            episodeCount += 1;
            returnHistory.push(lastEpisode.totalReward);
            returnHistory = returnHistory.slice(-60);
        }

        function train(count) {
            for (let index = 0; index < count; index += 1) {
                runEpisode();
            }
            summary.textContent = count === 1
                ? "这一回合的更新已经写进 Q 表。切换算法会清空结果，避免把两种算法的训练混在一起。"
                : `训练了 ${count} 回合。左图画的是当前贪心动作，实际训练仍有 ε 的概率随机探索。`;
            render();
        }

        function render() {
            const algorithmLabels = {
                sarsa: "Sarsa",
                expected: "Expected Sarsa",
                nstep: "n-step Sarsa",
                qlearning: "Q-learning",
            };
            const algorithm = algorithmInput.value;
            epsilonOutput.textContent = Number(epsilonInput.value).toFixed(2);
            alphaOutput.textContent = Number(alphaInput.value).toFixed(2);
            gammaOutput.textContent = Number(gammaInput.value).toFixed(2);
            nInput.disabled = algorithm !== "nstep";
            algorithmStatus.textContent = algorithmLabels[algorithm];
            episodeCountView.textContent = `${episodeCount} 回合`;
            returnView.textContent = lastEpisode ? formatNumber(lastEpisode.totalReward, 0) : "—";
            stepsView.textContent = lastEpisode ? String(lastEpisode.steps) : "—";
            fallsView.textContent = lastEpisode ? String(lastEpisode.falls) : "—";
            grid.replaceChildren(createCliffSvg(qTable, lastEpisode ? lastEpisode.path : [cliffWorld.start]));
            chart.replaceChildren(createLineChart(
                [{ values: returnHistory.length > 0 ? returnHistory : [0] }],
                {
                    minimum: Math.min(-120, ...returnHistory),
                    maximum: Math.max(0, ...returnHistory),
                    label: "最近回合总奖励",
                },
            ));

            if (!lastEpisode || !lastEpisode.lastUpdate) {
                equation.innerHTML = "<strong>Q(s,a)</strong> ← Q(s,a) + α[target − Q(s,a)]<br>先训练一回合，这里会显示 target 使用了哪个下一动作。";
                return;
            }
            const update = lastEpisode.lastUpdate;
            let targetExplanation;
            if (algorithm === "sarsa") {
                targetExplanation = update.nextActionIndex === null
                    ? "到达终点，不再 bootstrap"
                    : `使用实际抽到的下一动作 ${actions[update.nextActionIndex].arrow}`;
            } else if (algorithm === "expected") {
                targetExplanation = "对 ε-greedy 的所有下一动作求期望";
            } else if (algorithm === "nstep") {
                targetExplanation = update.bootstrapped
                    ? `先累加 ${update.stepsUsed} 步奖励，再用第 ${update.n} 步的实际动作 bootstrap`
                    : `累加到回合结束的 ${update.stepsUsed} 步奖励，不再 bootstrap`;
            } else {
                const actual = update.nextActionIndex === null ? "终点" : actions[update.nextActionIndex].arrow;
                const greedy = update.greedyNextIndex === null ? "终点" : actions[update.greedyNextIndex].arrow;
                targetExplanation = `行为下一步是 ${actual}，target 使用的却是贪心动作 ${greedy}`;
            }
            equation.innerHTML = `<strong>${algorithmLabels[algorithm]}</strong>：${targetExplanation}<br>target = ${formatNumber(update.target, 3)}<br>Q ← ${formatNumber(update.oldValue, 3)} + ${formatNumber(Number(alphaInput.value), 2)} × (${formatNumber(update.target, 3)} − ${formatNumber(update.oldValue, 3)}) = <strong>${formatNumber(update.newValue, 3)}</strong>`;
        }

        root.querySelector('[data-action="episode"]').addEventListener("click", () => train(1));
        root.querySelector('[data-action="batch"]').addEventListener("click", () => train(25));
        autoButton.addEventListener("click", () => {
            if (autoTimer !== null) {
                stopAuto();
                return;
            }
            autoButton.textContent = "暂停";
            autoButton.setAttribute("aria-pressed", "true");
            autoTimer = window.setInterval(() => train(1), 480);
            train(1);
        });
        root.querySelector('[data-action="reset"]').addEventListener("click", reset);
        algorithmInput.addEventListener("change", reset);
        epsilonInput.addEventListener("input", render);
        alphaInput.addEventListener("input", render);
        gammaInput.addEventListener("input", reset);
        nInput.addEventListener("change", reset);
        seedInput.addEventListener("change", reset);
        reset();
        return { cleanup: stopAuto };
    }

    function sigmoid(value) {
        return 1 / (1 + Math.exp(-value));
    }

    function approximationFeatures(value, degree) {
        return degree === 2 ? [1, value, value ** 2] : [1, value];
    }

    function predictApproximation(value, weights, degree) {
        return approximationFeatures(value, degree).reduce(
            (total, feature, index) => total + feature * weights[index],
            0,
        );
    }

    function createApproximationChart(samples, weights, degree, highlightedIndices) {
        const width = 460;
        const height = 220;
        const padding = { top: 16, right: 18, bottom: 34, left: 38 };
        const xForValue = (value) => padding.left + (value + 1) / 2 * (width - padding.left - padding.right);
        const yForValue = (value) => {
            const bounded = clamp(value, -0.1, 1.1);
            return padding.top + (1.1 - bounded) / 1.2 * (height - padding.top - padding.bottom);
        };
        const svg = createSvgElement("svg", {
            class: "rl-chart rl-approx-chart",
            viewBox: `0 0 ${width} ${height}`,
            role: "img",
            "aria-label": "样本 target 与当前值函数近似曲线",
        });

        for (let index = 0; index <= 4; index += 1) {
            const value = index / 4;
            const y = yForValue(value);
            svg.appendChild(createSvgElement("line", {
                class: "rl-chart__grid",
                x1: padding.left,
                x2: width - padding.right,
                y1: y,
                y2: y,
            }));
            const label = createSvgElement("text", {
                class: "rl-chart__label",
                x: padding.left - 7,
                y: y + 3,
                "text-anchor": "end",
            });
            label.textContent = formatNumber(value, 2);
            svg.appendChild(label);
        }

        const curvePoints = [];
        for (let index = 0; index <= 60; index += 1) {
            const value = -1 + index / 30;
            curvePoints.push(`${xForValue(value)},${yForValue(predictApproximation(value, weights, degree))}`);
        }
        svg.appendChild(createSvgElement("polyline", {
            class: "rl-approx-chart__curve",
            points: curvePoints.join(" "),
        }));

        samples.forEach((sample, index) => {
            const point = createSvgElement("circle", {
                class: `rl-approx-chart__point${highlightedIndices.has(index) ? " is-active" : ""}`,
                cx: xForValue(sample.x),
                cy: yForValue(sample.target),
                r: highlightedIndices.has(index) ? 7 : 5,
            });
            const title = createSvgElement("title");
            title.textContent = `${sample.label}：x=${formatNumber(sample.x, 2)}，target=${formatNumber(sample.target, 2)}`;
            point.appendChild(title);
            svg.appendChild(point);

            const label = createSvgElement("text", {
                class: "rl-chart__label",
                x: xForValue(sample.x),
                y: height - 10,
                "text-anchor": "middle",
            });
            label.textContent = sample.label;
            svg.appendChild(label);
        });
        return svg;
    }

    function mountApproximationLab(root) {
        const samples = [
            { label: "s₁", x: -1, target: 0.12 },
            { label: "s₂", x: -0.67, target: 0.28 },
            { label: "s₃", x: -0.33, target: 0.7 },
            { label: "s₄", x: 0, target: 0.42 },
            { label: "s₅", x: 0.33, target: 0.82 },
            { label: "s₆", x: 0.67, target: 0.64 },
            { label: "s₇", x: 1, target: 0.94 },
        ];

        setRootContent(root, `
            <div class="rl-lab__shell">
                <header class="rl-lab__header">
                    <div class="rl-lab__header-copy">
                        <p class="rl-lab__eyebrow">Value approximation</p>
                        <h2>一组参数，要照顾所有状态</h2>
                        <p>按固定顺序使用样本，或随机抽一个 minibatch。共享参数变一次，多个状态的估计都可能跟着动。</p>
                    </div>
                    <span class="rl-lab__status-chip" data-view="model-status">Linear</span>
                </header>
                <div class="rl-lab__controls">
                    <div class="rl-lab__field">
                        <label for="rl-approx-model">近似函数</label>
                        <select id="rl-approx-model" data-control="model">
                            <option value="1">Linear：w₀ + w₁x</option>
                            <option value="2">Quadratic：w₀ + w₁x + w₂x²</option>
                        </select>
                    </div>
                    <div class="rl-lab__field rl-lab__field--wide">
                        <label for="rl-approx-alpha">学习率 α：<span class="rl-lab__range-value" data-output="alpha">0.12</span></label>
                        <input id="rl-approx-alpha" data-control="alpha" type="range" min="0.02" max="0.4" step="0.01" value="0.12">
                    </div>
                    <div class="rl-lab__field">
                        <label for="rl-approx-seed">随机种子</label>
                        <input id="rl-approx-seed" data-control="seed" type="number" min="1" step="1" value="23">
                    </div>
                    <div class="rl-lab__actions">
                        <button class="rl-lab__primary" data-action="online" type="button">按顺序更新 1 个</button>
                        <button data-action="replay" type="button">随机抽 4 个</button>
                        <button data-action="auto" type="button" aria-pressed="false">连续更新</button>
                        <button data-action="reset" type="button">重置</button>
                    </div>
                </div>
                <div class="rl-lab__workspace">
                    <div class="rl-lab__stage">
                        <div class="rl-lab__stage-head"><h3>target 和当前拟合曲线</h3><span>本次使用的样本会高亮</span></div>
                        <div class="rl-chart-wrap" data-view="chart"></div>
                        <div class="rl-legend"><span>当前 approximation</span><span class="is-secondary">固定 target</span></div>
                        <div class="rl-replay-buffer" data-view="buffer" aria-label="Replay 抽样区"></div>
                    </div>
                    <div class="rl-lab__inspector">
                        <div class="rl-lab__inspector-head"><h3>这一步改了什么</h3><span data-view="run-status">等待更新</span></div>
                        <div class="rl-metric-strip">
                            <div class="rl-metric"><span>更新次数</span><strong data-view="updates">0</strong></div>
                            <div class="rl-metric"><span>全体 MSE</span><strong data-view="loss">—</strong></div>
                            <div class="rl-metric"><span>本次样本数</span><strong data-view="batch-size">—</strong></div>
                        </div>
                        <div class="rl-equation" data-view="equation"></div>
                        <div class="rl-chart-wrap" data-view="loss-chart"></div>
                        <div class="rl-legend"><span>MSE</span></div>
                        <p class="rl-lab__summary" data-view="summary" aria-live="polite"></p>
                    </div>
                </div>
            </div>
        `);

        const modelInput = root.querySelector('[data-control="model"]');
        const alphaInput = root.querySelector('[data-control="alpha"]');
        const seedInput = root.querySelector('[data-control="seed"]');
        const alphaOutput = root.querySelector('[data-output="alpha"]');
        const modelStatus = root.querySelector('[data-view="model-status"]');
        const chart = root.querySelector('[data-view="chart"]');
        const buffer = root.querySelector('[data-view="buffer"]');
        const updateView = root.querySelector('[data-view="updates"]');
        const lossView = root.querySelector('[data-view="loss"]');
        const batchSizeView = root.querySelector('[data-view="batch-size"]');
        const equation = root.querySelector('[data-view="equation"]');
        const lossChart = root.querySelector('[data-view="loss-chart"]');
        const summary = root.querySelector('[data-view="summary"]');
        const runStatus = root.querySelector('[data-view="run-status"]');
        const autoButton = root.querySelector('[data-action="auto"]');
        let degree;
        let weights;
        let random;
        let trajectoryIndex;
        let updateCount;
        let lossHistory;
        let highlightedIndices;
        let lastUpdate;
        let autoTimer = null;

        function meanSquaredError() {
            return samples.reduce((total, sample) => {
                const error = sample.target - predictApproximation(sample.x, weights, degree);
                return total + error ** 2;
            }, 0) / samples.length;
        }

        function stopAuto() {
            if (autoTimer !== null) {
                window.clearInterval(autoTimer);
                autoTimer = null;
            }
            autoButton.textContent = "连续更新";
            autoButton.setAttribute("aria-pressed", "false");
            runStatus.textContent = updateCount === 0 ? "等待更新" : "已暂停";
        }

        function updateFromIndices(indices, source) {
            const alpha = Number(alphaInput.value);
            const gradient = new Array(weights.length).fill(0);
            const oldWeights = [...weights];
            let batchLoss = 0;
            indices.forEach((index) => {
                const sample = samples[index];
                const features = approximationFeatures(sample.x, degree);
                const prediction = predictApproximation(sample.x, weights, degree);
                const error = sample.target - prediction;
                batchLoss += error ** 2 / indices.length;
                features.forEach((feature, featureIndex) => {
                    gradient[featureIndex] += error * feature / indices.length;
                });
            });
            weights = weights.map((weight, index) => weight + alpha * gradient[index]);
            updateCount += 1;
            highlightedIndices = new Set(indices);
            lossHistory.push(meanSquaredError());
            lossHistory = lossHistory.slice(-60);
            lastUpdate = { source, indices, oldWeights, gradient, batchLoss };
            render();
        }

        function stepOnline() {
            const index = trajectoryIndex % samples.length;
            trajectoryIndex += 1;
            updateFromIndices([index], "ordered");
            runStatus.textContent = autoTimer === null ? "已按顺序更新 1 个" : "按样本顺序连续更新";
            summary.textContent = `这次只看 ${samples[index].label}。共享参数改变以后，其他状态的预测也可能跟着移动。`;
        }

        function stepReplay() {
            const indices = new Set();
            while (indices.size < 4) {
                indices.add(Math.floor(random() * samples.length));
            }
            const batch = Array.from(indices);
            updateFromIndices(batch, "replay");
            runStatus.textContent = "已随机更新 4 个";
            summary.textContent = `从 7 个固定样本中抽了 ${batch.map((index) => samples[index].label).join("、")}，再取平均 gradient。`;
        }

        function reset() {
            stopAuto();
            degree = Number(modelInput.value);
            weights = new Array(degree + 1).fill(0);
            random = createSeededRandom(Number(seedInput.value));
            trajectoryIndex = 0;
            updateCount = 0;
            highlightedIndices = new Set();
            lastUpdate = null;
            lossHistory = [meanSquaredError()];
            runStatus.textContent = "等待更新";
            summary.textContent = "曲线从 0 开始。先按轨迹顺序走几步，再改用 replay 看抽样顺序怎样变化。";
            render();
        }

        function render() {
            const loss = meanSquaredError();
            alphaOutput.textContent = Number(alphaInput.value).toFixed(2);
            modelStatus.textContent = degree === 1 ? "Linear" : "Quadratic";
            updateView.textContent = String(updateCount);
            lossView.textContent = formatNumber(loss, 4);
            batchSizeView.textContent = lastUpdate ? String(lastUpdate.indices.length) : "—";
            chart.replaceChildren(createApproximationChart(samples, weights, degree, highlightedIndices));
            lossChart.replaceChildren(createLineChart(
                [{ values: lossHistory }],
                {
                    minimum: 0,
                    maximum: Math.max(0.1, ...lossHistory),
                    label: "训练过程中全体样本均方误差",
                },
            ));

            buffer.replaceChildren(...samples.map((sample, index) => {
                const item = createElement(
                    "span",
                    `rl-replay-buffer__item${highlightedIndices.has(index) ? " is-active" : ""}`,
                    sample.label,
                );
                item.title = `x=${formatNumber(sample.x, 2)}，target=${formatNumber(sample.target, 2)}`;
                return item;
            }));

            if (!lastUpdate) {
                equation.innerHTML = "<strong>w ← w + α[target − v̂(s,w)]∇v̂(s,w)</strong><br>所有状态共用同一组 w。";
                return;
            }
            const gradient = `[${lastUpdate.gradient.map((value) => formatNumber(value, 3)).join(", ")}]`;
            const oldWeights = `[${lastUpdate.oldWeights.map((value) => formatNumber(value, 3)).join(", ")}]`;
            const newWeights = `[${weights.map((value) => formatNumber(value, 3)).join(", ")}]`;
            const source = lastUpdate.source === "replay" ? "replay minibatch" : samples[lastUpdate.indices[0]].label;
            equation.innerHTML = `<strong>${source}</strong><br>mean gradient = ${gradient}<br>w：${oldWeights} → <strong>${newWeights}</strong><br>本批 MSE = ${formatNumber(lastUpdate.batchLoss, 4)}`;
        }

        root.querySelector('[data-action="online"]').addEventListener("click", stepOnline);
        root.querySelector('[data-action="replay"]').addEventListener("click", stepReplay);
        autoButton.addEventListener("click", () => {
            if (autoTimer !== null) {
                stopAuto();
                return;
            }
            autoButton.textContent = "暂停";
            autoButton.setAttribute("aria-pressed", "true");
            runStatus.textContent = "按样本顺序连续更新";
            autoTimer = window.setInterval(stepOnline, 460);
            stepOnline();
        });
        root.querySelector('[data-action="reset"]').addEventListener("click", reset);
        modelInput.addEventListener("change", reset);
        alphaInput.addEventListener("input", render);
        seedInput.addEventListener("change", reset);
        reset();
        return { cleanup: stopAuto };
    }

    function renderTwoActionPolicy(container, firstLabel, firstProbability, secondLabel) {
        const rows = [
            { label: firstLabel, probability: firstProbability },
            { label: secondLabel, probability: 1 - firstProbability },
        ];
        container.replaceChildren(...rows.map(({ label, probability }) => {
            const row = createElement("div", "rl-action-bar");
            const name = createElement("span", "rl-action-bar__label", label);
            const track = createElement("span", "rl-action-bar__track");
            const fill = createElement("span", "rl-action-bar__fill");
            fill.style.width = `${probability * 100}%`;
            track.appendChild(fill);
            row.append(name, track, createElement("strong", "rl-action-bar__value", probability.toFixed(3)));
            return row;
        }));
    }

    function mountPolicyGradientLab(root) {
        setRootContent(root, `
            <div class="rl-lab__shell">
                <header class="rl-lab__header">
                    <div class="rl-lab__header-copy">
                        <p class="rl-lab__eyebrow">Policy gradient</p>
                        <h2>抽到哪个动作，就沿哪个 log-policy gradient 更新</h2>
                        <p>两个动作都只会随机给 0 或 1 分。REINFORCE 不保存 Q 表，而是更新 policy 参数 θ，同时改变 A、B 的概率。</p>
                    </div>
                    <span class="rl-lab__status-chip" data-view="run-status">等待采样</span>
                </header>
                <div class="rl-lab__controls">
                    <div class="rl-lab__field rl-lab__field--wide">
                        <label for="rl-pg-reward-a">A 得 1 分的概率：<span class="rl-lab__range-value" data-output="reward-a">0.75</span></label>
                        <input id="rl-pg-reward-a" data-control="reward-a" type="range" min="0.05" max="0.95" step="0.05" value="0.75">
                    </div>
                    <div class="rl-lab__field rl-lab__field--wide">
                        <label for="rl-pg-reward-b">B 得 1 分的概率：<span class="rl-lab__range-value" data-output="reward-b">0.25</span></label>
                        <input id="rl-pg-reward-b" data-control="reward-b" type="range" min="0.05" max="0.95" step="0.05" value="0.25">
                    </div>
                    <div class="rl-lab__field rl-lab__field--wide">
                        <label for="rl-pg-alpha">学习率 α：<span class="rl-lab__range-value" data-output="alpha">0.20</span></label>
                        <input id="rl-pg-alpha" data-control="alpha" type="range" min="0.02" max="0.5" step="0.01" value="0.2">
                    </div>
                    <div class="rl-lab__field">
                        <label for="rl-pg-baseline">baseline</label>
                        <select id="rl-pg-baseline" data-control="baseline">
                            <option value="none">不用 baseline</option>
                            <option value="mean">此前平均奖励</option>
                        </select>
                    </div>
                    <div class="rl-lab__field">
                        <label for="rl-pg-seed">随机种子</label>
                        <input id="rl-pg-seed" data-control="seed" type="number" min="1" step="1" value="31">
                    </div>
                    <div class="rl-lab__actions">
                        <button class="rl-lab__primary" data-action="sample" type="button">采样 1 次</button>
                        <button data-action="batch" type="button">连续采样 25 次</button>
                        <button data-action="auto" type="button" aria-pressed="false">连续运行</button>
                        <button data-action="reset" type="button">重置</button>
                    </div>
                </div>
                <div class="rl-lab__workspace">
                    <div class="rl-lab__stage">
                        <div class="rl-lab__stage-head"><h3>当前 stochastic policy</h3><span>π(A|s)=σ(θ)</span></div>
                        <div class="rl-action-bars" data-view="policy"></div>
                        <div class="rl-chart-wrap" data-view="chart"></div>
                        <div class="rl-legend"><span>π(A)</span><span class="is-secondary">累计平均奖励</span></div>
                    </div>
                    <div class="rl-lab__inspector">
                        <div class="rl-lab__inspector-head"><h3>最近一次 gradient</h3><span data-view="episode">0 次采样</span></div>
                        <div class="rl-metric-strip">
                            <div class="rl-metric"><span>θ</span><strong data-view="theta">0</strong></div>
                            <div class="rl-metric"><span>期望奖励</span><strong data-view="expected">0.5</strong></div>
                            <div class="rl-metric"><span>gradient 方差</span><strong data-view="variance">—</strong></div>
                        </div>
                        <div class="rl-equation" data-view="equation"></div>
                        <p class="rl-lab__summary" data-view="summary" aria-live="polite"></p>
                    </div>
                </div>
            </div>
        `);

        const rewardAInput = root.querySelector('[data-control="reward-a"]');
        const rewardBInput = root.querySelector('[data-control="reward-b"]');
        const alphaInput = root.querySelector('[data-control="alpha"]');
        const baselineInput = root.querySelector('[data-control="baseline"]');
        const seedInput = root.querySelector('[data-control="seed"]');
        const rewardAOutput = root.querySelector('[data-output="reward-a"]');
        const rewardBOutput = root.querySelector('[data-output="reward-b"]');
        const alphaOutput = root.querySelector('[data-output="alpha"]');
        const runStatus = root.querySelector('[data-view="run-status"]');
        const policyView = root.querySelector('[data-view="policy"]');
        const chart = root.querySelector('[data-view="chart"]');
        const episodeView = root.querySelector('[data-view="episode"]');
        const thetaView = root.querySelector('[data-view="theta"]');
        const expectedView = root.querySelector('[data-view="expected"]');
        const varianceView = root.querySelector('[data-view="variance"]');
        const equation = root.querySelector('[data-view="equation"]');
        const summary = root.querySelector('[data-view="summary"]');
        const autoButton = root.querySelector('[data-action="auto"]');
        let theta;
        let random;
        let episodeCount;
        let rewardTotal;
        let probabilityHistory;
        let averageRewardHistory;
        let recentGradients;
        let lastUpdate;
        let autoTimer = null;

        function stopAuto() {
            if (autoTimer !== null) {
                window.clearInterval(autoTimer);
                autoTimer = null;
            }
            autoButton.textContent = "连续运行";
            autoButton.setAttribute("aria-pressed", "false");
            runStatus.textContent = episodeCount === 0 ? "等待采样" : "已暂停";
        }

        function sampleOnce(shouldRender = true) {
            const probabilityA = sigmoid(theta);
            const choseA = random() < probabilityA;
            const rewardProbability = Number(choseA ? rewardAInput.value : rewardBInput.value);
            const reward = random() < rewardProbability ? 1 : 0;
            const baseline = baselineInput.value === "mean" && episodeCount > 0
                ? rewardTotal / episodeCount
                : 0;
            const score = choseA ? 1 - probabilityA : -probabilityA;
            const advantage = reward - baseline;
            const gradient = advantage * score;
            const oldTheta = theta;
            theta = clamp(theta + Number(alphaInput.value) * gradient, -8, 8);
            episodeCount += 1;
            rewardTotal += reward;
            recentGradients.push(gradient);
            recentGradients = recentGradients.slice(-30);
            probabilityHistory.push(sigmoid(theta));
            averageRewardHistory.push(rewardTotal / episodeCount);
            probabilityHistory = probabilityHistory.slice(-80);
            averageRewardHistory = averageRewardHistory.slice(-80);
            lastUpdate = {
                action: choseA ? "A" : "B",
                reward,
                baseline,
                advantage,
                score,
                gradient,
                oldTheta,
            };
            if (shouldRender) {
                runStatus.textContent = autoTimer === null ? "已采样并更新" : "连续采样中";
                if (Math.abs(advantage) < 1e-10) {
                    summary.textContent = `这次 ${lastUpdate.action} 的 G − b = 0，参数没有变化。`;
                } else if (advantage > 0) {
                    summary.textContent = `这次 ${lastUpdate.action} 的 G − b 为正，policy 提高这个动作的概率。`;
                } else {
                    summary.textContent = `这次 ${lastUpdate.action} 的 G − b 为负，policy 压低这个动作的概率。`;
                }
                render();
            }
        }

        function train(count) {
            for (let index = 0; index < count; index += 1) {
                sampleOnce(false);
            }
            runStatus.textContent = `已连续采样 ${count} 次`;
            summary.textContent = `刚采了 ${count} 次。随机回报让单步 gradient 上下摆动，长期平均方向才决定 policy 往哪边走。`;
            render();
        }

        function reset() {
            stopAuto();
            theta = 0;
            random = createSeededRandom(Number(seedInput.value));
            episodeCount = 0;
            rewardTotal = 0;
            probabilityHistory = [0.5];
            averageRewardHistory = [0];
            recentGradients = [];
            lastUpdate = null;
            runStatus.textContent = "等待采样";
            summary.textContent = "θ 从 0 开始，所以 A、B 各占一半。先采几次，单个样本未必会把 policy 推向更好的动作。";
            render();
        }

        function render() {
            const probabilityA = sigmoid(theta);
            const expectedReward = probabilityA * Number(rewardAInput.value)
                + (1 - probabilityA) * Number(rewardBInput.value);
            rewardAOutput.textContent = Number(rewardAInput.value).toFixed(2);
            rewardBOutput.textContent = Number(rewardBInput.value).toFixed(2);
            alphaOutput.textContent = Number(alphaInput.value).toFixed(2);
            renderTwoActionPolicy(policyView, "动作 A", probabilityA, "动作 B");
            episodeView.textContent = `${episodeCount} 次采样`;
            thetaView.textContent = formatNumber(theta, 3);
            expectedView.textContent = formatNumber(expectedReward, 3);
            if (recentGradients.length < 2) {
                varianceView.textContent = "—";
            } else {
                const mean = recentGradients.reduce((total, value) => total + value, 0) / recentGradients.length;
                const variance = recentGradients.reduce((total, value) => total + (value - mean) ** 2, 0)
                    / recentGradients.length;
                varianceView.textContent = formatNumber(variance, 4);
            }
            chart.replaceChildren(createLineChart(
                [
                    { values: probabilityHistory },
                    { values: averageRewardHistory },
                ],
                { minimum: 0, maximum: 1, label: "动作 A 的概率与累计平均奖励" },
            ));

            if (!lastUpdate) {
                equation.innerHTML = "<strong>θ ← θ + α(G − b)∇θ log π(A|s)</strong><br>policy 生成动作并给出 score gradient；G − b 决定它的权重。";
                return;
            }
            equation.innerHTML = `<strong>动作 ${lastUpdate.action}，G=${lastUpdate.reward}</strong><br>advantage = ${formatNumber(lastUpdate.reward, 2)} − ${formatNumber(lastUpdate.baseline, 3)} = ${formatNumber(lastUpdate.advantage, 3)}<br>∇ log π = ${formatNumber(lastUpdate.score, 3)}，gradient = ${formatNumber(lastUpdate.gradient, 3)}<br>θ：${formatNumber(lastUpdate.oldTheta, 3)} → <strong>${formatNumber(theta, 3)}</strong>`;
        }

        root.querySelector('[data-action="sample"]').addEventListener("click", () => sampleOnce(true));
        root.querySelector('[data-action="batch"]').addEventListener("click", () => train(25));
        autoButton.addEventListener("click", () => {
            if (autoTimer !== null) {
                stopAuto();
                return;
            }
            autoButton.textContent = "暂停";
            autoButton.setAttribute("aria-pressed", "true");
            runStatus.textContent = "连续采样中";
            autoTimer = window.setInterval(() => sampleOnce(true), 440);
            sampleOnce(true);
        });
        root.querySelector('[data-action="reset"]').addEventListener("click", reset);
        rewardAInput.addEventListener("input", reset);
        rewardBInput.addEventListener("input", reset);
        alphaInput.addEventListener("input", render);
        baselineInput.addEventListener("change", reset);
        seedInput.addEventListener("change", reset);
        reset();
        return { cleanup: stopAuto };
    }

    function renderActorCriticPath(container, episode) {
        container.replaceChildren();
        if (!episode) {
            container.appendChild(createElement("span", "rl-trajectory__state", "入口"));
            return;
        }
        container.appendChild(createElement("span", "rl-trajectory__state", "入口"));
        container.appendChild(createElement(
            "span",
            "rl-trajectory__arrow",
            episode.risky ? "冒险 / r=0 →" : "稳妥 / r=1 →",
        ));
        if (episode.risky) {
            container.appendChild(createElement("span", "rl-trajectory__state", "第二关"));
            container.appendChild(createElement(
                "span",
                "rl-trajectory__arrow",
                `${episode.terminalReward > 0 ? "成功" : "失败"} / r=${episode.terminalReward} →`,
            ));
        }
        container.appendChild(createElement("span", "rl-trajectory__state is-terminal", "终点"));
    }

    function mountActorCriticLab(root) {
        setRootContent(root, `
            <div class="rl-lab__shell">
                <header class="rl-lab__header">
                    <div class="rl-lab__header-copy">
                        <p class="rl-lab__eyebrow">Actor–Critic</p>
                        <h2>Critic 算 TD error，Actor 用它改 policy</h2>
                        <p>稳妥路线立刻得 1 分；冒险路线先到第二关，再拿 4 或 −2。切到 off-policy 后，行为策略固定五五开，并用 importance ratio 修正。</p>
                    </div>
                    <span class="rl-lab__status-chip" data-view="run-status">等待训练</span>
                </header>
                <div class="rl-lab__controls">
                    <div class="rl-lab__field">
                        <label for="rl-ac-behavior">采样方式</label>
                        <select id="rl-ac-behavior" data-control="behavior">
                            <option value="on">On-policy</option>
                            <option value="off">Off-policy：b(冒险)=0.5</option>
                        </select>
                    </div>
                    <div class="rl-lab__field rl-lab__field--wide">
                        <label for="rl-ac-success">冒险成功率：<span class="rl-lab__range-value" data-output="success">0.60</span></label>
                        <input id="rl-ac-success" data-control="success" type="range" min="0.1" max="0.9" step="0.05" value="0.6">
                    </div>
                    <div class="rl-lab__field rl-lab__field--wide">
                        <label for="rl-ac-actor-alpha">Actor α：<span class="rl-lab__range-value" data-output="actor-alpha">0.12</span></label>
                        <input id="rl-ac-actor-alpha" data-control="actor-alpha" type="range" min="0.02" max="0.4" step="0.01" value="0.12">
                    </div>
                    <div class="rl-lab__field rl-lab__field--wide">
                        <label for="rl-ac-critic-alpha">Critic β：<span class="rl-lab__range-value" data-output="critic-alpha">0.20</span></label>
                        <input id="rl-ac-critic-alpha" data-control="critic-alpha" type="range" min="0.02" max="0.5" step="0.01" value="0.2">
                    </div>
                    <div class="rl-lab__field rl-lab__field--wide">
                        <label for="rl-ac-gamma">折扣因子 γ：<span class="rl-lab__range-value" data-output="gamma">0.90</span></label>
                        <input id="rl-ac-gamma" data-control="gamma" type="range" min="0.1" max="1" step="0.05" value="0.9">
                    </div>
                    <div class="rl-lab__field">
                        <label for="rl-ac-seed">随机种子</label>
                        <input id="rl-ac-seed" data-control="seed" type="number" min="1" step="1" value="47">
                    </div>
                    <div class="rl-lab__actions">
                        <button class="rl-lab__primary" data-action="episode" type="button">训练 1 回合</button>
                        <button data-action="batch" type="button">训练 25 回合</button>
                        <button data-action="auto" type="button" aria-pressed="false">连续训练</button>
                        <button data-action="reset" type="button">重置</button>
                    </div>
                </div>
                <div class="rl-lab__workspace">
                    <div class="rl-lab__stage">
                        <div class="rl-lab__stage-head"><h3>Actor 的路线分配</h3><span>target policy π</span></div>
                        <div class="rl-action-bars" data-view="policy"></div>
                        <div class="rl-trajectory" data-view="path"></div>
                        <div class="rl-chart-wrap" data-view="chart"></div>
                        <div class="rl-legend"><span>π(冒险)</span><span class="is-secondary">behavior 采样回报均值</span></div>
                    </div>
                    <div class="rl-lab__inspector">
                        <div class="rl-lab__inspector-head"><h3>Actor 和 Critic 的更新</h3><span data-view="episode-count">0 回合</span></div>
                        <div class="rl-metric-strip">
                            <div class="rl-metric"><span>V(入口)</span><strong data-view="value-start">0</strong></div>
                            <div class="rl-metric"><span>V(第二关)</span><strong data-view="value-risky">0</strong></div>
                            <div class="rl-metric"><span>importance ratio ρ</span><strong data-view="rho">—</strong></div>
                        </div>
                        <div class="rl-equation" data-view="equation"></div>
                        <p class="rl-lab__summary" data-view="summary" aria-live="polite"></p>
                    </div>
                </div>
            </div>
        `);

        const behaviorInput = root.querySelector('[data-control="behavior"]');
        const successInput = root.querySelector('[data-control="success"]');
        const actorAlphaInput = root.querySelector('[data-control="actor-alpha"]');
        const criticAlphaInput = root.querySelector('[data-control="critic-alpha"]');
        const gammaInput = root.querySelector('[data-control="gamma"]');
        const seedInput = root.querySelector('[data-control="seed"]');
        const successOutput = root.querySelector('[data-output="success"]');
        const actorAlphaOutput = root.querySelector('[data-output="actor-alpha"]');
        const criticAlphaOutput = root.querySelector('[data-output="critic-alpha"]');
        const gammaOutput = root.querySelector('[data-output="gamma"]');
        const runStatus = root.querySelector('[data-view="run-status"]');
        const policyView = root.querySelector('[data-view="policy"]');
        const pathView = root.querySelector('[data-view="path"]');
        const chart = root.querySelector('[data-view="chart"]');
        const episodeCountView = root.querySelector('[data-view="episode-count"]');
        const valueStartView = root.querySelector('[data-view="value-start"]');
        const valueRiskyView = root.querySelector('[data-view="value-risky"]');
        const rhoView = root.querySelector('[data-view="rho"]');
        const equation = root.querySelector('[data-view="equation"]');
        const summary = root.querySelector('[data-view="summary"]');
        const autoButton = root.querySelector('[data-action="auto"]');
        let theta;
        let valueStart;
        let valueRisky;
        let random;
        let episodeCount;
        let returnTotal;
        let probabilityHistory;
        let returnHistory;
        let lastEpisode;
        let autoTimer = null;

        function stopAuto() {
            if (autoTimer !== null) {
                window.clearInterval(autoTimer);
                autoTimer = null;
            }
            autoButton.textContent = "连续训练";
            autoButton.setAttribute("aria-pressed", "false");
            runStatus.textContent = episodeCount === 0 ? "等待训练" : "已暂停";
        }

        function runEpisode(shouldRender = true) {
            const targetRiskyProbability = sigmoid(theta);
            const behaviorRiskyProbability = behaviorInput.value === "off" ? 0.5 : targetRiskyProbability;
            const risky = random() < behaviorRiskyProbability;
            const targetActionProbability = risky ? targetRiskyProbability : 1 - targetRiskyProbability;
            const behaviorActionProbability = risky ? behaviorRiskyProbability : 1 - behaviorRiskyProbability;
            const importanceRatio = targetActionProbability / behaviorActionProbability;
            const score = risky ? 1 - targetRiskyProbability : -targetRiskyProbability;
            const oldTheta = theta;
            const oldValueStart = valueStart;
            const oldValueRisky = valueRisky;
            const gamma = Number(gammaInput.value);
            const actorAlpha = Number(actorAlphaInput.value);
            const criticAlpha = Number(criticAlphaInput.value);
            let actorDelta;
            let criticDeltaRisky = null;
            let terminalReward;
            let episodeReturn;

            if (risky) {
                actorDelta = gamma * valueRisky - valueStart;
                theta = clamp(theta + actorAlpha * importanceRatio * actorDelta * score, -8, 8);
                valueStart += criticAlpha * importanceRatio * actorDelta;
                terminalReward = random() < Number(successInput.value) ? 4 : -2;
                criticDeltaRisky = terminalReward - valueRisky;
                valueRisky += criticAlpha * criticDeltaRisky;
                episodeReturn = gamma * terminalReward;
            } else {
                terminalReward = 1;
                actorDelta = terminalReward - valueStart;
                theta = clamp(theta + actorAlpha * importanceRatio * actorDelta * score, -8, 8);
                valueStart += criticAlpha * importanceRatio * actorDelta;
                episodeReturn = terminalReward;
            }

            episodeCount += 1;
            returnTotal += episodeReturn;
            probabilityHistory.push(sigmoid(theta));
            returnHistory.push(returnTotal / episodeCount);
            probabilityHistory = probabilityHistory.slice(-80);
            returnHistory = returnHistory.slice(-80);
            lastEpisode = {
                risky,
                terminalReward,
                episodeReturn,
                importanceRatio,
                score,
                actorDelta,
                criticDeltaRisky,
                oldTheta,
                oldValueStart,
                oldValueRisky,
            };
            if (shouldRender) {
                runStatus.textContent = autoTimer === null ? "已训练 1 回合" : "连续训练中";
                summary.textContent = risky
                    ? `这回合走了冒险路线，第二关拿到 ${terminalReward} 分。Actor 用入口处的 TD error，不直接读取最终 return。`
                    : "这回合走稳妥路线并立刻结束，入口处的 TD error 就是 1 − V(入口)。";
                render();
            }
        }

        function train(count) {
            for (let index = 0; index < count; index += 1) {
                runEpisode(false);
            }
            runStatus.textContent = `已训练 ${count} 回合`;
            summary.textContent = `训练了 ${count} 回合。每回合先算 TD error，Critic 用它更新估值，Actor 用它调整两条路线的概率。`;
            render();
        }

        function reset() {
            stopAuto();
            theta = 0;
            valueStart = 0;
            valueRisky = 0;
            random = createSeededRandom(Number(seedInput.value));
            episodeCount = 0;
            returnTotal = 0;
            probabilityHistory = [0.5];
            returnHistory = [0];
            lastEpisode = null;
            runStatus.textContent = "等待训练";
            summary.textContent = "Actor 起初把两条路线各分一半；Critic 的两个状态价值都从 0 开始。";
            render();
        }

        function render() {
            const riskyProbability = sigmoid(theta);
            successOutput.textContent = Number(successInput.value).toFixed(2);
            actorAlphaOutput.textContent = Number(actorAlphaInput.value).toFixed(2);
            criticAlphaOutput.textContent = Number(criticAlphaInput.value).toFixed(2);
            gammaOutput.textContent = Number(gammaInput.value).toFixed(2);
            renderTwoActionPolicy(policyView, "冒险", riskyProbability, "稳妥");
            renderActorCriticPath(pathView, lastEpisode);
            episodeCountView.textContent = `${episodeCount} 回合`;
            valueStartView.textContent = formatNumber(valueStart, 3);
            valueRiskyView.textContent = formatNumber(valueRisky, 3);
            rhoView.textContent = lastEpisode ? formatNumber(lastEpisode.importanceRatio, 3) : "—";
            chart.replaceChildren(createLineChart(
                [
                    { values: probabilityHistory },
                    { values: returnHistory },
                ],
                {
                    minimum: Math.min(-1, ...returnHistory),
                    maximum: Math.max(1.5, ...returnHistory),
                    label: "冒险路线概率与 behavior policy 的采样回报均值",
                },
            ));

            if (!lastEpisode) {
                equation.innerHTML = "<strong>δ = R + γV(S′) − V(S)</strong><br>入口 Critic：V ← V + βρδ<br>Actor：θ ← θ + αρδ∇ log π";
                return;
            }
            const route = lastEpisode.risky ? "冒险" : "稳妥";
            const secondDelta = lastEpisode.criticDeltaRisky === null
                ? ""
                : `<br>V(第二关)：${formatNumber(lastEpisode.oldValueRisky, 3)} + ${formatNumber(Number(criticAlphaInput.value), 2)} × ${formatNumber(lastEpisode.criticDeltaRisky, 3)} = ${formatNumber(valueRisky, 3)}`;
            equation.innerHTML = `<strong>${route}路线，ρ=${formatNumber(lastEpisode.importanceRatio, 3)}</strong><br>入口 δ = ${formatNumber(lastEpisode.actorDelta, 3)}，∇ log π = ${formatNumber(lastEpisode.score, 3)}<br>θ：${formatNumber(lastEpisode.oldTheta, 3)} + ${formatNumber(Number(actorAlphaInput.value), 2)} × ${formatNumber(lastEpisode.importanceRatio, 3)} × ${formatNumber(lastEpisode.actorDelta, 3)} × ${formatNumber(lastEpisode.score, 3)} = ${formatNumber(theta, 3)}<br>V(入口)：${formatNumber(lastEpisode.oldValueStart, 3)} + ${formatNumber(Number(criticAlphaInput.value), 2)} × ${formatNumber(lastEpisode.importanceRatio, 3)} × ${formatNumber(lastEpisode.actorDelta, 3)} = <strong>${formatNumber(valueStart, 3)}</strong>${secondDelta}`;
        }

        root.querySelector('[data-action="episode"]').addEventListener("click", () => runEpisode(true));
        root.querySelector('[data-action="batch"]').addEventListener("click", () => train(25));
        autoButton.addEventListener("click", () => {
            if (autoTimer !== null) {
                stopAuto();
                return;
            }
            autoButton.textContent = "暂停";
            autoButton.setAttribute("aria-pressed", "true");
            runStatus.textContent = "连续训练中";
            autoTimer = window.setInterval(() => runEpisode(true), 480);
            runEpisode(true);
        });
        root.querySelector('[data-action="reset"]').addEventListener("click", reset);
        behaviorInput.addEventListener("change", reset);
        successInput.addEventListener("input", reset);
        actorAlphaInput.addEventListener("input", render);
        criticAlphaInput.addEventListener("input", render);
        gammaInput.addEventListener("input", reset);
        seedInput.addEventListener("change", reset);
        reset();
        return { cleanup: stopAuto };
    }

    function mountLab(root) {
        if (root.dataset.rlDemo === "mdp") {
            return mountMdpLab(root);
        }
        if (root.dataset.rlDemo === "bellman") {
            return mountBellmanLab(root);
        }
        if (root.dataset.rlDemo === "iteration") {
            return mountIterationLab(root);
        }
        if (root.dataset.rlDemo === "estimation") {
            return mountEstimationLab(root);
        }
        if (root.dataset.rlDemo === "control") {
            return mountControlLab(root);
        }
        if (root.dataset.rlDemo === "approximation") {
            return mountApproximationLab(root);
        }
        if (root.dataset.rlDemo === "policy-gradient") {
            return mountPolicyGradientLab(root);
        }
        if (root.dataset.rlDemo === "actor-critic") {
            return mountActorCriticLab(root);
        }
        throw new Error(`未知的强化学习实验类型：${root.dataset.rlDemo || "(空)"}`);
    }

    function initializeRlLabsPage() {
        activeControllers.forEach((controller, root) => {
            if (!root.isConnected) {
                controller.cleanup();
                activeControllers.delete(root);
            }
        });

        document.querySelectorAll("[data-rl-demo]").forEach((root) => {
            if (activeControllers.has(root)) {
                return;
            }
            activeControllers.set(root, mountLab(root));
        });
    }

    window.RlLabMath = Object.freeze({
        discountedReturn,
        transitionOutcomes,
        qValue,
        sweepValues,
        generateRandomWalk,
        nStepReturn,
    });
    window.initializeRlLabsPage = initializeRlLabsPage;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeRlLabsPage, { once: true });
    } else {
        initializeRlLabsPage();
    }
})();
