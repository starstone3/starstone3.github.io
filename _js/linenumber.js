// ...existing code...
document.querySelectorAll("pre code").forEach((codeBlock) => {
    const lines = codeBlock.textContent.split("\n");
    if (lines[lines.length - 1].trim() === "") {
        lines.pop(); // 仅在最后一行空白时再删除
    }
    codeBlock.innerHTML = lines
        .map((line) => `<div style="white-space: pre;">${line || " "}</div>`)
        .join("");
});
// ...existing code...