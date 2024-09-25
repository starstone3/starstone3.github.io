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