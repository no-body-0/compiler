// ==========================
//   Online Compiler Script
//   By Dev Bhai 😎
// ==========================

// Initialize CodeMirror editor
const editor = CodeMirror.fromTextArea(document.getElementById("codeEditor"), {
  mode: "python",
  theme: "dracula",
  lineNumbers: true,
  autoCloseBrackets: true,
  matchBrackets: true,
  indentUnit: 4,
  tabSize: 4,
  viewportMargin: Infinity,
  lineWrapping: true,
});

// Language mode switch
const languageSelect = document.getElementById("languageSelect");
languageSelect.addEventListener("change", () => {
  const lang = languageSelect.value;
  let mode = "python";
  if (lang === "c") mode = "text/x-csrc";
  else if (lang === "sql") mode = "text/x-sql";
  editor.setOption("mode", mode);
});

// ==========================
//   RUN CODE (via Piston API)
// ==========================
async function runCode() {
  const code = editor.getValue();
  const language = languageSelect.value;
  const output = document.getElementById("output");

  output.textContent = "⏳ Running your code...";

  const languageMap = {
    python: "python3",
    c: "c",
    sql: "sqlite3",
  };

  const selectedLanguage = languageMap[language] || language;

  try {
    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: selectedLanguage,
        version: "*",
        files: [{ name: `main.${language}`, content: code }],
      }),
    });

    const data = await response.json();

    let result = "";
    if (data.run && data.run.output) {
      result = data.run.output;
    } else if (data.compile && data.compile.output) {
      result = data.compile.output;
    } else {
      result = "⚠️ No output or error occurred.";
    }

    // Python interpreter-style formatting
    if (language === "python") {
      const lines = code.split("\n").map(l => ">>> " + l).join("\n");
      output.textContent = `${lines}\n\n${result}`;
    } else {
      output.textContent = result;
    }
  } catch (err) {
    output.textContent = "❌ Error connecting to Piston API.";
    console.error(err);
  }
}

// ==========================
//   SHARE CODE (via GitHub Action)
// ==========================
async function shareCode() {
  const code = editor.getValue();
  const language = languageSelect.value;
  const filename = language + "_" + Date.now();

  const response = await fetch(
    "https://api.github.com/repos/no-body-0/compiler/actions/workflows/save-code.yml/dispatches",
    {
      method: "POST",
      headers: {
        "Accept": "application/vnd.github.v3+json",
        // no token needed in frontend (security!)
      },
      body: JSON.stringify({
        ref: "main",
        inputs: {
          filename: filename,
          content: code,
          language: language === "python" ? "py" : language,
        },
      }),
    }
  );

  if (response.ok) {
    // Optional short URL (is.gd)
    const longUrl = `https://gist.github.com/no-body-0`;
    const shortResponse = await fetch(
      `https://is.gd/create.php?format=simple&url=${encodeURIComponent(longUrl)}`
    );
    const shortURL = await shortResponse.text();
    alert(`✅ Code shared successfully!\nPermanent Gist link:\n${shortURL}`);
  } else {
    const err = await response.text();
    alert("❌ Error saving code!");
    console.error(err);
  }
}

// ==========================
//   Attach Button Listeners
// ==========================
document.getElementById("runBtn").addEventListener("click", runCode);
document.getElementById("shareBtn").addEventListener("click", shareCode);
