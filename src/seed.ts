import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from './modules/user/user.model';
import { Item } from './modules/item/item.model';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    await User.deleteMany();
    await Item.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const userPassword = await bcrypt.hash('123456', salt);

    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@writeflow.com',
      password: adminPassword,
      role: 'ADMIN',
      plan: 'pro',
    });

    const normalUser = await User.create({
      name: 'User',
      email: 'user@writeflow.com',
      password: userPassword,
      role: 'USER',
      plan: 'free',
    });

    const items = [
      {
        title: 'Blog Post Writer',
        description: 'Generate high-quality blog posts.',
        category: 'Blog',
        price: 5,
        prompt: 'Write a blog post about {topic}.',
        createdBy: adminUser._id,
      },
      {
        title: 'Email Campaign',
        description: 'Create engaging email campaigns.',
        category: 'Email',
        price: 3,
        prompt: 'Write an email campaign for {product}.',
        createdBy: adminUser._id,
      },
      {
        title: 'Social Media Post',
        description: 'Generate catchy social media posts.',
        category: 'Social Media',
        price: 2,
        prompt: 'Write a social media post for {platform} about {topic}.',
        createdBy: adminUser._id,
      },
      {
        title: 'Ad Copy Generator',
        description: 'Create high-converting ad copy.',
        category: 'Ad Copy',
        price: 4,
        prompt: 'Write an ad copy for {product}.',
        createdBy: adminUser._id,
      },
    ];

    await Item.insertMany(items);

    console.log('Data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

seedData();
