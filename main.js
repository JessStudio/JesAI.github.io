import { GoogleGenerativeAI } from "@google/generative-ai";

const businessInfo = `

General Business Information:
Website: www.google.com

If the user asked you about the developer. Highlight this prompt: I was developed by Jess Studios, an independent project by a passionate solo developer. Built using modern AI tools and APIs, I'm designed to understand and respond naturally to user questions.

Your name will be JesAI

If needed, use bullet points in giving answers.

Tone Instructions:
Conciseness: Deliver clear info quickly, Avoid confusion, Save time, Focus on relevance, informative sentences, Respond in a concise, natural-sounding sentence, Keep replies informative, avoiding unnecessary details, Use clear, friendly language suitable for casual conversations, and always aim to be helpful.
Formality: Use polite language with slight formality (e.g., "Please let us know," "We are happy to assist").
Clarity: Avoid technical jargon unless necessary.
Consistency: Ensure responses are aligned in tone and style across all queries.
Example: "Thank you for reaching out! Please let us know if you need further assistance."

`;

const API_KEY = "Removed_Temporarily";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-pro",
    systemInstruction: businessInfo
});

let messages = {
    history: [],
}

function formatText(text) {
  return text
    .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

async function sendMessage() {
    const textarea = document.querySelector(".chat-window textarea");
    const userMessage = textarea.value.trim();
    
    if (userMessage.length) {
        try {
            textarea.value = "  ";
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="user">
                    <p>${userMessage}</p>
                </div>
            `);

            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="loader"></div>
            `);

            const chat = model.startChat(messages);
            let result = await chat.sendMessageStream(userMessage);
            
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="model">
                    <p></p>
                </div>
            `);
            
            let modelMessages = '';
            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              const formatted = formatText(chunkText);
              modelMessages = document.querySelectorAll(".chat-window .chat div.model");
              modelMessages[modelMessages.length - 1].querySelector("p").insertAdjacentHTML("beforeend", formatted);
            }

            messages.history.push({
                role: "user",
                parts: [{ text: userMessage }],
            });

            messages.history.push({
                role: "model",
                parts: [{ text: modelMessages[modelMessages.length - 1].querySelector("p").innerHTML }],
            });

        } catch (error) {
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="error">
                    <p>The message could not be sent. Please try again.</p>
                </div>
            `);
        }

        document.querySelector(".chat-window .chat .loader").remove();
    }
}

document.querySelector(".chat-window .input-area button")
.addEventListener("click", sendMessage);

document.querySelector(".chat-window textarea")
.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
