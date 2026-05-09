// Init User Info
document.getElementById('displayUserName').innerText = localStorage.getItem('userName') || 'Cán bộ';

// Metadata
async function loadMetadata() {
    try {
        const ptRes = await fetch('/vipham/loai-phuong-tien');
        const pts = await ptRes.json();
        const ptSelect = document.getElementById('lb_LoaiPT');
        ptSelect.innerHTML = '';
        pts.forEach(p => ptSelect.innerHTML += `<option value="${p.Ma_LoaiPhuongTien}">${p.TenPhuongTien}</option>`);
    } catch(e) { console.error("Metadata error:", e); }
}
loadMetadata();

// Tab switching
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
    if(event && event.currentTarget) event.currentTarget.classList.add('active');

    if (tabId === 'nguoiViPham') loadNguoiViPham();
    if (tabId === 'traCuuQD' || tabId === 'thanhToan') loadQuyetDinh();
    if (tabId === 'thongKe') loadThongKe();
}

// 4.3.2: Quản lý người vi phạm - FIXED SEARCH & PAGINATION
let allNvp = [];
let filteredNvp = [];

async function loadNguoiViPham() {
    try {
        const res = await fetch('/vipham/nguoi-vi-pham');
        allNvp = await res.json();
        filteredNvp = [...allNvp];
        renderNvpTable(1);
    } catch(e) { console.error(e); }
}

// Hàm tìm kiếm cho nút Tìm kiếm
function searchNvp() {
    const kw = document.getElementById('searchNvp').value.toLowerCase();
    filteredNvp = allNvp.filter(v => 
        (v.HoTen && v.HoTen.toLowerCase().includes(kw)) || 
        (v.CanCuocCongDan && v.CanCuocCongDan.includes(kw))
    );
    renderNvpTable(1);
}

