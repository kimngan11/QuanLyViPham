-- ============================================================
-- DATA SEED — QuanLyViPham
-- Thứ tự: đảm bảo FK hợp lệ
-- ============================================================

USE QuanLyViPham;

-- ============================================================
-- LOAI_PHUONG_TIEN
-- ============================================================
INSERT INTO LOAI_PHUONG_TIEN (Ma_LoaiPhuongTien, TenPhuongTien, MoTa) VALUES
('LPT01', 'Xe máy',   'Phương tiện hai bánh gắn máy'),
('LPT02', 'Ô tô',     'Phương tiện bốn bánh dưới 9 chỗ'),
('LPT03', 'Xe tải',   'Phương tiện chở hàng hóa'),
('LPT04', 'Xe khách', 'Phương tiện chở người từ 9 chỗ trở lên');

-- ============================================================
-- MUC_NONG_DO_CON
-- ============================================================
INSERT INTO MUC_NONG_DO_CON (Ma_MucNongDoCon, KhoangGiaTri, GiaTriMin, GiaTriMax, MoTa) VALUES
('MNDC01', '0 < x <= 0.25',  0.001, 0.25,  'Mức 1: Nhỏ hơn hoặc bằng 0,25 mg/l khí thở'),
('MNDC02', '0.25 < x <= 0.4', 0.251, 0.4,  'Mức 2: Trên 0,25 đến 0,4 mg/l khí thở'),
('MNDC03', '0.4 < x <= 5.0',  0.401, 5.0,  'Mức 3: Trên 0,4 mg/l khí thở');

-- ============================================================
-- LOAI_VI_PHAM
-- (mỗi cặp loại phương tiện + mức nồng độ là unique)
-- ============================================================
INSERT INTO LOAI_VI_PHAM (Ma_LoaiViPham, TenLoaiViPham, MoTa, Ma_LoaiPhuongTien, Ma_MucNongDoCon, MucPhat) VALUES
-- Xe máy
('LVP01', 'Vi phạm nồng độ cồn mức 1 - Xe máy',   'Xe máy, nồng độ cồn mức 1', 'LPT01', 'MNDC01', 2000000.00),
('LVP02', 'Vi phạm nồng độ cồn mức 2 - Xe máy',   'Xe máy, nồng độ cồn mức 2', 'LPT01', 'MNDC02', 4000000.00),
('LVP03', 'Vi phạm nồng độ cồn mức 3 - Xe máy',   'Xe máy, nồng độ cồn mức 3', 'LPT01', 'MNDC03', 8000000.00),
-- Ô tô
('LVP04', 'Vi phạm nồng độ cồn mức 1 - Ô tô',     'Ô tô, nồng độ cồn mức 1',   'LPT02', 'MNDC01', 6000000.00),
('LVP05', 'Vi phạm nồng độ cồn mức 2 - Ô tô',     'Ô tô, nồng độ cồn mức 2',   'LPT02', 'MNDC02', 16000000.00),
('LVP06', 'Vi phạm nồng độ cồn mức 3 - Ô tô',     'Ô tô, nồng độ cồn mức 3',   'LPT02', 'MNDC03', 40000000.00),
-- Xe tải
('LVP07', 'Vi phạm nồng độ cồn mức 1 - Xe tải',   'Xe tải, nồng độ cồn mức 1', 'LPT03', 'MNDC01', 6000000.00),
('LVP08', 'Vi phạm nồng độ cồn mức 2 - Xe tải',   'Xe tải, nồng độ cồn mức 2', 'LPT03', 'MNDC02', 16000000.00),
('LVP09', 'Vi phạm nồng độ cồn mức 3 - Xe tải',   'Xe tải, nồng độ cồn mức 3', 'LPT03', 'MNDC03', 40000000.00),
-- Xe khách
('LVP10', 'Vi phạm nồng độ cồn mức 1 - Xe khách', 'Xe khách, nồng độ cồn mức 1','LPT04', 'MNDC01', 6000000.00),
('LVP11', 'Vi phạm nồng độ cồn mức 2 - Xe khách', 'Xe khách, nồng độ cồn mức 2','LPT04', 'MNDC02', 16000000.00),
('LVP12', 'Vi phạm nồng độ cồn mức 3 - Xe khách', 'Xe khách, nồng độ cồn mức 3','LPT04', 'MNDC03', 40000000.00);

