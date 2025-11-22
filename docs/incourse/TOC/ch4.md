---
comments: true
---

# 图灵机

FA只能读取纸带上的内容并转移状态,PDA可以读取纸带上的内容并操作栈顶,而图灵机则可以读取纸带上的内容并对纸带进行读写操作.这意味着图灵机是最强大的自动机,任何可以被计算的问题都可以被图灵机解决.

!!! definition "图灵机"
    图灵机是一个五元组$M=(K,\Sigma,\delta,s,H)$,其中:

    - $K$ 是一个有限的状态集。

    - $\Sigma$ 是一个字母表，其中：
        - 包含 $\sqcup$ (空白符号) 和 $\triangleright$ (左端符号)。

        - 不包含符号 $\rightarrow$ 和 $\leftarrow$。

    - $s \in K$ 是初始状态。

    - $H \subseteq K$ 是停机状态集。

    - $\delta: (K - H) \times \Sigma \to K \times (\Sigma \cup \{\leftarrow, \rightarrow\})$ 是转移函数，满足：

        - 对于任意 $q \in K - H$，如果 $\delta(q, \triangleright) = (p, b)$，那么 $b = \rightarrow$。

        - 对于任意 $q \in K - H$ 和 $a \in \Sigma$，如果 $\delta(q, a) = (p, b)$，那么 $b \neq \triangleright$。

用图来表示图灵机就是:

<div style="text-align: center;">
    <img src="../../../image/mac179.png" width="30%">
    <br>
    <caption>图灵机示意图</caption>
</div>

也就是在状态$q$下读取纸带上的符号$a$,然后根据转移函数$\delta$转移到状态$p$,并且对纸带进行操作,要么写入一个符号,要么向左移动,要么向右移动.

一个图灵机识别语言的例子就是

<div style="text-align: center;">
    <img src="../../../image/mac180.png" width="50%">
    <br>
    <caption>图灵机识别语言示意图</caption>
</div>

在识别语言$L=\{a^nb^n|n\geq1\}$时,图灵机会先扫描纸带上的$a$,将其替换为$x$,然后继续向右扫描,直到遇到第一个$b$,将其替换为$y$,然后返回纸带的开头,继续扫描下一个$a$,重复这个过程,直到所有的$a$都被替换为$x$,然后继续扫描纸带,没有可识别的$a$了,在识别到$y$时就会进入下一个状态,这个状态仅识别$y$,也就是说此时如果还有多余的$b$的话,图灵机就会拒绝输入.

## Turing Machine Configuration

图灵机的配置如下图所示,由其当前的状态与两部分纸带内容组成:

<div style="text-align: center;">
    <img src="../../../image/mac181.png" width="80%">
    <br>
    <caption>图灵机配置示意图</caption>
</div>

写作配置$(q,\triangleright x,y)$,其中$q$是当前状态,$x$是纸带上读头左侧的内容,$y$是纸带上读头右侧的内容,一直到最后一个非空白符号为止.


当然,这个配置也可以写成二元组的形式$(q,\triangleright\ \underline{x}y)$,其中$x$和$y$的定义与上面相同.

更多的例子:

<div style="text-align: center;">
    <img src="../../../image/mac182.png" width="80%">
    <br>
    <caption>图灵机配置示意图</caption>
</div>

