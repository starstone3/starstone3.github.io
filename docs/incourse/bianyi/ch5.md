---
comments: true
---

# 第五章:语义分析

语义分析包括三件事:

- 把变量声明与使用联系起来,也就是不允许使用未声明的变量

- 检查表达式的类型,比如不允许把一个整数和一个字符串相加

- 把抽象语法树转换成中间代码,也就是把语法树翻译成一种更接近机器语言的表示形式



## Symbol Table

符号表(Symbol Table),也常叫环境(environment),是维护的一张“名字到语义信息”的映射表。

在实验中,Symbol Table的类型我设置为了`vector<unordered_map<string, Type>>`,也就是一个栈结构,每个栈帧是一个哈希表,把标识符映射到它的属性。

属性最常见的是:

- 类型(type)

- 作用域(scope)

- 存储位置或偏移(location)

语义分析里,编译器主要做两件和符号表直接相关的事:

- 遇到声明时,把新名字加入当前符号表

- 遇到使用时,去当前符号表里查这个名字是否存在,以及它的类型是什么

可以把一个环境记成 $\sigma$,其中每个绑定(binding)写成:

$$
x \mapsto \text{type}
$$

例如:

$$
\sigma_0 = \{ g \mapsto string,\ a \mapsto int \}
$$

表示在初始环境 $\sigma_0$ 中,`g` 的类型是 `string`,`a` 的类型是 `int`。


!!! example "符号表的变化"

    ```text
    function f(a:int, b:int, c:int) =
    (
        print_int(a + c);
        let var j := a + b
            var a := "hello"
        in
            print(a);
            print_int(j)
        end;
        print_int(b)
    )
    ```


    1. 进入函数 `f` 后,形参进入当前环境:

        $$
        \sigma_1 = \sigma_0 + \{ a \mapsto int,\ b \mapsto int,\ c \mapsto int \}
        $$

        这说明函数参数 `a`,`b`,`c` 在函数体内都可见,并且类型都是 `int`。

    2. 处理 `let var j := a + b` 时,由于 `a + b` 的结果是 `int`,所以把 `j` 加入环境:

        $$
        \sigma_2 = \sigma_1 + \{ j \mapsto int \}
        $$

        因此后面 `print_int(j)` 是合法的,编译器知道 `j` 的类型是 `int`。

    3. 处理 `var a := "hello"` 时,在更内层作用域重新声明了一个新的 `a`:

        $$
        \sigma_3 = \sigma_2 + \{ a \mapsto string \}
        $$

        这个新的 `a` 会遮蔽(shadow) 外层原来的 `a \mapsto int`。

        在 $\sigma_2$ 中,`a` 绑定的是:

        $$
        a \mapsto int
        $$

        但第 4 行执行声明后,到了 $\sigma_3$ 中,`a` 的绑定变成:

        $$
        a \mapsto string
        $$

        所以在 `in print(a)` 里,这里的 `a` 不再是函数参数里的整数 `a`,而是内层新声明的字符串 `a`。

!!! info "符号表实现"

    符号表的实现大体可以分成两种思路:函数式风格(functional style)和命令式风格(imperative style)。

### 函数式风格

- 插入一个新绑定时,不直接修改原来的表,而是基于旧环境构造一个新环境

前面的记号就是函数式风格:

$$
\sigma_2 = \sigma_1 + \{ j \mapsto int \}
$$

它的含义是“从 $\sigma_1$ 派生出一个新的 $\sigma_2$”。

再比如:

$$
\sigma_3 = \sigma_2 + \{ a \mapsto string \}
$$

表示在新环境里加入一个新的绑定,从而遮蔽旧的 `a \mapsto int`。  
因此,查找标识符时,总是优先看最新这一层的绑定。

!!! tip "用树实现函数式风格"

    如果函数式符号表直接用哈希表实现,每次“插入后生成新表”都会遇到一个问题:为了保持旧表不变,看起来像是要复制整张表,代价太大。

    更高效的做法是用二叉搜索树来表示映射,并采用路径复制(path copying)。

    基本思想是:

    - 查找时,像普通二叉搜索树一样按关键字比较向下走
    - 插入时,不修改旧树,只复制从根到插入位置这一条路径上的节点
    - 没有落在这条路径上的子树全部共享

    如果这棵树是平衡的,那么:

    - 查找复杂度是 $O(\log n)$
    - 插入时需要复制的节点数也是 $O(\log n)$

