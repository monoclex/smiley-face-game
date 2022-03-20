import { AudioContext, GainNode, decodeAudioData, IAudioBuffer } from "standardized-audio-context";
import { Game } from "@smiley-face-game/api";
import playerJoinUrl from "../assets/sounds/player-join.mp3";
import playerLeaveUrl from "../assets/sounds/player-leave.mp3";
import deathUrl from "../assets/sounds/death.mp3";
import checkpointUrl from "../assets/sounds/checkpoint.mp3";
import doorOpenUrl from "../assets/sounds/door_open.mp3";
import doorCloseUrl from "../assets/sounds/door_close.mp3";
import switchOnUrl from "../assets/sounds/switch_on.mp3";
import switchOffUrl from "../assets/sounds/switch_off.mp3";

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
const doorOpenAudio = loadAudio(doorOpenUrl);
const doorCloseAudio = loadAudio(doorCloseUrl);
const switchOnAudio = loadAudio(switchOnUrl);
const switchOffAudio = loadAudio(switchOffUrl);

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
export const playDoorOpen = makePlayer(doorOpenAudio);
export const playDoorClose = makePlayer(doorCloseAudio);
export const playSwitchOn = makePlayer(switchOnAudio);
export const playSwitchOff = makePlayer(switchOffAudio);

export async function registerPlayerJoinNLeaveSoundEffects(game: Game) {
  game.players.events.on("add", playJoin);
  game.players.events.on("remove", playLeave);
  game.physics.events.on("checkpoint", playCheckpoint);
  game.physics.events.on("death", playDeath);
  game.physics.events.on("keyState", (_, state) => (state ? playDoorOpen() : playDoorClose()));
  game.physics.events.on("switchStateChanged", (_1, _2, on) =>
    on ? playSwitchOn() : playSwitchOff()
  );
}
