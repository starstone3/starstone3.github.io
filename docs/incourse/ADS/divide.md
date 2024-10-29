---
comments : true
---

# 分治法

!!! info "wiki"
    https://zh.wikipedia.org/wiki/%E5%88%86%E6%B2%BB%E6%B3%95

## 概念

分治法的基本思想是:

1. 把一个复杂问题分解为几个小问题

2. 递归解决这些子问题，得到解

3. 组合解，得到总体的解。

## 最近点问题

一个平面上有N个点。现想要找到距离最近的一对点。

### 最简单想法

遍历每一个组合，共$\frac{N(N-1)}{2}$对，时间复杂度为$O(N^2)$

### 分治思想

!!! tip "划分"
    取一条线将这些点分割，于是我们需要计算:

    1. 右半部分的最短距离

    2. 左半部分的最短距离

    3. 中间交叉部分的最短距离


    然后比较这三者的大小。

    ![](../../image/pp82.png)

#### 复杂度思考

如果计算交叉部分的最短距离的时间复杂度是线性的话，

$T(N) = 2T\left(\frac{N}{2}\right) + cN$

$= 2 \left[ 2T\left(\frac{N}{2^2}\right) + \frac{cN}{2} \right] + cN$

$= 2^2 T\left(\frac{N}{2^2}\right) + 2cN$

$= \dots$

$= 2^k T\left(\frac{N}{2^k}\right) + kcN$

$= N + c N\log N = O(N \log N)(\exists k,N \approx 2^k)$

然而，如果时间复杂度是平方的话：

$T(N) = 2T\left(\frac{N}{2}\right) + cN^2 \\$

$= 2 \left[ 2T\left(\frac{N}{2^2}\right) + \frac{cN^2}{2^2} \right] + cN^2 \\$

$= 2^2 T\left(\frac{N}{2^2}\right) + cN^2 \left(1 + \frac{1}{2}\right) \\$

$= \dots \\$

$= 2^k T\left(\frac{N}{2^k}\right) + cN^2 \left(1 + \frac{1}{2} + \dots + \frac{1}{2^{k-1}} \right) \\$

$= O(N^2)$

因此，我们现在需要重点关注的就是计算交叉部分距离的时间复杂度。
