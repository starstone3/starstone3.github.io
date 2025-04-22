# 指令级并行


- [ ] 比赛预测器没写

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


---

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

``` assembly
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

    ```assembly
    fsd r1, 0(r2)
    addi r2,r2,-1
    ```

    - 这两条指令实际上没有数据依赖关系,但是它们执行的顺序不能交换，因为第二条指令会覆盖第一条指令的结果。

- WAW(Write After Write): 也称为输出依赖(Output Dependence)，即两条指令都要写入同一个寄存器或内存地址。

    ``` riscv
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

---

### Static Scheduling(静态调度)

!!! definition "Static Scheduling 解释 from claude"
    静态调度是指在编译时分析指令之间的依赖关系，并将可以并行执行的指令进行调度。

    - 优点:编译器可以根据指令之间的依赖关系进行调度，从而提高指令级并行性。

    - 缺点:编译器无法动态分析指令之间的依赖关系，因此可能会导致一些指令无法并行执行。

    静态调度就像是一个精心设计的交通管制系统，但这个系统是在"道路建设完成"之前就已经规划好的。

    想象编译器是一位交通规划师，它在程序执行前（编译时）就需要规划好所有"车辆"（指令）的行驶路线：

    1. **提前规划路线**：编译器会提前查看整个代码，就像交通规划师查看城市地图，找出哪些指令可以并行执行。

    2. **避开"堵车点"**：编译器会识别指令间的依赖关系（如RAW、WAR、WAW依赖），就像规划师避开可能的交通拥堵点。

    3. **固定的交通灯设置**：一旦编译完成，指令执行的顺序就像被固定的交通灯时序一样，不会根据实际运行情况做出调整。

    **实例分析**：
    ```c
    a = b + c;    // 指令1
    d = e + f;    // 指令2 
    g = a + d;    // 指令3
    ```

    静态调度分析：

    - 指令1和指令2之间没有依赖，可以并行执行

    - 指令3依赖于指令1和指令2的结果，必须等它们完成后才能执行

    编译器会生成调度计划：先并行执行指令1和指令2，再执行指令3。这种规划是基于编译时的"理想情况"做出的最佳安排，但无法应对运行时的意外情况，如缓存未命中或分支预测错误。


静态调度有两种方法:

1. Pipeline Scheduling:流水线调度

2. Loop Unrolling:循环展开

我们以接下来这段程序为例介绍。

```c
for(i=999;i>=0;i--){
    x[i] = x[i] + s;
}
```

它的RISC-V指令如下:

```assembly
Loop: fld f0,0(x1) // load x[i] into f0
      fadd.d f4,f0,f2 // f0 = x[i] + s
      fsd f4,0(x1) // store f0 into x[i]
      addi x1,x1,-8 // i--
      bne x1,x2,Loop // if i != 0, jump to Loop
```

---

#### Pipeline Scheduling(流水线调度)

观察上面的汇编指令，我们发现前三条指令都存在数据依赖关系。

如果就这样执行的话

1. `fld`指令和`fadd.d`指令之间需要一个周期的stall(考虑forwarding)

2. `fadd.d`指令和`fsd`指令之间需要两个周期的stall

这样,跑一个循环就要八个周期.

如果我们把指令顺序调整为

```assembly
Loop: fld f0,0(x1) // load x[i] into f0
      addi x1,x1,-8 // i--
      fadd.d f4,f0,f2 // f0 = x[i] + s
      fsd f 8(x1) // store f0 into x[i]
      bne x1,x2,Loop // if i != 0, jump to Loop
```

在这样的情况下,`fld`和`fadd.d`之间就不用停了,因为这一个周期拿来执行无关的指令了,现在只需要在`fadd.d`和`fsd`之间停两个周期就行了.

跑一个循环从八个周期变成了七个周期,加快了速度.

---

然而,现在还存在一个问题.在一个循环中,真正对数据作操作的就只有`fld`,`fadd.d`和`fsd`三条指令,五条指令只有三条在干活,这不符合我们的设计.

因此,引入了Loop Unrolling(循环展开).

---

#### Loop Unrolling(循环展开)

我们把用于循环的语句开销称为Loop Overhead(循环开销),它包括:

- 计算循环条件的开销

- 更新循环变量的开销

- 跳转的开销

我们的目的就是降低这个开销,也就是提高干活指令的比例.

我们直接把循环展开四次:

