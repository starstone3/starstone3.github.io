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

类模板在开头声明一个或多个类型参数，然后在类的定义中使用这些类型参数，使得类的成员变量和成员函数可以适用于不同的数据类型。这样，我们只需编写一次类的代码，就能处理多种不同类型的数据。

使用类模板时，我们必须显式指定模板参数类型，而不是让编译器推导类型。
比如常用的`vector<int> s`

```cpp
template <class T>
class Vector {
public:
    Vector(int);
    ~Vector();
    Vector(const Vector&);
    Vector& operator=(const Vector&); T& operator[](int);
private:
    T* m_elements;
    int m_size;
}
```

在成员函数定义时,我们需要在函数名前加上`template <class T>`，以告诉编译器这是一个模板函数。

```cpp
template <class T> 
Vector<T>::Vector(int size) : m_size(size) { 
m_elements = new T[m_size]; 
} 
template <class T> 
T& Vector<T>::operator[](int indx) { 
 if (indx < m_size && indx > 0) { return m_elements[indx]; 
 } else { 
 ... 
 } 
}
```

---

类型参数也可以不止一个，比如

```cpp
template < class Key, class Value >
class HashTable {
    const Value& lookup (const Key&) const;

    void insert (const Key&, const Value&);

    /* ... */
}
```

这样,我们就可以为哈希表的键和值指定不同的类型了.


---

类型参数与非类型参数也可以共存

```cpp
template <class T, int bounds = 100>
class FixedVector {
public:
    FixedVector();
    T& operator[](int);
private:
    T elements[bounds]; // fixed-size array!
}
```

这样,在我们创建`FixedVector`对象时,可以指定一个大小,如果不指定,默认是100.

```cpp
FixedVector<int> v1; // 100 elements
FixedVector<int, 50> v2; // 50 elements
```


## Member templates

类模板的成员函数也可以是模板的,比如

```cpp
template<typename T> 
class complex
{
public:
    template<class X> complex(const complex<X>&);
/* ... */
};
```

这样,可以接受不同类型的参数.

---

## Templates and inheritance

类模板可以继承其他类模板,也可以继承普通类.

```cpp
template <class A>
class Derived : public Base { /* ... */ }

template <class A>
class Derived : public List<A> { /* ... */ }
```

普通类也可以继承实例化后的类模板:

```cpp
class Derived : public List<int> { /* ... */ }
```

## CRTP (Curiously Recurring Template Pattern)

CRTP 是一种 C++ 模板编程技巧，其中一个类将自身作为模板参数传递给其基类。这种模式允许在编译时实现静态多态性，并允许基类访问派生类的成员。

### 模式结构

```cpp
template <typename Derived>
class Base {
public:
    void interface() {
        // 使用 static_cast 将 Base* 转换为 Derived*
        static_cast<Derived*>(this)->implementation();
    }
};

class Derived : public Base<Derived> {
public:
    void implementation() {
        // 派生类的具体实现
    }
};
```


## Morality

Put the definition/declaration for templates in theheader file

应当将模板的定义和声明都放在头文件中

- won't allocate storage for the function/class atthat point

- compiler/linker have mechanisms for removingmultiple definitions


!!! example
    与普通函数和类不同，模板需要在编译时看到完整定义才能实例化。如果模板定义放在源文件中：

    - 编译器在包含头文件的其他源文件中看不到完整定义

    - 无法正确生成特定类型的实例化版本

    - 会导致链接错误（未定义的引用）

    === "正确做法"
        ```cpp title="mathutils.h"
        // 头文件中同时包含声明和定义
        #ifndef MATH_UTILS_H
        #define MATH_UTILS_H

        template <typename T>
        class Calculator {
        public:
            // 函数声明和定义都在头文件中
            T add(T a, T b) {
                return a + b;
            }
            
            T multiply(T a, T b) {
                return a * b;
            }
        };

        // 函数模板也一样
        template <typename T>
        T maximum(T a, T b) {
            return (a > b) ? a : b;
        }

        #endif
        ```

        ```cpp title="main.cpp"        
        #include "mathutils.h"
        #include <iostream>
        
        int main() {
            // 使用int类型实例化模板
            Calculator<int> intCalc;
            std::cout << "2 + 3 = " << intCalc.add(2, 3) << std::endl;
            
            // 使用double类型实例化模板
            Calculator<double> doubleCalc;
            std::cout << "2.5 * 3.0 = " << doubleCalc.multiply(2.5, 3.0) << std::endl;
            
            // 使用函数模板
            std::cout << "Max of 10 and 20: " << maximum(10, 20) << std::endl;
            std::cout << "Max of 3.14 and 2.72: " << maximum(3.14, 2.72) << std::endl;
            
            return 0;
        }
        ```


    === "错误做法"
        ```cpp title="mathutils.h"
            #ifndef MATH_UTILS_H
            #define MATH_UTILS_H
            
            // 只在头文件中包含声明
            template <typename T>
            class Calculator {
            public:
                T add(T a, T b);
                T multiply(T a, T b);
            };
            
            template <typename T>
            T maximum(T a, T b);
            
            #endif
        ```

        ```cpp title="mathutils.cpp"
            #include "mathutils.h"
            
            // 在源文件中包含定义
            template <typename T>
            T Calculator<T>::add(T a, T b) {
                return a + b;
            }
            
            template <typename T>
            T Calculator<T>::multiply(T a, T b) {
                return a * b;
            }
            
            template <typename T>
            T maximum(T a, T b) {
                return (a > b) ? a : b;
            }
        ```

        ```cpp title="main.cpp"
            #include "mathutils.h"
            #include <iostream>
            
            int main() {
                // 这段代码编译会成功，但链接时会失败
                // 因为编译器在这个文件中看不到模板的具体实现
                Calculator<int> intCalc;
                std::cout << "2 + 3 = " << intCalc.add(2, 3) << std::endl;
                
                return 0;
            }
        ```