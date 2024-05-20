import { useState } from "react";
import {
  GptMessages,
  MyMessages,
  TypingLoader,
  TextMessageBox,
  GptSelectableImages,
} from "../../../components";
import { imageGenerationUseCase, imageVariationUseCase } from "../../../../core/use-cases";

interface Messages {
  text: string;
  isGPT: boolean;
  info?: {
    imageUrl: string;
    alt: string;
  };
}

export const ImageTunningPage = () => {
  const [messages, setMessages] = useState<Messages[]>([
    {
      isGPT: true,
      text: "Imagen base",
      info: {
        alt: "Imagen base",
        imageUrl: "http://localhost:3000/gpt/image-generation/1716114333727.png",
      },
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const [originalImageAndMask, setOriginalImageAndMask] = useState({
    original: undefined as string | undefined,
    mask: undefined as string | undefined,
  });

  const handleVariation = async () => {
    setIsLoading(true);
    const resp = await imageVariationUseCase(originalImageAndMask.original!);
    setIsLoading(false);

    if (!resp) return;

    setMessages((prev) => [
      ...prev,
      {
        text: "Variation",
        isGPT: true,
        info: {
          imageUrl: resp.url,
          alt: resp.alt,
        },
      },
    ]);
  };

  const handlePost = async (text: string) => {
    setIsLoading(true);

    setMessages((prev) => [...prev, { text: text, isGPT: false }]);

    const imageInfo = await imageGenerationUseCase(text);
    setIsLoading(false);

    if (!imageInfo) {
      return setMessages((prev) => [
        ...prev,
        { text: "No se pudo generar la imagen", isGPT: true },
      ]);
    }

    setMessages((prev) => [
      ...prev,
      {
        text: text,
        isGPT: true,
        info: {
          imageUrl: imageInfo.url,
          alt: imageInfo.alt,
        },
      },
    ]);
  };

  return (
    <>
      {originalImageAndMask.original && (
        <div className="fixed flex-col items-center top-10 right-10 z-10 fade-in">
          <span>Editando</span>
          <img
            className="border rounded-xl w-36 h-36 object-contain"
            src={originalImageAndMask.original}
            alt="Imagen original"
          />
          <button onClick={handleVariation} className="btn-primary mt-2">
            Generar variación
          </button>
        </div>
      )}

      <div className="chat-container">
        <div className="chat-messages">
          <div className="grid grid-cols-12 gap-y-2">
            <GptMessages text="¿Que imagen deseas generar ?" />
            {messages.map((message, index) =>
              message.isGPT ? (
                // <GptImageMessages
                <GptSelectableImages
                  key={index}
                  text={message.text}
                  imageUrl={message.info!.imageUrl}
                  alt={message.info!.alt}
                />
              ) : (
                <MyMessages key={index} text={message.text} />
              )
            )}

            {isLoading && (
              <div className="col-start-1 col-end-12 fade-in">
                <TypingLoader className="fade-in" />
              </div>
            )}
          </div>
        </div>
        <TextMessageBox
          onSendMessages={handlePost}
          placeHolder="Typing to message"
          disabledCorrections
        />
      </div>
    </>
  );
};
