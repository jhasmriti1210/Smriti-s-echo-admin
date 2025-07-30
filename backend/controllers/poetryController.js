const { formidable } = require('formidable')
const cloudinary = require('cloudinary').v2
const poetryModel = require('../models/poetryModel')
const userAuthModel = require('../models/userAuthModel')
const galleryModel = require('../models/galleryModel')
const { mongo: { ObjectId } } = require('mongoose')
const moment = require('moment')
const axios = require('axios');
const mongoose = require('mongoose')
const { sendNewContentToSubscribers } = require('../utils/subscribercontentmailer');





class poetryController {
    add_poetry = async (req, res) => {
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
            const { secure_url: imageUrl } = await cloudinary.uploader.upload(files.image[0].filepath, {
                folder: 'poetry_images',
                secure: true
            });

            // Upload audio (if exists)
            let audioUrl = null;
            if (files.audio && files.audio.length > 0) {
                const audioResult = await cloudinary.uploader.upload(files.audio[0].filepath, {
                    folder: 'poetry_audio',
                    resource_type: 'video',  // important for audio files!
                    secure: true
                });
                audioUrl = audioResult.secure_url;
            }

            const { title, description } = fields;

            // Determine if it's a manual submission (no writerId, username provided)
            const isManual = fields.username && fields.category;

            let writerId = null;
            let writerName = "Anonymous";
            let poetryCategory = "General";

            if (isManual) {
                writerName = fields.username[0] || "Anonymous";
                poetryCategory = fields.category[0] || "General";
            } else if (req.userInfo) {
                writerId = req.userInfo.id;
                writerName = req.userInfo.name;
                poetryCategory = req.userInfo.category || "General";
            }

            const poetry = await poetryModel.create({
                writerId,  // null if manual
                title: title[0].trim(),
                slug: title[0].trim().split(' ').join('-'),
                category: poetryCategory,
                description: description[0],
                date: moment().format('LL'),
                writerName,
                image: imageUrl,
                audio: audioUrl,
                status: 'pending'  // Set initial status to pending
            });

            return res.status(201).json({ message: 'Poetry added successfully', poetry });
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };





    update_poetry = async (req, res) => {
        const { poetry_id } = req.params;
        const form = formidable({});

        cloudinary.config({
            cloud_name: process.env.cloud_name,
            api_key: process.env.api_key,
            api_secret: process.env.api_secret,
            secure: true
        });

        // ✅ Check if poetry_id is valid
        if (!poetry_id || poetry_id.length !== 24) {
            return res.status(400).json({ message: "Invalid poetry ID" });
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

                    const imageData = await cloudinary.uploader.upload(files.new_image[0].filepath, {
                        folder: 'poetry_images',
                        secure: true
                    });
                    imageUrl = imageData.secure_url;
                }

                if (files.new_audio) {
                    if (audioUrl) {
                        const splitAudio = audioUrl.split('/');
                        const audioFile = splitAudio[splitAudio.length - 1].split('.')[0];
                        await cloudinary.uploader.destroy(audioFile);
                    }

                    const audioData = await cloudinary.uploader.upload(files.new_audio[0].filepath, {
                        resource_type: 'video',
                        folder: 'poetry_audio',
                        secure: true
                    });
                    audioUrl = audioData.secure_url;
                }
            }

            // ✅ Perform the update safely
            const poetry = await poetryModel.findByIdAndUpdate(poetry_id, {
                title: title[0].trim(),
                slug: title[0].trim().split(' ').join('-'),
                description: description[0],
                image: imageUrl,
                audio: audioUrl
            }, { new: true });

            if (!poetry) {
                return res.status(404).json({ message: "Poetry item not found" });
            }

