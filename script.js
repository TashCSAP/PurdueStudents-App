// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAH_OK8FFn-sqBgiD0jEaEcFk0DHJbSY2Y",
    authDomain: "csatpurdue-app.firebaseapp.com",
    projectId: "csatpurdue-app",
    storageBucket: "csatpurdue-app.firebasestorage.app",
    messagingSenderId: "219849299690",
    appId: "1:219849299690:web:d970b6b32bee63f9be6993"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;
let userReadingMap = {};
let isSignUpMode = true;
const LOCAL_STORAGE_KEY = 'csatpurdue_reading_tracker_v1';
let userHighlightsMap = {};
const HIGHLIGHTS_STORAGE_KEY = 'csatpurdue_user_highlights_v1';

// Update this string whenever you post a new announcement in index.html!
const LATEST_ANNOUNCEMENT_ID = 'announcement_sep_4_2026';

const ADMIN_EMAILS = [
    "hylander144@gmail.com",
    "mvmcgrady@gmail.com"
];

function bootUpApplicationEngine() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const appHeader = document.getElementById('app-header');
    const headerTitle = document.getElementById('header-title');
    const pages = document.querySelectorAll('.app-page');
    
    const btnSummerSupply = document.getElementById('btn-summer-supply');
    const btnCommonFaith = document.getElementById('btn-common-faith');
    const btnBackToAbout = document.getElementById('back-to-about-btn');
    const btnDailyChallenges = document.getElementById('btn-daily-challenges');
    const otSchedulePage = document.getElementById('ot-schedule-page');
    const btnBackToHomeFromOT = document.getElementById('back-to-home-from-ot');
    const btnBackToHomeFromEating = document.getElementById('back-to-home-from-eating');

    const summerSupplyPage = document.getElementById('summer-supply-page');
    const scriptureReaderPage = document.getElementById('scripture-reader-page');
    const btnBackToHomeFromSummer = document.getElementById('back-to-home-from-summer');
    const btnBackToChallenge = document.getElementById('back-to-challenge-btn');
    const daysListContainer = document.getElementById('reading-days-list');
    
    const authForm = document.getElementById('auth-form');
    const authNameInput = document.getElementById('auth-name');
    const authEmailInput = document.getElementById('auth-email');
    const authPasswordInput = document.getElementById('auth-password');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    const authToggleBtn = document.getElementById('auth-toggle-btn');
    const authToggleMsg = document.getElementById('auth-toggle-msg');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const authBoxContainer = document.getElementById('auth-box-container');
    const loggedInContainer = document.getElementById('logged-in-container');
    const userDisplayName = document.getElementById('user-display-name');
    const userDisplayEmail = document.getElementById('user-display-email');
    const authLogoutBtn = document.getElementById('auth-logout-btn');
    const btnOpenAdminView = document.getElementById('btn-open-admin-view');
    const btnBackToProfileFromAdmin = document.getElementById('back-to-profile-from-admin');

    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressPercentText = document.getElementById('progress-percent');
    const progressCountString = document.getElementById('progress-count-string');
    const streakDisplayText = document.getElementById('streak-display-text');
    
    const readerAssignmentHeader = document.getElementById('reader-heading-assignment');
    const readerDateHeader = document.getElementById('reader-heading-date');
    const bibleTextScrollBox = document.getElementById('bible-text-scroll-box');
    const bibleTextContentTarget = document.getElementById('bible-text-content-target');

    let currentActiveIndexReading = null;
    let autoScrollObserver = null;

    const READING_SCHEDULE = [
        { dateLabel: "Sept 2", assignment: "Titus 1-3", chapters: [{ book: "Titus", chapter: 1 }, { book: "Titus", chapter: 2 }, { book: "Titus", chapter: 3 }] },
        { dateLabel: "Sept 3", assignment: "Philemon", chapters: [{ book: "Philemon", chapter: 1 }] },
        { dateLabel: "Sept 4", assignment: "Hebrews 1-2", chapters: [{ book: "Hebrews", chapter: 1 }, { book: "Hebrews", chapter: 2 }] },
        { dateLabel: "Sept 5", assignment: "Hebrews 3-4", chapters: [{ book: "Hebrews", chapter: 3 }, { book: "Hebrews", chapter: 4 }] },
        { dateLabel: "Sept 7", assignment: "Hebrews 5-6", chapters: [{ book: "Hebrews", chapter: 5 }, { book: "Hebrews", chapter: 6 }] },
        { dateLabel: "Sept 8", assignment: "Hebrews 7", chapters: [{ book: "Hebrews", chapter: 7 }] },
        { dateLabel: "Sept 9", assignment: "Hebrews 8-9", chapters: [{ book: "Hebrews", chapter: 8 }, { book: "Hebrews", chapter: 9 }] },
        { dateLabel: "Sept 10", assignment: "Hebrews 10", chapters: [{ book: "Hebrews", chapter: 10 }] },
        { dateLabel: "Sept 11", assignment: "Hebrews 11", chapters: [{ book: "Hebrews", chapter: 11 }] },
        { dateLabel: "Sept 12", assignment: "Hebrews 12", chapters: [{ book: "Hebrews", chapter: 12 }] },
        { dateLabel: "Sept 14", assignment: "Hebrews 13", chapters: [{ book: "Hebrews", chapter: 13 }] },
        { dateLabel: "Sept 15", assignment: "James 1", chapters: [{ book: "James", chapter: 1 }] },
        { dateLabel: "Sept 16", assignment: "James 2", chapters: [{ book: "James", chapter: 2 }] },
        { dateLabel: "Sept 17", assignment: "James 3-5", chapters: [{ book: "James", chapter: 3 }, { book: "James", chapter: 4 }, { book: "James", chapter: 5 }] },
        { dateLabel: "Sept 18", assignment: "1 Peter 1", chapters: [{ book: "1 Peter", chapter: 1 }] },
        { dateLabel: "Sept 19", assignment: "1 Peter 2", chapters: [{ book: "1 Peter", chapter: 2 }] },
        { dateLabel: "Sept 21", assignment: "1 Peter 3", chapters: [{ book: "1 Peter", chapter: 3 }] },
        { dateLabel: "Sept 22", assignment: "1 Peter 4-5", chapters: [{ book: "1 Peter", chapter: 4 }, { book: "1 Peter", chapter: 5 }] },
        { dateLabel: "Sept 23", assignment: "2 Peter 1", chapters: [{ book: "2 Peter", chapter: 1 }] },
        { dateLabel: "Sept 24", assignment: "2 Peter 2-3", chapters: [{ book: "2 Peter", chapter: 2 }, { book: "2 Peter", chapter: 3 }] },
        { dateLabel: "Sept 25", assignment: "1 John 1-2", chapters: [{ book: "1 John", chapter: 1 }, { book: "1 John", chapter: 2 }] },
        { dateLabel: "Sept 26", assignment: "1 John 3", chapters: [{ book: "1 John", chapter: 3 }] },
        { dateLabel: "Sept 28", assignment: "1 John 4", chapters: [{ book: "1 John", chapter: 4 }] },
        { dateLabel: "Sept 29", assignment: "1 John 5", chapters: [{ book: "1 John", chapter: 5 }] },
        { dateLabel: "Sept 30", assignment: "2-3 John", chapters: [{ book: "2 John", chapter: 1 }, { book: "3 John", chapter: 1 }] },
        { dateLabel: "Oct 1", assignment: "Jude", chapters: [{ book: "Jude", chapter: 1 }] },
        { dateLabel: "Oct 2", assignment: "Revelation 1", chapters: [{ book: "Revelation", chapter: 1 }] },
        { dateLabel: "Oct 3", assignment: "Revelation 2", chapters: [{ book: "Revelation", chapter: 2 }] },
        { dateLabel: "Oct 5", assignment: "Revelation 3", chapters: [{ book: "Revelation", chapter: 3 }] },
        { dateLabel: "Oct 6", assignment: "Revelation 4-6", chapters: [{ book: "Revelation", chapter: 4 }, { book: "Revelation", chapter: 5 }, { book: "Revelation", chapter: 6 }] },
        { dateLabel: "Oct 7", assignment: "Revelation 7-8", chapters: [{ book: "Revelation", chapter: 7 }, { book: "Revelation", chapter: 8 }] },
        { dateLabel: "Oct 8", assignment: "Revelation 9-10", chapters: [{ book: "Revelation", chapter: 9 }, { book: "Revelation", chapter: 10 }] },
        { dateLabel: "Oct 9", assignment: "Revelation 11-12", chapters: [{ book: "Revelation", chapter: 11 }, { book: "Revelation", chapter: 12 }] },
        { dateLabel: "Oct 10", assignment: "Revelation 13-14", chapters: [{ book: "Revelation", chapter: 13 }, { book: "Revelation", chapter: 14 }] },
        { dateLabel: "Oct 12", assignment: "Revelation 15-17", chapters: [{ book: "Revelation", chapter: 15 }, { book: "Revelation", chapter: 16 }, { book: "Revelation", chapter: 17 }] },
        { dateLabel: "Oct 13", assignment: "Revelation 18-20", chapters: [{ book: "Revelation", chapter: 18 }, { book: "Revelation", chapter: 19 }, { book: "Revelation", chapter: 20 }] },
        { dateLabel: "Oct 14", assignment: "Revelation 21", chapters: [{ book: "Revelation", chapter: 21 }] },
        { dateLabel: "Oct 15", assignment: "Revelation 22", chapters: [{ book: "Revelation", chapter: 22 }] }
    ];

    const OT_SCHEDULE = [
        { id: "ot_1", dateLabel: "Sep 2", assignment: "Psalms 120–121" },
        { id: "ot_2", dateLabel: "Sep 3", assignment: "Psalms 122–124" },
        { id: "ot_3", dateLabel: "Sep 4", assignment: "Psalms 125–127" },
        { id: "ot_4", dateLabel: "Sep 5", assignment: "Psalms 128–130" },
        { id: "ot_5", dateLabel: "Sep 6", assignment: "Psalms 131–133" },
        { id: "ot_6", dateLabel: "Sep 7", assignment: "Psalms 134–136" },
        { id: "ot_7", dateLabel: "Sep 8", assignment: "Psalms 137–139" },
        { id: "ot_8", dateLabel: "Sep 9", assignment: "Psalms 140–142" },
        { id: "ot_9", dateLabel: "Sep 10", assignment: "Psalms 143–145" },
        { id: "ot_10", dateLabel: "Sep 11", assignment: "Psalms 146–148" },
        { id: "ot_11", dateLabel: "Sep 12", assignment: "Psalms 149–150 + Proverbs 1" },
        { id: "ot_12", dateLabel: "Sep 13", assignment: "Proverbs 2–4" },
        { id: "ot_13", dateLabel: "Sep 14", assignment: "Proverbs 5–7" },
        { id: "ot_14", dateLabel: "Sep 15", assignment: "Proverbs 8–10" },
        { id: "ot_15", dateLabel: "Sep 16", assignment: "Proverbs 11–13" },
        { id: "ot_16", dateLabel: "Sep 17", assignment: "Proverbs 14–16" },
        { id: "ot_17", dateLabel: "Sep 18", assignment: "Proverbs 17–19" },
        { id: "ot_18", dateLabel: "Sep 19", assignment: "Proverbs 20–22" },
        { id: "ot_19", dateLabel: "Sep 20", assignment: "Proverbs 23–25" },
        { id: "ot_20", dateLabel: "Sep 21", assignment: "Proverbs 26–28" },
        { id: "ot_21", dateLabel: "Sep 22", assignment: "Proverbs 29–31" },
        { id: "ot_22", dateLabel: "Sep 23", assignment: "Ecclesiastes 1–3" },
        { id: "ot_23", dateLabel: "Sep 24", assignment: "Ecclesiastes 4–6" },
        { id: "ot_24", dateLabel: "Sep 25", assignment: "Ecclesiastes 7–9" },
        { id: "ot_25", dateLabel: "Sep 26", assignment: "Ecclesiastes 10–12" },
        { id: "ot_26", dateLabel: "Sep 27", assignment: "Song of Solomon 1–3" },
        { id: "ot_27", dateLabel: "Sep 28", assignment: "Song of Solomon 4–6" },
        { id: "ot_28", dateLabel: "Sep 29", assignment: "Song of Solomon 7–8 + Isaiah 1" },
        { id: "ot_29", dateLabel: "Sep 30", assignment: "Isaiah 2–4" },
        { id: "ot_30", dateLabel: "Oct 1", assignment: "Isaiah 5–7" },
        { id: "ot_31", dateLabel: "Oct 2", assignment: "Isaiah 8–10" },
        { id: "ot_32", dateLabel: "Oct 3", assignment: "Isaiah 11–13" },
        { id: "ot_33", dateLabel: "Oct 4", assignment: "Isaiah 14–16" },
        { id: "ot_34", dateLabel: "Oct 5", assignment: "Isaiah 17–19" },
        { id: "ot_35", dateLabel: "Oct 6", assignment: "Isaiah 20–22" },
        { id: "ot_36", dateLabel: "Oct 7", assignment: "Isaiah 23–25" },
        { id: "ot_37", dateLabel: "Oct 8", assignment: "Isaiah 26–28" },
        { id: "ot_38", dateLabel: "Oct 9", assignment: "Isaiah 29–31" },
        { id: "ot_39", dateLabel: "Oct 10", assignment: "Isaiah 32–34" },
        { id: "ot_40", dateLabel: "Oct 11", assignment: "Isaiah 35–37" },
        { id: "ot_41", dateLabel: "Oct 12", assignment: "Isaiah 38–40" },
        { id: "ot_42", dateLabel: "Oct 13", assignment: "Isaiah 41–43" },
        { id: "ot_43", dateLabel: "Oct 14", assignment: "Isaiah 44–46" },
        { id: "ot_44", dateLabel: "Oct 15", assignment: "Isaiah 47–49" },
        { id: "ot_45", dateLabel: "Oct 16", assignment: "Isaiah 50–52" },
        { id: "ot_46", dateLabel: "Oct 17", assignment: "Isaiah 53–55" },
        { id: "ot_47", dateLabel: "Oct 18", assignment: "Isaiah 56–58" },
        { id: "ot_48", dateLabel: "Oct 19", assignment: "Isaiah 59–61" },
        { id: "ot_49", dateLabel: "Oct 20", assignment: "Isaiah 62–64" },
        { id: "ot_50", dateLabel: "Oct 21", assignment: "Isaiah 65–66 + Jeremiah 1" },
        { id: "ot_51", dateLabel: "Oct 22", assignment: "Jeremiah 2–3" },
        { id: "ot_52", dateLabel: "Oct 23", assignment: "Jeremiah 4–5" },
        { id: "ot_53", dateLabel: "Oct 24", assignment: "Jeremiah 6–7" },
        { id: "ot_54", dateLabel: "Oct 25", assignment: "Jeremiah 8–10" },
        { id: "ot_55", dateLabel: "Oct 26", assignment: "Jeremiah 11–12" },
        { id: "ot_56", dateLabel: "Oct 27", assignment: "Jeremiah 13–15" },
        { id: "ot_57", dateLabel: "Oct 28", assignment: "Jeremiah 16–17" },
        { id: "ot_58", dateLabel: "Oct 29", assignment: "Jeremiah 18–20" },
        { id: "ot_59", dateLabel: "Oct 30", assignment: "Jeremiah 21–22" },
        { id: "ot_60", dateLabel: "Oct 31", assignment: "Jeremiah 23–25" },
        { id: "ot_61", dateLabel: "Nov 1", assignment: "Jeremiah 26–27" },
        { id: "ot_62", dateLabel: "Nov 2", assignment: "Jeremiah 28–30" },
        { id: "ot_63", dateLabel: "Nov 3", assignment: "Jeremiah 31–32" },
        { id: "ot_64", dateLabel: "Nov 4", assignment: "Jeremiah 33–35" },
        { id: "ot_65", dateLabel: "Nov 5", assignment: "Jeremiah 36–37" },
        { id: "ot_66", dateLabel: "Nov 6", assignment: "Jeremiah 38–40" },
        { id: "ot_67", dateLabel: "Nov 7", assignment: "Jeremiah 41–42" },
        { id: "ot_68", dateLabel: "Nov 8", assignment: "Jeremiah 43–45" },
        { id: "ot_69", dateLabel: "Nov 9", assignment: "Jeremiah 46–47" },
        { id: "ot_70", dateLabel: "Nov 10", assignment: "Jeremiah 48–50" },
        { id: "ot_71", dateLabel: "Nov 11", assignment: "Jeremiah 51–52" },
        { id: "ot_72", dateLabel: "Nov 12", assignment: "Lamentations 1–3" },
        { id: "ot_73", dateLabel: "Nov 13", assignment: "Lamentations 4–5 + Ezekiel 1" },
        { id: "ot_74", dateLabel: "Nov 14", assignment: "Ezekiel 2–3" },
        { id: "ot_75", dateLabel: "Nov 15", assignment: "Ezekiel 4–5" },
        { id: "ot_76", dateLabel: "Nov 16", assignment: "Ezekiel 6–8" },
        { id: "ot_77", dateLabel: "Nov 17", assignment: "Ezekiel 9–10" },
        { id: "ot_78", dateLabel: "Nov 18", assignment: "Ezekiel 11–13" },
        { id: "ot_79", dateLabel: "Nov 19", assignment: "Ezekiel 14–15" },
        { id: "ot_80", dateLabel: "Nov 20", assignment: "Ezekiel 16–18" },
        { id: "ot_81", dateLabel: "Nov 21", assignment: "Ezekiel 19–20" },
        { id: "ot_82", dateLabel: "Nov 22", assignment: "Ezekiel 21–23" },
        { id: "ot_83", dateLabel: "Nov 23", assignment: "Ezekiel 24–25" },
        { id: "ot_84", dateLabel: "Nov 24", assignment: "Ezekiel 26–28" },
        { id: "ot_85", dateLabel: "Nov 25", assignment: "Ezekiel 29–30" },
        { id: "ot_86", dateLabel: "Nov 26", assignment: "Ezekiel 31–33" },
        { id: "ot_87", dateLabel: "Nov 27", assignment: "Ezekiel 34–35" },
        { id: "ot_88", dateLabel: "Nov 28", assignment: "Ezekiel 36–38" },
        { id: "ot_89", dateLabel: "Nov 29", assignment: "Ezekiel 39–40" },
        { id: "ot_90", dateLabel: "Nov 30", assignment: "Ezekiel 41–43" },
        { id: "ot_91", dateLabel: "Dec 1", assignment: "Ezekiel 44–45" },
        { id: "ot_92", dateLabel: "Dec 2", assignment: "Ezekiel 46–48" },
        { id: "ot_93", dateLabel: "Dec 3", assignment: "Daniel 1–2" },
        { id: "ot_94", dateLabel: "Dec 4", assignment: "Daniel 3–4" },
        { id: "ot_95", dateLabel: "Dec 5", assignment: "Daniel 5–6" },
        { id: "ot_96", dateLabel: "Dec 6", assignment: "Daniel 7–8" },
        { id: "ot_97", dateLabel: "Dec 7", assignment: "Daniel 9–10" },
        { id: "ot_98", dateLabel: "Dec 8", assignment: "Daniel 11–12" },
        { id: "ot_99", dateLabel: "Dec 9", assignment: "Hosea 1–3" },
        { id: "ot_100", dateLabel: "Dec 10", assignment: "Hosea 4–6" },
        { id: "ot_101", dateLabel: "Dec 11", assignment: "Hosea 7–9" },
        { id: "ot_102", dateLabel: "Dec 12", assignment: "Hosea 10–12" },
        { id: "ot_103", dateLabel: "Dec 13", assignment: "Hosea 13–14 + Joel 1" },
        { id: "ot_104", dateLabel: "Dec 14", assignment: "Joel 2–3 + Amos 1" },
        { id: "ot_105", dateLabel: "Dec 15", assignment: "Amos 2–4" },
        { id: "ot_106", dateLabel: "Dec 16", assignment: "Amos 5–7" },
        { id: "ot_107", dateLabel: "Dec 17", assignment: "Amos 8–9 + Obadiah 1" },
        { id: "ot_108", dateLabel: "Dec 18", assignment: "Jonah 1–3" },
        { id: "ot_109", dateLabel: "Dec 19", assignment: "Jonah 4 + Micah 1–2" },
        { id: "ot_110", dateLabel: "Dec 20", assignment: "Micah 3–5" },
        { id: "ot_111", dateLabel: "Dec 21", assignment: "Micah 6–7 + Nahum 1" },
        { id: "ot_112", dateLabel: "Dec 22", assignment: "Nahum 2–3 + Habakkuk 1" },
        { id: "ot_113", dateLabel: "Dec 23", assignment: "Habakkuk 2–3 + Zephaniah 1" },
        { id: "ot_114", dateLabel: "Dec 24", assignment: "Zephaniah 2–3 + Haggai 1" },
        { id: "ot_115", dateLabel: "Dec 25", assignment: "Haggai 2 + Zechariah 1–2" },
        { id: "ot_116", dateLabel: "Dec 26", assignment: "Zechariah 3–5" },
        { id: "ot_117", dateLabel: "Dec 27", assignment: "Zechariah 6–8" },
        { id: "ot_118", dateLabel: "Dec 28", assignment: "Zechariah 9–11" },
        { id: "ot_119", dateLabel: "Dec 29", assignment: "Zechariah 12–14" },
        { id: "ot_120", dateLabel: "Dec 30", assignment: "Malachi 1–2" },
        { id: "ot_121", dateLabel: "Dec 31", assignment: "Malachi 3–4" }
    ];

    const readingChallengeData = READING_SCHEDULE.map((item, index) => ({
        id: index,
        dateLabel: item.dateLabel,
        assignment: item.assignment,
        hasText: true,
        chapters: item.chapters
    }));

    auth.onAuthStateChanged(user => {
        currentUser = user;
        if (user) {
            authBoxContainer.style.display = 'none';
            loggedInContainer.style.display = 'block';
            userDisplayEmail.innerText = user.email;

            db.collection('users').doc(user.uid).get().then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    userDisplayName.innerText = data.displayName || "Student";
                    userReadingMap = data.readingMap || {};
                    userHighlightsMap = data.highlights || {};

                    let streak = data.currentStreak || 0;
                    const lastRead = data.lastReadDate || null;
                    const todayStr = getTrueLocalDateString();

                    // Check if user broke their streak
                    if (lastRead && streak > 0) {
                        const lastDate = new Date(lastRead);
                        const currentDate = new Date(todayStr);
                        const diffTime = Math.abs(currentDate - lastDate);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays > 1) {
                            streak = 0;
                            db.collection('users').doc(user.uid).update({
                                currentStreak: 0
                            });
                        }
                    }

                    // Attach properties directly to currentUser object
                    currentUser.displayName = data.displayName || "Student";
                    currentUser.readingMap = userReadingMap;
                    currentUser.currentStreak = streak;
                    currentUser.lastReadDate = lastRead;
                }
                calculateStats();
                initializeChallengeDashboard();
            });

            const userEmailClean = user.email.toLowerCase();
            const isAdmin = ADMIN_EMAILS.some(email => email.toLowerCase() === userEmailClean);

            if (isAdmin) {
                btnOpenAdminView.style.display = 'block';
            } else {
                btnOpenAdminView.style.display = 'none';
            }

        } else {
            authBoxContainer.style.display = 'block';
            loggedInContainer.style.display = 'none';
            userReadingMap = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || {};
            userHighlightsMap = JSON.parse(localStorage.getItem(HIGHLIGHTS_STORAGE_KEY)) || {};
            calculateStats();
            initializeChallengeDashboard();
        }
    });

    if (authToggleBtn) {
        authToggleBtn.addEventListener('click', () => {
            isSignUpMode = !isSignUpMode;
            if (isSignUpMode) {
                authTitle.innerText = "Welcome";
                authSubtitle.innerText = "Create an account to save reading progress across your devices.";
                authNameInput.style.display = "block";
                authNameInput.required = true;
                authSubmitBtn.innerText = "Sign Up";
                authToggleMsg.innerText = "Already have an account?";
                authToggleBtn.innerText = "Log In";
            } else {
                authTitle.innerText = "Log In";
                authSubtitle.innerText = "Enter your credentials to access your profile.";
                authNameInput.style.display = "none";
                authNameInput.required = false;
                authSubmitBtn.innerText = "Log In";
                authToggleMsg.innerText = "Need an account?";
                authToggleBtn.innerText = "Sign Up";
            }
        });
    }

    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = authEmailInput.value.trim();
            const password = authPasswordInput.value.trim();
            const name = authNameInput.value.trim();

            if (isSignUpMode) {
                auth.createUserWithEmailAndPassword(email, password)
                    .then((userCredential) => {
                        const user = userCredential.user;
                        return db.collection('users').doc(user.uid).set({
                            uid: user.uid,
                            displayName: name,
                            email: email,
                            currentStreak: 0,
                            readingMap: {},
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    })
                    .catch(error => alert(error.message));
            } else {
                auth.signInWithEmailAndPassword(email, password)
                    .catch(error => alert(error.message));
            }
        });
    }

    if (authLogoutBtn) {
        authLogoutBtn.addEventListener('click', () => {
            auth.signOut();
        });
    }

    if (btnOpenAdminView) {
        btnOpenAdminView.addEventListener('click', () => {
            loadAndBuildAdminDashboard();
            showPage(document.getElementById('admin-page'));
        });
    }

    if (btnBackToProfileFromAdmin) {
        btnBackToProfileFromAdmin.addEventListener('click', () => {
            showPage(document.getElementById('profile-page'));
        });
    }

    function loadAndBuildAdminDashboard() {
        const tableBody = document.getElementById('admin-students-table-body');
        if (!tableBody) return;
        tableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">Fetching profiles...</td></tr>`;

        db.collection('users').get().then(snapshot => {
            tableBody.innerHTML = '';
            if (snapshot.empty) {
                tableBody.innerHTML = `<tr><td colspan="3" style="text-align: center;">No students signed up yet.</td></tr>`;
                return;
            }

            snapshot.forEach(doc => {
                const data = doc.data();
                const studentName = data.displayName || "Student";
                const streak = data.currentStreak || 0;
                const map = data.readingMap || {};
                
                const bookTracker = {};
                let totalDaysCompleted = 0;

                readingChallengeData.forEach(day => {
                    day.chapters.forEach(ch => {
                        if (!bookTracker[ch.book]) {
                            bookTracker[ch.book] = { total: 0, completed: 0 };
                        }
                        bookTracker[ch.book].total += 1;
                        if (map[day.id]) {
                            bookTracker[ch.book].completed += 1;
                        }
                    });

                    if (map[day.id]) {
                        totalDaysCompleted += 1;
                    }
                });

                const completedBooksList = [];
                Object.keys(bookTracker).forEach(bookName => {
                    const record = bookTracker[bookName];
                    if (record.completed === record.total && record.total > 0) {
                        completedBooksList.push(bookName);
                    }
                });

                const tr = document.createElement('tr');
                tr.style.cursor = 'pointer';
                tr.innerHTML = `
                    <td>
                        <strong>${studentName}</strong> <span style="font-size:0.7rem; color:#4A709C;">▼ tap details</span><br>
                        <span style="font-size:0.75rem; color:#8E8E93;">${data.email}</span>
                    </td>
                    <td>🔥 ${streak}d</td>
                    <td><strong>${totalDaysCompleted}</strong> / ${readingChallengeData.length}</td>
                `;

                const detailTr = document.createElement('tr');
                detailTr.style.display = 'none';
                detailTr.style.backgroundColor = '#F8FAFC';

                const booksText = completedBooksList.length > 0 
                    ? completedBooksList.map(b => `🏆 ${b}`).join('<br>') 
                    : '<span style="color: #9CA3AF; font-style: italic;">No full books completed yet. Reading in progress!</span>';

                detailTr.innerHTML = `
                    <td colspan="3" style="padding: 12px 14px; font-size: 0.85rem; color: #334155; border-bottom: 2px solid #E2E8F0;">
                        <div style="font-weight: 700; margin-bottom: 8px; color: #0F172A;">Fully Completed Books:</div>
                        <div style="line-height: 1.6;">${booksText}</div>
                    </td>
                `;

                tr.addEventListener('click', () => {
                    const isHidden = detailTr.style.display === 'none';
                    detailTr.style.display = isHidden ? 'table-row' : 'none';
                });

                tableBody.appendChild(tr);
                tableBody.appendChild(detailTr);
            });
        }).catch(err => {
            console.error("Admin error:", err);
            tableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: red;">Error loading data.</td></tr>`;
        });
    }

   function scrollListToTargetDay(container) {
    if (!container) return;

    // setTimeout ensures page visibility & CSS rendering finish before measuring coordinates
    setTimeout(() => {
        requestAnimationFrame(() => {
            const allRows = Array.from(container.querySelectorAll('.day-row-item'));
            if (allRows.length === 0) return;

            const unreadIndex = allRows.findIndex(row => !row.classList.contains('is-completed'));

            let targetIndex = 0;
            if (unreadIndex !== -1) {
                targetIndex = Math.max(0, unreadIndex - 3);
            } else {
                targetIndex = allRows.length - 1;
            }

            const targetRow = allRows[targetIndex];
            if (targetRow) {
                const containerRect = container.getBoundingClientRect();
                const rowRect = targetRow.getBoundingClientRect();
                const currentScroll = container.scrollTop;
                
                // Calculates precise distance regardless of nested parent containers
                const targetScroll = currentScroll + (rowRect.top - containerRect.top);

                container.scrollTo({
                    top: targetScroll,
                    behavior: 'smooth'
                });
            }
        });
    }, 150);
}

