---
comments : true
---

# 语法分析 

基于CFG的parser有两种:

- top-down parser: 从根节点开始,逐步展开到叶子节点

    - 也就是从初始符号开始,根据产生式规则逐步替换成终结符

    - LL(K):**L**eft-to-right scanning, **L**eftmost derivation, **K** lookahead tokens

- bottom-up parser: 从输入字符串开始,逐步归约到根节点

    - 实验中的parser.y就是这种写法

> CFG的细节就不讲了.

## CFG

我们期望实现的效果是,给定CFG文法,检验某个输入字符串是否符合这个文法.

可以先看一个简单例子. 设文法为:

$$
\begin{aligned}
1.\ &E \to E * E \\
2.\ &E \to E / E \\
3.\ &E \to E + E \\
4.\ &E \to E - E \\
5.\ &E \to \text{id} \\
6.\ &E \to \text{num} \\
7.\ &E \to (E)
\end{aligned}
$$

下面说明串 `id * id + id` 可以由该文法推导出来,因此它属于这个文法生成的语言.

按最左推导(leftmost derivation)可写为:

$$
\begin{aligned}
E
&\Rightarrow E + E \\
&\Rightarrow E * E + E \\
&\Rightarrow \text{id} * E + E \\
&\Rightarrow \text{id} * \text{id} + E \\
&\Rightarrow \text{id} * \text{id} + \text{id}
\end{aligned}
$$

因此:

$$
\text{id} * \text{id} + \text{id} \in L(G)
$$

!!! info "Ambiguous grammar"

    上面的文法是**二义性的(ambiguous)**,因为它可以有多于一个的最左推导. 例如:

    $$
    \begin{aligned}
    E
    &\Rightarrow E * E \\
    &\Rightarrow E * E + E \\
    &\Rightarrow \text{id} * E + E \\
    &\Rightarrow \text{id} * \text{id} + E \\
    &\Rightarrow \text{id} * \text{id} + \text{id}
    \end{aligned}
    $$

    而我们前面已经给出了另一种最左推导:

    $$
    \begin{aligned}
    E
    &\Rightarrow E + E \\
    &\Rightarrow E * E + E \\
    &\Rightarrow \text{id} * E + E \\
    &\Rightarrow \text{id} * \text{id} + E \\
    &\Rightarrow \text{id} * \text{id} + \text{id}
    \end{aligned}
    $$

    这两种推导对应两种不同的分组方式:

    - `((id * id) + id)`
    - `(id * (id + id))`

    因此同一个串对应了不止一棵语法树,所以该文法是二义性的.

为了消除这种歧义,我们选择引入更多的非终结符

- `E` 表示 expression

- `T` 表示 term

- `F` 表示 factor

改写后的无二义性文法可以写成:

$$
\begin{aligned}
1.\ &E \to E + T \\
2.\ &E \to E - T \\
3.\ &E \to T \\
4.\ &T \to T * F \\
5.\ &T \to T / F \\
6.\ &T \to F \\
7.\ &F \to \text{id} \\
8.\ &F \to \text{num} \\
9.\ &F \to (E)
\end{aligned}
$$

这个改写的作用是:

- `E` 层只处理 `+` 和 `-`
- `T` 层只处理 `*` 和 `/`
- `F` 层只处理最基本的因子,如 `id`、`num`、括号表达式

于是乘除只能先在 `T` 这一层归约,加减只能在 `E` 这一层归约,从而强制了:

- `*`、`/` 的优先级高于 `+`、`-`
- $E \to E + T$、$E \to E - T$、$T \to T * F$、$T \to T / F$ 这样的左递归形式会对应**左结合(left associativity)**.这相当于语法树不断向左下角延伸,从而保证了左边的表达式先被计算

---

!!! definition "$"
    
    在文法中,我们用 `$` 来表示输入串的结束符(end of input),它不属于文法中的任何一个终结符. 例如,对于上面的文法,我们可以把输入串写成 `id * id + id $`,其中 `$` 表示输入串的结束.

