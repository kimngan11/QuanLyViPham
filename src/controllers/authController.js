const db = require("../config/db");
const crypto = require("crypto");

exports.login = (req, res) => {
    const { username, password } = req.body;
    const sql = `CALL sp_LayThongTinDangNhap(?, ?)`;
    
    db.query(sql, [username, '127.0.0.1'], (err, result) => {
        if (err) {
            console.log("Lỗi SQL:", err);
            return res.status(500).json({ message: "Lỗi server" });
        }
        
        const users = result[0];
        if (users && users.length > 0) {
            const user = users[0];
            
            let isMatch = false;
            if (user.Salt) {
                const inputHash = crypto.createHash('sha256').update(password + "_" + user.Salt).digest('hex');
                isMatch = (inputHash === user.MatKhauHash);
            } else {
                isMatch = (password === user.MatKhauHash);
            }

            if (isMatch) {
                res.json({ 
                    success: true, 
                    role: user.Role,
                    hoTen: user.HoTenCanBo,
                    maCanBo: user.Ma_CanBo
                });
            } else {
                res.status(401).json({ success: false, message: "Sai mật khẩu" });
            }
        } else {
            res.status(404).json({ success: false, message: "Tài khoản không tồn tại hoặc bị khóa" });
        }
    });
};
