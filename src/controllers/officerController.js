const db = require("../config/db");

exports.getAllOfficers = (req, res) => {
    const sql = "SELECT * FROM CAN_BO";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
};

exports.createOfficer = (req, res) => {
    const officerData = req.body; // { Ma_CanBo, HoTen, SoDienThoai, CanCuocCongDan, DiaChi, CapBac, DonViCongTac }
    const sql = "INSERT INTO CAN_BO SET ?";
    db.query(sql, officerData, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ success: true, message: "Thêm cán bộ thành công" });
    });
};

exports.updateOfficer = (req, res) => {
    const { id } = req.params;
    const officerData = req.body;
    const sql = "UPDATE CAN_BO SET ? WHERE Ma_CanBo = ?";
    db.query(sql, [officerData, id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ success: true, message: "Cập nhật cán bộ thành công" });
    });
};

exports.deleteOfficer = (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM CAN_BO WHERE Ma_CanBo = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ success: true, message: "Đã xóa cán bộ" });
    });
};
