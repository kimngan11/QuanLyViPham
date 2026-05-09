// Init User Info
document.getElementById('displayUserName').innerText = localStorage.getItem('userName') || 'Cán bộ';

// Metadata
async function loadMetadata() {
    try {
        const ptRes = await fetch('/vipham/loai-phuong-tien');
        const pts = await ptRes.json();
        const ptSelect = document.getElementById('lb_LoaiPT');
        if (ptSelect) {
            ptSelect.innerHTML = '';
            pts.forEach(p => ptSelect.innerHTML += `<option value="${p.Ma_LoaiPhuongTien}">${p.TenPhuongTien}</option>`);
        }
    } catch (e) { console.error("Metadata error:", e); }
}
loadMetadata();

// Tab switching
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    const targetTab = document.getElementById('tab-' + tabId);
    if (targetTab) targetTab.classList.add('active');

    if (event && event.currentTarget) event.currentTarget.classList.add('active');

    if (tabId === 'nguoiViPham') loadNguoiViPham();
    if (tabId === 'traCuuQD' || tabId === 'thanhToan') loadQuyetDinh();
    if (tabId === 'thongKe') loadThongKe();
}

// 4.3.2: Quản lý người vi phạm - SEARCH & PAGINATION
let allNvp = [];
let filteredNvp = [];

async function loadNguoiViPham() {
    try {
        const res = await fetch('/vipham/nguoi-vi-pham');
        allNvp = await res.json();
        filteredNvp = [...allNvp];
        renderNvpTable(1);
    } catch (e) { console.error(e); }
}

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
    if (!tbody) return;
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
    if (page > 1) controls += `<button class="btn btn-outline" onclick="renderNvpTable(${page - 1})">Trước</button> `;
    if (page < totalPages) controls += `<button class="btn btn-outline" onclick="renderNvpTable(${page + 1})">Sau</button>`;
    document.getElementById('pagination-controls').innerHTML = controls;
}

function handleApiError(err) {
    let msg = "Đã có lỗi xảy ra!";
    if (err.sqlMessage) {
        if (err.sqlMessage.includes("uq_nvp_cccd")) msg = "Số CCCD này đã tồn tại với tên người vi phạm khác!";
        else msg = "Lỗi dữ liệu: " + err.sqlMessage;
    } else {
        msg = err.message || msg;
    }
    alert("⚠️ " + msg);
}

