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