### 命令式风格

命令式风格通常直接在原地修改。

典型是:

- 维护一张全局可变符号表
- 符号表的每个名字都对应一个绑定栈
- 同时再维护一个变量栈,记录当前作用域里新声明了哪些变量

也就是说,命令式风格的重点在于:

- 声明时直接修改原来的符号表

- 退出作用域时再把这些修改撤销

底层实现通常还是哈希表:

- 哈希表按名字找到对应条目
- 每个哈希表条目维护一个绑定栈
- 绑定栈的栈顶就是当前作用域下可见的那个绑定

此外,还需要一个变量栈来支持作用域回滚。  
常见做法是:每次进入新作用域时,先在变量栈里压入一个特殊标记;在这个作用域中每声明一个变量,就把变量名压栈;退出作用域时,一直弹到这个标记为止,并同步撤销符号表里的对应绑定。

例如,外层原本有:

```text
a -> [int]
b -> [int]
```

进入内层作用域后声明:

```text
var j := a + b
var a := "hello"
```

那么全局符号表会被原地改成:

```text
a -> [string, int]
b -> [int]
j -> [int]
```

其中:

- `a -> [string, int]` 表示最新绑定是 `string`,它遮蔽了外层的 `int`
- `j -> [int]` 表示当前作用域新引入了 `j`

与此同时,变量栈会记录这个作用域里新增过的名字,例如:

```text
[j, a]
```

退出作用域时,只需要按变量栈把这些绑定弹出:

- 弹出 `a` 的栈顶,恢复成 `a -> [int]`

- 弹出 `j` 的栈顶,`j` 消失

于是符号表回到外层状态:

```text
a -> [int]
b -> [int]
```

这种实现的优点是:

- 查找只需要看当前名字绑定栈的栈顶
- 新声明时直接原地更新,实现很自然
- 哈希表按名字定位很快
- 退出作用域时不需要扫描整个符号表,只需要处理当前作用域变量栈里记录的那些名字

### Symbol

!!! info "Symbol"

    在实现符号表时,通常不会直接把字符串本身当作键来反复比较,而是先把每个字符串转换成一个 `Symbol`。

    这里的 `Symbol` 不是“绑定记录”,而是“标识符名字的唯一内部表示”。也就是说,源程序里出现的 `"a"`、`"count"`、`"print_int"` 这些字符串,都会先被送进 `Symbol` 模块,转换成内部符号对象。

=== "Why Symbol"

    直接用字符串作为键有几个问题:

    - 字符串比较要逐字符比较,成本比整数比较高

    - 字符串哈希虽然快,但每次仍然要读取字符串内容

    - 在搜索树里做大小比较时,字符串字典序比较也比较贵

    因此编译器通常会做一次字符串驻留:

    - 每个不同的字符串只存一份

    - 相同字符串总是映射到同一个 `Symbol`

    - 后续传递和比较的就不再是原始字符串,而是这个 `Symbol`,也就是一个指针的地址,可以当作整数

    例如:

    ```text
    "a"      -> Symbol(17)
    "count"  -> Symbol(42)
    "a"      -> Symbol(17)
    ```

    这里两个 `"a"` 会得到同一个 `Symbol`。

=== "Symbol 的性质"

    `Symbol` 模块通常希望满足下面几个性质:

    1. 抽取整数哈希键非常快  
       可以直接把 `Symbol` 的内部指针或编号当作整数键使用。

    2. 判断相等非常快  
       比较两个标识符是否相同时,只要比较指针或整数编号是否相同,不必逐字符比较字符串。

    3. 做大小比较也很快  
       如果符号表底层用二叉搜索树,可以直接比较 `Symbol` 的编号大小,而不是比较整个字符串。

