import { useRef, useState } from "react";
import { GptMessages, MyMessages, TypingLoader, TextMessageBoxSelect } from "../../../components";
import { translateStreamGeneratorUseCase } from "../../../../core/use-cases/translateStreamGenerator.use-case";

interface Messages {
  text: string;
  isGPT: boolean;
}

const languages = [
  { id: "alemán", text: "Alemán" },
  { id: "árabe", text: "Árabe" },
  { id: "bengalí", text: "Bengalí" },
  { id: "francés", text: "Francés" },
  { id: "hindi", text: "Hindi" },
  { id: "inglés", text: "Inglés" },
  { id: "japonés", text: "Japonés" },
  { id: "mandarín", text: "Mandarín" },
  { id: "portugués", text: "Portugués" },
  { id: "ruso", text: "Ruso" },
];

export const TranslatePage = () => {
  const abortController = useRef(new AbortController());
  const isRunning = useRef(false);
  const [messages, setMessages] = useState<Messages[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handlePost = async (text: string, selectedOption: string) => {
    if (isRunning.current) {
      abortController.current.abort();
      abortController.current = new AbortController();
    }

    setIsLoading(true);
    isRunning.current = true;

    const newMessage = `Traduce: "${text}" al idioma ${
      selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1)
    }`;

    setMessages((prev) => [...prev, { text: newMessage, isGPT: false }]);

    const stream = translateStreamGeneratorUseCase(
      text,
      selectedOption,
      abortController.current.signal
    );
    setIsLoading(false);

    setMessages((messages) => [...messages, { text: "", isGPT: true }]);

    for await (const text of stream) {
      setMessages((messages) => {
        const newMessages = [...messages];
        newMessages[newMessages.length - 1].text = text;
        return newMessages;
      });

      isRunning.current = false;
    }

    setIsLoading(false);
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="grid grid-cols-12 gap-y-2">
          <GptMessages text="¿Que desea traducir?" />
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
      <TextMessageBoxSelect
        onSendMessages={handlePost}
        placeHolder="Typing to message"
        disabledCorrections
        options={languages}
      />
    </div>
  );
};
