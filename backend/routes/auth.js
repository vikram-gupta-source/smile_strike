const express = require('express');
const router = express.Router();
const User = require('../models/User');

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: "User created!" });
  } catch (err) {
    res.status(400).json({ message: "User already exists or data invalid" });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
      res.json({ userId: user._id });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(404).json({ message: "User not found" });
  }
});

// --- 1. COMPLETE BRUSHING (Timer Screen) ---
router.post('/complete-brushing', async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const now = new Date();
    
    // Logic for Streak (Check if last brushed was yesterday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (user.lastBrushed && user.lastBrushed.toDateString() === yesterday.toDateString()) {
      user.streak += 1;
    } else if (!user.lastBrushed || user.lastBrushed.toDateString() !== now.toDateString()) {
      user.streak = 1; // Reset to 1 if they missed a day
    }

    user.points += 10;
    user.lastBrushed = now;

    // Add to history array for the Profile Screen
    const newEntry = {
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'Completed'
    };
    user.brushingHistory.unshift(newEntry); // Add to top

    // Keep history manageable (last 20 entries)
    if (user.brushingHistory.length > 20) user.brushingHistory.pop();

    await user.save();
    res.json({ streak: user.streak, points: user.points, history: user.brushingHistory });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// --- 2. PURCHASE ITEM (Shop Screen) ---
router.post('/purchase', async (req, res) => {
  const { userId, price, itemId } = req.body;
  try {
    const user = await User.findById(userId);
    if (user.points < price) return res.status(400).json({ message: "Not enough points" });

    user.points -= price;
    user.inventory.push(itemId); // Save the item they bought
    await user.save();

    res.json({ success: true, points: user.points });
  } catch (error) {
    res.status(500).json({ message: "Purchase failed" });
  }
});

router.post('/update-profile-pic', async (req, res) => {
  const { userId, image } = req.body;
  try {
    await User.findByIdAndUpdate(userId, { profilePic: image });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Upload failed" });
  }
});

router.post('/request-password-reset', async (req, res) => {
    const { userId, newPassword } = req.body;

    try {
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters." });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // In a real app, you would hash this using bcrypt
        user.password = newPassword; 
        await user.save();

        res.json({ success: true, message: "Password updated successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Server error during password reset" });
    }
});

router.post('/request-password-reset-by-username', async (req, res) => {
    const { username, newPassword } = req.body;

    try {
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters." });
        }

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Hash the new password
        user.password = newPassword;
        
        await user.save();
        res.json({ success: true, message: "Password updated successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Server error during password reset" });
    }
});

// --- 3. GET USER DATA (Profile & Shop & Stats) ---
router.get('/user-stats/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    res.json({
      username: user.username,
      points: user.points,
      streak: user.streak,
      history: user.brushingHistory,
      inventory: user.inventory
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching data" });
  }
});
module.exports = router;