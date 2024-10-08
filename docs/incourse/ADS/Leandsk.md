---
comments : true
---

<link rel="stylesheet" type="text/css" href="../../../css/styles.css">

# Leftist Heaps and Skew Heaps

## Leftist Heaps

!!! info "相关资料"
    wiki:https://zh.wikipedia.org/wiki/%E5%B7%A6%E5%81%8F%E6%A0%91

### 概念

左偏堆的特点在于它相对于普通的二叉堆，加速了两个堆之间的合并操作。普通的二叉堆合并的时间复杂度为$O(n)$,而左偏堆可加速至$O(\log{n})$。

!!! definition "定义一：Null Path Length or dist"

    The null path length, Npl(X), of any node X is the length of the shortest path from X to a node without two children.  Define Npl(NULL) = –1.

    当且仅当节点 i 的左子树或右子树为空时，节点被称作外节点（实际上保存在二叉树中的节点都是内节点，外节点是逻辑上存在而无需保存。把一颗二叉树补上全部的外节点，则称为extended binary tree）。节点i的距离是节点 i 到它的后代中的最近的外节点所经过的边数。特别的，如果节点 i 本身是外节点，则它的距离为0;而空节点的距离规定为 -1。

    $\text{dist}_i = \min(\text{dist}_{\text{leftchild}}, \text{dist}_{\text{rightchild}}) + 1$

!!! definition "左偏堆"
    左偏堆首先应当满足大顶堆或小顶堆的性质。其次，还需要满足如下性质：

    + 节点的左子节点的距离不小于右子节点的距离。
    由此，左偏堆有如下性质：
    !!! properties "性质"

        + 节点的距离等于它的右子节点的距离加1

        + 一棵N个节点的左偏树root节点的距离最多为$\log{(N+1)}-1$

        + 如果$\text{dist}_i=k$,那么以i为根的子树在前k+1层必然是完美二叉树，即满的

### 相关操作

左偏堆最重要的操作在于合并，因此先介绍merge。

#### 递归版本

我们先假设现在的左偏堆是小顶堆。那么合并的思想就在于不断比较两个堆顶元素的大小，保持小的堆顶的左子树不变，右子树为**右子树与另一个堆合并的结果**，在任何一次合并结束后，检查左右子树是否满足

> 左偏堆首先应当满足大顶堆或小顶堆的性质。其次，还需要满足如下性质：

>    + 节点的左子节点的距离不小于右子节点的距离。

如果不满足，则调换左右子树，并更新根的dist值。

---
##### 代码

```c title="recursive"
#include <stdio.h>
#include <stdlib.h>

typedef struct LeftistNode {
    int key;
    struct LeftistNode *left;
    struct LeftistNode *right;
    int dist;
} LeftistNode;

LeftistNode* createNode(int key) {
    LeftistNode* node = (LeftistNode*)malloc(sizeof(LeftistNode));
    node->key = key;
    node->left = NULL;
    node->right = NULL;
    node->dist = 0;
    return node;
}

LeftistNode* merge(LeftistNode* h1, LeftistNode* h2) {
    if (h1 == NULL) return h2;
    if (h2 == NULL) return h1;
    if (h1->key > h2->key) {
        LeftistNode* temp = h1;
        h1 = h2;
        h2 = temp;
    }
    h1->right = merge(h1->right, h2);
    if (h1->left == NULL || h1->left->dist < h1->right->dist) {
        LeftistNode* temp = h1->left;
        h1->left = h1->right;
        h1->right = temp;
    }
    h1->dist = (h1->right == NULL) ? 0 : h1->right->dist + 1;
    return h1;
}

void inorderTraversal(LeftistNode* root) {
    if (root != NULL) {
        inorderTraversal(root->left);
        printf("%d ", root->key);
        inorderTraversal(root->right);
    }
}

int main() {
    LeftistNode* h1 = createNode(3);
    h1->left = createNode(10);
    h1->right = createNode(8);

    LeftistNode* h2 = createNode(7);
    h2->left = createNode(12);
    h2->right = createNode(9);

    LeftistNode* mergedHeap = merge(h1, h2);

    printf("Inorder traversal of merged heap: ");
    inorderTraversal(mergedHeap);
    printf("\n");

    return 0;
}
```
#### 循环版本

