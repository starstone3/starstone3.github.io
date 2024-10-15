---
comments : true
hide:
    - feedback
---

<script defer src="https://vercount.one/js"></script>

# Instructions: Language of the Machine

!!! info "参考"
    https://xuan-insr.github.io/computer_organization/2_instructions/

## 编译过程

### 机器码

使用`gcc -c xxx.c`命令获得

### 汇编语言

使用`gcc -S xxx.c`命令获得
```asm title="add.s"
.file   "add.c"
        .text
        .globl  add
        .type   add, @function
add:
.LFB0:
        .cfi_startproc
        endbr64
        pushq   %rbp
        .cfi_def_cfa_offset 16
        .cfi_offset 6, -16
        movq    %rsp, %rbp
        .cfi_def_cfa_register 6
        movl    %edi, -4(%rbp)
        movl    %esi, -8(%rbp)
        movl    -4(%rbp), %edx
        movl    -8(%rbp), %eax
        addl    %edx, %eax
        popq    %rbp
        .cfi_def_cfa 7, 8
        ret
        .cfi_endproc
.LFE0:
        .size   add, .-add
        .ident  "GCC: (Ubuntu 13.2.0-23ubuntu4) 13.2.0"
        .section        .note.GNU-stack,"",@progbits
        .section        .note.gnu.property,"a"
        .align 8
        .long   1f - 0f
```
### 高级编程语言

平时写的C语言之类。
``` c title="add.c"
int add(int a,int b){
    return a+b;
}
```

---

## 指令集操作

### 算术操作

在RISC-V中，每个指令只能有一个操作。
对于f=(g+h)-(i+j)

RISC-V Code:
```plaintext

add t0,g,h
add t1,i,j
sub f,t0,t1

```
!!! info "寄存器表"
    然而在指令集中，其实没有我们所写的变量名，而是通过一个个寄存器来存储数据集。也就是：
    
    + Load values from memory into registers  
    
    + Store result from register to memory
    ![](../../image/pp26.png)

---

RISC-V是小端的，把低位数据放在低位地址里.

### R-Format 指令

!!! info "如图"
    ![](../../image/pp27.png)
    ??? tip "解析"
        ![](../../image/pp28.png)
        离opcode近的是rs1.图中指令的含义是add x9,x20.x21，即将x20,x21寄存器内的值相加赋予x9寄存器

### I-Format 指令
!!! info "如图"
    ![](../../image/pp29.png)
    ??? tip "解析"
        ![](../../image/pp30.png)
        !!! example "例子"
            ld x9,64(x22):

            + ld 表示加载双字（load doubleword），即从内存中加载一个64位的数据。
            + x9 是目标寄存器，表示加载的数据将被存储到寄存器 x9 中。
            + 64(x22) 表示从寄存器 x22 的值加上偏移量 64 所指向的内存地址中读取数据。

### S-Format 指令操作

!!! info "如图"
    ![](../../image/pp31.png)
    ??? tip "解析"
        ![](../../image/pp32.png)
        !!! example "例子"
            sd x9, 64(x22):
            + sd 表示存储双字（store doubleword），即将一个64位的数据从寄存器存储到内存中。
            + x9 是源寄存器，表示要存储的数据来自寄存器 x9。
            + 64(x22) 表示目标内存地址，由寄存器 x22 的值加上偏移量 64 计算得到。

### 汇总及练习

!!! note "汇总"
    ![](../../image/pp33.png)
    ??? example "例子"
        ![](../../image/pp34.png)

---
思考：这四条指令的RISC-V指令是什么？

??? info "答案"
    === "ld"
        ![](../../image/pp36.png)
    === "add"
        ![](../../image/pp37.png)
    === "addi"
        ![](../../image/pp38.png)
    === "sd"
        ![](../../image/pp39.png)

### 其他指令

![](../../image/pp40.png)
<span id="busuanzi_container_page_pv">本页总访问量<span id="busuanzi_value_page_pv"></span>次</span>
<span id="busuanzi_container_page_uv">本页总访客数 <span id="busuanzi_value_page_uv"></span> 人</span>