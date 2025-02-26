---
comments: true
---

# 导论

C屁屁是一种很强大的语言，让我带着初学者的身份开始记这门课的笔记。

## Hello World!

看下面这段简单的C++代码：

```cpp title="Hello World!"

#include<iostream>
usingnamespace std;
int main()
{  
    int age;
    cin >> age;
    cout << "Hello, World! I am " << age << "Today!" << endl;  
    return 0;
}
```

在上面的程序中：

+ `#include<iostream>`：引入了一个头文件，里面包含了输入输出的函数。

+ `using namespace std;`：使用了命名空间，避免了在使用标准库函数时需要加上`std::`前缀。如果没有这行代码，我们在使用`cout`和`cin`时需要加上`std::cout`和`std::cin`。

+ `int main()`：主函数，程序的入口。和C语言一样

+ `cin >> age;`：从标准输入读取一个整数，存储在变量`age`中。`>>`表示向输入流中写入数据。

+ `cout << "Hello, World! I am " << age << "Today!" << endl;`：向标准输出写入一行字符串，`<<`表示向输出流中写入数据。`endl`表示换行。

也可以使用C语言中的printf与scanf函数来输入输出，语法一样，但是需要引入`<cstdio>`头文件。

---

## String库

相比于C语言中使用字符数组来表示字符串，C++中使用`string`类来表示字符串，需要引入`<string>`库。有很多优点，比如可以进行很多本来对字符数组不支持的操作，比如拼接字符串，比较字符串等。

### String的初始化

String有很多初始化的方法

!!! note "String的初始化"
    === "使用`=`赋值"
        ```cpp title="使用`=`赋值"
        string str = "Hello, World!";//str是Hello, World!
        ```
    === "使用`+`拼接"
        ```cpp title="使用`+`拼接"
        string str = "Hello, " + "World!";//str是Hello, World!
        ```
    === "构造函数"
        ```cpp title="构造函数"
        string str("Hello, World!");//str是Hello, World!
        ```
    === "使用部分字符串初始化"
        ```cpp title="使用部分字符串初始化"
        string str("Hello, World!", 1,3);//str是ell,表示从下标1开始的3个字符
        ```
    === "使用重复字符初始化"
        ```cpp title="使用重复字符初始化："
        string str8(5, 'a');  // 创建由5个'a'组成的字符串，结果为"aaaaa"`
        ```
    === "拷贝构造函数"
        ```cpp title="拷贝构造函数"
        string str1 = "Hello, World!";
        string str2(str1);//str2是Hello, World!,等同于str2 = str1;
        ```

### String的连接

正如初始化中写过的,可以使用`+`来连接字符串。此外，`+=`也可以连接字符串。

```cpp title="String的连接"
string str1 = "Hello, ";
string str2 = "World!";
string str3 = str1 + str2;//str3是Hello, World!
string str4 = str1 += str2;//str4是Hello, World!，str1也是Hello, World!
```

### substr

`substr`函数可以截取字符串的一部分，返回一个新的字符串。

```cpp title="substr"
string str = "Hello, World!";
string str1 = str.substr(0, 5);//str1是Hello,表示从下标0开始的5个字符
string str2 = str.substr(7);//str2是World!，表示从下标7开始到结尾的字符
```

---

## 内存申请与释放

在C++中，内存的申请和释放可以使用`new`和`delete`来实现。

```cpp title="内存申请与释放"
int* p = new int;//申请一个int类型的内存
delete p;//释放内存
```

也可以使用`new[]`和`delete[]`来申请和释放数组的内存。

```cpp title="内存申请与释放"

int* p = new int[10];//申请一个int类型的数组

delete[] p;//释放内存
```

---

别的基础操作大抵和C语言一样了，但是C++还有很多不基础的操作，这也是本课程要讲的。