-- ============================================================
-- NGUOI_VI_PHAM
-- ============================================================
INSERT INTO NGUOI_VI_PHAM (Ma_NguoiViPham, HoTen, SoDienThoai, CanCuocCongDan, NgaySinh, DiaChi, GioiTinh) VALUES
('NVP001', 'Nguyễn Văn An',      '0912345678', '079087001234', '1990-05-14', '12 Lê Lợi, P. Bến Nghé, Q.1, TP.HCM',            'Nam'),
('NVP002', 'Trần Thị Bình',      '0923456789', '079092002345', '1992-08-22', '45 Nguyễn Huệ, P. Bến Nghé, Q.1, TP.HCM',        'Nữ'),
('NVP003', 'Lê Quốc Cường',      '0934567890', '079088003456', '1988-03-10', '78 Hai Bà Trưng, P. Tân Định, Q.1, TP.HCM',      'Nam'),
('NVP004', 'Phạm Thị Dung',      '0945678901', '079095004567', '1995-11-30', '23 Đinh Tiên Hoàng, P. Đa Kao, Q.1, TP.HCM',     'Nữ'),
('NVP005', 'Hoàng Minh Đức',     '0956789012', '079086005678', '1986-07-19', '56 Cách Mạng Tháng 8, P.6, Q.3, TP.HCM',         'Nam'),
('NVP006', 'Vũ Thị Hoa',         '0967890123', '079093006789', '1993-02-28', '89 Nguyễn Đình Chiểu, P.3, Q.3, TP.HCM',         'Nữ'),
('NVP007', 'Đặng Văn Hùng',      '0978901234', '079085007890', '1985-09-05', '34 Phan Văn Trị, P.5, Q. Bình Thạnh, TP.HCM',    'Nam'),
('NVP008', 'Bùi Thị Kim',        '0989012345', '079091008901', '1991-12-17', '67 Đinh Bộ Lĩnh, P.26, Q. Bình Thạnh, TP.HCM',   'Nữ'),
('NVP009', 'Ngô Văn Long',       '0990123456', '079083009012', '1983-04-25', '12 Bạch Đằng, P.24, Q. Bình Thạnh, TP.HCM',      'Nam'),
('NVP010', 'Lý Thị Mai',         '0901234567', '079097010123', '1997-06-08', '45 Nơ Trang Long, P.13, Q. Bình Thạnh, TP.HCM',  'Nữ');

-- ============================================================
-- CAN_BO
-- ============================================================
INSERT INTO CAN_BO (Ma_CanBo, HoTen, SoDienThoai, CanCuocCongDan, DiaChi, CapBac, DonViCongTac) VALUES
('CB001', 'Đại úy Trần Văn Minh',    '0911100001', '079080100001', '1 Đinh Tiên Hoàng, P. Đa Kao, Q.1, TP.HCM',            'Đại úy',     'Công an Quận Bình Thạnh'),
('CB002', 'Thượng úy Lê Thị Nga',    '0911100002', '079082100002', '2 Lý Tự Trọng, P. Bến Nghé, Q.1, TP.HCM',              'Thượng úy',  'Công an Quận Bình Thạnh'),
('CB003', 'Trung úy Phạm Quốc Bảo',  '0911100003', '079084100003', '3 Nam Kỳ Khởi Nghĩa, P. Phạm Ngũ Lão, Q.1, TP.HCM',   'Trung úy',   'Công an Quận Bình Thạnh'),
('CB004', 'Thiếu úy Hoàng Thị Cẩm',  '0911100004', '079086100004', '4 Trần Hưng Đạo, P. Phạm Ngũ Lão, Q.1, TP.HCM',       'Thiếu úy',   'Công an Quận Bình Thạnh'),
('CB005', 'Trung tá Nguyễn Hữu Lộc', '0911100005', '079078100005', '5 Lê Thánh Tôn, P. Bến Nghé, Q.1, TP.HCM',             'Trung tá',   'Công an Quận Bình Thạnh');

-- ============================================================
-- TAI_KHOAN
-- (MatKhauHash = SHA2 của 'Pass@12345' — trong thực tế ứng dụng tự hash)
-- ============================================================
INSERT INTO TAI_KHOAN (TenDangNhap, MatKhauHash, Salt, Email, Ma_Role, Ma_CanBo, TrangThai) VALUES
('admin_hq',    SHA2('Pass@12345_salt_a1', 256), 'salt_a1', 'admin_hq@cabt.gov.vn',     'ROLE01', 'CB005', 'Hoạt động'),
('tran.minh',   SHA2('Pass@12345_salt_b2', 256), 'salt_b2', 'tran.minh@cabt.gov.vn',    'ROLE02', 'CB001', 'Hoạt động'),
('le.nga',      SHA2('Pass@12345_salt_c3', 256), 'salt_c3', 'le.nga@cabt.gov.vn',        'ROLE02', 'CB002', 'Hoạt động'),
('pham.bao',    SHA2('Pass@12345_salt_d4', 256), 'salt_d4', 'pham.bao@cabt.gov.vn',      'ROLE02', 'CB003', 'Hoạt động'),
('hoang.cam',   SHA2('Pass@12345_salt_e5', 256), 'salt_e5', 'hoang.cam@cabt.gov.vn',     'ROLE02', 'CB004', 'Bị khóa');

