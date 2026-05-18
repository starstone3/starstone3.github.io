---
comments: true
---

# Open Quantum Systems and  Quantum Errors


## Errors in a Circuit Model

在量子电路模型里,误差大致可以分成以下几类:

- **State preparation error**:制备初态时需要与控制线路、谐振腔、测量设备等耦合,快速 reset 不可能完全理想.

- **Gate imperfection**:微波脉冲的幅度、相位、持续时间不精确,或者量子比特频率发生漂移.

- **Measurement error**:积分时间有限、测量诱导退相干、放大器和探测器噪声.

- **Qubit decoherence**:环境导致 relaxation、heating、dephasing,以及量子比特之间不希望出现的 crosstalk.

### 经典噪声

一个经典 bit.假设它原来是 $0$ 或 $1$,经过一段时间后有概率 $p$ 翻转,概率 $1-p$ 保持不变.如果用概率向量描述状态,则

$$
\begin{bmatrix}
p(Y=0) \\
p(Y=1)
\end{bmatrix}
=
\begin{bmatrix}
1-p & p \\
p & 1-p
\end{bmatrix}
\begin{bmatrix}
p(X=0) \\
p(X=1)
\end{bmatrix}.
$$

也就是

$$
\vec{p}_Y = E\vec{p}_X.
$$

这里我们称$E$是概率转移矩阵.

这个例子主要是想说明,对于经典比特的状态,可以用概率向量来说明,噪声是作用在概率向量上的

而对于量子比特的状态,我们使用其密度矩阵来说明.对于量子比特的噪声,其映射在密度矩阵上

## Recap of Reduced Density Matrix

我们之前已经学过,对于一个封闭系统的含时演化,其密度矩阵可以写为:

$$
\mathcal{E}_U(\rho) = U\rho U^\dagger.
$$

但实际中,系统本身并不一定是封闭的,它可能与环境耦合.因此我们需要一个更一般的框架来描述系统的演化.

考虑总系统由目标系统 $S$ 和环境 $E$ 构成,整体密度矩阵为 $\rho$,这可以看作为一个大的封闭系统.如果我们只测量系统 $S$ 上的观测量 $L_S$,实际观测量是

$$
L_S \otimes I_E.
$$

期望为

$$
\langle L_S\rangle
= \operatorname{Tr}\rho(L_S\otimes I_E).
$$

我们使用之前学过的环境的偏迹:

$$
\rho_S = \operatorname{Tr}_E \rho
= \sum_j \langle j_E|\rho|j_E\rangle.
$$

于是

$$
\langle L_S\rangle = \operatorname{Tr}_S(\rho_S L_S).
$$

## Operator-Sum Representation

设系统和环境初始可分:

$$
\rho(0) = \rho_S(0)\otimes \rho_E(0).
$$

为了简化,先取环境初态为纯态:

$$
\rho_E(0)=|e_0\rangle\langle e_0|.
$$

并且定义环境的完备正交基:

$$
\sum_k |e_k\rangle\langle e_k| = I_E.
$$

我们之前学过:

$$
U(t)=e^{-iHt/\hbar}.
$$

我们真正关心的是系统 $S$ 的约化密度矩阵:

$$
\begin{aligned}
\rho_S(t)
&= \operatorname{Tr}_E\left\{
U(t)\left[\rho_S(0)\otimes |e_0\rangle\langle e_0|\right]U^\dagger(t)
\right\} \\
&= \sum_k \langle e_k|U(t)|e_0\rangle
\rho_S(0)
\langle e_0|U^\dagger(t)|e_k\rangle.
\end{aligned}
$$

定义

$$
E_k = \langle e_k|U(t)|e_0\rangle,
$$

得到 **operator-sum representation**:

$$
\rho_S(t)=\sum_k E_k\rho_S(0)E_k^\dagger.
$$

这里的 $E_k$ 称为 **Kraus operators**.它们只作用在系统 $S$ 上,但已经编码了环境初态和系统-环境耦合的信息.

如果没有从环境中读取任何过程信息,则 Kraus 算符满足完备性条件:

$$
\sum_k E_k^\dagger E_k = I.
$$

这个条件保证

$$
\operatorname{Tr}\rho_S(t)=1.
$$

同时,$\rho_S(t)$ 仍然满足:

- Hermitian
- trace 为 $1$
- 半正定

但是一般来说,这个演化不是幺正的.偏迹丢掉了环境自由度的信息,所以系统演化可能不可逆,表现出时间箭头.

## Qubit Decoherence

量子比特与环境耦合时,环境可以看成对量子比特进行了一种没有被我们读取的测量.

噪声的主要影响通常分成两类:

- **Relaxation**:改变能级占据,例如激发态衰减到基态.
- **Dephasing**:不改变能级占据,但随机化相位,导致相干项衰减.

### Amplitude Damping

Amplitude damping 描述激发态自发辐射衰减到基态的过程.记基态为 $|g\rangle$,激发态为 $|e\rangle$,环境初始为真空态 $|0\rangle$.一段时间后,激发态有概率 $p$ 衰减并放出一个光子:

$$
|g\rangle|0\rangle \mapsto |g\rangle|0\rangle,
$$

$$
|e\rangle|0\rangle
\mapsto
\sqrt{1-p}|e\rangle|0\rangle
+ \sqrt{p}|g\rangle|1\rangle.
$$

也就是说,整个系统(包括系统与环境)的演化可以写成

$$
\begin{aligned}
U(\delta t) |g\rangle|0\rangle
&= |g\rangle|0\rangle, \\
U(\delta t) |e\rangle|0\rangle
&= \sqrt{1-p}|e\rangle|0\rangle
+ \sqrt{p}|g\rangle|1\rangle.
\end{aligned}
$$


