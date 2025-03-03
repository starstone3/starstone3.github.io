---
comments: true
---

# SQL语言介绍

## SQL的历史

SQL（Structured Query Language）是一种用于管理关系型数据库的标准语言。它的历史可以追溯到20世纪70年代，最初由IBM的研究人员开发。

SQL历史的一些重要里程碑：

- **1970年**：Edgar F. Codd提出了关系模型的概念，并在其论文中描述了如何使用关系代数来操作数据。

- **1974年**：IBM的研究人员开始开发SEQUEL（Structured English Query Language），这是SQL的前身。

- **1979年**：Oracle发布了第一个商业SQL数据库。

- **1986年**：ANSI（美国国家标准协会）发布了SQL的第一个标准，称为SQL-86。

- **1992年**：SQL-92标准发布，增加了许多新特性。

- **1999年**：SQL:1999标准发布，引入了对象关系数据库的概念。

- **2003年**：SQL:2003标准发布，增加了XML支持和其他新特性。

- **2006年**：SQL:2006标准发布，增加了对XML数据类型的支持。

---

## SQL的DDL

DDL（Data Definition Language）是SQL的一个子集，用于定义和管理数据库的结构。DDL语句用于创建、修改和删除数据库对象，如表、索引和视图。其定义的对象包括：

1. The Schema for each relation(各种关系的模式)

2. The domain of values associated with each attribute(与每个属性相关的值域)

3. Integrity constraints(完整性约束)

4. The physical storage structure for each relation(每个关系的物理存储结构)

5. The set of indices to be maintained for each relations(为每个关系维护的索引集)

6. Security and authorization information for each relation(每个关系的安全性和授权信息)

---

### Domain Types(域类型)

SQL支持多种数据类型，包括：

1. char(n) - 定长字符串，n为长度

2. varchar(n) - 变长字符串，n为最大长度

3. int - 整数

4. smallint - 小整数

5. numeric(p,s) - 精确数字，p为总位数，s为小数位数

6. real,double precision - 浮点数,real相当于float(7),double相当于float(15)

7. float(p) - 浮点数，p为精度,即小数位数

---

### Built-in Types(内置类型)

所谓内置类型，即是SQL标准中定义的类型。SQL标准定义了以下几种内置类型：

1. date - 日期,包括四位数年份、两位数月份和两位数日期，如'1999-12-31'

2. time - 时间,包括小时、分钟和秒，如'12:30:00'

3. timestamp - 时间戳,包括日期和时间，如'1999-12-31 12:30:00'

4. interval - 时间间隔
   示例：interval '1' day
   从一个日期/时间/时间戳值中减去另一个得到时间间隔值
   时间间隔值可以添加到日期/时间/时间戳值


#### 日期时间函数

SQL提供了多种日期和时间处理函数：

1. current_date() - 返回当前日期

2. current_time() - 返回当前时间

3. year(x), month(x), day(x) - 提取日期的年、月、日部分

4. hour(x), minute(x), second(x) - 提取时间的时、分、秒部分


---

### Creating Tables(创建表)

使用CREATE TABLE语句创建表,其基本格式为：

``` sql
create table r (A1 D1, A2 D2, ..., An Dn,
        (integrity-constraint1),
        ...,
        (integrity-constraintk))
```

其中：

- r是表名

- Ai是属性名

- Di是属性的数据类型

- integrity-constraint是完整性约束

!!! example "🌰"
    === "🌰1"
        ``` sql
        create table student (
            sno char(8),
            sname varchar(20) not null,
            sage int,
            tuition numeric(7,2),
            dept char(4),
            primary key(sno)
            foreign key(dept) references department(deptid)
            check(sage>0 and sage<100)
        )
        ```
    === "🌰2"
        ``` sql
        create table student (
            ID          varchar(5),
            name        varchar(20) not null,
            dept_name   varchar(20),
            tot_cred    numeric(3,0) default 0,
            primary key (ID),
            foreign key (dept_name) references department
        );
        ```
    === "🌰3"
        ``` sql
        create table takes (
            ID          varchar(5),
            course_id   varchar(8),
            sec_id      varchar(8),
            semester    varchar(6),
            year        numeric(4,0),
            grade       varchar(2),
            primary key (ID, course_id, sec_id, semester, year),
            foreign key (ID) references student,
            foreign key (course_id, sec_id, semester, year) references section
        );
        ```

