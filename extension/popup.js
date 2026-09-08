const $ = (id) => document.getElementById(id);

$("go").addEventListener("click", async () => {
  const raw = $("raw").value.trim();
  const model = $("model").value;
  const err = $("err"); err.textContent = "";
  if (raw.length < 3) { err.textContent = "Type a prompt first."; return; }
  $("go").disabled = true;
  $("go").textContent = "Working…";
  try {
    const resp = await chrome.runtime.sendMessage({
      type: "ENHANCE",
      payload: { raw_prompt: raw, target_model: model }
    });
    if (!resp?.ok) throw new Error(resp?.error || "Failed");
    const out = $("out");
    out.hidden = false;
    out.textContent = resp.data.final_prompt;
    $("copy").hidden = false;
  } catch (e) {
    err.textContent = String(e);
  } finally {
    $("go").disabled = false;
    $("go").textContent = "Enhance";
  }
});

$("copy").addEventListener("click", async () => {
  const out = $("out").textContent || "";
  await navigator.clipboard.writeText(out);
  $("copy").textContent = "Copied!";
  setTimeout(() => ($("copy").textContent = "Copy"), 1200);
});
