---
comments: true
---

# STL

STL (Standard Template Library) 是C++一个强大的库，提供了许多常用的数据结构和算法。STL的设计理念是将数据结构和算法分离，使得算法可以独立于数据结构进行设计和实现。

## Container

C++ STL提供了多种容器类型，包括：

- **Sequence Containers**：如`vector`、`deque`、`list`等，主要用于存储线性数据。

- **Associative Containers**：如`set`、`map`、`unordered_set`、`unordered_map`等，主要用于存储键值对数据。

- **Container Adapters**：如`stack`、`queue`、`priority_queue`等，主要用于对其他容器进行封装和适配。

### Vector

!!! info
    [cppreference](https://en.cppreference.com/w/cpp/container/vector)

`vector`是一个动态数组，可以在运行时自动调整大小。它支持随机访问，插入和删除操作的时间复杂度为O(n)。

#### 初始化

```cpp
#include <iostream>
#include <vector>
using namespace std;
int main() {
    vector<int> vec1; // 默认初始化
    vector<int> vec2(10); // 初始化大小为10
    vector<int> vec3(10, 5); // 初始化大小为10，所有元素为5
    vector<int> vec4{1, 2, 3, 4, 5}; // 列表初始化
    return 0;
}
```

Vector的使用需要引入`<vector>`头文件。

`vector<type>name`表示定义一个类型为`type`的vector，`name`为变量名，`type`可以为：

- `int`：整型
- `char`：字符型
- `float`：单精度浮点型
- `double`：双精度浮点型
- `string`：字符串型
- `bool`：布尔型
- `class`：类类型
- `struct`：结构体类型
- `vector`：vector类型,像多维数组

#### 访问元素

可以通过以下多种方式访问元素:

- 使用下标运算符`[]`：`vec[i]`
- 使用`at()`方法：`vec.at(i)`
- 使用`front()`方法：`vec.front()`,访问第一个元素
- 使用`back()`方法：`vec.back()`,访问最后一个元素

#### Iterators

迭代器是STL中用于遍历容器的对象。`vector`提供了多种迭代器类型，包括：

- `begin()`：返回指向第一个元素的迭代器

- `end()`：返回指向最后一个元素后一个位置的迭代器

- `rbegin()`：返回指向最后一个元素的反向迭代器

- `rend()`：返回指向第一个元素前一个位置的反向迭代器

- `cbegin()`：返回指向第一个元素的常量迭代器,常量迭代器不可修改元素

- `cend()`：返回指向最后一个元素后一个位置的常量迭代器

!!! tips "遍历一个vector的方法"
    **下面的方法对于大部分容器都适用**
    === "传统派"
        ```cpp
        for (int i = 0; i < vec.size(); i++) {
            cout << vec[i] << " ";
        }
        ```
    === "范围for循环,C++11"
        ```cpp  
        for (const auto& elem : vec) {
            cout << elem << " ";
        }
        ```
    === "vector<type>::iterator"
        ```cpp
        for (vector<int>::iterator it = vec.begin(); it != vec.end(); ++it) {
            cout << *it << " ";
        }
        ```

#### Capacity

`vector`的容量是指它在不重新分配内存的情况下可以容纳的元素数量。可以使用以下方法获取和修改容量：

- `size()`：返回当前元素数量

- `capacity()`：返回当前容量

- `resize(n)`：调整大小为`n`

- `reserve(n)`：预留容量为`n`

- `clear()`：清空容器

- `empty()`：检查容器是否为空,返回布尔值

#### Modifiers

最最最重要的部分,如何修改一个vector里的元素

- `push_back(value)`：在末尾添加元素

- `pop_back()`：删除末尾元素    

- `insert(position, value)`：在指定位置插入元素

- `erase(position)`：删除指定位置的元素,返回指向下一个元素的迭代器

- `push_front(value)`：在开头添加元素

- `pop_front()`：删除开头元素

- `assign(n, value)`：将容器的大小调整为`n`，并用`value`填充

- `swap(other)`：交换两个容器的内容,`other`为另一个容器

- `emplace_back(value)`：在末尾添加元素,与`push_back`类似,但更高效

- `emplace(position, value)`：在指定位置插入元素,与`insert`类似,但更高效

#### 一些思考

vector的元素类型实际上还可以是引用类型或者指针,但是这样好像没怎么见过,因为引用类型和指针本身就可以直接使用了,而且引用类型和指针的内存管理比较麻烦,容易出现内存泄漏的问题.

### List

!!! info
    [cppreference](https://en.cppreference.com/w/cpp/container/list)

`list`是一个双向链表，支持在任意位置插入和删除元素。它不支持随机访问，插入和删除操作的时间复杂度为O(1)。

#### 初始化

```cpp
#include <iostream>
#include <list>
using namespace std;
int main() {
    list<int> lst1; // 默认初始化
    list<int> lst2(10); // 初始化大小为10
    list<int> lst3(10, 5); // 初始化大小为10，所有元素为5
    list<int> lst4{1, 2, 3, 4, 5}; // 列表初始化
    return 0;
}
```
List的使用需要引入`<list>`头文件。
List的初始化与vector类似,但不支持`vector`的`reserve`方法

#### 访问元素

可以通过以下多种方式访问元素:

- 使用`front()`方法：`lst.front()`,访问第一个元素
- 使用`back()`方法：`lst.back()`,访问最后一个元素
- 使用迭代器：`auto it = lst.begin(); cout << *it;`
- 使用范围for循环：`for (const auto& elem : lst) { cout << elem; }`

#### Iterators

`list`提供了多种迭代器类型，包括但不限于：

- `begin()`：返回指向第一个元素的迭代器

- `end()`：返回指向最后一个元素后一个位置的迭代器

- `rbegin()`：返回指向最后一个元素的反向迭代器

- `rend()`：返回指向第一个元素前一个位置的反向迭代器

#### Capacity

- `size()`：返回当前元素数量

- `empty()`：检查容器是否为空,返回布尔值

#### Modifiers

- `push_back(value)`：在末尾添加元素


- `push_front(value)`：在开头添加元素


- `pop_back()`：删除末尾元素


- `pop_front()`：删除开头元素


- `insert(position, value)`：在指定位置插入元素

- `erase(position)`：删除指定位置的元素

### Map

!!! info
    [cppreference](https://en.cppreference.com/w/cpp/container/map)

学过高中技术的感觉和Python的字典很像.

`map`是一个关联容器，用于存储键值对数据。它支持根据键快速查找值。`map`的底层实现通常是红黑树，因此插入、删除和查找操作的时间复杂度为O(log n)。


### 初始化

```cpp
#include <iostream>
#include <map>
using namespace std;
int main() {
    map<int, string> m1; // 默认初始化
    map<int, string> m2{{1, "one"}, {2, "two"}, {3, "three"}}; // 列表初始化
    return 0;
}
```

Map的使用需要引入`<map>`头文件。

Map的定义为`map<key_type, value_type> name`，表示定义一个键类型为`key_type`，值类型为`value_type`的map，`name`为变量名.

#### 访问元素

可以通过以下多种方式访问元素:

- 使用下标运算符`[]`：`m[key]`

- 使用`at()`方法：`m.at(key)`

- 使用`find()`方法：`m.find(key)`，返回一个迭代器，指向键为`key`的元素

- 使用`count()`方法：`m.count(key)`，返回键为`key`的元素数量

- `contains(key)`：检查容器是否包含键为`key`的元素,返回布尔值

#### Iterators

`map`提供了多种迭代器类型，包括但不限于：

- `begin()`：返回指向第一个元素的迭代器

- `end()`：返回指向最后一个元素后一个位置的迭代器

- `rbegin()`：返回指向最后一个元素的反向迭代器

- `rend()`：返回指向第一个元素前一个位置的反向迭代器

#### Capacity

- `size()`：返回当前元素数量

- `empty()`：检查容器是否为空,返回布尔值

#### Modifiers

- `insert(pair)`：插入一个键值对

- `erase(key)`：删除键为`key`的元素

- `clear()`：清空容器

- `swap(other)`：交换两个容器的内容,`other`为另一个容器

- `emplace(key, value)`：插入一个键值对,与`insert`类似,但更高效


## Algorithm

C++ STL有许多有用的算法,在使用时需要引入`<algorithm>`头文件.

下面看一些非常常用的.

### Sort

!!! info
    [cppreference](https://en.cppreference.com/w/cpp/algorithm/sort)

`sort`是一个用于排序的算法。它可以对容器中的元素进行升序或降序排序。默认情况下，`sort`使用`<`运算符进行升序排序。

#### 使用方法

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    vector<int> vec = {5, 2, 9, 1, 5, 6};
    sort(vec.begin(), vec.end()); // 升序排序
    for (const auto& elem : vec) {
        cout << elem << " ";
    }
    return 0;
}
```

#### 自定义排序

可以通过传递一个比较函数或函数对象来自定义排序顺序。

当排序函数返回`true`时，表示第一个参数应该排在第二个参数之前。

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
bool customCompare(int a, int b) {
    return a > b; // 降序排序
}
int main() {
    vector<int> vec = {5, 2, 9, 1, 5, 6};
    sort(vec.begin(), vec.end(), customCompare);
    for (const auto& elem : vec) {
        cout << elem << " ";
    }
    return 0;
}
```

### Find

!!! info
    [cppreference](https://en.cppreference.com/w/cpp/algorithm/find)

`find`是一个用于查找元素的算法。它可以在容器中查找第一个满足条件的元素。

#### 使用方法

```cpp

#include <iostream>

#include <vector>

#include <algorithm>

using namespace std;
int main() {
    vector<int> vec = {5, 2, 9, 1, 5, 6};
    auto it = find(vec.begin(), vec.end(), 5); // 查找值为5的元素
    if (it != vec.end()) {
        cout << "Found: " << *it << endl;
    } else {
        cout << "Not found" << endl;
    }
    return 0;
}
```

### Count

!!! info
    [cppreference](https://en.cppreference.com/w/cpp/algorithm/count)

`count`是一个用于计数元素的算法。它可以在容器中计数满足条件的元素数量。

#### 使用方法

```cpp

#include <iostream>

#include <vector>

#include <algorithm>

using namespace std;

int main() {
    vector<int> vec = {5, 2, 9, 1, 5, 6};
    int count = std::count(vec.begin(), vec.end(), 5); // 计数值为5的元素数量
    cout << "Count: " << count << endl;
    return 0;
}
```

### fill
!!! info
    [cppreference](https://en.cppreference.com/w/cpp/algorithm/fill)

`fill`是一个用于填充容器的算法。它可以将容器中的所有元素设置为指定的值。

它的基本使用方法如下：

```cpp

#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    vector<int> vec(5); // 初始化大小为5的vector
    fill(vec.begin(), vec.end(), 10); // 将所有元素设置为10
    for (const auto& elem : vec) {
        cout << elem << " ";
    }
    return 0;
}
```
