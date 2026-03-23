---
comments: true
---

# 多量子比特

## Tensor Product

两个比特放在一起,一共有四种状态,对于这四种状态,我们可以用One-hot编码来表示:

$$
\begin{aligned}
|00\rangle &= (1,0,0,0)^T \\
|01\rangle &= (0,1,0,0)^T \\
|10\rangle &= (0,0,1,0)^T \\
|11\rangle &= (0,0,0,1)^T
\end{aligned}
$$

更一般地说,如果 $A$ 是一个 $m \times n$ 的矩阵(或向量), $B$ 是一个 $p \times q$ 的矩阵(或向量),那么它们的张量积 $A \otimes B$ 会得到一个 $mp \times nq$ 的矩阵,写成块矩阵的形式就是

$$
A \otimes B =
\begin{pmatrix}
a_{11}B & a_{12}B & \cdots & a_{1n}B \\
a_{21}B & a_{22}B & \cdots & a_{2n}B \\
\vdots & \vdots & \ddots & \vdots \\
a_{m1}B & a_{m2}B & \cdots & a_{mn}B
\end{pmatrix}.
$$

如果是两个向量 $|u\rangle$ 和 $|v\rangle$ 的张量积,通常会简写成

$$
|u\rangle|v\rangle
$$

或者直接写成

$$
|uv\rangle.
$$

上面写的 $|00\rangle, |01\rangle, |10\rangle, |11\rangle$ 就都是这种简写。

例如

$$
|0\rangle \otimes |0\rangle = |00\rangle,\quad
|0\rangle \otimes |1\rangle = |01\rangle,
$$

$$
|1\rangle \otimes |0\rangle = |10\rangle,\quad
|1\rangle \otimes |1\rangle = |11\rangle.
$$

所以,两个 qubit 放在一起之后,状态空间就从原来的二维变成了四维。

---

换句话说,两个 qubit 的状态就是空间

$$
(\mathbb{C}^2)^{\otimes 2} = \mathbb{C}^2 \otimes \mathbb{C}^2
$$

中的单位向量。

如果第一个 qubit 处在 $|0\rangle$,第二个 qubit 处在 $|1\rangle$,那么整个双 qubit 系统的状态就是

$$
|0\rangle \otimes |1\rangle,
$$

也可以简写成

$$
|0\rangle|1\rangle
\quad \text{或者} \quad
|01\rangle.
$$

更一般地,如果第一个 qubit 处在

$$
\alpha_1|0\rangle + \beta_1|1\rangle,
$$

第二个 qubit 处在

$$
\alpha_2|0\rangle + \beta_2|1\rangle,
$$

那么它们合在一起之后的乘积态就是

$$
(\alpha_1|0\rangle + \beta_1|1\rangle)\otimes(\alpha_2|0\rangle + \beta_2|1\rangle)
$$

把它展开,得到

$$
\alpha_1\alpha_2|00\rangle
+ \alpha_1\beta_2|01\rangle
+ \beta_1\alpha_2|10\rangle
+ \beta_1\beta_2|11\rangle.
$$

这里虽然把两个 qubit 放到了一起,但它们携带的信息仍然是可分开的,所以这种态叫做**乘积态**。

一个直接的表现是: 如果我们只对第一个 qubit 作用一个算子 $L$,第二个 qubit 不会变。写成公式就是

$$
(L \otimes I)(|u\rangle \otimes |v\rangle) = (L|u\rangle) \otimes |v\rangle.
$$

这里的 $I$ 是恒等算子,表示“第二个 qubit 什么都不做”。

---

> 然而,并不是所有的双 qubit 态都是separable的,也就是说,并不是所有的双 qubit 态都能写成某个乘积态的形式。
>
> 那些**不能**写成乘积态的双 qubit 态,就叫做**纠缠态**。

先看单个 qubit。一个一般态可以写成

$$
|\psi\rangle = \alpha|0\rangle + \beta|1\rangle,
\qquad \alpha,\beta \in \mathbb{C}.
$$

