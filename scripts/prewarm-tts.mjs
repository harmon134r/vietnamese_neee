#!/usr/bin/env node
/**
 * Pre-warm Supabase Storage `tts-cache` bucket with Northern Vietnamese
 * VieNeu-TTS-v3-Turbo audio clips for the built-in munnn01 curriculum.
 *
 * Reads credentials strictly from runtime environment variables:
 *   - SUPABASE_URL or VITE_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY
 *
 * Usage:
 *   node scripts/prewarm-tts.mjs [--batch=1|2|all] [--limit=N] [--concurrency=2] [--dry-run]
 */

import {
  LISTENING_EXERCISES,
  STARTER_DECKS,
  DIALOGUE_SCENARIOS,
  TONE_MINIMAL_PAIRS,
  PRONUNCIATION_SENTENCES,
  SENTENCE_BUILDERS,
  TOPICS,
} from "../src/data/index.js";

import {
  NORTHERN_VOICE_IDS,
  normalizeTtsText,
  pickRandomVoiceForText,
  adaptiveMaxFrames,
  splitVietnameseSentences,
  computeTtsCachePath,
} from "../src/lib/ttsText.js";

const HF_SPACE_BASE_URL = "https://nam194-vieneu-tts-v3-turbo.hf.space";
const HF_SYNTHESIZE_CALL_URL = `${HF_SPACE_BASE_URL}/gradio_api/call/synthesize`;
const HEAD_TIMEOUT_MS = 6000;
const HF_SYNTH_TIMEOUT_MS = 25000;
const UPLOAD_TIMEOUT_MS = 12000;
const MAX_CACHE_BYTES = 4 * 1024 * 1024;
const SYNTH_MAX_RETRIES = 1;
const RETRY_DELAY_MS = 1200;

const HF_VOICE_LABELS = Object.freeze({
  ngochuyen: "Ngọc Huyền",
  trucly: "Trúc Ly",
  maianh: "Mai Anh",
  haidang: "Hải Đăng",
  thienminh: "Thiện Minh",
});

function parseCliArgs(argv) {
  const opts = {
    batch: "all",
    limit: Infinity,
    concurrency: 2,
    dryRun: false,
  };

  for (const arg of argv) {
    if (arg === "--dry-run") {
      opts.dryRun = true;
      continue;
    }
    if (arg.startsWith("--batch=")) {
      const val = arg.slice("--batch=".length).trim().toLowerCase();
      if (val === "1" || val === "2" || val === "all") {
        opts.batch = val;
      } else {
        throw new Error(`Invalid --batch value "${val}". Expected 1, 2, or all.`);
      }
      continue;
    }
    if (arg.startsWith("--limit=")) {
      const parsed = Number(arg.slice("--limit=".length).trim());
      if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error(`Invalid --limit value "${arg}". Expected a positive integer.`);
      }
      opts.limit = parsed;
      continue;
    }
    if (arg.startsWith("--concurrency=")) {
      const parsed = Number(arg.slice("--concurrency=".length).trim());
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 8) {
        throw new Error(`Invalid --concurrency value "${arg}". Expected integer 1..8.`);
      }
      opts.concurrency = parsed;
      continue;
    }
  }

  return opts;
}

