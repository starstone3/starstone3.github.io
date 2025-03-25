---
comments: true
---

# Memory Hierarchy

!!! info
    本章内容与计组[Cache](../Comcompose/Ch5.md)有重合

## Memory Technology

### SRAM

SRAM(Static Random Access Memory) 是一种快速的内存类型，通常用于缓存和寄存器。它使用多个晶体管来存储每个比特，因此不需要定期刷新。SRAM 的速度快，但成本高，密度低。

它通常用于 CPU 的 L1 和 L2 Cache。

### DRAM

DRAM(Dynamic Random Access Memory) 是一种更常见的内存类型，通常用于主内存。它使用电容器来存储每个比特，因此需要定期刷新以保持数据。DRAM 的速度较慢，但成本低，密度高。

DRAM 的速度比 SRAM 慢，但成本更低，密度更高。它通常用于主内存。

+ SDRAM(Synchronous DRAM)：是一种同步动态随机存取存储器。它与 CPU 的时钟信号同步工作，从而提高了数据传输的效率。

+ DDR(Double Data Rate)：是一种双倍数据速率同步动态随机存取存储器，是 SDRAM 的升级版。它在时钟信号的上升沿和下降沿都传输数据，从而使数据传输速率翻倍。
    
    + DDR2：DDR 的第二代，具有更高的时钟频率和更低的功耗。
    
    + DDR3：DDR 的第三代，具有更高的时钟频率、更大的带宽和更低的功耗。
    
    + DDR4：DDR 的第四代，进一步提升了时钟频率和带宽，并降低了功耗，是目前主流的内存类型。
    
    + DDR5：最新的 DDR 技术，具有更高的时钟频率、更大的带宽和更低的功耗。
