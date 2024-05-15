import { useState } from "react";
import { GptMessages, MyMessages, TypingLoader, TextMessageBox } from "../../../components";

import { prosConsStreamGeneratorUseCase } from "../../../../core/use-cases";

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

    const stream = await prosConsStreamGeneratorUseCase(text);
    setIsLoading(false);

    setMessages((messages) => [...messages, { text: "", isGPT: true }]);

    for await (const text of stream) {
      setMessages((messages) => {
        const newMessages = [...messages];
        newMessages[newMessages.length - 1].text = text;
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