## Recursive-descent parsing

前面讨论了 top-down parser 的基本思想. 更进一步,如果文法合适,我们甚至可以直接把文法翻译成一组递归函数,这就是**递归下降分析(recursive-descent parsing)**.

它的核心思想很直接:

- 每个非终结符对应一个递归函数
- 调用某个函数,就表示“尝试匹配这个非终结符”
- 这个非终结符的每个产生式,在代码里通常对应这个函数中的一个分支

例如,考虑下面这个文法:

$$
\begin{aligned}
S &\to \text{if}\ E\ \text{then}\ S\ \text{else}\ S \\
S &\to \text{begin}\ S\ L \\
S &\to \text{print}\ E \\
L &\to \text{end} \\
L &\to ;\ S\ L \\
E &\to \text{num} = \text{num}
\end{aligned}
$$

这个文法的结构很适合直接写成递归下降分析器. 例如:

- `S()` 负责匹配非终结符 `S`
- `L()` 负责匹配非终结符 `L`
- `E()` 负责匹配非终结符 `E`

其中 `L` 的两个产生式

$$
L \to \text{end}
\qquad
L \to ;\ S\ L
$$

就可以直接翻译成下面这样的代码:

```c
void L(void) {
    switch (tok) {
        case END:
            eat(END);
            break;
        case SEMI:
            eat(SEMI);
            S();
            L();
            break;
        default:
            error();
    }
}
```

这里的逻辑是:

- 如果当前记号是 `END`,就匹配产生式 `L \to end`
- 如果当前记号是 `SEMI`,就匹配产生式 `L \to ; S L`
- 否则说明输入不符合文法,调用 `error()`

其中:

- `tok` 表示当前向前看记号(current token)
- `eat(x)` 表示“当前记号必须是 `x` ,然后读入下一个记号”
- `error()` 表示语法错误

这样一来,文法规则就几乎一比一地变成了程序结构. 这也是递归下降分析最直观的地方: **文法的结构,基本上就是代码的结构**.

上面的例子非常简单,因为每一个非终结符的产生式的第一个字符都是不同的终结符,这使得我们可以直接根据当前记号来选择匹配哪个产生式. 但是如果文法更复杂,就不一定能直接写成递归下降分析器了.

下面看一个更接近实际表达式处理的例子. 设文法为:

$$
\begin{aligned}
S &\to E\$ \\
E &\to E + T \\
E &\to E - T \\
E &\to T \\
T &\to T * F \\
T &\to T / F \\
T &\to F \\
F &\to \text{id} \\
F &\to \text{num} \\
F &\to (E)
\end{aligned}
$$

按照前面的思路,我们很自然会想“给每个非终结符写一个函数”. 比如:

```c
void S(void) {
    E();
    eat(EOF);
}

void E(void) {
    switch (tok) {
        case ???:
            E();
            eat(PLUS);
            T();
            break;
        case ???:
            E();
            eat(MINUS);
            T();
            break;
        case ???:
            T();
            break;
        default:
            error();
    }
}
```

问题马上就出现了: 如果当前记号是 `num` 或 `id`,那么 `E` 的三个产生式

$$
E \to E + T
\qquad
E \to E - T
\qquad
E \to T
$$

看起来都“有可能”被使用. 也就是说,只看当前一个记号,我们并不能决定到底该选哪一个分支.

更严重的是,如果真的直接按 $E \to E + T$ 把代码写成对 `E()` 的递归调用,那么 `E()` 一进入自己又会立刻调用自己,从而导致**无限递归**. $T \to T * F$ 和 $T \to T / F$ 也有同样的问题.

这说明一件事: **并不是所有 CFG 都能直接写成递归下降分析器**.

综上,我们需要解决这两个问题:

1. 首先,我们需要知道在这三个产生式中进行选择时,各自产生式可能出现的第一个终结符.

