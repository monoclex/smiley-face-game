import CharacterController from "@/game/components/character/CharacterController";

export default interface PlayerController extends CharacterController {
  isHeld: boolean;
}