-- ============================================================
-- VI_PHAM
-- Lưu ý: trigger trg_KiemTraBienSo_Insert kiểm tra định dạng biển số
--   Xe máy:                 99X9-999.99  (VD: 59X1-234.56)
--   Ô tô / xe tải / khách:  99X-999.99   (VD: 51A-123.45)
-- Trigger trg_KiemTraNongDoCon_Insert kiểm tra nồng độ nằm trong khoảng mức.
-- Trigger trg_KiemTraLoaiViPham_Insert kiểm tra LVP khớp LPT + MNDC.
-- ============================================================
INSERT INTO VI_PHAM
    (Ma_VuViec, ThoiGianViPham, DiaDiem, NongDoCon, BienSoXe,
     Ma_LoaiViPham, Ma_LoaiPhuongTien, Ma_MucNongDoCon,
     Ma_CanBo, Ma_NguoiViPham, Ma_TrangThaiThanhToan)
VALUES
-- NVP001 | Xe máy | MNDC01 (0.001-0.25) | LVP01
('VV0001', '2025-01-10 21:15:00', 'Ngã tư Đinh Bộ Lĩnh - Phan Đăng Lưu, Q. Bình Thạnh',
  0.15, '59X1-123.45', 'LVP01', 'LPT01', 'MNDC01', 'CB001', 'NVP001', 'TTTT02'),

-- NVP002 | Xe máy | MNDC02 (0.251-0.4) | LVP02
('VV0002', '2025-02-14 22:30:00', 'Đường Bạch Đằng, đoạn giao Xô Viết Nghệ Tĩnh, Q. Bình Thạnh',
  0.30, '51B2-456.78', 'LVP02', 'LPT01', 'MNDC02', 'CB002', 'NVP002', 'TTTT01'),

-- NVP003 | Ô tô | MNDC01 (0.001-0.25) | LVP04
('VV0003', '2025-02-20 23:00:00', 'Ngã tư Hàng Xanh, Q. Bình Thạnh',
  0.20, '51A-789.01', 'LVP04', 'LPT02', 'MNDC01', 'CB003', 'NVP003', 'TTTT02'),

-- NVP004 | Xe máy | MNDC03 (0.401-5.0) | LVP03
('VV0004', '2025-03-05 00:45:00', 'Đường Nơ Trang Long, P.13, Q. Bình Thạnh',
  0.55, '59C3-321.09', 'LVP03', 'LPT01', 'MNDC03', 'CB001', 'NVP004', 'TTTT03'),

-- NVP005 | Ô tô | MNDC02 (0.251-0.4) | LVP05
('VV0005', '2025-03-18 21:50:00', 'Cầu Bình Lợi, Q. Bình Thạnh',
  0.35, '51G-654.32', 'LVP05', 'LPT02', 'MNDC02', 'CB004', 'NVP005', 'TTTT01'),

-- NVP006 | Xe tải | MNDC01 (0.001-0.25) | LVP07
('VV0006', '2025-04-02 22:10:00', 'Đường Đinh Bộ Lĩnh, P.26, Q. Bình Thạnh',
  0.10, '51H-111.22', 'LVP07', 'LPT03', 'MNDC01', 'CB002', 'NVP006', 'TTTT02'),

-- NVP007 | Xe máy | MNDC02 (0.251-0.4) | LVP02
('VV0007', '2025-04-15 23:30:00', 'Giao lộ Phan Văn Trị - Đinh Bộ Lĩnh, Q. Bình Thạnh',
  0.28, '59D4-555.66', 'LVP02', 'LPT01', 'MNDC02', 'CB003', 'NVP007', 'TTTT01'),

-- NVP008 | Ô tô | MNDC03 (0.401-5.0) | LVP06
('VV0008', '2025-05-01 01:00:00', 'Đường Ung Văn Khiêm, Q. Bình Thạnh',
  0.80, '51K-222.33', 'LVP06', 'LPT02', 'MNDC03', 'CB001', 'NVP008', 'TTTT03'),

