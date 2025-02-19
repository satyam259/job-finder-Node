const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const JobSchema = new Schema({
  employer_id: {
    type: Schema.Types.ObjectId,
    ref: "Employer",
    required: true
  },
  job_title: {
    type: String,
  },
  job_description: {
    type: String,
  },
  location: {
    type: String,
  },
  job_type: {
    type: String,
    enum: ["Full-Time", "Part-Time", "Freelance"],
    default: "Full-Time",
  },
  salary_range: {
    type: String,
  },
  posted_at: {
    type: Date,
    default: Date.now,
  },
  expires_at: {
    type: Date,
    required: true,
    index: { expires: 0 } 
  },
  vacancies: {
    type: Number,
  },
  experience: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

const Jobs = mongoose.model("Jobs", JobSchema);

module.exports = Jobs;
