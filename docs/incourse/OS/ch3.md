---
commments: true
---

# 进程同步

- **同步(Synchronization)**: 一个进程等待另一个进程完成某个操作后才能继续执行的机制.

- **异步(Asynchronization)**: 进程不需要等待其他进程完成操作,可以独立执行.
> 实际上和数逻里面的同步异步是一个意思.

- **互斥(Mutual Exclusion)**: 确保多个进程在同一时间只能有一个进程访问共享资源的机制.


??? example 
    有两个进程（线程）P1、P2，它们分别执行下面的程序，其中 `total` 是两个进程都能访问的共享变量，初值为 0（可理解为共享存储段中的存储单元），`count` 是每个进程的私有变量。假设这两个进程并发执行，并可自由交叉（interleave），则这两个进程都执行完后，变量 `total` 可能得到的最小取值是：

    A. 50
    B. 1
    C. 2
    D. 3

    P1:
    ```c
    {
        int count;
        for (count = 1; count <= 50; count++)
            total = total + 1;
    }
    ```

    P2:
    ```c
    {
        int count;
        for (count = 1; count <= 50; count++)
            total = total + 2;
    }
    ```

    ??? general "解答"
        `total = total + 1` 的操作可以分解为三个子操作：

        1. 读 `total` 的值到寄存器 R 中
        2. 在寄存器 R 中进行加法运算
        3. 将寄存器 R 的值写回 `total`

        假设 P1 和 P2 的交叉执行如下：

        1. P1 读 `total` 的值 0 到寄存器 R 中，执行加法，R 变为 1
        2. P2 直接进行 49 次循环（此时 P2 在寄存器中累加，但尚未写回）
        3. 在 P2 进行第 50 次循环前，P1 将第一次循环的结果写回 `total`，导致 P2 读到的 `total` 是 1
        4. P2 继续进行第 50 次循环，将寄存器 R 增加 2（基于它之前读到的值）
        5. P1 继续进行剩下的 49 次循环并按其逻辑写回
        6. P2 最后将其寄存器值写回 `total`，最终结果为 3

从上面的例子可以看出：当两个并发进程在没有适当同步的情况下操作同一共享变量时，可能会导致数据不一致。

那么，何时需要对两个进程进行同步？我们可以通过判断是否存在 `Race Condition`（竞争条件）来确定。


---

我们称两个或多个进程在访问共享资源时，如果它们的执行顺序会影响最终结果，就存在竞争条件.

竞争条件带来了临界区问题(Critical Section Problem)

## 临界区问题
> 当n个进程竞争某一共享资源时,每个进程都有一段代码,称为临界区(Critical Section),在这段代码中访问共享资源.
>
> 我们要考虑如何设计进程的执行顺序,使得在任何时刻,最多只有一个进程在其临界区内执行.

一次只允许一个进程访问的资源叫临界资源.临界资源的访问,可以分为四个步骤:

1. **Entry Section**: 进程请求进入临界区的代码段.在这里检查临界区是否空闲,并且如果能够进入临界区,则需要标记临界区为忙碌状态.

2. **Critical Section**: 进程访问临界资源的代码段.在这里,进程可以安全地访问和修改共享资源.

3. **Exit Section**: 进程离开临界区的代码段.在这里,进程需要标记临界区为空闲状态,以便其他进程可以进入.

4. **Remainder Section**: 进程在临界区之外执行的代码段.在这里,进程可以执行不涉及共享资源的操作.

所有能够解决临界区问题的算法,都必须满足以下三个条件:

1. **互斥(Mutual Exclusion)**: 在任何时刻,最多只有一个进程可以在其临界区内执行.

2. **空闲让进(Progress)**: 如果临界区为空闲,并且有一个或多个进程请求进入临界区,那么进入临界区的请求不能被无限推迟.也就是说,能进入的时候一定要立即进入.

3. **有限等待(Bounded Waiting)**: 每个进程在请求进入临界区后,都有一个有限的等待时间,不会被其他进程无限期地阻塞.

还有一个原则上需要,但是非必须的条件:

- **让权等待**:当进程不能进入临界区时,它应该释放自己的CPU使用权,让其他进程运行.


## Peterson算法
> 这是一个软件解决方案,适用于两个进程的临界区问题.

在介绍Peterson算法之前,我们先看看别的解决方案为什么不行.

### 单标志法

对于两个进程$P_0$和$P_1$,我们设置一个共享变量`turn`,当`turn`为0时,表示允许$P_0$进入临界区;当`turn`为1时,表示允许$P_1$进入临界区.

<div style="display:flex; gap:1rem; flex-wrap:wrap;">
  <div style="flex:1; min-width:220px;">
