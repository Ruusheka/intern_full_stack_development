import { useRef } from 'react'

const ChatForm = ({chatHistory,setChatHistory , generateBotResponse}) => {
    const inputRef = useRef()

    const handleFormSubmit = (e) => {
        e.preventDefault();

        const userMessage = inputRef.current.value.trim();
        if (!userMessage) return;

        inputRef.current.value = "";

        const newHistory = [
            ...chatHistory,
            { role: "user", text: userMessage }
        ];

        setChatHistory(newHistory);

        setTimeout(() => {
            setChatHistory(history => [
                ...history,
                { role: "model", text: "Thinking..." }
            ]);
        }, 600);

        generateBotResponse(newHistory); 
        };

    return (
        <form className="chat-form" onSubmit={handleFormSubmit}>
        <input
            ref={inputRef}
            type="text"
            className="message-input"
            placeholder="Message..."
            required
        />
        <button type="submit" className="material-symbols-outlined">
            arrow_upward
        </button>
        </form>
    )
}

export default ChatForm
