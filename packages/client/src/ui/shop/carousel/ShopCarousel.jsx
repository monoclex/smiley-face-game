//@ts-check
import React from "react";

import ShopItem from "../ShopItem";
import Carousel from "../../components/Carousel";

export default function ShopCarousel({ items }) {
  if (!Array.isArray(items)) {
    return items;
  }

  return (
    <Carousel visibleItems={3}>
      {items.map((item) => (
        <ShopItem {...item} key={item.id} />
      ))}
    </Carousel>
  );
}
