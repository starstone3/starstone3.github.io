---
comments: true
---

# 不可判定

!!! definition "Algorithm"
    算法等价于一个**在所有输入上都能停机**的图灵机 (Always halt at all inputs)。

    因此,半判定问题对于算法是没有用的,因为其在一些输入上不能停机.

!!! question "通用图灵机 (Universal Turing Machine)"
    **Q: 图灵机可以被编程吗 (Can they be programmed)?**

    我们能否设计一个 "TM 模拟器" $U$，它本身也是一个图灵机？
    即设计一个机器 $U$，输入为 $\langle M, w \rangle$，输出 $M$ 在 $w$ 上的运行结果。

    **问题 (Problem)**
    
    - $M$ 的状态数 (states) 和符号集 (symbols) 大小是没有限制的。

    - 而 $U$ 是一个固定的机器，它必须拥有固定的状态集合和字母表。
    
    - 因此，$U$ 无法拥有与任意 $M$ 一一对应的单个符号或状态。

    **解决方案 (Solution)**
    
    - 采用 **编码 (Encoding)** 的方式。
    
    - 将 $M$ 的状态和符号以及 $M$ 本身表示为一个字符串。
    
    - $U$ 通过解析这个字符串来模拟 $M$ 的行为。

    ??? info "图灵机的编码"

        为了让通用图灵机 $U$ 能够模拟任意图灵机 $M$，我们需要定义一种通用的编码方式，将 $M$ 的状态和符号集映射为固定的字符串。

        符号的编码 (For $\Sigma \cup \{\leftarrow, \rightarrow\}$):

        - 设 $j$ 为满足 $2^j \ge |\Sigma| + 2$ 的最小整数 ($j = \min \{ j \in \mathbb{Z} \mid 2^j \ge |\Sigma| + 2 \}$).

        - $\Sigma$ 中的每个符号表示为字母 `a` 后接一个长度为 $j$ 的二进制串。

        - 我们固定特殊符号 $\sqcup, \triangleright, \leftarrow, \rightarrow$ 为字典序最小的 4 个符号。

        状态的编码 (For states):

        - 设 $i$ 为满足 $2^i \ge |K|$ 的最小整数 ($i = \min \{ i \in \mathbb{Z} \mid 2^i \ge |K| \}$).
        
        - $K$ 中的每个状态表示为字母 `q` 后接一个长度为 $i$ 的二进制串。
        
        - 起始状态 $s$ 表示为 `q` 后接 $i$ 个 `0` ($q0^i$)。

## Halting Problem

