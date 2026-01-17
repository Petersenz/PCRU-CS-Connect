export type Language = 'th' | 'en';

export const translations = {
  th: {
    // Common
    'common.loading': 'กำลังโหลด...',
    'common.error': 'เกิดข้อผิดพลาด',
    'common.success': 'สำเร็จ',
    'common.cancel': 'ยกเลิก',
    'common.confirm': 'ยืนยัน',
    'common.save': 'บันทึก',
    'common.edit': 'แก้ไข',
    'common.delete': 'ลบ',
    'common.search': 'ค้นหา',
    'common.filter': 'กรอง',
    'common.sort': 'เรียงลำดับ',
    'common.view': 'ดู',
    'common.create': 'สร้าง',
    'common.update': 'อัปเดต',
    'common.submit': 'ส่ง',
    'common.back': 'กลับ',
    'common.next': 'ถัดไป',
    'common.previous': 'ก่อนหน้า',
    'common.close': 'ปิด',
    'common.open': 'เปิด',
    'common.yes': 'ใช่',
    'common.no': 'ไม่',

    // Navigation
    'nav.home': 'หน้าหลัก',
    'nav.questions': 'กระทู้คำถาม',
    'nav.popular': 'ยอดนิยม',
    'nav.create': 'สร้างกระทู้',
    'nav.profile': 'โปรไฟล์',
    'nav.admin': 'จัดการระบบ',
    'nav.login': 'เข้าสู่ระบบ',
    'nav.logout': 'ออกจากระบบ',

    // App
    'app.title': 'PCRU CS CONNECT',
    'app.subtitle': 'เชื่อมต่อและแบ่งปันความรู้ทางวิทยาการคอมพิวเตอร์',
    'app.description': 'แพลตฟอร์มแลกเปลี่ยนความรู้สำหรับนักศึกษาและอาจารย์ สาขาวิชาวิทยาการคอมพิวเตอร์ มหาวิทยาลัยราชภัฏเพชรบูรณ์',

    // Auth
    'auth.login.title': 'เข้าสู่ระบบ',
    'auth.login.subtitle': 'PCRU CS CONNECT มหาวิทยาลัยราชภัฏเพชรบูรณ์',
    'auth.login.userId': 'รหัสนักศึกษา/อาจารย์',
    'auth.login.password': 'รหัสผ่าน',
    'auth.login.forgotPassword': 'ลืมรหัสผ่าน?',
    'auth.login.submit': 'เข้าสู่ระบบ',
    'auth.login.error': 'รหัสผ่านหรือรหัสผู้ใช้ไม่ถูกต้อง',
    'auth.logout.success': 'ออกจากระบบเรียบร้อยแล้ว',

    // Reset Password
    'auth.reset.title': 'รีเซ็ตรหัสผ่าน',
    'auth.reset.subtitle': 'กรอกอีเมลเพื่อรับรหัสผ่านใหม่',
    'auth.reset.email': 'อีเมล',
    'auth.reset.submit': 'ส่งรหัสผ่านใหม่',
    'auth.reset.success': 'ส่งรหัสผ่านใหม่ไปยังอีเมลแล้ว',
    'auth.reset.error': 'ไม่พบอีเมลในระบบ',

    // Questions
    'questions.title': 'กระทู้คำถาม',
    'questions.create': 'สร้างกระทู้ใหม่',
    'questions.search.placeholder': 'ค้นหากระทู้...',
    'questions.filter.category': 'หมวดหมู่',
    'questions.filter.all': 'ทุกหมวดหมู่',
    'questions.empty': 'ไม่พบกระทู้',
    'questions.empty.description': 'ยังไม่มีกระทู้ในระบบ',
    'questions.views': 'ครั้ง',
    'questions.likes': 'ถูกใจ',
    'questions.comments': 'ความคิดเห็น',
    'questions.by': 'โดย',
    'questions.created': 'สร้างเมื่อ',

    // Create Question
    'questions.create.title': 'สร้างกระทู้ใหม่',
    'questions.create.form.title': 'หัวข้อกระทู้',
    'questions.create.form.title.placeholder': 'กรอกหัวข้อกระทู้...',
    'questions.create.form.content': 'เนื้อหา',
    'questions.create.form.content.placeholder': 'กรอกรายละเอียดคำถาม...',
    'questions.create.form.categories': 'หมวดหมู่',
    'questions.create.form.categories.placeholder': 'เลือกหมวดหมู่...',
    'questions.create.submit': 'สร้างกระทู้',
    'questions.create.success': 'สร้างกระทู้เรียบร้อยแล้ว',

    // Question Detail
    'question.detail.title': 'รายละเอียดกระทู้',
    'question.detail.like': 'ถูกใจ',
    'question.detail.unlike': 'เลิกถูกใจ',
    'question.detail.report': 'รายงาน',
    'question.detail.comments.title': 'ความคิดเห็น',
    'question.detail.comments.empty': 'ยังไม่มีความคิดเห็น',
    'question.detail.comments.add': 'เพิ่มความคิดเห็น',
    'question.detail.comments.placeholder': 'แสดงความคิดเห็น...',
    'question.detail.comments.submit': 'ส่งความคิดเห็น',

    // Admin
    'admin.title': 'จัดการระบบ',
    'admin.dashboard': 'แดชบอร์ด',
    'admin.users': 'จัดการผู้ใช้',
    'admin.categories': 'จัดการหมวดหมู่',
    'admin.reports': 'จัดการรายงาน',
    'admin.statistics': 'สถิติ',

    // Users Management
    'admin.users.title': 'จัดการผู้ใช้',
    'admin.users.create': 'เพิ่มผู้ใช้ใหม่',
    'admin.users.total': 'ผู้ใช้ทั้งหมด',
    'admin.users.students': 'นักศึกษา',
    'admin.users.teachers': 'อาจารย์',
    'admin.users.admins': 'ผู้ดูแลระบบ',

    // Categories Management
    'admin.categories.title': 'จัดการหมวดหมู่',
    'admin.categories.create': 'เพิ่มหมวดหมู่ใหม่',
    'admin.categories.name': 'ชื่อหมวดหมู่',
    'admin.categories.questions': 'จำนวนกระทู้',

    // Reports Management
    'admin.reports.title': 'จัดการรายงาน',
    'admin.reports.pending': 'รอดำเนินการ',
    'admin.reports.resolved': 'ดำเนินการแล้ว',
    'admin.reports.reason': 'เหตุผล',
    'admin.reports.reporter': 'ผู้รายงาน',
    'admin.reports.resolve': 'ดำเนินการ',

    // Statistics
    'admin.stats.users': 'ผู้ใช้ทั้งหมด',
    'admin.stats.questions': 'กระทู้ทั้งหมด',
    'admin.stats.comments': 'ความคิดเห็นทั้งหมด',
    'admin.stats.reports': 'รายงานที่รอดำเนินการ',

    // Roles
    'role.student': 'นักศึกษา',
    'role.teacher': 'อาจารย์',
    'role.admin': 'ผู้ดูแลระบบ',

    // Errors
    'error.unauthorized': 'ไม่มีสิทธิ์เข้าถึง',
    'error.notFound': 'ไม่พบข้อมูล',
    'error.serverError': 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์',
    'error.networkError': 'เกิดข้อผิดพลาดของเครือข่าย',
    'error.validation': 'ข้อมูลไม่ถูกต้อง',

    // Validation
    'validation.required': 'กรุณากรอกข้อมูล',
    'validation.email': 'รูปแบบอีเมลไม่ถูกต้อง',
    'validation.minLength': 'ต้องมีอย่างน้อย {min} ตัวอักษร',
    'validation.maxLength': 'ต้องมีไม่เกิน {max} ตัวอักษร',

    // Profile
    'profile.title': 'โปรไฟล์',
    'profile.edit': 'แก้ไขข้อมูล',
    'profile.changePassword': 'เปลี่ยนรหัสผ่าน',
    'profile.userId': 'รหัสผู้ใช้',
    'profile.email': 'อีเมล',
    'profile.fullName': 'ชื่อ-นามสกุล',
    'profile.joinedDate': 'วันที่เข้าร่วม',
    'profile.currentPassword': 'รหัสผ่านปัจจุบัน',
    'profile.newPassword': 'รหัสผ่านใหม่',
    'profile.confirmPassword': 'ยืนยันรหัสผ่านใหม่',
    'profile.stats': 'สถิติการใช้งาน',
    'profile.myPosts': 'กระทู้ของฉัน',
    'profile.myComments': 'ความคิดเห็น',
    'profile.myLikes': 'การกดถูกใจ',
    'profile.myReports': 'การรายงาน',
    'profile.noPosts': 'ยังไม่มีกระทู้',
    'profile.noComments': 'ยังไม่มีความคิดเห็น',
    'profile.noLikes': 'ยังไม่มีการกดถูกใจ',
    'profile.noReports': 'ยังไม่มีการรายงาน',
    'profile.createFirstPost': 'สร้างกระทู้แรก',
    'profile.postsCreated': 'กระทู้ที่สร้าง',
    'profile.commentsCount': 'ความคิดเห็น',
    'profile.repliedIn': 'ตอบในกระทู้',

    // Admin Dashboard
    'admin.dashboard.title': 'แดชบอร์ดผู้ดูแลระบบ',
    'admin.dashboard.subtitle': 'จัดการและควบคุมระบบคลังความรู้ PCRU CS CONNECT',
    'admin.dashboard.refresh': 'รีเฟรช',
    'admin.dashboard.totalUsers': 'ผู้ใช้ทั้งหมด',
    'admin.dashboard.totalQuestions': 'กระทู้ทั้งหมด',
    'admin.dashboard.totalComments': 'ความคิดเห็น',
    'admin.dashboard.pendingReports': 'รายงานรอดำเนินการ',
    'admin.dashboard.manageUsers': 'จัดการผู้ใช้',
    'admin.dashboard.manageUsers.desc': 'เพิ่ม แก้ไข หรือจัดการบทบาทผู้ใช้งาน',
    'admin.dashboard.manageCategories': 'จัดการหมวดหมู่',
    'admin.dashboard.manageCategories.desc': 'เพิ่ม แก้ไข หรือลบหมวดหมู่กระทู้',
    'admin.dashboard.manageReports': 'จัดการรายงาน',
    'admin.dashboard.manageReports.desc': 'ตรวจสอบและจัดการเนื้อหาที่ถูกรายงาน',
    'admin.dashboard.viewStatistics': 'รายงานสถิติ',
    'admin.dashboard.viewStatistics.desc': 'ดูสถิติและรายงานการใช้งานระบบ',
    'admin.dashboard.recentActivity': 'กิจกรรมล่าสุด',
    'admin.dashboard.systemStarted': 'ระบบเริ่มทำงานเรียบร้อยแล้ว',
    'admin.dashboard.adminLoggedIn': 'Admin เข้าสู่ระบบสำเร็จ',
    'admin.dashboard.justNow': 'เมื่อสักครู่',
    'admin.dashboard.checkingAuth': 'กำลังตรวจสอบสิทธิ์...',
    'admin.dashboard.noAccess': 'ไม่มีสิทธิ์เข้าถึง',
    'admin.dashboard.noAccessDesc': 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้',

    // Categories Management
    'admin.categories.addNew': 'เพิ่มหมวดหมู่ใหม่',
    'admin.categories.allCategories': 'รายการหมวดหมู่ทั้งหมด',
    'admin.categories.editCategory': 'แก้ไขหมวดหมู่',
    'admin.categories.categoryName': 'ชื่อหมวดหมู่',
    'admin.categories.categoryNamePlaceholder': 'เช่น Programming, Database',
    'admin.categories.deleteConfirm': 'ยืนยันการลบหมวดหมู่',
    'admin.categories.deleteMessage': 'คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่ "{name}"? หากมีกระทู้ใช้หมวดหมู่นี้อยู่ จะไม่สามารถลบได้',
    'admin.categories.deleteSuccess': 'ลบหมวดหมู่สำเร็จ',
    'admin.categories.editSuccess': 'แก้ไขหมวดหมู่สำเร็จ',
    'admin.categories.createSuccess': 'เพิ่มหมวดหมู่สำเร็จ',

    // Reports Management
    'admin.reports.manageReports': 'จัดการรายงาน',
    'admin.reports.allReports': 'ทั้งหมด',
    'admin.reports.spam': 'สแปม',
    'admin.reports.inappropriate': 'เนื้อหาไม่เหมาะสม',
    'admin.reports.offensive': 'ก้าวร้าว/หยาบคาย',
    'admin.reports.misleading': 'ข้อมูลเท็จ',
    'admin.reports.other': 'อื่นๆ',
    'admin.reports.reportedBy': 'รายงานโดย',
    'admin.reports.hideDelete': 'ซ่อน/ลบ',
    'admin.reports.reject': 'ปฏิเสธ',
    'admin.reports.confirmResolve': 'ยืนยันการดำเนินการ? เนื้อหาจะถูกซ่อน/ลบ',
    'admin.reports.confirmReject': 'ยืนยันการปฏิเสธรายงาน? เนื้อหาจะยังคงอยู่',
    'admin.reports.resolveSuccess': 'ดำเนินการสำเร็จ - เนื้อหาถูกซ่อนแล้ว',
    'admin.reports.rejectSuccess': 'ปฏิเสธรายงานสำเร็จ - เนื้อหายังคงอยู่',
    'admin.reports.noReports': 'ไม่มีรายงาน',
    'admin.reports.noPendingReports': 'ไม่มีรายงานที่รอดำเนินการ',
    'admin.reports.noReportsInCategory': 'ไม่มีรายงานในหมวดนี้',
    'admin.reports.question': 'กระทู้',
    'admin.reports.comment': 'ความคิดเห็น',

    // Statistics
    'admin.statistics.title': 'รายงานสถิติ',
    'admin.statistics.subtitle': 'ดูสถิติและรายงานการใช้งานระบบ',

    // Popular Page
    'popular.title': 'ยอดนิยม',
    'popular.mostViewed': 'ผู้เข้าชมมากที่สุด',
    'popular.mostCommented': 'การตอบกลับมากที่สุด',
    'popular.mostLiked': 'ถูกใจมากที่สุด',
    'popular.trending': 'กำลังมาแรง',
    'popular.noPopular': 'ยังไม่มีกระทู้ยอดนิยม',
    'popular.noPopularDesc': 'เริ่มสร้างกระทู้เพื่อแบ่งปันความรู้กันเถอะ!',

    // Home Page
    'home.sortBy': 'เรียงตาม',
    'home.latest': 'ล่าสุด',
    'home.oldest': 'เก่าสุด',
    'home.mostViewed': 'ยอดดูมากสุด',
    'home.popular': 'ยอดนิยม',
    'home.found': 'พบ',
    'home.questions': 'กระทู้',

    // Unauthorized
    'unauthorized.title': 'ไม่มีสิทธิ์เข้าถึง',
    'unauthorized.message': 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบหากคุณคิดว่านี่เป็นข้อผิดพลาด',

    // Users Management
    'admin.users.manage': 'จัดการผู้ใช้',
    'admin.users.description': 'เพิ่ม แก้ไข หรือลบผู้ใช้ในระบบ',
    'admin.users.downloadTemplate': 'ดาวน์โหลด Template สำหรับ Import',
    'admin.users.importUsers': 'Import ผู้ใช้ (.xlsx)',
    'admin.users.addNewUser': 'เพิ่มผู้ใช้ใหม่',
    'admin.users.allUsers': 'รายชื่อผู้ใช้ทั้งหมด',
    'admin.users.userId': 'รหัส',
    'admin.users.fullName': 'ชื่อ-สกุล',
    'admin.users.email': 'อีเมล',
    'admin.users.role': 'บทบาท',
    'admin.users.actions': 'จัดการ',
    'admin.users.editUser': 'แก้ไขผู้ใช้',
    'admin.users.deleteUser': 'ลบผู้ใช้',
    'admin.users.deleteConfirm': 'ยืนยันการลบผู้ใช้',
    'admin.users.deleteMessage': 'คุณแน่ใจหรือไม่ที่จะลบผู้ใช้ "{name}"?',
    'admin.users.password': 'รหัสผ่าน',
    'admin.users.confirmPassword': 'ยืนยันรหัสผ่าน',

    // Navbar
    'nav.reports': 'รายงาน',
  },

  en: {
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.view': 'View',
    'common.create': 'Create',
    'common.update': 'Update',
    'common.submit': 'Submit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.close': 'Close',
    'common.open': 'Open',
    'common.yes': 'Yes',
    'common.no': 'No',

    // Navigation
    'nav.home': 'Home',
    'nav.questions': 'Questions',
    'nav.popular': 'Popular',
    'nav.create': 'Create Question',
    'nav.profile': 'Profile',
    'nav.admin': 'Admin',
    'nav.login': 'Login',
    'nav.logout': 'Logout',

    // App
    'app.title': 'PCRU CS CONNECT',
    'app.subtitle': 'Connect and Share Computer Science Knowledge',
    'app.description': 'Knowledge sharing platform for students and teachers of Computer Science, Phetchabun Rajabhat University',

    // Auth
    'auth.login.title': 'Login',
    'auth.login.subtitle': 'PCRU CS CONNECT',
    'auth.login.userId': 'Student/Teacher ID',
    'auth.login.password': 'Password',
    'auth.login.forgotPassword': 'Forgot Password?',
    'auth.login.submit': 'Login',
    'auth.login.error': 'Invalid credentials',
    'auth.logout.success': 'Logged out successfully',

    // Reset Password
    'auth.reset.title': 'Reset Password',
    'auth.reset.subtitle': 'Enter your email to receive a new password',
    'auth.reset.email': 'Email',
    'auth.reset.submit': 'Send New Password',
    'auth.reset.success': 'New password sent to your email',
    'auth.reset.error': 'Email not found',

    // Questions
    'questions.title': 'Questions',
    'questions.create': 'Create New Question',
    'questions.search.placeholder': 'Search questions...',
    'questions.filter.category': 'Category',
    'questions.filter.all': 'All Categories',
    'questions.empty': 'No questions found',
    'questions.empty.description': 'No questions in the system yet',
    'questions.views': 'views',
    'questions.likes': 'likes',
    'questions.comments': 'comments',
    'questions.by': 'by',
    'questions.created': 'created',

    // Create Question
    'questions.create.title': 'Create New Question',
    'questions.create.form.title': 'Question Title',
    'questions.create.form.title.placeholder': 'Enter question title...',
    'questions.create.form.content': 'Content',
    'questions.create.form.content.placeholder': 'Enter question details...',
    'questions.create.form.categories': 'Categories',
    'questions.create.form.categories.placeholder': 'Select categories...',
    'questions.create.submit': 'Create Question',
    'questions.create.success': 'Question created successfully',

    // Question Detail
    'question.detail.title': 'Question Details',
    'question.detail.like': 'Like',
    'question.detail.unlike': 'Unlike',
    'question.detail.report': 'Report',
    'question.detail.comments.title': 'Comments',
    'question.detail.comments.empty': 'No comments yet',
    'question.detail.comments.add': 'Add Comment',
    'question.detail.comments.placeholder': 'Write a comment...',
    'question.detail.comments.submit': 'Post Comment',

    // Admin
    'admin.title': 'Administration',
    'admin.dashboard': 'Dashboard',
    'admin.users': 'User Management',
    'admin.categories': 'Category Management',
    'admin.reports': 'Report Management',
    'admin.statistics': 'Statistics',

    // Users Management
    'admin.users.title': 'User Management',
    'admin.users.create': 'Add New User',
    'admin.users.total': 'Total Users',
    'admin.users.students': 'Students',
    'admin.users.teachers': 'Teachers',
    'admin.users.admins': 'Administrators',

    // Categories Management
    'admin.categories.title': 'Category Management',
    'admin.categories.create': 'Add New Category',
    'admin.categories.name': 'Category Name',
    'admin.categories.questions': 'Questions Count',

    // Reports Management
    'admin.reports.title': 'Report Management',
    'admin.reports.pending': 'Pending',
    'admin.reports.resolved': 'Resolved',
    'admin.reports.reason': 'Reason',
    'admin.reports.reporter': 'Reporter',
    'admin.reports.resolve': 'Resolve',

    // Statistics
    'admin.stats.users': 'Total Users',
    'admin.stats.questions': 'Total Questions',
    'admin.stats.comments': 'Total Comments',
    'admin.stats.reports': 'Pending Reports',

    // Roles
    'role.student': 'Student',
    'role.teacher': 'Teacher',
    'role.admin': 'Administrator',

    // Errors
    'error.unauthorized': 'Unauthorized access',
    'error.notFound': 'Not found',
    'error.serverError': 'Server error',
    'error.networkError': 'Network error',
    'error.validation': 'Invalid data',

    // Validation
    'validation.required': 'This field is required',
    'validation.email': 'Invalid email format',
    'validation.minLength': 'Must be at least {min} characters',
    'validation.maxLength': 'Must be no more than {max} characters',

    // Profile
    'profile.title': 'Profile',
    'profile.edit': 'Edit Profile',
    'profile.changePassword': 'Change Password',
    'profile.userId': 'User ID',
    'profile.email': 'Email',
    'profile.fullName': 'Full Name',
    'profile.joinedDate': 'Joined Date',
    'profile.currentPassword': 'Current Password',
    'profile.newPassword': 'New Password',
    'profile.confirmPassword': 'Confirm New Password',
    'profile.stats': 'Usage Statistics',
    'profile.myPosts': 'My Posts',
    'profile.myComments': 'Comments',
    'profile.myLikes': 'Likes',
    'profile.myReports': 'Reports',
    'profile.noPosts': 'No posts yet',
    'profile.noComments': 'No comments yet',
    'profile.noLikes': 'No likes yet',
    'profile.noReports': 'No reports yet',
    'profile.createFirstPost': 'Create First Post',
    'profile.postsCreated': 'Posts Created',
    'profile.commentsCount': 'Comments',
    'profile.repliedIn': 'Replied in',

    // Admin Dashboard
    'admin.dashboard.title': 'Admin Dashboard',
    'admin.dashboard.subtitle': 'Manage and control PCRU CS CONNECT knowledge base system',
    'admin.dashboard.refresh': 'Refresh',
    'admin.dashboard.totalUsers': 'Total Users',
    'admin.dashboard.totalQuestions': 'Total Questions',
    'admin.dashboard.totalComments': 'Comments',
    'admin.dashboard.pendingReports': 'Pending Reports',
    'admin.dashboard.manageUsers': 'User Management',
    'admin.dashboard.manageUsers.desc': 'Add, edit, or manage user roles',
    'admin.dashboard.manageCategories': 'Category Management',
    'admin.dashboard.manageCategories.desc': 'Add, edit, or delete question categories',
    'admin.dashboard.manageReports': 'Report Management',
    'admin.dashboard.manageReports.desc': 'Review and manage reported content',
    'admin.dashboard.viewStatistics': 'Statistics Report',
    'admin.dashboard.viewStatistics.desc': 'View system usage statistics and reports',
    'admin.dashboard.recentActivity': 'Recent Activity',
    'admin.dashboard.systemStarted': 'System started successfully',
    'admin.dashboard.adminLoggedIn': 'Admin logged in successfully',
    'admin.dashboard.justNow': 'Just now',
    'admin.dashboard.checkingAuth': 'Checking authorization...',
    'admin.dashboard.noAccess': 'Access Denied',
    'admin.dashboard.noAccessDesc': 'You do not have permission to access this page',

    // Categories Management
    'admin.categories.addNew': 'Add New Category',
    'admin.categories.allCategories': 'All Categories',
    'admin.categories.editCategory': 'Edit Category',
    'admin.categories.categoryName': 'Category Name',
    'admin.categories.categoryNamePlaceholder': 'e.g. Programming, Database',
    'admin.categories.deleteConfirm': 'Confirm Category Deletion',
    'admin.categories.deleteMessage': 'Are you sure you want to delete category "{name}"? If there are questions using this category, it cannot be deleted',
    'admin.categories.deleteSuccess': 'Category deleted successfully',
    'admin.categories.editSuccess': 'Category updated successfully',
    'admin.categories.createSuccess': 'Category created successfully',

    // Reports Management
    'admin.reports.manageReports': 'Report Management',
    'admin.reports.allReports': 'All',
    'admin.reports.spam': 'Spam',
    'admin.reports.inappropriate': 'Inappropriate Content',
    'admin.reports.offensive': 'Offensive/Abusive',
    'admin.reports.misleading': 'Misleading Information',
    'admin.reports.other': 'Other',
    'admin.reports.reportedBy': 'Reported by',
    'admin.reports.hideDelete': 'Hide/Delete',
    'admin.reports.reject': 'Reject',
    'admin.reports.confirmResolve': 'Confirm action? Content will be hidden/deleted',
    'admin.reports.confirmReject': 'Confirm rejection? Content will remain',
    'admin.reports.resolveSuccess': 'Action completed - Content hidden',
    'admin.reports.rejectSuccess': 'Report rejected - Content remains',
    'admin.reports.noReports': 'No reports',
    'admin.reports.noPendingReports': 'No pending reports',
    'admin.reports.noReportsInCategory': 'No reports in this category',
    'admin.reports.question': 'Question',
    'admin.reports.comment': 'Comment',

    // Statistics
    'admin.statistics.title': 'Statistics Report',
    'admin.statistics.subtitle': 'View system usage statistics and reports',

    // Popular Page
    'popular.title': 'Popular',
    'popular.mostViewed': 'Most Viewed',
    'popular.mostCommented': 'Most Commented',
    'popular.mostLiked': 'Most Liked',
    'popular.trending': 'Trending',
    'popular.noPopular': 'No popular questions yet',
    'popular.noPopularDesc': 'Start creating questions to share knowledge!',

    // Home Page
    'home.sortBy': 'Sort by',
    'home.latest': 'Latest',
    'home.oldest': 'Oldest',
    'home.mostViewed': 'Most Viewed',
    'home.popular': 'Popular',
    'home.found': 'Found',
    'home.questions': 'questions',

    // Unauthorized
    'unauthorized.title': 'Access Denied',
    'unauthorized.message': 'You do not have permission to access this page. Please contact the administrator if you believe this is an error',

    // Users Management
    'admin.users.manage': 'User Management',
    'admin.users.description': 'Add, edit, or delete users in the system',
    'admin.users.downloadTemplate': 'Download Import Template',
    'admin.users.importUsers': 'Import Users (.xlsx)',
    'admin.users.addNewUser': 'Add New User',
    'admin.users.allUsers': 'All Users',
    'admin.users.userId': 'ID',
    'admin.users.fullName': 'Full Name',
    'admin.users.email': 'Email',
    'admin.users.role': 'Role',
    'admin.users.actions': 'Actions',
    'admin.users.editUser': 'Edit User',
    'admin.users.deleteUser': 'Delete User',
    'admin.users.deleteConfirm': 'Confirm User Deletion',
    'admin.users.deleteMessage': 'Are you sure you want to delete user "{name}"?',
    'admin.users.password': 'Password',
    'admin.users.confirmPassword': 'Confirm Password',

    // Navbar
    'nav.reports': 'Reports',
  }
};

export function getTranslation(key: string, language: Language, params?: Record<string, string | number>): string {
  let translation = translations[language][key as keyof typeof translations[typeof language]] || key;
  
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      translation = translation.replace(`{${param}}`, String(value));
    });
  }
  
  return translation;
}