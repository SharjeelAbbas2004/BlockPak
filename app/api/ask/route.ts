import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, clientKey } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * POST /api/ask — "Ask Web3 Pakistan" assistant endpoint.
 *
 * ARCHITECTURE (where the real implementation would plug in):
 * 1. Validate + sanitize the question (done below).
 * 2. RETRIEVAL: query the site's own database for grounding context —
 *    e.g. full-text search over `Article` (title/excerpt/content) and
 *    `Regulation`/`RegulatoryEvent` rows for Pakistan-specific answers,
 *    then pass the top hits as context/citations to the model.
 * 3. LLM CALL: with an `AI_API_KEY`-configured provider client
 *    (OpenAI-compatible chat completions), send a system prompt that
 *    forces educational, citation-backed answers and explicitly forbids
 *    financial/investment advice. Keep prompts/instructions out of logs.
 * 4. Post-process: strip disallowed content, re-check citations against
 *    the retrieval set, and return the contract shape below.
 *
 * Response shape contract:
 *   success → { answer: string, citations: { title: string; url: string }[] }
 *   failure → { error: string }
 */

interface Citation {
  title: string;
  url: string;
}

type AskResponse = { answer: string; citations: Citation[] } | { error: string };

interface AskRequestBody {
  question?: unknown;
}

export async function POST(req: NextRequest): Promise<NextResponse<AskResponse>> {
  if (!rateLimit(clientKey(req, 'ask'), 60, 60_000)) {
    return NextResponse.json<AskResponse>(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  let question = '';
  try {
    const body = (await req.json()) as AskRequestBody;
    if (typeof body.question === 'string') question = body.question.trim();
  } catch {
    question = '';
  }

  if (!question) {
    return NextResponse.json<AskResponse>(
      { error: 'Please enter a question.' },
      { status: 400 },
    );
  }

  // No LLM is wired up yet — do not fabricate an answer.
  // Even when AI_API_KEY is present, the retrieval + model pipeline
  // described above is not implemented, so we stay a 503 stub.
  void process.env.AI_API_KEY;
  return NextResponse.json<AskResponse>(
    { error: 'AI assistant is not configured yet.' },
    { status: 503 },
  );
}
