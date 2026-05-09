let currentOfficerId = null;

async function openOfficerModal(id = null) {
    currentOfficerId = id;
    const modal = document.getElementById('officerModal');
    const title = document.getElementById('officerModalTitle');
    const form = document.getElementById('officerForm');

    if (modal) {
        modal.style.display = 'flex';
        form?.reset();

        if (id) {
            // EDIT MODE
            title.innerText = "Cập nhật thông tin cán bộ";
            try {
                const res = await fetch('/admin/can-bo');
                const officers = await res.json();
                const cb = officers.find(o => o.Ma_CanBo === id);
                if (cb) {
                    document.getElementById('of_MaCB').value = cb.Ma_CanBo;
                    document.getElementById('of_HoTen').value = cb.HoTen;
                    document.getElementById('of_CCCD').value = cb.CanCuocCongDan;
                    document.getElementById('of_SDT').value = cb.SoDienThoai;
                    document.getElementById('of_DiaChi').value = cb.DiaChi;
                    document.getElementById('of_CapBac').value = cb.CapBac;
                    document.getElementById('of_DonVi').value = cb.DonViCongTac;
                }
            } catch (e) { console.error(e); }
        } else {
            // ADD MODE
            title.innerText = "Thêm cán bộ mới";
            try {
                const res = await fetch('/admin/can-bo');
                const officers = await res.json();
                let nextId = "CB001";
                if (officers.length > 0) {
                    const ids = officers.map(o => parseInt(o.Ma_CanBo.replace('CB', ''))).filter(n => !isNaN(n));
                    const maxId = Math.max(...ids);
                    nextId = "CB" + (maxId + 1).toString().padStart(3, '0');
                }
                document.getElementById('of_MaCB').value = nextId;
            } catch (e) { console.error("Auto ID error:", e); }
        }
    }
}

function closeOfficerModal() {
    const modal = document.getElementById('officerModal');
    if (modal) modal.style.display = 'none';
}

async function saveOfficer() {
    const data = {
        Ma_CanBo: document.getElementById('of_MaCB').value,
        HoTen: document.getElementById('of_HoTen').value,
        CanCuocCongDan: document.getElementById('of_CCCD').value,
        SoDienThoai: document.getElementById('of_SDT').value,
        DiaChi: document.getElementById('of_DiaChi').value,
        CapBac: document.getElementById('of_CapBac').value,
        DonViCongTac: document.getElementById('of_DonVi').value
    };

    if (!data.Ma_CanBo || !data.HoTen || !data.CanCuocCongDan) return alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
    if (data.CanCuocCongDan.length !== 12) return alert("Số CCCD phải đủ 12 chữ số!");

    try {
        const res = await fetch('/admin/can-bo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert("Thêm cán bộ thành công!");
            closeOfficerModal();
            loadOfficers();
            loadDashboard();
        } else {
            const err = await res.json();
            alert("Lỗi: " + (err.sqlMessage || err.message || "Không thể lưu"));
        }
    } catch (e) { alert("Lỗi kết nối!"); }
}

// Tab Switching logic
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    const targetTab = document.getElementById('tab-' + tabId);
    if (targetTab) targetTab.classList.add('active');

    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    if (tabId === 'tongQuan') loadDashboard();
    if (tabId === 'quanLyCanBo') loadOfficers();
    if (tabId === 'quanLyLoaiVP') loadLVP();
    if (tabId === 'quanLyTaiKhoan') loadAccounts();
    if (tabId === 'thongKeAdmin') loadDetailedStats();
}

async function loadDashboard() {
    try {
        const statsRes = await fetch('/admin/stats');
        const stats = await statsRes.json();

        document.getElementById('stat-violations').innerText = stats.totalViolations || 0;
        document.getElementById('stat-revenue').innerText = new Intl.NumberFormat('vi-VN').format(stats.totalRevenue || 0) + 'đ';
        document.getElementById('stat-officers').innerText = stats.totalOfficers || 0;
        document.getElementById('stat-violators').innerText = stats.totalViolators || 0;

        const res = await fetch('/vipham');
        const data = await res.json();
        const tbody = document.querySelector('#violationTable tbody');
        if (tbody) {
            tbody.innerHTML = '';
            data.slice(0, 10).forEach(vp => {
                tbody.innerHTML += `
                    <tr>
                        <td>${vp.Ma_VuViec}</td>
                        <td>${vp.TenNguoiViPham}</td>
                        <td>${vp.BienSoXe}</td>
                        <td>${vp.NongDoCon} mg/L</td>
                        <td>${new Intl.NumberFormat('vi-VN').format(vp.MucPhat || 0)}đ</td>
                        <td><span class="badge ${vp.TenTrangThai === 'Đã thanh toán' ? 'badge-success' : 'badge-warning'}">${vp.TenTrangThai}</span></td>
                    </tr>
                `;
            });
        }
    } catch (e) { console.error(e); }
}