=== "Symbol 和符号表"

    Symbol实际上就是一种数据结构,例如,实验中:

    ```cpp
    class Symbol {
        public:
        /// @brief The name of the symbol
        std::string name;
        /// @brief The unique name of the symbol
        std::string unique_name;
        /// @brief The type of the symbol
        TypePtr type;
        };
    ```

    通常 `Symbol` 模块内部会同时维护两部分信息:

    - 从字符串到 `Symbol` 的映射,可以通过一个额外的`Symbol_Table`来实现

    - 从 `Symbol` 到原始字符串的映射

    一旦有了 `Symbol`,符号表里的键就不再是 `string`,而是 `Symbol`:

    $$
    \text{Symbol} \mapsto \text{Type}
    $$

    例如原来写成:

    $$
    \{ a \mapsto int,\ b \mapsto string \}
    $$

    在实现层面更接近:

    $$
    \{ s_{17} \mapsto int,\ s_{23} \mapsto string \}
    $$

## 表达式检查

> 上面讲的符号表主要是为了处理变量绑定,但编译器还需要检查表达式的类型,例如不允许把一个整数和一个字符串相加。

### Type-checking Expressions

表达式检查实际上是一个递归的过程,例如对于 `a + b` 这个表达式,编译器会先检查 `a` 和 `b` 的类型,如果它们都是 `int`,那么 `a + b` 的类型也是 `int`;如果其中一个是 `string`,另一个是 `int`,就会报错。

!!! example "语义分析中的类型检查"

   我们看一个二元表达式的例子

    ```c
    struct expty transExp(S_table venv, S_table tenv, A_exp a) {
        switch (a->kind) {
            ...
            case A_opExp: {
                A_oper oper = a->u.op.oper;
                struct expty left = transExp(venv, tenv, a->u.op.left);
                struct expty right = transExp(venv, tenv, a->u.op.right);
                if (oper == A_plusOp) {
                    if (left.ty->kind != Ty_int)
                        EM_error(a->u.op.left->pos, "integer required");
                    if (right.ty->kind != Ty_int)
                        EM_error(a->u.op.right->pos, "integer required");
                    return expTy(NULL, Ty_Int());
                }
                ...
            }
        }
        assert(0); /* should have returned from some clause of the switch */
    }
    ```

    这个例子说明:

    - `transExp` 会递归分析左右子表达式,先得到它们的类型

    - 如果当前运算符是 `+`,那么左右两边都必须是 `int`

    - 只要有一边不是 `int`,就报错 `"integer required"`

    - 如果检查通过,那么整个 `a + b` 表达式的结果类型就是 `int`

### Type-checking Declarations

先解释两个名次

- `venv`:就是之前讲的符号表,可以理解为知道变量名,就可以查到它的类型

- `tenv`:是类型环境(type environment),它维护了类型名到类型定义的映射,这是因为可能出现用户自定义类型的情况,比如

    ```c
    type myint = int
    var x: myint := 42
    ```

    在这个例子里,`myint` 是一个类型别名(alias),它指向 `int`。因此,当编译器看到 `var x: myint`,需要在 `tenv` 里查到 `myint` 的定义,才能知道 `x` 的类型是 `int`。

在Tiger语法中,声明是使用 `let ... in ... end` 这种结构来引入的,例如:

```c
let
    var x := 10
    type myint = int
in
    print_int(x);
end
```

其底层代码如下:

```c
case A_letExp: {
    struct expty exp;
    A_declList d;
    S_beginScope(venv);
    S_beginScope(tenv);
    for (d = a->u.let.decs; d; d = d->tail)
        transDec(venv, tenv, d->head);
    exp = transExp(venv, tenv, a->u.let.body);
    S_endScope(tenv);
    S_endScope(venv);
    return exp;
}
```

其中:

- `transExp`就是之前讲的递归分析表达式的函数

- `transDec`是分析声明的函数,它会根据声明的类型(变量声明、类型声明、函数声明)来处理