function renderNvpTable(page) {
    const pageSize = 15;
    const start = (page - 1) * pageSize;
    const data = filteredNvp.slice(start, start + pageSize);
    const tbody = document.querySelector('#nvpTable tbody');
    if(!tbody) return;
    tbody.innerHTML = '';

    data.forEach((v, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${start + index + 1}</td>
                <td>${v.Ma_NguoiViPham}</td>
                <td>${v.HoTen}</td>
                <td>${v.CanCuocCongDan}</td>
                <td>${v.SoDienThoai}</td>
                <td>${new Date(v.NgaySinh).toLocaleDateString('vi-VN')}</td>
                <td>${v.DiaChi}</td>
                <td><button class="btn btn-primary" style="padding: 5px 10px; font-size: 0.8rem;" onclick="viewNvpDetails('${v.Ma_NguoiViPham}')">Xem chi tiết</button></td>
            </tr>
        `;
    });

    document.getElementById('pagination-info').innerText = `Kết quả: ${filteredNvp.length} | Trang ${page}`;
    const totalPages = Math.ceil(filteredNvp.length / pageSize);
    let controls = '';
    if(page > 1) controls += `<button class="btn btn-outline" onclick="renderNvpTable(${page-1})">Trước</button> `;
    if(page < totalPages) controls += `<button class="btn btn-outline" onclick="renderNvpTable(${page+1})">Sau</button>`;
    document.getElementById('pagination-controls').innerHTML = controls;
}

// 4.3.4: Lập biên bản - FIXED SUBMIT
async function submitForm() {
    const hoTen = document.getElementById('lb_HoTen').value;
    const cccd = document.getElementById('lb_CCCD').value;
    const nongDo = parseFloat(document.getElementById('lb_NongDo').value);
    const loaiPT = document.getElementById('lb_LoaiPT').value;
    const bienSo = document.getElementById('lb_BienSo').value;

    if(!hoTen || !cccd || isNaN(nongDo) || !bienSo) {
        alert("Vui lòng nhập đầy đủ các thông tin bắt buộc!");
        return;
    }

    let maLVP = (loaiPT === 'LPT01') ? (nongDo <= 0.25 ? 'LVP01' : (nongDo <= 0.4 ? 'LVP02' : 'LVP03')) : (nongDo <= 0.25 ? 'LVP04' : (nongDo <= 0.4 ? 'LVP05' : 'LVP06'));

    const data = {
        nguoiViPham: { Ma_NguoiViPham: 'NVP' + Date.now().toString().slice(-7), HoTen: hoTen, SoDienThoai: document.getElementById('lb_SDT').value, CanCuocCongDan: cccd, NgaySinh: document.getElementById('lb_NgaySinh').value || '1990-01-01', DiaChi: document.getElementById('lb_DiaChi').value, GioiTinh: document.getElementById('lb_GioiTinh').value },
        viPham: { Ma_VuViec: 'VV' + Date.now().toString().slice(-7), ThoiGianViPham: new Date().toISOString().slice(0, 19).replace('T', ' '), DiaDiem: document.getElementById('lb_DiaDiem').value || 'Chốt CSGT', NongDoCon: nongDo, BienSoXe: bienSo, Ma_LoaiViPham: maLVP, Ma_LoaiPhuongTien: loaiPT, Ma_MucNongDoCon: nongDo <= 0.25 ? 'MNDC01' : (nongDo <= 0.4 ? 'MNDC02' : 'MNDC03'), Ma_CanBo: localStorage.getItem('maCanBo') || 'CB001' }
    };

    try {
        const res = await fetch('/vipham/lap-bien-ban', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (res.ok && result.success) {
            alert('Lưu biên bản thành công!');
            resetForm();
            showTab('nguoiViPham');
        } else { 
            alert('Lỗi: ' + (result.message || 'Không thể lưu biên bản')); 
        }
    } catch(e) { 
        alert('Lỗi kết nối hoặc dữ liệu không hợp lệ!'); 
    }
}

// 4.3.3: Tra cứu quyết định - FIXED SEARCH
async function loadQuyetDinh() {
    const kw = document.getElementById('searchQdKeyword').value.toLowerCase();
    try {
        const res = await fetch('/vipham/quyet-dinh');
        let data = await res.json();
        
        if(kw) {
            data = data.filter(q => 
                q.Ma_QuyetDinh.toLowerCase().includes(kw) || 
                q.CanCuocCongDan.includes(kw) || 
                q.BienSoXe.toLowerCase().includes(kw)
            );
        }

        const qdTbody = document.querySelector('#qdTable tbody');
        if(qdTbody) {
            qdTbody.innerHTML = '';
            data.forEach(q => {
                qdTbody.innerHTML += `<tr><td>${q.Ma_QuyetDinh}</td><td>${q.TenNguoiViPham}</td><td>${q.CanCuocCongDan}</td><td>${q.BienSoXe}</td><td>${new Intl.NumberFormat('vi-VN').format(q.SoTienPhat)}đ</td><td>${q.TenTrangThai}</td><td>${q.NgayNopPhat ? new Date(q.NgayNopPhat).toLocaleDateString('vi-VN') : '---'}</td><td><button class="btn btn-outline" style="padding: 2px 8px; font-size: 0.75rem;">Chi tiết</button></td></tr>`;
            });
        }
        
        const ttTbody = document.querySelector('#thanhToanTable tbody');
        if(ttTbody) {
            ttTbody.innerHTML = '';
            data.forEach(q => {
                ttTbody.innerHTML += `<tr><td>${q.Ma_QuyetDinh}</td><td>${q.Ma_VuViec}</td><td>${q.TenNguoiViPham}</td><td>Vi phạm nồng độ cồn</td><td>${new Intl.NumberFormat('vi-VN').format(q.SoTienPhat)}đ</td><td>${new Date(q.NgayRaQuyetDinh).toLocaleDateString('vi-VN')}</td><td><span class="badge ${q.Ma_TrangThaiThanhToan === 'TTTT02' ? 'badge-success' : 'badge-warning'}">${q.TenTrangThai}</span></td><td>${q.Ma_TrangThaiThanhToan !== 'TTTT02' ? `<button class="btn btn-primary" style="padding: 2px 8px; font-size: 0.75rem;" onclick="updatePayment('${q.Ma_QuyetDinh}')">Xác nhận</button>` : '---'}</td></tr>`;
            });
        }
    } catch(e) { console.error(e); }
}

// 4.3.6: Thống kê (Phân tích Dashboard mới)
async function loadThongKe() {
    try {
        const res = await fetch('/vipham');
        const data = await res.json();
        
        const total = data.length;
        if(total === 0) return;

        const processed = data.filter(v => v.TenTrangThai === 'Đã thanh toán').length;
        const totalRevenue = data.reduce((sum, v) => sum + (v.TenTrangThai === 'Đã thanh toán' ? (v.MucPhat || 0) : 0), 0);
        
        const xeMayCount = data.filter(v => v.Ma_LoaiPhuongTien === 'LPT01').length;
        const otoCount = total - xeMayCount;

        // Tính %
        const perf = Math.round((processed / total) * 100);
        const xeMayPct = Math.round((xeMayCount / total) * 100);
        const otoPct = 100 - xeMayPct;

        // Cập nhật giao diện
        document.getElementById('tk_hieuSuat').innerText = perf + '%';
        document.getElementById('tk_hieuSuatBar').style.width = perf + '%';
        
        document.getElementById('tk_tongTien').innerText = new Intl.NumberFormat('vi-VN').format(totalRevenue) + 'đ';
        document.getElementById('tk_soVu').innerText = `Đã xử lý ${processed}/${total} vụ việc`;

        document.getElementById('tk_xeMayVal').innerText = xeMayPct + '%';
        document.getElementById('tk_xeMayBar').style.width = xeMayPct + '%';
        
        document.getElementById('tk_otoVal').innerText = otoPct + '%';
        document.getElementById('tk_otoBar').style.width = otoPct + '%';

    } catch(e) { console.error("Stats analysis error:", e); }
}

// Helper functions (Citizen check, Fine preview)
async function checkCitizen() {
    const cccd = document.getElementById('lb_CCCD').value;
    if(!cccd) return;
    try {
        const res = await fetch('/vipham/nguoi-vi-pham');
        const citizens = await res.json();
        const found = citizens.find(c => c.CanCuocCongDan === cccd);
        if(found) {
            document.getElementById('lb_HoTen').value = found.HoTen;
            document.getElementById('lb_SDT').value = found.SoDienThoai;
            document.getElementById('lb_NgaySinh').value = new Date(found.NgaySinh).toISOString().split('T')[0];
            document.getElementById('lb_GioiTinh').value = found.GioiTinh;
            document.getElementById('lb_DiaChi').value = found.DiaChi;
            document.getElementById('citizenStatus').style.display = 'block';
        } else { document.getElementById('citizenStatus').style.display = 'none'; }
    } catch(e) {}
}

function previewFine() {
    const loaiPT = document.getElementById('lb_LoaiPT').value;
    const nongDo = parseFloat(document.getElementById('lb_NongDo').value);
    if(isNaN(nongDo) || nongDo <= 0) { document.getElementById('finePreviewBox').style.display = 'none'; return; }
    let amount = 0; let desc = "";
    if(loaiPT === 'LPT01') {
        if(nongDo <= 0.25) { amount = 2000000; desc = "Mức 1: ≤ 0.25 mg/L"; }
        else if(nongDo <= 0.4) { amount = 4000000; desc = "Mức 2: > 0.25 - 0.4 mg/L"; }
        else { amount = 8000000; desc = "Mức 3: > 0.4 mg/L"; }
    } else {
        if(nongDo <= 0.25) { amount = 7000000; desc = "Mức 1: ≤ 0.25 mg/L"; }
        else if(nongDo <= 0.4) { amount = 17000000; desc = "Mức 2: > 0.25 - 0.4 mg/L"; }
        else { amount = 35000000; desc = "Mức 3: > 0.4 mg/L"; }
    }
    document.getElementById('finePreviewBox').style.display = 'block';
    document.getElementById('fineAmount').innerText = new Intl.NumberFormat('vi-VN').format(amount) + "đ";
    document.getElementById('fineDesc').innerText = desc;
}

function resetForm() { document.querySelectorAll('.tab-content input').forEach(i => i.value = ''); document.getElementById('finePreviewBox').style.display = 'none'; }
async function updatePayment(id) {
    if(!confirm('Xác nhận người dân đã nộp phạt?')) return;
    await fetch('/vipham/thanh-toan', { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ Ma_QuyetDinh: id }) });
    loadQuyetDinh();
}

async function viewNvpDetails(id) {
    const res = await fetch(`/vipham/nguoi-vi-pham/${id}`);
    const data = await res.json();
    const modal = document.getElementById('nvpModal');
    const content = document.getElementById('nvpDetailsContent');

    // Tính toán thêm thông tin
    const birthDate = new Date(data.personal.NgaySinh);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    const violationCount = data.history.length;
    const totalFines = data.history.reduce((sum, h) => sum + h.MucPhat, 0);

    content.innerHTML = `
        <div style="display: flex; gap: 30px; margin-bottom: 30px; align-items: start;">
            <div style="width: 140px; height: 170px; background: #f8fafc; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 3.5rem; border: 2px solid var(--border); color: var(--text-muted);">👤</div>
            <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="font-size: 1.6rem; color: var(--primary); font-weight: 800;">${data.personal.HoTen}</h3>
                    <span class="badge ${violationCount > 1 ? 'badge-danger' : 'badge-warning'}" style="padding: 6px 12px;">${violationCount > 1 ? '⚠️ Đối tượng tái phạm' : '✓ Vi phạm lần đầu'}</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 1rem; color: var(--text);">
                    <p><b>Mã hệ thống:</b> <span style="color: var(--primary);">${data.personal.Ma_NguoiViPham}</span></p>
                    <p><b>Số CCCD:</b> ${data.personal.CanCuocCongDan}</p>
                    <p><b>Giới tính:</b> ${data.personal.GioiTinh}</p>
                    <p><b>Tuổi:</b> ${age} tuổi (${birthDate.toLocaleDateString('vi-VN')})</p>
                    <p><b>Điện thoại:</b> ${data.personal.SoDienThoai}</p>
                    <p><b>Địa chỉ:</b> ${data.personal.DiaChi}</p>
                </div>
                <div style="display: flex; gap: 20px; margin-top: 25px; padding-top: 20px; border-top: 1px dashed var(--border);">
                    <div style="text-align: center; flex: 1; padding: 12px; background: #fff1f2; border-radius: 10px; border: 1px solid #fecdd3;">
                        <small style="color: #be123c; font-weight: 600; text-transform: uppercase; font-size: 0.7rem;">Số lần vi phạm</small>
                        <div style="font-size: 1.4rem; font-weight: 800; color: #be123c;">${violationCount}</div>
                    </div>
                    <div style="text-align: center; flex: 1; padding: 12px; background: #f0fdf4; border-radius: 10px; border: 1px solid #bbf7d0;">
                        <small style="color: #15803d; font-weight: 600; text-transform: uppercase; font-size: 0.7rem;">Tổng tiền phạt</small>
                        <div style="font-size: 1.4rem; font-weight: 800; color: #15803d;">${new Intl.NumberFormat('vi-VN').format(totalFines)}đ</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="group-box">
            <div class="group-title">📜 Lịch sử biên bản xử phạt</div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Mã vụ việc</th>
                        <th>Thời gian</th>
                        <th>Hành vi vi phạm</th>
                        <th>Số tiền phạt</th>
                        <th>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.history.map(h => `
                        <tr>
                            <td><b style="color: var(--primary);">${h.Ma_VuViec}</b></td>
                            <td>${new Date(h.ThoiGianViPham).toLocaleString('vi-VN')}</td>
                            <td>${h.TenLoaiViPham}</td>
                            <td><b style="color: var(--danger);">${new Intl.NumberFormat('vi-VN').format(h.MucPhat)}đ</b></td>
                            <td><span class="badge ${h.TenTrangThai === 'Đã thanh toán' ? 'badge-success' : 'badge-warning'}">${h.TenTrangThai}</span></td>
                        </tr>
                    `).join('')}
                    ${data.history.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding: 20px; color: var(--text-muted);">Chưa có lịch sử vi phạm</td></tr>' : ''}
                </tbody>
            </table>
        </div>
    `;
    document.getElementById('nvpModal').style.display = 'block';
}

function closeModal() { document.getElementById('nvpModal').style.display = 'none'; }

document.addEventListener('DOMContentLoaded', () => loadNguoiViPham());
