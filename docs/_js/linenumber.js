document.querySelectorAll("pre code").forEach((codeBlock) => {
    const lines = codeBlock.textContent.split("\n").slice(0, -1); // 删除最后一个空行
    codeBlock.innerHTML = lines
        .map((line) => `<div>${line || " "}</div>`) // 包裹每行，保留空行
        .join(""); // 将它们拼接回 HTML 中
});
