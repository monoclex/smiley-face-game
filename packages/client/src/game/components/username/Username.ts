import Component from "@/game/components/Component";
import UsernameDisplay from "./UsernameDisplay";

export default class Username implements Component {
  readonly display: UsernameDisplay;
  readonly username: string;

  constructor(scene: Phaser.Scene, username: string) {
    this.display = new UsernameDisplay(scene, username);
    this.username = username;
  }
}
