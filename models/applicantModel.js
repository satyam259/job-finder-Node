const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ApplicantSchema = new Schema(
  {
    applicant_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status:{
        type:String,
        enum:["Applied", "Shortlisted", "Rejected", "Hired",],
        default: "Applied",
    },
    cover_letter:{
        type:String
    },
    Job_id: {
        type: Schema.Types.ObjectId,
        ref: "Jobs",
        required: true,
      },
  },
  { timestamps: true }
);

const Applicant = mongoose.model("Applicant", ApplicantSchema);

module.exports = Applicant;