这里一开始有 $2$ 个复数,也就是 $4$ 个实参数。但其中:

- 归一化条件 $|\alpha|^2 + |\beta|^2 = 1$ 去掉了 $1$ 个实自由度

- 整体相位 $e^{i\phi}$ 不影响物理态,因此又去掉了 $1$ 个实自由度

所以,一个 qubit 的纯态实际上只需要 $2$ 个实参数来描述。

于是,一个双 qubit 的乘积态

$$
|u\rangle \otimes |v\rangle
$$

本质上就是“第一个 qubit 的 $2$ 个实参数 + 第二个 qubit 的 $2$ 个实参数”,总共只需要 $4$ 个实参数。

但最一般的双 qubit 纯态可以写成

$$
|\psi\rangle = a|00\rangle + b|01\rangle + c|10\rangle + d|11\rangle,
\qquad a,b,c,d \in \mathbb{C}.
$$

这里有 $4$ 个复数,也就是 $8$ 个实参数。再减去:

- 一个归一化条件
- 一个整体相位

最后还剩下 $6$ 个实自由度。

这说明一般双 qubit 态的空间,比乘积态的空间要大得多。

所以,纠缠并不是“两个 qubit 放在一起”这么简单,而是说整个系统的状态已经不能再拆成“第一个 qubit 的状态”和“第二个 qubit 的状态”的直接乘积了。
> 需要注意的是,在双量子比特系统中,更严格的写法通常应是 $\sigma_x \otimes I$,它表示 $\sigma_x$ 只作用在第一个 qubit 上,而第二个 qubit 保持不变。在上下文明确时,有时也会把它简写成 $\sigma_x$,但这时默认的意思仍然是“对第一个 qubit 作用 $\sigma_x$,对第二个 qubit 什么都不做”。

---

## 如何测量

直接给结论:对于一个状态为$| \psi \rangle$的系统,去测量$L$,测量的期望值是$\langle \psi | L | \psi \rangle$。

!!! prove
    由于$L$是厄米算子,根据谱定理,我们可以找到$L$的一组本征态$\{ | \lambda_i \rangle \}$,以及对应的本征值$\{ \lambda_i \}$,使得

    $$
    L = \sum_i \lambda_i | \lambda_i \rangle \langle \lambda_i |.
    $$

    我们又知道,在测量态为$| \psi \rangle$的系统时,测量结果$\lambda_i$出现的概率是

    $$
    p_i = | \langle \lambda_i | \psi \rangle |^2 = \langle \psi | \lambda_i \rangle \langle \lambda_i | \psi \rangle.
    $$

    而期望$E$=$\sum_i p_i \lambda_i$,所以

    $$
    E = \sum_i \lambda_i \langle \psi | \lambda_i \rangle \langle \lambda_i | \psi \rangle
    = \langle \psi | \left( \sum_i \lambda_i | \lambda_i \rangle \langle \lambda_i | \right) | \psi \rangle
    = \langle \psi | L | \psi \rangle.
    $$

然而,上面的式子只对纯态是显然的

=== "纯态"

    纯态的意思是: 我们对系统的状态知道得很完整,它就是某一个确定的态向量。

    例如,一个 qubit 处在

    $$
    |0\rangle
    $$

    或者处在

    $$
    \frac{|0\rangle + |1\rangle}{\sqrt{2}},
    $$

    这两种都属于纯态。

    要注意,第二个例子虽然是叠加态,但它仍然是纯态。因为这是振动的叠加,而不是概率的混合。


=== "混态"

    混态的意思是: 系统并不是处在一个我们已知的确定态向量上,而是我们只知道它有若干种可能,但不知道这次具体是哪一个。

    例如,我们准备了很多个 qubit,其中一半是

    $$
    |0\rangle,
    $$

    另一半是

    $$
    |1\rangle.
    $$

    如果只随机拿出其中一个来看,那你并不知道它这次到底是 $|0\rangle$ 还是 $|1\rangle$。这种“经典概率混合”就是混态。

    所以:

    - $\dfrac{|0\rangle + |1\rangle}{\sqrt{2}}$ 是纯态

    - “以 $50\%$ 概率是 $|0\rangle$,以 $50\%$ 概率是 $|1\rangle$” 是混态