!!! definition "Computation"
    设 $M = (K, \Sigma, \delta, s, H)$ 是一个图灵机，并考虑 $M$ 的两个配置：$(q_1, w_1\underline{a_1}u_1)$ 和 $(q_2, w_2\underline{a_2}u_2)$，其中 $a_1, a_2 \in \Sigma$。
    
    我们说 $(q_1, w_1\underline{a_1}u_1)$ 在一步之内产生 $(q_2, w_2\underline{a_2}u_2)$，记作 $(q_1, w_1\underline{a_1}u_1) \vdash_M (q_2, w_2\underline{a_2}u_2)$，当且仅当，对于某个 $b \in \Sigma \cup \{\rightarrow, \leftarrow\}$，有 $\delta(q_1, a_1) = (q_2, b)$，并且满足以下三种情况之一：
    
    1.  **写入 (Write)**: $b \in \Sigma$
        -   $w_1 = w_2$
        -   $u_1 = u2$
        -   $a_2 = b$
    
    2.  **左移 (Move Left)**: $b = \leftarrow$
        -   $w_1 = w_2a_2$
        -   并且满足以下任一条件：
            -   如果 $a_1 \neq \sqcup$ 或 $u_1 \neq \epsilon$，则 $u_2 = a_1u_1$。例如,$(q_1,xy\underline{a_1}z) \vdash_M (q_2,x\underline{y}a_1z)$。
            -   如果 $a_1 = \sqcup$ 且 $u_1 = \epsilon$，则 $u_2 = \epsilon$。例:如,$(q_1,x\underline{\sqcup}) \vdash_M (q_2,\underline{x})$。
    
    3.  **右移 (Move Right)**: $b = \rightarrow$
        -   $w_2 = w_1a_1$
        -   并且满足以下任一条件：
            -   如果 $a_2 \neq \sqcup$ 或 $u_2 \neq \epsilon$，则 $u_1 = a_2u_2$。例:$(q_1,xy\underline{a_1}z) \vdash_M (q_2, xya_1\underline{z})$。
            -   如果 $a_2 = \sqcup$ 且 $u_2 = \epsilon$，则 $u_1 = \epsilon$。例:$(q_1,x\underline{a_1}) \vdash_M (q_2,xa_1\underline{\sqcup})$。


     同样,这个推导也有传递和自反闭包.和之前定义的一样,令$\vdash_M^*$表示推导的自反传递闭包,$\vdash_M^n$表示经过n步推导.


## Basic Machine

我们将图灵机归结为最简单的两种:Symbol Writing Machine和Hand Moving Machine.

它们的共同特点就是,只做一种操作,要么只写符号,要么只移动读头.只有两种状态.

对于一个固定的字母表 $\Sigma$ 和一个符号 $a \in \Sigma \cup \{\leftarrow, \rightarrow\} - \{\triangleright\}$，我们可以定义一个图灵机 $M_a = (\{s, h\}, \Sigma, \delta, s, \{h\})$，其中：

-   对于每个 $b \in \Sigma - \{\triangleright\}$，转移函数为 $\delta(s, b) = (h, a)$。

-   自然地，$\delta(s, \triangleright) = (s, \rightarrow)$。

这个图灵机 $M_a$ 的作用是在读到任何非左端符号后，执行动作 `a`（写入符号 `a`、左移或右移），然后立即停机。


- $R_{\sqcup}$: 找到当前磁带头右侧的第一个空白符号并停机。实现机制是如果读到非空白符号就右移,读到空白符号就停机.

    <div style="text-align: center;">
        <img src="../../../image/mac183.png" width="20%">
        <br>
        <caption>$R_{\sqcup}$示意图</caption>
    </div>

- $R_{\bar{\sqcup}}$: 找到当前磁带头右侧的第一个非空白符号并停机。实现机制是如果读到空白符号就右移,读到非空白符号就停机.

    <div style="text-align: center;">
        <img src="../../../image/mac184.png" width="20%">
        <br>
        <caption>$R_{\bar{\sqcup}}$示意图</caption>
    </div>

- $L_{\sqcup}$: 找到当前磁带头左侧的第一个空白符号并停机。

    <div style="text-align: center;">
        <img src="../../../image/mac186.png" width="20%">
        <br>
        <caption>$L_{\sqcup}$示意图</caption>
    </div>

- $L_{\bar{\sqcup}}$: 找到当前磁带头左侧的第一个非空白符号并停机。

    <div style="text-align: center;">
        <img src="../../../image/mac185.png" width="20%">
        <br>
        <caption>$L_{\bar{\sqcup}}$示意图</caption>
    </div>

## 组合图灵机

我们可以将多个图灵机组合成一个更复杂的图灵机，以实现更复杂的功能。例如，我们可以根据纸带上的符号来决定下一个要执行的图灵机。

