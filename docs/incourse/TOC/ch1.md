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