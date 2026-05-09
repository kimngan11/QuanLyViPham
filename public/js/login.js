document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (result.success) {
            localStorage.setItem('userRole', result.role);
            localStorage.setItem('userName', result.hoTen);
            localStorage.setItem('maCanBo', result.maCanBo || 'CB001');

            if (result.role === 'Admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'officer.html';
            }
        } else {
            alert(result.message || 'Đăng nhập thất bại');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Có lỗi xảy ra khi kết nối server');
    }
});
