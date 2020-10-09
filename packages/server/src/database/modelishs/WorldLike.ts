import World from "../../database/models/World";

type WorldLike = Omit<World, "owner">;

export default WorldLike;
