document.addEventListener("DOMContentLoaded", function() {
  var toc = document.getElementById("toc");
  if (!toc) return;

  var headers = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
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
    #toc {
      max-width: 200px; /* 设置最大宽度 */
    }
  `;
  document.head.appendChild(style);
});