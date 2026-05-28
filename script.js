function bootUpApplicationEngine() {
    
    // Core Navigation Selectors
    const navButtons = document.querySelectorAll('.nav-btn');
    const appHeader = document.getElementById('app-header');
    const headerTitle = document.getElementById('header-title');
    const pages = document.querySelectorAll('.app-page');
    
    // Home Dashboard Buttons
    const btnSummerSupply = document.getElementById('btn-summer-supply');
    const btnCommonFaith = document.getElementById('btn-common-faith');
    const btnBackToAbout = document.getElementById('back-to-about-btn');
    const btnDailyChallenges = document.getElementById('btn-daily-challenges');
    const lifeChallengesPage = document.getElementById('life-challenges-page');
    const btnBackToHomeFromLife = document.getElementById('back-to-home-from-life');
    const btnEatingGodsWord = document.getElementById('btn-eating-word'); 
    const eatingGodsWordPage = document.getElementById('eating-gods-word-page');
    const btnBackToHomeFromEating = document.getElementById('back-to-home-from-eating');

    // Challenge & Reader Specific Elements
    const summerSupplyPage = document.getElementById('summer-supply-page');
    const scriptureReaderPage = document.getElementById('scripture-reader-page');
    const btnBackToHomeFromSummer = document.getElementById('back-to-home-from-summer');
    const btnBackToChallenge = document.getElementById('back-to-challenge-btn');
    const daysListContainer = document.getElementById('reading-days-list');
    
    // --- MINISTRY PORTIONS DECK DATA ---
    const ministryCardsData = [
        { id: 1, title: "Pray-Reading", desc: "Receiving the Word of God by means of all prayer. Turn the lines into your direct expression to God." },
        { id: 2, title: "Spiritual Milk", desc: "As newborn babes, long for the guileless milk of the word in order that by it you may grow unto salvation." },
        { id: 3, title: "Word Indwelling", desc: "Let the word of Christ dwell in you richly in all wisdom, teaching and admonishing one another." },
        { id: 4, title: "Constant Eating", desc: "Your words were found and I ate them; Your words became the gladness and joy of my heart." }
    ];
    
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressPercentText = document.getElementById('progress-percent');
    const progressCountString = document.getElementById('progress-count-string');
    const streakDisplayText = document.getElementById('streak-display-text');
    
    const readerAssignmentHeader = document.getElementById('reader-heading-assignment');
    const readerDateHeader = document.getElementById('reader-heading-date');
    const bibleTextScrollBox = document.getElementById('bible-text-scroll-box');
    const bibleTextContentTarget = document.getElementById('bible-text-content-target');
    const completionTrigger = document.getElementById('scroll-completion-trigger');

    let currentActiveIndexReading = null;
    let autoScrollObserver = null;

    // 1. GENERATE CHALLENGE TIMELINE DATA
    const readingChallengeData = [];
    const startDate = new Date(2026, 5, 1); // June 1, 2026
    
    const booksConfig = [
        { name: "Romans", chapters: 16 },
        { name: "1 Corinthians", chapters: 16 },
        { name: "2 Corinthians", chapters: 13 },
        { name: "Galatians", chapters: 6 },
        { name: "Ephesians", chapters: 6 },
        { name: "Philippians", chapters: 4 },
        { name: "Colossians", chapters: 4 },
        { name: "1 Thessalonians", chapters: 5 },
        { name: "2 Thessalonians", stroke: 3, chapters: 3 },
        { name: "1 Timothy", chapters: 6 },
        { name: "2 Timothy", chapters: 4 }
    ];

    let bookIndex = 0;
    let currentChapter = 1;

    for (let dayOffset = 0; dayOffset < 84; dayOffset++) {
        const targetDayDate = new Date(startDate);
        targetDayDate.setDate(startDate.getDate() + dayOffset);
        
        const dateOptions = { month: 'short', day: 'numeric', weekday: 'short' };
        const dateString = targetDayDate.toLocaleDateString('en-US', dateOptions);
        
        let assignmentLabel = "Challenge Complete! Catch-Up Day";
        let hasChapterText = false;
        let bookKeyName = "";
        let chapterNumberValue = 0;

        if (bookIndex < booksConfig.length) {
            const activeBook = booksConfig[bookIndex];
            assignmentLabel = `${activeBook.name} Chapter ${currentChapter}`;
            bookKeyName = activeBook.name;
            chapterNumberValue = currentChapter;
            hasChapterText = true;

            currentChapter++;
            if (currentChapter > activeBook.chapters) {
                bookIndex++;
                currentChapter = 1;
            }
        }

        readingChallengeData.push({
            id: dayOffset,
            dateLabel: dateString,
            assignment: assignmentLabel,
            hasText: hasChapterText,
            book: bookKeyName,
            chapter: chapterNumberValue
        });
    }

    // Initialize challenge dashboard list items
    function initializeChallengeDashboard() {
        if (!daysListContainer) return;
        daysListContainer.innerHTML = '';

        const completedMap = JSON.parse(localStorage.getItem('csatpurdue_reading_map')) || {};

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
    }

    // STATS & STREAK CALCULATIONS
    function calculateStats() {
        const completedMap = JSON.parse(localStorage.getItem('csatpurdue_reading_map')) || {};
        let completedCount = 0;
        
        readingChallengeData.forEach(day => {
            if (day.hasText && completedMap[day.id]) completedCount++;
        });

        const progressPercent = Math.round((completedCount / 83) * 100);
        
        if (progressBarFill) progressBarFill.style.width = `${progressPercent}%`;
        if (progressPercentText) progressPercentText.innerText = `${progressPercent}%`;
        if (progressCountString) progressCountString.innerText = `${completedCount} of 83 chapters read`;

        calculateCalendarStreakOnMark();

        let currentStreak = parseInt(localStorage.getItem('csatpurdue_streak_count')) || 0;
        if (streakDisplayText) {
            streakDisplayText.innerText = `${currentStreak} Day Streak`;
        }

        checkAndRenderEarnedBadges(completedMap);
    }

    // --- AUTOMATIC BOOK COMPLETION BADGE ENGINE ---
    function checkAndRenderEarnedBadges(completedMap) {
        const badgeRowContainer = document.getElementById('badges-container-row');
        if (!badgeRowContainer) return;
        badgeRowContainer.innerHTML = ''; 

        const bookCompletionTracker = {};

        readingChallengeData.forEach(day => {
            if (!day.hasText || !day.book) return; 

            if (!bookCompletionTracker[day.book]) {
                bookCompletionTracker[day.book] = {
                    totalChapters: 0,
                    completedChapters: 0
                };
            }

            bookCompletionTracker[day.book].totalChapters += 1;
            if (completedMap[day.id]) {
                bookCompletionTracker[day.book].completedChapters += 1;
            }
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

    // SCRIPTURE READER DISPLAY & GENERATION LOGIC
    function openScriptureReader(dayItem) {
        currentActiveIndexReading = dayItem.id;
        if (readerAssignmentHeader) readerAssignmentHeader.innerText = dayItem.assignment;
        if (readerDateHeader) readerDateHeader.innerText = dayItem.dateLabel;
        
        if (bibleTextScrollBox) bibleTextScrollBox.scrollTop = 0;

        if (bibleTextContentTarget) {
            if (!dayItem.hasText) {
                bibleTextContentTarget.innerHTML = `<p>Congratulations on completing the New Testament challenge! Spend today reviewing your favorite passages or catching up on any missed days.</p>`;
            } else {
                let htmlOutput = ``;

                if (dayItem.chapter === 1) {
                    const currentTitle = dynamicBookTitles[dayItem.book] || `${dayItem.book}`;
                    const currentSubject = dynamicBookSubjects[dayItem.book] || "Subject description text is parsing...";

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
                if (bibleTextDatabase[dayItem.book] && bibleTextDatabase[dayItem.book][dayItem.chapter]) {
                    const versesArray = bibleTextDatabase[dayItem.book][dayItem.chapter];
                    versesArray.forEach((verseText, index) => {
                        cleanVersesHTML += `<p><span class="clean-verse-num">Verse ${index + 1}</span> ${verseText}</p>`;
                    });
                } else {
                    cleanVersesHTML += `<p class="scripture-loading-placeholder">[ Scripture text for ${dayItem.book} Chapter ${dayItem.chapter} is processing or layout matches are loading... ]</p>`;
                }

                htmlOutput += `
                    <div class="chapter-verses-block">
                        ${cleanVersesHTML}
                        <p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; margin-top: 40px; padding-bottom: 40px; border-top: 1px dashed #e5e7eb; pt: 20px;">
                            • You have reached the end of today's text. Scroll completely down to check off this assignment. •
                        </p>
                    </div>
                `;

                bibleTextContentTarget.innerHTML = htmlOutput;
            }
        }

        showPage(scriptureReaderPage);
        updateHeader('reader_mode');
        
        setTimeout(() => {
            setupScrollAutoCheck(dayItem.id, dayItem.hasText);
        }, 150);
    }

    // COMPLETION DETECTION ENGINE
    function setupScrollAutoCheck(dayId, canMarkComplete) {
        if (autoScrollObserver) autoScrollObserver.disconnect();
        if (!canMarkComplete) return;

        const scrollContainer = document.getElementById('bible-text-scroll-box');
        const triggerElement = document.getElementById('scroll-completion-trigger');
        
        if (!scrollContainer || !triggerElement) {
            console.error("Scroll viewport or trigger target missing.");
            return;
        }

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
        const completedMap = JSON.parse(localStorage.getItem('csatpurdue_reading_map')) || {};
        
        if (!completedMap[dayId]) {
            completedMap[dayId] = true;
            localStorage.setItem('csatpurdue_reading_map', JSON.stringify(completedMap));
            initializeChallengeDashboard();
            console.log(`Day assignment index ${dayId} successfully checked off!`);
        }
    }

    // LIFE PRACTICE CHALLENGES LOGIC MODULE
    function loadAndBuildLifePracticeChallenges() {
        const listContainer = document.getElementById('life-practices-scroll-track');
        if (!listContainer) return;

        listContainer.innerHTML = '';

        const localChallengesData = [
            { title: "Spend 10 minutes with the Lord 5 mornings this week BEFORE you turn on your phone or check notifications.", steps: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"] },
            { title: "Tell the Lord you love Him 100 times today.", steps: [] },
            { title: "Pray this prayer every morning for one week. “Lord Jesus, I love You. Conquer me today. Make me Your captive. Never let me win. Defeat me all the time.”", steps: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"] },
            { title: "Give someone a Bible.", steps: [] },
            { title: "Find a private place (your car, alone, at the far end of a parking lot, works well) and call on the Lord OUT LOUD 100 times.", steps: [] },
            { title: "Speak the gospel to someone. Bring a companion along if you want.", steps: [] },
            { title: "Get a blank piece of paper or notebook and write down a conversation to the Lord. Tell Him your whole heart. Complain. Be real. Don’t stop until you are writing “Lord Jesus, I love You!” and mean it. Throw the paper away when you are done.", steps: [] },
            { title: "Read a chapter of the New Testament before bed every day this week. Let it be the very last thing you look at before you close your eyes.", steps: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"] },
            { title: "Turn off notifications for all your social media accounts (instagram, youtube, snapchat, tiktok, etc.) and leave them off for at least one week.", steps: [] },
            { title: "Take a social media break for an entire day. If you make it through, try again the next day. See if you can get to 10 days.", steps: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"] },
            { title: "Pray this prayer every morning for a week. “Lord, strengthen me with power through Your spirit into my inner man today. Make Your home more in my heart today. Give me today’s normal amount of growth in life.”", steps: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"] },
            { title: "End every day this week with a time of confession with the Lord. He is faithful and righteous to forgive us our sins and cleanse us from all unrighteousness. We just need to ask.", steps: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"] },
            { title: "Spend 5 minutes in the middle of your day to pray.", steps: [] }
        ];

        const completedMap = JSON.parse(localStorage.getItem('csatpurdue_life_challenges_map')) || {};
        const savedNotesMap = JSON.parse(localStorage.getItem('csatpurdue_life_challenges_notes')) || {};

        localChallengesData.forEach((challenge, index) => {
            const cardId = `challenge_card_${index}`;
            const cardEl = document.createElement('div');
            cardEl.className = 'practice-challenge-card';

            if (challenge.steps.length > 0) {
                let subStepsHTML = '';
                challenge.steps.forEach((stepName, stepIdx) => {
                    const stepId = `${cardId}_step_${stepIdx}`;
                    const isChecked = !!completedMap[stepId];
                    subStepsHTML += `
                        <div class="substep-pill-item">
                            <span class="substep-pill-label">${stepName}</span>
                            <div class="practice-check-box-node ${isChecked ? 'is-checked' : ''}" data-step-id="${stepId}"></div>
                        </div>
                    `;
                });

                cardEl.innerHTML = `
                    <div class="challenge-card-header-row">
                        <h3 class="challenge-card-main-title">${challenge.title}</h3>
                    </div>
                    <div class="challenge-substeps-grid-track">
                        ${subStepsHTML}
                    </div>
                `;
            } else {
                const isChecked = !!completedMap[cardId];
                cardEl.innerHTML = `
                    <div class="challenge-card-header-row">
                        <h3 class="challenge-card-main-title">${challenge.title}</h3>
                        <div class="practice-check-box-node ${isChecked ? 'is-checked' : ''}" data-step-id="${cardId}"></div>
                    </div>
                `;
            }

            const savedNoteValue = savedNotesMap[cardId] || "";
            const textareaEl = document.createElement('textarea');
            textareaEl.className = 'challenge-user-notes-textbox';
            textareaEl.placeholder = 'Jot down your thoughts or note progress here...';
            textareaEl.value = savedNoteValue;

            textareaEl.addEventListener('input', (e) => {
                const trackingNotes = JSON.parse(localStorage.getItem('csatpurdue_life_challenges_notes')) || {};
                trackingNotes[cardId] = e.target.value;
                localStorage.setItem('csatpurdue_life_challenges_notes', JSON.stringify(trackingNotes));
            });

            cardEl.appendChild(textareaEl);

            const checkBoxes = cardEl.querySelectorAll('.practice-check-box-node');
            checkBoxes.forEach(box => {
                box.addEventListener('click', () => {
                    const targetId = box.getAttribute('data-step-id');
                    const currentTrackingMap = JSON.parse(localStorage.getItem('csatpurdue_life_challenges_map')) || {};

                    if (box.classList.contains('is-checked')) {
                        box.classList.remove('is-checked');
                        delete currentTrackingMap[targetId];
                    } else {
                        box.classList.add('is-checked');
                        currentTrackingMap[targetId] = true;
                    }

                    localStorage.setItem('csatpurdue_life_challenges_map', JSON.stringify(currentTrackingMap));
                });
            });

            listContainer.appendChild(cardEl);
        });
    }

    // BASE APP NAVIGATION ROUTER
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentActiveBtn = document.querySelector('.nav-btn.active');
            if (currentActiveBtn) currentActiveBtn.classList.remove('active');
            button.classList.add('active');
            
            const target = button.getAttribute('data-target');
            pages.forEach(p => p.classList.remove('active-page'));
            
            const targetPage = document.getElementById(`${target}-page`);
            if (targetPage) targetPage.classList.add('active-page');
            
            updateHeader(target);
        });
    });

    function updateHeader(section) {
        if (!appHeader || !headerTitle) return;
        
        if (section === 'home' || section === 'reader_mode' || section === 'life_practices') {
            appHeader.classList.add('hidden-header');
        } else {
            appHeader.classList.remove('hidden-header');
            const titles = {
                'about': "About Us",
                'announcements': "Announcements",
                'media': "Media Center",
                'gospel': "The Gospel",
                'summer_supply': "Summer Supply",
                'faith': "Our Faith"
            };
            headerTitle.innerText = titles[section] || "Christian Students at Purdue";
        }
    }

    function showPage(pageElement) {
        const allDynamicPages = document.querySelectorAll('.app-page');
        allDynamicPages.forEach(p => p.classList.remove('active-page'));
        if (pageElement) pageElement.classList.add('active-page');
    }

    if (btnSummerSupply) {
        btnSummerSupply.addEventListener('click', () => {
            initializeChallengeDashboard();
            showPage(summerSupplyPage);
            updateHeader('summer_supply');
        });
    }

    if (btnDailyChallenges) {
        btnDailyChallenges.addEventListener('click', () => {
            loadAndBuildLifePracticeChallenges();
            showPage(lifeChallengesPage);
            updateHeader('life_practices');
        });
    } 

    // 🟢 SYNCHRONIZED CLICK HANDLER FOR EATING GOD'S WORD
    if (btnEatingGodsWord) {
        btnEatingGodsWord.addEventListener('click', () => {
            showPage(eatingGodsWordPage);
            
            const appHeader = document.getElementById('app-header');
            if (appHeader) appHeader.classList.add('hidden-header');
            
            initializeMinistryDeck();
            loadAndBuildJuicyVerses();
        });
    }

    if (btnBackToHomeFromEating) {
        btnBackToHomeFromEating.addEventListener('click', () => {
            showPage(document.getElementById('home-page'));
            
            const appHeader = document.getElementById('app-header');
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
            if (bibleTextScrollBox) {
                bibleTextScrollBox.scrollTop = 0;
            }
            showPage(summerSupplyPage);
            updateHeader('summer_supply');
        });
    }

    if (btnBackToHomeFromLife) {
        btnBackToHomeFromLife.addEventListener('click', () => {
            showPage(document.getElementById('home-page'));
            updateHeader('home');
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

    updateHeader('home');
    verifyStreakValidityOnBoot();
}

// --- UNIVERSAL TEXT PARSER ENGINE ---
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

        if (line.startsWith("The Epistle") || line.startsWith("The First Epistle") || line.startsWith("The Second Epistle")) {
            lastSeenTitle = line;
            isCapturingSubject = false;
            continue;
        }

        if (line.startsWith("Subject:")) {
            isCapturingSubject = true;
            subjectBuffer = [];
            continue;
        }

        if (line.includes("Chapter")) {
            isCapturingSubject = false;
            const parts = line.split("Chapter");
            currentBookName = parts[0].trim();
            
            if (lastSeenTitle && currentBookName) {
                dynamicBookTitles[currentBookName] = lastSeenTitle;
            }
            if (subjectBuffer.length > 0 && currentBookName) {
                dynamicBookSubjects[currentBookName] = subjectBuffer.join(" ");
            }
            continue;
        }

        if (isCapturingSubject && !line.match(/^([1-4]?\s*[A-Za-z.]+)\s*\d+:/)) {
            subjectBuffer.push(line);
            continue;
        }

        const universalPattern = /^([1-4]?\s*[A-Za-z.]+)\s*(\d+):(\d+)\s*(.*)/;
        const match = line.match(universalPattern);

        if (match) {
            isCapturingSubject = false;
            const chapterNum = parseInt(match[2], 10);
            const verseText = match[4].trim();

            let normalizedBook = currentBookName;
            let bookKey = match[1].toLowerCase().replace(/\./g, '').trim();
            
            if (bookKey.includes("rom")) normalizedBook = "Romans";
            else if (bookKey.includes("1 cor")) normalizedBook = "1 Corinthians";
            else if (bookKey.includes("2 cor")) normalizedBook = "2 Corinthians";
            else if (bookKey.includes("gal")) normalizedBook = "Galatians";
            else if (bookKey.includes("eph")) normalizedBook = "Ephesians";
            else if (bookKey.includes("phi")) normalizedBook = "Philippians";
            else if (bookKey.includes("col")) normalizedBook = "Colossians";
            else if (bookKey.includes("1 the")) normalizedBook = "1 Thessalonians";
            else if (bookKey.includes("2 the")) normalizedBook = "2 Thessalonians";
            else if (bookKey.includes("1 tim")) normalizedBook = "1 Timothy";
            else if (bookKey.includes("2 tim")) normalizedBook = "2 Timothy";

            if (normalizedBook) {
                if (!bibleTextDatabase[normalizedBook]) {
                    bibleTextDatabase[normalizedBook] = {};
                }
                if (!bibleTextDatabase[normalizedBook][chapterNum]) {
                    bibleTextDatabase[normalizedBook][chapterNum] = [];
                }
                bibleTextDatabase[normalizedBook][chapterNum].push(verseText);
            }
        }
    }
}

// --- EATING GOD'S WORD INTERACTIVE CONTROLS ENGINE ---

function initializeMinistryDeck() {
    const cardTrackContainer = document.getElementById('ministry-card-track');
    const imageModal = document.getElementById('image-fullscreen-modal');
    const modalImg = document.getElementById('modal-target-image');
    const modalClose = document.getElementById('close-image-modal');
    
    if (!cardTrackContainer) return;
    cardTrackContainer.innerHTML = '';
    
    const graphicDeckData = [
        { id: "fruit", thumb: "thumb-fruit.png", full: "full-fruit.png" },
        { id: "eat",   thumb: "thumb-eat.png",   full: "full-eat.png" },
        { id: "speak", thumb: "thumb-speak.png", full: "full-speak.png" }
    ];

    graphicDeckData.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'ministry-preview-card';
        cardEl.innerHTML = `<img src="${card.thumb}" class="deck-display-graphic" alt="Ministry Thumbnail">`;

        cardEl.addEventListener('click', () => {
            if (imageModal && modalImg) {
                modalImg.src = card.full;       
                imageModal.style.display = 'flex'; 
            }
        });

        cardTrackContainer.appendChild(cardEl);
    });

    if (modalClose && imageModal) {
        modalClose.addEventListener('click', () => {
            imageModal.style.display = 'none'; 
        });
        
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal) {
                imageModal.style.display = 'none';
            }
        });
    }
}

function loadAndBuildJuicyVerses() {
    // 🟢 1. Grab the container right now inside the function so it's fresh and ready
    const juicyVersesContainer = document.getElementById('juicy-verses-container');

    // 2. Now this safe check works flawlessly instead of killing the button!
    if (!juicyVersesContainer) return;
    juicyVersesContainer.innerHTML = '<p class="scripture-loading-placeholder">Loading verses track...</p>';

    fetch('juicyVerses.txt')
        .then(res => res.text())
        .then(data => {
            juicyVersesContainer.innerHTML = '';
            const lines = data.split('\n');
            const checkedMap = JSON.parse(localStorage.getItem('csatpurdue_juicy_verses_map')) || {};

            lines.forEach((line, index) => {
                const trimmedLine = line.trim();
                if (!trimmedLine || !trimmedLine.includes('|')) return;

                const parts = trimmedLine.split('|');
                const verseText = parts[0].trim();
                const verseRef = parts[1].trim();
                const uniqueId = `jv_row_${index}`;
                const isMarked = !!checkedMap[uniqueId];

                const row = document.createElement('div');
                row.className = `verse-check-row ${isMarked ? 'is-marked' : ''}`;
                row.innerHTML = `
                    <div class="verse-check-box"></div>
                    <div class="verse-content-block">
                        <p class="verse-body-string">${verseText}</p>
                        <span class="verse-ref-string">${verseRef}</span>
                    </div>
                `;

                row.addEventListener('click', () => {
                    const currentMap = JSON.parse(localStorage.getItem('csatpurdue_juicy_verses_map')) || {};
                    if (row.classList.contains('is-marked')) {
                        row.classList.remove('is-marked');
                        delete currentMap[uniqueId];
                    } else {
                        row.classList.add('is-marked');
                        currentMap[uniqueId] = true;
                    }
                    localStorage.setItem('csatpurdue_juicy_verses_map', JSON.stringify(currentMap));
                });

                juicyVersesContainer.appendChild(row);
            });
        })
        .catch(err => {
            console.error("Error loading juicyVerses.txt:", err);
            // 🟢 3. Made sure the catch block can see the new container variable too
            const fallbackContainer = document.getElementById('juicy-verses-container');
            if (fallbackContainer) {
                fallbackContainer.innerHTML = '<p>Error loading verses file.</p>';
            }
        });
}

// Master execution gatekeeper loops
if (window.scriptureDataReady) {
    parseRawScriptureText();
    bootUpApplicationEngine();
} else {
    document.addEventListener('ScriptureDataLoaded', () => {
        parseRawScriptureText();
        bootUpApplicationEngine();
    });
}

function calculateCalendarStreakOnMark() {
    const todayStr = new Date().toISOString().split('T')[0];
    let currentStreak = parseInt(localStorage.getItem('csatpurdue_streak_count')) || 0;
    let lastReadDate = localStorage.getItem('csatpurdue_last_read_date') || "";

    if (lastReadDate === todayStr) return; 

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastReadDate === yesterdayStr) {
        currentStreak += 1; 
    } else {
        currentStreak = 1; 
    }

    localStorage.setItem('csatpurdue_streak_count', currentStreak);
    localStorage.setItem('csatpurdue_last_read_date', todayStr);
}

function verifyStreakValidityOnBoot() {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let lastReadDate = localStorage.getItem('csatpurdue_last_read_date') || "";

    if (lastReadDate !== todayStr && lastReadDate !== yesterdayStr) {
        localStorage.setItem('csatpurdue_streak_count', 0);
    }
}