import { upsertStramUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const getJwtSecret = () => process.env.jwt_key || process.env.JWT_SECRET || "default_jwt_secret";

export async function Signup(req, res) {
    const { email, password, fullName } = req.body;

    try {
        if (!email || !password || !fullName) return res.status(400).json({ message: "All fields required" });

        if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });

        const randomAvatar = `https://api.dicebear.com/10.x/lorelei/svg?seed=${encodeURIComponent(fullName)}`;

        const newUser = await User.create({
            email, fullName, password, profilePic: randomAvatar,
        });

        try {
            await upsertStramUser({ id: newUser._id.toString(), name: newUser.fullName, image: newUser.profilePic || "" });
            console.log("Stream User Created: " + newUser._id + " for name: " + newUser.fullName);
        } catch (error) {
            console.log(`Some error creating stream user: ${error}`);
        }

        const token = jwt.sign({ userId: newUser._id }, getJwtSecret(), { expiresIn: '7d' });

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? "none" : "strict",
            secure: process.env.NODE_ENV === 'production'
        });
        res.status(201).json({ success: true, user: newUser });

    } catch (error) {
        console.log(`Error in signup: ${error}`);
        res.status(500).json({ message: "Error creating account" });
    }
}

export async function Login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "Invalid email or password" });

        const isPasswordCorrect = await user.matchPassword(password);

        if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid email or password" });

        const token = jwt.sign({ userId: user._id }, getJwtSecret(), { expiresIn: "7d" });

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? "none" : "strict",
            secure: process.env.NODE_ENV === 'production'
        });

        return res.status(200).json({ success: true, user });

    } catch (error) {
        console.log(`Error in login: ${error.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
}

export function Logout(req, res) {
    res.clearCookie("jwt");
    res.status(200).json({ message: "You are logged out", success: true });
}

export async function Onboard(req, res) {
    try {
        const userId = req.user._id;
        const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;

        if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
            return res.status(400).json({
                message: "All fields are required",
                missingFields: [
                    !fullName && "fullName",
                    !bio && "bio",
                    !nativeLanguage && "nativeLanguage",
                    !learningLanguage && "learningLanguage",
                    !location && "location",
                ].filter(Boolean)
            });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { ...req.body, isOnboarded: true }, { new: true });

        if (!updatedUser) return res.status(400).json({ message: "Failed to update user profile" });

        try {
            await upsertStramUser({ id: updatedUser._id.toString(), name: updatedUser.fullName, image: updatedUser.profilePic || "" });
            console.log(`Stream user updated: ${updatedUser.fullName}`);
        } catch (error) {
            console.log(`Stream error updating: ${error.message}`);
        }

        res.status(200).json({ success: true, user: updatedUser });

    } catch (error) {
        console.log(`Error Onboarding: ${error}`);
        res.status(500).json({ message: "Internal Server Error" });
    }
}