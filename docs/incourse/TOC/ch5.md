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