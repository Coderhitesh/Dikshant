"use strict";

const { Scholarship } = require("../models");
const redis = require("../config/redis");

class ScholarshipController {

  // ===============================
  // CREATE SCHOLARSHIP
  // ===============================
  static async create(req, res) {
    try {
      const payload = {
        name: req.body.name,
        description: req.body.description || null,

        applyStatus: req.body.applyStatus || "UPCOMING",

        // category can be array or object → JSON
        // example: ["GEN", "SC"]
        category: req.body.category || null,

        // example: [1, 3, 5]
        offeredCourseIds: req.body.offeredCourseIds || null,

        discountPercentage: req.body.discountPercentage ?? 100,

        noOfQuestions: req.body.noOfQuestions || 0,
        duration: req.body.duration || 0
      };

      const scholarship = await Scholarship.create(payload);

      await redis.del("scholarships");

      return res.status(201).json({
        success: true,
        data: scholarship
      });

    } catch (error) {
      console.error("❌ Create Scholarship Error:", error);
      return res.status(500).json({
        success: false,
        message: "Error creating scholarship",
        error: error.message
      });
    }
  }

  // ===============================
  // GET ALL SCHOLARSHIPS
  // ===============================
  static async findAll(req, res) {
    try {
      const items = await Scholarship.findAll({
        order: [["createdAt", "DESC"]]
      });

      return res.json({
        success: true,
        count: items.length,
        data: items
      });

    } catch (error) {
      console.error("❌ Fetch Scholarships Error:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching scholarships"
      });
    }
  }

  // ===============================
  // GET SINGLE SCHOLARSHIP
  // ===============================
  static async findOne(req, res) {
    try {
      const { id } = req.params;

      const scholarship = await Scholarship.findByPk(id);

      if (!scholarship) {
        return res.status(404).json({
          success: false,
          message: "Scholarship not found"
        });
      }

      return res.json({
        success: true,
        data: scholarship
      });

    } catch (error) {
      console.error("❌ Fetch Scholarship Error:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching scholarship"
      });
    }
  }

  // ===============================
  // UPDATE SCHOLARSHIP
  // ===============================
  static async update(req, res) {
    try {
      const { id } = req.params;

      const scholarship = await Scholarship.findByPk(id);
      if (!scholarship) {
        return res.status(404).json({
          success: false,
          message: "Scholarship not found"
        });
      }

      await scholarship.update({
        name: req.body.name ?? scholarship.name,
        description: req.body.description ?? scholarship.description,

        applyStatus: req.body.applyStatus ?? scholarship.applyStatus,
        category: req.body.category ?? scholarship.category,
        offeredCourseIds: req.body.offeredCourseIds ?? scholarship.offeredCourseIds,

        discountPercentage:
          req.body.discountPercentage ?? scholarship.discountPercentage,

        noOfQuestions: req.body.noOfQuestions ?? scholarship.noOfQuestions,
        duration: req.body.duration ?? scholarship.duration
      });

      await redis.del("scholarships");
      await redis.del(`scholarship:${id}`);

      return res.json({
        success: true,
        data: scholarship
      });

    } catch (error) {
      console.error("❌ Update Scholarship Error:", error);
      return res.status(500).json({
        success: false,
        message: "Error updating scholarship"
      });
    }
  }

  // ===============================
  // DELETE SCHOLARSHIP
  // ===============================
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const scholarship = await Scholarship.findByPk(id);
      if (!scholarship) {
        return res.status(404).json({
          success: false,
          message: "Scholarship not found"
        });
      }

      await scholarship.destroy();

      await redis.del("scholarships");
      await redis.del(`scholarship:${id}`);

      return res.json({
        success: true,
        message: "Scholarship deleted successfully"
      });

    } catch (error) {
      console.error("❌ Delete Scholarship Error:", error);
      return res.status(500).json({
        success: false,
        message: "Error deleting scholarship"
      });
    }
  }

  // ===============================
  // START TEST
  // ===============================
  static async startTest(req, res) {
    try {
      const { id } = req.params;

      const scholarship = await Scholarship.findByPk(id);
      if (!scholarship) {
        return res.status(404).json({
          success: false,
          message: "Scholarship not found"
        });
      }

      if (scholarship.applyStatus !== "OPEN") {
        return res.status(400).json({
          success: false,
          message: "Scholarship test is not open"
        });
      }

      const now = Date.now();
      const endTime = now + scholarship.duration * 60 * 1000;

      return res.json({
        success: true,
        scholarshipId: id,
        timeLimit: scholarship.duration,
        serverTime: now,
        endTime
      });

    } catch (error) {
      console.error("❌ Start Test Error:", error);
      return res.status(500).json({
        success: false,
        message: "Error starting test"
      });
    }
  }
}

module.exports = ScholarshipController;
