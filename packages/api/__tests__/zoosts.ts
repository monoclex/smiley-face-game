import { Config } from "../physics/Config";
import { Vector } from "../physics/Vector";
import { Simulator } from "./helpers.test-helper";

// TODO(physics-testing): write unit tests for switches + zoosts
//   the reason i'm holding off on this is because manually writing a string for the world is painful
//   i think i'll wait until i have a singleplayer worlc export/import feature and then use that in tests
//
// list of things to test for switches:
// - zoosts will activate switches really close to one another correctly
//   >oXoXoX where > = zoost, o = switch, X = gate/door
// - zoosts don't shove you into a switch block
//   >oX

it("worky :)", () => {
  expect("trust :)").toHaveLength(8);
});
