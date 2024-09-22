---
comments : true
---
<link rel="stylesheet" type="text/css" href="../../../css/styles.css">

# Kinds of Trees

## AVL Tree

最常规的维护写法：

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