##### 代码

```c title="iterative"
#include <stdio.h>
#include <stdlib.h>

typedef struct LeftistNode {
    int key;
    struct LeftistNode *left;
    struct LeftistNode *right;
    int dist;
} LeftistNode;

LeftistNode* createNode(int key) {
    LeftistNode* node = (LeftistNode*)malloc(sizeof(LeftistNode));
    node->key = key;
    node->left = NULL;
    node->right = NULL;
    node->dist = 0;
    return node;
}

LeftistNode* mergeIterative(LeftistNode* h1, LeftistNode* h2) {
    if (h1 == NULL) return h2;
    if (h2 == NULL) return h1;

    LeftistNode* root = NULL;
    LeftistNode** stack[64];
    int top = -1;

    if (h1->key < h2->key) {
        root = h1;
        stack[++top] = &h1->right;
        h1 = h1->right;
    } else {
        root = h2;
        stack[++top] = &h2->right;
        h2 = h2->right;
    }

    while (h1 != NULL && h2 != NULL) {
        if (h1->key < h2->key) {
            *stack[top] = h1;
            stack[++top] = &h1->right;
            h1 = h1->right;
        } else {
            *stack[top] = h2;
            stack[++top] = &h2->right;
            h2 = h2->right;
        }
    }

    *stack[top] = (h1 == NULL) ? h2 : h1;

    while (top >= 0) {
        LeftistNode** node = stack[top--];
        if ((*node)->left == NULL || (*node)->left->dist < (*node)->right->dist) {
            LeftistNode* temp = (*node)->left;
            (*node)->left = (*node)->right;
            (*node)->right = temp;
        }
        (*node)->dist = ((*node)->right == NULL) ? 0 : (*node)->right->dist + 1;
    }

    return root;
}

void inorderTraversal(LeftistNode* root) {
    if (root != NULL) {
        inorderTraversal(root->left);
        printf("%d ", root->key);
        inorderTraversal(root->right);
    }
}

int main() {
    LeftistNode* h1 = createNode(3);
    h1->left = createNode(10);
    h1->right = createNode(8);

    LeftistNode* h2 = createNode(7);
    h2->left = createNode(12);
    h2->right = createNode(9);

    LeftistNode* mergedHeap = mergeIterative(h1, h2);

    printf("Inorder traversal of merged heap: ");
    inorderTraversal(mergedHeap);
    printf("\n");

    return 0;
}
```

#### 插入元素

堆的合并中有一个堆只有一个根节点的情况

#### 删除
删除堆顶，合并左右子树即可

## Skew Heaps

!!! info "资料"

    wiki:https://zh.wikipedia.org/wiki/%E6%96%9C%E5%A0%86

### 概念
斜堆是一般化的左偏堆，左偏堆是特殊的斜堆。斜堆的一般性在于它不记录dist值，而是在合并时，无条件进行左右子树交换的操作。

### 递归
递归合并的操作有三步：

1. 比较两个堆； 设p是具有更小的root的键值的堆，q是另一个堆。

2. p的右子树为原来p的左子树

3. p的左子树是原来p的右子树与q合并的结果。

!!! info "example from wiki"
    === "合并前"
        ![](../../image/pp3.png)
    === "合并后"
        ![](../../image/pp4.png)

### 循环

iterative版本就不写了，放一个[wiki链接](https://zh.wikipedia.org/wiki/%E6%96%9C%E5%A0%86#%E9%9D%9E%E9%80%92%E5%BD%92%E5%90%88%E5%B9%B6%E5%AE%9E%E7%8E%B0)

### 均摊分析