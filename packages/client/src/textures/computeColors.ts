import type { TileRegistration } from "@smiley-face-game/api/tiles/TileRegistration";
import type ClientBlockBar from "@/bridge/ClientBlockBar";
import { TileLayer } from "@smiley-face-game/api";

export async function computeColors(
  tiles: TileRegistration,
  resolver: ClientBlockBar
): Promise<void> {
  const blocks: string[] = [];

  for (const block of tiles.idToBlock.values()) {
    if (block.preferredLayer === TileLayer.Action) continue;
    if (block.preferredLayer === TileLayer.Decoration) continue;

    const texture = await resolver.load(block.id);
    if (!texture) throw new Error(`Couldn't not find texture ${block.textureId}`);

    const filename = `${block.textureId}.png`;
    blocks.push(filename);

    // set timeout to space out the downloads
    setTimeout(() => {
      const downloadElement = document.createElement("a");
      downloadElement.setAttribute("href", texture.src);
      downloadElement.setAttribute("download", filename);
      downloadElement.click();
    }, blocks.length * 100);
  }

  console.log("downloaded these blocks:", "{" + blocks.join(",") + "}");
}
