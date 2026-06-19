// Client-side behavior for the ShareNote button.
// On click: decode the embedded markdown, POST it to the render endpoint,
// and copy the returned public URL to the clipboard.

function decodeMarkdown(b64: string): string {
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function setLabel(btn: HTMLButtonElement, text: string) {
  const label = btn.querySelector(".share-note-label");
  if (label) label.textContent = text;
}

async function onShareClick(this: HTMLButtonElement, e: Event) {
  e.preventDefault();
  const btn = this;
  if (btn.dataset.busy === "true") return;

  const encoded = btn.dataset.markdown;
  const endpoint = btn.dataset.endpoint;
  if (!encoded || !endpoint) return;

  btn.dataset.busy = "true";
  const original = btn.querySelector(".share-note-label")?.textContent ?? "Share";
  setLabel(btn, "Publishing…");

  try {
    const markdown = decodeMarkdown(encoded);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markdown }),
    });
    if (!res.ok) {
      throw new Error(`render failed: ${res.status}`);
    }
    const data = (await res.json()) as { url?: string };
    if (!data.url) {
      throw new Error("no url in response");
    }

    const copied = await copyToClipboard(data.url);
    btn.dataset.shareUrl = data.url;
    setLabel(btn, copied ? "Link copied!" : "Open link");
    if (!copied) {
      window.open(data.url, "_blank", "noopener");
    }
  } catch (err) {
    console.error("[share-note]", err);
    setLabel(btn, "Failed — retry");
  } finally {
    btn.dataset.busy = "false";
    window.setTimeout(() => setLabel(btn, original), 2500);
  }
}

function setupShareButtons() {
  const buttons = document.querySelectorAll<HTMLButtonElement>("button.share-note");
  buttons.forEach((btn) => {
    btn.addEventListener("click", onShareClick as EventListener);
    window.addCleanup?.(() => btn.removeEventListener("click", onShareClick as EventListener));
  });
}

document.addEventListener("nav", setupShareButtons);
document.addEventListener("render", setupShareButtons);
