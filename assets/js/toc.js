document.addEventListener("DOMContentLoaded", function() {
  var toc = document.getElementById("toc");
  if (!toc) {
    console.log("没有找到 id 为 'toc' 的元素");
    return;
  }

  var headers = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
  if (headers.length === 0) {
    console.log("没有找到任何标题元素");
    return;
  }

  var tocList = document.createElement("ul");
  var currentLevel = 1;
  var currentList = tocList;
  var headerCount = 0;

  headers.forEach(function(header) {
    headerCount++;
    if (headerCount <= 3) {
      return; // 跳过前三个标题
    }

    var id = header.id || header.textContent.trim().toLowerCase().replace(/\s+/g, '-');
    header.id = id;

    var level = parseInt(header.tagName.substring(1));
    var tocItem = document.createElement("li");
    var tocLink = document.createElement("a");
    tocLink.href = "#" + id;
    tocLink.textContent = header.textContent;

    tocItem.appendChild(tocLink);

    if (level > currentLevel) {
      var newList = document.createElement("ul");
      currentList.lastElementChild.appendChild(newList);
      currentList = newList;
    } else if (level < currentLevel) {
      currentList = tocList;
      for (var i = 1; i < level; i++) {
        currentList = currentList.lastElementChild.lastElementChild;
      }
    }

    currentList.appendChild(tocItem);
    currentLevel = level;
  });

  toc.appendChild(tocList);
  console.log("目录已生成并添加到 'toc' 元素中");

  // 添加样式
  var style = document.createElement("style");
  style.innerHTML = `
    #toc {
      max-height: 80vh; /* 设置最大高度 */
      overflow-y: auto; /* 启用垂直滚动条 */
      max-width: 200px; /* 设置最大宽度 */
      border: 1px solid #ccc; /* 添加边框 */
      padding: 10px; /* 添加内边距 */
      background-color: #f9f9f9; /* 添加背景颜色 */
      position: fixed; /* 固定位置 */
      top: 80px; /* 距离顶部 10px */
      right: 150px; /* 距离右侧 10px */
      z-index: 1000; /* 确保在最上层 */
    }
    #toc ul {
      list-style-type: none; /* 去掉默认的列表样式 */
    }
    #toc li {
      margin-bottom: 0.5em;
    }
    #toc a {
      text-decoration: none;
      color: inherit;
      display: block; /* 确保链接元素占据整行 */
      word-break: break-word; /* 处理长单词的换行 */
      white-space: nowrap; /* 确保文本不换行 */
      overflow: hidden; /* 隐藏超出部分 */
      text-overflow: ellipsis; /* 使用省略号表示被截断的文本 */
    }
    #toc .toc-h1 a {
      font-size: 1.2em; /* 一级标题字体大小 */
      padding-left: 0; /* 一级标题无缩进 */
    }
    #toc .toc-h2 a {
      font-size: 1.1em; /* 二级标题字体大小 */
      padding-left: 20px; /* 二级标题缩进 */
    }
    #toc .toc-h3 a {
      font-size: 1em; /* 三级标题字体大小 */
      padding-left: 40px; /* 三级标题缩进 */
    }
    #toc .toc-h4 a {
      font-size: 0.9em; /* 四级标题字体大小 */
      padding-left: 60px; /* 四级标题缩进 */
    }
    #toc .toc-h5 a {
      font-size: 0.8em; /* 五级标题字体大小 */
      padding-left: 80px; /* 五级标题缩进 */
    }
    #toc .toc-h6 a {
      font-size: 0.7em; /* 六级标题字体大小 */
      padding-left: 100px; /* 六级标题缩进 */
    }
  `;
  document.head.appendChild(style);
  console.log("样式已添加");
});