```c title="进程P0"
while(turn != 0);   // 进入区
critical section;   // 临界区
turn = 1;           // 退出区
remainder section;  // 剩余区
```
  </div>
  <div style="flex:1; min-width:220px;">
```c title="进程P1"
while(turn != 1);   // 进入区
critical section;   // 临界区
turn = 0;           // 退出区
remainder section;  // 剩余区
```
  </div>
</div>

这个方法满足了互斥条件,但是不满足空闲让进条件.假设`turn`为0,允许$P_0$进入临界区,但是$P_0$此时并不需要进入临界区,而$P_1$却需要进入临界区.由于$P_0$无法运行,`turn`的值没有改变,$P_1$将被无限期地阻塞.

### 双标志先检查法

设置一个`bool`类型的数组`flag[2]`,表示每个进程是否想要进入临界区.

<div style="display:flex; gap:1rem; flex-wrap:wrap;">
  <div style="flex:1; min-width:220px;">
```c title="进程P0"
while(flag[1]) ; // 进入区
flag[0] = true;
critical section;   // 临界区
flag[0] = false;    // 退出区
remainder section;  // 剩余区
```
  </div>
  <div style="flex:1; min-width:220px;">
```c title="进程P1"
while(flag[0]) ; // 进入区
flag[1] = true;
critical section;   // 临界区
flag[1] = false;    // 退出区
remainder section;  // 剩余区
```
  </div>

</div>

这个算法会违背互斥原则.例如,如果$P_0$先执行到`while(flag[1]);`时,此时`flag[1]`为`false`,所以$P_0$继续执行,但在$P_0$设置`flag[0] = true;`之前,如果$P_1$也执行到`while(flag[0]);`,此时`flag[0]`为`false`,所以$P_1$也继续执行,这样两个进程就都进入了临界区,违反了互斥条件.

### 双标志后检查法

针对“先检查再设置”会导致的竞态问题，改进思路是“先设置再检查”。

<div style="display:flex; gap:1rem; flex-wrap:wrap;">
  <div style="flex:1; min-width:220px;">
```c title="进程 P0（示意）"
flag[0] = true;        // 1: 先设置自己的标志
while (flag[1]) ;      // 3: 检查对方的标志，若为 true 则等待
// critical section;  // 临界区
flag[0] = false;       // 退出区
remainder section;
```
  </div>
  <div style="flex:1; min-width:220px;">
```c title="进程 P1（示意）"
flag[1] = true;        // 2: 先设置自己的标志
while (flag[0]) ;      // 4: 检查对方的标志
// critical section;  // 临界区
flag[1] = false;       // 退出区
remainder section;
```
  </div>
</div>

如果两个进程按序列 1 → 2 → 3 → 4 执行（即双方先后设置各自的标志，然后各自检查对方），会出现双方都发现对方也想进入临界区而互相等待的情况。该情况违背“空闲让进（Progress）”原则，且可能导致长期无法进入临界区的“饥饿”现象（违背“有限等待（Bounded Waiting）”）。

---

Peterson算法综合了上述两种方法的优点,并且避免了它们的缺点.

同时使用一个`bool`类型的数组`flag[2]`,表示每个进程是否想要进入临界区,以及一个整型变量`turn`,表示偏向于让哪个进程进入临界区.

每个进程进入临界区之前,先设置自己的flag标志,再给对方设置允许进入turn标志,表达"谦让";之后,再同时 检测对方的flag和 turn标志.

<div style="display:flex; gap:1rem; flex-wrap:wrap;">
  <div style="flex:1; min-width:220px;">
```c title="进程P0"
flag[0] = true;        // 1: 表示 P0 想进入临界区
turn = 1;              // 2: 表示 P0 谦让 P1
while (flag[1] && turn == 1) ; // 3: 检测 P1 的状态
critical section;      // 临界区
flag[0] = false;       // 退出区
remainder section;     // 剩余区
```

</div>
<div style="flex:1; min-width:220px;">
```c title="进程P1"
flag[1] = true;        // 1: 表示 P1 想进入临界区
turn = 0;              // 2: 表示 P1 谦让 P0
while (flag[0] && turn == 0) ; // 3: 检测 P0 的状态
critical section;      // 临界区
flag[1] = false;       // 退出区
remainder section;     // 剩余区
```
</div>
</div>


当两个进程都想进入临界区时,它们都会设置`turn`,但最终`turn`只会被赋给一个值,因此只有一个进程能够通过`while`循环进入临界区,从而保证了互斥性.当这个进程执行完之后,它会将自己的`flag`设置为`false`,允许另一个进程进入临界区.

Peterson算法满足互斥、空闲让进和有限等待三个条件,因此它是一个有效的解决临界区问题的算法,但没有满足让权等待条件.