// 4.3.4: Lập biên bản - SUBMIT & VALIDATION
async function submitForm() {
    const hoTen = document.getElementById('lb_HoTen').value;
    const cccd = document.getElementById('lb_CCCD').value;
    const sdt = document.getElementById('lb_SDT').value;
    const nongDo = parseFloat(document.getElementById('lb_NongDo').value);
    const loaiPT = document.getElementById('lb_LoaiPT').value;
    const bienSo = document.getElementById('lb_BienSo').value;
    const ngaySinh = document.getElementById('lb_NgaySinh').value;
    const diaChi = document.getElementById('lb_DiaChi').value;

    if (!hoTen) return alert("⚠️ Vui lòng nhập Họ tên người vi phạm!");
    if (!cccd || cccd.length !== 12) return alert("⚠️ Số CCCD phải nhập chính xác 12 chữ số!");
    if (!sdt || !/^(0[0-9]{9})$/.test(sdt)) return alert("⚠️ Số điện thoại không hợp lệ (phải có 10 số và bắt đầu bằng số 0)!");
    if (isNaN(nongDo) || nongDo < 0) return alert("⚠️ Nồng độ cồn không hợp lệ!");
    if (!bienSo) return alert("⚠️ Vui lòng nhập Biển số xe!");
    if (!ngaySinh) return alert("⚠️ Vui lòng nhập Ngày sinh!");
    if (!diaChi) return alert("⚠️ Vui lòng nhập Địa chỉ!");

    let maLVP = (loaiPT === 'LPT01') ? (nongDo <= 0.25 ? 'LVP01' : (nongDo <= 0.4 ? 'LVP02' : 'LVP03')) : (nongDo <= 0.25 ? 'LVP04' : (nongDo <= 0.4 ? 'LVP05' : 'LVP06'));

    const data = {
        nguoiViPham: {
            Ma_NguoiViPham: 'NVP' + Date.now().toString().slice(-7),
            HoTen: hoTen,
            SoDienThoai: sdt,
            CanCuocCongDan: cccd,
            NgaySinh: ngaySinh,
            DiaChi: diaChi,
            GioiTinh: document.getElementById('lb_GioiTinh').value
        },
        viPham: {
            Ma_VuViec: 'VV' + Date.now().toString().slice(-7),
            ThoiGianViPham: new Date().toISOString().slice(0, 19).replace('T', ' '),
            DiaDiem: document.getElementById('lb_DiaDiem').value || 'Chốt CSGT',
            NongDoCon: nongDo,
            BienSoXe: bienSo,
            Ma_LoaiViPham: maLVP,
            Ma_LoaiPhuongTien: loaiPT,
            Ma_MucNongDoCon: nongDo <= 0.25 ? 'MNDC01' : (nongDo <= 0.4 ? 'MNDC02' : 'MNDC03'),
            Ma_CanBo: localStorage.getItem('maCanBo') || 'CB001'
        }
    };

    try {
        const res = await fetch('/vipham/lap-bien-ban', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (res.ok) {
            alert('Lưu biên bản thành công!');
            resetForm();
            showTab('nguoiViPham');
        } else {
            handleApiError(result);
        }
    } catch (e) { alert('Lỗi kết nối hoặc dữ liệu không hợp lệ!'); }
}

async function loadQuyetDinh() {
    const kwQD = document.getElementById('searchQdKeyword')?.value.toLowerCase().trim() || "";
    const kwTT = document.getElementById('searchPaymentKeyword')?.value.toLowerCase().trim() || "";

    try {
        const res = await fetch('/vipham/quyet-dinh');
        let allData = await res.json();

        // 1. Table Ra Quyết định
        let dataQD = allData;
        if (kwQD) {
            dataQD = dataQD.filter(q =>
                (q.Ma_QuyetDinh && q.Ma_QuyetDinh.toString().includes(kwQD)) ||
                (q.CanCuocCongDan && q.CanCuocCongDan.includes(kwQD)) ||
                (q.BienSoXe && q.BienSoXe.toLowerCase().includes(kwQD)) ||
                (q.Ma_VuViec && q.Ma_VuViec.toLowerCase().includes(kwQD))
            );
        }

        const qdTbody = document.querySelector('#qdTable tbody');
        if (qdTbody) {
            qdTbody.innerHTML = '';
            dataQD.forEach(q => {
                const hasQD = !!q.Ma_QuyetDinh;
                const displayFine = hasQD ? q.SoTienPhat : q.MucPhat;
                qdTbody.innerHTML += `
                    <tr>
                        <td><b>${q.Ma_VuViec}</b></td>
                        <td>${q.TenNguoiViPham}</td>
                        <td>${q.BienSoXe}</td>
                        <td><b style="color:var(--danger)">${new Intl.NumberFormat('vi-VN').format(displayFine)}đ</b></td>
                        <td>${q.Ma_QuyetDinh || '---'}</td>
                        <td><span class="badge ${hasQD ? 'badge-success' : 'badge-warning'}">${q.TenTrangThai}</span></td>
                        <td>
                            <div style="display: flex; gap: 5px;">
                                ${hasQD
                        ? `<button class="btn btn-outline" style="padding: 2px 8px; font-size: 0.75rem;" onclick="printDecision(${q.Ma_QuyetDinh})">In QĐ</button>`
                        : `
                                        <button class="btn btn-outline" style="padding: 2px 8px; font-size: 0.75rem; border-color: #f59e0b; color: #d97706;" 
                                            onclick='openEditViolation(${JSON.stringify(q)})'>Sửa</button>
                                        <button class="btn btn-primary" style="padding: 2px 8px; font-size: 0.75rem;" onclick="issueDecision('${q.Ma_VuViec}', ${q.MucPhat})">⚖️ Ra QĐ</button>
                                      `
                    }
                            </div>
                        </td>
                    </tr>
                `;
            });
        }

        // 2. Table Thanh toán
        const statusFilter = document.getElementById('filterPaymentStatus')?.value || "all";
        let dataTT = allData.filter(q => q.Ma_QuyetDinh);

        if (statusFilter !== "all") {
            dataTT = dataTT.filter(q => q.Ma_TrangThaiThanhToan === statusFilter);
        }

        if (kwTT) {
            dataTT = dataTT.filter(q =>
                (q.Ma_QuyetDinh && q.Ma_QuyetDinh.toString().includes(kwTT)) ||
                (q.TenNguoiViPham && q.TenNguoiViPham.toLowerCase().includes(kwTT)) ||
                (q.CanCuocCongDan && q.CanCuocCongDan.includes(kwTT))
            );
        }

        const ttTbody = document.querySelector('#thanhToanTable tbody');
        if (ttTbody) {
            ttTbody.innerHTML = '';
            dataTT.forEach(q => {
                ttTbody.innerHTML += `
                    <tr>
                        <td><b>${q.Ma_QuyetDinh}</b></td>
                        <td>${q.Ma_VuViec}</td>
                        <td>${q.TenNguoiViPham}</td>
                        <td>Vi phạm nồng độ cồn</td>
                        <td><b style="color:var(--success)">${new Intl.NumberFormat('vi-VN').format(q.SoTienPhat)}đ</b></td>
                        <td>${new Date(q.ThoiGianViPham).toLocaleDateString('vi-VN')}</td>
                        <td><span class="badge ${q.Ma_TrangThaiThanhToan === 'TTTT02' ? 'badge-success' :
                        (q.Ma_TrangThaiThanhToan === 'TTTT03' ? 'badge-danger' : 'badge-warning')
                    }">${q.TenTrangThai}</span></td>
                        <td>
                            ${q.Ma_TrangThaiThanhToan !== 'TTTT02'
                        ? `<button class="btn btn-primary" style="padding: 2px 8px; font-size: 0.75rem;" onclick="updatePayment(${q.Ma_QuyetDinh})">Xác nhận</button>`
                        : '<span style="color:var(--success)">Xong</span>'}
                        </td>
                    </tr>
                `;
            });
        }
    } catch (e) { console.error("Load Decision Error:", e); }
}

async function issueDecision(maVuViec, mucPhat) {
    if (!confirm("Bạn có chắc chắn muốn Ra quyết định xử phạt cho vụ việc này?")) return;

    const data = {
        NgayRaQuyetDinh: new Date().toISOString().slice(0, 10),
        SoTienPhat: mucPhat,
        Ma_VuViec: maVuViec,
        Ma_TrangThaiThanhToan: 'TTTT01'
    };

    try {
        const res = await fetch('/vipham/quyet-dinh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert("✅ Đã ra quyết định xử phạt thành công!");
            loadQuyetDinh();
        } else {
            alert("❌ Lỗi khi ra quyết định!");
        }
    } catch (e) { console.error(e); }
}

async function printDecision(id) {
    const res = await fetch('/vipham/quyet-dinh');
    const allData = await res.json();
    const q = allData.find(item => item.Ma_QuyetDinh == id);
    if (!q) return alert("Không tìm thấy dữ liệu!");

    const element = document.createElement('div');
    element.style.padding = '40px';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.lineHeight = '1.6';
    element.style.color = '#000';

    element.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
            <p style="text-transform: uppercase; font-weight: bold; margin: 0;">Cộng hòa Xã hội Chủ nghĩa Việt Nam</p>
            <p style="font-weight: bold; margin: 0;">Độc lập - Tự do - Hạnh phúc</p>
            <p style="margin: 0;">-----------------------</p>
        </div>
        <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 20px; text-transform: uppercase; margin-bottom: 5px;">Quyết định xử phạt vi phạm hành chính</h1>
            <p>Số: ${q.Ma_QuyetDinh}/QĐ-XPVPHC</p>
        </div>
        <div style="margin-bottom: 20px;">
            <p>Căn cứ Luật Xử lý vi phạm hành chính ngày 20 tháng 06 năm 2012;</p>
            <p>Tôi: <b>${localStorage.getItem('userName') || 'Cán bộ xử lý'}</b> - Chức vụ: Cán bộ CSGT</p>
            <p>Đơn vị: Công an Quận Bình Thạnh</p>
        </div>
        <div style="margin-bottom: 30px;">
            <h3 style="text-transform: uppercase; font-size: 16px;">Quyết định xử phạt:</h3>
            <p>1. Họ và tên: <b>${q.TenNguoiViPham}</b></p>
            <p>2. Số CCCD: ${q.CanCuocCongDan}</p>
            <p>3. Hành vi vi phạm: <b>Điều khiển phương tiện khi nồng độ cồn vượt mức quy định</b></p>
            <p>4. Nồng độ cồn đo được: ${q.NongDoCon} mg/L khí thở</p>
            <p>5. Biển số xe: ${q.BienSoXe}</p>
            <p>6. Hình thức xử phạt: Phạt tiền</p>
            <p>7. Số tiền phạt: <b style="font-size: 18px; color: #d32f2f;">${new Intl.NumberFormat('vi-VN').format(q.SoTienPhat)} VNĐ</b></p>
        </div>
        <p>Quyết định này có hiệu lực kể từ ngày ký. Người vi phạm có trách nhiệm nộp phạt tại kho bạc nhà nước hoặc các điểm thu hộ trong vòng 10 ngày.</p>
        <div style="margin-top: 60px; display: flex; justify-content: flex-end;">
            <div style="text-align: center; width: 250px;">
                <p style="margin-bottom: 80px;"><b>NGƯỜI RA QUYẾT ĐỊNH</b><br>(Ký, ghi rõ họ tên)</p>
                <p><b>${localStorage.getItem('userName') || 'Cán bộ'}</b></p>
            </div>
        </div>
    `;

    const opt = {
        margin: 10,
        filename: `QuyetDinh_${q.Ma_QuyetDinh}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}

async function updatePayment(id) {
    if (!confirm('Xác nhận người dân đã nộp phạt cho Quyết định #' + id + '?')) return;
    try {
        const res = await fetch('/vipham/thanh-toan', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Ma_QuyetDinh: id,
                NgayNopPhat: new Date().toISOString().split('T')[0]
            })
        });

        if (res.ok) {
            alert("Xác nhận thanh toán thành công!");
            loadQuyetDinh();
        } else {
            const err = await res.json();
            alert("Lỗi: " + (err.message || "Không thể cập nhật thanh toán"));
        }
    } catch (e) {
        console.error("Payment Update Error:", e);
        alert("Lỗi kết nối hệ thống!");
    }
}

