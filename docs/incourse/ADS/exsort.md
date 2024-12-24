---
comments : true
---

# 外部排序

时间匆忙，参考[这里](https://note.isshikih.top/cour_note/D2CX_AdvancedDataStructure/Lec15/)。

<!-- 当数据量很大时，我们无法把所有的数据都放到内存中进行排序，但是如果数据被存储在硬盘上，会有什么影响?

正如计算机组成已经学过的，在硬盘上读取数据需要先找到盘片，然后找到磁道，然后等待磁头旋转到对应的扇区下，这个过程是非常耗时的。所以，如果我们要对硬盘上的数据进行排序，我们不能简单地把所有数据读取到内存中进行排序，而是需要一种特殊的排序方法，这就是外部排序。

假设内存同时一共可以处理三个数据，而现有的待排序数据如下:

<div align="center">
    <img src="../../../image/i79.png" width="80%">
</div>

---

我们每次读三个数据排序，交替写入硬盘T2与T3中，结果如下:

<div align="center">
    <img src="../../../image/i80.png" width="80%">
</div>

这个时候一组有序序列包含三个数据。

---

??? question "为什么排完的数据不写回T1?"
    因为T1也是一个硬盘，当我们排序完一组数据后，磁头已经移动到下一组数据的扇区了，如果我们要写回T1，就需要等待磁头移动到T1的扇区，这样会浪费很多时间。所以我们选择了交替写入T2和T3。



然后，对T2与T3中的数据归并，交替放在T1与T4中，结果如下:

<div align="center">
    <img src="../../../image/i81.png" width="80%">
</div>
    
这个时候一组有序序列包含六个数据。

---

最后，再对T1与T4中的数据归并，交替放在T2与T3中，结果如下:

<div align="center">
    <img src="../../../image/i82.png" width="80%">
</div>

这个时候一组有序序列包含十二个数据。

---

此时Number of Passes为:

$$
1 + \lceil\log_2 {N/M}\rceil
$$

为了减少Passes的数目，我们考虑增大对数的底数，也就是K-way merge sort。

总的过程如下:

1. <div align="center">
    <img src="../../../image/i83.png" width="80%">
</div>

2. <div align="center">
    <img src="../../../image/i84.png" width="80%">
</div>

3. <div align="center">
    <img src="../../../image/i85.png" width="80%">
</div>

此时，Number of Passes为:

$$
1 + \lceil\log_K {N/M}\rceil
$$

是快了很多，但是这需要2k个硬盘！！！

---

## 使用更少的磁盘

### 为2-way merge sort使用两个磁盘

最聪明的做法是设计斐波那契数。

!!! "runs"
    runs可以理解为排好序的一组数据

!!! success "Smart Spilt"
    通过尝试将每个硬盘里的runs个数设为斐波那契数，可以使得最后的Passes数目最少。
    === "Step1"
        ![](../../image/i86.png)
    === "Step2"
        ![](../../image/i87.png)
    === "Step3"
        ![](../../image/i88.png)
    === "Step4"
        ![](../../image/i89.png)
    === "Step5"
        ![](../../image/i90.png)
    === "Step6"
        ![](../../image/i91.png)
    === "Step7"
        ![](../../image/i92.png)
    === "Step8"
        ![](../../image/i93.png)
    === "Step9"
        ![](../../image/i94.png)

---

我们得出结论:

对于`k`-way merge sort，最好的方法是把runs的数目分别分割为`k`阶斐波那契数。

!!! definition "k阶斐波那契数"
    $$
    F_N^k = F_{N-1}^k + F_{N-2}^k + \cdots + F_{N-k}^k

    F_N^k = \begin{cases}
    0 & N = 1, 2, \cdots, k-2 \\
    1 & N = k-1 \\
    F_{N-1}^k + F_{N-2}^k + \cdots + F_{N-k}^k & N > k
    \end{cases}

    也不难发现我们平常说的斐波那契数就是2阶斐波那契数。

在这样的情况下，只需要`k`+1个硬盘。


---

## How to handle the buffers for parallel operation?

给出结论:对于k-way merge sort，我们需要2k个input buffers和2个output buffer。

k的增大也不一定是好事，它会导致seek time的增加，所以我们需要权衡。

<div align="center">
    <img src="../../../image/i95.png" width="80%">
</div>

## Replacement selection

思考，runs的个数是不是一定受内存限制?

如果使用 -->