// 2. REPLACED initializeChallengeDashboard
function initializeChallengeDashboard() {
    if (!daysListContainer) return;
    daysListContainer.innerHTML = '';

    const completedMap = currentUser ? userReadingMap : (JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || {});

    readingChallengeData.forEach(day => {
        const isDone = !!completedMap[day.id];
        
        const row = document.createElement('div');
        row.className = `day-row-item ${isDone ? 'is-completed' : ''}`;
        row.dataset.id = day.id;

        row.innerHTML = `
            <div class="day-left-meta">
                <span class="day-title-string">${day.dateLabel}</span>
                <span class="day-assignment-string">${day.assignment}</span>
            </div>
            <div class="completion-check-circle"></div>
        `;

        row.addEventListener('click', () => {
            openScriptureReader(day);
        });

        daysListContainer.appendChild(row);
    });

    calculateStats();

    // Trigger auto-scroll immediately using frame rendering
    scrollListToTargetDay(daysListContainer);
}

    function calculateStats() {
        const completedMap = currentUser ? userReadingMap : (JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || {});
        
        let totalChapters = 0;
        let completedChaptersCount = 0;

        readingChallengeData.forEach(day => {
            const dayChapterCount = day.chapters.length;
            totalChapters += dayChapterCount;
            if (completedMap[day.id]) {
                completedChaptersCount += dayChapterCount;
            }
        });

        const progressPercent = Math.round((completedChaptersCount / totalChapters) * 100) || 0;
        
        if (progressBarFill) progressBarFill.style.width = `${progressPercent}%`;
        if (progressPercentText) progressPercentText.innerText = `${progressPercent}%`;
        if (progressCountString) progressCountString.innerText = `${completedChaptersCount} of ${totalChapters} chapters read`;

        const profileChapters = document.getElementById('profile-chapters-count');
        if (profileChapters) profileChapters.innerText = `${completedChaptersCount} / ${totalChapters}`;

        let currentStreak = 0;
        if (currentUser) {
            currentStreak = currentUser.currentStreak || 0;
        } else {
            currentStreak = parseInt(localStorage.getItem('csatpurdue_streak_count')) || 0;
        }

        if (streakDisplayText) streakDisplayText.innerText = `${currentStreak} Day Streak`;
        
        const profileStreak = document.getElementById('profile-streak-count');
        if (profileStreak) profileStreak.innerText = `🔥 ${currentStreak} Days`;

        checkAndRenderEarnedBadges(completedMap);
    }

    function checkAndRenderEarnedBadges(completedMap) {
        const badgeRowContainer = document.getElementById('badges-container-row');
        if (!badgeRowContainer) return;
        badgeRowContainer.innerHTML = ''; 

        const bookCompletionTracker = {};

        readingChallengeData.forEach(day => {
            day.chapters.forEach(ch => {
                if (!bookCompletionTracker[ch.book]) {
                    bookCompletionTracker[ch.book] = { totalChapters: 0, completedChapters: 0 };
                }

                bookCompletionTracker[ch.book].totalChapters += 1;
                if (completedMap[day.id]) {
                    bookCompletionTracker[ch.book].completedChapters += 1;
                }
            });
        });

        Object.keys(bookCompletionTracker).forEach(bookName => {
            const record = bookCompletionTracker[bookName];
            
            if (record.completedChapters === record.totalChapters && record.totalChapters > 0) {
                const badgeFileName = `Badge-${bookName}.png`;
                const badgeEl = document.createElement('div');
                badgeEl.className = 'earned-badge-node';
                badgeEl.innerHTML = `<img src="${badgeFileName}" alt="${bookName} Badge" title="${bookName} Completed!">`;
                badgeRowContainer.appendChild(badgeEl);
            }
        });
    }

    function openScriptureReader(dayItem) {
        currentActiveIndexReading = dayItem.id;
        if (readerAssignmentHeader) readerAssignmentHeader.innerText = dayItem.assignment;
        if (readerDateHeader) readerDateHeader.innerText = dayItem.dateLabel;
        
        if (bibleTextScrollBox) bibleTextScrollBox.scrollTop = 0;

        if (bibleTextContentTarget) {
            let htmlOutput = ``;

           dayItem.chapters.forEach(chItem => {
                if (chItem.chapter === 1) {
                    const explicitBookTitles = {
                        "Titus": "The Epistle of Paul to Titus",
                        "Philemon": "The Epistle of Paul to Philemon",
                        "Hebrews": "The Epistle to the Hebrews",
                        "James": "The Epistle of James",
                        "1 Peter": "The First Epistle of Peter",
                        "2 Peter": "The Second Epistle of Peter",
                        "1 John": "The First Epistle of John",
                        "2 John": "The Second Epistle of John",
                        "3 John": "The Third Epistle of John",
                        "Jude": "The Epistle of Jude",
                        "Revelation": "Revelation"
                    };

                    let rawTitle = explicitBookTitles[chItem.book] || dynamicBookTitles[chItem.book];
                    
                    if (!rawTitle || (rawTitle.includes("Hebrews") && chItem.book !== "Hebrews")) {
                        rawTitle = `The Book of ${chItem.book}`;
                    }

                    const currentTitle = rawTitle;
                    const currentSubject = dynamicBookSubjects[chItem.book] || "Subject description text is parsing...";

                    htmlOutput += `
                        <div class="book-intro-header-card">
                            <h3 class="full-epistle-title">${currentTitle}</h3>
                            <div class="subject-divider-line"></div>
                            <p class="book-subject-label"><strong>Subject:</strong></p>
                            <p class="book-subject-body">${currentSubject}</p>
                        </div>
                    `;
                }

                let cleanVersesHTML = '';
                if (bibleTextDatabase[chItem.book] && bibleTextDatabase[chItem.book][chItem.chapter]) {
                    const versesArray = bibleTextDatabase[chItem.book][chItem.chapter];
                    versesArray.forEach((verseText, index) => {
                        const verseNum = index + 1;
                        const verseId = `${chItem.book}_${chItem.chapter}_${verseNum}`.replace(/\s+/g, '_');
                        const savedColor = userHighlightsMap[verseId];
                        const highlightClass = savedColor ? `hl-${savedColor}` : '';

                        cleanVersesHTML += `
                            <p class="bible-verse-p ${highlightClass}" data-verse-id="${verseId}">
                                <span class="clean-verse-num">${chItem.book} ${chItem.chapter}:${verseNum}</span> ${verseText}
                            </p>`;
                    });
                } else {
                    cleanVersesHTML += `<p class="scripture-loading-placeholder">[ Scripture text for ${chItem.book} Chapter ${chItem.chapter} is processing... ]</p>`;
                }

                htmlOutput += `
                    <div class="chapter-verses-block">
                        <h4 style="margin: 20px 0 10px 0; color: #1E3A8A;">${chItem.book} Chapter ${chItem.chapter}</h4>
                        ${cleanVersesHTML}
                    </div>
                `;
            });

            htmlOutput += `
                <p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; margin-top: 40px; padding-bottom: 40px; border-top: 1px dashed #e5e7eb; pt: 20px;">
                    • You have reached the end of today's text. Scroll all the way down to mark completed. •
                </p>
            `;

       bibleTextContentTarget.innerHTML = htmlOutput;
            attachVerseLongPressListeners();
        }

        // Attach active day ID so saveDayNotes() knows which day to save to
        const notesInput = document.getElementById('daily-notes-input');
        if (notesInput) {
            notesInput.dataset.activeDayId = dayItem.id;
        }

        // Load saved notes for this specific day
        loadDayNotes(dayItem.id);

        showPage(scriptureReaderPage);
        updateHeader('reader_mode');
        
        setTimeout(() => {
            setupScrollAutoCheck(dayItem.id, dayItem.hasText);
        }, 150);
    }

    function setupScrollAutoCheck(dayId, canMarkComplete) {
        if (autoScrollObserver) autoScrollObserver.disconnect();
        if (!canMarkComplete) return;

        const scrollContainer = document.getElementById('bible-text-scroll-box');
        const triggerElement = document.getElementById('scroll-completion-trigger');
        
        if (!scrollContainer || !triggerElement) return;

        autoScrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    markDayAsComplete(dayId);
                }
            });
        }, {
            root: scrollContainer,
            rootMargin: '0px 0px 50px 0px',
            threshold: 0.1
        });

        autoScrollObserver.observe(triggerElement);
    }

   function markDayAsComplete(dayId) {
        if (currentUser) {
            if (!userReadingMap[dayId]) {
                userReadingMap[dayId] = true;
                const updatedStreak = calculateCalendarStreakOnMark();

                db.collection('users').doc(currentUser.uid).update({
                    readingMap: userReadingMap,
                    currentStreak: updatedStreak,
                    lastReadDate: getTrueLocalDateString()
                }).then(() => {
                    currentUser.currentStreak = updatedStreak;
                    initializeChallengeDashboard();
                });
            }
        } else {
            const completedMap = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || {};
            if (!completedMap[dayId]) {
                completedMap[dayId] = true;
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(completedMap));
                calculateCalendarStreakOnMark();
                initializeChallengeDashboard();
            }
        }
    }

    const announcementBadge = document.getElementById('announcement-badge');
    const lastSeenAnnouncement = localStorage.getItem('csatpurdue_last_seen_announcement');

    // Show badge on startup if user hasn't seen the latest announcement
    if (announcementBadge) {
        if (lastSeenAnnouncement !== LATEST_ANNOUNCEMENT_ID) {
            announcementBadge.style.display = 'inline-block';
        } else {
            announcementBadge.style.display = 'none';
        }
    }

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentActiveBtn = document.querySelector('.nav-btn.active');
            if (currentActiveBtn) currentActiveBtn.classList.remove('active');
            button.classList.add('active');
            
            const target = button.getAttribute('data-target');
            
            // Clear red dot when clicking the Announcements tab
            if (target === 'announcements') {
                localStorage.setItem('csatpurdue_last_seen_announcement', LATEST_ANNOUNCEMENT_ID);
                if (announcementBadge) {
                    announcementBadge.style.display = 'none';
                }
            }

            pages.forEach(p => p.classList.remove('active-page'));
            
            const targetPage = document.getElementById(`${target}-page`);
            if (targetPage) targetPage.classList.add('active-page');
            
            updateHeader(target);
        });
    });

    function updateHeader(section) {
        if (!appHeader || !headerTitle) return;
        if (section === 'home' || section === 'reader_mode' || section === 'life_practices' || section === 'ot_schedule') {
            appHeader.classList.add('hidden-header');
        } else {
            appHeader.classList.remove('hidden-header');
            headerTitle.innerText = "";
        }
    }

    function showPage(pageElement) {
        const allDynamicPages = document.querySelectorAll('.app-page');
        allDynamicPages.forEach(p => p.classList.remove('active-page'));
        if (pageElement) pageElement.classList.add('active-page');
    }

   function renderOTSchedule() {
    const otContainer = document.getElementById('ot-days-list');
    if (!otContainer) return;
    
    otContainer.innerHTML = '';
    const completedOTMap = JSON.parse(localStorage.getItem('csatpurdue_ot_progress')) || {};
    let completedCount = 0;

    OT_SCHEDULE.forEach(item => {
        const isDone = !!completedOTMap[item.id];
        if (isDone) completedCount++;

        const row = document.createElement('div');
        row.className = `day-row-item ${isDone ? 'is-completed' : ''}`;
        
        row.innerHTML = `
            <div class="day-left-meta">
                <span class="day-title-string">${item.dateLabel}</span>
                <span class="day-assignment-string">${item.assignment}</span>
            </div>
            <div class="completion-check-circle"></div>
        `;

        row.addEventListener('click', () => {
            completedOTMap[item.id] = !completedOTMap[item.id];
            localStorage.setItem('csatpurdue_ot_progress', JSON.stringify(completedOTMap));
            renderOTSchedule();
        });

        otContainer.appendChild(row);
    });

    const percent = Math.round((completedCount / OT_SCHEDULE.length) * 100) || 0;
    const fillBar = document.getElementById('ot-progress-bar-fill');
    const percentText = document.getElementById('ot-progress-percent');
    const countString = document.getElementById('ot-progress-count-string');

    if (fillBar) fillBar.style.width = `${percent}%`;
    if (percentText) percentText.innerText = `${percent}%`;
    if (countString) countString.innerText = `${completedCount} of ${OT_SCHEDULE.length} completed`;

    // AUTO-SCROLL ADDED HERE:
    scrollListToTargetDay(otContainer);
}
    if (btnSummerSupply) {
        btnSummerSupply.addEventListener('click', () => {
            initializeChallengeDashboard();
            showPage(summerSupplyPage);
            updateHeader('summer_supply');
            scrollListToTargetDay(daysListContainer);
        });
    }

    if (btnDailyChallenges) {
        btnDailyChallenges.addEventListener('click', () => {
            renderOTSchedule();
            showPage(otSchedulePage);
            updateHeader('ot_schedule');
            scrollListToTargetDay(document.getElementById('ot-days-list'));
        });
    }

    if (btnBackToHomeFromOT) {
        btnBackToHomeFromOT.addEventListener('click', () => {
            showPage(document.getElementById('home-page'));
            updateHeader('home');
        });
    }

    if (btnBackToHomeFromEating) {
        btnBackToHomeFromEating.addEventListener('click', () => {
            showPage(document.getElementById('home-page'));
            if (appHeader) appHeader.classList.remove('hidden-header'); 
        });
    }
    
    if (btnBackToHomeFromSummer) {
        btnBackToHomeFromSummer.addEventListener('click', () => {
            showPage(document.getElementById('home-page'));
            updateHeader('home');
        });
    }

    if (btnBackToChallenge) {
        btnBackToChallenge.addEventListener('click', () => {
            if (bibleTextScrollBox) bibleTextScrollBox.scrollTop = 0;
            showPage(summerSupplyPage);
            updateHeader('summer_supply');
        });
    }

    if (btnCommonFaith) {
        btnCommonFaith.addEventListener('click', () => {
            showPage(document.getElementById('common-faith-page'));
            updateHeader('faith');
        });
    }

    if (btnBackToAbout) {
        btnBackToAbout.addEventListener('click', () => {
            showPage(document.getElementById('about-page'));
            updateHeader('about');
        });
    }

    // Setup notes auto-save on typing
    const notesInput = document.getElementById('daily-notes-input');
    if (notesInput) {
        let debounceTimer;
        notesInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(saveDayNotes, 800);
        });
    }

    updateHeader('home');
    verifyStreakValidityOnBoot();
}

