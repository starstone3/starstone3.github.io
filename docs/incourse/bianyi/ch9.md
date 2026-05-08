---
comments: true
---


# Instruction Selection
> 在这一章,我们要将IR Tree转换为一连串的汇编语言

每一个 IR Tree 的节点承担的功能其实都很单一。换句话说，Tree 语言中的一个节点通常只表示一个原始操作：

- `fetch`
- `store`
- `addition`
- `subtraction`
- `conditional jump`

但是，真实机器指令往往可以一次完成多个原始操作。因此，从 IR Tree 到汇编语言的转换，并不是简单地把每个 IR 节点逐一翻译成一条机器指令，而是要为一棵 IR 子树选择合适的机器指令。

!!! definition "指令选择 (Instruction Selection)"
    指令选择阶段的任务是：为给定的 IR Tree 寻找合适的机器指令序列，使这些机器指令能够实现这棵 IR Tree 所表达的语义。

!!! example "一个 IR 子树可以对应一条机器指令"
    对于如下 IR Tree：

    ```text
             MEM
              |
            BINOP
          /   |    \
       PLUS   e   CONST
                  |
                  c
    ```

    它表示访问地址 $e + c$ 处的内存：

    $$
    \text{MEM}(\text{BINOP}(\text{PLUS}, e, \text{CONST}(c)))
    $$

    如果表达式 $e$ 已经放在寄存器 `rj` 中，那么某些机器可以用一条带偏移寻址的加载指令完成整个子树的操作：

    ```asm
    LOAD ri <- M[rj + c]
    ```

    这里一条真实机器指令同时完成了：

    - 地址计算：`rj + c`
    - 内存读取：`M[rj + c]`
    - 写入目标寄存器：`ri`

    因此，指令选择的核心问题是：识别 IR Tree 中可以被机器指令一次覆盖的子树，并选择代价合适的指令来覆盖这些子树。

## Tiling

!!! definition "Tiling"
    **Tiling** 是指用一组互不重叠的树模式覆盖整棵 IR Tree,就像用瓷砖覆盖地面一样。

    - 每个树模式对应一条或一类机器指令；
    - 每个 IR Tree 节点必须被某个模式覆盖；
    - 不同模式之间不能覆盖同一个节点；
    - 覆盖完成后，每个模式就可以翻译成对应的机器指令。

!!! info "最小覆盖"
    指令选择的目标通常不是简单地让 tile 的数量最少，而是让总代价最小。

    每个机器指令模式可以有一个代价，例如：

    - 指令条数；
    - 执行周期；
    - 是否需要额外临时寄存器；
    - 是否会增加内存访问。

    因此，Instruction Selection 可以表述为：用一组互不重叠的树模式覆盖整棵 IR Tree，并使总代价最小。

为了说明指令选择算法，我们接下来使用一个虚构的指令集：**Jouette architecture**。`Jouette` 在法语中有“玩具”的意思，因此它是一个用于讲解的 toy architecture。

