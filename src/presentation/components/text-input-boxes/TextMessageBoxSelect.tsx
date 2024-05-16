import { FC, FormEvent, useState } from "react";

interface TextMessagesBoxSelectProps {
  onSendMessages: (messages: string, selectedOption: string) => void;
  placeHolder?: string;
  disabledCorrections?: boolean;
  options: Options[];
}

interface Options {
  id: string;
  text: string;
}

export const TextMessageBoxSelect: FC<TextMessagesBoxSelectProps> = ({
  onSendMessages,
  placeHolder,
  disabledCorrections = false,
  options,
}) => {
  const [message, setMessage] = useState("");
  const [selectedOption, setSelectedOption] = useState<string>("");

  const handleSendMessages = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (message.trim().length === 0) return;
    if (selectedOption === "") return;

    onSendMessages(message, selectedOption);
    setMessage("");

    console.log("HandleSubmit");
  };

  return (
    <form
      onSubmit={handleSendMessages}
      className="flex flex-row items-center h-16  bg-white w-full px-4"
    >
      <div className="flex-grow">
        <div className="flex">
          <input
            className="w-full  text-gray-800 focus:outline-none focus:border-indigo-300 pl-4 h-10 "
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
          <select
            name="select"
            className="w-2/5 ml-5 border rounded-xl text-gray-800 focus:outline-none focus:boder-indigo-300 pl-4 h-10"
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
          >
            <option value="">Select</option>
            {options.map(({ id, text }) => (
              <option key={id} value={id}>
                {text}
              </option>
            ))}
          </select>
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
