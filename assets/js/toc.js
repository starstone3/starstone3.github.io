document.addEventListener("DOMContentLoaded", function() {
  var toc = document.getElementById("toc");
  if (!toc) {
    console.log("没有找到 id 为 'toc' 的元素");
    return;
  }

  var tocTitle = "本页内容"; // 这里替换为实际的值，例如从服务器获取或通过其他方式传递

  var tocHeader = document.createElement("div");
  tocHeader.innerHTML = '<i class="fa fa-file-text"></i> ' + tocTitle;
  toc.appendChild(tocHeader);

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
    if (headerCount <= 2) {
      return; // 跳过前两个标题
    }

    var id = header.id || header.textContent.trim().toLowerCase().replace(/\s+/g, '-');
    header.id = id;

    var level = parseInt(header.tagName.substring(1));
    var tocItem = document.createElement("li");
    var tocLink = document.createElement("a");
    tocLink.href = "#" + id;
    tocLink.textContent = header.textContent;

    tocLink.addEventListener("click", function() {
      // 移除所有标题的红色样式
      headers.forEach(function(h) {
        h.style.color = "";
      });
      // 将点击的标题变成红色
      header.style.color = "red";
    });

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

  var style = document.createElement("style");
  style.innerHTML = `
    #toc {
      max-height: 80vh;
      overflow-y: auto;
      max-width: 200px;
      border: 1px solid #ccc;
      padding: 10px;
      background-color: #f9f9f9;
      position: fixed;
      top: 80px;
      right: 150px;
      z-index: 1000;
    }
    #toc ul {
      list-style-type: none;
    }
    #toc li {
      margin-bottom: 1.0em;
    }
    #toc a {
      text-decoration: none;
      color: inherit;
      display: block;
      word-break: break-word;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    #toc ul a {
      font-size: 1.2em;
      padding-left: 0;
      color: #333;
    }
    #toc ul ul a {
      font-size: 1.1em;
      padding-left: 20px;
      color: #555;
    }
    #toc ul ul ul a {
      font-size: 1em;
      padding-left: 40px;
      color: #777;
    }
    #toc ul ul ul ul a {
      font-size: 0.9em;
      padding-left: 60px;
      color: #999;
    }
    #toc ul ul ul ul ul a {
      font-size: 0.8em;
      padding-left: 80px;
      color: #bbb;
    }
    #toc ul ul ul ul ul ul a {
      font-size: 0.7em;
      padding-left: 100px;
      color: #ddd;
    }
  `;
  document.head.appendChild(style);
  console.log("样式已添加");
});
