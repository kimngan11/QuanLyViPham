const db = require("../config/db");

exports.getAllViolations = (req, res) => {
    const sql = `
        SELECT vp.*, nvp.HoTen AS TenNguoiViPham, cb.HoTen AS TenCanBo, tttt.TenTrangThai, lvp.MucPhat
        FROM VI_PHAM vp
        JOIN NGUOI_VI_PHAM nvp ON vp.Ma_NguoiViPham = nvp.Ma_NguoiViPham
        JOIN CAN_BO cb ON vp.Ma_CanBo = cb.Ma_CanBo
        JOIN TRANG_THAI_THANH_TOAN tttt ON vp.Ma_TrangThaiThanhToan = tttt.Ma_TrangThaiThanhToan
        JOIN LOAI_VI_PHAM lvp ON vp.Ma_LoaiViPham = lvp.Ma_LoaiViPham
        ORDER BY vp.ThoiGianViPham DESC
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: err.sqlMessage || "Lỗi server" });
        res.json(result);
    });
};

exports.getLoaiPhuongTien = (req, res) => {
    db.query("SELECT * FROM LOAI_PHUONG_TIEN", (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
};

exports.getMucNongDoCon = (req, res) => {
    db.query("SELECT * FROM MUC_NONG_DO_CON", (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
};

exports.searchViolations = (req, res) => {
    const { keyword } = req.query;
    const sql = `CALL sp_TraCuuViPhamTheoCCCD(?)`;
    db.query(sql, [keyword], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0]);
    });
};

exports.createViolation = (req, res) => {
    const { nguoiViPham, viPham } = req.body;
    const checkNvpSql = "SELECT Ma_NguoiViPham FROM NGUOI_VI_PHAM WHERE CanCuocCongDan = ?";
    
    db.query(checkNvpSql, [nguoiViPham.CanCuocCongDan], (err, results) => {
        if (err) return res.status(500).send(err);

        if (results.length === 0) {
            db.query(`INSERT INTO NGUOI_VI_PHAM SET ?`, nguoiViPham, (err) => {
                if (err) return res.status(500).send(err);
                saveViolation(nguoiViPham.Ma_NguoiViPham);
            });
        } else {
            saveViolation(results[0].Ma_NguoiViPham);
        }
    });

    function saveViolation(maNvp) {
        db.query(`INSERT INTO VI_PHAM SET ?, Ma_NguoiViPham = ?`, [viPham, maNvp], (err) => {
            if (err) return res.status(500).json({ message: err.sqlMessage || "Lỗi khi lưu biên bản" });
            res.json({ success: true, message: "Lập biên bản thành công" });
        });
    }
};

exports.raQuyetDinh = (req, res) => {
    const { Ma_VuViec } = req.body;
    const sql = `INSERT INTO QUYET_DINH_XU_PHAT (Ma_VuViec, SoTienPhat) VALUES (?, 0)`;
    db.query(sql, [Ma_VuViec], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ success: true, message: "Đã ra quyết định xử phạt" });
    });
};

// ===========================
// QUẢN LÝ NGƯỜI VI PHẠM
// ===========================
exports.getAllNguoiViPham = (req, res) => {
    const sql = "SELECT * FROM NGUOI_VI_PHAM";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
};

exports.getNguoiViPhamDetails = (req, res) => {
    const { id } = req.params;
    const sqlNvp = "SELECT * FROM NGUOI_VI_PHAM WHERE Ma_NguoiViPham = ?";
    const sqlVp = `
        SELECT vp.*, lvp.TenLoaiViPham, lvp.MucPhat, tttt.TenTrangThai
        FROM VI_PHAM vp
        JOIN LOAI_VI_PHAM lvp ON vp.Ma_LoaiViPham = lvp.Ma_LoaiViPham
        JOIN TRANG_THAI_THANH_TOAN tttt ON vp.Ma_TrangThaiThanhToan = tttt.Ma_TrangThaiThanhToan
        WHERE vp.Ma_NguoiViPham = ?
    `;
    
    db.query(sqlNvp, [id], (err, nvp) => {
        if (err) return res.status(500).send(err);
        db.query(sqlVp, [id], (err, violations) => {
            if (err) return res.status(500).send(err);
            res.json({ personal: nvp[0], history: violations });
        });
    });
};

// ===========================
// QUẢN LÝ QUYẾT ĐỊNH & THANH TOÁN
// ===========================
exports.getAllQuyetDinh = (req, res) => {
    const sql = `
        SELECT qd.*, vp.BienSoXe, nvp.HoTen AS TenNguoiViPham, nvp.CanCuocCongDan, tttt.TenTrangThai
        FROM QUYET_DINH_XU_PHAT qd
        JOIN VI_PHAM vp ON qd.Ma_VuViec = vp.Ma_VuViec
        JOIN NGUOI_VI_PHAM nvp ON vp.Ma_NguoiViPham = nvp.Ma_NguoiViPham
        JOIN TRANG_THAI_THANH_TOAN tttt ON qd.Ma_TrangThaiThanhToan = tttt.Ma_TrangThaiThanhToan
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
};

