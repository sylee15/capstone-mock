const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

const reflectionSchema = {
  name: 'miro_session_reflection',
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      session_read_title: { type: 'string' },
      session_read_narrative: { type: 'string' },
      session_read_mode: {
        type: 'string',
        enum: ['builder', 'shared', 'thoughtful', 'tired']
      },
      areas: {
        type: 'array',
        minItems: 1,
        maxItems: 2,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            key: {
              type: 'string',
              enum: ['research', 'writing', 'coding', 'design', 'studying', 'career', 'presenting', 'personal']
            },
            salience: {
              type: 'string',
              enum: ['primary', 'secondary']
            },
            weight: {
              type: ['number', 'null']
            }
          },
          required: ['key', 'salience', 'weight']
        }
      },
      weight_rows: {
        type: 'array',
        minItems: 6,
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
      try_now: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          copy: { type: 'string' }
        },
        required: ['title', 'copy']
      },
      collaboration_markers: {
        type: 'object',
        additionalProperties: false,
        properties: {
          user_provided_material: { type: 'boolean' },
          user_redirected_after_output: { type: 'boolean' },
          user_critiqued_or_corrected: { type: 'boolean' },
          user_made_final_selection: { type: 'boolean' },
          ai_produced_first_pass: { type: 'boolean' }
        },
        required: [
          'user_provided_material',
          'user_redirected_after_output',
          'user_critiqued_or_corrected',
          'user_made_final_selection',
          'ai_produced_first_pass'
        ]
      },
      interaction_pattern: {
        type: 'object',
        additionalProperties: false,
        properties: {
          opening_mode: {
            type: 'string',
            enum: ['delegation', 'contextualized', 'critique', 'pastein', 'exploration']
          },
          arc: {
            type: 'string',
            enum: ['draft_redirect_rebuild', 'ask_synthesize_decide', 'debug_test_fix', 'brainstorm_refine', 'explain_practice_check']
          },
          confidence: {
            type: 'string',
            enum: ['low', 'medium', 'high']
          }
        },
        required: ['opening_mode', 'arc', 'confidence']
      },
      evidence_note: { type: 'string' },
      trace: {
        anyOf: [
          {
            type: 'object',
            additionalProperties: false,
            properties: {
              first_key_turn: {
                type: ['integer', 'null']
              },
              key_turn_indices: {
                type: 'array',
                maxItems: 4,
                items: { type: 'integer' }
              }
            },
            required: ['first_key_turn', 'key_turn_indices']
          },
          {
            type: 'null'
          }
        ]
      }
    },
    required: [
      'session_read_title',
      'session_read_narrative',
      'session_read_mode',
      'areas',
      'weight_rows',
      'try_now',
      'collaboration_markers',
      'interaction_pattern',
      'evidence_note',
      'trace'
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
  return enrichReflectionResult(parsed, payload);
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
    '- session_read_narrative should be one compact first-person block that naturally carries my role in the session.',
    '- session_read_narrative should explicitly make clear that "I" means the AI companion and "you" means the student.',
    '- A good shape is: "I, your AI, showed up more like a builder here. You were doing X, and I helped with Y."',
    '- session_read_mode should be builder, shared, thoughtful, or tired based on the role I mostly played in this session.',
    '- areas must use this taxonomy only: research, writing, coding, design, studying, career, presenting, personal.',
    '- areas should contain exactly one primary area and optionally one secondary area.',
    '- areas.weight should always be included. Use a number from 0 to 1 when helpful, or null if the chat does not need weighting.',
    '- areas describe where AI showed up in this chat, not the student overall.',
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
    '- try_now should be one short, concrete action the student can do immediately in the next turn of this chat.',
    '- try_now should feel like a small way to shift the collaboration pattern, not broad future advice or a study habit tip.',
    '- collaboration_markers should capture only these stable signals: user_provided_material, user_redirected_after_output, user_critiqued_or_corrected, user_made_final_selection, ai_produced_first_pass.',
    '- interaction_pattern should use the allowed values only, and should stay simple and stable rather than overly specific.',
    '- evidence_note must be strictly behavioral and concrete. Describe what the student and I did, not what kind of session this "was".',
    '- trace is required. If useful, it may include the first key turn and a few key turn indices for later drill-down.',
    '- If trace is not useful, set trace to null.',
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
    session_read_narrative: sanitize(reflection?.session_read_narrative),
    session_read_mode: sanitize(reflection?.session_read_mode),
    areas: Array.isArray(reflection?.areas)
      ? reflection.areas.slice(0, 2).map((area) => ({
          key: sanitize(area?.key),
          salience: sanitize(area?.salience),
          weight: Number.isFinite(Number(area?.weight)) ? Number(area.weight) : null
        }))
      : [],
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
    try_now: {
      title: sanitize(reflection?.try_now?.title),
      copy: sanitize(reflection?.try_now?.copy)
    },
    collaboration_markers: {
      user_provided_material: Boolean(reflection?.collaboration_markers?.user_provided_material),
      user_redirected_after_output: Boolean(reflection?.collaboration_markers?.user_redirected_after_output),
      user_critiqued_or_corrected: Boolean(reflection?.collaboration_markers?.user_critiqued_or_corrected),
      user_made_final_selection: Boolean(reflection?.collaboration_markers?.user_made_final_selection),
      ai_produced_first_pass: Boolean(reflection?.collaboration_markers?.ai_produced_first_pass)
    },
    interaction_pattern: {
      opening_mode: sanitize(reflection?.interaction_pattern?.opening_mode),
      arc: sanitize(reflection?.interaction_pattern?.arc),
      confidence: sanitize(reflection?.interaction_pattern?.confidence)
    },
    evidence_note: sanitize(reflection?.evidence_note),
    trace: reflection?.trace && typeof reflection.trace === 'object'
      ? {
          first_key_turn: Number.isFinite(Number(reflection?.trace?.first_key_turn)) ? Number(reflection.trace.first_key_turn) : null,
          key_turn_indices: Array.isArray(reflection?.trace?.key_turn_indices)
            ? reflection.trace.key_turn_indices
                .map((value) => Number(value))
                .filter((value) => Number.isFinite(value))
                .slice(0, 4)
            : []
        }
      : null
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

function enrichReflectionResult(result, payload) {
  const chatKey = sanitize(payload?.sessionKey || payload?.pageTitle || 'current-chat');
  const analyzedAt = new Date().toISOString();
  const messageCount = Array.isArray(payload?.conversation)
    ? payload.conversation.length + (Number(payload?.previousMessageCount) || 0)
    : Number(payload?.fullMessageCount) || 0;
  const weightRows = Array.isArray(result?.weight_rows) ? result.weight_rows : [];

  return {
    ...result,
    session_id: sanitize(result?.session_id) || `session_${simpleHash(`${chatKey}|${messageCount}`)}`,
    chat_key: sanitize(result?.chat_key) || chatKey,
    analyzed_at: sanitize(result?.analyzed_at) || analyzedAt,
    message_count: Number.isFinite(Number(result?.message_count)) ? Number(result.message_count) : messageCount,
    work_split: deriveWorkSplitFromRows(weightRows)
  };
}

function deriveWorkSplitFromRows(rows) {
  const split = {
    ideas: 50,
    direction: 50,
    research: 50,
    building: 50,
    problems: 50,
    final_call: 50
  };

  rows.forEach((row) => {
    const key = sanitize(row?.key);
    if (Object.prototype.hasOwnProperty.call(split, key) && Number.isFinite(Number(row?.position))) {
      split[key] = Number(row.position);
    }
  });

  return split;
}

function simpleHash(value) {
  let hash = 0;
  const text = String(value || '');
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash) + text.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
