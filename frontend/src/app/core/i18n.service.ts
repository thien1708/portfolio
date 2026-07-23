import { Injectable, computed, signal } from '@angular/core';

export type Lang = 'en' | 'vi';

/**
 * Static UI strings in both languages. Dynamic content (profile summary,
 * project descriptions…) stays as authored in the admin panel — this only
 * covers the chrome around it.
 */
const TRANSLATIONS = {
  en: {
    'nav.about': 'About',
    'nav.skills': 'Skills',
    'nav.experience': 'Experience',
    'nav.projects': 'Projects',
    'nav.education': 'Education',
    'nav.contact': 'Contact',
    'hero.hello': 'Hello, I am',
    'hero.viewProjects': 'View Projects',
    'hero.downloadCv': 'Download CV',
    'hero.contactMe': 'Contact Me',
    'hero.scrollDown': 'Scroll down',
    'hero.planetHint': 'view skills',
    'about.kicker': 'Who I am',
    'about.title1': 'About',
    'about.title2': 'Me',
    'about.years': 'Years experience',
    'about.projects': 'Projects',
    'about.technologies': 'Technologies',
    'about.companies': 'Companies',
    'skills.kicker': 'What I work with',
    'skills.title1': 'My',
    'skills.title2': 'Skills',
    'skills.daily': 'Daily driver',
    'skills.proficient': 'Proficient',
    'skills.familiar': 'Hands-on',
    'exp.kicker': "Where I've been",
    'exp.title1': 'Work',
    'exp.title2': 'Experience',
    'projects.kicker': "What I've built",
    'projects.title1': 'Featured',
    'projects.title2': 'Projects',
    'projects.all': 'All',
    'projects.demo': 'Live demo',
    'projects.source': 'Source',
    'projects.featured': 'Featured',
    'projects.highlights': 'Key results',
    'projects.gallery': 'Gallery',
    'edu.kicker': 'Learning journey',
    'edu.title1': 'Education &',
    'edu.title2': 'Certifications',
    'contact.kicker': "Let's talk",
    'contact.title1': 'Get in',
    'contact.title2': 'Touch',
    'contact.blurb':
      'Have a project in mind, a role to discuss, or just want to say hi? Drop me a message — I usually reply within a day.',
    'contact.email': 'Email',
    'contact.phone': 'Phone',
    'contact.location': 'Location',
    'contact.copy': 'Copy email address',
    'contact.copied': 'Email copied',
    'contact.name': 'Name',
    'contact.subject': 'Subject',
    'contact.subjectPh': 'What is this about?',
    'contact.namePh': 'Your name',
    'contact.message': 'Message',
    'contact.messagePh': 'Tell me about your project…',
    'contact.send': 'Send Message',
    'contact.sending': 'Sending…',
    'contact.errName': 'Please enter your name.',
    'contact.errEmail': 'Please enter a valid email.',
    'contact.errMessage': 'Please write a message.',
    'contact.sent': 'Message sent! I will get back to you soon. 🙌',
    'contact.sendFail': 'Could not send the message. Please try again later.',
    'footer.rights': 'All rights reserved.',
    'misc.backToTop': 'Back to top',
    'misc.loadFail': 'Could not load the portfolio data. Is the backend running?',
    'notfound.title': 'Lost in space',
    'notfound.blurb': 'The page you are looking for drifted out of orbit.',
    'notfound.home': 'Back to home',
  },
  vi: {
    'nav.about': 'Giới thiệu',
    'nav.skills': 'Kỹ năng',
    'nav.experience': 'Kinh nghiệm',
    'nav.projects': 'Dự án',
    'nav.education': 'Học vấn',
    'nav.contact': 'Liên hệ',
    'hero.hello': 'Xin chào, tôi là',
    'hero.viewProjects': 'Xem dự án',
    'hero.downloadCv': 'Tải CV',
    'hero.contactMe': 'Liên hệ tôi',
    'hero.scrollDown': 'Cuộn xuống',
    'hero.planetHint': 'xem kỹ năng',
    'about.kicker': 'Tôi là ai',
    'about.title1': 'Giới thiệu',
    'about.title2': '',
    'about.years': 'Năm kinh nghiệm',
    'about.projects': 'Dự án',
    'about.technologies': 'Công nghệ',
    'about.companies': 'Công ty',
    'skills.kicker': 'Công cụ tôi dùng',
    'skills.title1': 'Kỹ năng',
    'skills.title2': '',
    'skills.daily': 'Dùng hàng ngày',
    'skills.proficient': 'Thành thạo',
    'skills.familiar': 'Đã sử dụng',
    'exp.kicker': 'Nơi tôi đã làm',
    'exp.title1': 'Kinh nghiệm',
    'exp.title2': 'làm việc',
    'projects.kicker': 'Sản phẩm tôi xây',
    'projects.title1': 'Dự án',
    'projects.title2': 'nổi bật',
    'projects.all': 'Tất cả',
    'projects.demo': 'Xem demo',
    'projects.source': 'Mã nguồn',
    'projects.featured': 'Nổi bật',
    'projects.highlights': 'Kết quả chính',
    'projects.gallery': 'Hình ảnh',
    'edu.kicker': 'Hành trình học tập',
    'edu.title1': 'Học vấn &',
    'edu.title2': 'Chứng chỉ',
    'contact.kicker': 'Cùng trò chuyện',
    'contact.title1': 'Liên hệ',
    'contact.title2': 'với tôi',
    'contact.blurb':
      'Bạn có dự án, một vị trí muốn trao đổi, hay đơn giản muốn chào hỏi? Hãy nhắn cho tôi — tôi thường phản hồi trong ngày.',
    'contact.email': 'Email',
    'contact.phone': 'Điện thoại',
    'contact.location': 'Địa chỉ',
    'contact.copy': 'Sao chép địa chỉ email',
    'contact.copied': 'Đã sao chép',
    'contact.name': 'Họ tên',
    'contact.namePh': 'Tên của bạn',
    'contact.subject': 'Tiêu đề',
    'contact.subjectPh': 'Bạn muốn trao đổi về điều gì?',
    'contact.message': 'Nội dung',
    'contact.messagePh': 'Kể tôi nghe về dự án của bạn…',
    'contact.send': 'Gửi tin nhắn',
    'contact.sending': 'Đang gửi…',
    'contact.errName': 'Vui lòng nhập tên của bạn.',
    'contact.errEmail': 'Vui lòng nhập email hợp lệ.',
    'contact.errMessage': 'Vui lòng nhập nội dung.',
    'contact.sent': 'Đã gửi! Tôi sẽ phản hồi sớm nhất có thể. 🙌',
    'contact.sendFail': 'Không gửi được tin nhắn. Vui lòng thử lại sau.',
    'footer.rights': 'Đã đăng ký bản quyền.',
    'misc.backToTop': 'Về đầu trang',
    'misc.loadFail': 'Không tải được dữ liệu. Backend đã chạy chưa?',
    'notfound.title': 'Lạc ngoài không gian',
    'notfound.blurb': 'Trang bạn tìm đã trôi khỏi quỹ đạo mất rồi.',
    'notfound.home': 'Về trang chủ',
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type I18nKey = keyof (typeof TRANSLATIONS)['en'];

const STORAGE_KEY = 'pf-lang';

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly lang = signal<Lang>(readInitialLang());

  private readonly dict = computed<Record<string, string>>(() => TRANSLATIONS[this.lang()]);

  /** Translate a key; falls back to the key itself so gaps stay visible. */
  t(key: I18nKey): string {
    return this.dict()[key] ?? key;
  }

  toggle(): void {
    const next: Lang = this.lang() === 'en' ? 'vi' : 'en';
    this.lang.set(next);
    document.documentElement.lang = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode — the choice just won't persist.
    }
  }
}

function readInitialLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'vi') {
      return stored;
    }
  } catch {
    // fall through
  }
  return typeof navigator !== 'undefined' && navigator.language?.startsWith('vi') ? 'vi' : 'en';
}
