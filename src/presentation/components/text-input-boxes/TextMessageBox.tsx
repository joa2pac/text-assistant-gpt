import { FC, FormEvent, useState } from "react";

interface TextMessagesProps {
  onSendMessages: (messages: string) => void;
  placeHolder?: string;
  disabledCorrections: boolean;
}

export const TextMessageBox: FC<TextMessagesProps> = ({
  onSendMessages,
  placeHolder,
  disabledCorrections = false,
}) => {
  const [message, setMessage] = useState("");

  const handleSendMessages = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (message.trim().length === 0) return;

    onSendMessages(message);
    setMessage("");

    console.log("HandleSubmit");
  };

  return (
    <form
      onSubmit={handleSendMessages}
      className="flex flex-row items-center h-16  bg-white w-full px-4"
    >
      <div className="flex-grow">
        <div className="relative w-full">
          <input
            className="flex w-full  text-gray-800 focus:outline-none "
            type="text"
            autoFocus
            name="message"
            placeholder={placeHolder}
            autoComplete={disabledCorrections ? "on" : "off"}
            autoCorrect={disabledCorrections ? "on" : "off"}
            spellCheck={disabledCorrections ? "true" : "false"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
      </div>

      <div className="ml-4">
        <button className="btn-primary">
          <span className="mr-2">Enviar</span>
          <i className="fa-regular fa-paper-plane"></i>
        </button>
      </div>
    </form>
  );
};
