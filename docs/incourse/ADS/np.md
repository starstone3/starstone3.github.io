---
comments : true

statistics : true
---

# NP Completeness

!!! info "P与NP"
    P的意思是“Polynomial”，多项式时间可解决，

    NP是“Nondeterministic Polynomial time”的缩写，指的是在非确定性多项式时间内可以验证解的问题集合。

## Halting problem

!!! warning 
    Is it possible to have your C compiler detect all infinite loops?

答案是**否**

假设我们有这样的一个函数H(P,I),可以判断函数P在输入I是是否为死循环，如果是，返回1，不然返回0.

根据H我们可以构造一个U(P):

``` plaintext

U(P){
    if(H(P,P))//如果是死循环
        break;
    else//如果不是死循环
        infinite_loop();//让函数陷入死循环
}
```

考虑U(U)的调用结果:

!!! tip
    如果是死循环，则H(P,P)为1，进入break，我们在U(U)是死循环的基础上推出U(U)不是死循环。

    不然，则进入死循环，我们在U(U)不是死循环的基础上推出U(U)是死循环。

    综上所述，不存在这样的H,不然，我们总可以构造出一个U造成矛盾。

## 图灵机

### Deterministic Turing Machine

确定性图灵机指的是机器根据指令前往一个特定的地方。

!!! tip "from PPT"
    A Deterministic Turing Machine executes one instruction at each point in time.  Then depending on the instruction, it goes to the next unique instruction.

### Nondeterministic Turing Machine

非确定型图灵机中，机器可以自由选择下一步做什么，并总是选择正确答案。

!!! tip "from PPT"
    A Nondeterministic Turing Machine is free to choose its next step from a finite set.  And if one of these steps leads to a solution, it will always choose the correct one.

###  True NP!

一个问题是NP的，意味着虽然我们不知道能不能在多项式时间内找到它的解，但对于任何一个可能的解，我们可以在多项式时间内验证它是否是正确的。


!!! warning
    Not all decidable problems are in NP.  For example, consider the problem of determining whether a graph does not have a Hamiltonian cycle.


显然,

$$
P \subset NP
$$

## NP完全

NPC问题是NP问题里最**"难"**的问题。

!!! definition "polynomial reduce"
    问题的难度:如果我们能在多项式时间的复杂度内，将问题 A 转化为问题 B，则称问题 A 可以多项式时间归约(polynomial reduce)为 B，记为 $A \leq_p B $，表示 A 不会比 B 难。

那么，如果我们能证明任何一个NPC问题可以在多项式复杂度内解决，那么所有的NP问题都可以在多项式复杂度内解决，那么就有

$$
P=NP
$$

## Traveling salesman problem

!!! definition
    === "Hamiltonian cycle problem"
        Given a graph G=(V, E), is there a simple cycle that visits all vertices?
    
    === "Traveling salesman problem"
        Given a complete graph G=(V, E), with edge costs, and an integer K, is there a simple cycle that visits all vertices and has total cost $\leq$ K?

如何证明TSP是一个NPC问题?

假设我们已经知道Hamiltonian cycle problem是一个NPC问题。

首先，TSP问题显然是一个NP问题，因为任何一个它的可能解，都可以在$O(N)$的时间范围内得到验证。

其次，对于任何一个回路是否有Hamiltonian cycle,我们可以作如下思考

!!! tip "Hamiltonian cycle与TSP的转换"
    === "Graph for Hamiltonian cycle"
        ![](../../image/i1.png)
    === "Extended Graph for TSP"
        ![](../../image/i2.png)

我们在把一个图拓展为完全图时，将图原来就有的边权值定义为1，新添加的边权值定义为2，那么对于原来的图是否有Hamiltonian cycle，就可以转换为拓展后的完全图在TSP问题上是否有解的问题。

由于完全图的边数为$\frac{n(n+1)}{2}$,因此这个转换过程是多项式时间复杂度的。综上，我们从Hamiltonian cycle是NPC问题推出了TSP是NPC问题。

??? tip "第一个NPC问题从何而来"
    The first problem that was proven to be NP-complete was the Satisfiability problem (Circuit-SAT): Input a boolean expression and ask if it has an assignment to the variables that gives the expression a value of 1.
    
    Cook showed in 1971 that all the problems in NP could be polynomially transformed to Satisfiability.  He proved it by solving this problem on a nondeterministic Turing machine in polynomial time.
