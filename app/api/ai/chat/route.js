export async function POST(request) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  if (!GEMINI_API_KEY) {
    return Response.json(
      { error: "AI not configured. Set GEMINI_API_KEY environment variable." },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { messages, systemPrompt } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages array required" }, { status: 400 });
  }

  try {
    const contents = messages
      .filter((m) => m && (m.role === "user" || m.role === "assistant"))
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: String(m.content || "") }],
      }));

    const geminiBody = {
      contents,
      ...(systemPrompt
        ? { systemInstruction: { parts: [{ text: String(systemPrompt) }] } }
        : {}),
      generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });

    if (!r.ok) {
      const errText = await r.text().catch(() => "");
      console.error("Gemini API error:", r.status, errText);
      return Response.json(
        { error: `Gemini API error (${r.status})` },
        { status: 502 }
      );
    }

    const data = await r.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
    return Response.json({ text });
  } catch (e) {
    console.error("AI proxy error:", e.message);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
