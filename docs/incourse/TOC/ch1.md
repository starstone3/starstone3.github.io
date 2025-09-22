---
comments: true
---

# 集合、关系与语言

## 集合

集合是数学中最基本的概念之一。一个集合是一些不同对象的无序集，这些对象称为集合的元素。集合通常用大写字母表示，元素用小写字母表示。例如，集合 \(A = \{1, 2, 3\}\) 包含三个元素：1、2 和 3。

!!!info "性质"
    - **Subset**:若$\forall x (x \in A \Rightarrow x \in B)$，则称$A$是$B$的子集，记作$A \subseteq B$。

    - **Proper Subset**:若$A \subseteq B$且$A \neq B$，则称$A$是$B$的真子集，记作$A \subset B$。

### 集合定理

+ **Idempotent Laws**:
    - \(A \cup A = A\)
    - \(A \cap A = A\)

+ **Commutative Laws**:
    - \(A \cup B = B \cup A\)
    - \(A \cap B = B \cap A\)

+ **Associative Laws**:
    - \((A \cup B) \cup C = A \cup (B \cup C)\)
    - \((A \cap B) \cap C = A \cap (B \cap C)\)

+ **Distributive Laws**:
    - \(A \cup (B \cap C) = (A \cup B) \cap (A \cup C)\)
    - \(A \cap (B \cup C) = (A \cap B) \cup (A \cap C)\)

+ **Absortion Laws**:
    - \(A \cup (A \cap B) = A\)
    - \(A \cap (A \cup B) = A\)

+ **De Morgan's Laws**:
    - \(A - (B \cup C) = (A - B) \cap (A - C)\)
    - \(A - (B \cap C) = (A - B) \cup (A - C)\)

### 幂集(Power Set)

!!!definition "幂集"
    设$A$是一个集合，$A$的幂集（Power Set）是所有$A$的子集组成的集合，记作$P(A)$或$2^A$。例如，若$A = \{1, 2\}$，则$P(A) = \{\emptyset, \{1\}, \{2\}, \{1, 2\}\}$。

若A中有n个元素,也即$|A|=n$,则$P(A)$中有$2^n$个元素.

### 分割(Partition)

一个非空集合A的一个分割是$P(A)$的一个子集$\{A_1, A_2, \ldots, A_k\}$,满足:

1. $\bigcup_{i=1}^k A_i = A$

2. $\forall i \neq j, A_i \cap A_j = \emptyset$

!!! example "例子"
    设$A = \{1, 2, 3\}$，则A有五种分割:

    + $\{\{1\}, \{2\}, \{3\}\}$

    + $\{\{1, 2\}, \{3\}\}$

    + $\{\{1, 3\}, \{2\}\}$

    + $\{\{2, 3\}, \{1\}\}$

    + $\{\{1, 2, 3\}\}$

## 关系与函数

### 有序对(Ordered Pair)

一个对$(a, b)$称为有序对，其中$a$是第一个元素，$b$是第二个元素。

$$
(a,b) = (c,d) \iff a=c \land b=d
$$

### 二元关系(Binary Relation)

设A和B是两个集合，A到B的一个二元关系R是A的元素与B的元素之间的一种对应关系。

也即$R \subseteq A \times B$，其中$A \times B = \{(a, b) | a \in A, b \in B\}$。

若$(a, b) \in R$，则称a与b是R相关联的，记作$aRb$。

### 关系的运算(Operations on Relations)

+ **Inverse**:关系R的逆关系$R^{-1}$是由所有$(b, a)$组成的集合，其中$(a, b) \in R$。

+ **Composition**:设R是A到B的关系，S是B到C的关系，则R与S的复合关系$S \circ R$是由所有$(a, c)$组成的集合，其中存在$b \in B$使得$(a, b) \in R$且$(b, c) \in S$。

### 定义域(Domain)与值域(Range)

设R是A到B的关系，则R的定义域是所有与B中元素相关联的A中元素的集合

R的值域是所有与A中元素相关联的B中元素的集合

### 函数(Function)

一个从集合A到集合B的函数f是A到B的一个关系，满足:

