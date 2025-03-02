import {
  StateGraph,
  MessagesAnnotation,
  START,
  Annotation,
} from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { google } from 'googleapis';

const gmail = google.gmail('v1');

// https://googleapis.dev/nodejs/googleapis/latest/gmail/classes/Gmail.html
const llm = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0.5, apiKey: process.env.OPENAI_API_KEY });

const builder = new StateGraph(
  Annotation.Root({
    messages: MessagesAnnotation.spec["messages"],
    timestamp: Annotation<number>,
  }),
)
  .addNode("agent", async (state, config) => {
    const message = await llm.invoke([
      {
        type: "system",
        content: process.env.SYSTEM_PROMPT as string,
      },
      ...state.messages,
    ]);

    return { messages: message, timestamp: Date.now() };
  })
  .addEdge(START, "agent");

export const graph = builder.compile();
