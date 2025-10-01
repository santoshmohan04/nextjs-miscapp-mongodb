import mongoose, { Document, Model, Schema } from 'mongoose';

interface IItem extends Document {
  name: string;
  description?: string;
}

const ItemSchema: Schema<IItem> = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
});

const Item: Model<IItem> = mongoose.models.Item as Model<IItem> || mongoose.model<IItem>('Item', ItemSchema);

export default Item;