!!! info "Jouette 指令集"
    约定：

    - `ri`、`rj`、`rk` 表示寄存器；
    - `c` 表示常量偏移，且 `c` 可以为 0；
    - `M[addr]` 表示访问地址 `addr` 处的内存；
    - `TEMP` 节点表示已经在某个寄存器中的值；
    - `BINOP(PLUS, x, y)` 简写为 `+(x, y)`，其他二元运算类似；
    - `r0 = 0`，即寄存器 `r0` 恒为 0；
    - 在 tree pattern 中，`CONST` 和 `TEMP` 的具体值有时会省略，只保留节点类型。

    | 指令 | 效果 | 可覆盖的 IR Tree pattern |
    |:--|:--|:--|
    | - | `ri` | `TEMP` |
    | `ADD` | `ri <- rj + rk` | `BINOP(PLUS, e1, e2)` |
    | `MUL` | `ri <- rj * rk` | `BINOP(MUL, e1, e2)` |
    | `SUB` | `ri <- rj - rk` | `BINOP(MINUS, e1, e2)` |
    | `DIV` | `ri <- rj / rk` | `BINOP(DIV, e1, e2)` |
    | `ADDI` | `ri <- rj + c` | `BINOP(PLUS, e, CONST(c))` 或 `BINOP(PLUS, CONST(c), e)` |
    | `SUBI` | `ri <- rj - c` | `BINOP(MINUS, e, CONST(c))` |
    | `LOAD` | `ri <- M[rj + c]` | `MEM(BINOP(PLUS, e, CONST(c)))`、`MEM(BINOP(PLUS, CONST(c), e))`、`MEM(e)`、`MEM(CONST(c))` |
    | `STORE` | `M[rj + c] <- ri` | `MOVE(MEM(BINOP(PLUS, e, CONST(c))), src)`、`MOVE(MEM(BINOP(PLUS, CONST(c), e)), src)`、`MOVE(MEM(e), src)`、`MOVE(MEM(CONST(c)), src)` |
    | `MOVEM` | `M[rj] <- M[ri]` | `MOVE(MEM(dst), MEM(src))` |

    我们可以发现，Jouette 的 `LOAD` / `STORE` 指令支持带常量偏移的寻址模式，例如 `M[rj + c]`，因此 `MEM` 中的常量偏移可以直接被指令覆盖。但对于 `a * 4` 这样的乘法，`MUL` 的两个操作数都必须在寄存器中，所以需要先用 `ADDI rt <- r0 + 4` 将常量 4 生成到寄存器中，再执行乘法。

## Optimal and Optimum Tilings

一棵 IR Tree 通常有很多种铺法，那么哪一种是最好的呢？这取决于我们如何定义 tile 的代价。


!!! definition "Optimum Tiling"
    **Optimum tiling** 是全局意义上的最优覆盖：所有 tile 的代价之和达到最低可能值。

    也就是说，optimum tiling 关注的是整棵 IR Tree 的总代价最小：

    $$
    \sum \text{cost}(t)
    $$

    在所有可能的 tiling 中最低。

!!! definition "Optimal Tiling"
    **Optimal tiling** 是局部意义上的最优覆盖：不存在两个相邻 tile 可以合并成一个代价更低的 tile。

    换句话说，optimal tiling 只要求局部不能继续改进.

!!! warning "Optimum 与 Optimal 的区别"
    **Optimum** 是 global 的概念，要求整棵树总代价最低。

    **Optimal** 是 local 的概念，只要求局部相邻 tile 不能继续合并降低代价。

    因此：

    $$
    \text{Every optimum tiling is optimal, but not vice versa.}
    $$

    也就是说，每个全局最优覆盖一定也是局部最优覆盖；但局部最优覆盖不一定是全局最优覆盖。

## Algorithms for Instruction Selection

### Maximal Munch

!!! definition "Maximal Munch"
    **Maximal Munch** 是一种用于生成 **optimal tiling** 的贪心算法。

    它的核心思想是：从 IR Tree 的根节点开始，选择能够匹配根节点的最大 tile。

    这里的 **最大 tile** 指覆盖节点数最多的 tile。如果有多个大小相同的 tile 都能匹配根节点，那么可以任意选择其中一个。

具体过程如下：

1. 从当前树的根节点开始。
2. 在 tile catalog 中查找能匹配根节点的 tile。
3. 选择其中最大的 tile，用它覆盖根节点以及根附近的若干节点。
4. 被这个 tile 覆盖后，剩下若干未覆盖的子树。
5. 对每棵子树递归执行同样的过程。

由于每一步都选择当前根节点处能匹配的最大 tile，所以它是一个 **greedy algorithm**。

!!! warning "Maximal Munch 只保证局部最优"
    Maximal Munch 生成的是 **optimal tiling**，也就是局部最优覆盖。

    它保证不会出现两个相邻 tile 可以合并成一个更大 tile 的情况；但它不一定生成 **optimum tiling**，因为全局最低代价可能需要在某些位置暂时不选最大的 tile。

