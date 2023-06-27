import Quiz from "@/models/quiz";
import { ITEMS_PER_PAGE } from "@/pages/quizzes/page/[page]";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse<unknown>) {
  const searchQuery = req.query.search as string;
  const currentPage = parseInt(req.query.currentPage as string);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  if (searchQuery) {
    const regex = new RegExp(searchQuery, "i");
    const [docs, totalCount] = await Promise.all([
      Quiz.aggregate([
        {
          $match: {
            $and: [
              { status: "published" },
              {
                $or: [
                  { title: { $regex: regex } },
                  { description: { $regex: regex } },
                ],
              },
            ],
          },
        },
        {
          $sort: { _id: -1 },
        },
        {
          $skip: startIndex,
        },
        {
          $limit: ITEMS_PER_PAGE,
        },
        {
          $lookup: {
            from: "users",
            localField: "creator_id",
            foreignField: "_id",
            as: "creator",
          },
        },
        {
          $project: {
            _id: 1,
            creator: { $arrayElemAt: ["$creator.name", 0] },
            title: 1,
            description: 1,
          },
        },
      ]),
      Quiz.aggregate([
        {
          $match: {
            $and: [
              { status: "published" },
              {
                $or: [
                  { title: { $regex: regex } },
                  { description: { $regex: regex } },
                ],
              },
            ],
          },
        },
        {
          $count: "total",
        },
      ]),
    ]);

    const totalItems = totalCount[0]?.total ?? 0;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return res.status(200).json({
      data: {
        data: docs,
        totalPages,
      },
    });
  }

  return res.status(500).json({
    error: {
      message: `Couldn't find the search query`,
    },
  });
}

export default handler;