function getSupabaseEnv(env = process.env) {
  const supabaseUrl = String(env.SUPABASE_URL || env.VITE_SUPABASE_URL || "")
    .trim()
    .replace(/\/+$/, "");
  const supabaseKey = String(
    env.SUPABASE_SERVICE_ROLE_KEY ||
      env.SUPABASE_ANON_KEY ||
      env.VITE_SUPABASE_ANON_KEY ||
      ""
  ).trim();
  return { supabaseUrl, supabaseKey };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function addItem(queue, seenPaths, { batch, category, voiceId, text }) {
  const normalized = normalizeTtsText(text);
  if (!normalized) return;
  const hfVoice = HF_VOICE_LABELS[voiceId];
  if (!hfVoice) return;
  const cachePath = await computeTtsCachePath(voiceId, normalized);
  if (seenPaths.has(cachePath)) return;
  seenPaths.add(cachePath);
  queue.push({
    batch,
    category,
    voiceId,
    hfVoice,
    text: normalized,
    cachePath,
  });
}

async function enqueuePassageRandomMode(queue, seenPaths, { batch, category, fullText }) {
  const normalizedFull = normalizeTtsText(fullText);
  if (!normalizedFull) return;
  // Resolve deterministic voice on the FULL text before sentence splitting
  // so every sentence in a multi-sentence passage uses the exact same speaker
  // as `src/lib/speech.js`.
  const voiceId = pickRandomVoiceForText(normalizedFull);
  const sentences = splitVietnameseSentences(normalizedFull);
  for (const sentence of sentences) {
    await addItem(queue, seenPaths, {
      batch,
      category,
      voiceId,
      text: sentence,
    });
  }
}

async function buildPrewarmQueue(batchFilter) {
  const queue = [];
  const seenPaths = new Set();

  // Batch 1 (TOP PRIORITY): Every sentence of all 18 Listening Exercises across ALL 5 Northern voices
  if (batchFilter === "all" || batchFilter === "1") {
    for (const exercise of LISTENING_EXERCISES) {
      const sentences = splitVietnameseSentences(exercise?.audioTextVi || "");
      for (const voiceId of NORTHERN_VOICE_IDS) {
        for (const sentence of sentences) {
          await addItem(queue, seenPaths, {
            batch: 1,
            category: "listening",
            voiceId,
            text: sentence,
          });
        }
      }
    }
  }

  // Batch 2 (Default `random` mode across the ENTIRE rest of the curriculum)
  if (batchFilter === "all" || batchFilter === "2") {
    // 2a. All 54 STARTER_DECKS flashcards: frontVi + exampleVi
    for (const deck of STARTER_DECKS) {
      const cards = Array.isArray(deck?.cards) ? deck.cards : [];
      for (const card of cards) {
        await enqueuePassageRandomMode(queue, seenPaths, {
          batch: 2,
          category: "flashcard-front",
          fullText: card?.frontVi,
        });
        await enqueuePassageRandomMode(queue, seenPaths, {
          batch: 2,
          category: "flashcard-example",
          fullText: card?.exampleVi,
        });
      }
    }

    // 2b. All 24 DIALOGUE_SCENARIOS turns: npcTextVi
    for (const scenario of DIALOGUE_SCENARIOS) {
      const turns = Array.isArray(scenario?.turns) ? scenario.turns : [];
      for (const turn of turns) {
        await enqueuePassageRandomMode(queue, seenPaths, {
          batch: 2,
          category: "dialogue",
          fullText: turn?.npcTextVi,
        });
      }
    }

    // 2c. All TONE_MINIMAL_PAIRS items
    for (const pair of TONE_MINIMAL_PAIRS) {
      const items = Array.isArray(pair?.items) ? pair.items : [];
      for (const item of items) {
        await enqueuePassageRandomMode(queue, seenPaths, {
          batch: 2,
          category: "minimal-pair",
          fullText: item?.vi,
        });
      }
    }

    // 2d. All PRONUNCIATION_SENTENCES
    for (const sentence of PRONUNCIATION_SENTENCES) {
      await enqueuePassageRandomMode(queue, seenPaths, {
        batch: 2,
        category: "pronunciation-sentence",
        fullText: sentence?.textVi,
      });
    }

    // 2e. All SENTENCE_BUILDERS
    for (const builder of SENTENCE_BUILDERS) {
      await enqueuePassageRandomMode(queue, seenPaths, {
        batch: 2,
        category: "sentence-builder",
        fullText: builder?.targetSentenceVi,
      });
    }

    // 2f. All TOPICS keyPhrases
    for (const topic of TOPICS) {
      const phrases = Array.isArray(topic?.keyPhrases) ? topic.keyPhrases : [];
      for (const phrase of phrases) {
        const text = typeof phrase === "string" ? phrase : phrase?.vi;
        await enqueuePassageRandomMode(queue, seenPaths, {
          batch: 2,
          category: "topic-phrase",
          fullText: text,
        });
      }
    }
  }

  return queue;
}

async function checkSupabaseExists(supabaseUrl, cachePath) {
  const url = `${supabaseUrl}/storage/v1/object/public/tts-cache/${cachePath}`;
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), HEAD_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    });
    return res.status === 200;
  } catch {
    return false;
  } finally {
    clearTimeout(timerId);
  }
}

