---
comments: true
---

# Template

## Overloading

对于一个函数，如果它可能要接受多种参数，进行函数重载:

```cpp

void print(int i) {
    cout << i << endl;
}

void print(double d) {
    cout << d << endl;
}
```


这样，根据传入的参数不同，编译器就会去调用不同的函数。

但是，函数重载存在着隐式转换，例如，如果我们调用`print('a')`,那么因为`char`可以隐式转换为`int`，所以编译器会调用`print(int)`。

## 默认参数

在函数的参数列表中，可以给参数设置默认值，这样如果不给函数传这些参数，编译器会使用默认值。

```cpp
int harpo(int n, int m = 4, int j = 5);
```

如果我们调用`harpo(1)`，那么`m`和`j`会分别被赋值为4和5。

要注意的点:

- 默认值必须从右往左设置:
    ```cpp
    int harpo(int n, int m = 4, int j); // 错误
    ```

## Function Template

为什么需要函数重载？

假设你的函数可能接受多种参数，但其实，对于每种参数都进行同样的行为，那么函数重载就可以避免重复编程。

典型的例子:

- `vector`的`push_back`函数，接受不同类型的参数。

- `sort`函数，接受不同类型的参数。

```cpp
template < class T >
void swap( T& x, T& y ) {
    T temp = x;
    x = y;
    y = temp;
}
```

这是函数模板的一个典型例子

- `class`关键字声明后面的变量是一个类型名，`T`是一个类型参数。

- 但实际上，`class`也可以用`typename`来代替，这两者没有任何区别。一开始人们用的是`type`，但发现这样容易引起混淆，所以引入了`typename`。


这样，我们就可以对任何适合的变量作交换了:

```cpp
int i = 3; int j = 4;
swap(i, j); // use explicit int swap
float k = 4.5; float m = 3.7;
swap(k, m); // instantiate float swap
std::string s("Hello");std::string t("World");
swap(s, t); // instantiate std::string swap
```

实际上，编译器对于函数模板的行为是

1. 编译阶段
    - 当编译器遇到函数模板定义时，它并不会立即生成代码，而是：

    - 检查模板语法是否正确
    
    - 验证模板内的代码在不指定具体类型时是否合法
    
    - 将模板定义存储起来，等待后续使用

2. 模板实例化
    - 当代码中使用了函数模板时，编译器会执行以下操作：

    - 模板参数推导：根据函数调用的实参类型，推导出模板参数T的具体类型
        ```cpp
        swap(i, j); // 从i和j的类型int推导出T为int
        ```
    
    - 模板特化生成：为每个不同的类型参数生成一个具体的函数实例
        ```cpp
        // 编译器实际生成类似这样的代码
        void swap<int>(int& x, int& y) { 
            int temp = x; 
            x = y; 
            y = temp; 
        }

        void swap<float>(float& x, float& y) {
            float temp = x;
            x = y;
            y = temp;
        }
        ```

3. 编译时检查
    - 编译器会检查生成的特化函数是否能够正确编译

    - 如果模板中使用了某些在特定类型下不支持的操作(如对没有实现=运算符的类型进行赋值)，会在这一步报错

    - 只有被实际调用的特化版本才会被检查和生成代码

A template function is an instantiation of a function template

### Template arguments deduction

在使用函数模板时，编译器必须要清楚`T`是什么，比如，下面的函数会报错:

```cpp
swap(int, double)
```

这是因为编译器不知道参数类型是哪个了，这里禁止隐式转换。

---

模板函数与普通函数是可以并存的。

例如，对于上面这样的`swap`,我们写为

```cpp
swap<int>(int,double)
```
这样,编译器就会生成一个`int`版本的函数,可以作隐式转换了.

### Overloading rules

- First, check for exact regular-function match

- Then, check for exact function-template match

- Last, implicit conversions for regular functions


## Class Template

在开头声明一个类型模板,然后在类里面的许多函数都可以用这个类型模板

比如常用的`vector<int> s`