const bibleTextDatabase = {};
const dynamicBookTitles = {};
const dynamicBookSubjects = {};

function parseRawScriptureText() {
    const sourceBox = document.getElementById('raw-scripture-source-box');
    if (!sourceBox) return;

    const lines = sourceBox.value.split('\n');
    let currentBookName = "";
    let lastSeenTitle = "";
    let isCapturingSubject = false;
    let subjectBuffer = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (line.startsWith("The Epistle") || line.startsWith("The First Epistle") || line.startsWith("The Second Epistle") || line.startsWith("The Third Epistle") || line.startsWith("The Revelation")) {
            lastSeenTitle = line;
            isCapturingSubject = false;
            continue;
        }

        if (line.startsWith("Subject:")) {
            isCapturingSubject = true;
            subjectBuffer = [];
            continue;
        }

        if (line.includes("Chapter") || line.includes("Philemon") || line.includes("2 John") || line.includes("3 John") || line.includes("Jude")) {
            isCapturingSubject = false;
            if (line.includes("Chapter")) {
                const parts = line.split("Chapter");
                currentBookName = parts[0].trim();
            } else if (line.includes("Philemon")) currentBookName = "Philemon";
            else if (line.includes("2 John")) currentBookName = "2 John";
            else if (line.includes("3 John")) currentBookName = "3 John";
            else if (line.includes("Jude")) currentBookName = "Jude";

            if (lastSeenTitle && currentBookName) dynamicBookTitles[currentBookName] = lastSeenTitle;
            if (subjectBuffer.length > 0 && currentBookName) dynamicBookSubjects[currentBookName] = subjectBuffer.join(" ");
            if (line.includes("Chapter")) continue;
        }

        if (isCapturingSubject && !line.match(/^([1-4]?\s*[A-Za-z.]+)\s*\d+/)) {
            subjectBuffer.push(line);
            continue;
        }

        const universalPattern = /^([1-4]?\s*[A-Za-z.]+)\s*(?:(\d+):)?(\d+)\s+(.*)/;
        const match = line.match(universalPattern);

        if (match) {
            isCapturingSubject = false;
            const chapterNum = match[2] ? parseInt(match[2], 10) : 1; 
            const verseText = match[4].trim();

            let normalizedBook = currentBookName;
            let bookKey = match[1].toLowerCase().replace(/\./g, '').trim();
            
            if (bookKey.includes("tit")) normalizedBook = "Titus";
            else if (bookKey.includes("philem") || bookKey.includes("phm")) normalizedBook = "Philemon";
            else if (bookKey.includes("heb")) normalizedBook = "Hebrews";
            else if (bookKey.includes("jas") || bookKey.includes("jam")) normalizedBook = "James";
            else if (bookKey.includes("1 pet")) normalizedBook = "1 Peter";
            else if (bookKey.includes("2 pet")) normalizedBook = "2 Peter";
            else if (bookKey.includes("1 john") || bookKey.includes("1 jn")) normalizedBook = "1 John";
            else if (bookKey.includes("2 john") || bookKey.includes("2 jn")) normalizedBook = "2 John";
            else if (bookKey.includes("3 john") || bookKey.includes("3 jn")) normalizedBook = "3 John";
            else if (bookKey.includes("jude")) normalizedBook = "Jude";
            else if (bookKey.includes("rev")) normalizedBook = "Revelation";

            if (normalizedBook) {
                if (!bibleTextDatabase[normalizedBook]) bibleTextDatabase[normalizedBook] = {};
                if (!bibleTextDatabase[normalizedBook][chapterNum]) bibleTextDatabase[normalizedBook][chapterNum] = [];
                bibleTextDatabase[normalizedBook][chapterNum].push(verseText);
            }
        }
    }
}

function getTrueLocalDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function calculateCalendarStreakOnMark() {
    const todayStr = getTrueLocalDateString();
    let lastRead = currentUser ? currentUser.lastReadDate : localStorage.getItem('csatpurdue_last_read_date');
    let streak = currentUser ? (currentUser.currentStreak || 0) : (parseInt(localStorage.getItem('csatpurdue_streak_count')) || 0);

    if (!lastRead) {
        streak = 1;
    } else if (lastRead === todayStr) {
        return streak;
    } else {
        const lastDate = new Date(lastRead);
        const currentDate = new Date(todayStr);
        const diffTime = Math.abs(currentDate - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            streak += 1;
        } else {
            streak = 1;
        }
    }

    if (!currentUser) {
        localStorage.setItem('csatpurdue_streak_count', streak);
        localStorage.setItem('csatpurdue_last_read_date', todayStr);
    }
    return streak;
}

function verifyStreakValidityOnBoot() {
    const lastRead = localStorage.getItem('csatpurdue_last_read_date');
    if (!lastRead) return;

    const todayStr = getTrueLocalDateString();
    const lastDate = new Date(lastRead);
    const currentDate = new Date(todayStr);
    const diffTime = Math.abs(currentDate - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
        localStorage.setItem('csatpurdue_streak_count', 0);
    }
}