```assembly
Loop:   fld f0,0(x1) // load x[i] into f0
        fadd.d f4,f0,f2 // f0 = x[i] + s
        fsd f4,0(x1) // store f0 into x[i]
        fld f6,-8(x1) // load x[i-1] into f6
        fadd.d f8,f6,f2 // f6 = x[i-1] + s
        fsd f8,-8(x1) // store f6 into x[i-1]
        fld f10,-16(x1) // load x[i-2] into f10
        fadd.d f12,f10,f2 // f10 = x[i-2] + s
        fsd f12,-16(x1) // store f10 into x[i-2]
        fld f14,-24(x1) // load x[i-3] into f14
        fadd.d f16,f14,f2 // f14 = x[i-3] + s
        fsd f16,-24(x1) // store f14 into x[i-3]
        addi x1,x1,-32 // i--
        bne x1,x2,Loop // if i != 0, jump to Loop
```

这样,平均每个循环耗时6.5个周期.

> 💡 **性能优化新挑战**  
> 但是还不过瘾！我们想要更进一步，怎么做？

我们可以再进行重排来减少周期数。

```assembly
Loop:   fld f0,0(x1) // load x[i] into f0
        fld f6,-8(x1) // load x[i-1] into f6
        fld f10,-16(x1) // load x[i-2] into f10
        fld f14,-24(x1) // load x[i-3] into f14
        fadd.d f4,f0,f2 // f0 = x[i] + s
        fadd.d f8,f6,f2 // f6 = x[i-1] + s
        fadd.d f12,f10,f2 // f10 = x[i-2] + s
        fadd.d f16,f14,f2 // f14 = x[i-3] + s
        fsd f4,0(x1) // store f0 into x[i]
        fsd f8,-8(x1) // store f6 into x[i-1]
        fsd f12,-16(x1) // store f10 into x[i-2]
        fsd f16,-24(x1) // store f14 into x[i-3]
        addi x1,x1,-32 // i--
        bne x1,x2,Loop // if i != 0, jump to Loop
```

这样,我们用有用的指令代替了stall,所以完全不需要停了.

四个循环一共用了14个周期,平均每个循环3.5个周期,提升可以说非常大了.

---

### Dynamic Branch Prediction(动态分支预测)

#### 1 bit predictor(1位预测器)

用一个位来表示分支是否被预测为taken,如果是,就用1表示,如果不是,就用0表示.

如果当前预测的结果和实际结果相同,就不需要更新,如果不同,就更新.

相当于一个只有两个状态的有限状态机.

这个方法对于“摇摆"的分支预测效果会很糟糕，比如taken和not taken交替出现的情况。

在这个情况下，我们思考2bit预测器的设计。

#### 2 bit predictor(2位预测器)

2bit预测器使用两个位来表示分支的状态，分为四种状态:

- 00: strongly not taken(强不跳转)

- 01: weakly not taken(弱不跳转)

- 10: weakly taken(弱跳转)

- 11: strongly taken(强跳转)

强弱在这里其实没有特别的含义，与1bit预测器的主要区别就是，2bit预测器需要两次错误才能改变预测状态
 
 
<pre>

   
┌───────────┐         ┌─────────────┐
│          │ taken  │            │
│    00    ├────────►│     01     │
│ 强不跳转  │         │  弱不跳转   │
│          │◄────────┤            │
└───────────┘not taken└─────┬───────┘
                          │       ▲ 
                          │taken  |  not taken                                
                          ▼       |
┌───────────┐         ┌─────────────┐
│           │   taken │           │
│    11     │◄────────┤     10     │
│  强跳转    │         │   弱跳转    │
│           ├────────►│            │
└───────────not taken └─────────────┘
  
            
</pre>


#### Branch Target Buffer(BTB)(分支目标缓冲器)

BTB中放置了分支指令的PC地址和目标地址，当我们遇到分支指令时，就可以直接从BTB中找到目标地址。

1. 工作原理

    1. **预存储分支信息**：BTB存储了分支指令的PC地址和对应的目标地址的映射关系
    
    2. **提前获取目标**：处理器遇到分支指令时，不必等到指令解码阶段才知道跳转目标，而是可以直接查询BTB
    
    3. **预取指令**：处理器可以根据BTB中的信息提前从目标地址获取指令，大大减少分支指令带来的流水线停顿

2. BTB的结构

    BTB通常实现为一个缓存结构：

    | 分支指令地址 | 目标地址 | 预测信息 |
    |---|---|---|
    | 0x1000 | 0x2000 | Taken |
    | 0x1200 | 0x1500 | Not Taken |
    | ... | ... | ... |

3. 实际应用过程

    1. **IF阶段**：处理器获取指令并检查该地址是否在BTB中

    2. **命中时**：如果命中且预测为taken，处理器直接从目标地址获取下一条指令

    3. **未命中时**：继续顺序执行，并在确认为分支指令后更新BTB

    4. **预测错误**：如果分支预测错误，处理器清空流水线并从正确的地址重新取指令


#### Tournament Predictor(比赛预测器)

Todo...