---
comments : true
---

<link rel="stylesheet" type="text/css" href="../../../css/styles.css">

# 近似算法

!!! link "from wiki"
    https://zh.wikipedia.org/wiki/%E8%BF%91%E4%BC%BC%E7%AE%97%E6%B3%95

在上节课中提到，当今的学界倾向于$P \neq NP$, 即NP问题不可能在多项式时间内解决。因此，我们需要寻找一种近似算法来解决NP问题。近似算法是一种在多项式时间内求解NP问题的方法，它不一定能够得到问题的最优解，但是可以得到一个**接近最优解**的解。

!!! definition "Approximation ratio"
    近似比$\rho(n)$是一个常数，对于一个最优化问题的近似算法，我们假设$f(n,x)$是对输入x的最坏情况的一种量化。$x$为近似解,$x^*$为准确解，那么$\rho(n)$定义为：

    $$\rho(n) = \max\left\{ \frac{f(n,x)}{f(n,x^*)}, \frac{f(n,x^*)}{f(n,x)} \right\}$$

## 近似范式(Approximation Scheme)

近似范式是对于某一族问题的一种近似算法，它可以在多项式时间内得到一个接近最优解的解。近似范式的近似比$\rho(n)$是一个常数，且$\rho(n)$可以随着输入规模$n$的增大而减小。

> 可以把范式想成是一种输出为算法的函数，输入是$\epsilon$,对于特定的$\epsilon > 0$，范式会给出一个近似比为$1+\epsilon$的算法。

而此时，这种算法的时间复杂度可以看成是$O(f(n,\epsilon))$，其中$f(n,\epsilon)$是一个关于$n$和$\epsilon$的函数。

**PTAS(Polynomial Time Approximation Scheme)**是在$\epsilon$确定的情况下，$f(n,\epsilon)$关于$n$是多项式的范式。

## Approximate Bin Packing

### 问题描述

给定$n$个物品，每个物品的大小为$s_i \in (0,1]$，每个箱子的容量为1。我们需要将这些物品放入尽可能少的箱子中。


!!! example "🌰"
    给定 7 个 item，size 分别为$0.2,0.5,0.4,0.7,0.1,0.3,0.8$则最少需要 3 个 bin（准确解）：

    - bin1: 0.2, 0.8
    - bin2: 0.5, 0.4,0.1
    - bin3: 0.7, 0.3

这是一个NPH问题(?)，下面我们将考虑如下的算法。注意:online算法意味着在处理$ith$个item时，我们不知道后面的item的大小。而offline算法则是在处理$ith$个item时，我们已经知道所有item的大小。

### Next Fit Algorithm(online)

Next Fit Algorithm在处理每个item时，都会尝试将item放入最后一个箱子中，如果放不下，则会尝试放入下一个箱子中。

如果用M表示算法的准确解，则Next Fit使用箱子的个数不超过$2M-1$。

??? note "证明"
    我们将问题转换为若Next Fit使用了$2M$个箱子，则最优解至少需要$M+1$个箱子。


    设 \(S(B_i)\) 为第 \(i\) 个箱子的已经放下的item的size。那么我们必定有：

    \[
    \begin{align*}
    S(B_1) + S(B_2) &> 1, \\
    S(B_3) + S(B_4) &> 1, \\
    &\vdots \\
    S(B_{2M-1}) + S(B_{2M}) &> 1.
    \end{align*}
    \]

    这意味着：

    \[
    \sum_{i=1}^{2M} S(B_i) > M.
    \]

    最优解至少需要 \(\left\lceil \frac{\text{所有物品的总大小}}{1} \right\rceil\) 个箱子，这可以表示为：

    \[
    \left\lceil \sum_{i=1}^{2M} S(B_i) \right\rceil \geq M + 1.
    \]

    因此，Next Fit算法的箱子个数不会超过$2M-1$。

### First Fit Algorithm(online)

First Fit Algorithm在处理每个item时，都会尝试将item放入第一个箱子中，如果放不下，则会尝试放入下一个箱子中。也即，将item放在第一个能容纳的箱子里，不然就新开一个箱子。

如果用M表示算法的准确解，则First Fit使用箱子的个数不超过$1.7M$。


### Best Fit Algorithm(online)

Best Fit Algorithm在处理每个item时，都会尝试将item放入剩余空间最小且能容纳的箱子中。

如果用M表示算法的准确解，则Best Fit使用箱子的个数不超过$1.7M$。

---

### online算法的结论(近似比)

There are inputs that force any on-line bin-packing algorithm to use at least 5/3 the optimal number of bins.

也即，对于任何online算法，其近似比$\rho(n) \geq \frac{5}{3}$。

---

### First Fit Decreasing(offline) 

First Fit Decreasing Algorithm是First Fit Algorithm的一个变种，它首先将所有item按照大小降序排列，然后再使用First Fit Algorithm。

如果用M表示算法的准确解，则First Fit Decreasing使用箱子的个数不超过

$$\frac{11M}{9} + \frac{6}{9}$$