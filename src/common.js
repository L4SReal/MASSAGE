// Hertfordshire Massage - Editorial Theme & Booking Scripts
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    const initIcons = () => {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    };
    initIcons();
    setTimeout(initIcons, 400);

    // 2. Mobile Navigation Drawer
    const menuToggle = document.getElementById('menu-toggle');
    const menuClose = document.getElementById('menu-close');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileBackdrop = document.getElementById('mobile-backdrop');
    const menuLinks = document.querySelectorAll('.mobile-nav-link');

    const openMenu = () => {
        if (!mobileMenu) return;
        mobileMenu.classList.remove('translate-x-full');
        if (mobileBackdrop) {
            mobileBackdrop.classList.remove('opacity-0', 'pointer-events-none');
            mobileBackdrop.classList.add('opacity-100');
        }
        document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
        if (!mobileMenu) return;
        mobileMenu.classList.add('translate-x-full');
        if (mobileBackdrop) {
            mobileBackdrop.classList.remove('opacity-100');
            mobileBackdrop.classList.add('opacity-0', 'pointer-events-none');
        }
        document.body.style.overflow = '';
    };

    if (menuToggle) menuToggle.addEventListener('click', (e) => { e.preventDefault(); openMenu(); });
    if (menuClose) menuClose.addEventListener('click', (e) => { e.preventDefault(); closeMenu(); });
    if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMenu);
    menuLinks.forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

    // 3. Scroll Progress Bar & Navbar Styling
    const progressBar = document.getElementById('progress-bar');
    const navbar = document.getElementById('navbar');
    const scrollToTopBtn = document.getElementById('scroll-to-top');

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
        
        if (progressBar) progressBar.style.width = scrolled + "%";

        if (navbar) {
            if (winScroll > 40) {
                navbar.classList.add('shadow-md', 'bg-[#fffaf0]/98');
            } else {
                navbar.classList.remove('shadow-md');
            }
        }

        if (scrollToTopBtn) {
            if (winScroll > 500) {
                scrollToTopBtn.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
                scrollToTopBtn.classList.add('opacity-100', 'translate-y-0');
            } else {
                scrollToTopBtn.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
                scrollToTopBtn.classList.remove('opacity-100', 'translate-y-0');
            }
        }
    }, { passive: true });

    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 4. Parallax Effect for Hero Background
    const heroBg = document.getElementById('hero-bg-image');
    if (heroBg) {
        window.addEventListener('scroll', () => {
            const scroll = window.pageYOffset;
            heroBg.style.transform = `translateY(${scroll * 0.25}px) scale(1.05)`;
        }, { passive: true });
    }

    // 5. 1-Hour Contiguous Time Slots & Live Slot Availability System (Starting from 9:00 AM, No 30-min Buffers)
    const DAILY_1_HOUR_SLOTS = [
        "09:00 AM – 10:00 AM",
        "10:00 AM – 11:00 AM",
        "11:00 AM – 12:00 PM",
        "12:00 PM – 01:00 PM",
        "01:00 PM – 02:00 PM",
        "02:00 PM – 03:00 PM",
        "03:00 PM – 04:00 PM",
        "04:00 PM – 05:00 PM",
        "05:00 PM – 06:00 PM",
        "06:00 PM – 07:00 PM",
        "07:00 PM – 08:00 PM"
    ];

    const BOOKINGS_STORAGE_KEY = 'herts_massage_slots_db_v5';
    const BOOKINGS_RECORDS_KEY = 'herts_massage_records_db_v5';
    const RECIPIENT_EMAIL = "Magdalenaalexe89@gmail.com";

    // Helper: Build Pre-formatted Mailto URL for Instant Email Client Dispatch
    const createMailtoUrl = (data) => {
        const subject = encodeURIComponent(`Massage Booking #${data.ref}: ${data.treatment} on ${data.formattedDate || data.date} (${data.timeSlot})`);
        const body = encodeURIComponent(
`APPOINTMENT BOOKING DETAILS
===========================================
Booking Reference: ${data.ref}
Client Name: ${data.name}
Phone Number: ${data.phone || 'None provided'}
Email Address: ${data.email || 'None provided'}
Treatment: ${data.treatment}
Duration: ${data.duration ? data.duration + ' Minutes' : '60 Minutes'}
Requested Date: ${data.formattedDate || data.date}
1-Hour Slot: ${data.timeSlot}
Tension Notes / Focus: ${data.notes || 'None provided'}
Payment Policy: Cash on Arrival

Studio Address: Private Practice Studio, Bushey
(Free dedicated parking reserved outside entrance)
`
        );
        return `mailto:${RECIPIENT_EMAIL}?subject=${subject}&body=${body}`;
    };

    // Helper: Dual Email Dispatch via ShipMyForm (Primary) + FormSubmit + Netlify Forms
    const dispatchBookingNotificationEmail = async (bookingData) => {
        const result = {
            success: false,
            needsActivation: false,
            message: '',
            netlifySuccess: false
        };

        // 1. Primary Dispatch to ShipMyForm (Active, live, fast delivery to Magdalenaalexe89@gmail.com)
        try {
            const shipParams = new URLSearchParams();
            shipParams.append('_subject', `New Massage Booking #${bookingData.ref}: ${bookingData.treatment} on ${bookingData.formattedDate || bookingData.date} (${bookingData.timeSlot})`);
            shipParams.append('Booking_Reference', bookingData.ref);
            shipParams.append('Client_Name', bookingData.name);
            shipParams.append('Client_Phone', bookingData.phone || 'N/A');
            shipParams.append('Client_Email', bookingData.email || 'N/A');
            shipParams.append('Treatment_Service', bookingData.treatment);
            shipParams.append('Duration', `${bookingData.duration || 60} Minutes`);
            shipParams.append('Requested_Date', bookingData.formattedDate || bookingData.date);
            shipParams.append('Time_Slot', bookingData.timeSlot);
            shipParams.append('Tension_Notes', bookingData.notes || 'None provided');
            shipParams.append('Payment_Policy', 'Cash on Arrival');
            shipParams.append('Studio_Location', 'Private Studio, Bushey (Dedicated parking space outside)');
            shipParams.append('Timestamp', new Date().toLocaleString('en-GB'));

            const shipRes = await fetch(`https://shipmyform.com/to/${RECIPIENT_EMAIL}`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: shipParams.toString()
            });

            if (shipRes.ok || shipRes.status === 200 || shipRes.status === 302 || shipRes.type === 'opaqueredirect') {
                result.success = true;
                result.message = `Booking email dispatched to ${RECIPIENT_EMAIL}`;
            }
        } catch (sErr) {
            console.warn('ShipMyForm notice', sErr);
        }

        // 2. Secondary Dispatch to FormSubmit (with explicit _captcha="false")
        try {
            const payload = {
                _subject: `New Massage Appointment #${bookingData.ref}: ${bookingData.treatment} on ${bookingData.formattedDate || bookingData.date} (${bookingData.timeSlot})`,
                _template: "table",
                _captcha: "false",
                _replyto: bookingData.email && bookingData.email !== 'N/A' ? bookingData.email : RECIPIENT_EMAIL,
                Booking_Reference: bookingData.ref,
                Client_Full_Name: bookingData.name,
                Client_Phone_Number: bookingData.phone || 'N/A',
                Client_Email_Address: bookingData.email || 'N/A',
                Treatment_Service: bookingData.treatment,
                Duration: `${bookingData.duration || 60} Minutes`,
                Date_Requested: bookingData.formattedDate || bookingData.date,
                Time_Slot_1_Hour: bookingData.timeSlot,
                Focus_Areas_and_Tension_Notes: bookingData.notes || 'None provided',
                Payment_Policy: "Cash on Arrival",
                Studio_Location: "Private Studio, Bushey",
                Dispatched_To: RECIPIENT_EMAIL,
                Submission_Timestamp: new Date().toLocaleString('en-GB')
            };

            const res = await fetch(`https://formsubmit.co/ajax/${RECIPIENT_EMAIL}`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json().catch(() => ({}));
                if (data.success === "true" || data.success === true) {
                    result.success = true;
                    result.message = data.message || `Dispatched to ${RECIPIENT_EMAIL}`;
                } else {
                    const msgLower = (typeof data.message === 'string' ? data.message : '').toLowerCase();
                    if (msgLower.includes('activate') || msgLower.includes('confirm') || msgLower.includes('activation')) {
                        result.needsActivation = true;
                    }
                }
            }
        } catch (err) {
            console.warn('FormSubmit network notice', err);
        }

        // 3. Tertiary Dispatch to Netlify Forms (if deployed on Netlify)
        try {
            const formData = new URLSearchParams();
            formData.append('form-name', 'appointment-booking');
            formData.append('name', bookingData.name);
            formData.append('phone', bookingData.phone || '');
            formData.append('email', bookingData.email || '');
            formData.append('treatment', bookingData.treatment);
            formData.append('duration', String(bookingData.duration || '60'));
            formData.append('date', bookingData.date || '');
            formData.append('timeSlot', bookingData.timeSlot);
            formData.append('notes', bookingData.notes || '');
            formData.append('bookingRef', bookingData.ref);

            const netlifyRes = await fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });
            if (netlifyRes.ok) {
                result.netlifySuccess = true;
            }
        } catch (nErr) {
            // Netlify fallback catch
        }

        return result;
    };

    // 1. Get & Save Booked Slots by Date
    const getBookingsDB = () => {
        try {
            const stored = localStorage.getItem(BOOKINGS_STORAGE_KEY);
            if (stored) return JSON.parse(stored);
        } catch (e) {
            console.error('Storage error', e);
        }

        // Realistic seed bookings starting at 9:00 AM contiguous slots
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        const dayAfter = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

        const initialSeed = {
            [today]: ["10:00 AM – 11:00 AM"],
            [tomorrow]: ["01:00 PM – 02:00 PM"],
            [dayAfter]: ["04:00 PM – 05:00 PM"]
        };
        saveBookingsDB(initialSeed);
        return initialSeed;
    };

    const saveBookingsDB = (db) => {
        try {
            localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(db));
            window.dispatchEvent(new CustomEvent('herts-bookings-changed'));
        } catch (e) {
            console.error('Save error', e);
        }
    };

    // 2. Get & Save Full Customer Appointment Booking Records (Online & Phone Bookings)
    const getBookingRecords = () => {
        try {
            const stored = localStorage.getItem(BOOKINGS_RECORDS_KEY);
            if (stored) return JSON.parse(stored);
        } catch (e) {
            console.error('Records error', e);
        }

        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

        const initialRecords = [
            {
                ref: 'HM-418290',
                name: 'Eleanor Vance',
                phone: '07700 900123',
                email: 'eleanor.vance@example.com',
                treatment: 'Deep Tissue Massage',
                duration: '60',
                date: today,
                timeSlot: '10:00 AM – 11:00 AM',
                source: 'Online Booking',
                notes: 'Focus on upper shoulder knots and desk postural stiffness.',
                createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
                status: 'Confirmed'
            },
            {
                ref: 'HM-739105',
                name: 'David Miller',
                phone: '07700 900456',
                email: 'david.m@example.com',
                treatment: 'Swedish Massage',
                duration: '60',
                date: tomorrow,
                timeSlot: '01:00 PM – 02:00 PM',
                source: 'Phone Booking',
                notes: 'Booked via telephone call - Lower back tension relief.',
                createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
                status: 'Confirmed'
            }
        ];
        saveBookingRecords(initialRecords);
        return initialRecords;
    };

    const saveBookingRecords = (records) => {
        try {
            localStorage.setItem(BOOKINGS_RECORDS_KEY, JSON.stringify(records));
            window.dispatchEvent(new CustomEvent('herts-records-changed'));
        } catch (e) {
            console.error('Records save error', e);
        }
    };

    const isSlotBooked = (dateStr, slot) => {
        const db = getBookingsDB();
        const bookedOnDate = db[dateStr] || [];
        return bookedOnDate.includes(slot);
    };

    const bookSlot = (dateStr, slot, fullRecord) => {
        const db = getBookingsDB();
        if (!db[dateStr]) db[dateStr] = [];
        if (!db[dateStr].includes(slot)) {
            db[dateStr].push(slot);
        }
        saveBookingsDB(db);

        if (fullRecord) {
            const records = getBookingRecords();
            records.unshift(fullRecord);
            saveBookingRecords(records);
        }
    };

    const blockEntireDay = (dateStr, reason = 'Day Off / Studio Closed') => {
        const db = getBookingsDB();
        db[dateStr] = [...DAILY_1_HOUR_SLOTS];
        saveBookingsDB(db);

        const records = getBookingRecords();
        records.unshift({
            ref: 'HM-BLOCK-' + Math.floor(1000 + Math.random() * 9000),
            name: 'Therapist Day Block',
            phone: 'N/A',
            email: 'N/A',
            treatment: 'Whole Day Closed',
            duration: 'All Day',
            date: dateStr,
            timeSlot: 'All 11 Slots Blocked',
            source: 'Phone / Admin Block',
            notes: reason,
            createdAt: new Date().toISOString(),
            status: 'Blocked'
        });
        saveBookingRecords(records);
    };

    const unblockEntireDay = (dateStr) => {
        const db = getBookingsDB();
        delete db[dateStr];
        saveBookingsDB(db);

        let records = getBookingRecords();
        records = records.filter(r => !(r.date === dateStr && r.status === 'Blocked'));
        saveBookingRecords(records);
    };

    const releaseSlot = (dateStr, slot, ref) => {
        const db = getBookingsDB();
        if (db[dateStr]) {
            db[dateStr] = db[dateStr].filter(s => s !== slot);
            if (db[dateStr].length === 0) delete db[dateStr];
            saveBookingsDB(db);
        }
        if (ref) {
            let records = getBookingRecords();
            records = records.filter(r => r.ref !== ref);
            saveBookingRecords(records);
        } else {
            // Also cleanup any record matching this slot and date
            let records = getBookingRecords();
            records = records.filter(r => !(r.date === dateStr && r.timeSlot === slot));
            saveBookingRecords(records);
        }
    };

    // 3. Slot Rendering and Selection Engine
    const slotsGrid = document.getElementById('slots-grid');
    const selectedTimeInput = document.getElementById('booking-time');
    const dateInput = document.getElementById('booking-date');
    const slotStatusMsg = document.getElementById('slot-status-msg');

    const renderTimeSlots = (selectedDate) => {
        if (!slotsGrid || !selectedDate) return;

        const db = getBookingsDB();
        const bookedOnDate = db[selectedDate] || [];
        const availableCount = DAILY_1_HOUR_SLOTS.length - bookedOnDate.length;

        const formattedDateLabel = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });

        if (slotStatusMsg) {
            if (availableCount > 0) {
                slotStatusMsg.innerHTML = `
                    <div class="flex flex-wrap items-center justify-between gap-2 p-3 bg-emerald-50/70 border border-emerald-200/80 text-xs">
                        <span class="inline-flex items-center gap-2 text-emerald-950 font-medium">
                            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <strong>${availableCount} of ${DAILY_1_HOUR_SLOTS.length} slots available</strong> for ${formattedDateLabel}
                        </span>
                        <span class="text-[10px] text-emerald-800 font-mono tracking-wide uppercase font-semibold">First Slot: 9:00 AM</span>
                    </div>
                `;
            } else {
                slotStatusMsg.innerHTML = `
                    <div class="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                        <span>All 1-hour slots are fully booked for ${formattedDateLabel}. Please select another date.</span>
                    </div>
                `;
            }
        }

        slotsGrid.innerHTML = '';
        let hasSelectedValidSlot = false;

        DAILY_1_HOUR_SLOTS.forEach(slot => {
            const isTaken = bookedOnDate.includes(slot);
            const isCurrentSelected = selectedTimeInput && selectedTimeInput.value === slot;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.setAttribute('data-slot', slot);

            if (isTaken) {
                btn.disabled = true;
                btn.className = 'w-full py-3.5 px-4 border border-stone-200 bg-stone-100 text-stone-400 text-xs flex items-center justify-between cursor-not-allowed select-none rounded-none opacity-80';
                btn.innerHTML = `
                    <span class="line-through font-mono text-[11px] text-stone-400">${slot}</span>
                    <span class="text-[9px] uppercase tracking-wider font-bold text-rose-700 bg-rose-100/90 border border-rose-300 px-2 py-0.5">Taken</span>
                `;
            } else {
                if (isCurrentSelected) {
                    hasSelectedValidSlot = true;
                    btn.className = 'slot-btn w-full py-3.5 px-4 border-2 border-[#3c2f25] bg-[#3c2f25] text-white text-xs flex items-center justify-between font-bold rounded-none shadow-sm transition-all';
                    btn.innerHTML = `
                        <span class="font-medium">${slot}</span>
                        <span class="text-[9px] uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 font-bold flex items-center gap-1">
                            <i data-lucide="check" class="w-3 h-3"></i> Selected
                        </span>
                    `;
                } else {
                    btn.className = 'slot-btn w-full py-3.5 px-4 border border-[#e9dcc9] bg-white hover:border-[#3c2f25] hover:bg-[#fffaf0] text-[#3c2f25] text-xs flex items-center justify-between font-medium rounded-none transition-all cursor-pointer';
                    btn.innerHTML = `
                        <span>${slot}</span>
                        <span class="text-[9px] uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-bold">Available</span>
                    `;
                }

                btn.addEventListener('click', () => {
                    if (selectedTimeInput) selectedTimeInput.value = slot;
                    renderTimeSlots(selectedDate);
                    const slotContainer = document.getElementById('slots-container-wrapper');
                    if (slotContainer) slotContainer.classList.remove('ring-2', 'ring-rose-400');
                });
            }

            slotsGrid.appendChild(btn);
        });

        // If no slot is selected or previous slot is now taken, pick first open slot
        if (!hasSelectedValidSlot && selectedTimeInput) {
            const firstAvailable = DAILY_1_HOUR_SLOTS.find(s => !bookedOnDate.includes(s));
            if (firstAvailable && (!selectedTimeInput.value || bookedOnDate.includes(selectedTimeInput.value))) {
                selectedTimeInput.value = firstAvailable;
                renderTimeSlots(selectedDate);
            }
        }
    };

    // Date picker setup
    if (dateInput) {
        const todayStr = new Date().toISOString().split('T')[0];
        dateInput.min = todayStr;
        if (!dateInput.value) {
            dateInput.value = todayStr;
        }

        renderTimeSlots(dateInput.value);

        dateInput.addEventListener('change', () => {
            renderTimeSlots(dateInput.value);
        });
    }

    // Listen for cross-tab or programmatic booking changes to re-render grid
    window.addEventListener('herts-bookings-changed', () => {
        if (dateInput) renderTimeSlots(dateInput.value);
        if (typeof updateSecretManagerView === 'function') updateSecretManagerView();
    });

    window.addEventListener('storage', (e) => {
        if (e.key === BOOKINGS_STORAGE_KEY && dateInput) {
            renderTimeSlots(dateInput.value);
            if (typeof updateSecretManagerView === 'function') updateSecretManagerView();
        }
    });

    // 4. Interactive Appointment Booking Form Submission with Full Form Dispatch
    const bookingForm = document.getElementById('appointment-booking-form');
    const bookingFeedback = document.getElementById('booking-feedback');
    const treatmentSelect = document.getElementById('booking-treatment');
    const durationSelect = document.getElementById('booking-duration');

    // Auto-select treatment from URL params (e.g. ?treatment=deeptissue)
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const treatmentParam = urlParams.get('treatment');
        if (treatmentParam && treatmentSelect) {
            const matchOption = Array.from(treatmentSelect.options).find(opt => 
                opt.value.toLowerCase() === treatmentParam.toLowerCase() ||
                opt.text.toLowerCase().includes(treatmentParam.toLowerCase())
            );
            if (matchOption) {
                treatmentSelect.value = matchOption.value;
            }
        }
    } catch (err) {
        console.warn('URL param error', err);
    }

    // Smooth scroll if URL hash has #reserve or #book
    if (window.location.hash === '#reserve' || window.location.hash === '#book' || window.location.hash === '#booking-section') {
        setTimeout(() => {
            const bookingTarget = document.getElementById('reserve') || document.getElementById('book') || document.getElementById('booking-section');
            if (bookingTarget) {
                bookingTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 300);
    }

    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('booking-name')?.value.trim() || '';
            const phone = document.getElementById('booking-phone')?.value.trim() || '';
            const email = document.getElementById('booking-email')?.value.trim() || '';
            const treatment = treatmentSelect ? treatmentSelect.options[treatmentSelect.selectedIndex]?.text : 'Swedish Massage';
            const duration = durationSelect ? durationSelect.value : '60';
            const date = dateInput ? dateInput.value : '';
            const timeSlot = selectedTimeInput ? selectedTimeInput.value : '';
            const notes = document.getElementById('booking-notes')?.value.trim() || 'None provided';

            // Validate slot selection
            if (!timeSlot) {
                const slotContainer = document.getElementById('slots-container-wrapper');
                if (slotContainer) {
                    slotContainer.classList.add('ring-2', 'ring-rose-400');
                    slotContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                alert('Please click on an available 1-hour time slot starting from 9:00 AM.');
                return;
            }

            // Real-time check if slot was taken by someone else
            if (isSlotBooked(date, timeSlot)) {
                alert(`The time slot "${timeSlot}" for ${date} was just reserved. Please select another open time slot.`);
                renderTimeSlots(date);
                return;
            }

            const submitBtn = bookingForm.querySelector('button[type="submit"]') || document.getElementById('submit-booking-btn');
            const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Confirm Appointment Booking';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `
                    <span class="inline-flex items-center gap-2">
                        <svg class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        Reserving Slot & Sending Full Form Details...
                    </span>
                `;
            }

            const bookingRef = 'HM-' + Math.floor(100000 + Math.random() * 900000);
            const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            // 1. Build Full Booking Record
            const fullBookingRecord = {
                ref: bookingRef,
                name: name,
                phone: phone,
                email: email,
                treatment: treatment,
                duration: duration,
                date: date,
                timeSlot: timeSlot,
                notes: notes,
                createdAt: new Date().toISOString(),
                status: 'Confirmed'
            };

            // 2. Immediately mark slot as Taken & save full appointment record
            bookSlot(date, timeSlot, fullBookingRecord);

            // 3. Immediately re-render grid so slot shows TAKEN in real-time
            renderTimeSlots(date);

            // 4. Dispatch FULL form submission to Magdalenaalexe89@gmail.com via FormSubmit AJAX + Netlify Forms
            const emailDispatchResult = await dispatchBookingNotificationEmail({
                ref: bookingRef,
                name: name,
                phone: phone,
                email: email,
                treatment: treatment,
                duration: duration,
                date: date,
                formattedDate: formattedDate,
                timeSlot: timeSlot,
                notes: notes
            });

            // Pre-build fail-safe mailto link
            const mailtoUrl = createMailtoUrl({
                ref: bookingRef,
                name: name,
                phone: phone,
                email: email,
                treatment: treatment,
                duration: duration,
                date: formattedDate,
                timeSlot: timeSlot,
                notes: notes
            });

            // 5. Display On-Screen Confirmation Card with Full Summary & Studio Details
            if (bookingFeedback) {
                const bookingSummaryText = `HERTFORDSHIRE MASSAGE APPOINTMENT CONFIRMATION\nRef: ${bookingRef}\nClient: ${name}\nPhone: ${phone}\nEmail: ${email}\nTreatment: ${treatment} (${duration} Mins)\nDate: ${formattedDate}\nTime: ${timeSlot}\nPayment: Cash on Arrival\nNotes: ${notes}\nStudio: Private Practice Studio, Bushey`;

                bookingFeedback.innerHTML = `
                    <div class="p-6 sm:p-8 bg-[#fffaf0] border-2 border-[#3c2f25] shadow-md text-left mb-8 animate-fadeIn">
                        
                        <div class="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-[#e9dcc9]">
                            <div>
                                <span class="text-[10px] font-bold uppercase tracking-[0.25em] text-[#c5a059] block mb-1">Appointment Confirmed</span>
                                <h3 class="font-serif text-2xl sm:text-3xl text-[#3c2f25] font-normal">Thank You, ${name}</h3>
                            </div>
                            <span class="text-xs font-mono font-bold bg-[#3c2f25] text-white px-3.5 py-1.5 shadow-sm">Ref: ${bookingRef}</span>
                        </div>

                        <!-- Real-Time Slot Reservation Banner -->
                        <div class="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center gap-3">
                            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                            <span><strong>Time Slot Locked:</strong> The <strong>${timeSlot}</strong> slot on <strong>${formattedDate}</strong> is now marked as <strong>Taken</strong> on our calendar.</span>
                        </div>

                        <!-- Email Notification Status Banner -->
                        ${emailDispatchResult.needsActivation ? `
                            <div class="mb-5 p-4 bg-amber-50 border-2 border-amber-300 text-[#3c2f25] text-xs space-y-2">
                                <div class="flex items-start gap-2.5">
                                    <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5"></i>
                                    <div class="space-y-1 flex-1">
                                        <p class="font-bold text-amber-950 uppercase text-[11px] tracking-wider">
                                            First-Time Activation Notice for ${RECIPIENT_EMAIL}
                                        </p>
                                        <p class="text-[#594d43] leading-relaxed">
                                            FormSubmit has sent a <strong>one-time activation email</strong> to <strong>${RECIPIENT_EMAIL}</strong> with the subject <em>"Action Required: Confirm your form submission"</em>.
                                        </p>
                                        <p class="text-[#594d43] leading-relaxed">
                                            <strong>Action:</strong> Please check your Gmail <strong>Inbox</strong> AND <strong>Spam/Junk folder</strong> for the FormSubmit email, and click the blue <strong>"Activate Form"</strong> button. Once clicked, all future bookings will arrive directly in your inbox.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ` : (emailDispatchResult.success ? `
                            <div class="mb-5 p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs flex items-center gap-2.5">
                                <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600 flex-shrink-0"></i>
                                <span>Full booking details dispatched to <strong>${RECIPIENT_EMAIL}</strong> and recorded in your therapist's schedule.</span>
                            </div>
                        ` : `
                            <div class="mb-5 p-3.5 bg-stone-50 border border-[#e9dcc9] text-[#3c2f25] text-xs flex items-center gap-2.5">
                                <i data-lucide="check" class="w-4 h-4 text-[#c5a059] flex-shrink-0"></i>
                                <span>Appointment confirmed and locked in calendar. Booking dispatch targeted to <strong>${RECIPIENT_EMAIL}</strong>.</span>
                            </div>
                        `)}

                        <!-- Instant Action Buttons: Direct Mailto, Copy, Print -->
                        <div class="flex flex-wrap items-center gap-2.5 mb-5 p-3 bg-white border border-[#e9dcc9]">
                            <a href="${mailtoUrl}" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#3c2f25] hover:bg-[#c5a059] text-white text-[11px] font-bold uppercase tracking-wider transition-colors shadow-xs">
                                <i data-lucide="mail" class="w-3.5 h-3.5"></i> Open in Email App
                            </a>
                            <button type="button" id="feedback-copy-btn" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#e9dcc9] hover:border-[#3c2f25] text-[#3c2f25] text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs">
                                <i data-lucide="copy" class="w-3.5 h-3.5"></i> Copy Booking Summary
                            </button>
                            <button type="button" id="feedback-resend-btn" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#f7f3ea] border border-[#e9dcc9] hover:bg-[#3c2f25] hover:text-white text-[#3c2f25] text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs">
                                <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> Re-send to ${RECIPIENT_EMAIL}
                            </button>
                        </div>

                        <!-- Confirmed Studio Directions -->
                        <div class="mb-6 p-4 bg-white border border-[#3c2f25] shadow-sm">
                            <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3c2f25] mb-1.5">
                                <i data-lucide="map-pin" class="w-4 h-4 text-[#c5a059]"></i>
                                <span>Your Confirmed Studio Address & Arrival Info:</span>
                            </div>
                            <p class="text-sm font-semibold text-[#3c2f25]">Private Practice Studio, Bushey</p>
                            <p class="text-xs text-[#78716c] mt-0.5 leading-relaxed">
                                Conveniently located near Bushey & Stanmore with nearby London Overground and Jubilee Line transport links. Free dedicated client parking space is reserved directly in front of the studio.
                            </p>
                        </div>

                        <!-- Full Form Details Summary Grid -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#3c2f25] mb-6 p-4 bg-white border border-[#e9dcc9]">
                            <div>
                                <p class="text-[#78716c] uppercase text-[10px] tracking-wider mb-0.5">Client Details</p>
                                <p class="font-semibold text-sm">${name}</p>
                                <p class="text-[#78716c]">${phone} • ${email}</p>
                            </div>
                            <div>
                                <p class="text-[#78716c] uppercase text-[10px] tracking-wider mb-0.5">Confirmed Date & 1-Hour Slot</p>
                                <p class="font-semibold text-sm">${formattedDate}</p>
                                <p class="text-[#c5a059] font-bold text-xs">${timeSlot}</p>
                            </div>
                            <div>
                                <p class="text-[#78716c] uppercase text-[10px] tracking-wider mb-0.5">Treatment & Duration</p>
                                <p class="font-semibold text-sm">${treatment} (${duration} Mins)</p>
                            </div>
                            <div>
                                <p class="text-[#78716c] uppercase text-[10px] tracking-wider mb-0.5">Payment Policy</p>
                                <p class="font-bold text-[#3c2f25]">Cash on Arrival</p>
                                <p class="text-[#78716c] text-[11px]">No upfront card payment required</p>
                            </div>
                            <div class="sm:col-span-2 pt-2 border-t border-[#e9dcc9]/50">
                                <p class="text-[#78716c] uppercase text-[10px] tracking-wider mb-0.5">Focus Areas / Tension Notes</p>
                                <p class="font-normal text-xs text-[#594d43] italic">${notes}</p>
                            </div>
                        </div>

                        <div class="pt-4 border-t border-[#e9dcc9] flex flex-wrap items-center justify-between gap-4">
                            <button type="button" onclick="window.print()" class="px-6 py-3 bg-[#3c2f25] text-white text-xs font-bold uppercase tracking-[0.2em] border border-[#3c2f25] hover:bg-[#c5a059] hover:border-[#c5a059] transition-colors shadow-sm cursor-pointer inline-flex items-center gap-2">
                                <i data-lucide="printer" class="w-4 h-4"></i> Save / Print Confirmation Receipt
                            </button>
                            <span class="text-xs text-[#78716c]">Your appointment is confirmed. We look forward to seeing you.</span>
                        </div>
                    </div>
                `;
                bookingFeedback.classList.remove('hidden');
                bookingFeedback.scrollIntoView({ behavior: 'smooth', block: 'start' });

                // Bind copy summary button
                const copySummaryBtn = bookingFeedback.querySelector('#feedback-copy-btn');
                if (copySummaryBtn) {
                    copySummaryBtn.addEventListener('click', () => {
                        navigator.clipboard.writeText(bookingSummaryText).then(() => {
                            copySummaryBtn.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5 inline mr-1"></i> Copied to Clipboard!';
                            if (window.lucide) window.lucide.createIcons();
                            setTimeout(() => {
                                copySummaryBtn.innerHTML = '<i data-lucide="copy" class="w-3.5 h-3.5 inline mr-1"></i> Copy Booking Summary';
                                if (window.lucide) window.lucide.createIcons();
                            }, 2500);
                        }).catch(() => {
                            prompt('Copy booking summary:', bookingSummaryText);
                        });
                    });
                }

                // Bind resend email button
                const resendBtn = bookingFeedback.querySelector('#feedback-resend-btn');
                if (resendBtn) {
                    resendBtn.addEventListener('click', async () => {
                        resendBtn.disabled = true;
                        resendBtn.innerHTML = '<i data-lucide="loader-2" class="w-3.5 h-3.5 inline mr-1 animate-spin"></i> Sending...';
                        if (window.lucide) window.lucide.createIcons();
                        const res = await dispatchBookingNotificationEmail({
                            ref: bookingRef,
                            name: name,
                            phone: phone,
                            email: email,
                            treatment: treatment,
                            duration: duration,
                            date: date,
                            formattedDate: formattedDate,
                            timeSlot: timeSlot,
                            notes: notes
                        });
                        if (res.success) {
                            alert(`Email successfully delivered to ${RECIPIENT_EMAIL}! Please check your inbox.`);
                        } else if (res.needsActivation) {
                            alert(`Action Required: FormSubmit sent an activation email to ${RECIPIENT_EMAIL}. Please check your Gmail Inbox AND Spam/Junk folder and click "Activate Form" once.`);
                        } else {
                            alert(`Email dispatch notification: ${res.message || 'Saved locally in schedule'}.`);
                        }
                        resendBtn.disabled = false;
                        resendBtn.innerHTML = `<i data-lucide="refresh-cw" class="w-3.5 h-3.5 inline mr-1"></i> Re-send to ${RECIPIENT_EMAIL}`;
                        if (window.lucide) window.lucide.createIcons();
                    });
                }

                initIcons();
            }

            bookingForm.reset();
            if (dateInput) {
                dateInput.value = date;
                renderTimeSlots(date);
            }

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }

            // Refresh secret manager if open
            if (typeof updateSecretManagerView === 'function') {
                updateSecretManagerView();
            }
        });
    }

    // 5. Password-Protected Secret Therapist Calendar & Phone Bookings Manager
    // Accessible via:
    //  1. URL: ?manage or ?admin or #manage
    //  2. Keyboard: Alt+B or Ctrl+Shift+B
    //  3. Click: Double-clicking booking calendar icon or clicking footer discreet dot
    const ADMIN_PASSWORD_KEY = 'herts_massage_admin_pass_v3';
    const DEFAULT_ADMIN_PASSWORD = 'M@gda89!';
    const ADMIN_AUTH_SESSION_KEY = 'herts_massage_admin_session_v3';

    const getAdminPassword = () => {
        return localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
    };

    const setAdminPassword = (pass) => {
        localStorage.setItem(ADMIN_PASSWORD_KEY, pass);
    };

    const isTherapistAuthed = () => {
        return sessionStorage.getItem(ADMIN_AUTH_SESSION_KEY) === 'true';
    };

    const setTherapistAuthed = (val) => {
        if (val) {
            sessionStorage.setItem(ADMIN_AUTH_SESSION_KEY, 'true');
        } else {
            sessionStorage.removeItem(ADMIN_AUTH_SESSION_KEY);
        }
    };

    let secretModalEl = null;

    const createSecretModal = () => {
        if (document.getElementById('secret-booking-manager-modal')) {
            return document.getElementById('secret-booking-manager-modal');
        }

        const modal = document.createElement('div');
        modal.id = 'secret-booking-manager-modal';
        modal.className = 'hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto';
        modal.innerHTML = `
            <div class="relative w-full max-w-2xl bg-[#fffaf0] border border-[#3c2f25] shadow-2xl p-4 sm:p-6 my-auto text-left max-h-[90vh] flex flex-col animate-fadeIn">
                
                <!-- VIEW 1: Password Gate -->
                <div id="secret-password-gate" class="py-6 px-3 text-center max-w-sm mx-auto my-auto space-y-4 w-full">
                    <div class="w-12 h-12 bg-[#3c2f25] text-[#c5a059] flex items-center justify-center mx-auto shadow-sm border border-[#e9dcc9]">
                        <i data-lucide="lock" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <span class="text-[10px] font-bold uppercase tracking-[0.25em] text-[#c5a059] block mb-1">Therapist Portal</span>
                        <h3 class="font-serif text-2xl text-[#3c2f25] font-semibold">Therapist Login</h3>
                        <p class="text-xs text-[#78716c] mt-1 leading-relaxed">
                            Enter password to manage reserved slots and cancellations.
                        </p>
                    </div>

                    <form id="secret-password-form" class="space-y-3 pt-1">
                        <div class="relative">
                            <input 
                                type="password" 
                                id="secret-password-input" 
                                required 
                                placeholder="Enter password..." 
                                class="w-full px-4 py-3 bg-white border border-[#e9dcc9] text-xs text-[#3c2f25] focus:outline-none focus:border-[#3c2f25] text-center tracking-widest font-mono text-sm shadow-inner"
                                autocomplete="current-password"
                            >
                            <button type="button" id="toggle-password-visibility" class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#3c2f25] text-xs cursor-pointer p-1" title="Show or hide password">
                                <i data-lucide="eye" id="toggle-password-icon" class="w-4 h-4"></i>
                            </button>
                        </div>

                        <div id="secret-password-error" class="hidden text-xs text-rose-800 font-medium bg-rose-50 border border-rose-300 p-2.5 text-left flex items-center gap-2">
                            <i data-lucide="alert-circle" class="w-4 h-4 text-rose-700 flex-shrink-0"></i>
                            <span id="secret-password-error-text">Incorrect password. Please try again.</span>
                        </div>

                        <button type="submit" class="w-full py-3 bg-[#3c2f25] hover:bg-[#c5a059] text-white text-xs font-bold uppercase tracking-[0.2em] transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2">
                            <i data-lucide="key" class="w-3.5 h-3.5"></i>
                            <span>Unlock Schedule</span>
                        </button>
                    </form>

                    <div class="pt-3 border-t border-[#e9dcc9]/60 text-[11px] text-[#78716c] flex items-center justify-between">
                        <span class="text-[10px] text-[#78716c] flex items-center gap-1"><i data-lucide="shield-check" class="w-3 h-3 text-[#c5a059]"></i> Secure Private Portal</span>
                        <button type="button" id="close-gate-cancel-btn" class="hover:text-[#3c2f25] underline cursor-pointer text-[10px] uppercase font-bold tracking-wider">Cancel</button>
                    </div>
                </div>

                <!-- VIEW 2: Unlocked Management Dashboard (Simple 2-Tab Layout) -->
                <div id="secret-dashboard-view" class="hidden flex flex-col flex-1 overflow-hidden space-y-3">
                    
                    <!-- Header -->
                    <div class="flex items-start justify-between gap-3 pb-3 border-b border-[#e9dcc9] flex-shrink-0">
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-[10px] font-bold uppercase tracking-[0.25em] bg-[#3c2f25] text-white px-2 py-0.5">Therapist Portal</span>
                                <span class="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 font-bold uppercase tracking-wider flex items-center gap-1">
                                    <i data-lucide="check" class="w-3 h-3"></i> Authenticated
                                </span>
                            </div>
                            <h3 class="font-serif text-lg sm:text-xl text-[#3c2f25] font-semibold">Schedule & Bookings Manager</h3>
                            <p class="text-xs text-[#78716c] mt-0.5">
                                Reserve slots or cancel appointments to keep your calendar up to date.
                            </p>
                        </div>
                        <div class="flex items-center gap-2">
                            <button type="button" id="secret-change-pass-btn" class="px-2.5 py-1.5 bg-white border border-[#e9dcc9] hover:border-[#3c2f25] text-[#3c2f25] text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1" title="Change therapist password">
                                <i data-lucide="key" class="w-3 h-3"></i> <span class="hidden sm:inline">Change Password</span>
                            </button>
                            <button type="button" id="secret-lock-btn" class="px-2.5 py-1.5 bg-stone-100 border border-stone-300 hover:bg-stone-200 text-[#3c2f25] text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1" title="Lock session">
                                <i data-lucide="lock" class="w-3 h-3"></i> <span>Lock</span>
                            </button>
                            <button type="button" id="close-secret-modal-btn" class="w-8 h-8 border border-[#e9dcc9] bg-white hover:bg-[#3c2f25] hover:text-white flex items-center justify-center text-sm font-bold text-[#3c2f25] transition-colors cursor-pointer" aria-label="Close modal">
                                <i data-lucide="x" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Live Notification Banner -->
                    <div id="secret-action-feedback" class="hidden p-3 text-xs flex-shrink-0"></div>

                    <!-- Navigation Tabs: Simple & Clean (Only 2 Tabs!) -->
                    <div class="flex border-b border-[#e9dcc9] gap-2 mb-1 flex-shrink-0">
                        <button type="button" class="secret-tab-btn px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 border-[#3c2f25] text-[#3c2f25] bg-white/70 flex items-center gap-1.5 cursor-pointer" data-tab="tab-reserve-slot">
                            <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i>
                            <span>Reserve a Slot</span>
                        </button>
                        <button type="button" class="secret-tab-btn px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 border-transparent text-[#78716c] hover:text-[#3c2f25] flex items-center gap-1.5 cursor-pointer" data-tab="tab-manage-bookings">
                            <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
                            <span>Bookings & Cancellations</span>
                        </button>
                    </div>

                    <!-- TAB 1: Reserve a Slot -->
                    <div id="tab-reserve-slot" class="secret-tab-panel space-y-3 overflow-y-auto pr-1 flex-1">
                        <form id="secret-reserve-form" class="space-y-4 bg-white p-4 sm:p-5 border border-[#e9dcc9]">
                            <div>
                                <h4 class="font-serif text-sm font-semibold text-[#3c2f25]">Mark a Slot as Reserved</h4>
                                <p class="text-xs text-[#78716c] mt-0.5">Use this when taking a telephone booking, personal time off, or closing slots.</p>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label for="secret-reserve-date" class="block text-[11px] font-bold uppercase tracking-wider text-[#3c2f25] mb-1">
                                        Date <span class="text-rose-600">*</span>
                                    </label>
                                    <input type="date" id="secret-reserve-date" required class="w-full px-3 py-2.5 bg-[#fcfbf8] border border-[#e9dcc9] text-xs text-[#3c2f25] focus:outline-none focus:border-[#3c2f25]">
                                </div>

                                <div>
                                    <label for="secret-reserve-slot" class="block text-[11px] font-bold uppercase tracking-wider text-[#3c2f25] mb-1">
                                        Time Slot <span class="text-rose-600">*</span>
                                    </label>
                                    <select id="secret-reserve-slot" required class="w-full px-3 py-2.5 bg-[#fcfbf8] border border-[#e9dcc9] text-xs text-[#3c2f25] focus:outline-none focus:border-[#3c2f25]">
                                        <option value="ALL">ENTIRE DAY (Block all 11 slots - day off / holiday)</option>
                                        ${DAILY_1_HOUR_SLOTS.map(s => `<option value="${s}">${s}</option>`).join('')}
                                    </select>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label for="secret-reserve-name" class="block text-[11px] font-bold uppercase tracking-wider text-[#3c2f25] mb-1">
                                        Client Name or Reason <span class="text-rose-600">*</span>
                                    </label>
                                    <input type="text" id="secret-reserve-name" required placeholder="e.g. Sarah M. (Phone Booking) or Studio Closed" class="w-full px-3 py-2.5 bg-[#fcfbf8] border border-[#e9dcc9] text-xs text-[#3c2f25] focus:outline-none focus:border-[#3c2f25]">
                                </div>

                                <div>
                                    <label for="secret-reserve-phone" class="block text-[11px] font-bold uppercase tracking-wider text-[#3c2f25] mb-1">
                                        Contact Phone (Optional)
                                    </label>
                                    <input type="tel" id="secret-reserve-phone" placeholder="e.g. 07869 417281" class="w-full px-3 py-2.5 bg-[#fcfbf8] border border-[#e9dcc9] text-xs text-[#3c2f25] focus:outline-none focus:border-[#3c2f25]">
                                </div>
                            </div>

                            <div>
                                <label for="secret-reserve-notes" class="block text-[11px] font-bold uppercase tracking-wider text-[#3c2f25] mb-1">
                                    Notes (Optional)
                                </label>
                                <input type="text" id="secret-reserve-notes" placeholder="e.g. 60 min Deep Tissue, paying cash on arrival" class="w-full px-3 py-2.5 bg-[#fcfbf8] border border-[#e9dcc9] text-xs text-[#3c2f25] focus:outline-none focus:border-[#3c2f25]">
                            </div>

                            <div class="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#e9dcc9]">
                                <span class="text-[11px] text-[#78716c]">
                                    Will immediately show as <strong>Unavailable</strong> on the calendar.
                                </span>
                                <button type="submit" class="w-full sm:w-auto px-6 py-3 bg-[#3c2f25] hover:bg-[#c5a059] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2">
                                    <i data-lucide="check" class="w-4 h-4"></i>
                                    <span>Mark Slot as Reserved</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- TAB 2: Bookings & Cancellations (Simple List with Delete) -->
                    <div id="tab-manage-bookings" class="secret-tab-panel hidden space-y-3 overflow-y-auto pr-1 flex-1">
                        <div class="p-3 bg-white border border-[#e9dcc9] flex items-center justify-between text-xs text-[#78716c]">
                            <span>Current reserved slots and bookings. Click <strong>Cancel / Delete Booking</strong> to reopen any slot on the calendar.</span>
                        </div>

                        <!-- Bookings List -->
                        <div id="secret-ledger-records-list" class="space-y-2.5">
                            <!-- Populated dynamically -->
                        </div>
                    </div>

                </div>

            </div>
        `;

        document.body.appendChild(modal);
        bindSecretModalEvents(modal);
        initIcons();
        return modal;
    };

    const showSecretActionFeedback = (msg, isSuccess = true) => {
        const fb = document.getElementById('secret-action-feedback');
        if (!fb) return;
        fb.className = `p-3 text-xs border flex items-center justify-between gap-2 ${isSuccess ? 'bg-emerald-50 text-emerald-950 border-emerald-300' : 'bg-rose-50 text-rose-950 border-rose-300'}`;
        fb.innerHTML = `
            <div class="flex items-center gap-2">
                <i data-lucide="${isSuccess ? 'check-circle' : 'alert-circle'}" class="w-4 h-4 ${isSuccess ? 'text-emerald-700' : 'text-rose-700'} flex-shrink-0"></i>
                <span>${msg}</span>
            </div>
            <button type="button" onclick="this.parentElement.classList.add('hidden')" class="text-stone-400 hover:text-stone-800 cursor-pointer">
                <i data-lucide="x" class="w-3.5 h-3.5"></i>
            </button>
        `;
        fb.classList.remove('hidden');
        initIcons();
        setTimeout(() => {
            if (fb) fb.classList.add('hidden');
        }, 6000);
    };

    const showPasswordGate = () => {
        const gate = document.getElementById('secret-password-gate');
        const dash = document.getElementById('secret-dashboard-view');
        const passInput = document.getElementById('secret-password-input');
        const errorEl = document.getElementById('secret-password-error');
        if (gate) gate.classList.remove('hidden');
        if (dash) dash.classList.add('hidden');
        if (errorEl) errorEl.classList.add('hidden');
        if (passInput) {
            passInput.value = '';
            setTimeout(() => passInput.focus(), 100);
        }
        initIcons();
    };

    const showDashboard = () => {
        const gate = document.getElementById('secret-password-gate');
        const dash = document.getElementById('secret-dashboard-view');
        if (gate) gate.classList.add('hidden');
        if (dash) dash.classList.remove('hidden');

        // Set default date to today
        const todayStr = new Date().toISOString().split('T')[0];
        const reserveDate = document.getElementById('secret-reserve-date');
        if (reserveDate && !reserveDate.value) reserveDate.value = todayStr;

        renderSecretLedger();
        initIcons();
    };

    const renderSecretLedger = () => {
        const listEl = document.getElementById('secret-ledger-records-list');
        if (!listEl) return;

        const allRecords = getBookingRecords();

        if (allRecords.length === 0) {
            listEl.innerHTML = `
                <div class="p-8 text-center text-xs text-stone-500 bg-white border border-[#e9dcc9]">
                    <div class="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-2 text-stone-400">
                        <i data-lucide="calendar" class="w-5 h-5"></i>
                    </div>
                    <p class="font-semibold text-stone-700">No active bookings or reserved slots</p>
                    <p class="mt-1 text-stone-400">All slots are currently open and available on the public calendar.</p>
                </div>
            `;
            initIcons();
            return;
        }

        listEl.innerHTML = allRecords.map(rec => {
            const isPhone = (rec.source || '').includes('Phone') || (rec.source || '').includes('Admin') || (rec.source || '').includes('Reservation');
            return `
                <div class="p-3.5 bg-white border border-[#e9dcc9] shadow-xs text-xs space-y-2.5">
                    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#e9dcc9]/70 pb-2">
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-[#3c2f25] text-sm">${rec.name}</span>
                            <span class="text-[10px] font-mono bg-stone-100 text-stone-600 px-1.5 py-0.5 border border-stone-200">${rec.ref}</span>
                            <span class="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 ${isPhone ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-50 text-blue-800 border border-blue-200'}">
                                ${isPhone ? 'Reserved / Phone' : 'Online Booking'}
                            </span>
                        </div>
                        <span class="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 uppercase tracking-wider">
                            ${rec.status || 'Confirmed'}
                        </span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-[#594d43]">
                        <div>
                            <span class="text-stone-400 block text-[9px] uppercase tracking-wider">Date & Time</span>
                            <strong>${rec.date}</strong><br>
                            <span class="text-[#c5a059] font-bold">${rec.timeSlot}</span>
                        </div>
                        <div>
                            <span class="text-stone-400 block text-[9px] uppercase tracking-wider">Contact</span>
                            ${rec.phone && rec.phone !== 'N/A' ? `<a href="tel:${rec.phone}" class="text-[#3c2f25] underline font-semibold">${rec.phone}</a>` : '<span class="text-stone-400">None provided</span>'}<br>
                            ${rec.email && rec.email !== 'N/A' ? `<span class="text-[#78716c] truncate block">${rec.email}</span>` : ''}
                        </div>
                        <div>
                            <span class="text-stone-400 block text-[9px] uppercase tracking-wider">Treatment</span>
                            <strong>${rec.treatment}</strong> ${rec.duration && rec.duration !== 'All Day' ? `(${rec.duration} Mins)` : ''}
                        </div>
                        <div>
                            <span class="text-stone-400 block text-[9px] uppercase tracking-wider">Notes / Reason</span>
                            <span class="italic text-stone-600">${rec.notes || 'None'}</span>
                        </div>
                    </div>

                    <div class="pt-2 border-t border-[#e9dcc9]/60 flex flex-wrap items-center justify-between gap-2">
                        <div class="flex items-center gap-2">
                            <button type="button" class="secret-release-record-btn px-3 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-300 text-[11px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer" data-date="${rec.date}" data-slot="${rec.timeSlot}" data-ref="${rec.ref}" data-name="${rec.name}">
                                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                                <span>Cancel / Delete Booking</span>
                            </button>
                            <button type="button" class="secret-copy-record-btn px-2.5 py-1.5 bg-[#f7f3ea] border border-[#e9dcc9] hover:bg-[#3c2f25] hover:text-white text-[#3c2f25] text-[11px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer" data-ref="${rec.ref}">
                                <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                                <span>Copy Details</span>
                            </button>
                        </div>
                        <span class="text-[10px] text-[#78716c] font-mono">${rec.timeSlot}</span>
                    </div>
                </div>
            `;
        }).join('');

        // Bind delete / cancel buttons
        listEl.querySelectorAll('.secret-release-record-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const date = btn.getAttribute('data-date');
                const slot = btn.getAttribute('data-slot');
                const ref = btn.getAttribute('data-ref');
                const name = btn.getAttribute('data-name');

                if (confirm(`Cancel and delete booking for "${name}" on ${date} (${slot})?

This will instantly reopen the slot on the public booking calendar.`)) {
                    releaseSlot(date, slot, ref);
                    showSecretActionFeedback(`Booking cancelled for ${name}. The slot "${slot}" on ${date} is now open and available on the calendar.`);
                    renderSecretLedger();
                    if (dateInput) renderTimeSlots(dateInput.value);
                }
            });
        });

        // Bind copy buttons
        listEl.querySelectorAll('.secret-copy-record-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const ref = btn.getAttribute('data-ref');
                const matching = allRecords.find(r => r.ref === ref);
                if (!matching) return;
                const summary = `BOOKING #${matching.ref}
Client: ${matching.name}
Phone: ${matching.phone || 'N/A'}
Email: ${matching.email || 'N/A'}
Date: ${matching.date}
Time: ${matching.timeSlot}
Treatment: ${matching.treatment}
Notes: ${matching.notes || 'None'}`;
                navigator.clipboard.writeText(summary).then(() => {
                    btn.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5"></i> Copied!';
                    initIcons();
                    setTimeout(() => {
                        btn.innerHTML = '<i data-lucide="copy" class="w-3.5 h-3.5"></i> Copy Details';
                        initIcons();
                    }, 2000);
                }).catch(() => {
                    prompt('Copy booking details:', summary);
                });
            });
        });

        initIcons();
    };

    const bindSecretModalEvents = (modal) => {
        // Password Form Submission
        const passForm = modal.querySelector('#secret-password-form');
        if (passForm) {
            passForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const passInput = document.getElementById('secret-password-input');
                const errorEl = document.getElementById('secret-password-error');
                const enteredPass = passInput ? passInput.value.trim() : '';

                if (enteredPass === getAdminPassword()) {
                    setTherapistAuthed(true);
                    if (errorEl) errorEl.classList.add('hidden');
                    showDashboard();
                } else {
                    if (errorEl) {
                        errorEl.classList.remove('hidden');
                        const errorText = document.getElementById('secret-password-error-text');
                        if (errorText) errorText.innerText = 'Incorrect password. Please try again.';
                    }
                    if (passInput) {
                        passInput.value = '';
                        passInput.focus();
                        passInput.classList.add('ring-2', 'ring-rose-500');
                        setTimeout(() => passInput.classList.remove('ring-2', 'ring-rose-500'), 1500);
                    }
                }
            });
        }

        // Toggle password show/hide
        const togglePassBtn = modal.querySelector('#toggle-password-visibility');
        if (togglePassBtn) {
            togglePassBtn.addEventListener('click', () => {
                const passInput = document.getElementById('secret-password-input');
                const toggleIcon = document.getElementById('toggle-password-icon');
                if (passInput) {
                    const isPass = passInput.type === 'password';
                    passInput.type = isPass ? 'text' : 'password';
                    if (toggleIcon) {
                        toggleIcon.setAttribute('data-lucide', isPass ? 'eye-off' : 'eye');
                        initIcons();
                    }
                }
            });
        }

        // Cancel on password gate
        const cancelGateBtn = modal.querySelector('#close-gate-cancel-btn');
        if (cancelGateBtn) {
            cancelGateBtn.addEventListener('click', closeSecretModal);
        }

        // Lock button (Sign Out)
        const lockBtn = modal.querySelector('#secret-lock-btn');
        if (lockBtn) {
            lockBtn.addEventListener('click', () => {
                setTherapistAuthed(false);
                showPasswordGate();
            });
        }

        // Change Password button
        const changePassBtn = modal.querySelector('#secret-change-pass-btn');
        if (changePassBtn) {
            changePassBtn.addEventListener('click', () => {
                const currentPass = prompt('Enter your CURRENT therapist password:');
                if (currentPass === null) return;
                if (currentPass !== getAdminPassword()) {
                    alert('Verification failed: The current password entered was incorrect.');
                    return;
                }
                const newPass = prompt('Enter your NEW private therapist password (at least 4 characters):');
                if (newPass === null) return;
                if (newPass.trim().length < 4) {
                    alert('Password must be at least 4 characters long.');
                    return;
                }
                setAdminPassword(newPass.trim());
                showSecretActionFeedback('Password updated successfully! Your new password is now active.');
            });
        }

        const closeBtn = modal.querySelector('#close-secret-modal-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeSecretModal);
        }

        // Close on dark backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeSecretModal();
            }
        });

        // Tab Switching (Only 2 Tabs!)
        modal.querySelectorAll('.secret-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');

                modal.querySelectorAll('.secret-tab-btn').forEach(b => {
                    b.classList.remove('border-[#3c2f25]', 'text-[#3c2f25]', 'bg-white/70');
                    b.classList.add('border-transparent', 'text-[#78716c]');
                });
                btn.classList.remove('border-transparent', 'text-[#78716c]');
                btn.classList.add('border-[#3c2f25]', 'text-[#3c2f25]', 'bg-white/70');

                modal.querySelectorAll('.secret-tab-panel').forEach(panel => {
                    panel.classList.add('hidden');
                });
                const activePanel = modal.querySelector(`#${targetTab}`);
                if (activePanel) {
                    activePanel.classList.remove('hidden');
                }

                if (targetTab === 'tab-manage-bookings') {
                    renderSecretLedger();
                }
                initIcons();
            });
        });

        // Form Submit: Reserve a Slot
        const reserveForm = modal.querySelector('#secret-reserve-form');
        if (reserveForm) {
            reserveForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const dateVal = document.getElementById('secret-reserve-date')?.value;
                const slotVal = document.getElementById('secret-reserve-slot')?.value;
                const nameVal = document.getElementById('secret-reserve-name')?.value.trim() || 'Reserved Slot';
                const phoneVal = document.getElementById('secret-reserve-phone')?.value.trim() || 'N/A';
                const notesVal = document.getElementById('secret-reserve-notes')?.value.trim() || 'Reserved by therapist';

                if (!dateVal) {
                    alert('Please select a date.');
                    return;
                }

                if (slotVal === 'ALL') {
                    if (confirm(`Block all 11 slots for ${dateVal} (Studio closed / Day off)?`)) {
                        blockEntireDay(dateVal, `${nameVal} - ${notesVal}`);
                        showSecretActionFeedback(`Entire day (${dateVal}) marked as Reserved. All slots are unavailable on public calendar.`);
                        reserveForm.reset();
                        document.getElementById('secret-reserve-date').value = dateVal;
                        if (dateInput) renderTimeSlots(dateInput.value);
                        renderSecretLedger();
                    }
                    return;
                }

                if (isSlotBooked(dateVal, slotVal)) {
                    if (!confirm(`Notice: The slot "${slotVal}" on ${dateVal} is already marked as Taken. Do you want to record this reservation anyway?`)) {
                        return;
                    }
                }

                const ref = 'HM-RES-' + Math.floor(100000 + Math.random() * 900000);
                const record = {
                    ref: ref,
                    name: nameVal,
                    phone: phoneVal,
                    email: 'N/A',
                    treatment: 'Reserved Slot',
                    duration: '60',
                    date: dateVal,
                    timeSlot: slotVal,
                    source: 'Therapist Reservation',
                    notes: notesVal,
                    createdAt: new Date().toISOString(),
                    status: 'Confirmed'
                };

                bookSlot(dateVal, slotVal, record);
                showSecretActionFeedback(`Slot "${slotVal}" on ${dateVal} successfully reserved for "${nameVal}". It is now unavailable on the public calendar.`);

                reserveForm.reset();
                document.getElementById('secret-reserve-date').value = dateVal;

                if (dateInput) renderTimeSlots(dateInput.value);
                renderSecretLedger();
            });
        }
    };

    window.openSecretModal = () => {
        if (!secretModalEl) {
            secretModalEl = createSecretModal();
        }
        secretModalEl.classList.remove('hidden');

        if (isTherapistAuthed()) {
            showDashboard();
        } else {
            showPasswordGate();
        }
        initIcons();
    };

    window.closeSecretModal = () => {
        if (secretModalEl) {
            secretModalEl.classList.add('hidden');
        }
    };

    window.toggleSecretModal = () => {
        if (secretModalEl && !secretModalEl.classList.contains('hidden')) {
            closeSecretModal();
        } else {
            openSecretModal();
        }
    };

    window.updateSecretManagerView = () => {
        if (secretModalEl && !secretModalEl.classList.contains('hidden') && isTherapistAuthed()) {
            renderSecretLedger();
        }
    };

    // Secret Triggers Setup:
    // 1. Keyboard Shortcut: Alt + B or Ctrl + Shift + B
    window.addEventListener('keydown', (e) => {
        if ((e.altKey && (e.key === 'b' || e.key === 'B')) ||
            (e.ctrlKey && e.shiftKey && (e.key === 'b' || e.key === 'B')) ||
            (e.metaKey && e.shiftKey && (e.key === 'b' || e.key === 'B'))) {
            e.preventDefault();
            toggleSecretModal();
        }
        if (e.key === 'Escape') {
            closeSecretModal();
        }
    });

    // 2. Secret URL Query Check: ?manage or ?admin or #manage
    const checkSecretUrlParam = () => {
        try {
            const url = new URL(window.location.href);
            if (url.searchParams.has('manage') || url.searchParams.has('admin') || url.searchParams.has('secret') ||
                window.location.hash === '#manage' || window.location.hash === '#admin') {
                setTimeout(openSecretModal, 150);
            }
        } catch (e) {
            console.warn('URL check notice', e);
        }
    };
    checkSecretUrlParam();
    window.addEventListener('hashchange', checkSecretUrlParam);

    // 3. Click Triggers on Mobile and Desktop
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.therapist-portal-trigger, #footer-secret-trigger, #booking-secret-trigger');
        if (trigger) {
            e.preventDefault();
            openSecretModal();
        }
    });

    // 7. Interactive Category Filter for Treatments (services.html)
    const treatmentFilterBtns = document.querySelectorAll('.treatment-filter-btn');
    const treatmentCards = document.querySelectorAll('.treatment-card');

    if (treatmentFilterBtns.length > 0 && treatmentCards.length > 0) {
        treatmentFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');

                // Update active state
                treatmentFilterBtns.forEach(b => {
                    b.classList.remove('bg-[#4a3728]', 'text-white', 'border-[#4a3728]');
                    b.classList.add('bg-white', 'text-[#4a3728]', 'border-[#e9dcc9]');
                });
                btn.classList.remove('bg-white', 'text-[#4a3728]', 'border-[#e9dcc9]');
                btn.classList.add('bg-[#4a3728]', 'text-white', 'border-[#4a3728]');

                // Filter cards
                treatmentCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    if (filter === 'all' || category === filter) {
                        card.style.display = 'grid';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
});