function extractGradioAudioUrl(rawData) {
  let parsed;
  try {
    parsed = JSON.parse(rawData);
  } catch {
    throw new Error("Invalid JSON in Gradio complete event");
  }

  const first = Array.isArray(parsed) ? parsed[0] : parsed;
  let candidate = "";
  if (typeof first === "string") {
    candidate = first.trim();
  } else if (first && typeof first === "object") {
    if (typeof first.url === "string" && first.url.trim()) {
      candidate = first.url.trim();
    } else if (typeof first.path === "string" && first.path.trim()) {
      candidate = `${HF_SPACE_BASE_URL}/gradio_api/file=${first.path.trim()}`;
    }
  }

  if (!candidate) {
    throw new Error("Gradio complete event missing audio URL");
  }
  if (candidate.startsWith("/")) {
    return `${HF_SPACE_BASE_URL}${candidate}`;
  }
  return candidate;
}

async function readGradioSseAudioUrl(sseResponse) {
  let currentEvent = "";
  let dataLines = [];

  const dispatchBlock = () => {
    const eventName = currentEvent.trim().toLowerCase();
    const dataText = dataLines.join("\n").trim();
    currentEvent = "";
    dataLines = [];

    if (!eventName && !dataText) return null;
    if (eventName === "complete") {
      return extractGradioAudioUrl(dataText);
    }
    if (eventName === "error") {
      throw new Error(`VieNeu-TTS Space error: ${dataText || "synthesis failed"}`);
    }
    return null;
  };

  const processLines = (lines) => {
    for (const rawLine of lines) {
      const line = rawLine.replace(/\r$/, "");
      if (line === "") {
        const foundUrl = dispatchBlock();
        if (foundUrl) return foundUrl;
        continue;
      }
      if (line.startsWith(":")) continue;
      if (line.startsWith("event:")) {
        currentEvent = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trimStart());
      }
    }
    return null;
  };

  if (sseResponse.body && typeof sseResponse.body.getReader === "function") {
    const reader = sseResponse.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n");
        buffer = parts.pop() || "";
        const foundUrl = processLines(parts);
        if (foundUrl) {
          reader.cancel().catch(() => {});
          return foundUrl;
        }
      }
      buffer += decoder.decode();
      if (buffer) {
        const foundUrl = processLines(buffer.split("\n"));
        if (foundUrl) return foundUrl;
      }
      const tailUrl = dispatchBlock();
      if (tailUrl) return tailUrl;
    } finally {
      try {
        reader.releaseLock();
      } catch {
        // ignore
      }
    }
  } else {
    const fullText = await sseResponse.text();
    const foundUrl = processLines(fullText.split("\n"));
    if (foundUrl) return foundUrl;
    const tailUrl = dispatchBlock();
    if (tailUrl) return tailUrl;
  }

  throw new Error("VieNeu-TTS SSE stream ended without a complete event");
}