如果要计算一个处于混合态下的系统的测量,我们就需要引入密度矩阵

---

## Density Matrix

我们在线性代数中学过,一个矩阵的迹是它的对角线元素之和,记作 $\mathrm{Tr}(A)$。

在这里,我们介绍一种迹的写法,记厄米算子 $L$ 的谱分解为

$$
L = \sum_i \lambda_i | \lambda_i \rangle \langle \lambda_i |,
$$

那么我们可以定义

$$
\operatorname{Tr}(L) = \sum_i \langle i|L|i\rangle,
$$

其中 $\{|i\rangle\}$ 是一组正交归一基,在这组基下,$L$的矩阵是一个对角矩阵,对角线上的元素就是 $L$ 的本征值 $\lambda_i$。

对于纯态 $|\psi\rangle$,我们已经知道,它对算子 $L$ 的期望值可以写成

$$
\langle \psi|L|\psi\rangle.
$$

现在利用完备关系

$$
I=\sum_i |i\rangle\langle i|,
$$

可以把它改写成

$$
\langle \psi|L|\psi\rangle
= \sum_i \langle \psi|L|i\rangle\langle i|\psi\rangle
= \sum_i \langle i|\psi\rangle\langle \psi|L|i\rangle.
$$

第二个等号只是把两个复数的顺序交换了一下。

我们可以看到,这个式子相当于是用正交基把中间那一坨包裹起来了,于是根据迹的定义,

$$
\langle \psi|L|\psi\rangle
= \operatorname{Tr}(|\psi\rangle\langle\psi|L).
$$

如果记

$$
\rho \equiv |\psi\rangle\langle\psi|,
$$

那么就可以把纯态的期望值写成

$$
\langle \psi|L|\psi\rangle = \operatorname{Tr}(\rho L).
$$

这里的 $\rho$ 就是纯态 $|\psi\rangle$ 对应的密度矩阵。

混合态也可以用同样的方式来算期望值。例如,Alice 只知道系统有一半概率处在 $|0\rangle$,另一半概率处在 $|r\rangle$,但她并不知道这一次具体是哪一个态。

那么她对算子 $L$ 的期望值就应该写成

$$
\langle L\rangle
= \frac{1}{2}\langle 0|L|0\rangle
+ \frac{1}{2}\langle r|L|r\rangle.
$$

再利用刚才纯态的写法,这也可以改写成

$$
\langle L\rangle
= \frac{1}{2}\operatorname{Tr}(|0\rangle\langle 0|L)
+ \frac{1}{2}\operatorname{Tr}(|r\rangle\langle r|L).
$$

所以如果定义这个混合态的密度矩阵为

$$
\rho = \frac{1}{2}|0\rangle\langle 0| + \frac{1}{2}|r\rangle\langle r|,
$$
> 实际上,混合态的密度矩阵一般写法也就是$\rho = \sum_i p_i |\psi_i\rangle\langle\psi_i|$,其中$p_i$是系统处在态$|\psi_i\rangle$的概率。

那么它的期望值就统一写成

$$
\langle L\rangle = \operatorname{Tr}(\rho L).
$$

---

### Reduced Density Matrix

接下来还会遇到一种更常见的情况: 整个系统是一个多体系统,但我们手里只能测其中的一部分。

例如,设第三方 Charlie 每次都制备两个 qubit 的联合态 $|\psi\rangle$,然后把一个 qubit 发给 Alice,另一个发给 Bob。

这时整个系统的密度矩阵是

$$
\rho = |\psi\rangle\langle\psi|.
$$

但 Alice 手里只有自己的那个 qubit,因此她能做的测量只能是局域测量。若她测量一个只作用在自己那部分空间上的算子 $L_A$,那么在整个双 qubit 系统上,这个算子应写成

