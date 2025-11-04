// --- Setup CodeMirror ---
const editor = CodeMirror.fromTextArea(document.getElementById('codeEditor'), {
  mode: "python",
  theme: "dracula",
  lineNumbers: true,
  autoCloseBrackets: true,
});

const langSelect = document.getElementById('languageSelect');
const runBtn = document.getElementById('runBtn');
const shareBtn = document.getElementById('shareBtn');
const outputBox = document.getElementById('outputBox');

// --- Switch syntax mode ---
langSelect.addEventListener('change', () => {
  const modeMap = { python: "python", c: "text/x-csrc", sql: "text/x-sql" };
  editor.setOption("mode", modeMap[langSelect.value]);
});

// --- Run with Piston API ---
runBtn.addEventListener('click', async () => {
  const code = editor.getValue();
  const lang = langSelect.value;
  outputBox.textContent = "⏳ Running...";

  try {
    const res = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: lang,
        version: "*",
        files: [{ name: "main." + lang, content: code }]
      })
    });
    const data = await res.json();
    outputBox.textContent = data.run?.output || data.message || "No output.";
  } catch (e) {
    outputBox.textContent = "⚠️ " + e.message;
  }
});

// --- Share code via GitHub Gist ---
shareBtn.addEventListener('click', async () => {
  const code = editor.getValue();
  const lang = langSelect.value;
  const gistData = {
    description: "Shared from Dev Bhai’s Online Compiler",
    public: true,
    files: { ["code." + lang]: { content: code } }
  };

  const token = ""; // ⚠️ empty here — GitHub Pages cannot expose secrets

  if (!token) {
    alert("⚠️ GitHub Pages cannot use secrets directly.\nUse this script locally or through a simple proxy server to hide your token.");
    return;
  }

  try {
    const res = await fetch("https://api.github.com/gists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "token " + token
      },
      body: JSON.stringify(gistData)
    });

    const data = await res.json();
    if (data.html_url) {
      const link = `${location.origin + location.pathname}?gist=${data.id}`;
      navigator.clipboard.writeText(link);
      alert("✅ Link copied!\n" + link);
    } else {
      alert("⚠️ Failed to create gist");
    }
  } catch (e) {
    alert("Error: " + e.message);
  }
});

// --- Auto-load code from ?gist=ID ---
window.addEventListener("load", async () => {
  const params = new URLSearchParams(window.location.search);
  const gistId = params.get("gist");
  if (!gistId) return;

  try {
    const res = await fetch(`https://api.github.com/gists/${gistId}`);
    const data = await res.json();
    const file = Object.values(data.files)[0];
    editor.setValue(file.content);
  } catch (e) {
    console.error(e);
  }
});
