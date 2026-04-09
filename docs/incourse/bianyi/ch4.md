---
comments: true
---

# Abstract Syntax

## Semantic Actions
> 尽管parser负责的是语法分析,但是它也可以顺便做一些语义分析的事情.

在递归下降分析器中,语义动作来自于下面两者之一:

- 解析函数的返回值,如:
    ```c
    struct node *E(void) {
        struct node *t1, *t2;
        t1 = E();
        eat(PLUS);
        t2 = T();
        return makeNode(PLUS, t1, t2);
    }
    ```

- 函数的"side effect",通常是修改全局变量,如: 

    ```c
    void E(void) {
        case LPAREN:
            eat(LPAREN);
            num++;
        case RPAREN:
            eat(RPAREN);
            num--;
    }
    ```

在以Yacc为代表的LALR文法中,语义动作通常写在文法的右侧,如:

```yacc
E : E '+' T
    {
        $$ = $1 + $3;
    }
```

实际上,这部分的内容在Lab1的实验中已经做过了.其中.y文件中的`$$=$1+$2`这种就是语义动作,相应的`tree.hpp`就是我们为各个文法符号定义的数据结构,也就是PPT中说的:

> Each terminal and nonterminal may be associated with its own type of semantic value.
> A -> B C D
> The semantic action must return a value whose type is the one associated with the nonterminal A

## Abstract Parse Trees

### Concrete Parse Tree（具体语法树）

从技术上讲，一棵 **parse tree（语法树）** 具有如下特征：

- 输入中的每一个 **token** 对应树中的一个 **叶子节点**

- 解析过程中每使用一条 **文法规则** 进行归约，就对应树中的一个 **内部节点**

这种树被称为 **具体语法树（concrete parse tree）**，它完整地反映了源语言的具体语法结构。

!!! example "Concrete Parse Tree 示例"
    对于文法：
    
    \begin{aligned}
    E &\to E + T \mid T \\
    T &\to T * F \mid F \\
    F &\to n \mid (E)
    \end{aligned}

    表达式 `2 + (3 * 4)` 对应的具体语法树为：
    ```
            E
           /|\
          E  +  T
          |     |
          T     F
          |    /|\
          F   ( E )
          |    /|\
          2   E  *  E
              |     |
              T     T
              |     |
              F     F
              |     |
              3     4
    ```

!!! warning "Concrete Parse Tree 的不足"
    具体语法树直接使用是不方便的，主要有两个问题：

    1. **冗余和无用的 token**：括号 `(`、`)` 等符号对于后续的语义分析阶段毫无意义，但在语法树中它们都占据了节点位置。

    2. **内存占用过度依赖文法形式**：文法规则的写法不同（比如是否消除左递归、是否拆分非终结符层级），会直接改变语法树的形状和大小。文法一旦变化，整棵树也跟着变。

---

### Abstract Syntax Tree（抽象语法树）

为了解决具体语法树的上述问题，我们需要引入**抽象语法（abstract syntax）**。

- Parser 使用**具体语法**进行解析，然后为**抽象语法**构建出一棵语法树——即 **抽象语法树（Abstract Syntax Tree, AST）**

!!! example "从 Concrete 到 Abstract"

    === "Concrete Syntax（具体语法）"

        ```
        E -> E + T
           | T
        T -> T * F
           | F
        F -> n | ( E )
        ```

    === "Abstract Syntax（抽象语法）"

        ```
        E -> n
           | E + E
           | E * E
        ```

    === "Abstract Syntax Tree"

        表达式 `2 + (3 * 4)` 对应的 AST：
        ```
            +
           / \
          2   *
             / \
            3   4
        ```
        相较于具体语法树，AST 极其精简：每个内部节点就是一个运算符，叶子节点就是操作数，括号完全被树的结构本身所取代。