document.addEventListener('ScriptureDataLoaded', () => {
    parseRawScriptureText();
    bootUpApplicationEngine();
});

/* =======================================================
   🔴 LONG PRESS & HIGHLIGHT POPOVER CORE LOGIC
======================================================= */
let pressTimer = null;
let selectedVerseEl = null;

function attachVerseLongPressListeners() {
    const verseEls = document.querySelectorAll('.bible-verse-p');

    verseEls.forEach(el => {
        const startPress = (e) => {
            clearTimeout(pressTimer);
            pressTimer = setTimeout(() => {
                selectedVerseEl = el;
                showHighlightPopover(el);
            }, 400);
        };

        const cancelPress = () => {
            clearTimeout(pressTimer);
        };

        el.addEventListener('touchstart', startPress, { passive: true });
        el.addEventListener('touchend', cancelPress, { passive: true });
        el.addEventListener('touchmove', cancelPress, { passive: true });
        
        el.addEventListener('mousedown', startPress);
        el.addEventListener('mouseup', cancelPress);
        el.addEventListener('mouseleave', cancelPress);
    });
}

function showHighlightPopover(element) {
    const popover = document.getElementById('highlight-popover');
    if (!popover) return;

    const rect = element.getBoundingClientRect();
    
    popover.style.display = 'flex';
    popover.style.position = 'absolute';
    popover.style.top = `${rect.top + window.scrollY - 54}px`;
    popover.style.left = `${rect.left + (rect.width / 2)}px`;
    popover.style.transform = 'translateX(-50%)';
}

