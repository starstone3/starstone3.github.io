# 随机算法

在概率论与数理统计中我们学过:

$$
E(X) = \sum_{i=1}^{n} x_i \cdot P(X=x_i)
$$

而随机算法也与期望有关。在算法分析中，我们通常关心的是算法的平均性能，即期望。在随机算法中，我们通常关心的是算法的期望性能，即算法在随机输入上的期望性能。

## Hiring Problem

!!! info "wiki"
    [Hiring problem](https://zh.wikipedia.org/wiki/%E7%A7%98%E6%9B%B8%E5%95%8F%E9%A1%8C)

现在你需要雇佣一个秘书，你有 $n$ 个应聘者，你可以按照任意顺序面试他们，但是你不能拒绝一个应聘者，一旦拒绝就不能再次考虑。你的目标是雇佣一个最优秀的应聘者，即使你不知道他们的相对顺序。

在这里，我们假设面试与雇佣都有相应的成本。当你选择雇佣一个人后，即使你第二天就找到一个更好地把他开除，仍然需要支付雇佣的成本。我们的目标是找到一个算法，使得期望成本最小。

### Naive Solution

每一个人都面试，然后选择最优秀的。在最差的情况下，假设后一个人始终比前一个人优秀，那么期望成本为:

$$
N C_h
$$

### Randomized Solution

令$X = \text{number of hires}$,我们用$X_i$表示第$i$个人被雇佣的情况:

$$
X_i = \begin{cases}
1 & \text{if } i \text{ is hired} \\
0 & \text{otherwise}
\end{cases}
$$

那么$E(X_i) = \frac{1}{i}$

则:

$$
\begin{aligned}
E(X) & = E(X_1 + X_2 + \cdots + X_n) \\
& = E(X_1) + E(X_2) + \cdots + E(X_n) \\
& = \frac{1}{1} + \frac{1}{2} + \cdots + \frac{1}{n} \\
& = \sum_{i=1}^{n} \frac{1}{i} \\
& = \ln n + O(1)
\end{aligned}
$$

在这种情况下，期望成本为:

$$
C_h \ln n + N C_i
$$

实现这种成本的关键在于随机性，即我们需要随机地选择一个人。

### Online Hiring Problem

正如近似算法中提到的，online的意思是我们不能提前知道所有的应聘者，而是在面试的过程中逐个得到应聘者的信息。在这种情况下，我们不能使用上面的随机算法，因为我们无法做到随机抽取一个人，也即不相信数据的随机性。

正如维基百科中所说，在这里我们使用一个截断准则，即在前 $k$ 个人中选择一个最优秀的，然后在后面的人中选择一个比前 $k$ 个人更优秀的，那么我们就选择这个人。

```c title="Online Hiring Problem"
int OnlineHiring ( EventType C[ ], int N, int k)
{
    int Best = N;
    int BestQ = - infinity ;
    for ( i=1; i<=k; i++ ) {
        Qi = interview( i );
        if ( Qi > BestQ )   BestQ = Qi;
    }
    for ( i=k+1; i<=N; i++ ) {
        Qi = interview( i );
        if ( Qi > BestQ ) {
            Best = i;
            break;
        }
    }
    return Best;
}
```

现在我们要思考一个问题，即如何选择 $k$，使得我们找到最优秀的人的概率最大。

令事件$S_i$表示第$i$个人是最优秀的且被pick，那么,要使$S_i$发生，必须如下两个事件发生:

1. A: 第$i$个人是最优秀的

2. B: 前$k+1 \sim i-1$个人中没有被雇佣

并且，这两个事件是独立的。

那么:

$$
P(S_i) = P(A \cap B)=P(A) \cdot P(B) = \frac{1}{N} \cdot \frac{k}{i-1} = \frac{k}{N(i-1)}
$$

!!! tip "为什么是$k/(i-1)$"
    这里的思想是看作事件为前i-1个人当中，最优秀的人出现在前k个人当中。而最优秀的人出现在任何一个位置的概率是相同的，即$1/N$。

既然我们已经知道最优秀的人出现在每一个位置的概率，那么我们可以计算出用上一个算法找到最优秀的人的概率:

$$
P(\text{find the best}) = \sum_{i=k+1}^{N} P(S_i) = \sum_{i=k+1}^{N} \frac{k}{N(i-1)} = \sum_{i = k}^{N-1} \frac{k}{N} \frac{1}{i}
$$

!!! tip "引理"
    $$
    \int_{k}^{N} \frac{1}{x} \mathrm{d} x \leq \sum_{i=k}^{N-1} \frac{1}{i} \leq \int_{k-1}^{N-1} \frac{1}{x} \mathrm{d} x
    $$

    ??? general "证明"
        <strike>证明略</strike>

        我们回归微积分原始的概念，即计算曲线下的面积。
        <div align="center">
        <img src="../../../image/i42.png" width="70%">
        </div>

        这里作一些简化:用C G 两点的曲线与坐标轴围成的面积表示$\int_{k}^{N} \frac{1}{x} \mathrm{d} x$，用A E 两点的曲线与坐标轴围成的面积表示$\int_{k-1}^{N-1} \frac{1}{x} \mathrm{d} x$，而$\sum_{i=k}^{N-1} \frac{1}{i} = \sum_{i=k}^{N-1} \frac{1}{i} \times 1$,则:

        + 相比于$\int_{k}^{N} \frac{1}{x} \mathrm{d} x$，原来的求和相当于每次用长边(比如CDFE中的CD)作为矩形的高，因此比实际面积大。

        + 相比于$\int_{k-1}^{N-1} \frac{1}{x} \mathrm{d} x$，原来的求和相当于每次用短边(比如ABCD中的CD)作为矩形的高，因此比实际面积小。

有了上面那个引理，我们可以得到:

$$
\sum_{i = k}^{N-1} \frac{k}{N} \frac{1}{i} \geq \int_{k}^{N} \frac{k}{N} \frac{1}{x} \mathrm{d} x = \frac{k}{N} \ln \frac{N}{k}
$$

求导得到最大值，我们可以得到$k = \frac{N}{e}$时，概率最大。

## Quick Sort

