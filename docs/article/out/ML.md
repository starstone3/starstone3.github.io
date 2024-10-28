---
comments: true
---

# Machine Learning

!!! info "参考"
    https://www.bilibili.com/video/BV1PN4y1V7d9/

抛去无意义的话，直接进入正题。

## 引入

假设我需要向银行借钱，银行根据我的年龄($x_1$),工资($x_2$),来决定贷款的额度(h)。

这相当于在一个空间直角坐标系中，拟合出一个最合适的平面。

记拟合的平面为$h_{\theta}(x) = \theta_0 +\theta_1 x_2+\theta_2 x_2$

记$\mathbf{x} = \begin{bmatrix}
1 \\
x_1 \\
x_2
\end{bmatrix}$,$\mathbf{\theta} = \begin{bmatrix}
\theta_0 \\
\theta_1 \\
\theta_2
\end{bmatrix}$,则$h_{\theta}(x)=\theta^T x$

此外，我们还需要定义一个误差项$\epsilon$,因此现在对于每一个我们已知的样本点，如果用y来表示实际值，$y^{(i)}=\theta^T x^{(i)} + \epsilon^{(i)}$ 

对于误差$\epsilon^{(i)}$, 有如下性质：

1. **独立**：张三和李四都来贷款，他们俩能借到多少钱相互之间无关 -- 数据之间独立

2. **同分布**：他俩都得去同一家银行 -- 数据服从相同的概率分布，即每个误差项$\epsilon^{(i)}$都来自相同的分布。

3. **标准正态分布**：误差服从均值为0且方差为$\sigma^2$的正态分布，可以表示为：
   $
   x \sim \mathcal{N}(0, \theta^2)
   $

## 似然函数

对于上面的案例，由于误差服从正态分布，其密度函数为$f(\epsilon^{(i)})=\frac{1}{\sqrt{2 \pi \sigma^2}} \exp\left(- \frac{(\epsilon^{(i)})^2}{2 \sigma^2}\right)$

我们用$y, x$来表示$\epsilon$，于是得到$f(y^{(i)}|x^{(i)}, \theta)= \frac{1}{\sqrt{2 \pi \sigma^2}} \exp\left(- \frac{(y^{(i)} - \theta^T x^{(i)})^2}{2 \sigma^2}\right)$

### 似然函数定义
似然函数表示为所有观测值的联合概率密度函数
$L(\theta) = \prod_{i=1}^{n} f(y^{(i)}|x^{(i)}, \theta) = \prod_{i=1}^{n} \frac{1}{\sqrt{2 \pi \sigma^2}} \exp\left(- \frac{(y^{(i)} - \theta^T x^{(i)})^2}{2 \sigma^2}\right)$

### 对数似然函数
有时为了简化计算，我们会取一个对数。
$\ell(\theta) = \log L(\theta) = \sum_{i=1}^{n} \log \left( \frac{1}{\sqrt{2 \pi \sigma^2}} \exp\left(- \frac{(y^{(i)} - \theta^T x^{(i)})^2}{2 \sigma^2}\right) \right)$

进一步简化对数似然函数：

$\ell(\theta) = n \log{\frac{1}{\sqrt{2 \pi} \sigma}} - \frac{1}{2\sigma ^2} \sum_{i=1}^n((y^{(i)} - \theta^T x^{(i)})^2)$

现在再回过头来思考一下，我们的目的是什么呢？就是让似然函数越大越好。考虑上式中的变量，我们只需要让$\frac{1}{2}\sum_{i=1}^n((y^{(i)} - \theta^T x^{(i)})^2)$越小越好.

不妨记$J(\theta) = \frac{1}{2}\sum_{i=1}^n((y^{(i)} - \theta^T x^{(i)})^2)$

$J(\theta) = \frac{1}{2} \sum_{i=1}^{m} (h_\theta(x^{(i)}) - y^{(i)})^2 = \frac{1}{2} (X\theta - y)^T (X\theta - y)$

对$\theta$ 求偏导： $\nabla_\theta J(\theta) = \nabla_\theta \left( \frac{1}{2} (X\theta - y)^T (X\theta - y) \right) = \nabla_\theta \left( \frac{1}{2} (\theta^T X^T X \theta - \theta^T X^T y - y^T X \theta + y^T y) \right)$

$= \frac{1}{2} \nabla_\theta \left( \theta^T X^T X \theta - \theta^T X^T y - y^T X \theta + y^T y \right)$

$= X^T X \theta - X^T y$

要求极值点，因此偏导为0

$\therefore \theta = (X^T X)^{-1} X^T y$

## 梯度下降

上面的似然函数推导听上去很美好，X，Y都是已知的，我们只需要
代进去就能得出$\theta$，然而,$X^T X$并不总是可逆的，这就意味着
我们不能直接得出$\theta$的值。因此，需要引入梯度下降的概念。

### 概念
机器学习的主要目的是通过迭代地调整模型参数，以最小化损失函数。因为有许多目标函数是不可解的，因此，需要梯度下降的思想。

### 做法

梯度在数学的学习中都已经接触过，是一个多元函数在某点处变化最快的方向和速率，是一个向量，也是我们常说的方向导数。

假设现在我们的目标函数是$J(\theta)= \frac{1}{2m} \sum^m_{i=1}(y^i - h_{\theta}(x^i))^2$，初始先随机取$\theta$的值，为了不断更新$\theta$来让预测值和真实值更接近，有如下方法

#### 批量梯度下降 (Batch Gradient Descent)
批量梯度下降使用整个训练集来计算梯度更新。

公式：

$\frac{\partial J(\theta)}{\partial \theta_j} = 1 \frac{1}{m} \sum_{i=1}^{m} (y^i - h_{\theta}(x^i) )x^i_j$

$\theta^{\prime}_j= \theta_j - \alpha \frac{1}{m} \sum_{i=1}^{m} (h_{\theta}(x^i) - y^i)x^i_j$

解释：

- $\theta$：参数向量
- $\alpha$：学习率
- $m$：训练样本的数量
- $h_{\theta}(x^i)$：模型的预测值
- $y^i$：某个真实值
- $x^i$：某个输入特征向量
- $x^i_j$:某个输入向量与参数$\theta_j$相匹配的

#### 随机梯度下降 (Stochastic Gradient Descent)
随机梯度下降每次只使用一个训练样本来更新参数。

公式：
$\theta^{\prime}_j= \theta_j - \alpha (h_{\theta}(x^i) - y^i)x^i_j$

解释：

- $\theta$：参数向量
- $\alpha$：学习率
- $h_{\theta}(x^i)$：模型的预测值
- $y^i$：某个真实值
- $x^i$：某个输入特征向量
- $x^i_j$:某个输入向量与参数$\theta_j$相匹配的

#### 小批量梯度下降 (Mini-batch Gradient Descent)
小批量梯度下降使用一小部分训练样本（称为小批量）来计算梯度更新。

公式：
$\theta^{\prime}_j= \theta_j - \alpha \frac{1}{b} \sum_{i=1}^{b} (h_{\theta}(x^i) - y^i)x^i_j$

解释：

- $\theta$：参数向量
- $\alpha$：学习率
- $b$：小批量的样本数量
- $h_{\theta}(x^i)$：模型的预测值
- $y^i$：某个真实值
- $x^i$：某个输入特征向量
- $x^i_j$:某个输入向量与参数$\theta_j$相匹配的


需要说明一下的是，学习率相当于是每次参数更新的步长大小，因为我们算出来的梯度只是在某一点的方向导数，并不能代表全部，所以更新的学习率需要仔细考虑。

## 线性回归模型实战

