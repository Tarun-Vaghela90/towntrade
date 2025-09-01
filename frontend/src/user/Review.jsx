// components/Review.jsx
import React, { useState, useEffect } from "react";
import { Rating } from "@smastrom/react-rating";
import { toast } from "react-toastify";
import "@smastrom/react-rating/style.css";
import api from "../Axios/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Review = ({ productId, user, className = "w-full md:w-[600px]" }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const { data } = await api.get(`/reviews/${productId}`);
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  // Submit review
  const submitReview = async (e) => {
    e.preventDefault();
    if (!rating || !comment)
      return toast.error("Please add rating and comment");

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`, // JWT token
        },
      };
      await api.post("/reviews", { productId, rating, comment }, config);
      toast.success("Review submitted!");
      setRating(0);
      setComment("");
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error submitting review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`shadow-sm ${className || "w-full md:w-[900px]"}`}>

      {/* ✅ Match Product Info Card Style */}
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-2xl font-bold">Reviews</CardTitle>
          <CardDescription className="text-gray-600">
            What customers say about this product
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {/* Review Form */}
        {user && (
          <form onSubmit={submitReview} className="mb-6">
            <div className="mb-2 flex items-center gap-2">
              <span className="font-medium">Your Rating:</span>
              <Rating
                style={{ maxWidth: 120 }}
                value={rating}
                onChange={setRating}
              />
            </div>
            <textarea
              className="w-full p-2 border rounded mb-2"
              rows="3"
              placeholder="Write your review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        )}

        {/* Reviews List */}
        {loadingReviews ? (
          <p className="text-gray-500">Loading reviews...</p>
        ) : Array.isArray(reviews) && reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r._id} className="border-b pb-2">
                <div className="flex items-center justify-between">
                  <strong>{r.user?.fullName || "Anonymous"}</strong>
                  <Rating style={{ maxWidth: 100 }} value={r.rating} readOnly />
                </div>
                <p>{r.comment}</p>
                <small className="text-gray-500">
                  {new Date(r.createdAt).toLocaleDateString()}
                </small>
              </div>
            ))}
          </div>
        ) : (
          <p>No reviews yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default Review;
