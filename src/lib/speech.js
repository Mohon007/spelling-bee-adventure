// Text-to-speech using the browser's built-in voices (no audio files needed).
const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;

let rate = 0.85;
let voice = null;

const PREFERRED = [
  /Ana Online/i, // Edge: friendly child voice
  /Jenny Online/i,
  /Aria Online/i,
  /Google US English/i,
  /Samantha/i,
  /Google UK English Female/i,
  /Zira/i,
];

function chooseVoice() {
  if (!synth) return null;
  const english = synth.getVoices().filter((v) => /^en[-_]/i.test(v.lang));
  for (const p of PREFERRED) {
    const found = english.find((v) => p.test(v.name));
    if (found) return found;
  }
  return english.find((v) => v.default) || english[0] || null;
}

if (synth) {
  voice = chooseVoice();
  synth.onvoiceschanged = () => {
    voice = chooseVoice();
  };
}

export const canSpeak = Boolean(synth);

export function setRate(value) {
  rate = value;
}

export function stopSpeech() {
  if (synth) synth.cancel();
}

// Resolves when speaking ends (or after a safety timeout).
export function speak(text, options = {}) {
  return new Promise((resolve) => {
    if (!synth || !text) {
      resolve();
      return;
    }
    synth.cancel();
    if (!voice) voice = chooseVoice();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = options.rate ?? rate;
    u.pitch = 1.05;
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    } else {
      u.lang = 'en-US';
    }
    let finished = false;
    const finish = () => {
      if (!finished) {
        finished = true;
        resolve();
      }
    };
    u.onend = finish;
    u.onerror = finish;
    setTimeout(finish, 2000 + text.length * 140);
    synth.speak(u);
  });
}
