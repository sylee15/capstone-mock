const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

const reflectionSchema = {
  name: 'miro_session_reflection',
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      state_mode: {
        type: 'string',
        enum: ['builder', 'thoughtful', 'shared', 'tired']
      },
      state_title: { type: 'string' },
      state_description: { type: 'string' },
      turning_points: {
        type: 'array',
        minItems: 3,
        maxItems: 4,
        items: { type: 'string' }
      },
      weight_rows: {
        type: 'array',
        minItems: 4,
        maxItems: 6,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            key: { type: 'string' },
            label: { type: 'string' },
            position: { type: 'number' },
            reason: { type: 'string' }
          },
          required: ['key', 'label', 'position', 'reason']
        }
      },
      you_brought: {
        type: 'array',
        minItems: 2,
        maxItems: 4,
        items: { type: 'string' }
      },
      miro_brought: {
        type: 'array',
        minItems: 2,
        maxItems: 4,
        items: { type: 'string' }
      },
      seed_to_sit_with: { type: 'string' },
      gentle_next_step_title: { type: 'string' },
      gentle_next_step: { type: 'string' }
    },
    required: [
      'state_mode',
      'state_title',
      'state_description',
      'turning_points',
      'weight_rows',
      'you_brought',
      'miro_brought',
      'seed_to_sit_with',
      'gentle_next_step_title',
      'gentle_next_step'
    ]
  },
  strict: true
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'MIRO_ANALYZE_CHAT') {
    handleAnalyze(message.payload)
      .then((result) => sendResponse({ ok: true, result }))
      .catch((error) => sendResponse({ ok: false, error: error.message || 'Unknown error' }));
    return true;
  }
});

async function handleAnalyze(payload) {
  const stored = await chrome.storage.local.get(['apiKey']);
  const sanitizedKey = sanitizeApiKey(stored.apiKey);

  if (!sanitizedKey) {
    throw new Error('Add a valid OpenAI API key in the Miro popup before asking me to reflect on a chat.');
  }

  const messages = buildMessages(payload);

  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sanitizedKey}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.45,
      response_format: {
        type: 'json_schema',
        json_schema: reflectionSchema
      }
    })
  });

  if (!response.ok) {
    throw await createOpenAiError(response);
  }

  const data = await response.json();
  const parsed = parseStructuredOutput(data);
  return parsed;
}

function buildMessages(payload) {
  const {
    conversation = [],
    pageTitle,
    analysisMode = 'full',
    previousReflection = null,
    previousMessageCount = 0,
    fullMessageCount = conversation.length
  } = payload || {};
  const hasPreviousReflection = Boolean(previousReflection && typeof previousReflection === 'object');
  const isIncremental = analysisMode === 'incremental' && hasPreviousReflection;
  const system = [
    'You are Miro, a soft reflective companion living inside a student\'s ChatGPT chat.',
    'Your job is to notice how the work moved between you and the student in this one session.',
    'Return only valid JSON that matches the schema.',
    '',
    'Guidelines:',
    '- Miro speaks in first person and refers to the student as "you".',
    '- Stay gentle, thoughtful, slightly playful, and emotionally intelligent.',
    '- Never sound like a judge, warning system, cheating detector, therapist, or analytics dashboard.',
    '- Focus on ownership, authorship, learning, collaboration, and how the work was shared.',
    '- Ground everything in the actual chat. Be concrete enough that the student can recognize the moments.',
    '- Do not use direct quotes from the conversation.',
    '- turning_points should tell the arc of the session, not isolated fragments.',
    '- weight_rows should use intuitive work dimensions such as Coming up with ideas, Deciding the direction, Doing the research, Building the thing, Catching problems, Making the final call.',
    '- position is 0 to 100 where 0 means I carried more of that work and 100 means you carried more.',
    '- reason should sound like my read, not a verdict.',
    '- state_title should be short, warm, and match the state_mode.',
    '- state_description should sound like me describing how this session felt.',
    '- seed_to_sit_with should be one sharp reflective question about ownership, judgment, learning, or reliance.',
    '- gentle_next_step_title should be short and action-oriented.',
    '- gentle_next_step should suggest one small, useful next move based on this session.',
    '- Avoid numbers, scoring language, or overclaiming certainty.',
    isIncremental
      ? '- You may receive a previous structured reflection plus only the new messages since I was last opened. Update the reflection from that prior read instead of starting from zero.'
      : '- Read this session as a fresh full-session reflection.'
  ].join('\n');

  const user = {
    role: 'user',
    content: buildUserMessage({
      pageTitle,
      conversation,
      isIncremental,
      previousReflection,
      previousMessageCount,
      fullMessageCount
    })
  };

  return [
    { role: 'system', content: system },
    user
  ];
}

