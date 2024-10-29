---
comments : true
---

# 处理器

## 简介

影响CPU性能的因素：

+ Instruction count,Determined by ISA and compiler

+ CPI and Cycle time,Determined by CPU hardware

!!! tip "An overview of Implementation"
    === "总览"
        ![](../../image/pp80.png)
        但在实际设计中，如此多的线不能交叉在一起，于是需要用到多路选择器。
    === "Datapath"
        ![](../../image/pp81.png)

## Logic Design Convention

