var mongoose          = require("mongoose"),
  extend              = require('mongoose-schema-extend'),
  config              = require("../config/personal_config"),
  crypto              = require('crypto'),
  abstractUsersSchema = require('./AbstractSchemas/AbstractUsersSchema'),
  connection          = mongoose.createConnection(config.dbConfig.name),
  npcsSchema          = abstractUsersSchema.extend({
    userData: {
      npcId: {type: String, default: 1, ref: 'game_infoNpcs'},
      shotId: {type: String, ref: 'game_shots'}
    }
  });

mongoose.model('game_npcs', npcsSchema);
