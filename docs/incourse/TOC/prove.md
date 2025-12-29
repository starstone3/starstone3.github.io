# 一些证明

## 等价构造

1. RL $\leftrightarrow$ DFA（常见路线：RE $\to$ $\epsilon$-NFA $\to$ DFA；DFA $\to$ RE 可用状态消去 汤普森构造法）

2. DFA $\leftrightarrow$ NFA（子集构造 + 显然方向）

3. CFG $\leftrightarrow$ PDA（CFG $\to$ PDA：用栈模拟推导；PDA $\to$ CFG：用“从 p 到 q 把栈顶 A 弹空”的变量）

4. TM $\leftrightarrow$ NTM（把非确定分支按 BFS/交错模拟,三带图灵机）

5. TM $\leftrightarrow$ UTM（编码 + 解释器/模拟器思想）

6. 单带 TM $\leftrightarrow$ 多带 TM（单带在逻辑上划分多段,代表多带,每次扫描整个带,获取足够多信息）


7. Rice Theorem证明,找两个语言，一个有性质，一个没有性质

## 判别工具

6. 正则语言 Pumping Lemma（用来“证非正则”,xyz中的y)

7. CFL Pumping Lemma（用来“证非 CFL”，uvwxy中的v和x)

## 闭包

| 语言类 | 并 ($\cup$) | 交 ($\cap$) | 补 ($\overline{L}$) | 连接 ($L_1L_2$) | 星号 ($L^*$) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **正则语言 (Regular)** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **上下文无关语言 (CFL)** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **递归语言 (Recursive)** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **递归可枚举语言 (RE)** | ✅ | ✅ | ❌ | ✅ | ✅ |

> **关键点说明**：
> 1. **CFL 的交集**：两个 CFL 的交集**不一定**是 CFL（经典反例：$L_1=\{a^nb^nc^m\}$, $L_2=\{a^mb^nc^n\}$ 都是 CFL，但交集 $a^nb^nc^n$ 不是）。
> 2. **CFL 的补集**：CFL 的补集**不一定**是 CFL。如果 CFL 对补集封闭，结合对并集封闭，根据德摩根律 $L_1 \cap L_2 = \overline{\overline{L_1} \cup \overline{L_2}}$ 可推导出对交集封闭，产生矛盾。
> 3. **RE 的补集**：RE 的补集**不一定**是 RE。如果一个语言 $L$ 和它的补集 $\overline{L}$ 都是 RE，那么 $L$ 是递归语言（Recursive）。停机问题 $H$ 是 RE，但其补集 $\overline{H}$ 不是 RE。

## 可判定 / 不可判定

12. Halting Problem 

13. 停机问题的补集是经典的not R.E.

14. Reduction (归约): $A \le_m B$
    - 定义：存在可计算函数 $f: \Sigma^* \to \Sigma^*$，使得 $\forall w, w \in A \iff f(w) \in B$。

    - 核心逻辑：若 $A$ 不可判定且 $A \le_m B$，则 $B$ 也不可判定。

15. Rice Theorem

16. **判断一个语言是不是 R.E. (递归可枚举)**
    - **核心思想**：如果一个字符串确实属于该语言，我们能否在**有限时间**内验证这一点（即停机并接受）。
    - **示例**：考虑语言 $L=\{\langle M_1, M_2 \rangle \mid M_1 \text{ 和 } M_2 \text{ 是 TM，且都在输入 } ab \text{ 上停机}\}$。
        - **分析**：如果 $\langle M_1, M_2 \rangle \in L$，意味着它们最终都会停机。我们可以并行模拟 $M_1$ 和 $M_2$ 在输入 $ab$ 上的运行。如果它们都停机，模拟器就会停止并接受。因此，我们能在有限时间内确认“属于”的情况，所以 $L$ 是 R.E. 的。

    - 从感性上讲,如果某些语言的性质是否定类型的,并且要在无限的空间里判断,通常不是R.E.的.比如,一个图灵机只接受2024种字符串,这暗含了,在无限的空间里,它不接受其他所有字符串,这是一个否定类型的性质,因此不是R.E.的.