1. 对于每个$a \in A$，存在唯一的$b \in B$使得$(a, b) \in f$。

2. 记作$f: A \to B$，通常用$f(a)$表示与$a$相关联的$b$。

有如下特殊的函数:

+ **Injective (One-to-One)**:若$f(a_1) = f(a_2) \Rightarrow a_1 = a_2$，则称f是单射。

+ **Surjective (Onto)**:若$\forall b \in B, \exists a \in A$使得$f(a) = b$，则称f是满射。

+ **Bijective**:若f既是单射又是满射，则称f是双射。

### 关系的性质(Properties of Relations)

+ **自反(Reflexive)**:若$\forall a \in A, (a, a) \in R$，则称R是自反的。

+ **对称(Symmetric)**:若$(a, b) \in R \Rightarrow (b, a) \in R$，则称R是对称的。

+ **反对称(Antisymmetric)**:若$(a, b) \in R$且$(b, a) \in R \Rightarrow a = b$，则称R是反对称的。

+ **传递(Transitive)**:若$(a, b) \in R$且$(b, c) \in R \Rightarrow (a, c) \in R$，则称R是传递的。

### 等价关系(Equivalence Relation)

一个二元关系R如果满足以下三个条件，则称R是等价关系:

1. **自反性**: $\forall a \in A, (a, a) \in R$。

2. **对称性**: 若$(a, b) \in R \Rightarrow (b, a) \in R$。

3. **传递性**: 若$(a, b) \in R$且$(b, c) \in R \Rightarrow (a, c) \in R$。

因此,一个等价关系可以将元素分割为若干等价类,等价类有代表元,和线性代数中学的一致.

这些等价类组成了集合的一个分割(Partition).

### 偏序关系(Partial Order)

一个二元关系R如果满足**自反性**、**反对称性**和**传递性**,则称R是偏序关系.

在这样的关系中,我们可以定义最大/小元(Greatest/Least Element)和极大/小值(Maximal/Minimal).

以最大元和极大值为例:

设集合A中的元素为$a_1, a_2, \ldots, a_n$，如果存在元素$a_{max} \in A$，使得对任意元素$a_i \in A$，都有$a_i \leq a_{max}$，则称$a_{max}$为A的最大元(Greatest Element)。

如果不存在$a_{max}$，但存在元素$a_{m} \in A$，使得对任意元素$a_i \in A$，如果$a_i \neq a_{m}$且$a_i$与$a_{m}$不可比较，则称$a_{m}$为A的极大值(Maximal)。


!!! definition "全序关系(Total Order)"
    如果偏序关系R还满足**比较性**(Comparability)条件,即对任意$a, b \in A$，要么$(a, b) \in R$，要么$(b, a) \in R$，则称R是全序关系。

## 有限集和无限集

和离散讲的一样,有限集是指包含有限个元素的集合,无限集是指包含无限个元素的集合.

其中,可数无限集是指其元素可以和自然数集建立一一对应关系的无限集,不可数无限集则不能.

对于可数无限集的势,我们用$\aleph_0$表示.

!!! example
    证明$N \times N$是可数无限集.

    === "Solution1"
        我们考虑一种排列方式:

        对于$(m,n) \in N \times N$，我们可以按照以下方式排列:

        先列出所有$m+n=0$的元素: $(0,0)$

        然后列出所有$m+n=1$的元素: $(0,1), (1,0)$

        以此类推,我们可以得到如下排列:

        ```
        (0,0)
        (0,1) (1,0)
        (0,2) (1,1) (2,0)
        (0,3) (1,2) (2,1) (3,0)
        ···
        ```

        这样,我们有一种方式可以排列出$N \times N$中的所有元素,因此$N \times N$是可数无限集.

    === "Solution2"
        另一种证明方法是构造一个双射:

        定义一个函数$f:N \times N \to N$如下:

        $$
        f(m,n) = \frac{(m+n)(m+n+1)}{2} + n
        $$

        这个函数是双射的,因此$N \times N$是可数无限集.

    === "Solution3"
        还有一种证明方法是使用素数分解:

        定义一个函数$g:N \times N \to N$如下:

        $$
        g(m,n) = 2^m \cdot 3^n
        $$

        由于每个自然数都有唯一的素数分解,因此这个函数是单射的.

        由于$N$是可数无限集,而$g(N \times N)$是$N$的子集,因此$N \times N$也是可数无限集.

    这三种方法也是证明一个集合是可数无限集的常用方法.

