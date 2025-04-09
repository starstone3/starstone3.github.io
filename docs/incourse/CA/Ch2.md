# 指令级并行

开头[流水线](../Comcompose/Ch4.md#流水线cpu)在前面学过了...

在计组中我们学习的指令都是整数指令，实际上，对于浮点指令(FP)，流水线需要做一些小改动。

!!! definition "Latency&Interval"
    - Latency:the number of intervening cycles between an instruction that produces a result and an instruction that uses the result(在产生结果的指令和使用结果的指令之间的周期数)

    - Interval: the number of cycles that must elapse between the issue of two consecutive instructions(两条连续指令之间必须经过的周期数)

在处理浮点数时，我们把EX阶段分为多种：

- 处理浮点数加法

- 处理浮点数乘法

- 处理浮点数除法

- 不处理浮点数

在这之中，乘法和加法是可以采取流水线的方式来处理的,也就是说，后一条指令并不需要前一条指令离开EX阶段才能进入EX阶段。

---

!!! tip "Out of order Completion"
    对于如下指令:
    ```assembly
    fdiv.d F0,F2,F4
    fadd.d F10,F10,F8
    fsub.d F12,F12,F14
    ```

    由于除法指令执行需要的时间久，因此加法和减法会在除法做完之前做完，也就是出现了乱序的现象。

    对于乱序，我们可以采取如下做法
    
    1. 如果像上面这样指令之间不存在依赖，那么可以直接忽视

    2. 把后完成的指令的结果存到一个buffer里面，等到前面的指令完成后再写回去。

    3. 记录流水线中的指令与它们的PC值，以便处理异常

    4. 只有当一条指令前面的指令都处理完且没发生异常时，才处理这条指令


## ILP exploitation

!!! definition "ILP exploitation"
    ILP exploitation(指令级并行性利用)是指通过编译器和硬件的配合来提高指令级并行性。

    - Compiler-based static parallelism:编译器在编译时分析指令之间的依赖关系，并将可以并行执行的指令进行调度。

    - Hardware-based dynamic parallelism:硬件在运行时动态分析指令之间的依赖关系，并将可以并行执行的指令进行调度。

什么样的指令可以并行呢?

如果两条指令一起执行时不会有stall，不会引起结构冒险，这两条指令就是可以并行的。

不然，我们称这些指令是有依赖的，即Dependant Instructions。

### Dependence

#### Data Dependence(数据依赖)

数据依赖是指两条指令之间存在数据传递关系，即一条指令的输出结果作为另一条指令的输入。典型的数据依赖就是:

- Read After Write (RAW): 也称为真实依赖，表示第二条指令需要读取第一条指令的结果。

- ``` assembly
  add r1, r2, r3
  sub r4, r1, r5
  ```

- 在上面的例子中，第二条指令需要读取第一条指令的结果r1，因此它们之间存在数据依赖关系。

总的来说，如果指令j不与指令i有数据依赖关系，那么下面的情况都不能出现：

- 指令j需要指令i的结果

- 指令j数据依赖指令k，指令k数据依赖指令i

#### Name Dependence(名称依赖)

名称依赖是指两条指令之间存在名称冲突，即它们使用了相同的寄存器或内存地址，但实际上它们之间并没有数据传递关系。

典型的名称依赖有以下两种：

- WAR(Write After Read): 也称为反依赖(Antidependence)，即后一条指令写入了一个寄存器或内存地址，而前一条指令读取了这个寄存器或内存地址。

    - ``` assembly
        fsd r1, 0(r2)
        addi r2,r2,-1
        ```

    - 这两条指令实际上没有数据依赖关系,但是它们执行的顺序不能交换，因为第二条指令会覆盖第一条指令的结果。

- WAW(Write After Write): 也称为输出依赖(Output Dependence)，即两条指令都要写入同一个寄存器或内存地址。

    - ``` assembly
        fsd r1, 0(r2)
        fsd r1, 4(r2)
        ```
    
    - 同样,这两条指令没有数据依赖,但不能交换顺序.

要解决名称依赖的问题，我们可以采取如下措施:

- Register Renaming:把寄存器重命名为不同的寄存器,这样就可以避免名称依赖的问题。

#### Control Dependence(控制依赖)

控制依赖是指两条指令之间存在控制关系，即一条指令的执行结果影响了另一条指令的执行。

``` assembly

beq r1, r2, L1

addi r3, r4, 1

L1:
addi r5, r6, 2
```

在上面的例子中，第二条指令的执行结果取决于第一条指令的执行结果，因此它们之间存在控制依赖关系。

这与我们计组学的Control Hazard是一样的。