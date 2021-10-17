import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import Account from "./Account";

@Entity()
@Unique("user_to_item", ["user", "shopItemId"]) // https://github.com/typeorm/typeorm/issues/1616#issuecomment-657022282
export default class ShopItem {
  /**
   * A random ID for every shop item
   */
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * The user purchasing the shop item
   */
  @ManyToOne(() => Account)
  user!: Account;

  /**
   * The ID of the item within the shop
   */
  @Column({ nullable: false })
  shopItemId!: number;

  /**
   * The amount of energy that has been spent on that item
   */
  @Column({ nullable: false })
  spentEnergy!: number;

  /**
   * The quantity of this item that has been purchased
   */
  @Column({ nullable: false })
  purchased!: number;
}