见 [Halting Problem](../ADS/np.md#halting-problem)
> 停机问题是半判定的，因为我们无法确定是否停机。

!!! proof "停机问题是半判定的"
    我们定义语言：
    
    *   $H = \{ "M" "w" \mid M \text{ halts on input string } w \}$ (停机问题)

    *   $H_1 = \{ "M" \mid M \text{ halts on input } "M" \}$ (自我停机)

    *   $\bar{H}_1 = \{ "M" \mid M \text{ does not halt on input } "M" \}$ (自我不停机)

    假设停机问题是递归的,我们希望能用反证法证明它不是递归的.

    **1. $H$ 递归 $\Rightarrow H_1$ 递归**
    
    如果存在 TM $M_0$ 能判定一般停机问题 $H$，那么我们可以构造 $M_1$ 来判定 $H_1$：
    
    1.  $M_1$ 将输入带从 $\triangleright \sqcup "M" \sqcup$ 转换为 $\triangleright \sqcup "M" "M" \sqcup$。

    2.  $M_1$ 模拟 $M_0$ 在新输入上的运行。
    
    **2. $H_1$ 递归 $\Rightarrow \bar{H}_1$ 递归**
    
    递归语言类对补运算封闭 (closed under complement)。如果 $H_1$ 是递归的，那么 $\bar{H}_1$ 也是递归的。

    
    **3. $\bar{H}_1$ 不是递归可枚举的 (Not R.E.)**
    
    我们证明 $\bar{H}_1$ 甚至不是半判定的。
    
    **反证法**:
    
    假设存在 TM $M^*$ 能够半判定 (semidecide) $\bar{H}_1$。即 $M^*$ 在输入 $w$ 上停机当且仅当 $w \in \bar{H}_1$。
    
    Consider whether $"M^*" \in \bar{H}_1$ ?
    
    $$
    "M^*" \in \bar{H}_1 \iff M^* \text{ does not halt on } "M^*" \quad (\text{Definition of } \bar{H}_1)
    $$
    
    但是，因为 $M^*$ 半判定 $\bar{H}_1$:
    
    $$
    "M^*" \in \bar{H}_1 \iff M^* \text{ halts on input } "M^*"
    $$
    
    $\Rightarrow$ **矛盾 (Contradiction)**: $M^*$ halts on $"M^*"$ $\iff$ $M^*$ does not halt on $"M^*"$.
    
    因此，不存在这样的 $M^*$，即 $\bar{H}_1$ 不是递归可枚举的。

    因此,我们证明了停机问题是递归可枚举的,也很显然,因为在它可接收的输入上,它可以停机,在它无法接收的输入上,它无法停机.


!!! note "另一个视角,停机问题是R.E.中最难的"
    **假设** $H$ 是递归的，即存在一个判定器 (decider) $M_0$ 可以判定 $H$。

    **给定** 任意一个半判定 (semideciding) 语言 $L(M)$ 的图灵机 $M$。
    
    我们可以设计一个新的图灵机 $M'$ 来**判定** $L(M)$，步骤如下：
    
    1.  **转换**: $M'$ 将其输入带从 $\triangleright \sqcup w \sqcup$ 转换为 $\triangleright \sqcup "M" "w" \sqcup$。
    
    2.  **模拟**: $M'$ 在该输入上模拟 $M_0$。
    
    **逻辑**: 
    
    因为 $M_0$ 能判定 $M$ 是否在 $w$ 上停机，如果 $M_0$ 输出“停机”，说明 $w \in L(M)$；如果 $M_0$ 输出“不停机”，说明 $w \notin L(M)$。
    
    这样，$M'$ 就能**判定**任何递归可枚举 (R.E.) 语言 $L(M)$。对于输入$w$,$M'$模拟$M_0$在输入$"M" "w"$上的运行。如果$M_0$输出`Yes`,那么说明$w \in L(M)$,$M'$也输出`Yes`，如果$M_0$输出`No`,那么说明$w \notin L(M)$,$M'$也输出`No`。这样,$M'$就判定了语言$L(M)$。
    
    这将意味着 **所有的 R.E. 语言都是递归的** (All R.E. languages are recursive)。
    
    **结论 (Remark)**:
    
    *   存在从所有 R.E. 语言到 $H$ 的归约 (Reductions from all r.e. languages to H)。

    *   因此，$H$ 对于 R.E. 语言是完备的 (**H is complete for the r.e. languages**)。


!!! definition "接收 vs 判定 (Recognize vs Decide)"
    *   **接收 (Recognize)**: 对于语言 $L$ 中的输入，图灵机停机并接受；对于不在 $L$ 中的输入，图灵机**可能停机拒绝，也可能死循环**。
        *   对应语言类：**递归可枚举 (Recursively Enumerable, R.E.)**
    
    *   **判定 (Decide)**: 对于语言 $L$ 中的输入，图灵机停机并接受；对于不在 $L$ 中的输入，图灵机**必须停机并拒绝** (Always Halts)。
        *   对应语言类：**递归 (Recursive)**


---


## 归约 (Reduction)

!!! definition "归约 (Reduction) $\tau$"
    设 $L_1, L_2 \subseteq \Sigma^*$ 为两个语言。从 $L_1$ 到 $L_2$ 的**归约 (reduction)** 是一个递归函数 $\tau: \Sigma^* \to \Sigma^*$，使得 $x \in L_1$ 当且仅当 $\tau(x) \in L_2$。

    归约 $\tau$ 可以看作是将 $L_1$ 的问题转换为 $L_2$ 的问题。

    1. 如果$L_2$是递归的，那么$L_1$也是递归的。
    
    2. 如果$L_1$不是递归的，那么$L_2$也不是递归的。

    **直观理解 (Intuition):**
    
    归约 $L_1 \le L_2$ 意味着 $L_2$ **至少和 $L_1$ 一样难** (at least as hard as $L_1$)。
    
    *   只要解决了 $L_2$ (Harder/Tycoon)，就能解决 $L_1$ (Easier/Peasant)。
    
    *   反之，如果连 $L_1$ 都解决不了 (Undecidable)，那更难的 $L_2$ 肯定也解决不了。

!!! example "空带停机问题 (Empty Tape Halting)"
    **问题**: 给定 TM $M$，判定 $M$ 是否在空带 (empty tape) 上停机？
    
    我们描述一个从通用停机问题 $H$ 到语言 $L = \{ "M" \mid M \text{ halts on } \epsilon \}$ 的归约。
    
    **归约过程**:
    
    1.  **输入**: $H$ 的实例 $\langle M, w \rangle$。
    2.  **构造**: 构造一个新的机器 $M_w$，它在开始运行时先将字符串 $w$ 写入空带，然后像 $M$ 一样运行。
        *   如果 $w = a_1 a_2 \dots a_n$，则 $M_w$ 的构造逻辑可以表示为：
            $$
            M_w = R a_1 R a_2 \dots R a_n L_\sqcup M
            $$
            (意为：向右移写 $a_1$，再向右移写 $a_2$...写完 $w$ 后回到开头，接着运行 $M$)。
    3.  **映射**: 归约函数 $\tau$ 将输入 $\langle M, w \rangle$ 映射为输出 $M_w$ ($\tau: "M""w" \to M_w$)。
    
    **正确性**:
    
    *   $\langle M, w \rangle \in H \Rightarrow M$ 在 $w$ 上停机 $\Rightarrow M_w$ 在空带上写入 $w$ 后运行并停机 $\Rightarrow M_w \in L$。

    *   $\langle M, w \rangle \notin H \Rightarrow M$ 在 $w$ 上不停机 $\Rightarrow M_w$ 在空带上写入 $w$ 后运行但不停机 $\Rightarrow M_w \notin L$。
    
    由此可见，$H \le L$。因为 $H$ 不可判定，所以 $L$ 也不可判定。
    > 在我看来,规约的精髓在于行为一致,也就是当且仅当的特点.当停机问题的图灵机输出Yes时,新问题,或者说新语言的图灵机也要输出Yes,反之亦然.对于no的情况也是一样

---

## 递归可枚举语言的性质

!!! definition "图灵可枚举 (Turing-enumerable)"
    我们称图灵机 $M$ **枚举 (enumerates)** 语言 $L$，当且仅当对于 $M$ 的某个固定状态 $q$，有：
    $$ L = \{ w \mid (s, \triangleright \sqcup) \vdash_M^* (q, \triangleright \sqcup w) \} $$
    一个语言是**图灵可枚举的 (Turing-enumerable)**，当且仅当存在一个图灵机枚举它。

    !!! info "解释 (Explanation)"
        可以将这里的 $M$ 看作一个 **生成器 (Generator)**，而不是通常的判定器。
        
        *   **从零开始**: 机器 $M$ 从**空带** (input is empty) 开始运行 (starting configuration $(s, \triangleright \sqcup)$)。
        
        *   **输出机制**: 只要 $M$ 运行到了特定状态 $q$，此时带子上写的内容 $w$ 就算作是被“枚举”出来了，即 $w \in L$。
        
        *   **持续运行**: 机器 $M$ 并不需要停机。它可以进入状态 $q$ (输出 $w_1$)，然后继续计算，再次进入状态 $q$ (输出 $w_2$)，周而复始。
        
        *   **集合定义**: 最终，语言 $L$ 就是 $M$ 在整个运行历史中所有“路过”状态 $q$ 时带子内容的集合。

!!! theorem "递归可枚举与图灵可枚举等价"
    一个语言是递归可枚举的 (Recursively Enumerable)，当且仅当它是图灵可枚举的 (Turing-enumerable)。

!!! theorem "递归语言的充要条件"
    语言 $L$ 是**递归的** (Recursive)，当且仅当 $L$ 和它的补集 $\bar{L}$ 都是**递归可枚举的** (Recursively Enumerable, r.e.)。
    
    $$ L \in \text{Recursive} \iff L \in \text{r.e.} \land \bar{L} \in \text{r.e.} $$

!!! proof "证明 (Proof)"
    **1. ($\Rightarrow$) 如果 $L$ 是递归的，那么 $L$ 和 $\bar{L}$ 都是 r.e.**
    
    *   如果 $L$ 是递归的，根据定义，它一定是递归可枚举的。
    *   递归语言对补运算封闭 (closed under complement)。因此，如果 $L$ 是递归的，$\bar{L}$ 也是递归的，从而 $\bar{L}$ 也是 r.e.。

    **2. ($\Leftarrow$) 如果 $L$和 $\bar{L}$ 都是 r.e.，那么 $L$ 是递归的**
    
    我们构造一个判定过程 (Decision Procedure) 来判定 $L$：
    
    *   **并行模拟 (Parallel Simulation)**: 给定输入 $w$，我们同时运行 $L$ 的半判定程序 $M$ 和 $\bar{L}$ 的半判定程序 $\bar{M}$。
    *   **必然停机**: 因为对于任意 $w$，要么 $w \in L$，要么 $w \in \bar{L}$ (两者必居其一)。因此，两个半判定程序中**必然有一个**会最终停机。
    *   **判定逻辑**:
        *   如果 $M$ 停机接受，$w \in L$，我们接受。
        *   如果 $\bar{M}$ 停机接受，$w \in \bar{L}$ (即 $w \notin L$)，我们拒绝。
        
    因此，我们可以总是在有限时间内给出 Yes/No 的回答，说明 $L$ 是递归的。

---

## 赖斯定理 (Rice's Theorem)


!!! theorem "赖斯定理 (Rice's Theorem)"
    **对于递归可枚举语言的任何非平凡（non-trivial）性质，判断一个图灵机所识别的语言是否满足该性质是不可判定的。**

    *   **指标集 (Index Set):** 令 $\mathcal{P}$ 为递归可枚举语言的一个类（即所有满足某种性质的R.E.语言）。指标集 $L_{\mathcal{P}}$ 是所有识别属于 $\mathcal{P}$ 的语言的图灵机编码的集合：

        $$ L_{\mathcal{P}} = \{ \langle M \rangle \mid L(M) \in \mathcal{P} \} $$

    *   **非平凡 (Non-trivial):** 该性质 $\mathcal{P}$ 既不是空集（$\emptyset$），也不是包含所有递归可枚举语言的全集。即 $\mathcal{P} \neq \emptyset$ 且 $\mathcal{P} \neq \text{all r.e. languages}$ 。这意味着至少有一个语言满足性质 $\mathcal{P}$，也至少有一个语言不满足性质 $\mathcal{P}$ 。

!!! proof "证明 (Proof)"
    > 我们将停机问题规约到这个问题

    假设 $L_{\mathcal{P}}$ 是可判定的，并且存在一个图灵机 $D$ 可以判定它。

    由于 $\mathcal{P}$ 是非平凡的，我们可以找到两个特殊的递归可枚举语言 (不失一般性，假设 $\emptyset \notin \mathcal{P}$，否则考虑 $\bar{\mathcal{P}}$)：

    *   $L_{\text{yes}}$：即满足性质 $\mathcal{P}$ 的语言 ($L_{\text{yes}} \in \mathcal{P}$)。设图灵机 $M_{\text{yes}}$ 识别 $L_{\text{yes}}$。
    *   $L_{\text{no}}$：即不满足性质 $\mathcal{P}$ 的语言 ($L_{\text{no}} \notin \mathcal{P}$)。在此假设 $M_{\text{no}}$ 识别空语言 $\emptyset$
    
    我们要根据停机问题的输入 $\langle M, w \rangle$（图灵机 $M$ 和输入串 $w$），构造一个新的图灵机 $M'$。我们希望 $M'$ 具有以下行为：

    *   如果 $M$ 在 $w$ 上停机，则 $L(M') = L_{\text{yes}}$ (属于 $\mathcal{P}$)。
    *   如果 $M$ 在 $w$ 上不停机，则 $L(M') = L_{\text{no}}$ (不属于 $\mathcal{P}$)。
    
    对于输入 $x$，机器 $M'$ 按如下步骤运行：

    1.  **模拟**: 模拟 $M$ 在 $w$ 上的运行。
    2.  **条件分支**:
        *   **情况 1：如果 $M$ 在 $w$ 上停机**。此时开始模拟 $M_{\text{yes}}$ 在 $x$ 上的运行。如果 $M_{\text{yes}}$ 接受 $x$，则 $M'$ 接受 $x$。
        *   **情况 2：如果 $M$ 在 $w$ 上永不停机**。那么 $M'$ 会一直卡在步骤 1，永远不会进入步骤 2。因此 $M'$ 不接受任何输入 $x$，即 $L(M') = \emptyset = L_{\text{no}}$。

    *   **若 $M$ 在 $w$ 上停机**: $M'$ 最终会执行 $M_{\text{yes}}$ 的逻辑。因此，$L(M') = L_{\text{yes}} \in \mathcal{P}$。
    *   **若 $M$ 在 $w$ 上不停机**: $M'$ 永远卡在模拟阶段，不接受任何串。因此，$L(M') = \emptyset \notin \mathcal{P}$。

    
    现在，我们得到了一个等价关系：
    $$ \langle M, w \rangle \in H \iff L(M') \in \mathcal{P} $$

    如果 $L_{\mathcal{P}}$ 是可判定的（即我们有判别器 $D$），那么我们可以把构造出的 $M'$ 喂给 $D$。
    
    *   如果 $D$ 接受 $M'$，那么 $M$ 在 $w$ 上停机。
    *   如果 $D$ 拒绝 $M'$，那么 $M$ 在 $w$ 上不停机。

    这就意味着我们判决了停机问题。然而，停机问题是已知的不可判定问题。由此可知，假设不成立，$L_{\mathcal{P}}$ 是不可判定的。

!!! tip "其他理解"
    赖斯定理告诉我们，**关于程序行为（语义）的任何非平凡问题都是无法通过算法完美解决的**。

    *   **语法 (Syntactic) 问题** 通常是可判定的：例如，“这个图灵机是否有 5 个状态？”（只要检查代码即可）。
    *   **语义 (Semantic) 问题** 通常是不可判定的：例如，“这个图灵机是否接受空串？”、“这个图灵机识别的语言是否是正则语言？”。

    根据赖斯定理，既然“接受空串”是一个非平凡的语义性质（有的机器接受，有的不接受），那么就不存在一个通用的算法能判定任意图灵机是否接受空串。