!!! note "foreign key约束说明"
    - foreign key约束用于定义外键约束，确保引用的表中的值存在。

    - foreign key约束的语法为：foreign key (列名) references 其他表名(列名)

    当被引用的表中的值不存在时，插入或更新操作将失败。

    对于delete和update操作，SQL标准允许以下几种行为：

    - no action：不执行任何操作，默认行为。

    - restrict：不执行任何操作，类似于no action。

    - cascade：级联删除或更新操作。

    - set null：将外键列设置为NULL。

    - set default：将外键列设置为默认值。

    - set null和set default只能在外键列允许NULL或有默认值时使用。

---

### Drop Table(删除表)& Delete Table(删除表中数据)

使用DROP TABLE语句删除表，其基本格式为：

``` sql
drop table r
```
这样会删除表r及其所有数据和结构。

使用DELETE语句删除表中数据，其基本格式为：

``` sql
delete from r
```
这样会删除表r中的所有数据，但保留表结构。

---

### Alter Table(修改表)

表结构的修改包括增加、删除和修改列等。使用ALTER TABLE语句修改表，包括：

!!! note "alter table操作"
    === "增加列"
        ``` sql title="增加列"
        alter table r add column a d
        ```
    === "删除列"
        ``` sql title="删除列"
        alter table r drop column a
        ```
    === "修改列"
        ``` sql title="修改列"
        alter table r alter column a d
        ```
    === "增加约束"
        ``` sql title="增加约束"
        alter table r add constraint c
        ```
    === "删除约束"
        ``` sql title="删除约束"    
        alter table r drop constraint c
        ```

---

## Basic SQL Queries

一个SQL查询语句的基本格式为:
``` sql
select select-list
from table-list
where condition
```

其中：

- select-list是要查询的列，可以使用*表示所有列。

- table-list是要查询的表，可以使用逗号分隔多个表。

- condition是查询条件，可以使用AND、OR、NOT等逻辑运算符。

SQL查询语句的结果是一个关系

### Select Clause(选择子句)

Select语句与第二章中的projection操作相当

例如,SQL语句
``` sql
select name
from student
```
等价于

$$
\pi_{name}(student)
$$

!!! note "SQL中的大小写问题"
    SQL对大小写不敏感,即select和SELECT是一样的
    但是,表名和列名是区分大小写的,即student和STUDENT是不同的


select语句中也有一些keyword可以添加:

1. DISTINCT - 去重,即去掉重复的元组

2. ALL - 保留所有元组,包括重复的元组

select语句也支持算术操作:

```sql
select ID, name, salary/12
from instructor
```

这个语句会返回instructor表中所有教师的ID、姓名和月薪/12

### Where Clause(选择子句)

where子句用于指定查询条件,即选择满足条件的元组

where子句的基本格式为:

``` sql
where condition
```

condition可以是一个布尔表达式,即返回true或false的表达式

where子句支持以下操作:

1. 逻辑运算符: AND、OR、NOT

2. 比较运算符: =、<>、<、<=、>、>=

3. 其他运算符: BETWEEN、IN、LIKE

!!! example "🌰"
    === "🌰1"
        ``` sql
       select name from instructor
       where dept_name = ‘Comp. Sci.'and salary > 80000
        ```
    === "🌰2"
        ``` sql
        select name from instructor
        where salary between 90000 and 100000
        ```
    === "🌰3"
        ``` sql
        select name, course_id
        from instructor, teaches
        where (instructor.ID, dept_name) = (teaches.ID, ’Biology’);
        ```

### From Clause(表名子句)

from子句用于指定查询的表,选择满足条件的元组,相当于关系代数中的笛卡尔乘积

### Natural Join(自然连接)

自然连接是关系代数中的一种操作,用于连接两个表,返回满足条件的元组

自然连接的基本格式为:

``` sql
select select-list
from table1 natural join table2
```

#### 自然连接的问题

