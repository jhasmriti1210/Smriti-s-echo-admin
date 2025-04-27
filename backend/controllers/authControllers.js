const authModel = require("../models/authModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")



class authController {
    login = async (req, res) => {
        const { email, password } = req.body

        if (!email) {
            return res.status(404).json({ message: "Please provide your email" })
        }
        if (!password) {
            return res.status(404).json({ message: "Please provide your password" })
        }

        try {
            const user = await authModel.findOne({ email }).select("+password")
            if (user) {
                const match = await bcrypt.compare(password, user.password)
                if (match) {
                    const obj = {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        category: user.category,
                        role: user.role,

                    }
                    const token = await jwt.sign(obj, process.env.secret, {
                        expiresIn: process.env.exp_time
                    })
                    return res.status(200).json({ message: "login success", token })


                } else {
                    return res.status(404).json({ message: "Invalid Password" })
                }
            } else {
                return res.status(404).json({ message: "User not found" })
            }

        } catch (error) {
            console.log(error)

        }
    }




    change_password = async (req, res) => {
        const { old_password, new_password } = req.body;
        const userId = req.userInfo.id;  // ✅ Corrected this line

        if (!old_password) {
            return res.status(400).json({ message: "Please provide your old password" });
        }
        if (!new_password) {
            return res.status(400).json({ message: "Please provide your new password" });
        }

        try {
            const user = await authModel.findById(userId).select("+password");


            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const match = await bcrypt.compare(old_password, user.password);
            if (!match) {
                return res.status(401).json({ message: "Old password is incorrect" });
            }

            const hashedPassword = await bcrypt.hash(new_password, 10);
            user.password = hashedPassword;
            await user.save();

            return res.status(200).json({ message: "Password changed successfully" });

        } catch (error) {
            console.error("Password change error:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }




    add_writer = async (req, res) => {

        const { email, name, password, category } = req.body

        if (!name) {
            return res.status(404).json({ message: 'please provide name' })
        }
        if (!password) {
            return res.status(404).json({ message: 'please provide password' })
        }
        if (!category) {
            return res.status(404).json({ message: 'please provide category' })
        }
        if (!email) {
            return res.status(404).json({ message: 'please provide email' })
        }
        if (email && !email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
            return res.status(404).json({ message: 'please provide valid email' })
        }
        try {
            const writer = await authModel.findOne({ email: email.trim() })
            if (writer) {
                return res.status(404).json({ message: 'Writer already exist' })
            } else {
                const new_writer = await authModel.create({
                    name: name.trim(),
                    email: email.trim(),
                    password: await bcrypt.hash(password.trim(), 10),
                    category: category.trim(),
                    role: 'writer'
                })
                return res.status(201).json({ message: 'Writer added successfully', writer: new_writer })
            }
        } catch (error) {
            return res.status(500).json({ message: 'internal server error' })
        }
    }

    get_writers = async (req, res) => {
        try {
            const writers = await authModel.find({ role: "writer" }).sort({ createdAt: -1 })
            return res.status(200).json({ writers })
        } catch (error) {
            return res.status(500).json({ message: 'internal server error' })
        }
    }



}






module.exports = new authController()