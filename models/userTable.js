const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    profile_summary: {
      type: String,
    },
    phone_number: {
      type: String,
    },
    location: {
      type: String,
    },
    cover_letter: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