自然连接选择了两个表中所有相同属性的值相等的元组,但是相同的属性名并不一定表示相同的属性,在这样的情况下使用自然连接就会出现问题.

对于如下的关系:
course(course_id,title, dept_name,credits)
teaches( ID, course_id,sec_id,semester, year)
instructor(ID,name, dept_name,salary)


给出任务:List the names of instructors along with the  titles of courses that they teach

这里course表中的dept_name表示课程的系名,而instructor表中的dept_name表示教师的系名,这两个属性并不相同,但是它们的名字是一样的,如果我们使用自然连接就会出现问题.

!!! tips "各种语句"
    === "错误使用自然连接"
        ``` sql
        select name, title
        from instructor natural join teaches natural join course
        ```
    === "正确做法1"
        ``` sql
        select name, title
        from instructor, teaches, course
        where instructor.ID = teaches.ID and teaches.course_id = course.course_id
        ```
    === "正确做法2"
        ``` sql
        select name, title
        from instructor natural join teaches, course
        where teaches.course_id = course.course_id
        ```
    === "正确做法3"
        ``` sql
        select name, title
        from (instructor natural join teaches)join course using(course_id);
        ```

### Rename

SQL中使用AS关键字来重命名表或列

``` sql
select ID, name, salary/12 as monthly_salary
from instructor
```

!!! example
    Find the names of all instructors who have a higher salary than  some instructor in ‘Comp. Sci’.
    ``` sql
    select name
    from instructor as T,instructor as S
    where T.salary > S.salary and S.dept_name = ‘Comp. Sci.’
    ```

注意,AS关键字是可选的,即可以省略
``` SQL
select ID, name, salary/12 monthly_salary
from instructor
```

### String Operations

#### like

这里的like感觉和正则表达式有相似之处.

1. % - 匹配任意个字符
    - ‘Intro%’ matches any string beginning with “Intro”.

    - ‘%Comp%’ matches any string containing “Comp” as a substring.

2. _ - 匹配一个字符

    - ‘_ _ _’ matches any string of exactly three characters.

    - ‘_ _ _%’ matches any string of at least three characters.

3. [abc] - 匹配a、b或c

4. [a-z] - 匹配a到z之间的任意字符

5. [^abc] - 匹配不是a、b或c的任意字符

!!! example "🌰"
    ```sql
    select name from instructor where name like '%dar%' 
    ```
    这个语句会返回instructor表中所有姓名中包含"dar"的教师

`like`关键词还可以加上`escape`关键词,用于转义字符

``` sql
select name from instructor where name like '%!%' escape '!'
```
这个语句会返回instructor表中所有姓名中包含"%"的教师


#### 其他操作

SQL也支持其他字符串操作,如:

1. || - 字符串连接

2. length(x) - 返回字符串x的长度

3. 大小写转换
    - upper(x) - 将字符串x转换为大写

    - lower(x) - 将字符串x转换为小写

### 排序

使用order by子句对查询结果进行排序,其基本格式为:

``` sql
select distinct name
from    instructor
order by name asc
```

order by子句支持以下操作:

1. asc - 升序,默认值

2. desc - 降序

3. nulls first - 将NULL值放在前面

### Limit Clause

使用limit子句限制查询结果的数量,其基本格式为:

``` sql
select select-list
from table-list
where condition
order by order-list
limit n
```

其中,n为要返回的元组数量

limit也可以接受两个参数,表示返回的元组的起始位置和数量.

### Duplicates

### Set Operations

SQL中也包括交,并,差等操作,其基本格式为:

``` sql
select select-list
from table-list
where condition
union
select select-list
from table-list
where condition
```

对于交集,我们可以使用`intersect`操作,格式和`union`操作一样

对于差集,我们可以使用`except`操作,格式和`union`操作一样

上面所有的操作都默认去掉重复的元组,如果我们想保留重复的元组,可以使用`all`关键字,变为`union all`、`intersect all`、`except all`.

### NULL Values

在[第二章](./ch2.md/#null-values)已经讲过,SQL中有一个`is null`操作,用于判断一个值是否为NULL

``` sql
select name
from instructor
where salary is null
```

