---
comments: true
---

# 量子系统的时间演化

## 时间演化算子

在前面几讲中,我们讨论了**测量**的过程:对一个处于态 $|\psi\rangle$ 的系统进行测量,会以一定的概率得到某个本征值,并且测量之后系统的状态会发生**坍缩**。

但量子系统并不总是处在被测量的状态下。在两次测量之间,系统会随着时间自行演化,这个过程和测量有着本质的不同。

---

> 与测量不同,当系统随时间演化时,我们是把一个算子**作用**在态向量上的。

给定系统在 $t=0$ 时刻的状态 $|\psi(0)\rangle$,它在 $t$ 时刻的状态可以表示为

$$
|\psi(t)\rangle = U(t)\,|\psi(0)\rangle,
$$

其中 $U(t)$ 称为**时间演化算子**(time-evolution operator)。


测量和时间演化是量子力学中两种截然不同的过程:

| | 测量 | 时间演化 |
|---|---|---|
| 是否确定性 | ❌ 随机的 | ✅ 确定的 |
| 是否可逆 | ❌ 一般不可逆 | ✅ 可逆 |
| 对状态的作用 | 态向量坍缩到本征态 | 态向量被 $U(t)$ 线性变换 |

也就是说:

- **测量**:概率性的、不可逆的。对系统的测量会不可预测地把态投影到某个本征态上,并且无法还原。

- **时间演化**:确定性的、可逆的。在两次测量之间,系统的演化是完全由 $U(t)$ 决定的,知道 $|\psi(0)\rangle$ 就能精确预测 $|\psi(t)\rangle$,反之亦然。

---

接下来,我们从严密的数学角度推导时间演化算子的性质以及薛定谔方程：

!!! info "时间演化与薛定谔方程"

    === "幺正性与可逆性"

        由于时间演化必须保持态向量的归一性,即

        $$
        \langle\psi(t)|\psi(t)\rangle = 1,
        $$

        可以推导出 $U(t)$ 必须是一个**幺正算子**(unitary operator),满足

        $$
        U^\dagger(t)\,U(t) = I.
        $$

        !!! prove "归一化条件推导"
            设 $|\psi(t)\rangle = U(t)|\psi(0)\rangle$,则

            $$
            \langle\psi(t)|\psi(t)\rangle
            = \langle\psi(0)|U^\dagger(t)\,U(t)|\psi(0)\rangle.
            $$

            若要对所有初态 $|\psi(0)\rangle$ 均有归一化成立,就需要

            $$
            U^\dagger(t)\,U(t) = I.
            $$

        幺正性也正是时间演化可逆的原因:由于 $U^\dagger = U^{-1}$,我们可以直接写出

        $$
        |\psi(0)\rangle = U^\dagger(t)\,|\psi(t)\rangle,
        $$

        即只要知道 $t$ 时刻的状态,就能唯一地还原出初始时刻的状态。

    === "无穷小时间演化"

        考虑**无穷小时间步长** $\delta t$ 下的演化算子 $U(\delta t)$。
        
        它需要满足两个条件。
        
        **1. 幺正性**
        
        $$
        U^\dagger(\delta t)\,U(\delta t) = I.
        $$
        
        **2. 连续性**（当 $\delta t \to 0$ 时，$U(\delta t) \to I$）
        
        对 $U(\delta t)$ 关于 $\delta t$ 展开到一阶，可以写成
        
        $$
        U(\delta t) = I - \frac{i}{\hbar} H\,\delta t,
        $$
        
        其中 $U(0) = I$，前面的系数 $-i/\hbar$ 是约定俗成的写法（引入后可使 $H$ 具有能量量纲）。
        
        将以上两个条件合在一起，把 $U(\delta t)$ 代入幺正条件：
        
        $$
        \left(I + \frac{i}{\hbar} H^\dagger\,\delta t\right)\!\left(I - \frac{i}{\hbar} H\,\delta t\right) = I.
        $$
        
        展开并保留到 $O(\delta t)$ 的一阶项，得到
        
        $$
        I + \frac{i}{\hbar}(H^\dagger - H)\,\delta t + O(\delta t^2) = I.
        $$
        
        因此必须有
        
        $$
        H^\dagger - H = 0 \quad \Longrightarrow \quad H^\dagger = H.
        $$
        
        > 也就是说，**哈密顿量 $H$ 必须是厄米算子**。

    === "含时薛定谔方程"

        根据无穷小演化的定义
        
        $$
        U(\delta t) = I - \frac{i}{\hbar} H\,\delta t,
        $$
        
        将其作用在 $t$ 时刻的态上，得到
        
        $$
        |\psi(t + \delta t)\rangle = U(\delta t)\,|\psi(t)\rangle = |\psi(t)\rangle - \frac{i}{\hbar} H\,|\psi(t)\rangle\,\delta t.
        $$
        
        整理后，
        
        $$
        |\psi(t + \delta t)\rangle - |\psi(t)\rangle = -\frac{i}{\hbar} H\,|\psi(t)\rangle\,\delta t.
        $$
        
        两边除以 $\delta t$，令 $\delta t \to 0$ 取极限，得到
        
        $$
        \lim_{\delta t \to 0} \frac{|\psi(t+\delta t)\rangle - |\psi(t)\rangle}{\delta t} = \frac{\partial}{\partial t}|\psi(t)\rangle = -\frac{i}{\hbar} H\,|\psi(t)\rangle.
        $$
        
        两边乘以 $i\hbar$，即得到
        
        $$
        \boxed{i\hbar\,\frac{\partial}{\partial t}|\psi(t)\rangle = H\,|\psi(t)\rangle,}
        $$
        
        这正是**含时薛定谔方程**(time-dependent Schrödinger equation)。

