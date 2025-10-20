---
comments : true
---

# CFL与PDA

我们已经知道,形如 a^n b^n 的语言不是正则语言,但这种语言很容易使用一种递归的方式来定义.

显然$\epsilon$属于该语言,并且如果 w 属于该语言,那么 a w b 也属于该语言.

为了描述这种语言,我们引入了上下文无关文法(CFG).

## Context-Free Grammars

一个上下文无关文法是一个四元组$G=(V, T, P, S)$,其中

- V 是一个有限的非终结符号集合.

- T 是一个有限的终结符号集合,且$V \cap T = \emptyset$.

- P 是一个有限的产生式集合,每个产生式的形式为$A \rightarrow \alpha$,其中$A \in V$且$\alpha \in (V \cup T)^*$.

- S 是一个特殊的非终结符号,称为开始符号,且$S \in V$.

之所以称为上下文无关文法,是因为我们总是可以无条件的将非终结符号替换为其产生式右边的符号串,而不考虑该非终结符号在字符串中的上下文环境.

比如,在最开始的例子中,我们可以将$S$替换为$a S b$或者$\epsilon$,而不考虑$S$前后的符号是什么,就像宏替换一样.

!!! info "所有正则语言都是上下文无关语言"
    考虑一个DFA$M=(Q, \Sigma, \delta, q_0, F)$,我们可以构造一个CFG$G=(V, T, P, S)$,使得$L(G)=L(M)$.

    具体地,我们定义:

    - $V = Q$.

    - $T = \Sigma$.

    - 对于每个状态$q \in Q$和输入符号$a \in \Sigma$,如果$\delta(q, a) = p$,则在$P$中添加产生式$q \rightarrow a p$.

    - 对于每个接受状态$f \in F$,在$P$中添加产生式$f \rightarrow \epsilon$.

!!! tip "Remark"
    1. 对于任意字符串 $u, v \in V^{*}$，有：

        - $u \Rightarrow_{G} v \iff \exists\, x, y \in {(V+T)}^{*},\ A \in V,\ \text{使得 } u = x A y,\ v = x v' y,\ \text{且 } A \rightarrow_{G} v'$

        - $\Rightarrow_{G}^{*}$ 是 $\Rightarrow_{G}$ 的**自反且传递闭包**


    2. **G 中从 $w_{0}$ 推导出 $w_{n}$ 的一个推导过程为：**

        $$
        w_{0} \Rightarrow_{G} w_{1} \Rightarrow_{G} \cdots \Rightarrow_{G} w_{n}
        $$

        其中 $n$ 称为该推导的**长度**


    3. **G 所生成的语言定义为：**

        $$
        L(G) = \{\, w \in \Sigma^{*} \mid S \Rightarrow_{G}^{*} w \,\}
        $$

        - 因此,上下文无关语言是指可以被某个上下文无关文法**生成**的语言集合.


### 证明$L=L(G)$

还是以最开头的式子$L=\{a^n b^n | n \geq 0\}$为例,我们可以构造一个CFG$G=(V, T, P, S)$,满足:

- $S = S,T = {a, b}, V = {S}$

- $P$包含以下产生式:

    - $S \rightarrow a S b$

    - $S \rightarrow \epsilon$

    - $S \rightarrow SS$

    - $S \rightarrow b S a$


??? problem "为什么需要$S \rightarrow SS$"
    没有这个表达式,我们就无法生成形如$abba$的字符串


1. $w \in L \Rightarrow w \in L(G)$

    证明:使用数学归纳法.

    - 当$n=0$时,$w=\epsilon$,显然$S \Rightarrow \epsilon$,所以$\epsilon \in L(G)$.

    - 假设当$n=k$时,对于任意$w \in L$都有$w \in L(G)$成立.现在考虑$n=k+2$的情况.对于$n=k+2$的字符串$x$,有四种表现形式:

        - $x = a y b$,其中$y$的长度为$k$.根据归纳假设,$y \in L(G)$,所以$S \Rightarrow a S b \Rightarrow^* a y b = x$,因此$x \in L(G)$.

        - $x = b y a$,和第一种类似

        - $x = a y a$,我们总是可以将$y$分成$u v$两部分,使得这两部分中b的个数都比a多一个,则$au,va \in L$,根据归纳假设,$S \Rightarrow^* au$且$S \Rightarrow^* va$,所以$S \Rightarrow SS \Rightarrow^* au va = x$,因此$x \in L(G)$.

        - $x = b y b$,和第三种类似.

2. $w \in L(G) \Rightarrow w \in L$
    我们以推导长度来进行数学归纳法.

    - 当推导长度为1时,显然只能是$S \Rightarrow \epsilon$,所以$\epsilon \in L$.

    - 假设对于所有推导长度小于等于$n$的字符串$w \in L(G)$都有$w \in L$成立.现在考虑推导长度为$n+1$的字符串$x$.根据产生式的定义,有以下几种情况:

        - $S \Rightarrow a S b \Rightarrow^* x$,则$x$的形式为$a y b$,其中$y$的推导长度为$n$.根据归纳假设,$y \in L$,所以$x \in L$.

        - $S \Rightarrow b S a \Rightarrow^* x$,和第一种类似.

        - $S \Rightarrow SS \Rightarrow^* x$,则$x$可以分成$u v$两部分,使得$S \Rightarrow^* u$且$S \Rightarrow^* v$.根据归纳假设,$u, v \in L$,所以$x \in L$.

## Parse Trees
> 一个字符串的解析树(或语法树)是一个树形结构,用于表示该字符串是如何根据某个上下文无关文法生成的.

- 树的根节点表示开始符号.

- 内部节点表示非终结符号.

- 叶子节点表示终结符号.

!!! tip "Remark"
    1. 从叶子节点按从左到右顺序读出来的符号串就是该解析树所表示的字符串.

    2. 终结符只能出现在叶子节点，不能出现在中间过程节点.

    3. 非终结符只能出现在中间过程节点，不能出现在叶子节点.

    <div style="text-align: center;">
        <img src="../../../image/mac157.png" alt="Parse Tree" width="30%"/>
        <br>
        <caption>解析树示例</caption>
    </div>