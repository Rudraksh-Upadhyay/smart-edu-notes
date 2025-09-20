"use server"

import { getUser } from "@/auth/server";
import prisma from "@/db/prisma";
import { handleError } from "@/lib/utils";

// import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";

function buildGeminiHistory(systemPrompt: string, questions: string[], responses: string[]) {
  const history: any[] = [
    {
      role: "user", // using user role to provide system-style instructions in the first message
      parts: [{ text: systemPrompt }],
    },
  ];

  for (let i = 0; i < questions.length; i++) {
    history.push({
      role: "user",
      parts: [{ text: questions[i] }],
    });

    if (responses.length > i && responses[i]) {
      // 'model' used for prior assistant replies in Gemini docs examples
      history.push({
        role: "model",
        parts: [{ text: responses[i] }],
      });
    }
  }

  return history;
}


export const createNoteAction = async (noteId: string) =>{
    try{
        const user = await getUser();

        if(!user) throw new Error("You must be logged in to create the notes");

        await prisma.note.create({
            data: {
                id: noteId, 
                authorId: user.id,
                text: ""
            }
        })
        
        return {errorMessage: null};
    }
    catch(error){
        return handleError(error)
    }
}
export const updateNoteAction = async (noteId: string, text:string) =>{
    try{
        const user = await getUser();

        if(!user) throw new Error("You must be logged in to update the notes");

        await prisma.note.update({
            where: {id: noteId},
            data: {text},
        })
        
        return {errorMessage: null};
    }
    catch(error){
        return handleError(error)
    }
};

export const deleteNoteAction = async (noteId: string) =>{
    try{
        const user = await getUser();

        if(!user) throw new Error("You must be logged in to delete the note");

        await prisma.note.delete({
            where: {id: noteId, authorId: user.id},
        });

        return  { errorMessage: null};
    }catch(error){
        return handleError(error);
    }
};


const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export const AskAIAboutNotesActiono = async (
    newQuestions: string[], 
    responses: string[]) => {
    
    const user = await getUser();
    if(!user) throw new Error("You must be logged in to ask questions about your notes");

    const notes = await prisma.note.findMany({
        where: {authorId: user.id},
        orderBy: {createdAt: 'desc'},
        select: {text: true, createdAt: true, updatedAt: true},
    });

    if(notes.length === 0 ){
        return "You dont have any notes yet. Please create some notes first.";
    }

    const formattedNotes = notes.map((note) => 
        `
        Text: ${note.text}
        Created At: ${note.createdAt}
        Updated At: ${note.updatedAt}
        `.trim(),
    ).join("\n");


    const systemPrompt = `
          You are a helpful assistant that answers questions about a user's notes. 
          Assume all questions are related to the user's notes. 
          Make sure that your answers are not too verbose and you speak succinctly. 
          Your responses MUST be formatted in clean, valid HTML with proper structure. 
          Use tags like <p>, <strong>, <em>, <ul>, <ol>, <li>, <h1> to <h6>, and <br> when appropriate. 
          Do NOT wrap the entire response in a single <p> tag unless it's a single paragraph. 
          Avoid inline styles, JavaScript, or custom attributes.
          
          Rendered like this in JSX:
          <p dangerouslySetInnerHTML={{ __html: YOUR_RESPONSE }} />
    
          Here are the user's notes:
          ${formattedNotes}
          `;


    try{
        const model = ai.getGenerativeModel({model: "gemini-2.5-pro"});
        const history = buildGeminiHistory(systemPrompt, newQuestions, responses);
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(
            newQuestions[newQuestions.length - 1]
        );
        const responseText = result.response.text();
        return responseText || "A problem has occurred";
    }catch (error) {
        // You can use your existing handleError function or a more specific error handler.
        return handleError(error);
    }


    // let conversationHistory = "";

    // for(let i =0 ; i < newQuestions.length; i++){
    //     conversationHistory += `User: ${newQuestions[i]}`;

    //     if(responses.length > i && responses[i]){
    //         conversationHistory += `\nAssistant: ${responses[i]}`;
    //     }
    // }


    // const lastQuestion = newQuestions.length > 0 ? newQuestions[newQuestions.length - 1]: "";


    // if(!lastQuestion){
    //     throw new Error("No question provided");
    // }

    // const final_prompt = `${systemPrompt}\n\nConversation history:${conversationHistory}\n\nNow answer the last question (only once) in clean HTML:\n\nQuestion: ${lastQuestion}\n\nAnswer:`;


    // const modelName = "gemini-2.5-pro";

    // const result = await ai.models.generateContent({
    //     model: modelName,
    //     contents: final_prompt,
    // })


    // const text =
    //   (result?.output?.[0]?.content?.[0]?.text as string | undefined) ??
    //   (result as any)?.text ??
    //   (Array.isArray((result as any)?.outputs) && (result as any).outputs[0]?.content?.[0]?.text) ??
    //   null;

    // return text ?? "A problem has occurred";

    // const messages = [];
    // messages.push({ role: "system", content: gemini_response.contents });
    

    // for (let i = 0; i < newQuestions.length; i++) {
    //     messages.push({ role: "user", content: newQuestions[i] });
    //     if (response.length > i) {
    //         messages.push({ role: "assistant", content: response[i] });
    //     }
    // }

    

    
};