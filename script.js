// ===== Share Code via GitHub Action =====
async function shareCode() {
  const code = editor.getValue();
  const language = document.getElementById("languageSelect").value;
  const filename = language + "_" + Date.now();

  // Trigger the GitHub Action to save as a Gist
  const response = await fetch(
    "https://api.github.com/repos/no-body-0/compiler/actions/workflows/save-code.yml/dispatches",
    {
      method: "POST",
      headers: {
        "Accept": "application/vnd.github.v3+json",
        // NOTE: Leave token empty for public repo; use secret proxy if private
        // "Authorization": "token YOUR_TOKEN",
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
    // Create a short link (optional)
    const longUrl = `https://gist.github.com/no-body-0`;
    const shortResponse = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(longUrl)}`);
    const shortURL = await shortResponse.text();

    alert(`✅ Code shared successfully!\nPermanent link: ${shortURL}`);
  } else {
    const err = await response.text();
    alert("❌ Error saving code!");
    console.error(err);
  }
}
