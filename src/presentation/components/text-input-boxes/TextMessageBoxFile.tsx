import { FC, FormEvent, useRef, useState } from "react";

interface TextMessagesProps {
  onSendMessages: (messages: string) => void;
  placeHolder?: string;
  disabledCorrections?: boolean;
  accept?: string;
}

export const TextMessageBoxFile: FC<TextMessagesProps> = ({
  onSendMessages,
  placeHolder,
  disabledCorrections = false,
  accept,
}) => {
  const [message, setMessage] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedFile, setSelectedFile] = useState<File | null>();

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      className="flex flex-row items-center min-h-16  bg-white w-full px-4"
    >
      <div className="mr-3">
        <button
          type="button"
          className="flex items-center justify-center text-gray-400 hover:text-gray-600"
          onClick={() => fileInputRef.current?.click()}
        >
          <i className="fa-solid fa-paperclip  text-xl"></i>
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept={accept}
        onChange={(e) => setSelectedFile(e.target.files?.item(0))}
        hidden
      />

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

      {selectedFile && (
        <div className="border-pixelspace-gray-60 relative flex  h-[60px] w-[211px] cursor-pointer items-center space-x-2 rounded-md border px-4 py-3 hover:opacity-50">
          <div className="rounded bg-blue-500 px-[10px] py-2 ">
            <i className="fa-regular fa-file px-[2.5px]" style={{ fontSize: 20 }}></i>
          </div>

          <div className="text-pixelspace-gray-3 font-inter truncate text-sm font-medium leading-[21px]">
            <div className="truncate text-black">{selectedFile.name}</div>
          </div>
        </div>
      )}

      <div className="ml-4">
        <button className="btn-primary" disabled={!selectedFile}>
          <i className="fa-solid fa-arrow-up"></i>
        </button>
      </div>
    </form>
  );
};