$$
L_A \otimes I_B.
$$

如果这个实验重复很多次,Alice 就可以通过统计平均得到

$$
\langle L_A\rangle
= \langle \psi|(L_A\otimes I_B)|\psi\rangle.
$$

这时自然会问: 能不能只用 Alice 自己那一部分的信息来计算这个期望值? 也就是说,是否存在某个只作用在 Alice 空间上的矩阵 $\rho_A$,使得

$$
\langle L_A\rangle = \operatorname{Tr}(\rho_A L_A)
$$

答案是可以的。这个 $\rho_A$ 就叫做 Alice 子系统的**约化密度矩阵**(reduced density matrix),它由整个系统的密度矩阵对 Bob 的自由度做偏迹(partial trace)得到:

$$
\rho_A = \operatorname{Tr}_B(\rho).
$$

偏迹可以这样理解:

- 如果整个态本来就是乘积形式

    $$
    |\psi\rangle = |u\rangle \otimes |v\rangle,
    $$

    那么对 Bob 做偏迹之后,直接就得到 Alice 那一部分的密度矩阵

    $$
    \rho_A = |u\rangle\langle u|.
    $$

- 如果整个态不是简单的乘积态,而是一个叠加态,那么就需要按 Bob 的一组正交归一基 $\{|j\rangle_B\}$ 来求和:

    $$
    \rho_A
    = \operatorname{Tr}_B(|\psi\rangle\langle\psi|)
    = \sum_j \langle j_B|\psi\rangle \langle\psi|j_B\rangle.
    $$

    > 实际上,这就像条件概率中,我们已知$P(A|B_1), P(A|B_2), \cdots$以及$P(B_1), P(B_2), \cdots$,就可以求出$P(A) = \sum_i P(A|B_i)P(B_i)$一样,这里的$\langle j_B|\psi\rangle \langle\psi|j_B\rangle$就相当于$P(A|B_j)P(B_j)$。

也就是说,对于 Alice 能做的所有局域测量来说,她并不需要知道整个双 qubit 系统的全部信息,只需要知道 $\rho_A$ 就够了。

例如,考虑 Bell 态

$$
|\psi\rangle = \frac{|00\rangle + |11\rangle}{\sqrt{2}}.
$$

整个系统明明是一个纯态,但如果对 Bob 的自由度做偏迹,就会得到

$$
\rho_A
= \operatorname{Tr}_B(|\psi\rangle\langle\psi|)
= \frac{1}{2}|0\rangle\langle 0| + \frac{1}{2}|1\rangle\langle 1|.
$$

这说明: 整个系统虽然是纯态,但 Alice 单独拿到的子系统却是混态。这正是纠缠态的一个典型特征。


!!! info
    - 密度矩阵的迹都是 $1$,因为密度矩阵的特征值代表了系统处在某个态的概率,而这些概率加起来必须是 $1$。

    - 要看某个量子比特是不是纯态,就看它的密度矩阵 $\rho$ 的迹 $\operatorname{Tr}(\rho^2)$ 是不是 $1$。如果 $\operatorname{Tr}(\rho^2) = 1$,说明这个量子比特是纯态;如果 $\operatorname{Tr}(\rho^2) < 1$,说明这个量子比特是混态。
    > 因为纯态的密度矩阵是一个投影算子,它的特征值只有 $0$ 和 $1$,而且只有一个特征值是 $1$,所以 $\operatorname{Tr}(\rho^2) = \operatorname{Tr}(\rho) = 1$;混态的密度矩阵的特征值是一些小于 $1$ 的数,所以 $\operatorname{Tr}(\rho^2) < \operatorname{Tr}(\rho) = 1$。

    - Shannon 熵 $S(\rho) = -\operatorname{Tr}(\rho \log_2 \rho) = - \sum_i \lambda_i \log_2 \lambda_i$ 可以用来量化一个量子态的混乱程度。对于纯态来说,Shannon 熵是 $0$;对于混态来说,Shannon 熵大于 $0$。