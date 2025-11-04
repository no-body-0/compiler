const editor = CodeMirror.fromTextArea(document.getElementById("codeEditor"), {
  mode: "python",
  theme: "dracula",
  lineNumbers: true,
  autoCloseBrackets: true,
  lineWrapping: true,
});

const runBtn = document.getElementById("runBtn");
const langSelect = document.getElementById("languageSelect");
const outputBox = document.getElementById("outputBox");

async function runCode() {
  const lang = langSelect.value;
  const code = editor.getValue();

  outputBox.textContent = "Running your code...\n";

  try {
    const response = await fetch("https://backend-repo-j0ed.onrender.com/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: lang, code }),
    });
    const data = await response.json();
    outputBox.textContent = data.output;
  } catch (err) {
    outputBox.textContent = "Error: " + err.message;
  }
}

runBtn.addEventListener("click", runCode);