async function loadOfficers() {
    try {
        const res = await fetch('/admin/can-bo');
        const data = await res.json();
        const tbody = document.querySelector('#officerTable tbody');
        if (tbody) {
            tbody.innerHTML = '';
            data.forEach(cb => {
                tbody.innerHTML += `
                    <tr>
                        <td>${cb.Ma_CanBo}</td>
                        <td>${cb.HoTen}</td>
                        <td>${cb.SoDienThoai}</td>
                        <td>${cb.CapBac}</td>
                        <td>${cb.DonViCongTac}</td>
                        <td>
                            <button class="btn btn-outline" style="padding: 2px 8px; font-size: 0.8rem;" onclick="viewOfficerDetails('${cb.Ma_CanBo}')">Xem</button>
                            <button class="btn btn-outline" style="padding: 2px 8px; font-size: 0.8rem; color: var(--primary);" onclick="openOfficerModal('${cb.Ma_CanBo}')">Sửa</button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (e) { console.error(e); }
}

async function viewOfficerDetails(id) {
    try {
        const res = await fetch('/admin/can-bo');
        const officers = await res.json();
        const cb = officers.find(o => o.Ma_CanBo === id);

        if (!cb) return alert("Không tìm thấy thông tin!");

        const content = document.getElementById('officerDetailsContent');
        content.innerHTML = `
            <div style="width: 150px; height: 180px; background: #f1f5f9; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 4rem;">👤</div>
            <div style="line-height: 2;">
                <p><b>Mã cán bộ:</b> ${cb.Ma_CanBo}</p>
                <p><b>Họ và tên:</b> <span style="color: var(--primary); font-weight: 700;">${cb.HoTen}</span></p>
                <p><b>Số CCCD:</b> ${cb.CanCuocCongDan}</p>
                <p><b>Số điện thoại:</b> ${cb.SoDienThoai}</p>
                <p><b>Cấp bậc:</b> ${cb.CapBac}</p>
                <p><b>Đơn vị:</b> ${cb.DonViCongTac}</p>
                <p><b>Địa chỉ:</b> ${cb.DiaChi}</p>
            </div>
        `;
        document.getElementById('officerDetailsModal').style.display = 'flex';
    } catch (e) { console.error(e); }
}

async function loadAccounts() {
    try {
        const res = await fetch('/admin/tai-khoan');
        const data = await res.json();
        const tbody = document.getElementById('accountTableBody');
        if (tbody) {
            tbody.innerHTML = '';
            data.forEach(tk => {
                const isActive = tk.TrangThai === 'Hoạt động';
                tbody.innerHTML += `
                    <tr>
                        <td>${tk.TenDangNhap}</td>
                        <td>${tk.HoTenCanBo || '---'}</td>
                        <td><span class="badge ${tk.TenRole === 'Admin' ? 'badge-danger' : 'badge-primary'}">${tk.TenRole}</span></td>
                        <td><span class="status-indicator ${isActive ? 'status-online' : 'status-offline'}"></span> ${tk.TrangThai}</td>
                        <td>
                            <button class="btn btn-outline" 
                                style="padding: 2px 8px; font-size: 0.8rem; color: ${tk.TenRole === 'Admin' ? '#cbd5e1' : (isActive ? 'var(--danger)' : 'var(--success)')}; 
                                cursor: ${tk.TenRole === 'Admin' ? 'not-allowed' : 'pointer'};" 
                                onclick="toggleAccountStatus(${tk.Ma_TaiKhoan}, '${isActive ? 'Bị khóa' : 'Hoạt động'}', '${tk.TenRole}')">
                                ${isActive ? 'Khóa' : 'Mở khóa'}
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (e) { console.error(e); }
}

// Account Modal Logic (3.8.2.c)
async function openAccountModal() {
    const modal = document.getElementById('accountModal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('accountForm')?.reset();

        // Load officers without accounts
        const res = await fetch('/admin/can-bo-chua-tk');
        const officers = await res.json();
        const select = document.getElementById('ac_MaCB');
        select.innerHTML = officers.map(o => `<option value="${o.Ma_CanBo}">${o.HoTen} (${o.Ma_CanBo})</option>`).join('');
        if (officers.length === 0) select.innerHTML = '<option disabled>Tất cả cán bộ đã có tài khoản</option>';
    }
}

function closeAccountModal() {
    document.getElementById('accountModal').style.display = 'none';
}

function handleApiError(err) {
    let msg = "Đã có lỗi xảy ra!";
    if (err.sqlMessage) {
        if (err.sqlMessage.includes("uq_cb_sdt")) msg = "Số điện thoại này đã được sử dụng bởi một cán bộ khác!";
        else if (err.sqlMessage.includes("uq_cb_cccd")) msg = "Số CCCD này đã tồn tại trong hệ thống!";
        else if (err.sqlMessage.includes("uq_tk_tendangnhap")) msg = "Tên đăng nhập này đã có người sử dụng!";
        else if (err.sqlMessage.includes("uq_tk_email")) msg = "Email này đã được đăng ký tài khoản!";
        else if (err.sqlMessage.includes("uq_tk_canbo")) msg = "Cán bộ này đã được cấp tài khoản rồi!";
        else msg = "Lỗi dữ liệu: " + err.sqlMessage;
    } else {
        msg = err.message || msg;
    }
    alert("⚠️ " + msg);
}

async function saveOfficer() {
    const data = {
        Ma_CanBo: document.getElementById('of_MaCB').value,
        HoTen: document.getElementById('of_HoTen').value,
        CanCuocCongDan: document.getElementById('of_CCCD').value,
        SoDienThoai: document.getElementById('of_SDT').value,
        DiaChi: document.getElementById('of_DiaChi').value,
        CapBac: document.getElementById('of_CapBac').value,
        DonViCongTac: document.getElementById('of_DonVi').value
    };

    if (!data.HoTen || !data.CanCuocCongDan || !data.SoDienThoai) return alert("Vui lòng nhập đầy đủ các trường bắt buộc (*)");
    if (data.CanCuocCongDan.length !== 12) return alert("Số CCCD phải chính xác 12 chữ số!");

    const url = currentOfficerId ? `/admin/can-bo/${currentOfficerId}` : '/admin/can-bo';
    const method = currentOfficerId ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert(currentOfficerId ? "Cập nhật thành công!" : "Thêm cán bộ thành công!");
            closeOfficerModal();
            loadOfficers();
            loadDashboard();
        } else {
            const err = await res.json();
            handleApiError(err);
        }
    } catch (e) { alert("Lỗi kết nối máy chủ!"); }
}

async function saveAccount() {
    const data = {
        Ma_CanBo: document.getElementById('ac_MaCB').value,
        TenDangNhap: document.getElementById('ac_Username').value,
        Email: document.getElementById('ac_Email').value,
        MatKhauHash: document.getElementById('ac_Password').value,
        Ma_Role: document.getElementById('ac_Role').value
    };

    if (!data.Ma_CanBo || !data.TenDangNhap || !data.Email) return alert("Vui lòng nhập đầy đủ thông tin!");
    if (data.TenDangNhap.length < 5) return alert("Tên đăng nhập phải có ít nhất 5 ký tự!");

    try {
        const res = await fetch('/admin/tai-khoan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert("Cấp tài khoản thành công!");
            closeAccountModal();
            loadAccounts();
        } else {
            const err = await res.json();
            handleApiError(err);
        }
    } catch (e) { alert("Lỗi kết nối máy chủ!"); }
}

async function toggleAccountStatus(id, newStatus, role) {
    if (role === 'Admin') {
        return alert("Không thể khóa tài khoản Quản trị viên!");
    }
    if (!confirm(`Bạn có chắc muốn ${newStatus === 'Bị khóa' ? 'khóa' : 'mở khóa'} tài khoản này?`)) return;

    try {
        const res = await fetch('/admin/tai-khoan/toggle', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Ma_TaiKhoan: id, TrangThai: newStatus })
        });

        if (res.ok) {
            loadAccounts();
        } else {
            alert("Lỗi khi cập nhật trạng thái");
        }
    } catch (e) { console.error(e); }
}