---

## 哈密顿量与 Rabi 振荡

根据上面的讨论,如果我们知道一个系统的初始状态以及它的哈密顿量,就可以利用薛定谔方程精确地预测它在任意时刻的状态。

!!! example "单比特自旋"

    所有 $2\times 2$ 厄米矩阵都可以展开成单位矩阵 $I$ 和三个泡利矩阵的**线性组合**：

    $$
    H = c_0 I + c_x \sigma_x + c_y \sigma_y + c_z \sigma_z, \qquad c_0, c_x, c_y, c_z \in \mathbb{R}.
    $$

    其中单位矩阵 $I$ 只贡献一个整体的常数能量，它只会改变整体相位因子，对物理可观测量没有影响。泡利矩阵的高次幂不会出现，因为 $\sigma_x^2 = \sigma_y^2 = \sigma_z^2 = I$ 以及反对易关系 $\sigma_x \sigma_y = -\sigma_y \sigma_x = i\sigma_z$ 等。这意味着高次幂都可以化回线性组合，不会产生新的独立项。

    自旋是一个三维向量，而哈密顿量必须是一个**标量算子**，因此自旋必须与另一个三维向量做内积。在磁场 $\vec{B}$ 中，自然的选择是

    $$
    H \sim -\vec{\sigma} \cdot \vec{B} = -(B_x \sigma_x + B_y \sigma_y + B_z \sigma_z) = -\begin{pmatrix} B_z & B_x - iB_y \\ B_x + iB_y & -B_z \end{pmatrix}.
    $$

    作为一个具体的例子，考虑磁场沿 $z$ 轴方向：$\vec{B} = B_z\hat{z}$。此时哈密顿量简化为一个标准形式，通常写作

    $$
    H_0 = -\frac{\hbar\omega_0}{2}\,\sigma_z
    = \begin{pmatrix} -\dfrac{\hbar\omega_0}{2} & 0 \\[6pt] 0 & \dfrac{\hbar\omega_0}{2} \end{pmatrix},
    $$

    其中我们把磁场强度 $B_z$ 吸收进频率 $\omega_0$ 中（$\omega_0 \propto B_z$）。

    $H_0$ 的两个本征值和对应本征态为

    $$
    H_0|0\rangle = -\frac{\hbar\omega_0}{2}|0\rangle, \qquad
    H_0|1\rangle = +\frac{\hbar\omega_0}{2}|1\rangle.
    $$

    前面的负号是一个约定：这样 $|0\rangle$（自旋向上，spin-up）对应**较低能量**，即系统的**基态**；而 $|1\rangle$（自旋向下，spin-down）是激发态。


想要操控量子态的翻转，我们就必须探究时变的磁场，也就是著名的 **Rabi 振荡**。