根据定义得到 Kraus 算符(以系统 $S$ 的基态 $|g\rangle$ 和激发态 $|e\rangle$ 为基):

$$
E_0=
\begin{bmatrix}
1 & 0 \\
0 & \sqrt{1-p}
\end{bmatrix},
\qquad
E_1=
\begin{bmatrix}
0 & \sqrt{p} \\
0 & 0
\end{bmatrix}.
$$

若

$$
\rho_S(0)=
\begin{bmatrix}
\rho_{gg} & \rho_{ge} \\
\rho_{eg} & \rho_{ee}
\end{bmatrix},
$$

则

$$
\begin{aligned}
\rho_S(\delta t)
&= E_0\rho_S(0)E_0^\dagger + E_1\rho_S(0)E_1^\dagger \\
&=
\begin{bmatrix}
\rho_{gg}+p\rho_{ee} & \sqrt{1-p}\rho_{ge} \\
\sqrt{1-p}\rho_{eg} & (1-p)\rho_{ee}
\end{bmatrix}.
\end{aligned}
$$

因此 amplitude damping 的效果是:

- 激发态布居 $\rho_{ee}$ 逐渐转移到基态布居 $\rho_{gg}$.
- 非对角元 $\rho_{ge},\rho_{eg}$ 也会衰减.

如果连续作用 $n$ 次,

$$
\rho_{ee}\mapsto (1-p)^n\rho_{ee}.
$$

引入弛豫时间 $T_1$,当 $\delta t\ll T_1$ 时

$$
p \approx \frac{\delta t}{T_1}
\approx 1-e^{-\delta t/T_1}.
$$

激发态保持到时间 $t$ 的概率近似为

$$
P(t)\approx e^{-t/T_1}.
$$

长时间极限下

$$
\rho_S(t)\to
\begin{bmatrix}
1 & 0 \\
0 & 0
\end{bmatrix},
$$

也就是说系统最终落到基态.

### Phase Damping

Phase damping 描述能级间相位的随机漂移.它不改变 $|g\rangle,|e\rangle$ 的布居,只衰减相干项.

一个 Kraus 表示为

$$
E_0=
\begin{bmatrix}
1 & 0 \\
0 & \sqrt{1-q}
\end{bmatrix},
\qquad
E_1=
\begin{bmatrix}
0 & 0 \\
0 & \sqrt{q}
\end{bmatrix}.
$$

于是

$$
\begin{aligned}
\rho_S(\delta t)
&= E_0\rho_S(0)E_0^\dagger + E_1\rho_S(0)E_1^\dagger \\
&=
\begin{bmatrix}
\rho_{gg} & \sqrt{1-q}\rho_{ge} \\
\sqrt{1-q}\rho_{eg} & \rho_{ee}
\end{bmatrix}.
\end{aligned}
$$

这说明 phase damping 只衰减非对角元.若定义 pure dephasing time $T_\phi$,则

$$
\sqrt{1-q}=e^{-\delta t/T_\phi}.
$$

长时间后,非对角元消失:

$$
\rho_\infty
= \rho_{gg}|g\rangle\langle g|
+ \rho_{ee}|e\rangle\langle e|.
$$

也就是原来的量子叠加变成经典概率混合.

!!! note "Relaxation 与 Dephasing 的区别"

    - Relaxation 会改变基态和激发态的占据概率.
    - Dephasing 不改变占据概率,只破坏相干项.
    - 从计算角度看,relaxation 更严重,因为它直接打乱计算基态.

如果实验中同时存在 relaxation 和 dephasing,记

$$
1-p=e^{-\delta t/T_1},
\qquad
\sqrt{1-q}=e^{-\delta t/T_\phi},
$$

则总退相干时间满足

$$
\frac{1}{T_2^*}
=
\frac{1}{2T_1}
+ \frac{1}{T_\phi}.
$$

## The Master Equation

前面的 Kraus 表示描述的是有限时间内的量子操作.如果希望用微分方程描述开放系统演化,需要假设演化近似是 Markovian 的,即 $\rho(t+\delta t)$ 只由 $\rho(t)$ 决定.

封闭系统的密度矩阵满足 Liouville equation:

$$
\dot{\rho}=-i[H,\rho],
$$

这里取 $\hbar=1$.开放系统的一般形式可以写成

$$
\dot{\rho}=\mathcal{L}[\rho],
$$

其中 $\mathcal{L}$ 称为 Lindbladian,类似于开放系统中的演化生成元.

### Lindblad 方程

从无穷小时间的 Kraus 表示出发:

$$
\rho(t+\delta t)
=
\sum_k E_k(\delta t)\rho(t)E_k^\dagger(\delta t).
$$

当 $\delta t$ 很小时,一个 Kraus 算符近似为

$$
E_0 = I - i\delta t J + O(\delta t^2),
$$

其余 Kraus 算符为

$$
E_{k>0} = \sqrt{\delta t}L_k + O(\delta t).
$$

把 $J$ 的 Hermitian 部分识别为普通哈密顿量:

$$
H = \frac{J+J^\dagger}{2}.
$$

利用完备性条件 $\sum_k E_k^\dagger E_k=I$,并取 $\delta t\to 0$,得到 Lindblad master equation:

$$
\dot{\rho}(t)
=
-i[H,\rho(t)]
+
\sum_{k>0}
\left[
L_k\rho(t)L_k^\dagger
-
\frac{1}{2}L_k^\dagger L_k\rho(t)
-
\frac{1}{2}\rho(t)L_k^\dagger L_k
\right].
$$

其中 $L_k$ 是 **Lindblad operators**,用于描述不同的耗散或退相干过程,例如 spin flip、relaxation、dephasing 等.