async function loadThongKe() {
    try {
        const res = await fetch('/vipham');
        const allData = await res.json();

        // Filter by current officer
        const myId = localStorage.getItem('maCanBo');
        const data = allData.filter(v => v.Ma_CanBo === myId);

        const total = data.length;
        if (total === 0) {
            document.getElementById('tk_tongTien').innerText = '0đ';
            document.getElementById('tk_soVu').innerText = 'Chưa có vụ việc nào';
            document.getElementById('tk_hieuSuat').innerText = '0%';
            return;
        }

        const processed = data.filter(v => v.Ma_TrangThaiThanhToan === 'TTTT02').length;
        const totalRevenue = data.reduce((sum, v) => sum + Number(v.MucPhat || 0), 0);
        const xeMayCount = data.filter(v => v.Ma_LoaiPhuongTien === 'LPT01').length;
        const otoCount = total - xeMayCount;

        const perf = Math.round((processed / total) * 100);
        const xeMayPct = Math.round((xeMayCount / total) * 100);
        const otoPct = 100 - xeMayPct;

        document.getElementById('tk_hieuSuat').innerText = perf + '%';
        document.getElementById('tk_hieuSuatBar').style.width = perf + '%';
        document.getElementById('tk_tongTien').innerText = new Intl.NumberFormat('vi-VN').format(totalRevenue) + 'đ';
        document.getElementById('tk_soVu').innerText = `Đã xử lý ${processed}/${total} vụ việc`;
        document.getElementById('tk_xeMayVal').innerText = xeMayPct + '%';
        document.getElementById('tk_xeMayBar').style.width = xeMayPct + '%';
        document.getElementById('tk_otoVal').innerText = otoPct + '%';
        document.getElementById('tk_otoBar').style.width = otoPct + '%';

        // 3. Populate Detail Table
        const tbody = document.querySelector('#tk_detailTable tbody');
        if (tbody) {
            tbody.innerHTML = '';
            data.forEach(v => {
                tbody.innerHTML += `
                    <tr>
                        <td><b>${v.Ma_VuViec}</b></td>
                        <td>${new Date(v.ThoiGianViPham).toLocaleDateString('vi-VN')}</td>
                        <td>${v.TenNguoiViPham}</td>
                        <td>${v.BienSoXe}</td>
                        <td><b style="color:var(--danger)">${new Intl.NumberFormat('vi-VN').format(v.MucPhat)}đ</b></td>
                        <td><span class="badge ${v.Ma_TrangThaiThanhToan === 'TTTT02' ? 'badge-success' : 'badge-warning'}">${v.TenTrangThai}</span></td>
                    </tr>
                `;
            });
        }
    } catch (e) { console.error("Stats analysis error:", e); }
}

