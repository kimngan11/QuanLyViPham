const express = require("express");
const router = express.Router();
const officerController = require("../controllers/officerController");
const violationController = require("../controllers/violationController");

// Officer Management
router.get("/can-bo", officerController.getAllOfficers);
router.post("/can-bo", officerController.createOfficer);
router.delete("/can-bo/:id", officerController.deleteOfficer);

// System Stats
router.get("/stats", (req, res) => {
    const sql = `
        SELECT 
            (SELECT COUNT(*) FROM VI_PHAM) as totalViolations,
            (SELECT SUM(SoTienPhat) FROM QUYET_DINH_XU_PHAT) as totalRevenue,
            (SELECT COUNT(*) FROM CAN_BO) as totalOfficers
    `;
    require("../config/db").query(sql, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0]);
    });
});

module.exports = router;
