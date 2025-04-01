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



### GDRAM

GDRAM(Graphics DRAM) 也就是我们平常说的显存，主要用于图形处理器(GPU)中。它的设计目的是为了满足图形处理的高带宽需求。GDRAM 通常具有更高的带宽和更低的延迟，以支持快速的数据传输和处理。


### Flash Memory

+ EEPROM(Electrically Erasable Programmable Read-Only Memory)的一种，具有可擦除和可编程的特性。它可以在不需要电源的情况下保存数据，并且可以通过电信号进行擦除和编程。EEPROM 的速度较慢，但可以在断电后保留数据。

+ Nonvolatile Memory：flash memory 是一种非易失性存储器，意味着它在断电后仍然可以保留数据。它通常用于存储固件、操作系统和用户数据。



## Memory Dependability

+ Soft Error/Transient Fault:对于cell content(存储单元内容)的错误，而不是对circuitiy的错误。这种错误通常是由于外部因素(如辐射)引起的，可能会导致存储单元中的数据发生变化，但不会影响电路本身的功能。

+ Hard Error/Permanent Fault:对于电路本身的错误，可能是由于制造缺陷、老化或其他因素导致的。这种错误通常会导致存储单元无法正常工作，可能需要更换整个存储器。 

## Cache

Cache使用SRAM来存储数据，以提高访问速度。Cache通常分为多个级别，例如L1、L2和L3 Cache。L1 Cache是最快的，但容量最小；L2 Cache稍慢，但容量更大；L3 Cache是最慢的，但容量最大。

基础知识都在[计组笔记](../Comcompose/Ch5.md)中，这里不讲了。

### Cache Performance

我们定义:

$$
\text{Average Memory Access Time} = \text{Hit Ratio} \times \text{Hit Time} + (1 - \text{Hit Ratio}) \times \text{Miss Time}
$$

!!! warning
    根据计组中马德老师纠正的，这里`Hit Time`应该直接乘1，因为就算`Miss`了，也是也尝试进行一次`Hit`之后才发现的.

### Six Basic Cache Optimizations

从上面那个公式中我们可以看出,优化`Cache`的方向就那么几种:

1. 提高`Hit Ratio`：增加`Cache`的大小，增加`Cache`的关联度，增加`Cache`的行数等。

2. 降低`Hit Time`：使用更快的存储器，增加`Cache`的行数等。

我们提出六种基础的`Cache`优化方法:

1. **Larger Block Size**：增大块大小
    - 优点：可以降低 `Miss Rate`（主要是空间局部性导致的，因为邻近数据会被一次性加载到缓存中），降低`compulsory miss`（因为块大小增加可以存储更多数据）
    
    - 缺点：会增加 `Miss Penalty`（因为每次缺失需要从内存加载更多数据，总传输时间变长）
    
    - 缺点：当块太大时，反而会增加 `capacity miss`（容块变大则可存储的块数减少，导致更多有用数据被逐出缓存）
    
    - 缺点：可能会增加 `conflict miss`（更大的`block`会导致更少的`block`数目，增加冲突概率）

    !!! definition "Miss"
        - Compulsory Miss（强制缺失）：首次访问数据时发生，块大小增加有助于减少这类缺失

        - Capacity Miss（容量缺失）：缓存空间不足导致的缺失

        - Conflict Miss（冲突缺失）：映射冲突导致的缺失

2. **Bigger Cache**：增大缓存大小
    - 优点：可以降低 `Miss Rate`（因为可以存储更多数据）
    
    - 缺点：会增加 `Hit Time`（因为需要更长的时间来访问更大的缓存）

    !!! info "cache rule of thumb"
        A direct-mapped cache of size N has about the same miss rate as a two-way set associative cache of size N/2.

3. **Higher Associativity**：增加关联度
    - 优点:可以降低`conflict miss`

    - 缺点：会增加`Hit Time`（因为需要更多的比较操作）

