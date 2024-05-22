import { useState } from "react";
import { GptMessages, MyMessages, TypingLoader, TextMessageBoxFile } from "../../../components";
import { audioToTextUseCase } from "../../../../core/use-cases";

interface Messages {
  text: string;
  isGPT: boolean;
}

export const ImageToTextPage = () => {
  const [messages, setMessages] = useState<Messages[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handlePost = async (text: string, audioFile: File) => {
    setIsLoading(true);

    setMessages((prev) => [...prev, { text: text, isGPT: false }]);

    const resp = await audioToTextUseCase(audioFile, text);
    setIsLoading(false);

    if (!resp) return;

    const gptMessage = `
    ## Transcripción: 
    _Duracion:_ ${Math.round(resp.duration)} segundos
  ## El texto es:
  ${resp.text}
    `;

    for (const segment of resp.segments) {
      const segmentMessage = `
  _De ${Math.round(segment.start)} a ${Math.round(segment.end)} segundos:_
  ${segment.text}
  `;
      setMessages((prev) => [...prev, { text: segmentMessage, isGPT: true }]);
    }

    setMessages((prev) => [...prev, { text: gptMessage, isGPT: true }]);
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="grid grid-cols-12 gap-y-2">
          <GptMessages text="Ingresa tu archivo de audio para transcribir." />
          {messages.map((message, index) =>
            message.isGPT ? (
              <GptMessages key={index} text={message.text} />
            ) : (
              <MyMessages
                key={index}
                text={message.text === "" ? "Transcribe el audio" : message.text}
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
