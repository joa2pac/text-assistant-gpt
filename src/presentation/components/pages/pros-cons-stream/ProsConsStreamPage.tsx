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

    const reader = await prosConsStreamUseCase(text);

    if (!reader) return alert("No se pudo generar el reader");

    const decoder = new TextDecoder();

    let message = "";
    setMessages((messages) => [...messages, { text: message, isGPT: true }]);

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const decodedChunk = decoder.decode(value, { stream: true });
      message += decodedChunk;

      setMessages((messages) => {
        const newMessages = [...messages];
        newMessages[newMessages.length - 1].text = message;
        return newMessages;
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="grid grid-cols-12 gap-y-2">
          <GptMessages text="¿Que deseas comparar hoy?" />
          {messages.map((message, index) =>
            message.isGPT ? (
              <GptMessages key={index} text={message.text} />
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