4. **Multiple Cache Levels**：多级缓存
    - 优点：可以降低 `Miss penalty`（因为可以在更快的缓存中找到数据）
    
    - 缺点：会增加 `Hit Time`（因为需要访问多个缓存）

    - $ \text{Average Memory Access Time} = \text{L1 Hit Time} + \text{L1 Miss Rate} \times(\text{L2 Hit Time} + \text{L2 Miss Rate} \times \text{L2 Miss Time}) $

    - **`Inclusion`**：L1 Cache 中的数据必须包含在 L2 Cache 中。

    - **`Exclusion`**：L1 Cache 中的数据不能包含在 L2 Cache 中。

    !!! definition "不同的Miss Rate"
        - `Local Miss Rate`:访问失效的数目除以访问该缓存的数目

        - `Global Miss Rate`:访问失效的数目除以访问所有缓存的数目

        - 对于L1 Cache来说，`Local Miss Rate`和`Global Miss Rate`是相同的，因为L1 Cache是第一个被访问的缓存，但对于L2 Cache来说，`Local Miss Rate`会远大于`Global Miss Rate`。

5. **Giving Priority to read miss over write miss**：优先处理读缺失而不是写缺失
    - 优点：可以降低 `Miss Penalty`（因为读操作通常比写操作快）
    
    - 需要`Write Buffer`来存储写操作

6. **Avoiding Address Translation during index of cache**：避免在索引缓存时进行地址转换
    - 优点：可以降低 `Hit Time`（因为不需要进行地址转换）

    - **VIPT**：虚拟索引物理标签缓存，使用虚拟地址进行索引，使用物理地址进行标签比较。

    - !!! info "VIPT工作流程"

            1. CPU 发出虚拟地址

            2. 使用虚拟地址的索引位访问缓存

            3. 在 VIPT 缓存中，索引位来自虚拟地址。不需要进行虚拟地址到物理地址的转换即可访问缓存。

            4. 同时查询 TLB 进行地址翻译

            5. TLB 将虚拟地址转换为物理地址。

            6. 将物理地址标签与缓存中的标签进行比对，判断是否命中。
            

### Ten Advanced Cache Optimizations

1. **Small and Simple First Level Cache**：小而简单的一级缓存
    - Small:更小的一级缓存可以降低`Hit Time`

    - Simple:降低组关联度，同样可以降低`Hit Time`

2. **Way Prediction**：组预测
    - 预测访问的组，在比较tag时并行地执行读取数据，数据来源于`desired block`

    - 需要为每个block加上`block predict bits`

    - 预测错误时，需要check其他blocks

3. **Pipelined Access and Multibanked cache**：流水线访问和多体缓存   
    - **流水线访问(Pipelined Access)**：

        - 允许新的缓存访问在前一次访问完成前开始
        - 增加缓存带宽(throughput)，而不降低延迟(latency)
        - 类似于CPU流水线，可以在每个时钟周期启动一次新的缓存访问
    
    - **多体缓存(Multibanked Cache)**：

        - 将缓存分割成多个独立的体(banks)，每个体可以并行访问
        - 例如：4体缓存可以同时处理4个独立的访问请求
        - 增加缓存带宽，允许多个独立的内存访问并行执行

4. **Nonblocking Cache**：非阻塞缓存

    - 允许在缓存缺失时继续执行其他操作，而不是等待缺失处理完成

    - 例如：可以在缺失处理期间继续执行其他指令，减少CPU空闲时间

    - `A Hit under a Miss`:表示在一次Miss发生时,允许A次Hit发生,而不需要等待Miss处理完成

5. **Critical Word First and Early Start**：优先处理关键字与提前启动

    - 在缓存缺失时，优先加载所需的关键字，而不是整个块

    - 例如：如果需要访问块中的第三个字，则优先加载第三个字，而不是整个块