Maximal Munch 通常用两个递归函数实现：

- `munchStm`：处理 statement 节点，例如 `MOVE`、`EXP`、`JUMP`、`CJUMP`；
- `munchExp`：处理 expression 节点，例如 `TEMP`、`CONST`、`BINOP`、`MEM`。

这两个函数都会按照 tile 的优先级进行匹配：**大的 tile 放在前面，小的 tile 放在后面**。例如处理 `MEM(BINOP(PLUS, e, CONST(c)))` 时，应优先匹配 `LOAD ri <- M[rj + c]`，而不是先把 `BINOP(PLUS, ...)` 拆成 `ADDI`，再单独处理 `MEM`。


!!! note "为什么说指令是 reverse order 生成的"
    从 tiling 的角度看，Maximal Munch 是从根节点开始选择 tile 的。

    但是从真实执行顺序看，根节点对应的指令通常要等子表达式先计算完成后才能发出。例如：

    ```text
    BINOP(PLUS, e1, e2)
    ```

    必须先分别计算 `e1` 和 `e2`，得到两个寄存器结果后，才能生成：

    ```asm
    ADD ri <- rj + rk
    ```

    因此，算法虽然先在根节点选择 tile，但生成指令时通常会先递归处理子树，再 `emit` 当前 tile 的指令。也就是说，指令生成顺序相对于从根开始的 tiling 顺序是反过来的，更接近后序遍历。

### Dynamic programming

!!! definition "Dynamic Programming for Tiling"
    动态规划算法用于寻找 **optimum tiling**，也就是全局总代价最低的 tiling。

    对于根节点为 $n$ 的 IR Tree，算法先递归计算 $n$ 的所有孩子、孙子等子树的最优代价；然后在节点 $n$ 处尝试所有能匹配的 tree pattern，并选择总代价最低的那个。

动态规划的关键是：每个节点只需要在其所有子节点的最优代价已经确定之后，再计算自己作为根的最优代价。因此它本质上是一个自底向上的过程。

具体过程如下：

1. 给定根节点 $n$。
2. 递归计算 $n$ 的所有子节点的最优 tiling 代价。
3. 枚举 tile catalog 中所有可以匹配节点 $n$ 的 tree pattern。
4. 对每个匹配成功的 tile，计算选择该 tile 的总代价。
5. 选择总代价最低的 tile，记录为节点 $n$ 的最优选择。

!!! info "Tile 的 leaves"
    每个 tile 可以有 0 个或多个 **leaves**。

    leaf 是 tile 没有继续覆盖的位置，也就是后续子树可以接上的地方。例如某个 `STORE` tile 可能覆盖：

    ```text
          MOVE
         /    \
       MEM   leaf1
        |
        +
       / \
    CONST leaf2
    ```

    在这个 pattern 中，`leaf1` 和 `leaf2` 都表示没有被当前 tile 覆盖的子树根节点。这些 leaf 对应的子树代价已经在递归过程中提前计算好了。

!!! definition "匹配一个 tile 的代价"
    假设 tile $t$ 可以匹配节点 $n$，并且 tile 自身的代价为 $c_t$。

    如果 tile $t$ 的每个 leaf $i$ 对应子树的最优代价为 $c_i$，那么用 tile $t$ 匹配节点 $n$ 的总代价为：

    $$
    c_t + \sum_{\text{all leaves } i \text{ of } t} c_i
    $$

    其中每个 $c_i$ 都已经在递归处理子树时计算完成。

因此，节点 $n$ 的最优代价是所有匹配 tile 中代价最小的那个：

$$
\text{cost}(n)
=
\min_{t \in \text{matches}(n)}
\left(
    c_t + \sum_{\text{all leaves } i \text{ of } t} c_i
\right)
$$