!!! info "Rabi 振荡的物理过程"
    
    === "含时哈密顿量"
        沿 $z$ 轴的恒定磁场 $\vec{B} = B_z\hat{z}$ 只能让态绕 $z$ 轴进动，**无法**将 $|0\rangle$ 转变为 $|0\rangle$ 和 $|1\rangle$ 的任意叠加态。
        
        要实现这一变换，需要在 $z$ 方向磁场之外，再施加一个在 $x$-$y$ 平面内以角频率 $\omega$ 旋转的横向磁场：
        
        $$
        \vec{B}_1(t) = B_1(\cos\omega t\,\hat{x} - \sin\omega t\,\hat{y}).
        $$
        
        此时完整的哈密顿量变为
        
        $$
        H(t) = -\frac{\hbar\omega_0}{2}\sigma_z - \frac{\hbar\omega_1}{2}(\sigma_x\cos\omega t - \sigma_y\sin\omega t).
        $$

    === "旋转参考系"
        横向磁场 $\vec{B}_1(t)$ 以角频率 $\omega$ 旋转，我们引入一个**随场旋转的参考系**（rotating frame）。这样的情况下,我们就能把横向磁场看作是时间无关的。所以我们直接认为只有x方向的磁场存在。
        
        在施加了这样的一个横向参考系之后,我们必须考虑其在Z轴带来的变化.也就是导致Z方向的磁场从 $\omega_0$ 变为 $\omega_0-\omega$。
        
        因此，旋转系中的**有效哈密顿量**为
        
        $$
        H' = -\frac{\hbar(\omega_0-\omega)}{2}\sigma_z - \frac{\hbar\omega_1}{2}\sigma_x.
        $$
        
        $H'$ 等价于自旋在沿方向
        
        $$
        \hat{n} = \left(\frac{\omega_1}{\Omega},\;0,\;\frac{\omega_0-\omega}{\Omega}\right)
        $$
        
        的磁场中运动，其中 **Rabi 频率**定义为
        
        $$
        \Omega = \sqrt{(\omega-\omega_0)^2 + \omega_1^2}.
        $$
        
        有效磁场的大小正比于 $\hbar\Omega/2$。若 $t=0$ 时自旋处于 $|0\rangle$，则它将以特征频率 $\Omega$ 绕 $\hat{n}$ 轴进动。

    === "Rabi 振荡公式"
        在 $t$ 时刻，系统处于 $|1\rangle$ 的概率为
        
        $$
        |\langle 1|\psi(t)\rangle|^2 = \left(\frac{\omega_1}{\Omega}\right)^2 \sin^2\frac{\Omega t}{2}.
        $$
        
        这就是 **Rabi 振荡**（Rabi oscillations）现象——量子计算中操控量子比特的基本过程。通过将量子比特暴露在适当频率的周期性电磁场中并精确控制时间，即可实现对量子态的任意旋转。
        
        > **共振条件**：当 $\omega = \omega_0$ 时，$\Omega = \omega_1$，跃迁概率可达到 $1$，即自旋可以从 $|0\rangle$ 完全转变为 $|1\rangle$。

---

## 时间无关哈密顿量的一般求解

当哈密顿量 $H$ 不随时间变化时，薛定谔方程可以通过**符号积分**直接求解：

$$
|\psi(t)\rangle = U(t)|\psi(0)\rangle = e^{-\frac{iHt}{\hbar}}|\psi(0)\rangle.
$$

实际计算时，按以下步骤进行：

**1. 求本征值和本征向量**

$$
H|j\rangle = E_j|j\rangle.
$$

**2. 将初态在本征基下展开**

$$
|\psi(0)\rangle = \sum_j |j\rangle\langle j|\psi_0\rangle.
$$

**3. 写出任意时刻的态**

每个本征分量独立演化，只获得相位因子 $e^{-iE_j t/\hbar}$：

$$
|\psi(t)\rangle = \sum_j e^{-iE_j t/\hbar}\,|j\rangle\langle j|\psi_0\rangle.
$$

!!! tip "物理含义"
    能量本征态 $|j\rangle$ 在时间演化下只积累相位，不改变概率分布，称为**定态**（stationary state）；一般叠加态则随时间振荡，产生类似 Rabi 振荡这样的动力学现象。


