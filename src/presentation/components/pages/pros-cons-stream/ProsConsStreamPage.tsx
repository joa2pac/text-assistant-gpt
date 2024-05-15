import { useState } from "react";
import { GptMessages, MyMessages, TypingLoader, TextMessageBox } from "../../../components";
import { prosConsStreamUseCase } from "../../../../core/use-cases/prosConsStream.use-case";

interface Messages {
  text: string;
  isGPT: boolean;
}

export const ProsConsStreamPage = () => {
  const [messages, setMessages] = useState<Messages[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handlePost = async (text: string) => {
    setIsLoading(true);

    setMessages((prev) => [...prev, { text: text, isGPT: false }]);

    await prosConsStreamUseCase(text);

    setIsLoading(false);
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="grid grid-cols-12 gap-y-2">
          <GptMessages text="¿Que deseas comparar hoy?" />
          {messages.map((message, index) =>
            message.isGPT ? (
              <GptMessages
                key={index}
                text="Hola Mundo, esto es una aplicacion de react, usando la API de apenai xD"
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
  );
};