2. 其次,如果多个产生式都可能以 `num` 开始,就需要改写文法,使得在该处只能唯一地选择一个产生式.



下面先解决第一个问题:

---

首先,我们需要了解三个set:

=== "Nullable"

    Nullable(X) = true,如果 X 能够推导出空串 $\epsilon$; 否则 Nullable(X) = false.

=== "First"

    First(X) = {a | X $\Rightarrow^*$ a$\alpha$},其中 a 是一个终结符, $\alpha$ 是一个字符串.
    > 也就是说,First(X) 包含了所有可能出现在 X 推导出的字符串开头的终结符.

=== "Follow"
    Follow(X) = {a | S $\Rightarrow^*$ $\alpha X a \beta$},其中 a 是一个终结符, $\alpha$ 和 $\beta$ 是字符串.
    > Follow(X)实际上和由X产生的字符串无关,它看重的是在整个生成过程中,X的后面可能会跟什么终结符.

有了这些定义之后,我们就可以回答这样一个问题:

- 对于非终结符 $X$ 的某个产生式 $X \to \gamma$,它可能以哪些终结符开头?

规则是:

- 任何属于 $First(\gamma)$ 的终结符,都可能作为这个产生式推导结果的第一个终结符

- 如果 $\gamma \Rightarrow^* \epsilon$,那么任何属于 $Follow(X)$ 的终结符,也可能在选择 $X \to \gamma$ 时出现在当前输入位置

也就是说,对产生式 $X \to \gamma$ 来说,它对应的候选输入记号集合可以写成:

$$
First(\gamma)\ \cup\ Follow(X) \qquad \text{if } \gamma \Rightarrow^* \epsilon
$$

更准确地说:

$$
\text{Predict}(X \to \gamma)=
\begin{cases}
First(\gamma), & \gamma \not\Rightarrow^* \epsilon \\
\left(First(\gamma) - \{\epsilon\}\right) \cup Follow(X), & \gamma \Rightarrow^* \epsilon
\end{cases}
$$

这个集合的作用是: 当当前 lookahead token 落在这个集合里时,我们就可以考虑选择产生式 $X \to \gamma$.

---

因此,只要我们写出了每个非终结符的 First 和 Follow 集合,就可以知道在每个非终结符的每个产生式处,应该选择哪个分支了.

接下来是具体的算法介绍.

### Computing Nullable, First, Follow

#### Nullable 的计算

$Nullable(X)=\text{true}$ 当且仅当 $X \Rightarrow^* \epsilon$.

这个集合通常用迭代法计算,思路和不动点求解类似:

```text
for each symbol X:
    Nullable(X) = false

repeat
    for each production X -> Y1 Y2 ... Yk:
        if Nullable(Yi) = true for all 1 <= i <= k:
            Nullable(X) = true
until Nullable did not change in this iteration
```

也就是说:

- 初始时先假设没有任何符号可以推出空串
- 如果某个产生式右侧的所有符号都可空,那么左侧非终结符也可空
- 持续重复,直到集合不再变化

#### First 的计算

$First(X)$ 可以按归纳方式定义.

Base case:

- 如果 $X$ 是终结符,那么

$$
First(X)=\{X\}
$$

Inductive case:

- 如果 $X$ 是非终结符,并且有产生式

$$
X \to Y_1 Y_2 \cdots Y_k
$$

那么:

$$
First(X)=First(X)\cup First(Y_1Y_2\cdots Y_k)
$$

而

$$
First(Y_1Y_2\cdots Y_k)=F_1\cup F_2\cup \cdots \cup F_k
$$

其中:

- $F_1 = First(Y_1)$
- 如果 $Y_1 \Rightarrow^* \epsilon$,那么 $F_2 = First(Y_2)$; 否则 $F_2 = \varnothing$
- 依此类推
- 如果 $Y_1Y_2\cdots Y_{k-1} \Rightarrow^* \epsilon$,那么 $F_k = First(Y_k)$; 否则 $F_k = \varnothing$


