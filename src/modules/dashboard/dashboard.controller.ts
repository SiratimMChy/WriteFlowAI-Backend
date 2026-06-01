import { Request, Response } from 'express';
import { User } from '../user/user.model';
import { Item } from '../item/item.model';
import { Booking } from '../booking/booking.model';

// Public endpoint - no auth required
export const getPublicStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalTemplates] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments(),
    ]);

    // Estimate words generated: assume ~500 words per booking/generation event
    const totalGenerations = await Booking.countDocuments();
    const estimatedWordsGenerated = totalGenerations * 500;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalTemplates,
        wordsGenerated: estimatedWordsGenerated,
        uptimeGuarantee: 99.9,
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalItems = await Item.countDocuments();
    const totalOrders = await Booking.countDocuments();
    
    const revenueData = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$price' } } }
    ]);
    
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    res.json({
      success: true,
      message: 'Request successful',
      data: { totalUsers, totalItems, totalOrders, totalRevenue }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getChartData = async (req: Request, res: Response): Promise<void> => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Bookings last 7 days
    const barChartData = await Booking.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Signups last 7 days
    const lineChartData = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Category breakdown
    const pieChartData = await Item.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      message: 'Request successful',
      data: {
        barChart: barChartData,
        lineChart: lineChartData,
        pieChart: pieChartData
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
