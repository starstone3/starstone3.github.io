---
comments : true
hide:
    - feedback
---

<script defer src="https://vercount.one/js"></script>

# [Instruction Tuning for Large Language Models: A Survey](https://arxiv.org/abs/2308.10792)

Instruction Tuning优点与数据集:

**It involves further training LLMs using (INSTRUCTION, OUTPUT) pairs, where INSTRUCTION denotes the human instruction for the model, and OUTPUT denotes the desired output that follows the INSTRUCTION. The
benefits of IT are threefold: (1) Finetuning an LLM on the instruction dataset bridges the gap between
the next-word prediction objective of LLMs and the users’ objective of instruction following; (2)
IT allows for a more controllable and predictable model behavior compared to standard LLMs. The instructions serve to constrain the model’s outputs to align with the desired response characteristics
or domain knowledge, providing a channel for humans to intervene with the model’s behaviors;
and (3) IT is computationally efficient and can help LLMs rapidly adapt to a specific domain without
extensive retraining or architectural changes.
Each instance in an instruction dataset consists of
three elements: an instruction, which is a natural
language text sequence to specify the task (e.g.,
write a thank-you letter to XX for XX, write a blog
on the topic of XX, etc); an optional input which provides supplementary information for context;
and an anticipated output based on the instruction
and the input**
{: .notice}
<!--<span id="busuanzi_container_page_pv">本页总访问量<span id="busuanzi_value_page_pv"></span>次</span>
<span id="busuanzi_container_page_uv">本页总访客数 <span id="busuanzi_value_page_uv"></span> 人</span>-->