6. **Mergeing Write Buffers**：合并写缓冲区

    - 将多个写操作合并为一个操作，以减少写操作的数量

    - 例如：如果有多个写操作到连续的地址上，则可以将它们合并为一个操作

7. **Compiler Optimization**：编译器优化

    - 使用编译器优化来减少缓存缺失，例如循环展开和数据预取

    - 例如：循环展开可以减少循环中的缓存缺失，因为可以在一个循环中处理更多的数据

    - !!! tip "两段循环比较"
        === "Before"
            ```c
            for(j=0;j<1000;j++){
                for(i=0;i<1000;i++){
                    a[i][j] = b[i][j] + c[i][j];
                }
            }
            ```
        === "After"
            ```c
            for(i=0;i<1000;i++){
                for(j=0;j<1000;j++){
                    a[i][j] = b[i][j] + c[i][j];
                }
            }
            ```
        显然,后面一个循环更好,因为它更好地利用了空间局部性,可以被编译器优化为更好的缓存访问模式.

8. **Hardware Prefetching**：硬件预取

    - 通过硬件预取来减少缓存缺失，例如使用预取器来预测将要访问的数据并提前加载到缓存中

    - 例如：如果访问模式是线性的，则可以预测下一个要访问的数据并提前加载到缓存中


9. **Compiler Prefetching**：编译器预取
    - 编译器在编译代码时插入预取指令（prefetch instructions），提前将数据从内存加载到缓存中
    
    - 与硬件预取相比的优势：
        - 编译器可以利用程序的语义信息，更准确地预测访问模式
        - 可以针对特定算法和数据结构进行优化
        - 不需要复杂的硬件预测机制
    
    - 实现方法：
        - 在访问数据前几个循环迭代插入预取指令
        - 针对数组、链表等数据结构的特定访问模式优化
    
    - 例如：
        ```c
        // 原始代码
        for (i = 0; i < 1000; i++) {
            sum += a[i];
        }
        
        // 使用预取的优化代码
        for (i = 0; i < 1000; i++) {
            prefetch(&a[i+20]);  // 提前预取20个元素之后的数据
            sum += a[i];
        }
        ```
    
    - 缺点：
        - 增加了代码大小
        - 如果预测错误，可能会浪费带宽
        - 需要编译器和硬件支持特定的预取指令

10. **HBM**：高带宽内存

    - HBM是一种新型的内存技术，具有更高的带宽和更低的延迟，适用于高性能计算和图形处理等应用。

    - HBM通过将多个内存芯片堆叠在一起，并通过高速接口连接到处理器，从而实现更高的带宽和更低的功耗。

##  Virtual Memory

在[计组](../Comcompose/Ch5.md#virtual-memory)中也有涉及

可以认为，TLB是L1 Cache,Main Memory是L2 Cache,Disk是L3 Cache

### Does Page Size Matter?

+ 更大的Page Size有很多优点
    + 更少的Page Table Entries(页表项)，减少了内存占用

    + 因为页表项少了，所以更快查找到页表项

    + 一次传输更多数据，更高效

    + 映射到更多的内存块，减少了`TLB miss`

+ 小的Page Size也有优点
    + Conserve storage:节省存储空间.When a contiguous region of virtual memory is not equal to a contiguous region of physical memory, smaller page sizes can help conserve storage space due to internal fragmentation.

    +  例如：如果进程只需要10KB内存，但页大小是8KB，那么使用2页（16KB）会造成6KB的内部碎片浪费。若页大小是4KB，则只需3页（12KB），内部碎片仅为2KB。较小的页面能更精确地分配内存，减少浪费。


+ 实际中，我们使用多样的Page Size来平衡这些优缺点。

    + 例如：Linux使用4KB和2MB的Page Size，Windows使用4KB和2MB/1GB的Page Size。

    + 现代CPU支持多种Page Size，允许操作系统根据需求选择合适的Page Size。