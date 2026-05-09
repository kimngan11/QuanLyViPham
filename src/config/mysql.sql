-- ============================================================
-- TẠO DATABASE
-- ============================================================
CREATE DATABASE IF NOT EXISTS QuanLyViPham
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE QuanLyViPham;

-- ============================================================
-- NGUOI_VI_PHAM
-- ============================================================
-- ============================================================
-- NGUOI_VI_PHAM (bỏ CHECK ngày sinh, chuyển sang trigger)
-- ============================================================
CREATE TABLE NGUOI_VI_PHAM (
    Ma_NguoiViPham  CHAR(10)        NOT NULL,
    HoTen           VARCHAR(100)    NOT NULL,
    SoDienThoai     VARCHAR(15)     NOT NULL,
    CanCuocCongDan  CHAR(12)        NOT NULL,
    NgaySinh        DATE            NOT NULL,
    DiaChi          VARCHAR(255)    NOT NULL,
    GioiTinh        VARCHAR(10)     NOT NULL,
    PRIMARY KEY (Ma_NguoiViPham),
    UNIQUE KEY uq_nvp_sdt   (SoDienThoai),
    UNIQUE KEY uq_nvp_cccd  (CanCuocCongDan),
    CONSTRAINT chk_nvp_sdt
        CHECK (SoDienThoai REGEXP '^(0[0-9]{9}|\\+84[0-9]{9})$'),
    CONSTRAINT chk_nvp_cccd
        CHECK (CanCuocCongDan REGEXP '^[0-9]{12}$'),
    CONSTRAINT chk_nvp_gioitinh
        CHECK (GioiTinh IN ('Nam', 'Nữ'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TRIGGER kiểm tra NgaySinh thay cho CHECK constraint
-- ============================================================
DELIMITER $$

CREATE TRIGGER trg_KiemTraNgaySinh_NVP_Insert
BEFORE INSERT ON NGUOI_VI_PHAM
FOR EACH ROW
BEGIN
    DECLARE tuoi INT;
    SET tuoi = TIMESTAMPDIFF(YEAR, NEW.NgaySinh, CURDATE());

    IF NEW.NgaySinh > CURDATE() THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Ngày sinh không được lớn hơn ngày hiện tại!';
    ELSEIF tuoi < 16 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Người vi phạm phải từ 16 tuổi trở lên!';
    ELSEIF tuoi > 120 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Ngày sinh không hợp lệ (tuổi vượt quá 120)!';
    END IF;
END$$

CREATE TRIGGER trg_KiemTraNgaySinh_NVP_Update
BEFORE UPDATE ON NGUOI_VI_PHAM
FOR EACH ROW
BEGIN
    DECLARE tuoi INT;
    SET tuoi = TIMESTAMPDIFF(YEAR, NEW.NgaySinh, CURDATE());

    IF NEW.NgaySinh > CURDATE() THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Ngày sinh không được lớn hơn ngày hiện tại!';
    ELSEIF tuoi < 16 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Người vi phạm phải từ 16 tuổi trở lên!';
    ELSEIF tuoi > 120 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Ngày sinh không hợp lệ (tuổi vượt quá 120)!';
    END IF;
END$$

DELIMITER ;
-- ============================================================
-- CAN_BO
-- ============================================================
CREATE TABLE CAN_BO (
    Ma_CanBo        CHAR(10)        NOT NULL,
    HoTen           VARCHAR(100)    NOT NULL,
    SoDienThoai     VARCHAR(15)     NOT NULL,
    CanCuocCongDan  CHAR(12)        NOT NULL,
    DiaChi          VARCHAR(255)    NOT NULL,
    CapBac          VARCHAR(50)     NOT NULL,
    DonViCongTac    VARCHAR(100)    NOT NULL DEFAULT 'Công an Quận Bình Thạnh',
    PRIMARY KEY (Ma_CanBo),
    UNIQUE KEY uq_cb_sdt  (SoDienThoai),
    UNIQUE KEY uq_cb_cccd (CanCuocCongDan),
    CONSTRAINT chk_cb_sdt
        CHECK (SoDienThoai REGEXP '^(0[0-9]{9}|\\+84[0-9]{9})$'),
    CONSTRAINT chk_cb_cccd
        CHECK (CanCuocCongDan REGEXP '^[0-9]{12}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- ROLE
-- ============================================================
CREATE TABLE ROLE (
    Ma_Role         CHAR(10)        NOT NULL,
    TenRole         VARCHAR(50)     NOT NULL,
    MoTa            VARCHAR(255),
    PRIMARY KEY (Ma_Role),
    UNIQUE KEY uq_role_ten (TenRole)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO ROLE (Ma_Role, TenRole, MoTa) VALUES
('ROLE01', 'Admin',       'Quản trị hệ thống, toàn quyền'),
('ROLE02', 'CanBo',       'Cán bộ xử lý vi phạm'),
('ROLE03', 'NguoiViPham', 'Người vi phạm, chỉ tra cứu');

-- ============================================================
-- TAI_KHOAN
-- ============================================================
CREATE TABLE TAI_KHOAN (
    Ma_TaiKhoan     INT             NOT NULL AUTO_INCREMENT,
    TenDangNhap     VARCHAR(50)     NOT NULL,
    MatKhauHash     VARCHAR(255)    NOT NULL,
    Salt            VARCHAR(64)     NULL,
    Email           VARCHAR(100)    NOT NULL,
    Ma_Role         CHAR(10)        NOT NULL DEFAULT 'ROLE02',
    Ma_CanBo        CHAR(10)        NOT NULL,
    TrangThai       VARCHAR(20)     NOT NULL DEFAULT 'Hoạt động',
    NgayTao         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    LanDangNhapCuoi DATETIME        NULL,
    PRIMARY KEY (Ma_TaiKhoan),
    UNIQUE KEY uq_tk_tendangnhap (TenDangNhap),
    UNIQUE KEY uq_tk_email       (Email),
    UNIQUE KEY uq_tk_canbo       (Ma_CanBo),
    CONSTRAINT chk_tk_tendangnhap
        CHECK (CHAR_LENGTH(TenDangNhap) >= 5),
    CONSTRAINT chk_tk_email
        CHECK (Email REGEXP '^[^@]+@[^@]+\\.[^@]{2,}$'),
    CONSTRAINT chk_tk_trangthai
        CHECK (TrangThai IN ('Hoạt động', 'Bị khóa', 'Chờ duyệt')),
    FOREIGN KEY (Ma_Role)   REFERENCES ROLE(Ma_Role),
    FOREIGN KEY (Ma_CanBo)  REFERENCES CAN_BO(Ma_CanBo) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- LOAI_PHUONG_TIEN
-- ============================================================
CREATE TABLE LOAI_PHUONG_TIEN (
    Ma_LoaiPhuongTien   CHAR(10)        NOT NULL,
    TenPhuongTien       VARCHAR(50)     NOT NULL,
    MoTa                VARCHAR(255),
    PRIMARY KEY (Ma_LoaiPhuongTien),
    UNIQUE KEY uq_lpt_ten (TenPhuongTien),
    CONSTRAINT chk_lpt_ten
        CHECK (TenPhuongTien IN ('Xe máy', 'Ô tô', 'Xe tải', 'Xe khách'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- MUC_NONG_DO_CON
-- ============================================================
CREATE TABLE MUC_NONG_DO_CON (
    Ma_MucNongDoCon CHAR(10)        NOT NULL,
    KhoangGiaTri    VARCHAR(50)     NOT NULL,
    GiaTriMin       DOUBLE          NOT NULL,
    GiaTriMax       DOUBLE          NOT NULL,
    MoTa            VARCHAR(255),
    PRIMARY KEY (Ma_MucNongDoCon),
    UNIQUE KEY uq_mndc_khoang (KhoangGiaTri),
    CONSTRAINT chk_mndc_min  CHECK (GiaTriMin >= 0),
    CONSTRAINT chk_mndc_range CHECK (GiaTriMax > GiaTriMin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- LOAI_VI_PHAM
-- ============================================================
CREATE TABLE LOAI_VI_PHAM (
    Ma_LoaiViPham       CHAR(10)        NOT NULL,
    TenLoaiViPham       VARCHAR(100)    NOT NULL,
    MoTa                VARCHAR(255),
    Ma_LoaiPhuongTien   CHAR(10)        NOT NULL,
    Ma_MucNongDoCon     CHAR(10)        NOT NULL,
    MucPhat             DECIMAL(12,2)   NOT NULL,
    PRIMARY KEY (Ma_LoaiViPham),
    UNIQUE KEY uq_lvp_pt_mndc (Ma_LoaiPhuongTien, Ma_MucNongDoCon),
    CONSTRAINT chk_lvp_mucphat CHECK (MucPhat > 0),
    FOREIGN KEY (Ma_LoaiPhuongTien) REFERENCES LOAI_PHUONG_TIEN(Ma_LoaiPhuongTien),
    FOREIGN KEY (Ma_MucNongDoCon)   REFERENCES MUC_NONG_DO_CON(Ma_MucNongDoCon)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TRANG_THAI_THANH_TOAN
-- ============================================================
CREATE TABLE TRANG_THAI_THANH_TOAN (
    Ma_TrangThaiThanhToan   CHAR(10)        NOT NULL,
    TenTrangThai            VARCHAR(50)     NOT NULL,
    PRIMARY KEY (Ma_TrangThaiThanhToan),
    UNIQUE KEY uq_tttt_ten (TenTrangThai),
    CONSTRAINT chk_tttt_ten
        CHECK (TenTrangThai IN ('Chưa thanh toán', 'Đã thanh toán', 'Quá hạn'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO TRANG_THAI_THANH_TOAN VALUES
('TTTT01', 'Chưa thanh toán'),
('TTTT02', 'Đã thanh toán'),
('TTTT03', 'Quá hạn');

-- ============================================================
-- VI_PHAM
-- ============================================================
CREATE TABLE VI_PHAM (
    Ma_VuViec               CHAR(10)        NOT NULL,
    ThoiGianViPham          DATETIME        NOT NULL,
    DiaDiem                 VARCHAR(255)    NOT NULL,
    NongDoCon               DOUBLE          NOT NULL,
    BienSoXe                VARCHAR(20)     NOT NULL,
    Ma_LoaiViPham           CHAR(10)        NOT NULL,
    Ma_LoaiPhuongTien       CHAR(10)        NOT NULL,
    Ma_MucNongDoCon         CHAR(10)        NOT NULL,
    Ma_CanBo                CHAR(10)        NOT NULL,
    Ma_NguoiViPham          CHAR(10)        NOT NULL,
    Ma_TrangThaiThanhToan   CHAR(10)        NOT NULL DEFAULT 'TTTT01',
    PRIMARY KEY (Ma_VuViec),
    CONSTRAINT chk_vp_nongdocon CHECK (NongDoCon >= 0 AND NongDoCon <= 5.0),
    FOREIGN KEY (Ma_LoaiViPham)           REFERENCES LOAI_VI_PHAM(Ma_LoaiViPham),
    FOREIGN KEY (Ma_LoaiPhuongTien)       REFERENCES LOAI_PHUONG_TIEN(Ma_LoaiPhuongTien),
    FOREIGN KEY (Ma_MucNongDoCon)         REFERENCES MUC_NONG_DO_CON(Ma_MucNongDoCon),
    FOREIGN KEY (Ma_CanBo)                REFERENCES CAN_BO(Ma_CanBo),
    FOREIGN KEY (Ma_NguoiViPham)          REFERENCES NGUOI_VI_PHAM(Ma_NguoiViPham),
    FOREIGN KEY (Ma_TrangThaiThanhToan)   REFERENCES TRANG_THAI_THANH_TOAN(Ma_TrangThaiThanhToan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELIMITER $$

CREATE TRIGGER trg_KiemTraThoiGian_VP_Insert
BEFORE INSERT ON VI_PHAM
FOR EACH ROW
BEGIN
    IF NEW.ThoiGianViPham > NOW() THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Thời gian vi phạm không được lớn hơn thời điểm hiện tại!';
    END IF;
END$$

CREATE TRIGGER trg_KiemTraThoiGian_VP_Update
BEFORE UPDATE ON VI_PHAM
FOR EACH ROW
BEGIN
    IF NEW.ThoiGianViPham > NOW() THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Thời gian vi phạm không được lớn hơn thời điểm hiện tại!';
    END IF;
END$$

DELIMITER ;
-- ============================================================
-- QUYET_DINH_XU_PHAT
-- ============================================================
CREATE TABLE QUYET_DINH_XU_PHAT (
    Ma_QuyetDinh            INT             NOT NULL AUTO_INCREMENT,
    Ma_VuViec               CHAR(10)        NOT NULL,
    SoTienPhat              DECIMAL(12,2)   NOT NULL,
    NgayRaQuyetDinh         DATE            NOT NULL DEFAULT (CURDATE()),
    NgayNopPhat             DATE            NULL,
    Ma_TrangThaiThanhToan   CHAR(10)        NOT NULL DEFAULT 'TTTT01',
    PRIMARY KEY (Ma_QuyetDinh),
    UNIQUE KEY uq_qdxp_vuviec (Ma_VuViec),
    CONSTRAINT chk_qdxp_sotien      CHECK (SoTienPhat > 0),
    CONSTRAINT chk_qdxp_ngaynopphat CHECK (NgayNopPhat IS NULL OR NgayNopPhat >= NgayRaQuyetDinh),
    FOREIGN KEY (Ma_VuViec)               REFERENCES VI_PHAM(Ma_VuViec) ON DELETE CASCADE,
    FOREIGN KEY (Ma_TrangThaiThanhToan)   REFERENCES TRANG_THAI_THANH_TOAN(Ma_TrangThaiThanhToan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- LICH_SU_DANG_NHAP
-- ============================================================
CREATE TABLE LICH_SU_DANG_NHAP (
    Ma_LichSu   INT             NOT NULL AUTO_INCREMENT,
    Ma_TaiKhoan INT             NOT NULL,
    ThoiGian    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KetQua      VARCHAR(20)     NOT NULL,
    DiaChiIP    VARCHAR(45)     NULL,
    PRIMARY KEY (Ma_LichSu),
    CONSTRAINT chk_lsdn_ketqua CHECK (KetQua IN ('Thành công', 'Thất bại')),
    FOREIGN KEY (Ma_TaiKhoan) REFERENCES TAI_KHOAN(Ma_TaiKhoan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- TRIGGERS
-- ============================================================
DELIMITER $$

-- Kiểm tra biển số xe theo loại phương tiện (BEFORE INSERT)
CREATE TRIGGER trg_KiemTraBienSo_Insert
BEFORE INSERT ON VI_PHAM
FOR EACH ROW
BEGIN
    IF NEW.Ma_LoaiPhuongTien = 'LPT01' THEN
        -- Xe máy: 99A9-999.99
        IF NEW.BienSoXe NOT REGEXP '^[0-9]{2}[A-Z][0-9]-[0-9]{3}\\.[0-9]{2}$' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Biển số xe máy không đúng định dạng!';
        END IF;
    ELSE
        -- Ô tô, xe tải, xe khách: 99A-999.99
        IF NEW.BienSoXe NOT REGEXP '^[0-9]{2}[A-Z]-[0-9]{3}\\.[0-9]{2}$' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Biển số ô tô/xe tải/xe khách không đúng định dạng!';
        END IF;
    END IF;
END$$

CREATE TRIGGER trg_KiemTraBienSo_Update
BEFORE UPDATE ON VI_PHAM
FOR EACH ROW
BEGIN
    IF NEW.Ma_LoaiPhuongTien = 'LPT01' THEN
        IF NEW.BienSoXe NOT REGEXP '^[0-9]{2}[A-Z][0-9]-[0-9]{3}\\.[0-9]{2}$' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Biển số xe máy không đúng định dạng!';
        END IF;
    ELSE
        IF NEW.BienSoXe NOT REGEXP '^[0-9]{2}[A-Z]-[0-9]{3}\\.[0-9]{2}$' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Biển số ô tô/xe tải/xe khách không đúng định dạng!';
        END IF;
    END IF;
END$$

-- Kiểm tra loại vi phạm khớp loại phương tiện + mức nồng độ (BEFORE INSERT/UPDATE)
CREATE TRIGGER trg_KiemTraLoaiViPham_Insert
BEFORE INSERT ON VI_PHAM
FOR EACH ROW
BEGIN
    DECLARE v_Ma_LoaiPhuongTien CHAR(10);
    DECLARE v_Ma_MucNongDoCon   CHAR(10);

    SELECT Ma_LoaiPhuongTien, Ma_MucNongDoCon
    INTO v_Ma_LoaiPhuongTien, v_Ma_MucNongDoCon
    FROM LOAI_VI_PHAM
    WHERE Ma_LoaiViPham = NEW.Ma_LoaiViPham;

    IF v_Ma_LoaiPhuongTien <> NEW.Ma_LoaiPhuongTien
       OR v_Ma_MucNongDoCon <> NEW.Ma_MucNongDoCon THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Loại vi phạm không khớp với loại phương tiện hoặc mức nồng độ cồn!';
    END IF;
END$$

CREATE TRIGGER trg_KiemTraLoaiViPham_Update
BEFORE UPDATE ON VI_PHAM
FOR EACH ROW
BEGIN
    DECLARE v_Ma_LoaiPhuongTien CHAR(10);
    DECLARE v_Ma_MucNongDoCon   CHAR(10);

    SELECT Ma_LoaiPhuongTien, Ma_MucNongDoCon
    INTO v_Ma_LoaiPhuongTien, v_Ma_MucNongDoCon
    FROM LOAI_VI_PHAM
    WHERE Ma_LoaiViPham = NEW.Ma_LoaiViPham;

    IF v_Ma_LoaiPhuongTien <> NEW.Ma_LoaiPhuongTien
       OR v_Ma_MucNongDoCon <> NEW.Ma_MucNongDoCon THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Loại vi phạm không khớp với loại phương tiện hoặc mức nồng độ cồn!';
    END IF;
END$$

-- Kiểm tra nồng độ cồn nằm trong khoảng mức nồng độ (BEFORE INSERT/UPDATE)
CREATE TRIGGER trg_KiemTraNongDoCon_Insert
BEFORE INSERT ON VI_PHAM
FOR EACH ROW
BEGIN
    DECLARE v_Min DOUBLE;
    DECLARE v_Max DOUBLE;

    SELECT GiaTriMin, GiaTriMax
    INTO v_Min, v_Max
    FROM MUC_NONG_DO_CON
    WHERE Ma_MucNongDoCon = NEW.Ma_MucNongDoCon;

    IF NEW.NongDoCon < v_Min OR NEW.NongDoCon > v_Max THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Nồng độ cồn không nằm trong khoảng của mức nồng độ đã chọn!';
    END IF;
END$$

CREATE TRIGGER trg_KiemTraNongDoCon_Update
BEFORE UPDATE ON VI_PHAM
FOR EACH ROW
BEGIN
    DECLARE v_Min DOUBLE;
    DECLARE v_Max DOUBLE;

    SELECT GiaTriMin, GiaTriMax
    INTO v_Min, v_Max
    FROM MUC_NONG_DO_CON
    WHERE Ma_MucNongDoCon = NEW.Ma_MucNongDoCon;

    IF NEW.NongDoCon < v_Min OR NEW.NongDoCon > v_Max THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Nồng độ cồn không nằm trong khoảng của mức nồng độ đã chọn!';
    END IF;
END$$

-- Tự động cập nhật số tiền phạt từ loại vi phạm (BEFORE INSERT/UPDATE)
CREATE TRIGGER trg_CapNhatSoTienPhat_Insert
BEFORE INSERT ON QUYET_DINH_XU_PHAT
FOR EACH ROW
BEGIN
    DECLARE v_MucPhat DECIMAL(12,2);

    IF NEW.SoTienPhat IS NULL OR NEW.SoTienPhat = 0 THEN
        SELECT lv.MucPhat INTO v_MucPhat
        FROM VI_PHAM v
        JOIN LOAI_VI_PHAM lv ON v.Ma_LoaiViPham = lv.Ma_LoaiViPham
        WHERE v.Ma_VuViec = NEW.Ma_VuViec;

        SET NEW.SoTienPhat = v_MucPhat;
    END IF;
END$$

CREATE TRIGGER trg_CapNhatSoTienPhat_Update
BEFORE UPDATE ON QUYET_DINH_XU_PHAT
FOR EACH ROW
BEGIN
    DECLARE v_MucPhat DECIMAL(12,2);

    IF NEW.SoTienPhat IS NULL OR NEW.SoTienPhat = 0 THEN
        SELECT lv.MucPhat INTO v_MucPhat
        FROM VI_PHAM v
        JOIN LOAI_VI_PHAM lv ON v.Ma_LoaiViPham = lv.Ma_LoaiViPham
        WHERE v.Ma_VuViec = NEW.Ma_VuViec;

        SET NEW.SoTienPhat = v_MucPhat;
    END IF;
END$$

-- Đồng bộ trạng thái thanh toán VI_PHAM khi QUYET_DINH cập nhật (AFTER UPDATE)
CREATE TRIGGER trg_DongBoTrangThaiThanhToan
AFTER UPDATE ON QUYET_DINH_XU_PHAT
FOR EACH ROW
BEGIN
    IF NEW.Ma_TrangThaiThanhToan <> OLD.Ma_TrangThaiThanhToan THEN
        UPDATE VI_PHAM
        SET Ma_TrangThaiThanhToan = NEW.Ma_TrangThaiThanhToan
        WHERE Ma_VuViec = NEW.Ma_VuViec;
    END IF;
END$$

DELIMITER ;


-- ============================================================
-- STORED PROCEDURES
-- ============================================================
DELIMITER $$

-- Lấy thông tin đăng nhập (ứng dụng tự verify hash)
CREATE PROCEDURE sp_LayThongTinDangNhap(
    IN p_TenDangNhap    VARCHAR(50),
    IN p_DiaChiIP       VARCHAR(45)
)
BEGIN
    SELECT
        tk.Ma_TaiKhoan,
        tk.TenDangNhap,
        tk.MatKhauHash,
        tk.Salt,
        tk.TrangThai,
        r.TenRole       AS Role,
        cb.HoTen        AS HoTenCanBo,
        tk.Ma_CanBo
    FROM TAI_KHOAN tk
    JOIN ROLE   r  ON tk.Ma_Role  = r.Ma_Role
    JOIN CAN_BO cb ON tk.Ma_CanBo = cb.Ma_CanBo
    WHERE tk.TenDangNhap = p_TenDangNhap
      AND tk.TrangThai   = 'Hoạt động';
END$$

-- Ghi lịch sử đăng nhập
CREATE PROCEDURE sp_GhiLichSuDangNhap(
    IN p_Ma_TaiKhoan    INT,
    IN p_KetQua         VARCHAR(20),
    IN p_DiaChiIP       VARCHAR(45)
)
BEGIN
    INSERT INTO LICH_SU_DANG_NHAP (Ma_TaiKhoan, KetQua, DiaChiIP)
    VALUES (p_Ma_TaiKhoan, p_KetQua, p_DiaChiIP);

    IF p_KetQua = 'Thành công' THEN
        UPDATE TAI_KHOAN
        SET LanDangNhapCuoi = NOW()
        WHERE Ma_TaiKhoan = p_Ma_TaiKhoan;
    END IF;
END$$

-- Tra cứu vi phạm theo CCCD
CREATE PROCEDURE sp_TraCuuViPhamTheoCCCD(
    IN p_CanCuocCongDan CHAR(12)
)
BEGIN
    SELECT
        vp.Ma_VuViec,
        nvp.HoTen               AS NguoiViPham,
        nvp.CanCuocCongDan,
        vp.ThoiGianViPham,
        vp.DiaDiem,
        vp.NongDoCon,
        vp.BienSoXe,
        lpt.TenPhuongTien,
        mndc.KhoangGiaTri       AS MucNongDo,
        lvp.TenLoaiViPham,
        qd.SoTienPhat,
        qd.NgayRaQuyetDinh,
        qd.NgayNopPhat,
        tttt.TenTrangThai       AS TrangThaiThanhToan,
        cb.HoTen                AS CanBoLapBienBan
    FROM VI_PHAM vp
    JOIN NGUOI_VI_PHAM          nvp  ON vp.Ma_NguoiViPham      = nvp.Ma_NguoiViPham
    JOIN LOAI_PHUONG_TIEN       lpt  ON vp.Ma_LoaiPhuongTien   = lpt.Ma_LoaiPhuongTien
    JOIN MUC_NONG_DO_CON        mndc ON vp.Ma_MucNongDoCon     = mndc.Ma_MucNongDoCon
    JOIN LOAI_VI_PHAM           lvp  ON vp.Ma_LoaiViPham       = lvp.Ma_LoaiViPham
    JOIN CAN_BO                 cb   ON vp.Ma_CanBo            = cb.Ma_CanBo
    JOIN TRANG_THAI_THANH_TOAN  tttt ON vp.Ma_TrangThaiThanhToan = tttt.Ma_TrangThaiThanhToan
    LEFT JOIN QUYET_DINH_XU_PHAT qd  ON vp.Ma_VuViec           = qd.Ma_VuViec
    WHERE nvp.CanCuocCongDan = p_CanCuocCongDan
    ORDER BY vp.ThoiGianViPham DESC;
END$$

DELIMITER ;