-- NVP009 | Xe khách | MNDC01 (0.001-0.25) | LVP10
('VV0009', '2025-05-10 20:20:00', 'Bến xe Miền Đông, Q. Bình Thạnh',
  0.18, '51P-333.44', 'LVP10', 'LPT04', 'MNDC01', 'CB005', 'NVP009', 'TTTT02'),

-- NVP010 | Xe máy | MNDC01 (0.001-0.25) | LVP01
('VV0010', '2025-06-20 22:00:00', 'Đường Xô Viết Nghệ Tĩnh, P.25, Q. Bình Thạnh',
  0.22, '59E5-777.88', 'LVP01', 'LPT01', 'MNDC01', 'CB004', 'NVP010', 'TTTT01'),

-- NVP001 lần 2 | Xe máy | MNDC03 | LVP03
('VV0011', '2025-07-04 00:10:00', 'Ngã ba Bình Triệu, Q. Bình Thạnh',
  1.20, '59X1-123.45', 'LVP03', 'LPT01', 'MNDC03', 'CB002', 'NVP001', 'TTTT03'),

-- NVP003 lần 2 | Ô tô | MNDC03 | LVP06
('VV0012', '2025-08-11 23:45:00', 'Cầu Sài Gòn, Q. Bình Thạnh',
  0.95, '51A-789.01', 'LVP06', 'LPT02', 'MNDC03', 'CB003', 'NVP003', 'TTTT01');

-- ============================================================
-- QUYET_DINH_XU_PHAT
-- SoTienPhat = 0 → trigger tự lấy MucPhat từ LOAI_VI_PHAM
-- ============================================================
INSERT INTO QUYET_DINH_XU_PHAT (Ma_VuViec, SoTienPhat, NgayRaQuyetDinh, NgayNopPhat, Ma_TrangThaiThanhToan)
VALUES
('VV0001', 0, '2025-01-11', '2025-01-25', 'TTTT02'),   -- đã TT
('VV0002', 0, '2025-02-15', NULL,          'TTTT01'),   -- chưa TT
('VV0003', 0, '2025-02-21', '2025-03-05', 'TTTT02'),   -- đã TT
('VV0004', 0, '2025-03-06', NULL,          'TTTT03'),   -- quá hạn
('VV0005', 0, '2025-03-19', NULL,          'TTTT01'),   -- chưa TT
('VV0006', 0, '2025-04-03', '2025-04-20', 'TTTT02'),   -- đã TT
('VV0007', 0, '2025-04-16', NULL,          'TTTT01'),   -- chưa TT
('VV0008', 0, '2025-05-02', NULL,          'TTTT03'),   -- quá hạn
('VV0009', 0, '2025-05-11', '2025-05-28', 'TTTT02'),   -- đã TT
('VV0010', 0, '2025-06-21', NULL,          'TTTT01'),   -- chưa TT
('VV0011', 0, '2025-07-05', NULL,          'TTTT03'),   -- quá hạn
('VV0012', 0, '2025-08-12', NULL,          'TTTT01');   -- chưa TT

-- ============================================================
-- LICH_SU_DANG_NHAP
-- ============================================================
INSERT INTO LICH_SU_DANG_NHAP (Ma_TaiKhoan, ThoiGian, KetQua, DiaChiIP) VALUES
(1, '2025-01-10 08:00:00', 'Thành công', '192.168.1.10'),
(2, '2025-01-10 08:05:00', 'Thành công', '192.168.1.11'),
(3, '2025-01-10 08:10:00', 'Thành công', '192.168.1.12'),
(2, '2025-02-14 20:00:00', 'Thành công', '192.168.1.11'),
(2, '2025-02-14 20:01:00', 'Thất bại',   '192.168.1.99'),
(4, '2025-03-05 07:55:00', 'Thành công', '192.168.1.13'),
(1, '2025-04-01 09:00:00', 'Thành công', '192.168.1.10'),
(3, '2025-05-01 21:45:00', 'Thành công', '192.168.1.12'),
(4, '2025-06-20 07:50:00', 'Thành công', '192.168.1.13'),
(2, '2025-07-04 07:30:00', 'Thất bại',   '10.0.0.55'),
(2, '2025-07-04 07:31:00', 'Thành công', '192.168.1.11'),
(1, '2025-08-11 08:15:00', 'Thành công', '192.168.1.10');