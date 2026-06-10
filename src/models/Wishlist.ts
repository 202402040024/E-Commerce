import mongoose, { Document, Schema } from 'mongoose';

export interface IWishlistDocument extends Document {
  userId: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlistDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

const Wishlist =
  mongoose.models.Wishlist || mongoose.model<IWishlistDocument>('Wishlist', WishlistSchema);

export default Wishlist;
