---
comments : true
---
# Arithmetic for Computer

!!! info "参考"
    https://xuan-insr.github.io/computer_organization/3_arithmetic/

## Arithmetic

### 加法

不管什么表示，直接加就是对的（包括负数的补码表示）。

!!! info "加法"
    ![](../../image/p56.png)
### 减法

减去一个数等于加上这个数的补码。

!!! info "减法"
    === "减去一个数"
        ![](../../image/p57.png)
    === "等于加上它的补码"
        ![](../../image/p58.png)

### Overflow

定义次高位向最高位的进位为$c_i$,最高位的进位为$c_{i+1}$,则溢出检验可定义为$c_i \oplus c_{i+1}$,若结果为1则发生溢出。
!!! info "溢出情况"
    ![](../../image/p59.png)

### ALU

在数字逻辑中已经设计过

!!! note "ALU"
    === "单个ALU"
        ![](../../image/p60.png)
    === "组合成32位"
        ![](../../image/p61.png)
    === "功能图"
        ![](../../image/p62.png)
        ??? info "说明"

            + slt:比较大小
            + srl:移位
            + 目前还不支持非或

### 乘法

#### 朴素的思路

![](../../image/p63.png)
但是这样会很慢，因此有一种优化的思路，可以将ALU的位数降下来。

#### 改进V2

!!! info "V2"
    === "流程图"
        ![](../../image/p64.png)
    === "Example"
        ![](../../image/p65.png)

这时我们又想到，乘法运算的结果和乘数每次都要右移一位，结果是乘数丢弃一位，product要增加一位。那我们能不能让增加的这一位利用丢弃导致空出来的位置呢？

#### 改进V3

!!! info "V3"
    === "流程图"
        ![](../../image/p66.png)
    === "Example"
        ![](../../image/p67.png)

#### Booth

然后又有一个神人想出了一个神奇的方法，可以在乘数含大量1的情况下大大加快速度，思想类似于乘法分配律。

!!! info "Booth"
    === "idea"
        ![](../../image/p68.png)
    === "example"
        ![](../../image/p69.png)