// === CodeMirror Setup ===
const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
  mode: "python",
  theme: "default",
  lineNumbers: true,
  indentUnit: 4,
  extraKeys: { "Tab": "indentMore" }
});

const outputDiv = document.getElementById("output");
const inputBox = document.getElementById("inputBox");

// === RUN CODE ===
document.getElementById("runBtn").addEventListener("click", async () => {
  const code = editor.getValue().trim();
  if (!code) {
    outputDiv.textContent = "⚠️ Write some Python code first!";
    return;
  }

  const inputText = inputBox.value;
  outputDiv.textContent = "Running...\n";

  try {
    // Use Piston API to run Python
    const res = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "python",
        version: "3.10.0",
        files: [{ content: code }],
        stdin: inputText
      })
    });

    const result = await res.json();

    if (result.run) {
      const stdout = result.run.stdout || "";
      const stderr = result.run.stderr || "";
      const combined =
        (stdout ? stdout : "") +
        (stderr ? "\n" + stderr : "");
      outputDiv.textContent = combined.trim() || "(no output)";
    } else {
      outputDiv.textContent = "⚠️ Error: Unexpected response format.";
    }
  } catch (error) {
    outputDiv.textContent = `❌ Error: ${error.message}`;
  }
});

// === CLEAR OUTPUT ===
document.getElementById("clearBtn").addEventListener("click", () => {
  outputDiv.textContent = "";
});

// === STOP (not needed for piston) ===
document.getElementById("stopBtn").addEventListener("click", () => {
  outputDiv.textContent += "\n⚠️ Program stopped manually.";
});