直观理解也很显然,由于在First中的终结符一定要是在最左侧的,所以要么是 $Y_1$ 的First,要么是后面一堆产生的First,前提是$Y_1$可以消失.

#### Follow 的计算

$Follow(X)$ 一般通过迭代方式计算.

基例(base case):

- 初始时先假设没有任何终结符跟在 $X$ 后面

$$
Follow(X)=\varnothing
$$

归纳步骤(inductive case):

- 对任意字符串 $\alpha,\beta$,如果有产生式

$$
Y \to \alpha X \beta
$$

那么:

$$
Follow(X)=Follow(X)\cup First(\beta)
$$

- 对任意字符串 $\alpha,\beta$,如果有产生式

$$
Y \to \alpha X \beta
\qquad\text{且}\qquad
\beta \Rightarrow^* \epsilon
$$

那么:

$$
Follow(X)=Follow(X)\cup Follow(Y)
$$

这两条规则的含义分别是:

- 如果 $X$ 后面还跟着一个串 $\beta$,那么 $\beta$ 能出现的首终结符,也可能跟在 $X$ 后面
- 如果 $\beta$ 可以整体消失,那么原来能跟在 $Y$ 后面的终结符,也能跟在 $X$ 后面

因此,`Nullable`、`First`、`Follow` 三者通常都不是一次就能算完,而是要不断扫描全部产生式,直到结果不再变化为止.

---

!!! example

    设文法为:

    $$
    \begin{aligned}
    Z &\to X Y Z \\
    Z &\to d \\
    Y &\to c \\
    Y &\to \epsilon \\
    X &\to a \\
    X &\to Y
    \end{aligned}
    $$

    我们希望最后填出下表:

    | Symbol | Nullable | First | Follow |
    | --- | --- | --- | --- |
    | $Z$ |  |  |  |
    | $Y$ |  |  |  |
    | $X$ |  |  |  |

    === "Step 1: Nullable"

        先判断哪些非终结符可以推出空串.

        可以从最直接的产生式开始:

        - $Y \to \epsilon$,所以 $Nullable(Y)=\text{true}$
        
        然后发现$X \to Y$,满足最开始说的右边每个项都满足可空,那么 $X$ 也可空,所以 $Nullable(X)=\text{true}$

        但是 $Z$ 的两个产生式 $Z \to X Y Z$ 和 $Z \to d$ 都不能推出空串,所以 $Nullable(Z)=\text{false}$.
        最终结果:

        | Symbol | Nullable |
        | --- | --- |
        | $Z$ | false |
        | $Y$ | true | 
        | $X$ | true |

    === "Step 2: First"

        接下来计算 $First$ 集合.

        我们按照最原始的做法,一个一个产生式地去计算.

        - 初始全部置空

        - $Z \to X Y Z$ 中,因为 $X,Y$ 可空,所以 $First(Z)=First(Z) \cup First(X Y Z) = First(X) \cup First(Y) \cup First(Z)=\{ \}$

        - $Z \to d$ 中,因为 $d$ 是终结符,所以 $First(d) = \{d\}$,因此 $First(Z) = \{d\}$

        - $Y \to c$ 中,因为 $c$ 是终结符,所以 $First(c) = \{c\}$,因此 $First(Y) = \{c\}$

        - $Y \to \epsilon$ 中,因为 $\epsilon$ 是空串,所以不考虑

        - $X \to a$ 中,因为 $a$ 是终结符,所以 $First(a) = \{a\}$,因此 $First(X) = \{a\}$

        - $X \to Y$ 中,$First(X) = First(X) \cup First(Y) = \{a\} \cup \{c\} = \{a,c\}$

        这一轮发生了变化,所以还要进行下一轮:

        - $Z \to X Y Z$ 中,$First(Z)=First(Z) \cup First(X Y Z) = First(X) \cup First(Y) \cup First(Z)=\{a,c,d\}$

        ...后面就没有变化了,可以自己去尝试

        因此最后的结果是:

        | Symbol | First |
        | --- | --- |
        | $Z$ | $\{a,c,d\}$ |
        | $Y$ | $\{c\}$ |
        | $X$ | $\{a,c\}$ |

    === "Step 3: Follow"

        最后计算 $Follow$ 集合.

        同样,初始全部为空

        - $Z = \to X Y Z$ ,这个式子我们可以得到:

            - $Follow(X) = Follow(X) \cup First(Y Z) = Follow(X) \cup First(Y) \cup First(Z) = \{a,c,d\}$

            - $Follow(Y) = Follow(Y) \cup First(Z) = \{a,c,d\}$

            - $Follow(Z) = Follow(Z) \cup Follow(Z) = \{a,c,d\}$
            > 这是因为Z后面就空了,所以Z的Follow集合也包含Z的Follow集合

        - $X \to Y$ ,这个式子我们可以得到:

            - $Follow(Y) = Follow(Y) \cup Follow(X) = \{a,c,d\}$

        ...后面就没有变化了,因此最终结果是:

        | Symbol | Follow |
        | --- | --- |
        | $Z$ | $\{\}$ |
        | $Y$ | $\{a,c,d\}$ |
        | $X$ | $\{a,c,d\}$ |

