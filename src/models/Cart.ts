import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItemDocument {
  productId: mongoose.Types.ObjectId;
  quantity: number;
}

export interface ICartDocument extends Document {
  userId: mongoose.Types.ObjectId;
  products: ICartItemDocument[];
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItemDocument>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
});

const CartSchema = new Schema<ICartDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    products: [CartItemSchema],
  },
  { timestamps: true }
);

const Cart = mongoose.models.Cart || mongoose.model<ICartDocument>('Cart', CartSchema);

export default Cart;
