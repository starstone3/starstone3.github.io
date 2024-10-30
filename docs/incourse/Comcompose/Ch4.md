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

### 指令处理的步骤

1. **提取**：
    - 从指令存储器中获取指令。

        - 解释：从存储指令的内存中读取当前需要执行的指令。

    - 修改程序计数器（PC）以指向下一条指令。

2. **指令解码与读取操作数**：
    - 将指令转化为机器控制命令。
    - 读取寄存器中的操作数，无论是否使用。

3. **执行控制**：
    - 控制对应算术逻辑单元（ALU）操作的实现。

4. **内存访问**：
    - 从内存中读取或写入数据。
        - 解释：执行数据的加载（load）或存储（store）操作。
    - 仅限于加载/存储指令（ld/sd）。

5. **将结果写入寄存器**：
    - 如果是 R 型指令，ALU 的结果写入 rd。
        - 解释：对于 R 型指令，执行 ALU 操作后将结果存储到目标寄存器 rd 中。
    - 如果是 I 型指令，内存数据写入 rd。
        - 解释：对于 I 型指令，将从内存读取的数据存储到目标寄存器 rd 中。

6. **分支指令修改 PC**：
    - 解释：对于分支指令，根据条件判断结果修改程序计数器，以跳转到指定指令地址。


---

### Datapath 与 Cpu_ctrl

不多说，直接上图：

<p style="text-align: center;">
  <img src="../../../image/pp92.png" alt="图片描述" />
</p>

下面对图中的一些部分作说明:

+ **PC**:基地址

+ **Instruction Memory**:存放了许多指令，根据PC的地址读取相应指令

+ **Registers**:寄存器处理的中心，负责读取寄存器与向寄存器写入内容的功能

+ **ImmGen**: 负责将立即数填充为64位

+ **ALU**:承担了所有的运算操作，例如地址加减，`beq`里面判断是否等于0，寄存器的值加减等。

+ **Data Memory**:内存，与`ld`,`sd`等指令密切相关。

---

下面展开具体分析

#### Datapath

##### R型指令

##### I型指令

##### S型指令

##### J-Jal

#### Cpu_ctrl

##### Main Decoder

##### ALU Decoder
