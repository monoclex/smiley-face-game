import { AudioContext, GainNode, decodeAudioData, IAudioBuffer } from "standardized-audio-context";
import { Game } from "@smiley-face-game/api";
import playerJoinUrl from "../assets/sounds/player-join.mp3";
import playerLeaveUrl from "../assets/sounds/player-leave.mp3";
import deathUrl from "../assets/sounds/death.mp3";
import checkpointUrl from "../assets/sounds/checkpoint.mp3";

export const audio = new AudioContext();

export const volume = new GainNode(audio);
volume.connect(audio.destination);

async function loadAudio(url: string) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const audioData = await decodeAudioData(audio, buffer);
  return audioData;
}

const joinAudio = loadAudio(playerJoinUrl);
const leaveAudio = loadAudio(playerLeaveUrl);
const deathAudio = loadAudio(deathUrl);
const checkpointAudio = loadAudio(checkpointUrl);

const makePlayer = (audioPromise: Promise<IAudioBuffer>) => async () => {
  const audioData = await audioPromise;

  const source = audio.createBufferSource();
  source.buffer = audioData;
  source.connect(volume);
  source.start(0);
};

export const playJoin = makePlayer(joinAudio);
export const playLeave = makePlayer(leaveAudio);
export const playDeath = makePlayer(deathAudio);
export const playCheckpoint = makePlayer(checkpointAudio);

export async function registerPlayerJoinNLeaveSoundEffects(game: Game) {
  game.players.events.on("add", playJoin);
  game.players.events.on("remove", playLeave);
  game.physics.events.on("checkpoint", playCheckpoint);
  game.physics.events.on("death", playDeath);
}
