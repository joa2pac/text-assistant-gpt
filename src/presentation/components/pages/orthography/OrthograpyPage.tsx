import { useState } from "react";
import {
  GptMessages,
  GptOrthographyMessages,
  MyMessages,
  TextMessageBox,
  TypingLoader,
} from "../../../components";
import { orthographyUseCase } from "../../../../core/use-cases";

interface Messages {
  text: string;
  isGPT: boolean;
  info?: {
    userScore: number;
    errors: string[];
    message: string;
  };
}

export const OrthograpyPage = () => {
  const [messages, setMessages] = useState<Messages[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePost = async (text: string) => {
    setIsLoading(true);

    setMessages((prev) => [...prev, { text: text, isGPT: false }]);

    const { ok, errors, message, userScore } = await orthographyUseCase(text);

    if (!ok) {
      setMessages((prev) => [...prev, { text: "No se pudo realizar la corrección", isGPT: true }]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          text: message,
          isGPT: true,
          info: {
            errors,
            message,
            userScore,
          },
        },
      ]);
    }

    setIsLoading(false);
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="grid grid-cols-12 gap-y-2">
          <GptMessages text="Hola Mundo, esto es una aplicacion de react, usando la API de apenai xD" />
          {messages.map((message, index) =>
            message.isGPT ? (
              <GptOrthographyMessages
                key={index}
                //  errors={message.info!.errors}
                //  message={message.info!.message}
                //  userScore={message.info!.userScore}
                {...message.info!}
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
      {/* <TextMessageBoxFile onSendMessages={handlePost} placeHolder="Typing to message" /> */}
      {/* <TextMessageBoxSelect
        onSendMessages={console.log}
        options={[
          { id: "1", text: "mundo" },
          { id: "2", text: "chau" },
        ]}
      /> */}
    </div>
  );
};
