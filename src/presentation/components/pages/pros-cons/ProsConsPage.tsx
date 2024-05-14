import { useState } from "react";
import { GptMessages, MyMessages, TypingLoader, TextMessageBox } from "../../../components";
import { prosConsUseCase } from "../../../../core/use-cases";

interface Messages {
  text: string;
  isGPT: boolean;
}

export const ProsConsPage = () => {
  const [messages, setMessages] = useState<Messages[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handlePost = async (text: string) => {
    setIsLoading(true);

    setMessages((prev) => [...prev, { text: text, isGPT: false }]);

    const { ok, content } = await prosConsUseCase(text);

    if (!ok) return;

    setMessages((prev) => [...prev, { text: content, isGPT: true }]);

    setIsLoading(false);
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="grid grid-cols-12 gap-y-2">
          <GptMessages text="Puedes escribir lo que sea que quieras que compare y te dare mi punto de vista" />
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