// ===========================
// THÔNG KÊ & THANH TOÁN
// ===========================

exports.updateThanhToan = (req, res) => {
    const { Ma_QuyetDinh, NgayNopPhat } = req.body;
    const sql = "UPDATE QUYET_DINH_XU_PHAT SET Ma_TrangThaiThanhToan = 'TTTT02', NgayNopPhat = ? WHERE Ma_QuyetDinh = ?";
    db.query(sql, [NgayNopPhat || new Date(), Ma_QuyetDinh], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ success: true, message: "Cập nhật thanh toán thành công" });
    });
};

exports.getThongKe = (req, res) => {
    const { month, year } = req.query;
    
    let whereClause = "WHERE YEAR(vp.ThoiGianViPham) = ?";
    let params = [year];

    if (month !== 'all') {
        whereClause += " AND MONTH(vp.ThoiGianViPham) = ?";
        params.push(month);
    }

    const statsSql = `
        SELECT 
            COUNT(*) as totalVuViec,
            IFNULL(SUM(lvp.MucPhat), 0) as totalMoney
        FROM VI_PHAM vp
        JOIN LOAI_VI_PHAM lvp ON vp.Ma_LoaiViPham = lvp.Ma_LoaiViPham
        ${whereClause}
    `;

    const listSql = `
        SELECT vp.Ma_VuViec, nvp.HoTen, vp.ThoiGianViPham, lvp.MucPhat, tttt.TenTrangThai
        FROM VI_PHAM vp
        JOIN NGUOI_VI_PHAM nvp ON vp.Ma_NguoiViPham = nvp.Ma_NguoiViPham
        JOIN LOAI_VI_PHAM lvp ON vp.Ma_LoaiViPham = lvp.Ma_LoaiViPham
        LEFT JOIN TRANG_THAI_THANH_TOAN tttt ON vp.Ma_TrangThaiThanhToan = tttt.Ma_TrangThaiThanhToan
        ${whereClause}
        ORDER BY vp.ThoiGianViPham DESC
    `;

    db.query(statsSql, params, (err, stats) => {
        if (err) return res.status(500).send(err);
        db.query(listSql, params, (err, list) => {
            if (err) return res.status(500).send(err);
            res.json({ stats: stats[0], list: list });
        });
    });
};

exports.getLoaiViPham = (req, res) => {
    const sql = `
        SELECT lvp.*, pt.TenPhuongTien, mnd.KhoangGiaTri
        FROM LOAI_VI_PHAM lvp
        JOIN LOAI_PHUONG_TIEN pt ON lvp.Ma_LoaiPhuongTien = pt.Ma_LoaiPhuongTien
        JOIN MUC_NONG_DO_CON mnd ON lvp.Ma_MucNongDoCon = mnd.Ma_MucNongDoCon
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: err.sqlMessage || "Lỗi SQL" });
        res.json(result);
    });
};

exports.updateThanhToan = (req, res) => {
    const { Ma_VuViec, Ma_TrangThaiThanhToan } = req.body;
    const sql = "UPDATE VI_PHAM SET Ma_TrangThaiThanhToan = ? WHERE Ma_VuViec = ?";
    db.query(sql, [Ma_TrangThaiThanhToan, Ma_VuViec], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ success: true, message: "Cập nhật trạng thái thành công" });
    });
};

exports.updateLoaiViPham = (req, res) => {
    const { id } = req.params;
    const { MucPhat } = req.body;
    const sql = "UPDATE LOAI_VI_PHAM SET MucPhat = ? WHERE Ma_LoaiViPham = ?";
    db.query(sql, [MucPhat, id], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ success: true, message: "Cập nhật mức phạt thành công" });
    });
};
