---
comments: true
---

# Introduction

## Class of Computers

### Internet of Things/Embedded Computers

嵌入式计算机是一种专门设计用于执行特定任务的计算机。它们通常是小型的，低功耗的，且价格便宜，通常被嵌入到其他设备中，如家用电器，汽车，医疗设备等。

嵌入式计算机通常运行在实时操作系统上，这些操作系统通常是专门设计用于嵌入式系统的，如FreeRTOS，uC/OS等。

### Personal Mobile Device

个人移动设备包括智能手机，平板电脑，笔记本电脑等。这些设备通常运行在移动操作系统上，如Android，iOS等。它们的功耗是受限的，因为电池与散热的问题。

### Desktop Computing

我们通常说的台式机，性能强大，价格昂贵，通常用于高性能计算，游戏等。

### Server Computing

服务器计算通常是指运行在服务器上的应用程序。服务器通常是高性能的，用于提供服务，如网站，数据库，文件共享等。

### Clusters/Warehouse-Scale Computers

集群计算是指将多台计算机连接在一起，以共同完成一个任务。这种计算方式通常用于高性能计算，如科学计算，数据分析等。

## 并发的种类与结构

通常，在应用上有两种并发：

1. Data-level parallelism(DLP): 数据级并发，即多个数据同时处理。

2. Task-level parallelism(TLP): 任务级并发，即多个任务同时处理。

之后，计算机硬件根据这两种并发，设计出了四种主要的并发结构：

1. Instruction-level parallelism：指令并发利用编译器与流水线技术，使得多条指令同时执行。

2. Vector architectures, graphic processor units (GPUs), and multimedia instruction sets：向量处理器，图形处理器，多媒体指令集等。

3. Thread-level parallelism：线程级并发，即多个线程同时执行。

4. Request-level parallelism：请求级并发，即多个请求同时执行。

---

Flynn将计算机分为四类：

1. SISD(Single Instruction, Single Data)：单指令单数据，即传统的计算机。

2. SIMD(Single Instruction, Multiple Data)：单指令多数据，即向量处理器。

3. MISD(Multiple Instruction, Single Data)：多指令单数据，理论上存在，但实际上并没有。

4. MIMD(Multiple Instruction, Multiple Data)：多指令多数据，即多核处理器。每个处理器获得自己的数据并执行自己的指令。

## ISA

ISA(Instruction Set Architecture)是指令集架构，是计算机硬件与软件之间的接口。ISA定义了计算机的指令集，寄存器，内存模型等。在计算机组成与本课程中，我们使用的ISA都是RISC-V，这是一个开源的ISA,由伯克利大学开发。

RISC-V是32位的，有32个通用寄存器，使用load/store指令访问内存，指令长度也是32位。

!!! note "指令说明（和计组中的一样）"
    ![](../../image/i124.png)