!!! info "各种声明"

    === "var x := exp"

        这是一个没有类型约束的变量声明,编译器会分析 `exp` 的类型,然后把 `x` 和这个类型绑定在符号表里。

        ```c
        void transDec(S_table venv, S_table tenv, A_dec d) {
            switch (d->kind) {
                case A_varDec: {
                    struct expty e = transExp(venv, tenv, d->u.var.init);
                    S_enter(venv, d->u.var.var, E_VarEntry(e.ty));
                }
                ...
            }
            ...
        }
        ```

    === "var x : type-id := exp"

        在这里,我们要:

        - 检查声明类型和初始化表达式类型是否兼容。
        
        - 如果初始化表达式是 Ty_Nil，那么约束类型必须是 Ty_Record。

    === "type name = ty"

        这一块讲的是类型声明怎么做语义分析。

        Tiger 里的类型声明长这样:

        ```c
        tydec -> type type-id = ty
        ty -> type-id
        | { tyfields }
        | array of type-id
        tyfields -> ε
                | id:type-id {, id:type-id}
        ```

        也就是:

        ```tig
        type 名字 = 某个类型表达式
        ```

        右边这个 `ty` 可以是三种东西:

        - 一个已有类型名,比如 `int`

        - 一个 record,比如 `{a:int, b:string}`

        - 一个数组类型,比如 `array of int`

        如果不是递归类型.也就是一个类型定义右边是一个直接有的类型

        - 先看右边是什么类型

        - 再把左边这个名字放进 `tenv`

        ```c
        void transDec(S_table venv, S_table tenv, A_dec d) { 
            ...
            case A_typeDec: { 
                S_enter(tenv, d->u.type->head->name, transTy(d->u.type->head->ty)); 
            }
            ...
        }
        ```

        那么递归呢?

        ```tig
        type list = {first: int, rest: list}
        ```

        它就是链表结点:

        - `first` 存当前元素

        - `rest` 指向下一个结点,类型还是 `list`

        问题是,如果我们直接去翻译右边的 `{first:int, rest:list}`,那么处理到 `rest:list` 的时候,编译器得先去 `tenv` 里查 `list`。  

        可这时候左边这个 `list` 还没放进环境里,于是就会报“未定义类型”。

        所以对于递归类型,我们这样做:

        1. 先把这一组类型名全部放进 `tenv`,但先不填具体内容

        2. 再分别翻译右边的类型表达式,并把结果回填进去

        第一步一般写成:

        ```c
        S_enter(tenv, name, Ty_Name(name, NULL));
        ```

        这样后面再翻译右边的 record 时,里面再遇到 `list`,就已经能查到了。

        等右边真的翻译完,再把结果填回去,也就是把它变成:

        ```text
        Ty_Name(list, Ty_Record(...))
        ```

        但还要注意一点:不是所有递归类型都合法。

        这里最重要的规则是:

        - 互相递归的类型定义里,任何一个环都必须经过 `record` 或 `array`

        先看一个非法的:

        ```tig
        type a = b
        type b = a
        ```

        这个东西本质上只是别名来回绕:

        ```text
        a -> b -> a -> b -> ...
        ```

        中间没有经过真正的数据结构,所以会无限循环。

        但下面这个是合法的:

        ```tig
        type a = b
        type b = {i: a}
        ```

        因为这个环经过了 `record`。  

    === "function f(a:ta, b:tb) : rt = body"

        ```tig
        function f(a: ta, b: tb) : rt = body
        ```

        含义如下:

        - 函数名是 `f`

        - 参数是 `a, b`

        - 参数类型分别是 `ta, tb`

        - 返回类型是 `rt`

        - 函数体是 `body`

        代码如下,先查各个形参的类型,形成函数的定义,再去检查函数体.

        ```c
        A_fundec f = d->u.function->head;
        Ty_ty resultTy = S_look(tenv, f->result);
        Ty_tyList formalTys = makeFormalTyList(tenv, f->params);
        S_enter(venv, f->name, E_FunEntry(formalTys, resultTy));

        S_beginScope(venv);
        for (...)
            S_enter(venv, paramName, E_VarEntry(paramType));

        transExp(venv, tenv, f->body);
        S_endScope(venv);
        ```

        这里最关键的一句是:

        ```c
        S_enter(venv, f->name, E_FunEntry(formalTys, resultTy));
        ```

        这句一定要放在检查函数体之前,因为如果函数体里递归调用了自己,那得先让环境里能查到 `f`。


        另外,函数定义也存在递归的问题,例如:

        ```tig
        f calls g, g calls f
        ```

        因此,我们需要先把所有函数定义扫进环境里,再去检查函数体,这样才能保证互相递归的函数都能查到对方的定义。