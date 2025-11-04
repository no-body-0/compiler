// === Setup CodeMirror (Script Editor) ===
const editor = CodeMirror.fromTextArea(document.getElementById("codeEditor"), {
  mode: "python",
  theme: "dracula",
  lineNumbers: true,
  autoCloseBrackets: true,
  lineWrapping: true,
});

const langSelect = document.getElementById("languageSelect");
const runBtn = document.getElementById("runBtn");
const inputField = document.getElementById("inputField");
const outputBox = document.getElementById("outputBox");

// === Change Syntax Mode ===
langSelect.addEventListener("change", () => {
  const modeMap = { python: "python", c: "text/x-csrc", sql: "text/x-sql" };
  editor.setOption("mode", modeMap[langSelect.value]);
});

// === Run Code Function ===
async function runCode() {
  const lang = langSelect.value;
  const code = editor.getValue().trim();
  const stdin = inputField.value;

  if (!code) {
    outputBox.textContent = ">>> ";
    return;
  }

  outputBox.textContent = `>>> Running ${lang.toUpperCase()} Script...\n`;
  
  try {
    const res = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: lang,
        version: "*",
        files: [{ name: "main." + lang, content: code }],
        stdin: stdin
      }),
    });

    const data = await res.json();
    const output = data.run?.output || data.message || "";

    // === Make Output Look Like Real Python Terminal ===
    const lines = code.split("\n");
    let formatted = "";
    lines.forEach(line => {
      if (line.trim()) formatted += ">>> " + line + "\n";
    });
    formatted += output.trim() + "\n>>> ";

    outputBox.textContent = formatted;
    outputBox.scrollTop = outputBox.scrollHeight;
  } catch (err) {
    outputBox.textContent = "⚠️ Error: " + err.message;
  }
}

// === Button & Keyboard Shortcuts ===
runBtn.addEventListener("click", runCode);
window.addEventListener("keydown", (e) => {
  if (e.key === "F5") {
    e.preventDefault();
    runCode();
  }
});
