import { ImageToTextResponse } from "../../interfaces";

export const imageToTextUseCase = async (imageFile: File, prompt: string) => {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);
    if (prompt) {
      formData.append("prompt", prompt);
    }

    const resp = await fetch(`${import.meta.env.VITE_GPT_API}/image-to-text`, {
      method: "POST",
      body: formData,
    });

    const data = (await resp.json()) as ImageToTextResponse;
    console.log({ data });
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
