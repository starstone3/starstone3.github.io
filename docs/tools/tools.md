---
comments : true
---

<script defer src="https://vercount.one/js"></script>

# 妙妙小工具

## 画图，画树小工具

[link](https://csacademy.com/app/graph_editor)

## 课件文献管理

[zotero](https://www.zotero.org/)，加上翻译插件yyds

## mkdocs

### ???块

??? note "这是一个注释块"
    这里是注释内容。note

??? info "这是一个信息块"
    这里是信息内容。info

??? tip "这是一个提示块"
    这里是提示内容。tip

??? warning "这是一个警告块"
    这里是警告内容。warning

??? danger "这是一个危险块"
    这里是危险内容。danger

??? example "这是一个示例块"
    这里是示例内容。example

??? quote "这是一个引用块"
    这里是引用内容。quote


## latex公式工具

https://www.latexlive.com/

## 红黑树可视化

https://www.cs.usfca.edu/~galles/visualization/RedBlack.html

## Linux 命令行下使用clash

先把clash的执行文件放进去.

使用命令(具体见glados的配置页面):
```bash
curl https://update.glados-config.com/clash/114514/1919810/233/glados-terminal.yaml > glados.yaml

```

这样得到glados.yaml文件，这就是clash的配置文件.

然后使用命令:
```bash
chmod +x ./clash-linux-amd64-v1.16.0
 ./clash-linux-amd64-v1.16.0 -f glados.yaml -d .
```
就可以使用clash了.

但这样的启动命令太烦了，在.bashrc中加入(具体根据自己的情况修改):
```bash
alias startclash='/home6/pxl/clash -f /home6/pxl/glados.yaml -d /home6/pxl'
export http_proxy=http://127.0.0.1:7892
export https_proxy=http://127.0.0.1:7892
export all_proxy=socks5://127.0.0.1:7891
```

然后使用命令重启.bashrc:
```bash
source ~/.bashrc
```

这样就可以使用startclash命令启动clash了.
使用命令测试:
```bash
curl https://www.google.com
```
如果返回了google的html代码，那么就成功了.
或者使用:
```bash
curl -I https://www.google.com
```
查看返回的状态码是否为200.

<!--<span id="busuanzi_container_page_pv">本页总访问量<span id="busuanzi_value_page_pv"></span>次</span>
<span id="busuanzi_container_page_uv">本页总访客数 <span id="busuanzi_value_page_uv"></span> 人</span>-->