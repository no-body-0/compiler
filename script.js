// script.js
// set your backend host here (no protocol)
const BACKEND_HOST = "backend-repo-j0ed.onrender.com"; // e.g. backend-repo-j0ed.onrender.com
const BACKEND_HTTP = `https://${BACKEND_HOST}`;
const BACKEND_WS = `wss://${BACKEND_HOST}/runlive`;

// Initialize CodeMirror editor
const editor = CodeMirror.fromTextArea(document.getElementById("codeEditor"), {
  mode: "python",
  theme: "default",
  lineNumbers: true,
  autoCloseBrackets: true,
  lineWrapping: true,
});

// UI elements
const runBtn = document.getElementById("runBtn");
const stopBtn = document.getElementById("stopBtn");
const clearBtn = document.getElementById("clearBtn");
const outputBox = document.getElementById("outputBox");
const inputBox = document.getElementById("inputBox");
const runSqlBtn = document.getElementById("runSqlBtn");
const clearSqlBtn = document.getElementById("clearSqlBtn");
const sqlEditor = document.getElementById("sqlEditor");
const sqlResult = document.getElementById("sqlResult");

let ws = null;

// start interactive session
function startSession() {
  stopSession(); // ensure previous closed
  outputBox.textContent = "";
  outputBox.textContent += ">>> Starting live Python session...\n";

  ws = new WebSocket(BACKEND_WS);
  ws.onopen = () => {
    const code = editor.getValue();
    ws.send(code);
  };

  ws.onmessage = (ev) => {
    // append raw server output
    outputBox.textContent += ev.data;
    outputBox.scrollTop = outputBox.scrollHeight;
  };

  ws.onclose = () => {
    outputBox.textContent += "\n[Session ended]\n";
  };

  ws.onerror = (e) => {
    outputBox.textContent += "\n[WebSocket error]\n";
    console.error(e);
  };
}

function stopSession() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    try { ws.send("___TERMINATE___"); } catch(e){}
    try { ws.close(); } catch(e){}
  }
  ws = null;
}

// send input on Enter
inputBox.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const text = inputBox.value;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      outputBox.textContent += "\n[Session not running]\n";
      inputBox.value = "";
      return;
    }
    // echo to output like terminal
    outputBox.textContent += text + "\n";
    ws.send(text);
    inputBox.value = "";
  }
});

// Buttons
runBtn.addEventListener("click", startSession);
stopBtn.addEventListener("click", stopSession);
clearBtn.addEventListener("click", () => { outputBox.textContent = ""; });

// F5 to run
window.addEventListener("keydown", (e) => {
  if (e.key === "F5") { e.preventDefault(); startSession(); }
});

// SQL execution (POST to /sql)
runSqlBtn.addEventListener("click", async () => {
  const q = sqlEditor.value.trim();
  if (!q) return;
  sqlResult.textContent = "Running SQL...";
  try {
    const res = await fetch(`${BACKEND_HTTP}/sql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q })
    });
    const data = await res.json();
    if (data.status === "ok") {
      if (data.columns && data.rows) {
        // render table
        const cols = data.columns;
        const rows = data.rows;
        let html = "<table style='width:100%;border-collapse:collapse;'><thead><tr>";
        cols.forEach(c => html += `<th style="border-bottom:1px solid #333;padding:6px;text-align:left">${c}</th>`);
        html += "</tr></thead><tbody>";
        rows.forEach(r => {
          html += "<tr>";
          cols.forEach(c => html += `<td style="padding:6px;border-bottom:1px solid #222">${r[c] ?? ""}</td>`);
          html += "</tr>";
        });
        html += "</tbody></table>";
        sqlResult.innerHTML = html;
      } else {
        sqlResult.textContent = data.message || "Query OK";
      }
    } else {
      sqlResult.textContent = "SQL Error: " + data.error;
    }
  } catch (e) {
    sqlResult.textContent = "Network/Server error: " + e.message;
  }
});

clearSqlBtn.addEventListener("click", () => {
  sqlEditor.value = "";
  sqlResult.textContent = "";
});
