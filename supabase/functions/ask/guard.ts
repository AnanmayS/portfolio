/*
  The checks that run before any model call, so they cost nothing: is the
  body a well-formed, short conversation, and is its newest question
  plausibly about Ananmay at all.
*/
export const MAX_QUESTION = 300; // characters in the newest question
export const MAX_HISTORY = 6; // messages of context sent to the model

/* Words that show a question is about him or his work. */
const ABOUT =
  /\b(ananmay|som|singh|he|him|his|he's|you|your|resume|résumé|cv|projects?|experience|intern(ship)?s?|jobs?|work(ed|ing)?|roles?|skills?|stack|languages?|tech|school|umd|maryland|degree|gradua\w*|major|stud(y|ies|ying)|courses?|wildebeest|tape|showdown\w*|seds|cubesat|gps|gsalpha|homeflow|conviction|contact|email|reach|hire|hiring|github|linkedin|background|built|build)\b/i;
/* Requests for a task rather than a question about him. */
const TASK =
  /\b(write|code|script|program|poem|story|essay|translate|solve|calculate|recipe|homework|pretend|roleplay|role-play|jailbreak|ignore (all|any|previous|prior|the)|system prompt|instructions)\b/i;
const NAMED = /\b(ananmay|he|him|his|he's)\b/i;

export function onTopic(question: string, isFollowUp: boolean) {
  if (TASK.test(question) && !NAMED.test(question)) return false;
  if (ABOUT.test(question)) return true;
  /* "and the second one?" after an answer: short follow-ups get through. */
  return isFollowUp && question.length <= 120;
}

export type Message = { role: "user" | "assistant"; content: string };

export function readMessages(body: unknown): Message[] | null {
  const raw = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const messages = raw.slice(-MAX_HISTORY).map((m) => ({
    role: (m as Message)?.role,
    content: typeof (m as Message)?.content === "string" ? (m as Message).content.slice(0, 1200) : "",
  }));
  if (messages.some((m) => (m.role !== "user" && m.role !== "assistant") || !m.content.trim())) return null;
  const last = messages[messages.length - 1];
  if (last.role !== "user" || last.content.length > MAX_QUESTION) return null;
  /* The model must see a user turn first. */
  while (messages[0].role !== "user") messages.shift();
  return messages as Message[];
}
