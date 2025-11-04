// === Initialize CodeMirror ===
const editor = CodeMirror.fromTextArea(document.getElementById("codeEditor"), {
  mode: "python",
  theme: "dracula",
  lineNumbers: true,
  autoCloseBrackets: true,
  lineWrapping: true,
});

const runBtn = document.getElementById("run-btn");
const inputBox = document.getElementById("input-area");
const outputBox = document.getElementById("output-box");

runBtn.addEventListener("click", () => startSession());
window.addEventListener("keydown", e => { if (e.key === "F5") { e.preventDefault(); startSession(); } });

let ws;

function startSession() {
  const code = editor.getValue();
  outputBox.textContent = ">>> Running...\n";
  inputBox.value = "";

  ws = new WebSocket("wss://backend-repo-j0ed.onrender.com/runlive");

  ws.onopen = () => ws.send(code);

  ws.onmessage = (event) => {
    outputBox.textContent += event.data;
    outputBox.scrollTop = outputBox.scrollHeight;
  };

  ws.onclose = () => {
    outputBox.textContent += "\n\n[Session ended]";
  };
}

inputBox.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && ws && ws.readyState === WebSocket.OPEN) {
    e.preventDefault();
    ws.send(inputBox.value);
    inputBox.value = "";
  }
});
