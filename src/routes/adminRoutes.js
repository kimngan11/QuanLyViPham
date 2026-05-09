const express = require("express");
const router = express.Router();
const officerController = require("../controllers/officerController");
const violationController = require("../controllers/violationController");

// Officer Management
router.get("/can-bo", officerController.getAllOfficers);
router.post("/can-bo", officerController.createOfficer);
router.put("/can-bo/:id", officerController.updateOfficer);
router.delete("/can-bo/:id", officerController.deleteOfficer);

// System Stats (3.8.2.a)
router.get("/stats", (req, res) => {
    const sql = `
        SELECT 
            (SELECT COUNT(*) FROM VI_PHAM) as totalViolations,
            (SELECT SUM(SoTienPhat) FROM QUYET_DINH_XU_PHAT WHERE Ma_TrangThaiThanhToan = 'TTTT02') as totalRevenue,
            (SELECT COUNT(*) FROM CAN_BO) as totalOfficers,
            (SELECT COUNT(*) FROM NGUOI_VI_PHAM) as totalViolators,
            (SELECT COUNT(*) FROM QUYET_DINH_XU_PHAT WHERE Ma_TrangThaiThanhToan = 'TTTT02') as paidCount,
            (SELECT COUNT(*) FROM QUYET_DINH_XU_PHAT WHERE Ma_TrangThaiThanhToan = 'TTTT01') as unpaidCount
    `;
    require("../config/db").query(sql, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0]);
    });
});

// Account Management (3.8.2.c)
router.get("/tai-khoan", (req, res) => {
    const sql = `
        SELECT tk.Ma_TaiKhoan, tk.TenDangNhap, tk.Email, r.TenRole, tk.TrangThai, cb.HoTen as HoTenCanBo
        FROM TAI_KHOAN tk
        JOIN ROLE r ON tk.Ma_Role = r.Ma_Role
        LEFT JOIN CAN_BO cb ON tk.Ma_CanBo = cb.Ma_CanBo
    `;
    require("../config/db").query(sql, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

router.post("/tai-khoan", (req, res) => {
    const { TenDangNhap, Email, MatKhauHash, Ma_Role, Ma_CanBo } = req.body;
    const sql = "INSERT INTO TAI_KHOAN (TenDangNhap, Email, MatKhauHash, Ma_Role, Ma_CanBo) VALUES (?, ?, ?, ?, ?)";
    require("../config/db").query(sql, [TenDangNhap, Email, MatKhauHash, Ma_Role, Ma_CanBo], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ success: true, message: "Cấp tài khoản thành công" });
    });
});

router.put("/tai-khoan/toggle", (req, res) => {
    const { Ma_TaiKhoan, TrangThai } = req.body;
    const sql = "UPDATE TAI_KHOAN SET TrangThai = ? WHERE Ma_TaiKhoan = ?";
    require("../config/db").query(sql, [TrangThai, Ma_TaiKhoan], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ success: true, message: "Cập nhật trạng thái thành công" });
    });
});

router.get("/can-bo-chua-tk", (req, res) => {
    const sql = "SELECT Ma_CanBo, HoTen FROM CAN_BO WHERE Ma_CanBo NOT IN (SELECT Ma_CanBo FROM TAI_KHOAN)";
    require("../config/db").query(sql, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

module.exports = router;
