export class Config {
  static blockSize = 16;

  static physics = {
    ms_per_tick: 10,
    max_ticks_per_frame: 150,

    /**
     * This variable, according to Seb135 in the EEO discord, is because:
     *
     * > I think benjaminsen took some stock physics engine but wanted all of his physics units in pixels per tick
     * > So he scaled down all the physics until max running speed was appropriate for a 16px block
     */
    variable_multiplyer: 7.752,

    base_drag: Math.pow(0.9981, 10) * 1.00016093,
    ice_no_mod_drag: Math.pow(0.9993, 10) * 1.00016093,
    ice_drag: Math.pow(0.9998, 10) * 1.00016093,
    //Multiplyer when not applying force by userkeys
    no_modifier_drag: Math.pow(0.99, 10) * 1.00016093,
    water_drag: Math.pow(0.995, 10) * 1.00016093,
    mud_drag: Math.pow(0.975, 10) * 1.00016093,
    lava_drag: Math.pow(0.98, 10) * 1.00016093,
    toxic_drag: Math.pow(0.99, 10) * 1.00016093,
    jump_height: 26,

    autoalign_range: 2,
    autoalign_snap_range: 0.2,

    gravity: 2,
    boost: 16,
    water_buoyancy: -0.5,
    mud_buoyancy: 0.4,
    lava_buoyancy: 0.2,
    toxic_buoyancy: -0.4,

    queue_length: 2,
  };
}
