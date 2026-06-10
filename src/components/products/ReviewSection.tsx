'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Pencil, Trash2, CheckCircle, MessageSquare,
  AlertCircle, LogIn, Send, X
} from 'lucide-react';
import Link from 'next/link';
import StarPicker from './StarPicker';
import StarRating from './StarRating';
import toast from 'react-hot-toast';

interface Review {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

interface ReviewData {
  reviews: Review[];
  totalReviews: number;
  approvedCount: number;
  averageRating: number;
  ratingCounts: { star: number; count: number }[];
}

interface ReviewSectionProps {
  productId: string;
  productName: string;
  onRatingUpdate: (newRating: number, count: number) => void;
}

export default function ReviewSection({
  productId,
  productName,
  onRatingUpdate,
}: ReviewSectionProps) {
  const { data: session, status } = useSession();
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const isUser = session && (session.user as any)?.role !== 'admin';
  const userId = session?.user?.id;

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        onRatingUpdate(json.data.averageRating, json.data.approvedCount);
      }
    } finally {
      setLoading(false);
    }
  }, [productId, onRatingUpdate]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  // Pre-fill if user already reviewed
  const myExistingReview = data?.reviews.find((r) => r.userId === userId);
  useEffect(() => {
    if (myExistingReview) {
      setMyRating(myExistingReview.rating);
      setMyComment(myExistingReview.comment);
    }
  }, [myExistingReview]);

  const openForm = () => {
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myRating) { toast.error('Please select a star rating'); return; }
    if (myComment.trim().length < 5) { toast.error('Review must be at least 5 characters'); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: myRating, comment: myComment.trim() }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message, { icon: '⭐', duration: 3000 });
        setShowForm(false);
        await fetchReviews();
      } else {
        toast.error(result.error || 'Failed to submit review');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        toast.success('Review deleted');
        setMyRating(0);
        setMyComment('');
        setDeleteConfirm(false);
        setShowForm(false);
        await fetchReviews();
      } else {
        toast.error(result.error);
      }
    } finally {
      setDeleting(false);
    }
  };

  const approvedReviews = data?.reviews.filter((r) => r.isApproved) || [];
  const maxCount = Math.max(...(data?.ratingCounts.map((r) => r.count) || [1]), 1);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
        <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
        <div className="h-28 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ════════════════════════════════════════
           1. RATING SUMMARY + WRITE REVIEW CTA
         ════════════════════════════════════════ */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">

        {/* Top section — summary + CTA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-800">

          {/* Average Score */}
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <span className="text-6xl font-black text-gray-900 dark:text-white leading-none">
              {(data?.averageRating || 0).toFixed(1)}
            </span>
            <div className="mt-2">
              <StarRating rating={data?.averageRating || 0} size="md" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {data?.approvedCount || 0} {data?.approvedCount === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Star Bars */}
          <div className="col-span-1 flex flex-col justify-center gap-2 p-6">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = data?.ratingCounts.find((r) => r.star === star)?.count || 0;
              const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 w-3">{star}</span>
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: (5 - star) * 0.08, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        star >= 4 ? 'bg-green-500' : star === 3 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                    />
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 w-4 text-right">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Write Review CTA */}
          <div className="flex flex-col items-center justify-center p-6 gap-4">
            {status === 'loading' ? (
              <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
            ) : !session ? (
              /* Not logged in */
              <div className="text-center space-y-3">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Share your experience
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Login to write a review
                </p>
                <Link
                  href={`/login?callbackUrl=/products/${productId}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-orange-200 dark:shadow-orange-900/30"
                >
                  <LogIn className="h-4 w-4" />
                  Login to Review
                </Link>
              </div>
            ) : !isUser ? (
              /* Admin */
              <div className="text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                  Admins cannot write reviews
                </p>
              </div>
            ) : myExistingReview && !showForm ? (
              /* Already reviewed */
              <div className="text-center space-y-3 w-full">
                <div className="flex items-center justify-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-semibold">
                  <CheckCircle className="h-4 w-4" />
                  You reviewed this
                </div>
                <StarRating rating={myExistingReview.rating} size="md" showValue />
                <div className="flex gap-2 w-full">
                  <button
                    onClick={openForm}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold border border-red-300 dark:border-red-700 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            ) : !showForm ? (
              /* Prompt to write review */
              <div className="text-center space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    Rate this product
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Help others make better decisions
                  </p>
                </div>
                {/* Inline quick-rate stars */}
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => { setMyRating(s); openForm(); }}
                      className="group p-1"
                    >
                      <Star className="h-7 w-7 text-gray-300 dark:text-gray-600 group-hover:text-yellow-400 group-hover:fill-yellow-400 transition-all duration-150" />
                    </button>
                  ))}
                </div>
                <button
                  onClick={openForm}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-orange-200 dark:shadow-orange-900/30 active:scale-95"
                >
                  <Star className="h-4 w-4" />
                  Write a Review
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
           2. REVIEW FORM (expanded inline)
         ════════════════════════════════════════ */}
      <AnimatePresence>
        {showForm && isUser && (
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-orange-400 dark:border-orange-600 shadow-xl shadow-orange-100 dark:shadow-orange-900/20 overflow-hidden"
          >
            {/* Form header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-b border-orange-100 dark:border-orange-900">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {session?.user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {myExistingReview ? 'Edit Your Review' : 'Write a Review'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {session?.user?.name} · {productName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  if (myExistingReview) {
                    setMyRating(myExistingReview.rating);
                    setMyComment(myExistingReview.comment);
                  } else {
                    setMyRating(0);
                    setMyComment('');
                  }
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Star Picker */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200">
                  Your Rating <span className="text-red-500">*</span>
                </label>
                <StarPicker value={myRating} onChange={setMyRating} size="lg" />
                {myRating === 0 && (
                  <p className="text-xs text-orange-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Click a star to set your rating
                  </p>
                )}
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200">
                  Your Review <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={myComment}
                  onChange={(e) => setMyComment(e.target.value)}
                  placeholder={`Share what you liked or disliked about ${productName}...`}
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-all"
                />
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className={myComment.trim().length < 5 && myComment.length > 0 ? 'text-red-400' : ''}>
                    {myComment.trim().length < 5 ? `${5 - myComment.trim().length} more characters needed` : 'Looks good!'}
                  </span>
                  <span className={myComment.length > 450 ? 'text-red-400 font-medium' : ''}>
                    {myComment.length}/500
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    if (myExistingReview) {
                      setMyRating(myExistingReview.rating);
                      setMyComment(myExistingReview.comment);
                    }
                  }}
                  className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || myRating === 0 || myComment.trim().length < 5}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-orange-200 dark:shadow-orange-900/30"
                >
                  {submitting ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {myExistingReview ? 'Update Review' : 'Submit Review'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════
           3. REVIEWS LIST
         ════════════════════════════════════════ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            {approvedReviews.length > 0
              ? `${approvedReviews.length} Customer Review${approvedReviews.length > 1 ? 's' : ''}`
              : 'Customer Reviews'}
          </h3>
        </div>

        {approvedReviews.length === 0 ? (
          <div className="text-center py-14 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-orange-400" />
            </div>
            <h4 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-1">
              No reviews yet
            </h4>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-5">
              Be the first to share your experience!
            </p>
            {isUser && !showForm && (
              <button
                onClick={openForm}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-orange-200 dark:shadow-orange-900/30"
              >
                <Star className="h-4 w-4" />
                Write First Review
              </button>
            )}
          </div>
        ) : (
          approvedReviews.map((review, i) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.3 }}
              className={`p-5 rounded-2xl border transition-all ${
                review.userId === userId
                  ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800'
                  : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* User info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    review.userId === userId
                      ? 'bg-orange-500 text-white'
                      : 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-600 dark:text-gray-300'
                  }`}>
                    {review.userName?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {review.userName}
                      </span>
                      {review.userId === userId && (
                        <span className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-semibold">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {new Date(review.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Rating badge */}
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-sm font-black flex-shrink-0 ${
                  review.rating >= 4
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : review.rating === 3
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                }`}>
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {review.rating}
                </div>
              </div>

              {/* Stars + comment */}
              <div className="mt-3 space-y-2">
                <StarRating rating={review.rating} size="sm" />
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {review.comment}
                </p>
              </div>

              {/* Verified */}
              <div className="mt-3 flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-green-500 fill-current" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Verified Purchase
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800"
            >
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-7 w-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">
                Delete your review?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
                This will permanently remove your review and update the product rating.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-colors"
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