document.addEventListener('click', (e) => {
    const popover = document.getElementById('highlight-popover');
    if (!popover) return;

    const targetColorBtn = e.target.closest('.hl-color-btn');
    const targetRemoveBtn = e.target.closest('#hl-remove-btn');

    if (targetColorBtn) {
        const color = targetColorBtn.getAttribute('data-color');
        applyVerseHighlight(color);
    } else if (targetRemoveBtn) {
        applyVerseHighlight(null);
    } else if (!popover.contains(e.target) && selectedVerseEl && !selectedVerseEl.contains(e.target)) {
        popover.style.display = 'none';
    }
});

function applyVerseHighlight(color) {
    if (!selectedVerseEl) return;
    const verseId = selectedVerseEl.getAttribute('data-verse-id');

    selectedVerseEl.classList.remove('hl-yellow', 'hl-blue', 'hl-pink');

    if (color) {
        selectedVerseEl.classList.add(`hl-${color}`);
        userHighlightsMap[verseId] = color;
    } else {
        delete userHighlightsMap[verseId];
    }

    const popover = document.getElementById('highlight-popover');
    if (popover) popover.style.display = 'none';

    saveUserHighlights();
}

function saveUserHighlights() {
    if (currentUser) {
        db.collection('users').doc(currentUser.uid).update({
            highlights: userHighlightsMap
        }).catch(err => console.error("Error saving highlights to Firebase:", err));
    } else {
        localStorage.setItem(HIGHLIGHTS_STORAGE_KEY, JSON.stringify(userHighlightsMap));
    }
}

