const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

const reflectionSchema = {
  name: 'miro_session_reflection',
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      session_read_title: { type: 'string' },
      session_read_chips: {
        type: 'array',
        minItems: 1,
        maxItems: 2,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            label: { type: 'string' },
            tone: {
              type: 'string',
              enum: ['miro', 'shared', 'task']
            }
          },
          required: ['label', 'tone']
        }
      },
      session_read_narrative: { type: 'string' },
      weight_rows: {
        type: 'array',
        minItems: 5,
        maxItems: 6,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            key: { type: 'string' },
            label: { type: 'string' },
            position: { type: 'number' },
            range_start: { type: 'number' },
            range_end: { type: 'number' },
            verdict: { type: 'string' },
            reason: { type: 'string' }
          },
          required: ['key', 'label', 'position', 'range_start', 'range_end', 'verdict', 'reason']
        }
      },
      pattern_title: { type: 'string' },
      pattern_copy: { type: 'string' },
      try_items: {
        type: 'array',
        minItems: 2,
        maxItems: 3,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            basis_key: {
              type: 'string',
              enum: ['ideas', 'direction', 'research', 'building', 'problems', 'final_call']
            },
            icon_type: {
              type: 'string',
              enum: ['rework', 'reframe', 'reclaim']
            },
            title: { type: 'string' },
            copy: { type: 'string' },
            source: { type: 'string' }
          },
          required: ['basis_key', 'icon_type', 'title', 'copy', 'source']
        }
      }
    },
    required: [
      'session_read_title',
      'session_read_chips',
      'session_read_narrative',
      'weight_rows',
      'pattern_title',
      'pattern_copy',
      'try_items'
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
      temperature: 0.25,
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
    '- session_read_title should be short and concrete, like a distilled read of how this session went.',
    '- session_read_chips should be one or two very short labels that describe the split or the task type.',
    '- session_read_narrative should be short: one compact read in 1 to 2 sentences about how this session moved.',
    '- weight_rows must always be exactly these six work dimensions, in this exact order:',
    '  1. ideas / Coming up with ideas',
    '  2. direction / Deciding the direction',
    '  3. research / Doing the research',
    '  4. building / Building the thing',
    '  5. problems / Catching problems',
    '  6. final_call / Making the final call',
    '- Do not invent custom category names such as task-specific labels. Put session-specific detail in the reason field, not in the label.',
    '- Keep the same weight_rows keys, labels, and overall order stable across rereads of the same session whenever possible.',
    '- position is 0 to 100 where 0 means I carried more of that work and 100 means you carried more.',
    '- range_start and range_end should show the rough band where that work seemed to move during the session. Keep them on the same 0 to 100 scale, with range_start <= position <= range_end.',
    '- When rereading the same session, do not swing slider positions dramatically unless the new messages clearly changed who carried that kind of work.',
    '- If only a little changed, nudge the relevant sliders instead of reinventing the whole map.',
    '- verdict should be a short phrase such as Leaned to me, Shared, Mostly you, or Clearly you.',
    '- reason should sound like my read, not a verdict.',
    '- pattern_title and pattern_copy should name one specific prompt or usage pattern I noticed in this session.',
    '- try_items should be small, concrete next moves based on this exact session, not generic study advice.',
    '- Every try item must anchor to one slider using basis_key. Choose the slider that most clearly justifies the recommendation.',
    '- The copy of each try item should explicitly reflect that slider, for example: "Building the thing leaned heavily to AI this session, so..."',
    '- source should be a brief follow-on note that supports the action, not a generic label.',
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
    session_read_title: sanitize(reflection?.session_read_title),
    session_read_chips: Array.isArray(reflection?.session_read_chips)
      ? reflection.session_read_chips.slice(0, 2).map((chip) => ({
          label: sanitize(chip?.label),
          tone: sanitize(chip?.tone)
        }))
      : [],
    session_read_narrative: sanitize(reflection?.session_read_narrative),
    weight_rows: Array.isArray(reflection?.weight_rows)
      ? reflection.weight_rows.slice(0, 6).map((row) => ({
          key: sanitize(row?.key),
          label: sanitize(row?.label),
          position: Number.isFinite(Number(row?.position)) ? Number(row.position) : 50,
          range_start: Number.isFinite(Number(row?.range_start)) ? Number(row.range_start) : 38,
          range_end: Number.isFinite(Number(row?.range_end)) ? Number(row.range_end) : 62,
          verdict: sanitize(row?.verdict),
          reason: sanitize(row?.reason)
        }))
      : [],
    pattern_title: sanitize(reflection?.pattern_title),
    pattern_copy: sanitize(reflection?.pattern_copy),
    try_items: Array.isArray(reflection?.try_items)
      ? reflection.try_items.slice(0, 3).map((item) => ({
          basis_key: sanitize(item?.basis_key),
          icon_type: sanitize(item?.icon_type),
          title: sanitize(item?.title),
          copy: sanitize(item?.copy),
          source: sanitize(item?.source)
        }))
      : []
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