**总的来说,要看$First(X)$里有什么,就要去看$X$可以产生什么;要看$Follow(X)$里有什么,就要去看$X$可以被什么产生.**

实际上,这里三个集合的计算可以同时进行:

<div align="center">
    <img src="../../../image/firstandfollow.png" alt="first-follow" width="70%">
</div>

---

### 计算parser规则

有了这三个集合的结果,我们就可以开始填表了.

表的结构如下:

|    | $a$ | $c$ | $d$ |
| --- | --- | --- | --- |
| $Z$ |  |  |  |
| $Y$ |  |  |  |
| $X$ |  |  |  |

这个表的含义是:

- 行表示当前要展开的非终结符

- 列表示当前的 lookahead terminal

- 表项 $(X,T)$ 中填入的内容,表示“当栈顶是 $X$ 且当前输入符号是 $T$ 时,应该选择哪条产生式”

也就是说,如果我们已经算出了每条产生式的 $Predict$ 集合,那么就可以把对应的产生式填到表里.

规则如下:

- 如果 $T \in First(\gamma)$,那么就在第 $X$ 行、第 $T$ 列填入产生式 $X \to \gamma$

- 如果 $\gamma$ 是可空的,并且 $T \in Follow(X)$,那么也要在第 $X$ 行、第 $T$ 列填入产生式 $X \to \gamma$

> 实际上就是说,我们相信这个产生式能够满足下一个终结符是lookahead token的情况,所以就把它填到表里. 


这里填完的结果是:

|    | $a$ | $c$ | $d$ |
| --- | --- | --- | --- |
| $Z$ | $Z \to X Y Z$ | $Z \to X Y Z$ | $Z \to X Y Z$ , $Z \to d$ |
| $Y$ | $Y \to \epsilon$ | $Y \to c$ , $Y \to \epsilon$ | $Y \to \epsilon$ |
| $X$ | $X \to a$ , $X \to Y$ | $X \to Y$ | $X \to Y$ |

更细一点逐条看:

- $Z \to X Y Z$:
  因为 $First(XYZ)=\{a,c,d\}$,所以填入 $(Z,a)$、$(Z,c)$、$(Z,d)$

- $Z \to d$:
  因为 $First(d)=\{d\}$,所以再填入 $(Z,d)$

- $Y \to c$:
  因为 $First(c)=\{c\}$,所以填入 $(Y,c)$

- $Y \to \epsilon$:
  因为右侧可空,所以看 $Follow(Y)=\{a,c,d\}$,于是填入 $(Y,a)$、$(Y,c)$、$(Y,d)$

