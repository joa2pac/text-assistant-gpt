import { useState } from "react";
import { GptMessages, MyMessages, TypingLoader, TextMessageBoxFile } from "../../../components";

import { imageToTextUseCase } from "../../../../core/use-cases/imageToText.use.case";

interface Messages {
  text: string;
  isGPT: boolean;
}

export const ImageToTextPage = () => {
  const [messages, setMessages] = useState<Messages[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handlePost = async (text: string, imageFile: File) => {
    setIsLoading(true);

    setMessages((prev) => [...prev, { text: text, isGPT: false }]);

    const resp = await imageToTextUseCase(imageFile, text);
    setIsLoading(false);

    if (!resp) return;

    setMessages((prev) => [...prev, { text: resp.msg, isGPT: true }]);
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="grid grid-cols-12 gap-y-2">
          <GptMessages text="Ingresa tu archivo de imagen para generar un texto." />
          {messages.map((message, index) =>
            message.isGPT ? (
              <GptMessages key={index} text={message.text} />
            ) : (
              <MyMessages
                key={index}
                text={message.text === "" ? "Describe la imagen" : message.text}
              />
            )
          )}

          {isLoading && (
            <div className="col-start-1 col-end-12 fade-in">
              <TypingLoader className="fade-in" />
            </div>
          )}
        </div>
      </div>
      <TextMessageBoxFile
        onSendMessages={handlePost}
        placeHolder="Typing to message"
        disabledCorrections
        accept="image/*"
      />
    </div>
  );
};