!!! definition "形式化定义"
    正式地，令 $M_i = (K_i, \Sigma, \delta_i, s_i, H_i)$ 为图灵机（其中 $i = 1, 2, 3$）。组合后的图灵机为 $M = (K, \Sigma, \delta, s, H)$，其中：

    - $K = K_1 \cup K_2 \cup K_3$
    - $s = s_1$
    - $H = H_2 \cup H_3$

    对于每个 $\sigma \in \Sigma$ 和 $q \in K - H$，转移函数 $\delta(q, \sigma)$ 定义如下：

    - 如果 $q \in K_1 - H_1$，那么 $\delta(q, \sigma) = \delta_1(q, \sigma)$。
    - 如果 $q \in K_2 - H_2$，那么 $\delta(q, \sigma) = \delta_2(q, \sigma)$。
    - 如果 $q \in K_3 - H_3$，那么 $\delta(q, \sigma) = \delta_3(q, \sigma)$。
    - 如果 $q \in H_1$，那么：
        - 若 $\sigma = a$，则 $\delta(q, \sigma) = s_2$
        - 若 $\sigma = b$，则 $\delta(q, \sigma) = s_3$
        - 否则，$\delta(q, \sigma) \in H$

形成了如下的结构：

```
        +-------------------+
        |        M1         |
        |   +-----------+   |
        |   |           |   |
    --> | s1|           |h1 |---+
        |   |           |   |   |
        |   +-----------+   |   |
        +-------------------+   |
              |                 |
           a  |                 | b
              v                 v
        +-------------------+   +-------------------+
        |        M2         |   |        M3         |
        |   +-----------+   |   |   +-----------+   |
        |   |           |   |   |   |           |   |
        | s2|           |h2 |   | s3|           |h3 |
        |   |           |   |   |   |           |   |
        |   +-----------+   |   |   +-----------+   |
        +-------------------+   +-------------------+
```

- 箭头表示状态转移的方向。

- 当 $M_1$ 运行到 $h_1$，根据当前读到的符号（$a$ 或 $b$），分别跳转到 $M_2$ 或 $M_3$ 的起始状态继续运行。

## 使用图灵机

- 图灵机 M 接受输入字符串 $w \in (\Sigma - \{\sqcup, \triangleleft\})^*$，如果从初始配置 $(s, \triangleleft\ \underline{\sqcup}w)$ 出发，经过若干步推导后，能够到达一个接受配置

- 令 $\Sigma_0 \subseteq \Sigma - \{\sqcup, \triangleleft\}$ 为一个字母表 —— 即 M 的输入字母表。

- M 决定 $L \subseteq \Sigma^*$ 当且仅当对所有 $w \in \Sigma^*$，有：
    - $w \in L$ 当且仅当 M 接受 $w$；

    - $w \notin L$ 当且仅当 M 拒绝 $w$。

- 如果存在一个图灵机能够判定 $L$，则称语言 $L$ 是递归的（recursive）。

一个例子如下:

<div style="text-align: center;">
    <img src="../../../image/mac187.png" width="100%">
    <br>
    <caption>图灵机识别语言示意图</caption>
</div>

- 这里就用到了我们之前说的基础图灵机


### 递归可枚举

!!! definition
    设 $M = (K, \Sigma, \delta, s, H)$ 是一个图灵机。令 $\Sigma_0 \subseteq \Sigma - \{\triangleright, \sqcup\}$ 为一个字母表，$L \subseteq \Sigma_0^*$。
    
    - **半判定 (Semidecide)**: 图灵机 $M$ 半判定 $L$，当且仅当对所有 $w \in \Sigma^*$，以下条件成立：
        - $w \in L$ 当且仅当 $M$ 在输入 $w$ 上停机。
    
    - **递归可枚举 (Recursively Enumerable, r.e.)**：一个语言 $L$ 是递归可枚举的，当且仅当存在一个图灵机 $M$ 能够半判定 $L$
    > 所有递归语言都是递归可枚举语言

### 递归语言的性质

1. 递归语言的补集也是递归语言。

    - 只要一个图灵机能够判定语言 $L$，我们就可以构造另一个图灵机来判定 $L$ 的补集 $\overline{L}$，方法是交换接受和拒绝状态。

2. 递归语言的并集和交集也是递归语言。

    - 对于两个递归语言 $L_1$ 和 $L_2$，我们可以构造一个图灵机来判定它们的并集 $L_1 \cup L_2$ 和交集 $L_1 \cap L_2$，方法是分别运行判定 $L_1$ 和 $L_2$ 的图灵机，并根据结果决定接受或拒绝。