async function loadLVP() {
    try {
        const res = await fetch('/vipham/loai-vi-pham');
        const data = await res.json();
        const tbody = document.querySelector('#lvpTable tbody');
        if (tbody && Array.isArray(data)) {
            tbody.innerHTML = '';
            data.forEach(l => {
                tbody.innerHTML += `
                    <tr>
                        <td>${l.Ma_LoaiViPham}</td>
                        <td>${l.TenLoaiViPham}</td>
                        <td>${l.TenPhuongTien}</td>
                        <td>${l.KhoangGiaTri}</td>
                        <td><b>${new Intl.NumberFormat('vi-VN').format(l.MucPhat)}đ</b></td>
                        <td><button class="btn btn-outline" style="padding: 2px 8px; font-size: 0.8rem;" 
                            onclick="openLVPModal('${l.Ma_LoaiViPham}', '${l.TenLoaiViPham}', ${l.MucPhat})">Cập nhật</button></td>
                    </tr>
                `;
            });
        }
    } catch (e) { console.error(e); }
}

let currentLVPId = null;

function openLVPModal(id, name, oldPrice) {
    currentLVPId = id;
    document.getElementById('lvp_Info').innerText = `Loại: ${name}`;
    document.getElementById('lvp_NewPhat').value = oldPrice;
    document.getElementById('lvpModal').style.display = 'flex';
}

