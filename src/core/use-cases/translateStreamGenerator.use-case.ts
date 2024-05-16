export async function* translateStreamGeneratorUseCase(
  prompt: string,
  lang: string,
  abortSignal: AbortSignal
) {
  try {
    const resp = await fetch(`${import.meta.env.VITE_GPT_API}/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, lang }),
      signal: abortSignal,
    });

    if (!resp.ok) throw new Error("No se pudo realizar la traducción");

    const reader = resp.body?.getReader();
    if (!reader) {
      console.log("No se pudo generar el reader");
      return null;
    }

    const decoder = new TextDecoder();

    let text = "";

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }

      const decodedChunk = decoder.decode(value, { stream: true });
      text += decodedChunk;
      // console.log(text);
      yield text;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
}