## 密度矩阵的变化

我们从两个方面来看密度矩阵的变化:

1. 密度矩阵随时间演化

2. 密度矩阵因测量而变化

### 时间演化

正如我们之前学的,对于一个纯态,其随时间演化为

$$
\psi(t) = U(t)\psi(0).
$$

密度矩阵就可以推导为

$$
\rho(t) = |\psi(t)\rangle\langle\psi(t)| = U(t)\rho(0)U^\dagger(t).
$$

在前面我们已经有:

$$
U(t) = \exp\left[-\frac{iHt}{\hbar}\right].
$$

对于无穷小 $\delta t$，我们有

$$
U(\delta t) = e^{-iH\delta t/\hbar} = I - \frac{i}{\hbar}H\,\delta t + O(\delta t^2).
$$
> 泰勒展开

将其代入到密度矩阵的演化公式中，我们期望得到

$$
\begin{aligned}
\rho(t + \delta t) &= \left(I - \frac{i}{\hbar}H\,\delta t\right) \rho(t) \left(I + \frac{i}{\hbar}H\,\delta t\right) + O(\delta t^2) \\
&= \rho(t) - \frac{i\delta t}{\hbar} [H\rho(t) - \rho(t)H] + O(\delta t^2) \\
&= \rho(t) - \frac{i\delta t}{\hbar} [H, \rho(t)] + O(\delta t^2),
\end{aligned}
$$

其中我们使用了对易子 $[A, B] = AB - BA$。

取极限 $\delta t \to 0$，我们获得描述密度矩阵随时间演化的基本微分方程

$$
\dot{\rho}(t) = \frac{\rho(t+\delta t)-\rho(t)}{\delta t} = \frac{1}{i\hbar}[H,\rho(t)] = \mathcal{L}(\rho(t)).
$$

其中 $\mathcal{L}$ 称为 **Liouvillian 超算子**

!!! info "纯度（Purity）的守恒"
    我们证明:哈密顿算符不改变系统的纯度.
    
    $$
    \frac{d}{dt} \operatorname{Tr}(\rho^2) = \operatorname{Tr}\left(\frac{d\rho^2}{dt}\right) = \operatorname{Tr}(2\rho\dot{\rho}) = \frac{1}{i\hbar}\operatorname{Tr}\Big(\rho(H\rho - \rho H)\Big) = 0.
    $$

### 测量

我们先定义:

- $P_k$在下文中代表了由投影算符,即 $P_k = |k\rangle\langle k|$.

- 同时测量算子$M= \sum_k \mu_k P_k$,其中 $\mu_k$是特征值

由我们之前学的,

$$
P(\mu_k) = \langle\psi| k \rangle \langle k|\psi\rangle = \langle\psi| P_k |\psi\rangle = \operatorname{Tr}(\rho P_k).
$$

> 这里其实和上一章的期望值计算很像,这里由于$P_k$的本征值就是1,所以概率在数值上等于期望

在测量之后,系统的状态会坍缩到对应的本征向量:$P_k \langle \psi |$

这里还要做一步归一化,由于 $P_k$ 是投影算符,所以 $P_k^2 = P_k$,因此为

$$
\frac{P_k \langle \psi|}{\sqrt{P_k \langle \psi | \psi \rangle P_k}} = \frac{P_k \langle \psi|}{\sqrt{P(\mu_k)}}.
$$

并且由此,我们可以得到密度矩阵:

$$
\rho = | \psi \rangle \langle \psi | = \frac{P_k \langle \psi |}{\sqrt{P(\mu_k)}} \frac{\langle \psi | P_k}{\sqrt{P(\mu_k)}} = \frac{P_k \langle \psi | \psi \rangle P_k}{P(\mu_k)} = \frac{P_k \rho P_k}{\operatorname{Tr}(\rho P_k)}.
$$


这个式子是我们已经知道测量的结果是$k$的时候,系统的状态.如果我们并不知道测量的结果,最佳的做法是混合所有状态:

$$
\epsilon(\rho) = \sum_k P_k \rho P_k = \sum_k |k\rangle \langle k| \rho |k\rangle \langle k| = \sum_k \langle k| \rho |k\rangle |k\rangle \langle k|.
$$