async function viewNvpDetails(id) {
    try {
        const res = await fetch(`/vipham/nguoi-vi-pham/${id}`);
        const data = await res.json();
        const content = document.getElementById('nvpDetailsContent');

        const birthDate = new Date(data.personal.NgaySinh);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        const violationCount = data.history.length;
        const totalFines = data.history.reduce((sum, h) => sum + Number(h.MucPhat || 0), 0);

        content.innerHTML = `
        <div style="display: flex; gap: 30px; margin-bottom: 30px; align-items: start;">
            <div style="width: 140px; height: 170px; background: #f8fafc; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 3.5rem; border: 2px solid var(--border); color: var(--text-muted);">👤</div>
            <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="font-size: 1.6rem; color: var(--primary); font-weight: 800;">${data.personal.HoTen}</h3>
                    <span class="badge ${violationCount > 1 ? 'badge-danger' : 'badge-warning'}" style="padding: 6px 12px;">${violationCount > 1 ? '⚠️ Đối tượng tái phạm' : '✓ Vi phạm lần đầu'}</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px 25px; font-size: 0.95rem; background: #fdfdfd; padding: 15px; border-radius: 10px; border: 1px dashed #e2e8f0;">
                    <p><b>Mã NV:</b> <span style="color: var(--text-main);">${data.personal.Ma_NguoiViPham}</span></p>
                    <p><b>CCCD:</b> <span style="color: var(--text-main);">${data.personal.CanCuocCongDan}</span></p>
                    <p><b>Tuổi:</b> <span style="color: var(--text-main);">${age} (${birthDate.toLocaleDateString('vi-VN')})</span></p>
                    <p><b>SĐT:</b> <span style="color: var(--text-main);">${data.personal.SoDienThoai}</span></p>
                    <p style="grid-column: span 2; border-top: 1px solid #f1f5f9; pt-10; margin-top: 5px;"><b>Địa chỉ:</b> <span style="color: var(--text-muted);">${data.personal.DiaChi}</span></p>
                </div>
                <div style="display: flex; gap: 20px; margin-top: 25px;">
                    <div style="text-align: center; flex: 1; padding: 12px; background: #fff1f2; border-radius: 10px;">
                        <small>Số vụ vi phạm</small><div style="font-size: 1.4rem; font-weight: 800; color: #be123c;">${violationCount}</div>
                    </div>
                    <div style="text-align: center; flex: 1; padding: 12px; background: #f0fdf4; border-radius: 10px;">
                        <small>Tổng tiền phạt</small><div style="font-size: 1.4rem; font-weight: 800; color: #15803d;">${new Intl.NumberFormat('vi-VN').format(totalFines)}đ</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="group-box">
            <div class="group-title">Lịch sử vi phạm</div>
            <table class="table">
                <thead><tr><th>Mã vụ</th><th>Thời gian</th><th>Lỗi</th><th>Tiền phạt</th><th>Trạng thái</th></tr></thead>
                <tbody>
                    ${data.history.map(h => `<tr><td>${h.Ma_VuViec}</td><td>${new Date(h.ThoiGianViPham).toLocaleDateString('vi-VN')}</td><td>${h.TenLoaiViPham}</td><td>${new Intl.NumberFormat('vi-VN').format(h.MucPhat)}đ</td><td>${h.TenTrangThai}</td></tr>`).join('')}
                </tbody>
            </table>
        </div>
    `;
        document.getElementById('nvpModal').style.display = 'block';
    } catch (e) { console.error(e); }
}

