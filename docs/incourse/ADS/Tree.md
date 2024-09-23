---
comments : true
---
<link rel="stylesheet" type="text/css" href="../../../css/styles.css">




# Kinds of Trees：AVL,Splay,B+ and Red Black

## AVL
### AVL树的特点与性质

AVL树是一种自平衡二叉搜索树，其中所有节点的左右子树高度差不能超过一。这确保了树保持大致平衡，从而提供高效的操作。

#### 特点：
1. **自平衡**：通过插入和删除期间的旋转自动保持平衡。
2. **二叉搜索树**：遵循二叉搜索树的性质，即左子节点小于父节点，右子节点大于父节点。
3. **高度平衡**：任何节点的左右子树高度差最多为一。

#### 性质：
1. **高度**：具有`n`个节点的AVL树的高度为O(log n)，确保高效的搜索、插入和删除操作。
2. **旋转**：使用单旋转和双旋转（左旋、右旋、左右旋、右左旋）来保持平衡。
3. **时间复杂度**：
    - **搜索**：O(log n)
    - **插入**：O(log n)
    - **删除**：O(log n)
4. **平衡因子**：每个节点都有一个平衡因子，计算为其左右子树高度差，可以是-1、0或1。

#### 优点：
- 提供比不平衡二叉搜索树更快的查找、插入和删除操作。
- 确保基本操作的时间复杂度为O(log n)。

#### 缺点：
- 由于需要旋转，实现起来稍微复杂一些。
- 与其他自平衡树（如红黑树）相比，可能需要更多的旋转，导致时间复杂度中的常数因子较高。

!!! note "四种旋转操作"
    **图片来自网络与上课PPT**
    === "LL"
        ![](../../image/4aac8473c0f9ea6ee3b5f47bfe2fa867.png)
        ![](../../image/aa83c9a6cbaadce7204cd9425b54497b.png)
    === "RR"
        ![](../../image/p12.png)
    === "RL"
        ![](../../image/p11.png)
    === "LR"
        ![](../../image/p13.png)

!!! info "旋转的理解"
    按我个人来看，这四种旋转都是需要先找到"Trouble Maker",即从插入的节点出发，一直向上走第一个不平衡的节点。然后，对这个节点做操作，具体可以看下面的代码实现。另外，LR与RL其实是由LL与RR组成的。

常规的维护写法：

```c title="AVL Tree"

struct avltree
{
    int data;
    struct avltree *left;
    struct avltree *right;
    int height;
};
typedef struct avltree* node;
int height(node N) {
    if (N == NULL)
        return 0;
    return N->height;
}

int max(int a, int b) {
    return (a > b) ? a : b;
}

node createnode(int key) {
    node n = (node)malloc(sizeof(struct avltree));
    n->data = key;
    n->left = NULL;
    n->right = NULL;
    n->height = 1;
    return n;
}

node rr(node y) {
    node x = y->left;
    node T2 = x->right;

    x->right = y;
    y->left = T2;

    y->height = max(height(y->left), height(y->right)) + 1;
    x->height = max(height(x->left), height(x->right)) + 1;

    return x;
}

node lr(node x) {
    node y = x->right;
    node T2 = y->left;

    y->left = x;
    x->right = T2;

    x->height = max(height(x->left), height(x->right)) + 1;
    y->height = max(height(y->left), height(y->right)) + 1;

    return y;
}

int bf(node N) {
    if (N == NULL)
        return 0;
    return height(N->left) - height(N->right);
}

node insert(node n, int key) {
    if (n == NULL)
        return createnode(key);

    if (key < n->data)
        n->left = insert(n->left, key);
    else if (key > n->data)
        n->right = insert(n->right, key);
    else
        return n;

    n->height = 1 + max(height(n->left), height(n->right));

    int bl = bf(n);

    if (bl > 1 && key < n->left->data)
        return rr(n);

    if (bl < -1 && key > n->right->data)
        return lr(n);

    if (bl > 1 && key > n->left->data) {
        n->left = lr(n->left);
        return rr(n);
    }

    if (bl < -1 && key < n->right->data) {
        n->right = rr(n->right);
        return lr(n);
    }

    return n;
}


```
## Splay Tree(伸展树)

### 性质
Splay树是一种自调整二叉搜索树，通过在每次访问节点后将其旋转到根节点来保持较短的访问路径。以下是Splay树的主要性质：

1. **自调整**：每次访问节点后，通过旋转操作将该节点移动到根节点，从而使得频繁访问的节点更接近根节点。
2. **二叉搜索树**：遵循二叉搜索树的性质，即左子节点小于父节点，右子节点大于父节点。
3. **旋转操作**：主要使用三种旋转操作：Zig、Zig-Zig和Zig-Zag。

#### 旋转操作：
1. **Zig**：当访问节点是根节点的左子节点或右子节点时，进行一次单旋转。
2. **Zig-Zig**：当访问节点是其父节点的左子节点，且其父节点是其祖父节点的左子节点时，进行两次单旋转。
3. **Zig-Zag**：当访问节点是其父节点的右子节点，且其父节点是其祖父节点的左子节点时，进行一次双旋转。

#### 时间复杂度：
- **摊还时间复杂度**：所有基本操作（插入、删除、查找）的摊还时间复杂度为O(log n)，其中n是树中的节点数。
- **最坏情况时间复杂度**：单次操作的最坏情况时间复杂度为O(n)，但这种情况很少发生。

!!! note "三种操作"
    访问`X`
    === "zig"
        根据左右节点的情况分别进行一次左旋和右旋即可。
    === "zig-zig"
        ![](../../image/p1.png)
    === "zig-zag"
        ![](../../image/p2.png)

!!! warning "可能的误区"
    由于我在一开始学习zig-zig时犯过错误，所以在这里记录一下。zig-zig时先对x.grandparent作操作，再对x.parent做操作。在一开始我误以为先对x.parent作操作，再对x.grandparent作操作，延续了之前双旋转的思想，于是出问题了。
```c title="Splay Tree"

struct splaytree {
    int data;
    struct splaytree *left;
    struct splaytree *right;
};
typedef struct splaytree* node;

node rightRotate(node x) {
    node y = x->left;
    x->left = y->right;
    y->right = x;
    return y;
}

node leftRotate(node x) {
    node y = x->right;
    x->right = y->left;
    y->left = x;
    return y;
}

node splay(node root, int key) {
    if (root == NULL || root->data == key)
        return root;

    if (root->data > key) {
        if (root->left == NULL) return root;

        if (root->left->data > key) {
            root->left->left = splay(root->left->left, key);
            root = rightRotate(root);
        } else if (root->left->data < key) {
            root->left->right = splay(root->left->right, key);
            if (root->left->right != NULL)
                root->left = leftRotate(root->left);
        }
        return (root->left == NULL) ? root : rightRotate(root);
    } else {
        if (root->right == NULL) return root;

        if (root->right->data > key) {
            root->right->left = splay(root->right->left, key);
            if (root->right->left != NULL)
                root->right = rightRotate(root->right);
        } else if (root->right->data < key) {
            root->right->right = splay(root->right->right, key);
            root = leftRotate(root);
        }
        return (root->right == NULL) ? root : leftRotate(root);
    }
}

node insert(node root, int key) {
    if (root == NULL) return createnode(key);
    root = splay(root, key);
    if (root->data == key) return root;

    node newnode = createnode(key);
    if (root->data > key) {
        newnode->right = root;
        newnode->left = root->left;
        root->left = NULL;
    } else {
        newnode->left = root;
        newnode->right = root->right;
        root->right = NULL;
    }
    return newnode;
}
```