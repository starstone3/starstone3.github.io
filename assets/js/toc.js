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

  headers.forEach(function(header) {
    var id = header.id || header.textContent.trim().toLowerCase().replace(/\s+/g, '-');
    header.id = id;

    var tocItem = document.createElement("li");
    var tocLink = document.createElement("a");
    tocLink.href = "#" + id;
    tocLink.textContent = header.textContent;

    tocItem.appendChild(tocLink);
    tocList.appendChild(tocItem);
  });

  toc.appendChild(tocList);
  console.log("目录已生成并添加到 'toc' 元素中");

  // 添加样式
  var style = document.createElement("style");
  style.innerHTML = `
    #toc ul {
      list-style-type: none;
      padding-left: 0;
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
  `;
  document.head.appendChild(style);
  console.log("样式已添加");
});