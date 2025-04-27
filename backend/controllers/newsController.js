const { formidable } = require('formidable')
const cloudinary = require('cloudinary').v2
const newsModel = require('../models/newsModel')
const authModel = require('../models/authModel')
const userAuthModel = require('../models/userAuthModel')
const galleryModel = require('../models/galleryModel')
const { mongo: { ObjectId } } = require('mongoose')
const moment = require('moment')
const axios = require('axios');
const mongoose = require('mongoose')




class newsController {
    add_news = async (req, res) => {
        const { id, category, name } = req.userInfo;
        const form = formidable({});

        cloudinary.config({
            cloud_name: process.env.cloud_name,
            api_key: process.env.api_key,
            api_secret: process.env.api_secret,
            secure: true
        });

        try {
            const [fields, files] = await form.parse(req);

            // Upload image
            const { url: imageUrl } = await cloudinary.uploader.upload(files.image[0].filepath, {
                folder: 'news_images'
            });

            // Upload audio (if exists)
            let audioUrl = null;
            if (files.audio && files.audio.length > 0) {
                const audioResult = await cloudinary.uploader.upload(files.audio[0].filepath, {
                    folder: 'poetry_audio',
                    resource_type: 'video'  // important for audio files!
                });
                audioUrl = audioResult.url;
            }

            const { title, description } = fields;

            const news = await newsModel.create({
                writerId: id,
                title: title[0].trim(),
                slug: title[0].trim().split(' ').join('-'),
                category,
                description: description[0],
                date: moment().format('LL'),
                writerName: name,
                image: imageUrl,
                audio: audioUrl  // set audio here
            });

            return res.status(201).json({ message: 'Poetry added successfully', news });
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }



    update_news = async (req, res) => {
        const { news_id } = req.params;
        const form = formidable({});

        cloudinary.config({
            cloud_name: process.env.cloud_name,
            api_key: process.env.api_key,
            api_secret: process.env.api_secret,
            secure: true
        });

        // ✅ Check if news_id is valid
        if (!news_id || news_id.length !== 24) {
            return res.status(400).json({ message: "Invalid news ID" });
        }

        try {
            const [fields, files] = await form.parse(req);
            const { title, description } = fields;

            let imageUrl = fields.old_image ? fields.old_image[0] : null;
            let audioUrl = fields.old_audio ? fields.old_audio[0] : null;

            if (Object.keys(files).length > 0) {
                if (files.new_image) {
                    if (imageUrl) {
                        const splitImage = imageUrl.split('/');
                        const imageFile = splitImage[splitImage.length - 1].split('.')[0];
                        await cloudinary.uploader.destroy(imageFile);
                    }

                    const imageData = await cloudinary.uploader.upload(files.new_image[0].filepath, { folder: 'news_images' });
                    imageUrl = imageData.url;
                }

                if (files.new_audio) {
                    if (audioUrl) {
                        const splitAudio = audioUrl.split('/');
                        const audioFile = splitAudio[splitAudio.length - 1].split('.')[0];
                        await cloudinary.uploader.destroy(audioFile);
                    }

                    const audioData = await cloudinary.uploader.upload(files.new_audio[0].filepath, {
                        resource_type: 'video',
                        folder: 'poetry_audio'
                    });
                    audioUrl = audioData.url;
                }
            }

            // ✅ Perform the update safely
            const news = await newsModel.findByIdAndUpdate(news_id, {
                title: title[0].trim(),
                slug: title[0].trim().split(' ').join('-'),
                description: description[0],
                image: imageUrl,
                audio: audioUrl
            }, { new: true });

            if (!news) {
                return res.status(404).json({ message: "Poetry item not found" });
            }

            return res.status(200).json({ message: 'Poetry updated successfully', news });

        } catch (error) {
            console.error('Error updating news:', error);
            return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    };




    update_news_update = async (req, res) => {
        const { role } = req.userInfo; // Extract user role from req.userInfo
        const { news_id } = req.params; // Get news_id from the URL params
        const { status } = req.body; // Get status from the request body

        // Check if the user is an admin
        if (role === 'admin') {
            try {

                const news = await newsModel.findByIdAndUpdate(news_id, { status }, { new: true });


                if (!news) {
                    return res.status(404).json({ message: 'Poetry item not found' });
                }


                return res.status(200).json({ message: 'Poetry status updated successfully', news });

            } catch (error) {

                console.error(error);
                return res.status(500).json({ message: 'An error occurred while updating the poetry status' });
            }
        } else {

            return res.status(401).json({ message: 'You are not authorized to update the poetry status' });
        }
    };



    get_images = async (req, res) => {
        const { id } = req.userInfo

        try {
            const images = await galleryModel.find({ writerId: new ObjectId(id) }).sort({ createdAt: -1 })
            return res.status(201).json({ images })
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' })
        }
    }

    get_recent_news = async (req, res) => {
        try {
            const news = await newsModel.find({ status: 'active' }).sort({ createdAt: -1 }).skip(6).limit(6)
            return res.status(201).json({ news })
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' })
        }
    }

    get_category_news = async (req, res) => {

        const { category } = req.params

        try {
            const news = await newsModel.find({
                $and: [
                    {
                        category: {
                            $eq: category
                        }
                    },
                    {
                        status: {
                            $eq: 'active'
                        }
                    }
                ]
            })
            return res.status(201).json({ news })
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' })
        }
    }

    news_search = async (req, res) => {
        const { value } = req.query
        try {
            const news = await newsModel.find({
                status: 'active',
                $text: {
                    $search: value
                }
            })
            return res.status(201).json({ news })
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' })
        }
    }

    add_images = async (req, res) => {

        const form = formidable({})
        const { id } = req.userInfo

        cloudinary.config({
            cloud_name: process.env.cloud_name,
            api_key: process.env.api_key,
            api_secret: process.env.api_secret,
            secure: true
        })

        try {
            const [_, files] = await form.parse(req)
            let allImages = []
            const { images } = files

            for (let i = 0; i < images.length; i++) {
                const { url } = await cloudinary.uploader.upload(images[i].filepath, { folder: 'poetry_images' })
                allImages.push({ writerId: id, url })
            }

            const image = await galleryModel.insertMany(allImages)
            return res.status(201).json({ images: image, message: "images uplaoded successfully" })

        } catch (error) {
            console.log(error.message)
            return res.status(500).json({ message: 'Internal server error' })
        }
    }

    get_dashboard_news = async (req, res) => {
        const { id, role } = req.userInfo
        try {
            if (role === 'admin') {
                const news = await newsModel.find({}).sort({ createdAt: -1 })
                return res.status(200).json({ news })
            } else {
                const news = await newsModel.find({ writerId: new ObjectId(id) }).sort({ createdAt: -1 })
                return res.status(200).json({ news })
            }
        } catch (error) {
            console.log(error.message)
            return res.status(500).json({ message: 'Internal server error' })
        }
    }

    get_dashboard_single_news = async (req, res) => {
        const { news_id } = req.params
        try {
            const news = await newsModel.findById(news_id)
            return res.status(200).json({ news })
        } catch (error) {
            console.log(error.message)
            return res.status(500).json({ message: 'Internal server error' })
        }
    }


    // website

    get_all_news = async (req, res) => {
        try {
            const category_news = await newsModel.aggregate([
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $match: {
                        status: 'active'
                    }
                },
                {
                    $group: {
                        _id: "$category",
                        news: {
                            $push: {
                                _id: '$_id',
                                title: '$title',
                                slug: '$slug',
                                writerName: '$writerName',
                                image: '$image',
                                description: '$description',
                                date: '$date',
                                category: '$category'
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        category: '$_id',
                        news: {
                            $slice: ['$news', 5]
                        }
                    }
                }
            ])

            const news = {}
            for (let i = 0; i < category_news.length; i++) {
                news[category_news[i].category] = category_news[i].news
            }
            return res.status(200).json({ news })
        } catch (error) {
            console.log(error.message)
            return res.status(500).json({ message: 'Internal server error' })
        }
    }

    get_news = async (req, res) => {

        const { slug } = req.params


        try {

            const news = await newsModel.findOneAndUpdate({ slug }, {
                $inc: { count: 1 }
            }, { new: true })

            const relateNews = await newsModel.find({
                $and: [
                    {
                        slug: {
                            $ne: slug
                        }
                    }, {
                        category: {
                            $eq: news.category
                        }
                    }
                ]
            }).limit(4).sort({ createdAt: -1 })

            return res.status(200).json({ news: news ? news : {}, relateNews })
        } catch (error) {
            console.log(error.message)
            return res.status(500).json({ message: 'Internal server error' })
        }
    }

    get_categories = async (req, res) => {
        try {
            const categories = await newsModel.aggregate([
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        category: "$_id",
                        count: 1
                    }
                }
            ])
            return res.status(200).json({ categories })
        } catch (error) {
            console.log(error.message)
            return res.status(500).json({ message: 'Internal server error' })
        }
    }

    get_popular_news = async (req, res) => {
        console.log('asdsa')
        try {
            const popularNews = await newsModel.find({ status: 'active' }).sort({ count: -1 }).limit(4)
            return res.status(200).json({ popularNews })
        } catch (error) {
            console.log(error.message)
            return res.status(500).json({ message: 'Internal server error' })
        }
    }

    get_latest_news = async (req, res) => {
        try {
            const news = await newsModel.find({ status: 'active' }).sort({ createdAt: -1 }).limit(6)

            return res.status(200).json({ news })
        } catch (error) {
            console.log(error.message)
            return res.status(500).json({ message: 'Internal server error' })
        }
    }
    get_images = async (req, res) => {
        console.log('okkasd')
        try {
            const images = await newsModel.aggregate([
                {
                    $match: {
                        status: 'active'
                    }
                },
                {
                    $sample: {
                        size: 9
                    }
                },
                {
                    $project: {
                        image: 1
                    }
                }
            ])
            console.log(images)
            return res.status(200).json({ images })
        } catch (error) {
            console.log(error.message)
            return res.status(500).json({ message: 'Internal server error' })
        }
    }


    add_rating = async (req, res) => {
        try {
            const { news_id } = req.params;
            const { star } = req.body;

            if (!star || star < 1 || star > 5) {
                return res.status(400).json({ message: 'Rating must be between 1 and 5' });
            }

            if (!mongoose.Types.ObjectId.isValid(news_id)) {
                return res.status(400).json({ message: 'Invalid news ID format' });
            }

            const validNewsId = new mongoose.Types.ObjectId(news_id);
            const news = await newsModel.findById(validNewsId);

            if (!news) {
                return res.status(404).json({ message: 'News item not found' });
            }


            news.ratings.push({ star });


            const totalStars = news.ratings.reduce((sum, r) => sum + r.star, 0);
            const avg = totalStars / news.ratings.length;
            news.averageRating = parseFloat(avg.toFixed(1));

            await news.save();

            return res.status(200).json({
                message: 'Rating added successfully',
                averageRating: news.averageRating,
                news
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    };



    add_comment = async (req, res) => {
        const { news_id } = req.params;
        const { comment } = req.body;
        const userId = req.userId;

        console.log("Received comment:", comment);
        console.log("UserId from token:", userId);

        try {
            if (!mongoose.Types.ObjectId.isValid(news_id)) {
                return res.status(400).json({ message: 'Invalid news ID format' });
            }

            const news = await newsModel.findById(news_id);
            if (!news) {
                return res.status(404).json({ message: 'News not found' });
            }

            const user = await userAuthModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const newComment = {
                name: user.fullName,
                text: comment,
                createdAt: new Date()
            };

            news.comments.push(newComment);
            await news.save();

            return res.status(200).json({ message: 'Comment added', comments: news.comments });
        } catch (error) {
            console.error('Error during comment addition:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };



    delete_news = async (req, res) => {
        const { news_id } = req.params;


        if (!news_id || news_id.length !== 24) {
            return res.status(400).json({ message: "Invalid news ID" });
        }

        try {

            const news = await newsModel.findByIdAndDelete(news_id);


            if (!news) {
                return res.status(404).json({ message: "Poetry item not found" });
            }


            if (news.image) {
                const splitImage = news.image.split('/');
                const imageFile = splitImage[splitImage.length - 1].split('.')[0];
                await cloudinary.uploader.destroy(imageFile);
            }


            if (news.audio) {
                const splitAudio = news.audio.split('/');
                const audioFile = splitAudio[splitAudio.length - 1].split('.')[0];
                await cloudinary.uploader.destroy(audioFile);
            }

            return res.status(200).json({ message: "Poetry deleted successfully" });
        } catch (error) {
            console.error(error.message);
            return res.status(500).json({ message: "Internal server error" });
        }
    };






}
module.exports = new newsController()