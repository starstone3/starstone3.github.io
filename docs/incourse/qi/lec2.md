---
comments: true
---

# 复向量中的光子与量子态

在之前的物理学习中我们了解到,光是一种横波,这意味着光的电场和磁场是垂直于传播方向的.对于线偏振光，$E_x = E_0 \cos\theta \cos \omega t$，$E_y = E_0 \sin\theta \cos \omega t$。因此我们可以写为：

$$
\vec{E} = E_0 \hat{p} \cos \omega t, \quad \hat{p} = (\cos\theta, \sin\theta)
$$

光的强度与电场的平方成正比：$I \propto E_0^2$。

所以,假设一束自然光通过一个偏振片后,它的振动方向矢量为$\hat{p} = (\cos\theta, \sin\theta)$,那么当它再经过一个偏振方向为$\hat{n} = (\cos\phi, \sin\phi)$的偏振片时,电场强度将变为：

$$
\vec{E}' = (\vec{E} \cdot \hat{n})\hat{n} = [E_0 (\hat{p} \cdot \hat{n})] \hat{n} \cos \omega t
$$

由此得到Malus定律：

$$
I' = I (\hat{p} \cdot \hat{n})^2
$$

也就是我们之前学的$ I \propto E^2 $。

---

## 偏振现象的量子解释

然而,在光子视角下,却不能这样简单理解,原因很简单,上面的公式假设能量是连续可分的,在量子力学中,能量是量子化的,光子具有离散的能量值.因此,我们需要重新理解光的偏振现象.

Malus定律在微观上必须作统计解释,因为单个光子不可再分。对单个偏振方向为$\hat{p}$的光子,通过偏振轴为$\hat{n}$的分析器时,结果只有两种: 通过或不通过。其通过概率为

$$
P(\text{pass}) = |\langle n|p\rangle|^2 = (\hat{p}\cdot\hat{n})^2.
$$

> 这就是我们后面学习的概率振幅,相当于是一个处于$\hat{p}$态的光子,我们以$\hat{n}$为基底进行测量,有多大的概率得到$\hat{n}$态的结果。

也就是说,单光子不会“分成一部分通过”,而是按上述概率随机给出一次0/1结果。

若有$N$个相互独立且同偏振的光子入射,每个光子的通过概率都为$p=(\hat{p}\cdot\hat{n})^2$,则通过光子数$N'$服从二项分布:

