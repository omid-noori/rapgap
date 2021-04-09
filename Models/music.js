const mongoose = require('mongoose');
const {Schema} = mongoose;

const musicSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    singer: {
      type: String,
      required: true,
      trim: true,
    },
    album: {
      type: String,
      required: true,
      trim: true,
    },
    composer: {
      type: String,
      required: true,
      trim: true,
    },
    coverDesigner: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: String,
      required: true,
      trim: true,
    },
    music: {
      type: Object,
      required: true,
    },
    cover: {
      type: Object,
      required: true,
    },
    public: {
      type: Boolean,
      default: false,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    likes: [{type: Schema.Types.ObjectId, ref: 'User'}],
    comments: [
      {
        message: String,
        postedBy: {type: Schema.Types.ObjectId, ref: 'User'},
      },
    ],
    created: {
      type: Date,
      default: Date.now,
    },
  },
  {timestamps: true, collection: 'Musics'}
);

module.exports = mongoose.model('Music', musicSchema);
