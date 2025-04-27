const { model, Schema } = require('mongoose');

const newsSchema = new Schema({
    writerId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'authors'
    },
    writerName: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    audio: {
        type: String,
        default: null
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    date: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'pending'
    },
    count: {
        type: Number,
        default: 0
    },
    ratings: [
        {
            star: { type: Number, min: 1, max: 5 }
        }
    ],
    averageRating: {
        type: Number,
        default: 0
    },

    comments: [
        {
            userId: { type: Schema.Types.ObjectId, ref: 'authModel' },
            name: String,
            text: String,
            date: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

newsSchema.index({
    title: 'text',
    category: 'text',
    description: 'text'
}, {
    title: 5,
    description: 4,
    category: 2
});

module.exports = model('poetry', newsSchema);
