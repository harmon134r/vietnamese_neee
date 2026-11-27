/**
 * Unified Curriculum & Content Entry Point for munnn01 (Adult Pre-Intermediate A2-B1 Vietnamese).
 */

import { TOPICS } from "./topics.js";
import { STARTER_DECKS } from "./starterDecks.js";
import {
  LISTENING_EXERCISES,
  READING_PASSAGES,
  SENTENCE_BUILDERS,
} from "./listeningReading.js";
import {
  TONE_MINIMAL_PAIRS,
  PRONUNCIATION_SENTENCES,
} from "./pronunciationDrills.js";
import { DIALOGUE_SCENARIOS } from "./dialogues.js";
import {
  CHASE_MODES,
  CHASE_SCENES,
  SYNONYM_ANTONYM_ITEMS,
  getChaseItems,
} from "./synonymAntonym.js";

export {
  TOPICS,
  STARTER_DECKS,
  LISTENING_EXERCISES,
  READING_PASSAGES,
  SENTENCE_BUILDERS,
  TONE_MINIMAL_PAIRS,
  PRONUNCIATION_SENTENCES,
  DIALOGUE_SCENARIOS,
  CHASE_MODES,
  CHASE_SCENES,
  SYNONYM_ANTONYM_ITEMS,
  getChaseItems,
};

/**
 * Look up a curriculum topic by its canonical TopicId.
 * @param {string} id
 * @returns {(typeof TOPICS)[number] | null}
 */
export function getTopicById(id) {
  if (typeof id !== "string") return null;
  return TOPICS.find((topic) => topic.id === id) ?? null;
}

/**
 * Aggregate curriculum counts across all modules and per topic.
 */
export function getContentStats() {
  const byTopic = {};

  for (const topic of TOPICS) {
    const deck = STARTER_DECKS.find((d) => d.topicId === topic.id);
    byTopic[topic.id] = {
      flashcards: deck ? deck.cards.length : 0,
      listeningExercises: LISTENING_EXERCISES.filter((x) => x.topicId === topic.id).length,
      readingPassages: READING_PASSAGES.filter((x) => x.topicId === topic.id).length,
      sentenceBuilders: SENTENCE_BUILDERS.filter((x) => x.topicId === topic.id).length,
      minimalPairs: TONE_MINIMAL_PAIRS.filter((x) => x.topicId === topic.id).length,
      pronunciationSentences: PRONUNCIATION_SENTENCES.filter((x) => x.topicId === topic.id).length,
      dialogueScenarios: DIALOGUE_SCENARIOS.filter((x) => x.topicId === topic.id).length,
      synonymAntonymItems: SYNONYM_ANTONYM_ITEMS.filter((x) => x.topicId === topic.id).length,
    };
  }

  return {
    topics: TOPICS.length,
    decks: STARTER_DECKS.length,
    flashcards: STARTER_DECKS.reduce((sum, deck) => sum + deck.cards.length, 0),
    listeningExercises: LISTENING_EXERCISES.length,
    readingPassages: READING_PASSAGES.length,
    sentenceBuilders: SENTENCE_BUILDERS.length,
    minimalPairs: TONE_MINIMAL_PAIRS.length,
    pronunciationSentences: PRONUNCIATION_SENTENCES.length,
    dialogueScenarios: DIALOGUE_SCENARIOS.length,
    dialogueTurns: DIALOGUE_SCENARIOS.reduce((sum, dlg) => sum + dlg.turns.length, 0),
    synonymAntonymItems: SYNONYM_ANTONYM_ITEMS.length,
    byTopic,
  };
}