$$
N' \sim \mathrm{Binomial}(N,p),\quad \mathbb{E}[N']=Np,\quad \sigma_{N'}=\sqrt{Np(1-p)}.
$$

因此当$N$足够大时,有

$$
N' \approx N(\hat{p}\cdot\hat{n})^2,
$$

这正是宏观上观测到的Malus定律。涨落量级常写为$\sqrt{N}$(更精确地说是$\sqrt{Np(1-p)}$),相对涨落约为$1/\sqrt{N}$,所以强光下曲线更平滑。

---

## 从线偏振到一般偏振

上面的讨论主要针对线偏振。接下来我们把视角推广到一般偏振态,这样就能自然过渡到Dirac记号。

设一束线偏振光经过双折射晶体,由于各向异性,不同方向的传播速度不同,其$x,y$分量分别获得相位延迟$\delta_x,\delta_y$。电场可写为

$$
E_x = E_0\cos\theta\cos(\omega t-\delta_x)=E_0\mathrm{Re}(\mu e^{-i\omega t}),
$$

$$
E_y = E_0\sin\theta\cos(\omega t-\delta_y)=E_0\mathrm{Re}(\nu e^{-i\omega t}),
$$

中间计算过程如下(用到$\cos\alpha=\mathrm{Re}(e^{i\alpha})$):

$$
\begin{aligned}
E_x
&=E_0\cos\theta\cos(\omega t-\delta_x) \\
&=E_0\cos\theta\,\mathrm{Re}\!\left(e^{i(\omega t-\delta_x)}\right) \\
&=E_0\,\mathrm{Re}\!\left(\cos\theta\,e^{-i\delta_x}e^{i\omega t}\right).
\end{aligned}
$$

若统一采用$e^{-i\omega t}$时间因子,则等价地写成

$$
\begin{aligned}
E_x
&=E_0\,\mathrm{Re}\!\left(\cos\theta\,e^{i\delta_x}e^{-i\omega t}\right) \\
&=E_0\,\mathrm{Re}\!\left(\mu e^{-i\omega t}\right),
\end{aligned}
$$

同理,

$$
\begin{aligned}
E_y
&=E_0\sin\theta\cos(\omega t-\delta_y) \\
&=E_0\sin\theta\,\mathrm{Re}\!\left(e^{i(\omega t-\delta_y)}\right) \\
&=E_0\,\mathrm{Re}\!\left(\sin\theta\,e^{-i\delta_y}e^{i\omega t}\right) \\
&=E_0\,\mathrm{Re}\!\left(\sin\theta\,e^{i\delta_y}e^{-i\omega t}\right) \\
&=E_0\,\mathrm{Re}\!\left(\nu e^{-i\omega t}\right),
\end{aligned}
$$

> 欧拉公式$e^{i\alpha} = \cos\alpha + i\sin\alpha$。

其中

$$
\mu=\cos\theta\,e^{i\delta_x},\qquad \nu=\sin\theta\,e^{i\delta_y},\qquad |\mu|^2+|\nu|^2=1.
$$

这时光一般变为椭圆偏振。注意真正有物理意义的是相对相位

$$
\delta=\delta_y-\delta_x,
$$

而不是$\delta_x,\delta_y$各自的绝对值。因为整体时间平移可以把$\delta_x$吸收到公共相位里,因此可令$\delta_x=0$而不改变可观测结果。

于是,任意偏振态都可由复向量

$$
\begin{pmatrix}
\mu\\
\nu
\end{pmatrix},\qquad |\mu|^2+|\nu|^2=1
$$

来表示;并且

$$
\begin{pmatrix}
\mu\\
\nu
\end{pmatrix}
\sim
\begin{pmatrix}
\mu e^{i\phi}\\
\nu e^{i\phi}
\end{pmatrix}
$$

对应同一个物理偏振态,只不过是不同时间的表示.所以独立实参数只有两个。


## Dirac's Bracket Notation

!!! info "Bras and Ket"
    十分有趣的,Dirac在他的量子力学著作中引入了Bra-Ket记号,用来表示量子态和测量结果.
    
    从线性代数的视角来看,Ket $|\psi\rangle$表示一个列向量,而Bra $\langle\psi|$表示一个行向量.它们之间的内积$\langle\phi|\psi\rangle$就是Bra和Ket的乘积,得到一个复数.

下面给出一些性质,实际上和线性代数中的向量空间性质完全一样,只是换了一种记号:

- $\langle\psi|$ = $|\psi\rangle^\dagger$ (相当于矩阵的共轭转置)

- $\langle \zeta a|=\langle a|\zeta^*=\zeta^*\langle a|$ (Bra 对标量是共轭线性的)

- $\langle a|b \rangle$ = $\langle b|a \rangle^*$ (内积的共轭对称)

- 加法有线性性质,并且保持了交换律和结合律:

    - 当然还有单位元之类的,不讲了

$$
\begin{aligned}
\langle a|b+c \rangle &= \langle a|b \rangle + \langle a|c \rangle, \\
\langle a+b|c \rangle &= \langle a|c \rangle + \langle b|c \rangle.
\end{aligned}
$$

- 标量的乘法满足分配律,注意这里的标量是复数:

$$
\begin{aligned}
\langle a|\alpha b \rangle &= \alpha \langle a|b \rangle, \\
\langle \alpha a|b \rangle &= \alpha^* \langle a|b \rangle.
\end{aligned}
$$

---

由于这是一个线性空间,我们当然可以找到一组正交单位基来作为基底.

!!! question "线性无关"
    考虑复向量空间$V=\mathbb{C}^n$中的一组向量$\{|x_1\rangle,\dots,|x_n\rangle\}$。  
    若方程

    $$
    \sum_{i=1}^{n}\eta_i|x_i\rangle=|0\rangle
    $$

    存在一组系数$\eta_1,\dots,\eta_n$,且至少有一个系数不为$0$,则称这组向量**线性相关**。  
    若上述方程只有平凡解$\eta_i=0\ (1\le i\le n)$,则称这组向量**线性无关**。

实际上,任何一个向量最终可以写成如下形式:

$$
|a\rangle=\sum_i |i\rangle\langle i|a\rangle,
$$

其中$\{|i\rangle\}$是一组完备正交基,系数$\langle i|a\rangle$就是$|a\rangle$在第$i$个基矢方向上的投影(概率振幅)。

对于光子的偏振态,若取$\{|h\rangle,|v\rangle\}$为水平/竖直偏振基底,则任意光子态$|p\rangle$可写为

$$
|p\rangle=I_{2\times2}|p\rangle=(|h\rangle\langle h|+|v\rangle\langle v|)|p\rangle
=|h\rangle\langle h|p\rangle+|v\rangle\langle v|p\rangle
=\mu|h\rangle+\nu|v\rangle,
$$

其中$\mu,\nu\in\mathbb{C}$,并且归一化条件为

$$
\langle p|p\rangle=|\mu|^2+|\nu|^2=1.
$$

这里

$$
\mu=\langle h|p\rangle,\qquad \nu=\langle v|p\rangle
$$

就是态$|p\rangle$在基底$|h\rangle,|v\rangle$上的**概率振幅**。

!!! warning "振幅书写顺序"
    正确解释始终是$\langle \text{测量态}|\text{初态}\rangle$,也就是“测量基底在左,系统状态在右”。

    记忆法: $\langle \text{basis}|\text{state}\rangle$。

!!! example "四种线偏振态与测量概率"
    考虑偏振方向$\zeta$对应的线偏振光子,其偏振矢量可写为$\vec e=(\cos\zeta,\sin\zeta)$。在$\{|h\rangle,|v\rangle\}$基底下,常见四种态为

    $$
    \zeta=0:\ |h\rangle,\qquad
    \zeta=\frac{\pi}{2}:\ |v\rangle,
    $$

    $$
    \zeta=\frac{\pi}{4}:\ \frac{|h\rangle+|v\rangle}{\sqrt2},\qquad
    \zeta=\frac{3\pi}{4}:\ \frac{-|h\rangle+|v\rangle}{\sqrt2}.
    $$

    前两者属于$\{|h\rangle,|v\rangle\}$这一组基底(Mode I),后两者属于对角基底(Mode II)。

    1. 光子处于$\frac{-|h\rangle+|v\rangle}{\sqrt2}$时,测得$|h\rangle$的概率:

    $$
    P(h)=|\langle h|\psi\rangle|^2
    =\left|\left\langle h\middle|\frac{-|h\rangle+|v\rangle}{\sqrt2}\right\rangle\right|^2
    =\left|\frac{-1}{\sqrt2}\right|^2
    =\frac12.
    $$

    2. 光子处于$|h\rangle$时,测得$\frac{-|h\rangle+|v\rangle}{\sqrt2}$的概率:

    $$
    P\!\left(\frac{-h+v}{\sqrt2}\right)
    =\left|\left\langle \frac{-h+v}{\sqrt2}\middle|h\right\rangle\right|^2
    =\left|\frac{-1}{\sqrt2}\right|^2
    =\frac12.
    $$

    这里再次体现了计算顺序: $\langle \text{测量态}|\text{初态}\rangle$。

!!! tip "$|k \rangle \langle k|$的物理意义"
    $|k \rangle \langle k|$是一个算符,它的作用是把任意态$|\psi\rangle$投影到$|k\rangle$方向上,得到$\langle k|\psi\rangle |k\rangle$.因此它被称为**投影算符**。

    比如,一个单位向量$|k\rangle = (0,1)^T$,则$|k \rangle \langle k|$就是一个矩阵:

    $$
    |k \rangle \langle k| =
    \begin{pmatrix}
    0 & 0 \\
    0 & 1
    \end{pmatrix},
    $$
    
    它的作用是把任意向量的第二个分量保留下来,第一个分量变为$0$。

---
