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

    tocLink.addEventListener("click", function(e) {
      e.preventDefault();

      // 移除所有标题和目录链接的红色样式
      headers.forEach(function(h) {
        h.style.color = "";
      });
      var tocLinks = document.querySelectorAll("#toc a");
      tocLinks.forEach(function(link) {
        link.style.color = "";
      });

      // 将点击的标题和目录链接变成红色
      header.style.color = "red";
      tocLink.style.color = "red";

      // 平滑滚动到目标位置
      var offset = 75; // 根据你的固定头部高度调整
      var elementPosition = header.getBoundingClientRect().top + window.pageYOffset;
      var offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    });

    tocLink.addEventListener("mouseover", function() {
      tocLink.style.color = "lightcoral"; // 鼠标悬浮时目录链接颜色变淡
      header.style.color = "lightcoral"; // 鼠标悬浮时标题颜色变淡
    });

    tocLink.addEventListener("mouseout", function() {
      if (tocLink.style.color !== "red") {
        tocLink.style.color = ""; // 鼠标移开时恢复原颜色
        header.style.color = ""; // 鼠标移开时恢复原颜色
      }
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
        max-height: 80vh; /* 设置最大高度为视口高度的 80%，使其在内容过多时可以滚动 */
        overflow-y: auto; /* 当内容溢出时，垂直方向显示滚动条 */
        max-width: 200px; /* 设置最大宽度为 200 像素 */
        border: 1px solid #ccc; /* 设置边框为 1 像素宽的实线，颜色为浅灰色 */
        padding: 10px; /* 设置内边距为 10 像素 */
        background: linear-gradient(135deg, #f9f9f9, #e0e0e0); /* 设置背景为从浅灰色到稍深灰色的渐变 */
        position: fixed; /* 设置元素为固定定位，使其在页面滚动时保持在固定位置 */
        top: 80px; /* 设置元素距离视口顶部 80 像素 */
        right: 150px; /* 设置元素距离视口右侧 150 像素 */
        z-index: 1000; /* 设置元素的堆叠顺序，使其在其他元素之上 */
        cursor: move; /* 设置鼠标指针为移动指针，表示元素可拖动 */
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 添加阴影，使元素看起来有深度 */
        border-radius: 8px; /* 设置边框为圆角，使其看起来更柔和 */
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

  // 计算最长标题的宽度
  var maxWidth = 200; // 最大宽度
  var padding = 20; // 内边距
  var longestWidth = 0;

  headers.forEach(function(header) {
    var width = header.offsetWidth;
    if (width > longestWidth) {
      longestWidth = width;
    }
  });

  // 设置目录的宽度
  var tocWidth = Math.min(longestWidth + padding, maxWidth);
  toc.style.width = tocWidth + "px";

  // 添加拖动功能
  var isDragging = false;
  var startX, startY, initialX, initialY;

  toc.addEventListener("mousedown", function(e) {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    initialX = toc.offsetLeft;
    initialY = toc.offsetTop;
    toc.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", function(e) {
    if (isDragging) {
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      toc.style.left = initialX + dx + "px";
      toc.style.top = initialY + dy + "px";
    }
  });

  document.addEventListener("mouseup", function() {
    isDragging = false;
    toc.style.cursor = "move";
  });

  // 触屏支持
  toc.addEventListener("touchstart", function(e) {
    isDragging = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    initialX = toc.offsetLeft;
    initialY = toc.offsetTop;
    toc.style.cursor = "grabbing";
  });

  document.addEventListener("touchmove", function(e) {
    if (isDragging) {
      var dx = e.touches[0].clientX - startX;
      var dy = e.touches[0].clientY - startY;
      toc.style.left = initialX + dx + "px";
      toc.style.top = initialY + dy + "px";
    }
  });

  document.addEventListener("touchend", function() {
    isDragging = false;
    toc.style.cursor = "move";
  });
});