function closeModal() { document.getElementById('nvpModal').style.display = 'none'; }
function resetForm() {
    document.querySelectorAll('.tab-content input').forEach(i => i.value = '');
    document.getElementById('finePreviewBox').style.display = 'none';
}

// Auto-fill & Preview
async function checkCitizen() {
    const cccd = document.getElementById('lb_CCCD').value;
    if (!cccd) return;
    try {
        const res = await fetch('/vipham/nguoi-vi-pham');
        const citizens = await res.json();
        const found = citizens.find(c => c.CanCuocCongDan === cccd);
        if (found) {
            document.getElementById('lb_HoTen').value = found.HoTen;
            document.getElementById('lb_SDT').value = found.SoDienThoai;
            document.getElementById('lb_NgaySinh').value = new Date(found.NgaySinh).toISOString().split('T')[0];
            document.getElementById('lb_GioiTinh').value = found.GioiTinh;
            document.getElementById('lb_DiaChi').value = found.DiaChi;
        }
    } catch (e) { }
}

function previewFine() {
    const loaiPT = document.getElementById('lb_LoaiPT').value;
    const nongDo = parseFloat(document.getElementById('lb_NongDo').value);
    if (isNaN(nongDo) || nongDo <= 0) { document.getElementById('finePreviewBox').style.display = 'none'; return; }
    let amount = 0; let desc = "";
    if (loaiPT === 'LPT01') {
        if (nongDo <= 0.25) { amount = 2000000; desc = "Mức 1: ≤ 0.25 mg/L"; }
        else if (nongDo <= 0.4) { amount = 4000000; desc = "Mức 2: > 0.25 - 0.4 mg/L"; }
        else { amount = 8000000; desc = "Mức 3: > 0.4 mg/L"; }
    } else {
        if (nongDo <= 0.25) { amount = 7000000; desc = "Mức 1: ≤ 0.25 mg/L"; }
        else if (nongDo <= 0.4) { amount = 17000000; desc = "Mức 2: > 0.25 - 0.4 mg/L"; }
        else { amount = 35000000; desc = "Mức 3: > 0.4 mg/L"; }
    }
    document.getElementById('finePreviewBox').style.display = 'block';
    document.getElementById('fineAmount').innerText = new Intl.NumberFormat('vi-VN').format(amount) + "đ";
    document.getElementById('fineDesc').innerText = desc;
}


