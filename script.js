const output = document.getElementById("output");
const runBtn = document.getElementById("run");
const shareBtn = document.getElementById("share");
const langSelect = document.getElementById("lang");

// Initialize CodeMirror
const editor = CodeMirror.fromTextArea(document.getElementById("code"), {
  lineNumbers: true,
  mode: "python",
  theme: "dracula",
  autoCloseBrackets: true,
  matchBrackets: true,
  indentUnit: 4,
  smartIndent: true,
  tabSize: 4
});

// Supported versions
const versions = {
  python: "3.10.0",
  c: "10.2.0",
  sqlite3: "3.34.0"
};

// Update CodeMirror mode when language changes
langSelect.addEventListener("change", () => {
  const lang = langSelect.value;
  let mode = "python";
  if (lang === "c") mode = "text/x-csrc";
  else if (lang === "sqlite3") mode = "text/x-sql";
  editor.setOption("mode", mode);
});

// Run code using Piston API
runBtn.onclick = async () => {
  const code = editor.getValue().trim();
  const lang = langSelect.value;

  if (!code) {
    output.textContent = "⚠️ Please write some code first!";
    return;
  }

  output.textContent = "⏳ Running...";

  try {
    const res = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: lang,
        version: versions[lang] || "latest",
        files: [{ content: code }]
      })
    });

    const data = await res.json();
    output.textContent = data.run.output || "✅ Executed with no output";
  } catch (err) {
    output.textContent = "❌ Error executing code!";
  }
};

// Share link with code + language
shareBtn.onclick = async () => {
  const code = encodeURIComponent(editor.getValue());
  const lang = encodeURIComponent(langSelect.value);
  const shareURL = `${window.location.origin}?lang=${lang}&code=${code}`;
  await navigator.clipboard.writeText(shareURL);
  alert("🔗 Share link copied!");
};

// Load shared code from URL
window.onload = () => {
  const params = new URLSearchParams(window.location.search);
  const sharedCode = params.get("code");
  const sharedLang = params.get("lang");

  if (sharedLang) {
    langSelect.value = sharedLang;
    if (sharedLang === "c") editor.setOption("mode", "text/x-csrc");
    else if (sharedLang === "sqlite3") editor.setOption("mode", "text/x-sql");
    else editor.setOption("mode", "python");
  }

  if (sharedCode) editor.setValue(decodeURIComponent(sharedCode));
};
