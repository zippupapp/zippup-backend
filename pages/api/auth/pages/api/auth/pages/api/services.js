import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const services = await prisma.service.findMany({
        where: { isActive: true },
        orderBy: { category: 'asc' }
      });

      return res.status(200).json({
        success: true,
        services
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Services error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
