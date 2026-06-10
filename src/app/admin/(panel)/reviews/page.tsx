'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Check, X, Trash2, MessageSquare, AlertCircle, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface AdminReview {
  _id: string;
  productId: string;
  productName: string;
  productImage: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [deleteTarget, setDeleteTarget] = useState<{ productId: string; reviewId: string } | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      if (data.success) setReviews(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleApprove = async (review: AdminReview, approve: boolean) => {
    setProcessing(review._id);
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: review.productId,
          reviewId: review._id,
          isApproved: approve,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchReviews();
      } else {
        toast.error(data.error);
      }
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setProcessing(deleteTarget.reviewId);
    try {
      const res = await fetch(
        `/api/admin/reviews?productId=${deleteTarget.productId}&reviewId=${deleteTarget.reviewId}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (data.success) {
        toast.success('Review deleted');
        setDeleteTarget(null);
        fetchReviews();
      } else {
        toast.error(data.error);
      }
    } finally {
      setProcessing(null);
    }
  };

  const filtered = reviews.filter((r) => {
    if (filter === 'approved') return r.isApproved;
    if (filter === 'pending') return !r.isApproved;
    return true;
  });

  const pendingCount = reviews.filter((r) => !r.isApproved).length;

  const ratingColor = (r: number) =>
    r >= 4 ? 'text-green-400' : r === 3 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reviews</h1>
          <p className="text-gray-400 text-sm mt-1">
            {reviews.length} total reviews
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full font-medium">
                {pendingCount} pending
              </span>
            )}
          </p>
        </div>
        {/* Filter tabs */}
        <div className="flex gap-1 bg-gray-800 rounded-xl p-1">
          {(['all', 'approved', 'pending'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                filter === f
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {f}
              {f === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 text-xs">({pendingCount})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-900 border border-gray-800 rounded-2xl animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
            <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-sm">
              {filter === 'pending' ? 'No pending reviews to moderate' : 'No reviews found'}
            </p>
          </div>
        ) : (
          filtered.map((review, i) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`bg-gray-900 border rounded-2xl p-5 transition-all ${
                !review.isApproved
                  ? 'border-orange-500/30 bg-orange-500/5'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Product Image */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                  {review.productImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={review.productImage}
                      alt={review.productName}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-bold">
                      {review.productName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <Link
                        href={`/products/${review.productId}`}
                        target="_blank"
                        className="text-sm font-semibold text-white hover:text-orange-400 transition-colors flex items-center gap-1.5"
                      >
                        {review.productName}
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </Link>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 text-xs font-bold flex-shrink-0">
                          {review.userName?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-400">{review.userName}</span>
                        <span className="text-gray-700">•</span>
                        <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Rating badge */}
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold bg-gray-800 ${ratingColor(review.rating)}`}>
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {review.rating}
                      </div>

                      {/* Status */}
                      <Badge variant={review.isApproved ? 'success' : 'warning'} className="text-xs">
                        {review.isApproved ? '✓ Approved' : '⏳ Pending'}
                      </Badge>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 mt-2 mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3.5 w-3.5 ${
                          s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">{review.comment}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-800">
                {!review.isApproved ? (
                  <button
                    onClick={() => handleApprove(review, true)}
                    disabled={processing === review._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {processing === review._id ? (
                      <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : <Check className="h-3.5 w-3.5" />}
                    Approve
                  </button>
                ) : (
                  <button
                    onClick={() => handleApprove(review, false)}
                    disabled={processing === review._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    Unapprove
                  </button>
                )}
                <button
                  onClick={() => setDeleteTarget({ productId: review.productId, reviewId: review._id })}
                  disabled={processing === review._id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-white text-center mb-2">Delete Review?</h3>
              <p className="text-gray-400 text-sm text-center mb-6">
                This will permanently delete the review and update the product rating.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-800 text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={!!processing}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors"
                >
                  {processing ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
