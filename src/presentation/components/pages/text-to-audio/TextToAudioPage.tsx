import { useState } from "react";
import {
  GptMessages,
  MyMessages,
  TypingLoader,
  TextMessageBoxSelect,
  GptMessagesAudio,
} from "../../../components";
import { textToAudioUseCase } from "../../../../core/use-cases";

const displaimer = `## Ingresa un texto para generar un audio
* Todo el audio es generado por AI.
`;

const voices = [
  { id: "nova", text: "Nova" },
  { id: "alloy", text: "Alloy" },
  { id: "echo", text: "Echo" },
  { id: "fable", text: "Fable" },
  { id: "onyx", text: "Onyx" },
  { id: "shimmer", text: "Shimmer" },
];
interface TextMessage {
  text: string;
  isGPT: boolean;
  type: "text";
}

interface AudioMessage {
  text: string;
  isGPT: boolean;
  audio: string;
  type: "audio";
}

type Message = TextMessage | AudioMessage;

export const TextToAudioPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handlePost = async (text: string, selectedVoice: string) => {
    setIsLoading(true);

    setMessages((prev) => [...prev, { text: text, isGPT: false, type: "text" }]);

    const { message, audioUrl, ok } = await textToAudioUseCase(text, selectedVoice);

    setIsLoading(false);

    if (!ok) return;

    setMessages((prev) => [
      ...prev,
      { text: `${selectedVoice} - ${message}`, isGPT: true, type: "audio", audio: audioUrl! },
    ]);
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="grid grid-cols-12 gap-y-2">
          <GptMessages text={displaimer} />
          {messages.map((message, index) =>
            message.isGPT ? (
              message.type === "audio" ? (
                <GptMessagesAudio key={index} text={message.text} audio={message.audio} />
              ) : (
                <GptMessages key={index} text={message.text} />
              )
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
        options={voices}
      />
    </div>
  );
};