- $X \to a$:
  因为 $First(a)=\{a\}$,所以填入 $(X,a)$

- $X \to Y$:
  因为 $First(Y)=\{c\}$,并且 $Y$ 可空,还要并上 $Follow(X)=\{a,c,d\}$,所以最终填入 $(X,a)$、$(X,c)$、$(X,d)$

可以看到,这个表里出现了多个冲突:

- 在 $(Z,d)$ 处同时有 $Z \to X Y Z$ 和 $Z \to d$
- 在 $(Y,c)$ 处同时有 $Y \to c$ 和 $Y \to \epsilon$
- 在 $(X,a)$ 处同时有 $X \to a$ 和 $X \to Y$

因此这个文法对应的预测分析表不是单值的,也就是说它**不是 LL(1) 文法**.

但它是 LL(2) 文法,因为如果我们看两个记号,就可以唯一地选择产生式了.

---

### CFG中的栈


设文法为:

$$
S \to (S)S \mid \epsilon
$$

这个文法描述的是一类合法括号串. 对应的预测分析表可以写成:

| $M[N,T]$ | `(` | `)` | `$` |
| --- | --- | --- | --- |
| $S$ | $S \to (S)S$ | $S \to \epsilon$ | $S \to \epsilon$ |

这里的规则是:

- 如果栈顶是终结符,并且它等于当前输入符号,那么执行 `match`

- 如果栈顶是非终结符,那么根据预测分析表选择对应产生式进行展开

- 如果栈顶和当前输入都是 `$`,那么接受输入串

- 其他情况都表示语法错误

可以把它概括成一句话:

- Terminal: `match`

- Non-terminal: `derive`

下面用输入串 `()$` 演示整个过程.

| Step | Parsing Stack | Input | Action |
| --- | --- | --- | --- |
| 1 | `$S` | `()$` | $S \to (S)S$ |
| 2 | `$S)S(` | `()$` | `match` |
| 3 | `$S)S` | `)$` | $S \to \epsilon$ |
| 4 | `$S)` | `)$` | `match` |
| 5 | `$S` | `$` | $S \to \epsilon$ |
| 6 | `$` | `$` | `accept` |

这个过程可以这样理解:

- 第 1 步栈顶是非终结符 $S$,当前输入是 `(`,查表得 $S \to (S)S$

- 展开时要把右侧**逆序压栈**,所以栈从 `$S` 变成 `$S)S(`

- 第 2 步栈顶是终结符 `(`,与当前输入符号相同,因此匹配并同时弹出

- 第 3 步栈顶再次是 $S$,当前输入是 `)`,查表得 $S \to \epsilon$,因此直接弹出 $S$

- 第 4 步匹配 `)`
- 第 5 步剩下的 $S$ 在 lookahead 为 `$` 时继续推出 $\epsilon$
- 第 6 步栈和输入同时到达 `$`,因此接受

---

接下来,我们关注第二个问题:如果多个产生式都可能以 num 开始,就需要改写文法,使得在该处只能唯一地选择一个产生式.


其实就是把最左递归的文法改写成非左递归的文法:

一般来说,如果文法形如:

$$
A \to Aa \mid \beta
$$

那么它生成的串的形式其实是:

$$
\{\beta,\ \beta a,\ \beta aa,\ \ldots\}
$$

也就是说,它表示“先生成一个 $\beta$,然后在右边重复若干次 $a$”.

这实际上是有歧义的,因为$First(A)$里必然有$First(\beta)$,所以我们无法根据当前输入的第一个记号来唯一地选择产生式.

为了消除左递归,可以把它改写成:

$$
\begin{aligned}
A &\to \beta A' \\
A' &\to aA' \mid \epsilon
\end{aligned}
$$

这里新引入的 $A'$ 用来表示后面可以重复出现的那一串 $a$. 
