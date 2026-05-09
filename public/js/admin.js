function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
    event.currentTarget.classList.add('active');

    if (tabId === 'quanLyCanBo') loadOfficers();
    if (tabId === 'tongQuan') loadDashboard();
}

async function loadDashboard() {
    try {
        // Load stats
        const statsRes = await fetch('/admin/stats');
        const stats = await statsRes.json();
        document.getElementById('stat-violations').innerText = stats.totalViolations || 0;
        document.getElementById('stat-revenue').innerText = new Intl.NumberFormat('vi-VN').format(stats.totalRevenue || 0);
        document.getElementById('stat-officers').innerText = stats.totalOfficers || 0;

        // Load violations
        const res = await fetch('/vipham');
        const data = await res.json();
        const tbody = document.querySelector('#violationTable tbody');
        tbody.innerHTML = '';

        data.forEach(vp => {
            const tr = document.createElement('tr');
            let statusClass = 'badge-warning';
            if (vp.TenTrangThai === 'Đã thanh toán') statusClass = 'badge-success';
            if (vp.TenTrangThai === 'Quá hạn') statusClass = 'badge-danger';

            tr.innerHTML = `
                <td>${vp.Ma_VuViec}</td>
                <td>${vp.TenNguoiViPham}</td>
                <td>${vp.BienSoXe}</td>
                <td>${vp.NongDoCon}</td>
                <td>${new Intl.NumberFormat('vi-VN').format(vp.MucPhat || 0)}đ</td>
                <td><span class="badge ${statusClass}">${vp.TenTrangThai}</span></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Dashboard error:', error);
    }
}

async function loadOfficers() {
    try {
        const res = await fetch('/admin/can-bo');
        const data = await res.json();
        const tbody = document.querySelector('#officerTable tbody');
        tbody.innerHTML = '';

        data.forEach(cb => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cb.Ma_CanBo}</td>
                <td>${cb.HoTen}</td>
                <td>${cb.SoDienThoai}</td>
                <td>${cb.DonViCongTac}</td>
                <td><button class="btn btn-outline" style="padding: 4px 10px; font-size: 0.8rem; color: var(--danger); border-color: var(--danger);" onclick="deleteOfficer('${cb.Ma_CanBo}')">Xóa</button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Officer load error:', error);
    }
}

async function deleteOfficer(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa cán bộ này?')) return;
    const res = await fetch(`/admin/can-bo/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) loadOfficers();
}

document.addEventListener('DOMContentLoaded', loadDashboard);