async function synthesizeViaVieNeuOnce(text, hfVoice) {
  const maxNewFrames = adaptiveMaxFrames(text);
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), HF_SYNTH_TIMEOUT_MS);

  try {
    const callRes = await fetch(HF_SYNTHESIZE_CALL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        data: [
          text,
          hfVoice,
          null,
          0.8,
          25,
          0.95,
          1.2,
          maxNewFrames,
          200,
          true,
        ],
      }),
      signal: controller.signal,
    });

    if (!callRes.ok) {
      throw new Error(`HF call HTTP ${callRes.status}`);
    }

    const callJson = await callRes.json();
    const eventId = typeof callJson?.event_id === "string" ? callJson.event_id.trim() : "";
    if (!eventId) {
      throw new Error("HF call response missing event_id");
    }

    const sseUrl = `${HF_SYNTHESIZE_CALL_URL}/${encodeURIComponent(eventId)}`;
    const sseRes = await fetch(sseUrl, {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
      },
      signal: controller.signal,
    });

    if (!sseRes.ok) {
      throw new Error(`HF SSE HTTP ${sseRes.status}`);
    }

    const audioUrl = await readGradioSseAudioUrl(sseRes);

    const audioRes = await fetch(audioUrl, {
      method: "GET",
      headers: {
        Accept: "audio/wav, audio/x-wav, audio/*;q=0.9, */*;q=0.5",
      },
      signal: controller.signal,
    });

    if (!audioRes.ok) {
      throw new Error(`HF audio download HTTP ${audioRes.status}`);
    }

    const contentType = String(audioRes.headers.get("content-type") || "").toLowerCase();
    if (contentType && !contentType.includes("audio") && !contentType.includes("octet-stream")) {
      throw new Error(`Unexpected HF content-type: ${contentType}`);
    }

    const arrayBuffer = await audioRes.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error("HF returned empty WAV payload");
    }
    if (arrayBuffer.byteLength > MAX_CACHE_BYTES) {
      throw new Error(`WAV payload exceeds 4 MiB limit (${arrayBuffer.byteLength} bytes)`);
    }

    return Buffer.from(arrayBuffer);
  } finally {
    clearTimeout(timerId);
  }
}

async function synthesizeWithRetry(text, hfVoice) {
  let lastErr;
  for (let attempt = 0; attempt <= SYNTH_MAX_RETRIES; attempt += 1) {
    try {
      return await synthesizeViaVieNeuOnce(text, hfVoice);
    } catch (err) {
      lastErr = err;
      if (attempt < SYNTH_MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS);
      }
    }
  }
  throw lastErr;
}

async function uploadToSupabase(supabaseUrl, supabaseKey, cachePath, audioBuffer) {
  const url = `${supabaseUrl}/storage/v1/object/tts-cache/${cachePath}`;
  let lastErr;

  for (let attempt = 0; attempt <= 1; attempt += 1) {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "audio/wav",
          "x-upsert": "false",
        },
        body: audioBuffer,
        signal: controller.signal,
      });

      if (res.status === 409) {
        return "conflict";
      }
      if (res.ok) {
        return "uploaded";
      }
      const errBody = await res.text().catch(() => "");
      throw new Error(`Supabase upload HTTP ${res.status}${errBody ? `: ${errBody.slice(0, 160)}` : ""}`);
    } catch (err) {
      lastErr = err;
      if (attempt < 1) {
        await sleep(600);
      }
    } finally {
      clearTimeout(timerId);
    }
  }

  throw lastErr;
}

