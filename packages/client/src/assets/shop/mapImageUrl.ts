import preview200x200 from "./preview_200x200.png";
import preview30x30 from "./preview_30x30.png";

// TODO: have the server send the image url rather than the client load it
export function mapImageUrl(shopItemId: number): string {
  switch (shopItemId) {
    case 0:
      return preview200x200;
    case 1:
      return preview30x30;
    default:
      throw new Error(`Unknown shop item ${shopItemId}`);
  }
}