!!! definition "Cantor's Continuum hypothesis"
    实数集$R$的势为$\aleph_1$,即$|R|=\aleph_1$.

    Cantor猜想,不存在一个集合A,使得$\aleph_0 < |A| < \aleph_1$.

    这个猜想既不能被证明也不能被否定,是数学中一个重要的未解问题.

    另外,Cantor还证明了,任何集合的幂集的势都严格大于该集合的势,即$|A| < |P(A)|$.

## Three Fundamental Proof Tech

三种证明方法是

1. 对角线法(Diagonalization)

2. 归纳法(Induction)

3. 鸽笼原理(Pigeonhole Principle)


!!! example
    === "鸽笼原理"
        假设一个球面上取任意五个点,则我们必定能找到一个半球,使其的球面上包含至少四个点.

        **证明**:

        任取五个点中的两个点,与球心构成一个过球心的平面,该平面将球面分成两个半球.

        剩下三个点分布在这两个半球上,根据鸽笼原理,至少有一个半球包含两个点.

        因此,加上剖面上的两个点,该半球上至少包含四个点.

## 闭包(Closure)

和离散数学讲的一样,一个运算是封闭的,如果对该运算的任意输入,其输出仍然属于同一集合.

闭包指满足某种性质的最小关系.

主要关注三种闭包:

1. **自反闭包(Reflexive Closure)**: 在给定关系R的基础上, 添加所有形式为$(a, a)$的对, 使得每个元素都与自身相关联.

2. **对称闭包(Symmetric Closure)**: 在给定关系R的基础上, 对每个$(a, b) \in R$, 添加$(b, a)$, 使得关系变得对称.

3. **传递闭包(Transitive Closure)**: 在给定关系R的基础上, 如果$(a, b) \in R$且$(b, c) \in R$, 则添加$(a, c)$, 使得关系变得传递.


## 字母表与语言(Alphabet and Language)

!!! definition
    === "字母表(Alphabet)"
        字母表是一个有限的非空符号集合,通常用大写希腊字母表示,如$\Sigma$.

        集合中的元素被称为符号(Symbol)

        例如,二进制字母表$\Sigma = \{0, 1\}$.

    === "字符串(String)"
        字符串是由字母表中的符号组成的有限序列.

        例如,在二进制字母表$\Sigma = \{0, 1\}$上,字符串"101"是一个长度为3的字符串.

        + 空字符串是长度为0的字符串,通常用$\epsilon$表示.

        + $\Sigma^*$表示由字母表$\Sigma$生成的所有可能字符串的集合,包括空字符串.
    === "语言(Language)"
        语言是由字符串组成的集合,通常用大写字母表示,如$L$,$L \subseteq \Sigma^*$.

        + 有限语言(Infinite Language): 列举所有字符串.

        + 无限语言(Infinite Language): 不能列举所有字符串,通常用规则或生成式定义,比如
            - $L = \{0^n 1^n | n \geq 0\}$表示所有由若干个0后跟若干个1组成的字符串,且0和1的数量相等.
            - $L = \{w | w$是回文字符串$\}$

        从语言的定义中可以发现,所有的语言都是可数的,因为它们要么是有限的,要么可以按照某种规则生成,从而可以和自然数集建立一一对应关系.

        然而,在一个非空字母表上的语言个数是$|P(\Sigma^*)|$,而$P(\Sigma^*)$的势是不可数的,因此存在不可数多的语言.
