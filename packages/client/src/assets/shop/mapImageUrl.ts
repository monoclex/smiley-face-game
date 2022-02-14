import preview30x30 from "./preview_30x30.png";
import preview100x100 from "./preview_100x100.png";
import preview150x150 from "./preview_150x150.png";
import preview200x200 from "./preview_200x200.png";

// TODO: have the server send the image url rather than the client load it
export function mapImageUrl(shopItemId: number): string {
  switch (shopItemId) {
    case 0:
      return preview200x200;
    case 1:
      return preview30x30;
    case 2:
      return preview200x200;
    case 3:
      return preview100x100;
    case 4:
      return preview150x150;
    default:
      throw new Error(`Unknown shop item ${shopItemId}`);
  }
}
