import mongoose, {mongo, Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true
        },
        videos: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },{timestamps: true}
)

commentSchema.plugin(mongooseAggregatePaginate) // is plugin ka itna kaam hai bus kaha se kitna data dena hai

export const Comment = mongoose.model("Comment", commentSchema)