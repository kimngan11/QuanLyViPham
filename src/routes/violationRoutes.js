const express = require("express");
const router = express.Router();
const violationController = require("../controllers/violationController");

router.get("/", violationController.getAllViolations);
router.get("/loai-phuong-tien", violationController.getLoaiPhuongTien);
router.get("/muc-nong-do-con", violationController.getMucNongDoCon);
router.get("/tra-cuu", violationController.searchViolations);
router.post("/lap-bien-ban", violationController.createViolation);
router.post("/ra-quyet-dinh", violationController.raQuyetDinh);

// New Routes for FormCanBoMain
router.get("/nguoi-vi-pham", violationController.getAllNguoiViPham);
router.get("/nguoi-vi-pham/:id", violationController.getNguoiViPhamDetails);
router.get("/quyet-dinh", violationController.getAllQuyetDinh);
router.get("/thong-ke", violationController.getThongKe);
router.put("/thanh-toan", violationController.updateThanhToan);

module.exports = router;
