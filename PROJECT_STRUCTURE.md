# هيكل مشروع تطبيق الدردشة المتكامل

## 1. الواجهة الأمامية (Frontend)

- src/
  - app/
    - layout.tsx               # التخطيط الرئيسي للتطبيق (Root Layout)
    - globals.css              # الأنماط العامة والتنسيقات
    - page.tsx                 # الصفحة الرئيسية (Landing Page)
    - login/
      - page.tsx               # صفحة تسجيل الدخول
    - register/
      - page.tsx               # صفحة التسجيل
    - chat/
      - layout.tsx             # تخطيط صفحات الدردشة (Sidebar + Main)
      - page.tsx               # صفحة الدردشة الرئيسية (اختيار المحادثة)
      - [chatId]/
        - page.tsx             # صفحة المحادثة الفردية (عرض الرسائل وإرسالها)
      - new-group/
        - page.tsx             # صفحة إنشاء مجموعة جديدة
    - profile/
      - page.tsx               # صفحة إدارة الملف الشخصي (تعديل الاسم، الصورة، كلمة المرور)
  - components/
    - ui/                      # مكونات واجهة المستخدم المعاد استخدامها (أزرار، بطاقات، مدخلات، ...)
  - hooks/
    - use-mobile.ts            # مثال على هوك مخصص (يمكن إضافة هوك للسوكيت هنا)
  - lib/
    - utils.ts                 # دوال مساعدة عامة

## 2. الواجهة الخلفية (Backend)

- server/
  - src/
    - app.ts                   # إعداد تطبيق Express
    - index.ts                 # نقطة الدخول وتشغيل السيرفر وتهيئة Socket.IO
    - config/
      - index.ts               # إعدادات التكوين (مثل مسار رفع الملفات)
    - controllers/
      - auth.controller.ts     # منطق تسجيل الدخول والتسجيل
      - chat.controller.ts     # منطق إنشاء وتحديث المحادثات (فردية وجماعية)
      - message.controller.ts  # منطق إرسال واستقبال الرسائل
      - upload.controller.ts   # منطق رفع الملفات (صور، فيديو، ملفات)
    - middleware/
      - auth.ts                # التحقق من التوثيق (JWT)
    - models/
      - User.ts                # نموذج المستخدم (مع تشفير كلمة المرور)
      - Chat.ts                # نموذج المحادثة (فردية وجماعية)
      - Message.ts             # نموذج الرسالة (نص، صورة، ملف، فيديو)
    - routes/
      - auth.routes.ts         # مسارات المصادقة
      - chat.routes.ts         # مسارات المحادثات
      - message.routes.ts      # مسارات الرسائل
      - upload.routes.ts       # مسارات رفع الملفات
    - types/
      - socket.ts              # تعريفات TypeScript الخاصة بسوكيت

  - Dockerfile                  # ملف إعداد الحاوية
  - docker-compose.yml          # إعدادات تشغيل الحاويات
  - package.json                # تعريف الحزم والاعتمادات الخاصة بالخلفية
  - tsconfig.json               # إعدادات TypeScript

## 3. ملفات أخرى

- .gitignore                   # الملفات والمجلدات التي يجب تجاهلها في Git
- README.md                    # توثيق المشروع
- test.http                    # سكريبتات لاختبار API باستخدام HTTP client

---

هذا الهيكل يغطي جميع الملفات والمجلدات التي تم إنشاؤها أو تعديلها لتلبية متطلبات تطبيق الدردشة المتكامل باستخدام React وNode.js وSocket.IO وMongoDB.

يمكنك استخدام هذا الملف كمرجع لفهم وتنظيم المشروع بشكل أفضل.