### 其他概念

1. 一般的,对于一个输入$w$,初始状态为$(s,\triangleright\ \underline{\sqcup}w)$,并且$w$中不能有$\triangleright$和$\sqcup$符号.

2.  假设图灵机 $M$ 在输入 $w$ 上停机，且 $(s, \triangleright\sqcup w) \vdash_M^* (h, \triangleright\sqcup y)$，其中 $y \in \Sigma_0^*$。则称 $y$ 为 $M$ 在输入 $w$ 上的**输出**，记作 $M(w)$。

3. **计算函数**：设 $f: \Sigma_0^* \to \Sigma_0^*$ 为一个函数。图灵机 $M$ 计算函数 $f$，当且仅当对所有 $w \in \Sigma_0^*$，有 $M(w) = f(w)$。

4. **递归函数**：函数 $f$ 是递归的，当且仅当存在一个图灵机 $M$ 能够计算 $f$。


!!! example "构造一个图灵机计算函数$succ(n)=n+1$"
    <div style="text-align: center;">
        <img src="../../../image/mac193.png" width="30%">
        <br>
        <caption>图灵机计算函数$succ(n)=n+1$示意图</caption>
    </div>

    先找到这个二进制串的最后一位,然后:

    - 如果是0,就把它改成1,然后停机.

    - 如果是1,就把它改成0,然后继续向左找下一位,重复这个过程.

    - 如果是空格,说明原来是形如`111...1`的字符串,就把空格改成1,原来的整体右移一位(已经全部变成0),然后停机.

---


## 图灵机拓展

### Multi-tape Turing Machine

!!! definition "k-带图灵机"
    设 $k \geq 1$ 是一个整数。$k$-带图灵机是一个五元组 $M = (K, \Sigma, \delta, s, H)$，其中：
    
    - $K$、$\Sigma$、$s$ 和 $H$ 的定义与普通图灵机相同。
    
    - 转移函数为：$\delta: (K - H) \times \Sigma^k \to K \times (\Sigma \cup \{\leftarrow, \rightarrow\})^k$

!!! definition "k-带图灵机的配置"
    设 $M = (K, \Sigma, \delta, s, H)$ 是一个 $k$-带图灵机。$M$ 的配置是以下集合的一个成员：
    
    $$K \times \left(\triangleright\Sigma^* \times (\Sigma^* (\Sigma - \sqcup) \cup \{\epsilon\})\right)^k$$
    
    即**每一带**都有一个左端符号 $\triangleright$，左侧的内容，和右侧到最后一个非空白符号的内容。

**约定**:

1. 输入的字符串被放在第一个磁带上

2. 其他磁带初始时为空白符号,并且头在最左边的空格上

3. 计算的最后,输出在第一个磁带上,其他磁带可以忽略.


!!! example "复制机 (Copying Machine)"
    **问题**：将 $\sqcup w\sqcup$ 转换为 $\sqcup w\sqcup w\sqcup$（其中 $w$ 不包含空白符号）
    
    **解决方案**：使用 2-带图灵机实现。
    
    **算法步骤**：
    
    1. **第一阶段 - 复制到第二带**

        - 同时向右移动两条磁带的读头

        - 将第一条磁带上的每个符号复制到第二条磁带上

        - 直到在第一条磁带上遇到空白符号为止
    
    2. **第二阶段 - 准备第二带**

        - 向左移动第二条磁带的读头

        - 直到在第二条磁带上遇到空白符号为止
    
    3. **第三阶段 - 复制回第一带**

        - 同时向右移动两条磁带的读头

        - 将第二条磁带上的符号复制到第一条磁带上
        
        - 当第二条磁带上遇到空白符号时停机
    
    **结果**：第一条磁带最终包含 $\sqcup w\sqcup w\sqcup$

    <div style="text-align: center;">
        <img src="../../../image/mac194.png" width="40%">
        <br>
        <caption>复制机示意图</caption>
    </div>

    <div style="text-align: center;">
        <img src="../../../image/mac195.png" width="60%">
        <br>
        <caption>一个例子</caption>
    </div>