<script defer src="https://vercount.one/js"></script>
---
comments : true
hide :
    - feedback
---



# Transformer

Transformer模型包含两个主要部分：Encoder（编码器）和Decoder（解码器）。

## Encoder

Encoder的主要功能是将输入序列转换为一个连续表示。具体步骤如下：

1. **输入嵌入（Input Embedding）**：
    * 输入序列会先被分割成一个个token，每个token会被嵌入（embedding）到一个$d_{model}$维的词向量中。
    * 另外，还会根据这个token在序列中的位置生成一个$d_{model}$维的位置向量（Positional Encoding），具体公式为：
    $$
    PE(pos,2i)=\sin(\frac{pos}{10000^\frac{2i}{d_{model}}})
    $$
    $$
    PE(pos,2i+1)=\cos(\frac{pos}{10000^\frac{2i}{d_{model}}})
    $$
    这两个公式分别给出了奇数位与偶数位的位置编码计算方法。最后，将词向量与位置向量相加，得到这个token的最终输入向量。

2. **多头注意力机制（Multi-Head Attention）**：
    * 每个token会有一个注意力矩阵，公式为：
    $$
    Attention(Q,K,V)=softmax(\frac{QK^T}{\sqrt{d_k}})V
    $$
    具体解释如下：
        * **Q（Query）**：通过一个矩阵$W^Q$乘上输入向量得到。
        * **K（Key）**：通过一个矩阵$W^K$乘上输入向量得到。
        * **V（Value）**：通过一个矩阵$W^V$乘上输入向量得到。
        * 除以$$\sqrt{d_k}$$的目的是防止梯度消失，因为Q和K的点积可能会产生很大的值。
    * 实际上，可能存在多个注意力头，每个注意力头的$W^Q$、$W^K$和$W^V$矩阵是不一样的，这样可以让不同的注意力头关注不同的内容。这些不同的注意力头产生的结果矩阵再拼接起来。

3. **残差连接（Residual Connection）**：
    * 自注意力机制计算完后，会进行残差连接，即：
    $$
    Output = Attention(x) + x
    $$
    这是为了防止在深层次的神经网络中信息丢失、梯度消失或者发生退化的情况。

4. **层归一化（Layer Normalization）**：
    * 计算均值和方差进行归一化处理。

5. **前馈神经网络（Feed-Forward Neural Network）**：
    * 使用两个线性变换和一个ReLU非线性变换，最后进行残差连接和归一化处理。

## Decoder

Decoder的主要功能是将Encoder的输出转换为目标序列。具体步骤如下：

1. **输入嵌入（Input Embedding）**：
    * 与Encoder类似，输入序列会被分割成token，并嵌入到$d_{model}$维的词向量中，同时生成位置向量。

2. **Masked Multi-Head Attention**：
    * Decoder中存在一个Masked Multi-Head Attention层，在生成一个token时，使其不能关注未来生成token的信息，使用一个上三角矩阵进行掩码处理。

3. **Encoder-Decoder Attention**：
    * Decoder还存在一个交互层，接受来自Encoder的K和V矩阵进行多头注意力机制。

4. **残差连接和层归一化**：
    * 与Encoder类似，进行残差连接和层归一化处理。

5. **前馈神经网络**：
    * 使用两个线性变换和一个ReLU非线性变换，最后进行残差连接和归一化处理。

<span id="busuanzi_container_page_pv">本页总访问量<span id="busuanzi_value_page_pv"></span>次</span>
<span id="busuanzi_container_page_uv">本页总访客数 <span id="busuanzi_value_page_uv"></span> 人</span>