            return res.status(200).json({ message: 'Poetry updated successfully', poetry });

        } catch (error) {
            console.error('Error updating poetry:', error);
            return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    };




    update_poetry_update = async (req, res) => {
        const { role } = req.userInfo;
        const { poetry_id } = req.params;
        const { status } = req.body;

        if (role === 'admin') {
            try {
                const poetry = await poetryModel.findByIdAndUpdate(poetry_id, { status }, { new: true });

                if (!poetry) {
                    return res.status(404).json({ message: 'Poetry item not found' });
                }

                // Send email notifications to subscribers only when status is changed to 'active'
                if (status === 'active') {
                    try {
                        await sendNewContentToSubscribers({
                            title: poetry.title,
                            description: poetry.description,
                            image: poetry.image,
                            slug: poetry.slug
                        });
                        console.log('Subscriber notifications sent successfully for newly activated poetry');
                    } catch (emailError) {
                        console.error('Error sending subscriber notifications:', emailError);
                        // Don't return error here, as the status update was still successful
                    }
                }

                return res.status(200).json({ message: 'Poetry status updated successfully', poetry });

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

    get_recent_poetry = async (req, res) => {
        try {
            const poetry = await poetryModel.find({ status: 'active' }).sort({ createdAt: -1 }).skip(6).limit(6)
            return res.status(201).json({ poetry })
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' })
        }
    }

    get_category_poetry = async (req, res) => {

        const { category } = req.params

        try {
            const poetry = await poetryModel.find({
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
            return res.status(201).json({ poetry })
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' })
        }
    }

    poetry_search = async (req, res) => {
        const { value } = req.query
        try {
            const poetry = await poetryModel.find({
                status: 'active',
                $text: {
                    $search: value
                }
            })
            return res.status(201).json({ poetry })
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
                const { secure_url } = await cloudinary.uploader.upload(images[i].filepath, {
                    folder: 'poetry_images',
                    secure: true
                })
                allImages.push({ writerId: id, url: secure_url })
            }

            const image = await galleryModel.insertMany(allImages)
            return res.status(201).json({ images: image, message: "images uplaoded successfully" })

        } catch (error) {
            console.log(error.message)
            return res.status(500).json({ message: 'Internal server error' })
        }
    }

    get_dashboard_poetry = async (req, res) => {
        const { id, role } = req.userInfo
        try {
            if (role === 'admin') {
                const poetry = await poetryModel.find({}).sort({ createdAt: -1 })
                return res.status(200).json({ poetry })
            } else {
                const poetry = await poetryModel.find({ writerId: new ObjectId(id) }).sort({ createdAt: -1 })
                return res.status(200).json({ poetry })
            }
        } catch (error) {
            console.log(error.message)
            return res.status(500).json({ message: 'Internal server error' })
        }
    }

    get_dashboard_single_poetry = async (req, res) => {
        const { poetry_id } = req.params
        try {
            const poetry = await poetryModel.findById(poetry_id)
            return res.status(200).json({ poetry })
        } catch (error) {
            console.log(error.message)
            return res.status(500).json({ message: 'Internal server error' })
        }
    }


    // website

    get_all_poetry = async (req, res) => {
        try {
            const category_poetry = await poetryModel.aggregate([
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
                        poetry: {
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
                        poetry: {
                            $slice: ['$poetry', 5]
                        }
                    }
                }
            ])

            const poetry = {}
            for (let i = 0; i < category_poetry.length; i++) {
                poetry[category_poetry[i].category] = category_poetry[i].poetry
            }
            return res.status(200).json({ poetry })
        } catch (error) {
            console.log(error.message)
            return res.status(500).json({ message: 'Internal server error' })
        }
    }

    get_poetry = async (req, res) => {

        const { slug } = req.params


        try {

            const poetry = await poetryModel.findOneAndUpdate({ slug }, {
                $inc: { count: 1 }
            }, { new: true })

            const relatePoetry = await poetryModel.find({
                $and: [
                    {
                        slug: {
                            $ne: slug
                        }
                    }, {
                        category: {
                            $eq: poetry.category
                        }
                    }
                ]
            }).limit(4).sort({ createdAt: -1 })

            return res.status(200).json({ poetry: poetry ? poetry : {}, relatePoetry })
        } catch (error) {
            console.log(error.message)
            return res.status(500).json({ message: 'Internal server error' })
        }
    }

    get_categories = async (req, res) => {
        try {
            const categories = await poetryModel.aggregate([
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

    get_popular_poetry = async (req, res) => {
        console.log('asdsa')
        try {
            const popularPoetry = await poetryModel.find({ status: 'active' }).sort({ count: -1 }).limit(4)
            return res.status(200).json({ popularPoetry })
        } catch (error) {
            console.log(error.message)
            return res.status(500).json({ message: 'Internal server error' })
        }
    }

    get_latest_poetry = async (req, res) => {
        try {
            const poetry = await poetryModel.find({ status: 'active' }).sort({ createdAt: -1 }).limit(6)

            return res.status(200).json({ poetry })
        } catch (error) {
            console.log(error.message)
            return res.status(500).json({ message: 'Internal server error' })
        }
    }

    get_featured_poetry = async (req, res) => {
        try {
            const featured_poetry = await poetryModel.aggregate([
                {
                    $match: {
                        status: 'active', // Ensure the poetry is active
                        isFeatured: true  // Select only the featured poems
                    }
                },
                {
                    $sort: { createdAt: -1 } // Optional: Sort by most recent
                },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        slug: 1,
                        writerName: 1,
                        image: 1,
                        description: 1,
                        date: 1,
                        category: 1,
                        isFeatured: 1
                    }
                }
            ]);

            return res.status(200).json({ featuredPoetry: featured_poetry });
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    get_images = async (req, res) => {
        console.log('okkasd')
        try {
            const images = await poetryModel.aggregate([
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
            const { poetry_id } = req.params;
            const { star } = req.body;

            if (!star || star < 1 || star > 5) {
                return res.status(400).json({ message: 'Rating must be between 1 and 5' });
            }

            if (!mongoose.Types.ObjectId.isValid(poetry_id)) {
                return res.status(400).json({ message: 'Invalid poetry ID format' });
            }

            const validPoetryId = new mongoose.Types.ObjectId(poetry_id);
            const poetry = await poetryModel.findById(validPoetryId);

            if (!poetry) {
                return res.status(404).json({ message: 'Poetry item not found' });
            }


            poetry.ratings.push({ star });


            const totalStars = poetry.ratings.reduce((sum, r) => sum + r.star, 0);
            const avg = totalStars / poetry.ratings.length;
            poetry.averageRating = parseFloat(avg.toFixed(1));

            await poetry.save();

            return res.status(200).json({
                message: 'Rating added successfully',
                averageRating: poetry.averageRating,
                poetry
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    };



    add_comment = async (req, res) => {
        const { poetry_id } = req.params;
        const { comment } = req.body;
        const userId = req.userId;

        console.log("Received comment:", comment);
        console.log("UserId from token:", userId);

        try {
            if (!mongoose.Types.ObjectId.isValid(poetry_id)) {
                return res.status(400).json({ message: 'Invalid poetry ID format' });
            }

            const poetry = await poetryModel.findById(poetry_id);
            if (!poetry) {
                return res.status(404).json({ message: 'poetry not found' });
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

            poetry.comments.push(newComment);
            await poetry.save();

            return res.status(200).json({ message: 'Comment added', comments: poetry.comments });
        } catch (error) {
            console.error('Error during comment addition:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    top_testimonials = async (req, res) => {
        try {
            // Fetch poetry items with at least one comment and a rating
            const topPoetries = await poetryModel.find({
                averageRating: { $gt: 0 },
                comments: { $exists: true, $not: { $size: 0 } }
            })
                .sort({ averageRating: -1 }) // Sort by highest rating
                .limit(5); // Limit to top 5

            // Format response
            const testimonials = topPoetries.map(poem => {
                const latestComment = poem.comments[poem.comments.length - 1];
                return {
                    _id: poem._id,
                    title: poem.title,
                    averageRating: poem.averageRating,
                    comment: latestComment ? {
                        name: latestComment.name,
                        text: latestComment.text,
                        createdAt: latestComment.createdAt
                    } : null
                };
            });

            return res.status(200).json({ testimonials });
        } catch (error) {
            console.error("Error fetching top testimonials:", error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };


    toggle_like_poetry = async (req, res) => {
        const { poetry_id } = req.params;
        const userId = req.userId; // From auth middleware

        try {
            if (!mongoose.Types.ObjectId.isValid(poetry_id)) {
                return res.status(400).json({ message: 'Invalid poetry ID format' });
            }

            const poetry = await poetryModel.findById(poetry_id);
            if (!poetry) {
                return res.status(404).json({ message: 'Poetry not found' });
            }

            // Check if user has already liked the poetry
            const existingLike = poetry.likes.find(like => like.userId.toString() === userId);

            if (existingLike) {
                // Unlike: Remove the like
                poetry.likes = poetry.likes.filter(like => like.userId.toString() !== userId);
                poetry.likesCount = poetry.likesCount - 1;
            } else {
                // Like: Add new like
                poetry.likes.push({ userId });
                poetry.likesCount = poetry.likesCount + 1;
            }

            await poetry.save();

            return res.status(200).json({
                message: existingLike ? 'Poetry unliked' : 'Poetry liked',
                likesCount: poetry.likesCount,
                isLiked: !existingLike
            });
        } catch (error) {
            console.error('Error toggling like:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    delete_poetry = async (req, res) => {
        const { poetry_id } = req.params;


        if (!poetry_id || poetry_id.length !== 24) {
            return res.status(400).json({ message: "Invalid poetry ID" });
        }

        try {

            const poetry = await poetryModel.findByIdAndDelete(poetry_id);


            if (!poetry) {
                return res.status(404).json({ message: "Poetry item not found" });
            }


            if (poetry.image) {
                const splitImage = poetry.image.split('/');
                const imageFile = splitImage[splitImage.length - 1].split('.')[0];
                await cloudinary.uploader.destroy(imageFile);
            }


            if (poetry.audio) {
                const splitAudio = poetry.audio.split('/');
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
module.exports = new poetryController()