因此,动态规划实际上是一个自底向上的过程：先计算所有子树的最优代价，然后在父节点处选择最优 tile。

!!! example 
    考虑如下 IR Tree：

    ```text
          MEM
           |
           +
          / \
    CONST 1 CONST 2
    ```

    我们在每个节点上标注一个二元组 $(a, b)$：

    - $a$ 表示以该节点为根的子树的最小 tiling 代价；
    - $b$ 表示达到该最小代价时所选的 pattern 编号。

    这里假设每个 tile 自身的代价都是 1。

    === "Step 1：`CONST` 节点"

        `CONST 1` 和 `CONST 2` 都只能匹配 `CONST` pattern。该 tile 没有 leaf，所以 leaves cost 为 0。

        | Pattern (Tile) | Cost | Leaves Cost | Total |
        |:--|:--|:--|:--|
        | `(8) CONST` | 1 | 0 | 1 |

        因此两个 `CONST` 节点的标注都是：

        $$
        (1, 8)
        $$

    === "Step 2：`+` 节点"

        当前节点是：

        ```text
            +
           / \
        CONST CONST
        ```

        它可以匹配三种 pattern：

        | Pattern (Tile) | Cost | Leaves Cost | Total |
        |:--|:--|:--|:--|
        | `(2) +(e1, e2)` | 1 | $1 + 1 = 2$ | 3 |
        | `(6) +(CONST, e1)` | 1 | 1 | 2 |
        | `(7) +(e1, CONST)` | 1 | 1 | 2 |


        - pattern `(2)` 只覆盖 `+` 本身，左右两个 `CONST` 都作为 leaf，所以 leaves cost 为 $1 + 1$；

        - pattern `(6)` 覆盖 `+` 和左侧 `CONST`，右侧 `CONST` 作为 leaf，所以 leaves cost 为 1；

        - pattern `(7)` 覆盖 `+` 和右侧 `CONST`，左侧 `CONST` 作为 leaf，所以 leaves cost 为 1。

        最小总代价是 2，对应 pattern `(6)` 或 `(7)`。因此 `+` 节点可以标注为：

        $$
        (2, 6/7)
        $$

    === "Step 3：`MEM` 节点"

        当前根节点是：

        ```text
              MEM
               |
               +
              / \
        CONST 1 CONST 2
        ```

        它可以匹配三种 `LOAD` 相关 pattern：

        | Pattern (Tile) | Cost | Leaves Cost | Total |
        |:--|:--|:--|:--|
        | `(13) MEM(e1)` | 1 | 2 | 3 |
        | `(10) MEM(+(e1, CONST))` | 1 | 1 | 2 |
        | `(11) MEM(+(CONST, e1))` | 1 | 1 | 2 |



        - pattern `(13)` 只覆盖 `MEM`，下面整个 `+` 子树作为 leaf，其代价已经计算为 2；

        - pattern `(10)` 覆盖 `MEM`、`+` 和右侧 `CONST`，左侧 `CONST` 作为 leaf，代价为 1；

        - pattern `(11)` 覆盖 `MEM`、`+` 和左侧 `CONST`，右侧 `CONST` 作为 leaf，代价为 1。

        最小总代价是 2，对应 pattern `(10)` 或 `(11)`。因此根节点 `MEM` 的标注是：

        $$
        (2, 10/11)
        $$

        这说明整棵树的 optimum tiling 代价为 2

!!! note "与 Maximal Munch 的区别"
    Maximal Munch 在每个节点优先选择最大的 tile，是局部贪心。

    Dynamic Programming 会比较每个可匹配 tile 的总代价：

    - 当前 tile 自身的代价；
    - 所有 leaf 子树的最优代价。

    因此它能得到全局意义上的 optimum tiling，但实现和代价计算都比 Maximal Munch 更复杂。

在得到最优解用的tile之后,我们就可以按照tile的定义生成对应的机器指令了。