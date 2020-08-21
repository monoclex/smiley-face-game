import urlSmiley from "@/assets/mmmyep.png";
import ComponentDisplay from "@/game/components/ComponentDisplay";
import CharacterType from "./CharacterType";

function key(characterType: CharacterType): string {
  return "character-" + characterType;
}

export default class CharacterDisplay implements ComponentDisplay {
  readonly sprite: Phaser.Physics.Matter.Sprite;

  static load(loader: Phaser.Loader.LoaderPlugin) {
    loader.image(key("smiley"), urlSmiley);
  }

  constructor(scene: Phaser.Scene, characterType: CharacterType) {
    this.sprite = scene.matter.add.sprite(0, 0, key(characterType));
  }
  
  get depth() {
    return this.sprite.depth;
  }

  set depth(value) {
    this.sprite.depth = value;
  }
}