// 4.3.7: Sửa biên bản vi phạm
let currentEditingVehicleType = "";

function openEditViolation(q) {
    document.getElementById('edit_MaVuViec').value = q.Ma_VuViec;
    document.getElementById('edit_HoTen').value = q.TenNguoiViPham;
    document.getElementById('edit_NongDo').value = q.NongDoCon;
    document.getElementById('edit_DiaDiem').value = q.DiaDiem;
    document.getElementById('edit_BienSo').value = q.BienSoXe;
    currentEditingVehicleType = q.Ma_LoaiPhuongTien;

    previewEditFine();
    document.getElementById('editViolationModal').style.display = 'block';
}

function previewEditFine() {
    const nongDo = parseFloat(document.getElementById('edit_NongDo').value);
    if (isNaN(nongDo) || nongDo < 0) {
        document.getElementById('edit_FineAmount').innerText = "0đ";
        return;
    }

    let amount = 0;
    if (currentEditingVehicleType === 'LPT01') { // Xe máy
        if (nongDo <= 0.25) amount = 2000000;
        else if (nongDo <= 0.4) amount = 4000000;
        else amount = 8000000;
    } else { // Ô tô
        if (nongDo <= 0.25) amount = 7000000;
        else if (nongDo <= 0.4) amount = 17000000;
        else amount = 35000000;
    }
    document.getElementById('edit_FineAmount').innerText = new Intl.NumberFormat('vi-VN').format(amount) + "đ";
}

async function saveEditViolation() {
    const maVuViec = document.getElementById('edit_MaVuViec').value;
    const nongDo = parseFloat(document.getElementById('edit_NongDo').value);
    const diaDiem = document.getElementById('edit_DiaDiem').value;
    const bienSo = document.getElementById('edit_BienSo').value;

    if (isNaN(nongDo) || nongDo < 0) return alert("Nồng độ cồn không hợp lệ!");
    if (!diaDiem) return alert("Vui lòng nhập địa điểm!");
    if (!bienSo) return alert("Vui lòng nhập biển số xe!");

    // Calculate new categories
    let maLVP = (currentEditingVehicleType === 'LPT01')
        ? (nongDo <= 0.25 ? 'LVP01' : (nongDo <= 0.4 ? 'LVP02' : 'LVP03'))
        : (nongDo <= 0.25 ? 'LVP04' : (nongDo <= 0.4 ? 'LVP05' : 'LVP06'));

    let maMNDC = (nongDo <= 0.25 ? 'MNDC01' : (nongDo <= 0.4 ? 'MNDC02' : 'MNDC03'));

    const data = {
        NongDoCon: nongDo,
        DiaDiem: diaDiem,
        BienSoXe: bienSo,
        Ma_LoaiViPham: maLVP,
        Ma_MucNongDoCon: maMNDC
    };

    try {
        const res = await fetch(`/vipham/vi-pham/${maVuViec}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert("Cập nhật biên bản thành công!");
            document.getElementById('editViolationModal').style.display = 'none';
            loadQuyetDinh();
        } else {
            alert("Lỗi khi cập nhật!");
        }
    } catch (e) { console.error(e); }
}

document.addEventListener('DOMContentLoaded', () => {
    loadNguoiViPham();
    loadThongKe();
});
