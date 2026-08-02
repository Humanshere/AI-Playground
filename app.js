const SYSTEM_PROMPT = `You are a dynamic UI engine. 
You must ALWAYS respond with ONLY a valid JSON object. No markdown, no conversational text.
The JSON must have exactly two keys:
1. "css_background": A valid CSS background value (e.g., "blue", "linear-gradient(...)"). default is black, change only if required
2. "html_content": The HTML elements to render. 
Do NOT generate any <style> tags. Use inline styles (e.g., style='color: red') for all HTML elements.
3. If the user asks for a dynamic element, write pure, vanilla JavaScript in the 'js_logic' key to handle the state locally in the browser.
Any HTML buttons that are controlled by your local 'js_logic' MUST include the attribute data-local='true'.
all buttons must have unique ids

4. if any button requires generation of new data(eg. next page) the buttons should have data-local='false'
If it's a SYSTEM EVENT, figure out the next logical state of the UI and render it.
if the user asks for a minor update to an existing UI (like placing an 'X' in a game), leave "html_content" and "css_background" completely EMPTY (""). 
Instead, provide ONLY "js_logic" with vanilla JavaScript to surgically mutate the DOM (e.g., document.getElementById('cell-1').innerText = 'X';). 
Only use "html_content" when generating a brand new layout or application.
You will be provided with the CURRENT UI STATE. Analyze this HTML to write precise 'js_logic' DOM mutations. Do not hallucinate IDs; only target IDs that currently exist in the HTML provided.
`;

let canvas = document.getElementById("ai-canvas")
let user_box = document.getElementById("user-input")
let send_btn = document.getElementById('send-button')
let reset_btn = document.getElementById("reset-button")

conversationHistory=[]

send_btn.addEventListener("click",()=>{
    let text_inp=user_box.value
    if(text_inp.trim().length==0)return
    user_box.value=""
    // console.log("user sent "+ text_inp)
    processTurn(text_inp)
});


reset_btn.addEventListener("click",()=>{
    conversationHistory.length=0
    canvas.innerHTML="<p id=\"initial\">AI PLAYGROUND</p>"
    document.body.style.background="black"
});


canvas.addEventListener("click",(e)=>{
    let clickedElement = e.target.closest('button')
    if (clickedElement && clickedElement.getAttribute('data-local')){
        console.log("User clicked an AI button: " + clickedElement.id)
        processTurn("SYSTEM EVENT: User clicked AI button -> " + clickedElement.id)
    }
}
);

function updateUI(aiResponse) {
    if (aiResponse.css_background) {
        document.body.style.background = aiResponse.css_background;
    }
    
    if (aiResponse.html_content && aiResponse.html_content.trim() !== "") {
        canvas.innerHTML = aiResponse.html_content;
    }
    
    if (aiResponse.js_logic) {
        try {
            // This runs the AI's string as actual browser JavaScript
            new Function(aiResponse.js_logic)(); 
        } catch (error) {
            console.error("AI generated bad JavaScript:", error);
        }
    }
}

async function processTurn(message){
    conversationHistory.push({role: "user", content: message })
    if(conversationHistory.length>6){
        conversationHistory=conversationHistory.slice(-6)
    }
    const url = `/api/chat`;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT+ `\n\nCURRENT UI STATE:\n${canvas.innerHTML}` }] },
            contents: conversationHistory.map(msg => ({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.content }]
            }))
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Details:", errorText);
        let originalText = canvas.innerHTML; 
        canvas.innerHTML = `<h3 style="color: red; text-align: center;">Whoa, slow down! The AI needs a second.</h3>` + originalText;
        conversationHistory.pop(); 
        return; 
    }

    const data = await response.json();
    const aiText = data.candidates[0].content.parts[0].text;
    
    let cleanText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
    let realResponse = JSON.parse(cleanText);
    conversationHistory.push({role: "assistant", content: aiText })
    updateUI(realResponse)

}