function buildUserMessage({
  pageTitle,
  conversation,
  isIncremental,
  previousReflection,
  previousMessageCount,
  fullMessageCount
}) {
  const lines = [`Page title: ${pageTitle || 'Untitled chat'}`];

  if (isIncremental) {
    lines.push(`This is an incremental reread of the same session.`);
    lines.push(`The previous reflection covered about ${previousMessageCount} messages.`);
    lines.push(`The session now has about ${fullMessageCount} visible messages.`);
    lines.push('Previous reflection snapshot:');
    lines.push(JSON.stringify(compactPreviousReflection(previousReflection)));
    lines.push('');
    lines.push('Only the new messages since that last reflection are below:');
  } else {
    lines.push('This is a fresh full-session read.');
    lines.push('Conversation:');
  }

  lines.push(
    ...conversation.map((message, index) => `${index + 1}. ${normalizeRole(message.role)}: ${sanitize(message.content)}`)
  );

  return lines.join('\n');
}

function compactPreviousReflection(reflection) {
  return {
    state_mode: reflection?.state_mode,
    state_title: sanitize(reflection?.state_title),
    state_description: sanitize(reflection?.state_description),
    turning_points: Array.isArray(reflection?.turning_points)
      ? reflection.turning_points.map((item) => sanitize(item)).slice(0, 4)
      : [],
    weight_rows: Array.isArray(reflection?.weight_rows)
      ? reflection.weight_rows.slice(0, 6).map((row) => ({
          key: sanitize(row?.key),
          label: sanitize(row?.label),
          position: Number.isFinite(Number(row?.position)) ? Number(row.position) : 50,
          reason: sanitize(row?.reason)
        }))
      : [],
    you_brought: Array.isArray(reflection?.you_brought)
      ? reflection.you_brought.map((item) => sanitize(item)).slice(0, 4)
      : [],
    miro_brought: Array.isArray(reflection?.miro_brought)
      ? reflection.miro_brought.map((item) => sanitize(item)).slice(0, 4)
      : [],
    seed_to_sit_with: sanitize(reflection?.seed_to_sit_with),
    gentle_next_step_title: sanitize(reflection?.gentle_next_step_title),
    gentle_next_step: sanitize(reflection?.gentle_next_step)
  };
}

function normalizeRole(role) {
  return role === 'assistant' ? 'MIRO' : 'YOU';
}

function sanitize(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1800);
}

function sanitizeApiKey(value) {
  if (typeof value !== 'string') return '';

  let cleaned = value.trim();
  cleaned = cleaned.replace(/^Bearer\s+/i, '');
  cleaned = cleaned.replace(/^["']+|["']+$/g, '');
  cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, '');
  cleaned = cleaned.replace(/\s+/g, '');
  cleaned = cleaned.replace(/[^A-Za-z0-9_\-]/g, '');

  if (!cleaned.startsWith('sk-')) return '';
  if (cleaned.length < 20) return '';
  return cleaned;
}

async function createOpenAiError(response) {
  let message = `OpenAI request failed (${response.status}).`;

  try {
    const data = await response.json();
    const apiMessage = data?.error?.message;
    if (apiMessage) {
      message = apiMessage;
    }
  } catch (error) {
    const text = await response.text().catch(() => '');
    if (text) {
      message = text.slice(0, 220);
    }
  }

  if (response.status === 401) {
    return new Error('That API key did not work. Double-check that you saved a valid raw OpenAI key, not a "Bearer ..." value.');
  }

  if (response.status === 429) {
    return new Error('I hit an OpenAI rate or quota limit while reflecting on this chat. Trying again in a moment should help.');
  }

  return new Error(message);
}

function parseStructuredOutput(data) {
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content === 'string') {
    return JSON.parse(content);
  }

  if (Array.isArray(content)) {
    const textChunk = content.find((item) => item?.type === 'text' && item.text);
    if (textChunk?.text) {
      return JSON.parse(textChunk.text);
    }
  }

  throw new Error('I got a response back, but I could not read the reflection payload.');
}
