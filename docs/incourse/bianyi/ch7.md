---
comments: true
---

# IR

!!! definition "Intermediate Representation"
    - **Intermediate Representation (IR)**: 一种介于源代码和目标机器代码之间的抽象表示形式,用于编译器的优化和代码生成阶段.

    === "IR 的本质"
        - IR 可以看作一种 **abstract machine language**.

        - 它表达的是目标机器上将要执行的操作,但不会过早绑定到过多具体机器细节.

        - 同时,IR 也尽量独立于具体源语言的语法细节.

        - 因此,IR 起到了一种"中间桥梁"的作用: 前端把源程序翻译成 IR, 后端再把 IR 翻译成目标代码.

    === "Why Use IR"
        - 如果没有 IR, 编译器前端和后端会紧密耦合,不同源语言和不同目标机器之间难以复用.

        - 引入 IR 后,编译器可以把"语义分析"与"机器相关代码生成"分离开.

        - 比如,我们想在MIPS和x86两种不同的目标机器上生成代码,如果没有 IR,我们需要为每种源语言编写两套代码生成器(前端和后端),而有了 IR,我们只需要编写一套前端把源程序翻译成 IR,再编写两套后端把 IR 翻译成不同的目标代码即可.工作量从$n \times m$减少到$n + m$.

    === "Common Forms Of IR"
        - 编译器中可以使用很多不同形式的 IR.

        - 常见的包括:

        - **Three-Address Code (TAC)**: 以三地址指令形式表示计算过程,便于线性化和后续优化.

        - **Static Single Assignment (SSA)**: 每个变量只赋值一次的表示形式,便于数据流分析和优化.

        - **Control Flow Graph (CFG)**: 用图结构表示基本块及其控制流转移关系.

        - **Abstract Syntax Tree (AST)**: 用树结构保留程序的语法层次,更接近源程序结构.

        - **Expression Trees / IR Tree**: 用树表示表达式和语句的中间形式,例如 Tiger Compiler 中常用的 IR Tree.

## Three Address of Code

TAC 是一种常见的 IR 形式,每条指令最多包含三个地址(操作数),通常表示为:

```
x = y op z
```

我们通常使用四元组来表示 TAC 指令,其中包含操作符和操作数:

```
(op, arg1, arg2, result)
```

## Intermediate Representation Trees

一个好的IR应该:

- 容易从源程序生成

- 容易转换成目标代码

<div style="text-align: center;">
    <img src="../../../image/mac235.png" style="max-width: 100%; height: auto;">
</div>

!!! info "Why IR Must Be Simple"
    === "Complex Effects"
        - 抽象语法(Abstract Syntax)中的某些结点可能带有 **complex effects (CE)**.

        - 例如图中的 `procedure calls`、`array subscripts` 这类结构,往往不仅仅对应一次简单操作.

        - 它们可能同时包含取值、地址计算、控制转移、访存等多个动作.

        - 机器语言中其实也存在复杂效果的指令,例如图中的 `tensor inst.`、`vector operation`.

    === "Why AST Cannot Map Directly To Assem"
        - 问题在于: AST 中的复杂结构,和机器指令中的复杂结构,它们的效果 **并不能一一良好对应**.

        - 也就是说,源语言里的一个复杂结点,未必能直接翻译成某一条目标机器指令.

        - 反过来,目标机器上的一条复杂指令,也不一定正好对应某个源语言结构.

        - 所以编译器不能简单地做"语法结点对机器指令"的直接映射.

    === "Role Of IR"
        - IR 必须足够简单,能够把抽象语法中的复杂操作 **拆开(split up)**.

        - 例如把一次复杂表达式拆成更基础的 `fetch`、`store`、`add`、`move`、`jump` 等小步骤.

        - 然后在后端阶段,再根据目标机器的特点,把这些简单 IR 操作重新 **组合(combine up)** 成真正的机器指令.

        - 因此,IR 的价值就在于: 它既不像 AST 那样过于接近源语言结构,也不像 Assem 那样过于依赖具体机器.

### IR Tree Nodes

!!! definition "Two Kinds of IR Tree Nodes"
    === "Expressions (`T_exp`)"
        - 表达式结点有return value.

        - 但表达式在求值过程中,也可能产生side effects,比如修改某个寄存器的值.

    === "Statements (`T_stm`)"
        - 语句结点没有返回值.

        - 它们主要负责执行side effects或改变控制流control flow.

---


!!! info "Expression Nodes"
    === "`CONST(i)`"
        - 表示整数常量 `i`.

    === "`NAME(n)`"
        - 表示符号常量 `n`,通常对应一个汇编标签(label).

    === "`TEMP(t)`"
        - 表示临时变量 `t`,可以把它看作抽象机器中的寄存器.

    === "`BINOP(op, e1, e2)`"
        - 表示对表达式 `e1` 和 `e2` 应用二元运算 `op`.


    === "`MEM(e)`"
        - 表示访问地址 `e` 所指向的内存内容.

        - 一般情况下,`MEM(e)` 表示 **fetch**.

        - 但当 `MEM(e)` 出现在 `MOVE` 的left child时,表示 **store** 的目标地址.

    === "`CALL(f, l)`"
        - 表示过程调用: 调用函数 `f`,参数列表为 `l`.

        - 参数通常按从左到右的顺序求值.

        - `CALL` 属于 expression,因为函数调用通常会返回一个结果.

    === "`ESEQ(s, e)`"
        - 先执行语句 `s` 的副作用,再计算表达式 `e` 的值.

        - 它把 statement 和 expression 临时组合到一起.


!!! info "Statement Nodes"
    === "`MOVE(TEMP t, e)`"
        - 计算表达式 `e`,并把结果放入临时变量 `t`.

    === "`MOVE(MEM(e1), e2)`"
        - 先计算 `e1`,得到地址 `a`.

        - 再计算 `e2`,并把结果存入从地址 `a` 开始的 `wordSize` 字节内存中.

        - 这里的 `MEM(e1)` 表示 **store**.

    === "`EXP(e)`"
        - 计算表达式 `e`,但丢弃其结果.

        - 主要用于只关心副作用的表达式,例如函数调用.

    === "`JUMP(e, labs)`"
        - 无条件跳转到 `e` 所表示的目标位置.

        - `labs` 给出所有可能的跳转目标,便于数据流分析.

    === "`CJUMP(op, e1, e2, t, f)`"
        - 先计算 `e1` 和 `e2`.

        - 再用关系运算符 `op` 比较两者.

        - 若条件成立则跳转到 `t`,否则跳转到 `f`.

    === "`SEQ(s1, s2)`"
        - 先执行语句 `s1`,再执行语句 `s2`.

    === "`LABEL(n)`"
        - 定义一个标签 `n`,作为控制流跳转的目标位置.
