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
      white-space: pre-wrap; /* 保证每个标题单独换行 */
    }
    #toc a {
      text-decoration: none;
      color: inherit;
    }
  `;
  document.head.appendChild(style);
});