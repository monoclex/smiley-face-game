import { AudioContext, decodeAudioData } from "standardized-audio-context";
import { Game } from "@smiley-face-game/api";
import playerJoinUrl from "../assets/sounds/player-join.mp3";
import playerLeaveUrl from "../assets/sounds/player-leave.mp3";
const audio = new AudioContext();

async function loadAudio(url: string) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const audioData = await decodeAudioData(audio, buffer);
  return audioData;
}

const joinAudio = loadAudio(playerJoinUrl);
const leaveAudio = loadAudio(playerLeaveUrl);

export async function playJoin() {
  const audioData = await joinAudio;

  const source = audio.createBufferSource();
  source.buffer = audioData;
  source.connect(audio.destination);
  source.start(0);
}

export async function playLeave() {
  const audioData = await leaveAudio;

  const source = audio.createBufferSource();
  source.buffer = audioData;
  source.connect(audio.destination);
  source.start(0);
}

export async function registerPlayerJoinNLeaveSoundEffects(game: Game) {
  game.players.events.on("add", () => playJoin());
  game.players.events.on("remove", () => playLeave());
}