// Check and reset broken streak when user re-opens or switches back to the app tab
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && currentUser) {
        const todayStr = getTrueLocalDateString();
        const lastRead = currentUser.lastReadDate;
        
        if (lastRead && currentUser.currentStreak > 0) {
            const lastDate = new Date(lastRead);
            const currentDate = new Date(todayStr);
            const diffTime = Math.abs(currentDate - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 1) {
                currentUser.currentStreak = 0;
                db.collection('users').doc(currentUser.uid).update({
                    currentStreak: 0
                });
                calculateStats();
            }
        }
    }
});

/* =======================================================
   📝 DAILY NOTES & PRAYERS AUTO-SAVE LOGIC
======================================================= */
function loadDayNotes(dayId) {
    const notesInput = document.getElementById('daily-notes-input');
    if (!notesInput) return;

    notesInput.dataset.activeDayId = dayId;

    if (currentUser) {
        const userNotes = currentUser.notes || {};
        notesInput.value = userNotes[dayId] || '';
    } else {
        const localNotes = JSON.parse(localStorage.getItem('csatpurdue_user_notes')) || {};
        notesInput.value = localNotes[dayId] || '';
    }
}

function saveDayNotes() {
    const notesInput = document.getElementById('daily-notes-input');
    const saveStatus = document.getElementById('notes-save-status');
    if (!notesInput) return;

    const dayId = notesInput.dataset.activeDayId;
    if (!dayId) return;

    const noteText = notesInput.value;

    if (currentUser) {
        const userNotes = currentUser.notes || {};
        userNotes[dayId] = noteText;
        currentUser.notes = userNotes;

        db.collection('users').doc(currentUser.uid).update({
            notes: userNotes
        }).then(() => showSaveIndicator(saveStatus));
    } else {
        const localNotes = JSON.parse(localStorage.getItem('csatpurdue_user_notes')) || {};
        localNotes[dayId] = noteText;
        localStorage.setItem('csatpurdue_user_notes', JSON.stringify(localNotes));
        showSaveIndicator(saveStatus);
    }
}

function showSaveIndicator(element) {
    if (!element) return;
    element.classList.add('visible');
    setTimeout(() => {
        element.classList.remove('visible');
    }, 2000);
}