---
comments: true
---

# 数据级并行

## Vector Architecture
> Grab sets of data elements scattered about memory:抓取分散在内存中的一组数据元素
>
> Place them in large sequential reg files
>
> Operate on data in those data files
>
> Disperse the results back to memory:将结果重新分散回内存

也就是说,向量架构的核心思想就是**集中读取**,**统一处理**,**批量写回**.