!!! note
    证明定理:若$\Sigma$是有限字母表,则$\Sigma^*$是可数无限集.
    ??? info
        **证明**:

        设$\Sigma$是一个包含k个符号的有限字母表${a_1, a_2, \ldots, a_k}$.
        我们可以按字符串的长度对$\Sigma^*$中的字符串进行分类:

        - 长度为0的字符串: $\{\epsilon\}$

        - 长度为1的字符串: $\{a_1 | a_1 \in \Sigma\}$

        - 长度为2的字符串: $\{a_1 a_2 | a_1, a_2 \in \Sigma\}$

        - 长度为3的字符串: $\{a_1 a_2 a_3 | a_1, a_2, a_3 \in \Sigma\}$

        - 以此类推...

        由于$\Sigma$是有限字母表,每个长度的字符串集合都是有限的.

        因此,我们可以将$\Sigma^*$表示为所有这些有限集合的并集:

        $$
        \Sigma^* = \bigcup_{n=0}^{\infty} \{w | w$是长度为n的字符串$\}
        $$

        由于每个长度的字符串集合都是有限的,而自然数集$N$是可数无限集,因此$\Sigma^*$是可数无限集.

### Operations of Strings

1. Concatenation(连接): 若$x$和$y$是字符串,则它们的连接记作$xy$或$x \cdot y$,表示将字符串$x$和$y$连接在一起形成一个新字符串.

2. Exponentiation(幂): 若$x$是字符串,$n$是非负整数,则$x^n$表示将字符串$x$连接$n$次形成的新字符串. 特别地,$x^0 = \epsilon$.

3. Reversal(逆): 也就是字符串的反转,若$x = a_1 a_2 \ldots a_n$是字符串,则其逆字符串记作$x^R = a_n a_{n-1} \ldots a_1$.我们也可以用递归的思路来理解逆,若$x = ya$其中$y$是字符串,$a$是符号,则$x^R = a y^R$.

### Operations of Languages

1. 由于语言是一个集合,因此适用所有集合的运算,如并集、交集、差集等.

2. Exponentiation(幂): 若$L$是语言,$n$是非负整数,则$L^n$表示将语言$L$中的字符串连接$n$次形成的新语言. 特别地,$L^0 = \{\epsilon\}$.

3. Concatenation(连接): 若$L_1$和$L_2$是语言,则它们的连接记作$L_1 L_2$或$L_1 \cdot L_2$,表示将语言$L_1$中的每个字符串与语言$L_2$中的每个字符串连接形成的新语言. 也即:

    $$
    L_1 L_2 = \{xy | x \in L_1, y \in L_2\}
    $$

4. Kleene Star(闭包): 若$L$是语言,则其Kleene闭包记作$L^*$,表示将语言$L$中的字符串连接任意次(包括0次)形成的新语言. 也即:

    $$
    L^* = \bigcup_{n=0}^{\infty} L^n
    $$

    克林星闭包与$\Sigma^*$类似,因为$\Sigma^*$是由字母表$\Sigma$生成的所有可能字符串的集合,而$L^*$是由语言$L$生成的所有可能字符串的集合.

5. Positive Closure(正闭包): 若$L$是语言,则其正闭包记作$L^+$,表示将语言$L$中的字符串连接任意次(至少1次)形成的新语言. 也即:

    $$
    L^+ = \bigcup_{n=1}^{\infty} L^n
    $$
    显然,$L^+ = LL^*$。并且, $L^* = L^+ \cup \{\epsilon\}$。因此,我们一般认为正闭包是语言的连接闭包,因为不必特意包含$\epsilon$.

!!! example
    令$L=\{w \in \{0,1\}^*,w中0和1的个数不相等\}$,证明:

    $$
    L^* = \{0,1\}^*
    $$

    ??? info
        首先,我们有$L_1 \subset L_2 \Rightarrow L_1^* \subseteq L_2^*$,因此$\{0,1\}^* \subseteq L^*$.

        另外,显然$L \subseteq \{0,1\}^*$,因此$L^* \subseteq \{\{0,1\}^*\}^*$.

        又因为$\{\{0,1\}^*\}^* = \{0,1\}^*$,因此$L^* \subseteq \{0,1\}^*$.

        因此,$L^* = \{0,1\}^*$.