import Property from "../models/property.model.js";
import Review from "../models/review.model.js";
import User from "../models/user.model.js";

export const addReview = async (req, res) => {
    try {
       const { agentId } = req.params;
       const { rating, comment } = req.body;

       if (!rating || rating < 1 || rating > 5) {
         return res
           .status(400)
           .json({ message: "Rating must be between 1 and 5" });
       }

       const agent = await User.findById(agentId);
       if (!agent || agent.role !== "agent") {
         return res.status(404).json({ message: "Agent not found" });
       }

       // Check if user already reviewed this agent
       const existingReview = await Review.findOne({
         user: req.user._id,
         agent: agentId,
       });
       if (existingReview)
         return res.status(400).json({ message: "You have already reviewed this agent" });

       // Create new review
       const review = await Review.create({
         user: req.user._id,
         agent: agentId,
         rating,
         comment,
       });

       // Update agent's average rating
       const reviews = await Review.find({ agent: agentId });
       const avgRating =
         reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
       await User.findByIdAndUpdate(agentId, {
         averageRating: avgRating.toFixed(1),
       });

       res.status(201).json({ message: "Review added successfully", review });

    } catch (error) {
        console.log('error reviewing agent', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const getReviews = async (req, res) => {
    try {
         const { agentId } = req.params;
          const reviews = await Review.find({ agent: agentId }).populate(
            "user",
            "firstName lastName profilePics"
          );

          res.status(200).json(reviews);
    } catch (error) {
        console.log('error getting reviews', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const editReview = async (req, res) => {
    try {
         const { reviewId } = req.params;
         const { rating, comment } = req.body;

         
         let review = await Review.findById(reviewId);
         if (!review)
            return res.status(404).json({ message: "Review not found" });
        
        if (review.user.toString() !== req.user._id.toString()) {
            return res
            .status(403)
            .json({ message: "Not authorized to edit this review" });
        }
        
        if (!rating || rating < 1 || rating > 5) {
          return res
            .status(400)
            .json({ message: "Rating must be between 1 and 5" });
        }
        review.rating = rating || review.rating;
        review.comment = comment || review.comment;
         await review.save();

         res
           .status(200)
           .json({ message: "Review updated successfully", review });
    } catch (error) {
        console.log('error editing review', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const deleteReview = async (req, res) => {
    try {
         const { reviewId } = req.params;

         const review = await Review.findById(reviewId);
         if (!review)
           return res.status(404).json({ message: "Review not found" });

         if (review.user.toString() !== req.user._id.toString()) {
           return res
             .status(403)
             .json({ message: "Not authorized to delete this review" });
         }

         await review.deleteOne();
         res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        console.log('error deleting review', error)
        res.status(500).json({ message: 'Internal Server Error' });        
    }
}