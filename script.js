// === Setup CodeMirror Editor (Script Area) ===
const editor = CodeMirror.fromTextArea(document.getElementById('codeEditor'), {
  mode: "python",
  theme: "dracula",
  lineNumbers: true,
  autoCloseBrackets: true,
  lineWrapping: true
});

// === Selectors ===
const langSelect = document.getElementById('languageSelect');
const runBtn = document.getElementById('runBtn');
const shareBtn = document.getElementById('shareBtn');
const outputBox = document.getElementById('outputBox');

// === Input Field (for user stdin) ===
const inputField = document.createElement("textarea");
inputField.placeholder = "Enter input() values (each line = one input)";
inputField.style.width = "80vw";
inputField.style.height = "60px";
inputField.style.marginTop = "8px";
inputField.style.background = "#282a36";
inputField.style.color = "#f8f8f2";
inputField.style.border = "1px solid #44475a";
inputField.style.borderRadius = "6px";
inputField.style.fontFamily = "Fira Code, monospace";
inputField.style.fontSize = "14px";
inputField.style.padding = "6px";
document.querySelector(".output").before(inputField);

// === Change Syntax Highlighting by Language ===
langSelect.addEventListener('change', () => {
  const modeMap = { python: "python", c: "text/x-csrc", sql: "text/x-sql" };
  editor.setOption("mode", modeMap[langSelect.value]);
});

// === Run Button Event ===
runBtn.addEventListener('click', async () => {
  const code = editor.getValue().trim();
  const lang = langSelect.value;
  const inputText = inputField.value;

  if (!code) {
    outputBox.textContent = ">>> ";
    return;
  }

  // Clear and prepare "interactive" shell style
  outputBox.textContent = "";
  outputBox.style.whiteSpace = "pre-wrap";
  outputBox.textContent = `>>> Running ${lang.toUpperCase()} Script\n`;

  try {
    const res = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: lang,
        version: "*",
        files: [{ name: "main." + lang, content: code }],
        stdin: inputText
      })
    });

    const data = await res.json();
    let output = data.run?.output || data.message || "";

    // Simulate Python interactive output style
    const codeLines = code.split("\n");
    let shellOutput = "";
    codeLines.forEach(line => {
      if (line.trim()) shellOutput += `>>> ${line}\n`;
    });
    shellOutput += output ? output.trim() + "\n>>> " : ">>> ";

    outputBox.textContent = shellOutput;
  } catch (e) {
    outputBox.textContent = "⚠️ " + e.message;
  }
});