async function saveLVP() {
    const newPrice = document.getElementById('lvp_NewPhat').value;
    if (!newPrice) return alert("Vui lòng nhập mức phạt!");

    try {
        const res = await fetch(`/vipham/loai-vi-pham/${currentLVPId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ MucPhat: newPrice })
        });

        if (res.ok) {
            alert("Cập nhật mức phạt thành công!");
            document.getElementById('lvpModal').style.display = 'none';
            loadLVP();
        } else {
            alert("Lỗi khi cập nhật");
        }
    } catch (e) { console.error(e); }
}

async function loadDetailedStats() {
    let thang = document.getElementById('reportMonth').value;
    let nam = document.getElementById('reportYear').value;

    // Set default if empty
    if (!thang) {
        const d = new Date();
        thang = d.getMonth() + 1;
        nam = d.getFullYear();
        document.getElementById('reportMonth').value = thang;
        document.getElementById('reportYear').value = nam;
    }

    try {
        const res = await fetch(`/vipham/thong-ke?month=${thang}&year=${nam}`);
        const result = await res.json();

        // Update Summary
        document.getElementById('month-total-vuviec').innerText = result.stats.totalVuViec;
        document.getElementById('month-total-money').innerText = new Intl.NumberFormat('vi-VN').format(result.stats.totalMoney) + 'đ';

        // Update Table
        const tbody = document.getElementById('reportTableBody');
        if (tbody) {
            tbody.innerHTML = '';
            if (result.list.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color: #94a3b8;">Không có dữ liệu vi phạm trong tháng này</td></tr>';
            } else {
                result.list.forEach(v => {
                    tbody.innerHTML += `
                        <tr>
                            <td>${v.Ma_VuViec}</td>
                            <td><b>${v.HoTen}</b></td>
                            <td>${new Date(v.ThoiGianViPham).toLocaleString('vi-VN')}</td>
                            <td>${new Intl.NumberFormat('vi-VN').format(v.MucPhat)}đ</td>
                            <td><span class="badge ${v.TenTrangThai === 'Đã thanh toán' ? 'badge-success' : 'badge-danger'}">${v.TenTrangThai}</span></td>
                        </tr>
                    `;
                });
            }
        }
    } catch (e) { console.error("Report error:", e); }
}

async function exportReport() {
    const violations = document.getElementById('stat-violations').innerText;
    const officers = document.getElementById('stat-officers').innerText;
    const violators = document.getElementById('stat-violators').innerText;
    const revenue = document.getElementById('stat-revenue').innerText;

    const element = document.createElement('div');
    element.style.padding = '40px';
    element.style.fontFamily = 'Arial, sans-serif';

    element.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="text-transform: uppercase; color: #1e3a8a;">Báo cáo thống kê vi phạm nồng độ cồn</h1>
            <p>Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')}</p>
        </div>
        <div style="margin-bottom: 30px; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
            <h3 style="border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">1. Số liệu tổng quan</h3>
            <p>• Tổng số vụ vi phạm: <b>${violations}</b></p>
            <p>• Tổng số cán bộ đang hoạt động: <b>${officers}</b></p>
            <p>• Tổng số người vi phạm trong hồ sơ: <b>${violators}</b></p>
            <p>• Tổng doanh thu tiền phạt: <b style="color: #059669;">${revenue}</b></p>
        </div>
        <div style="margin-bottom: 30px;">
            <h3 style="border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">2. Phân tích chi tiết</h3>
            <p>Dựa trên dữ liệu hệ thống, cơ cấu vi phạm tập trung chủ yếu vào loại phương tiện Xe máy (chiếm hơn 70%). Các điểm nóng vi phạm thường xuyên xuất hiện tại các khu vực cửa ngõ thành phố.</p>
        </div>
        <div style="margin-top: 50px; text-align: right;">
            <p>Người lập báo cáo</p>
            <p style="margin-top: 60px;"><b>Quản trị viên Hệ thống</b></p>
        </div>
    `;

    const opt = {
        margin: 10,
        filename: 'BaoCaoThongKe_ViPham.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}

document.addEventListener('DOMContentLoaded', loadDashboard);
