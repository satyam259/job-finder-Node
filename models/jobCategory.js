const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const JobCategorySchema = new Schema({
    job_id: {
      type: Schema.Types.ObjectId,
      ref: "Jobs",
      required: true
    },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true
    }
  }, { timestamps: true });
  
  const JobCategory = mongoose.model("JobCategory", JobCategorySchema);
  
  export default JobCategory;