function summarizeByCategory(items) {
  const counts = {};
  for (const item of items) {
    const key = `B${item.batch}:${item.category}`;
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

async function main() {
  const opts = parseCliArgs(process.argv.slice(2));
  const { supabaseUrl, supabaseKey } = getSupabaseEnv();

  const fullQueue = await buildPrewarmQueue(opts.batch);
  const queue = Number.isFinite(opts.limit) ? fullQueue.slice(0, opts.limit) : fullQueue;

  console.log(
    `[prewarm-tts] batch=${opts.batch} concurrency=${opts.concurrency} total=${queue.length}` +
      (Number.isFinite(opts.limit) ? ` (sliced from ${fullQueue.length})` : "")
  );
  console.log("[prewarm-tts] breakdown:", JSON.stringify(summarizeByCategory(queue)));

  if (opts.dryRun) {
    console.log("[prewarm-tts] dry-run sample (first 5):");
    for (const item of queue.slice(0, 5)) {
      console.log(`  - [B${item.batch} ${item.category}] ${item.voiceId} (${item.hfVoice}) -> ${item.cachePath} :: "${item.text.slice(0, 60)}"`);
    }
    return;
  }

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "[prewarm-tts] Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_ANON_KEY/VITE_SUPABASE_ANON_KEY in environment."
    );
    process.exit(1);
  }

  const startedAt = Date.now();
  const stats = {
    total: queue.length,
    uploaded: 0,
    skipped: 0,
    failed: 0,
    byCategory: {},
    failures: [],
  };

  const bumpCategory = (item, field) => {
    const key = `B${item.batch}:${item.category}`;
    if (!stats.byCategory[key]) {
      stats.byCategory[key] = { uploaded: 0, skipped: 0, failed: 0 };
    }
    stats.byCategory[key][field] += 1;
  };

  let nextIdx = 0;
  let completed = 0;

  async function worker() {
    while (true) {
      const idx = nextIdx;
      nextIdx += 1;
      if (idx >= queue.length) return;

      const item = queue[idx];
      const itemStart = Date.now();

      try {
        const exists = await checkSupabaseExists(supabaseUrl, item.cachePath);
        if (exists) {
          stats.skipped += 1;
          bumpCategory(item, "skipped");
          completed += 1;
          if (completed % 25 === 0 || completed === queue.length) {
            const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(1);
            console.log(
              `[prewarm-tts] ${completed}/${queue.length} (${elapsedSec}s) uploaded=${stats.uploaded} skipped=${stats.skipped} failed=${stats.failed}`
            );
          }
          continue;
        }

        const wavBuffer = await synthesizeWithRetry(item.text, item.hfVoice);
        const uploadResult = await uploadToSupabase(
          supabaseUrl,
          supabaseKey,
          item.cachePath,
          wavBuffer
        );

        if (uploadResult === "conflict") {
          stats.skipped += 1;
          bumpCategory(item, "skipped");
        } else {
          stats.uploaded += 1;
          bumpCategory(item, "uploaded");
        }

        completed += 1;
        const itemMs = Date.now() - itemStart;
        if (completed % 10 === 0 || completed === queue.length || itemMs > 8000) {
          const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(1);
          console.log(
            `[prewarm-tts] ${completed}/${queue.length} (${elapsedSec}s) uploaded=${stats.uploaded} skipped=${stats.skipped} failed=${stats.failed} last=[${item.category}/${item.voiceId} ${itemMs}ms ${(wavBuffer.byteLength / 1024).toFixed(1)}KB]`
          );
        }
      } catch (err) {
        stats.failed += 1;
        bumpCategory(item, "failed");
        completed += 1;
        const message = err instanceof Error ? err.message : String(err);
        stats.failures.push({
          batch: item.batch,
          category: item.category,
          voiceId: item.voiceId,
          cachePath: item.cachePath,
          text: item.text.slice(0, 80),
          error: message,
        });
        console.error(
          `[prewarm-tts] FAIL ${completed}/${queue.length} [${item.category}/${item.voiceId}] ${item.cachePath}: ${message}`
        );
      }
    }
  }

  const workers = Array.from({ length: Math.min(opts.concurrency, Math.max(1, queue.length)) }, () =>
    worker()
  );
  await Promise.all(workers);

  const totalSec = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(`[prewarm-tts] DONE in ${totalSec}s`);
  console.log("[prewarm-tts] SUMMARY:", JSON.stringify({
    batch: opts.batch,
    total: stats.total,
    uploaded: stats.uploaded,
    skipped: stats.skipped,
    failed: stats.failed,
    durationSec: Number(totalSec),
    byCategory: stats.byCategory,
  }));

  if (stats.failures.length > 0) {
    console.log("[prewarm-tts] FAILURES:", JSON.stringify(stats.failures.slice(0, 20)));
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("[prewarm-tts] Fatal error:", err);
  process.exit(1);
});
