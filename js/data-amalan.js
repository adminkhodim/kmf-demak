/**
 * KMF Demak - Modul Amalan & Doa Masyayikh Mathali'ul Falah Kajen
 * 1. Tahlil & Doa Arwah (Hadhrah Khusus Masyayikh Kajen: Mbah Mutamakkin, Mbah Dullah Salam, Mbah Sahal Mahfudh, dll.)
 * 2. Surat Yasin Lengkap (83 Ayat)
 * 3. Wirid Ba'da Shalat Maktubah
 * 4. Istighotsah
 */

const dataAmalan = {
    // 1. Tahlil & Hadhrah
    tahlil: [
        {
            no: 1,
            title: "Hadhrah Fatihah Khusus Masyayikh Kajen & Mathali'ul Falah",
            arabic: "إِلَى حَضْرَةِ النَّبِيِّ الْمُصْطَفَى سَيِّدِنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ وَعَلَى آلِهِ وَأَصْحَابِهِ وَأَزْوَاجِهِ وَذُرِّيَّاتِهِ وَأَهْلِ بَيْتِهِ أَجْمَعِيْنَ، ثُمَّ إِلَى أَرْوَاحِ جَمِيْعِ الْأَنْبِيَاءِ وَالْمُرْسَلِيْنَ وَالْأَوْلِيَاءِ وَالشُّهَدَاءِ وَالصَّالِحِيْنَ وَالْعُلَمَاءِ الْعَامِلِيْنَ وَالْمُصَنِّفِيْنَ الْمُخْلِصِيْنَ، خُصُوْصًا سُلْطَانَ الْأَوْلِيَاءِ الشَّيْخَ عَبْدَ الْقَادِرِ الْجِيْلَانِي رَضِيَ اللهُ عَنْهُ، وَخُصُوْصًا إِلَى صَاحِبِ كَاجِيْن الشَّيْخ أَحْمَد الْمُتَمَكِّن، وَمُؤَسِّسِي وَمَشَايِخِ مَعْهَدِ وَمَدْرَسَةِ مَثَالِعِ الْفَلَاحِ كَاجِيْن: الشَّيْخ عَبْدِ اللهِ سَلَام، وَالشَّيْخ مُحَمَّد أَحْمَد سَهْل مَحْفُوْظ، وَالشَّيْخ هَاشِم أَشْعَرِي، وَالشَّيْخ عَبْدِ الْحَمِيْد، وَالشَّيْخ عَلِيِّ نَفِيْس، وَالشَّيْخِ إِسْمَاعِيْل، وَالشَّيْخ نَاجِيْح، وَمَشَايِخِنَا وَأَسَاتِذَتِنَا وَمَنْ أَحْسَنَ إِلَيْنَا وَإِلَى أَرْوَاحِ وَالِدِيْنَا وَأَمْوَاتِ الْمُسْلِمِيْنَ كَافَّةً عَامَّةً، شَيْءٌ لِلّٰهِ لَهُمُ الْفَاتِحَةُ...",
            latin: "Ilâ ḫadhratin-nabiyyil-mushthafâ sayyidinâ Muḫammadin shallallâhu ‘alaihi wa sallama wa ‘alâ âlihî wa ash-ḫâbihî wa azwâjihî wa dzurriyyâtihî wa ahli baitihî ajma‘în. Tsumma ilâ arwâḫi jamî‘il-anbiyâ’i wal-mursalîn wal-auliyâ’i wasy-syuhadâ’i wash-shâliḫîn wal-‘ulamâ’il-‘âmilîn wal-mushannifînal-mukhlishîn, khushûshan sulthânal-auliyâ’isy-syaikha ‘Abdal Qâdir al-Jîlânî radhiyallâhu ‘anhu. Wa khushûshan ilâ shâḫibi Kâjîn asy-Syaikh Aḫmad al-Mutamakkin, wa mu'assisî wa masyâyikhi ma‘hadi wa madrasati Mathâli‘il-Falâḫ Kâjîn: asy-Syaikh ‘Abdallâh Salâm, wa asy-Syaikh Muḫammad Aḫmad Sahal Maḫfûzh, wa asy-Syaikh Hâsyim Asy‘arî, wa asy-Syaikh ‘Abdul Ḫamîd, wa asy-Syaikh ‘Alî Nafîs, wa asy-Syaikh Ismâ‘îl, wa asy-Syaikh Nâjîḫ, wa masyâyikhinâ wa asâtidzatina wa man aḫsana ilainâ, wa ilâ arwâḫi wâlidinâ wa amwâtil-muslimîna kâffatan ‘âmmah, syai’un lillâhi lahumul-fâtiḫah.",
            translation: "Kepada yang terhormat junjungan kita Nabi Muhammad ﷺ, segenap keluarga, sahabat, istri, dan keturunan beliau. Kemudian kepada arwah para nabi, rasul, wali, syuhada, shalihin, para ulama yang mengamalkan ilmunya, serta pengarang kitab yang ikhlas, terkhusus Sulthanul Auliya Syekh Abdul Qadir Al-Jilani. Dan terkhusus kepada Waliyullah Sahib Kajen Syekh Ahmad Mutamakkin, para pendiri dan Masyayikh Pondok & Perguruan Islam Mathali'ul Falah Kajen: KH. Abdullah Salam, KH. MA. Sahal Mahfudh, KH. Hasyim Asy'ari, KH. Abdul Hamid, KH. Ali Nafis, KH. Ismail, KH. Najih, segenap guru-guru kami dan orang yang berbuat baik kepada kami, serta orang tua kami dan segenap kaum muslimin yang telah wafat. Al-Fatihah."
        },
        {
            no: 2,
            title: "Surat Al-Ikhlas (3x)",
            arabic: "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ. قُلْ هُوَ اللّٰهُ اَحَدٌۚ، اَللّٰهُ الصَّمَدُۚ، لَمْ يَلِدْ وَلَمْ يُوْلَدْۙ، وَلَمْ يَكُنْ لَّهٗ كُفُوًا اَحَدٌ (×٣)",
            latin: "Bismillâhir-raḫmânir-raḫîm. Qul huwallâhu aḫad, Allâhush-shamad, lam yalid wa lam yûlad, wa lam yakul lahû kufuwan aḫad. (3x)",
            translation: "Katakanlah (Muhammad), Dialah Allah Yang Maha Esa. Allah tempat meminta segala sesuatu. Dia tidak beranak dan tidak pula diperanakkan. Dan tidak ada sesuatu yang setara dengan Dia. (3 kali)"
        },
        {
            no: 3,
            title: "Tahlil & Takbir",
            arabic: "لَا إِلٰهَ إِلَّا اللهُ وَاللهُ أَكْبَرُ وَلِلّٰهِ الْحَمْدُ",
            latin: "Lâ ilâha illallâhu wallâhu akbar wa lillâhil-ḫamd",
            translation: "Tiada Tuhan selain Allah, Allah Maha Besar, dan segala puji hanya milik Allah."
        },
        {
            no: 4,
            title: "Surat Al-Falaq",
            arabic: "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ. قُلْ اَعُوْذُ بِرَبِّ الْفَلَقِۙ، مِنْ شَرِّ مَا خَلَقَۙ، وَمِنْ شَرِّ غَاسِقٍ اِذَا وَقَبَۙ، وَمِنْ شَرِّ النَّفّٰثٰتِ فِى الْعُقَدِۙ، وَمِنْ شَرِّ حَاسِدٍ اِذَا حَسَدَ",
            latin: "Bismillâhir-raḫmânir-raḫîm. Qul a‘ûdzu birabbil-falaq, min syarri mâ khalaq, wa min syarri ghâsiqin idzâ waqab, wa min syarrin-naffâtsâti fil-‘uqad, wa min syarri ḫâsidin idzâ ḫasad.",
            translation: "Katakanlah: Aku berlindung kepada Tuhan yang menguasai subuh, dari kejahatan makhluk-Nya..."
        },
        {
            no: 5,
            title: "Surat An-Nas",
            arabic: "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ. قُلْ اَعُوْذُ بِرَبِّ النَّاسِۙ، مَلِكِ النَّاسِۙ، اِلٰهِ النَّاسِۙ، مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِۖ، الَّذِيْ يُوَسْوِسُ فِيْ صُدُوْرِ النَّاسِۙ، مِنَ الْجِنَّةِ وَالنَّاسِ",
            latin: "Bismillâhir-raḫmânir-raḫîm. Qul a‘ûdzu birabbin-nâs, malikin-nâs, ilâhin-nâs, min syarril-waswâsil-khannâs, alladzî yuwaswisu fî shudûrin-nâs, minal-jinnati wan-nâs.",
            translation: "Katakanlah: Aku berlindung kepada Tuhannya manusia, Raja manusia, Sembahan manusia..."
        },
        {
            no: 6,
            title: "Tahlil & Kalimah Thayyibah (33x / 100x)",
            arabic: "أَفْضَلُ الذِّكْرِ فَاعْلَمْ أَنَّهُ: لَا إِلٰهَ إِلَّا اللهُ، حَيٌّ مَوْجُوْدٌ، لَا إِلٰهَ إِلَّا اللهُ، حَيٌّ مَعْبُوْدٌ، لَا إِلٰهَ إِلَّا اللهُ، حَيٌّ بَاقٍ، لَا إِلٰهَ إِلَّا اللهُ (×٣٣)\nسَيِّدُنَا مُحَمَّدٌ رَسُوْلُ اللهِ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ كَلِمَةُ حَقٍّ عَلَيْهَا نَحْيَا وَعَلَيْهَا نَمُوْتُ وَبِهَا نُبْعَثُ إِنْ شَاءَ اللهُ تَعَالَى مِنَ الْآمِنِيْنَ",
            latin: "Afdhaludz-dzikri fa‘lam annahu: Lâ ilâha illallâh, ḫayyun maujûd. Lâ ilâha illallâh, ḫayyun ma‘bûd. Lâ ilâha illallâh, ḫayyun bâq. Lâ ilâha illallâh (33x). Sayyidunâ Muḫammadur rasûlullâhi shallallâhu ‘alaihi wa sallam, kalimatü ḫaqqin ‘alaihâ naḫyâ wa ‘alaihâ namûtu wa bihâ nub‘atsu in syâ’allâhu ta‘âlâ minal-âminîn.",
            translation: "Ketahuilah sebaik-baik dzikir adalah ucapan: Tiada Tuhan selain Allah, Dzat yang Hidup dan Wujud. Tiada Tuhan selain Allah, Dzat yang Hidup dan Disembah. Tiada Tuhan selain Allah, Dzat yang Hidup dan Kekal. La ilaha illallah (33x). Junjungan kita Nabi Muhammad adalah utusan Allah ﷺ, kalimah kebenaran yang dengannya kami hidup, kami wafat, dan dibangkitkan kembali insya Allah termasuk orang-orang yang aman."
        },
        {
            no: 7,
            title: "Doa Tahlil & Doa Arwah Masyayikh Kajen",
            arabic: "اَللّٰهُمَّ اجْعَلْ وَأَوْصِلْ ثَوَابَ مَا قَرَأْنَاهُ مِنْ كِتَابِكَ الْعَزِيْزِ، وَمَا هَلَّلْنَا وَمَا سَبَّحْنَا وَمَا اسْتَغْفَرْنَا وَمَا صَلَّيْنَا عَلَى سَيِّدِنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ هَدِيَّةً وَاصِلَةً وَرَحْمَةً نَازِلَةً وَبَرَكَةً شَامِلَةً إِلَى حَضْرَةِ حَبِيْبِنَا وَشَفِيْعِنَا مُحَمَّدٍ ﷺ، ثُمَّ إِلَى أَرْوَاحِ سَادَاتِنَا مَشَايِخِ كَاجِيْن وَمَثَالِعِ الْفَلَاحِ، خُصُوْصًا إِلَى رُوْحِ الْعَالِمِ الْعَلَّامَةِ الشَّيْخِ عَبْدِ اللهِ سَلَام، وَالشَّيْخِ مُحَمَّد أَحْمَد سَهْل مَحْفُوْظ، وَالشَّيْخ هَاشِم أَشْعَرِي، وَجَمِيْعِ مَشَايِخِنَا وَأَمْوَاتِنَا. اَللّٰهُمَّ اغْفِرْ لَهُمْ وَارْحَمْهُمْ وَعَافِهِمْ وَاعْفُ عَنْهُمْ، وَاجْعَلِ الْجَنَّةَ مَثْوَاهُمْ، وَانْفَعْنَا بِبَرَكَاتِهِمْ وَعُلُوْمِهِمْ فِي الدِّيْنِ وَالدُّنْيَا وَالْآخِرَةِ، رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ، وَصَلَّى اللهُ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلَّمَ، سُبْحَانَ رَبِّكَ رَبِّ الْعِزَّةِ عَمَّا يَصِفُوْنَ وَسَلَامٌ عَلَى الْمُرْسَلِيْنَ وَالْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِيْنَ.",
            latin: "Allâhummaj‘al wa awshil tsawâba mâ qara’nâhu min kitâbikal-‘azîz, wa mâ hallalnâ wa mâ sabbaḫnâ wa mastaghfarnâ wa mâ shallainâ ‘alâ sayyidinâ Muḫammadin shallallâhu ‘alaihi wa sallam, hadiyyatan wâshilatan wa raḫmatan nâzilatan wa barakatan syâmilah, ilâ ḫadhrati ḫabîbinâ wa syafi‘inâ Muḫammadin ﷺ, tsumma ilâ arwâḫi sâdâtinâ masyâyikhi Kâjîn wa Mathâli‘il-Falâḫ, khushûshan ilâ rûḫil-‘âlimil-‘allâmah asy-Syaikh ‘Abdallâh Salâm, wa asy-Syaikh Muḫammad Aḫmad Sahal Maḫfûzh, wa asy-Syaikh Hâsyim Asy‘arî, wa jamî‘i masyâyikhinâ wa amwâtinâ. Allâhummaghfir lahum warḫamhum wa ‘âfihim wa‘fu ‘anhum, waj‘alil-jannata matswâhum, wanfa‘nâ bibarakâtihim wa ‘ulûmihim fid-dîni wad-dunyâ wal-âkhirah. Rabbanâ âtinâ fid-dunyâ ḫasanah wa fil-âkhirati ḫasanah wa qinâ ‘adzâban-nâr. Washallallâhu ‘alâ sayyidinâ Muḫammadin wa ‘alâ âlihî washahbihî wasallam, subḫâna rabbika rabbil-‘izzati ‘ammâ yashifûn wa salâmun ‘alal-mursalîna wal-ḫamdu lillâhi rabbil-‘âlamîn.",
            translation: "Ya Allah, jadikanlah dan sampaikanlah pahala bacaan Kitab-Mu yang mulia, tahlil, tasbih, istighfar, dan shalawat kami kepada Nabi Muhammad ﷺ, sebagai hadiah yang sampai, rahmat yang turun, dan berkah yang menyeluruh. Kemudian kepada para guru mulia kami Masyayikh Kajen dan Mathali'ul Falah, terkhusus Al-Alim Al-Allamah KH. Abdullah Salam, KH. MA. Sahal Mahfudh, KH. Hasyim Asy'ari, dan segenap masyayikh serta ahli kubur kami. Ya Allah ampunilah mereka, rahmatilah mereka, dan berilah kami manfaat keberkahan serta ilmu mereka di dunia dan akhirat."
        }
    ],

    // 2. Surat Yasin (Ringkasan / Pilihan Pembacaan Cepat & Lengkap)
    yasinInfo: {
        surahNumber: 36,
        name: "Yā Sīn (يس)",
        totalAyah: 83,
        revelation: "Makkiyyah",
        fadhilah: "Jantung Al-Qur'an (Qalbul Qur'an), pembuka hajat dan penerang kubur para pendahulu."
    },

    // 3. Wirid Ba'da Shalat (Tradisi Pesantren Mathali'ul Falah)
    wirid: [
        {
            no: 1,
            nama: "Istighfar (3x)",
            arabic: "أَسْتَغْفِرُ اللهَ الْعَظِيْمَ، الَّذِيْ لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّوْمُ وَأَتُوْبُ إِلَيْهِ (×٣)",
            latin: "Astaghfirullâhal-‘azhîm, alladzî lâ ilâha illâ huwal-ḫayyul-qayyûmu wa atûbu ilaih (3x)",
            translation: "Aku memohon ampun kepada Allah Yang Maha Agung, tiada Tuhan selain Dia Yang Maha Hidup lagi Maha Berdiri Sendiri, dan aku bertobat kepada-Nya."
        },
        {
            no: 2,
            nama: "Tahlil & Pengagungan",
            arabic: "لَا إِلٰهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيْكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِيْ وَيُمِيْتُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيْرٌ (×٣)",
            latin: "Lâ ilâha illallâhu waḫdahû lâ syarîka lah, lahul-mulku wa lahul-ḫamdu yuḫyî wa yumîtu wa huwa ‘alâ kulli syai'in qadîr (3x)",
            translation: "Tiada Tuhan selain Allah semata, tiada sekutu bagi-Nya. Bagi-Nya kerajaan dan puji-pujian, Yang menghidupkan dan mematikan, dan Dia Maha Kuasa atas segala sesuatu."
        },
        {
            no: 3,
            nama: "Doa Perlindungan dari Api Neraka (3x / 7x)",
            arabic: "اَللّٰهُمَّ أَجِرْنَا مِنَ النَّارِ (×٣)",
            latin: "Allâhumma ajirnâ minan-nâr (3x)",
            translation: "Ya Allah, selamatkanlah dan lindungilah kami dari siksa api neraka."
        },
        {
            no: 4,
            nama: "Doa Keselamatan (Allahumma Antas Salam)",
            arabic: "اَللّٰهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ وَإِلَيْكَ يَعُوْدُ السَّلَامُ، فَحَيِّنَا رَبَّنَا بِالسَّلَامِ، وَأَدْخِلْنَا الْجَنَّةَ دَارَ السَّلَامِ، تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
            latin: "Allâhumma antas-salâm wa minkas-salâm wa ilaika ya‘ûdus-salâm, faḫayyinâ rabbanâ bis-salâm, wa adkhilnal-jannata dâras-salâm, tabârakta rabbanâ wa ta‘âlaita yâ dzal-jalâli wal-ikrâm.",
            translation: "Ya Allah, Engkaulah Maha Damai, dan dari-Mu keselamatan, dan kepada-Mu kembali kesejahteraan. Hidupkanlah kami ya Tuhan kami dengan damai, masukkanlah kami ke surga negeri kedamaian. Maha Berkah Engkau dan Maha Luhur, wahai Pemilik Keagungan dan Kemuliaan."
        },
        {
            no: 5,
            nama: "Ayat Kursi",
            arabic: "اَللّٰهُ لَآ اِلٰهَ اِلَّا هُوَۚ اَلْحَيُّ الْقَيُّوْمُ ەۚ لَا تَأْخُذُهٗ سِنَةٌ وَّلَا نَوْمٌۗ لَهٗ مَا فِى السَّمٰوٰتِ وَمَا فِى الْاَرْضِۗ مَنْ ذَا الَّذِيْ يَشْفَعُ عِنْدَهٗٓ اِلَّا بِاِذْنِهٖۗ يَعْلَمُ مَا بَيْنَ اَيْدِيْهِمْ وَمَا خَلْفَهُمْۚ وَلَا يُحِيْطُوْنَ بِشَيْءٍ مِّنْ عِلْمِهٖٓ اِلَّا بِمَا شَاۤءَۚ وَسِعَ كُرْسِيُّهُ السَّمٰوٰتِ وَالْاَرْضَۚ وَلَا يَـُٔوْدُهٗ حِفْظُهُمَاۚ وَهُوَ الْعَلِيُّ الْعَظِيْمُ",
            latin: "Allâhu lâ ilâha illâ huwal-ḫayyul-qayyûm. Lâ ta'khudzuhû sinatuw wa lâ naûm. Lahû mâ fis-samâwâti wa mâ fil-ardh. Man dzalladzî yasyfa‘u ‘indahû illâ bi-idznih. Ya‘lamu mâ baina aidîhim wa mâ khalfahum, wa lâ yuḫîthûna bisyai'im min ‘ilmihî illâ bimâ syâ’. Wasi‘a kursiyyuhus-samâwâti wal-ardh, wa lâ ya'ûduhû ḫifzhuhumâ wa huwal-‘aliyyul-‘azhîm.",
            translation: "Allah, tidak ada Tuhan selain Dia yang Maha Hidup lagi terus menerus mengurus makhluk-Nya..."
        },
        {
            no: 6,
            nama: "Tasbih, Tahmid, Takbir (33x)",
            arabic: "سُبْحَانَ اللهِ (×٣٣)\nاَلْحَمْدُ لِلّٰهِ (×٣٣)\nاَللهُ أَكْبَرُ (×٣٣)",
            latin: "Subḫânallâh (33x), Al-ḫamdulillâh (33x), Allâhu Akbar (33x)",
            translation: "Maha Suci Allah (33x), Segala puji bagi Allah (33x), Allah Maha Besar (33x)."
        }
    ],

    // 4. Istighotsah Salafus Shalih (Tradisi Pesantren Kajen)
    istighotsah: [
        {
            no: 1,
            nama: "Basmalah & Istighfar Pembuka",
            arabic: "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ. أَسْتَغْفِرُ اللهَ الْعَظِيْمَ (×٣)",
            latin: "Bismillâhir-raḫmânir-raḫîm. Astaghfirullâhal-‘azhîm (3x)",
            translation: "Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang. Aku mohon ampun kepada Allah Yang Maha Agung."
        },
        {
            no: 2,
            nama: "Hauqalah (La Haula Wala Quwwata Illa Billah)",
            arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ الْعَلِيِّ الْعَظِيْمِ (×٣)",
            latin: "Lâ ḫaula wa lâ quwwata illâ billâhil-‘aliyyil-‘azhîm (3x)",
            translation: "Tiada daya dan tiada kekuatan kecuali dengan pertolongan Allah Yang Maha Tinggi lagi Maha Agung."
        },
        {
            no: 3,
            nama: "Shalawat Munjiyat / Nariyah",
            arabic: "اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلَاةً تُنْجِيْنَا بِهَا مِنْ جَمِيْعِ الْأَهْوَالِ وَالْآفَاتِ، وَتَقْضِيْ لَنَا بِهَا جَمِيْعَ الْحَاجَاتِ، وَتُطَهِّرُنَا بِهَا مِنْ جَمِيْعِ السَّيِّئَاتِ، وَتَرْفَعُنَا بِهَا عِنْدَكَ أَعْلَى الدَّرَجَاتِ، وَتُبَلِّغُنَا بِهَا أَقْصَى الْغَايَاتِ مِنْ جَمِيْعِ الْخَيْرَاتِ فِي الْحَيَاةِ وَبَعْدَ الْمَمَاتِ",
            latin: "Allâhumma shalli ‘alâ sayyidinâ Muḫammadin shalâtan tunjînâ bihâ min jamî‘il-ahwâli wal-âfât, wa taqdhî lanâ bihâ jamî‘al-ḫâjât, wa tuthahhirunâ bihâ min jamî‘is-sayyi'ât, wa tarfa‘unâ bihâ ‘indaka a‘lad-darajât, wa tuballighunâ bihâ aqshal-ghâyâti min jamî‘il-khairâti fil-ḫayâti wa ba‘dal-mamât.",
            translation: "Ya Allah, limpahkanlah rahmat kepada junjungan kami Nabi Muhammad, yang dengan shalawat itu Engkau selamatkan kami dari segala mara bahaya, Engkau penuhi segala hajat kami, Engkau bersihkan kami dari segala keburukan, Engkau angkat derajat kami di sisi-Mu, dan Engkau sampaikan kami pada puncak kebaikan semasa hidup maupun setelah wafat."
        },
        {
            no: 4,
            nama: "Doa Nabi Yunus (Dzikir Pelepas Kesulitan)",
            arabic: "لَا إِلٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِيْنَ (×٤١)",
            latin: "Lâ ilâha illâ anta sub-ḫânaka innî kuntu minadh-dhâlimîn (41x)",
            translation: "Tiada Tuhan selain Engkau, Maha Suci Engkau, sungguh aku termasuk orang-orang yang zalim."
        },
        {
            no: 5,
            nama: "Ya Hayyu Ya Qayyum",
            arabic: "يَا حَيُّ يَا قَيُّوْمُ بِرَحْمَتِكَ أَسْتَغِيْثُ (×٣٣)",
            latin: "Yâ Ḫayyu yâ Qayyûmu biraḫmatika astaghîts (33x)",
            translation: "Wahai Dzat Yang Maha Hidup lagi Maha Berdiri Sendiri, dengan rahmat-Mu aku memohon pertolongan."
        },
        {
            no: 6,
            nama: "Ya Lathif (Dzikir Kelembutan & Keselamatan)",
            arabic: "يَا لَطِيْفُ (×١٢٩ / ×٣٣)",
            latin: "Yâ Lathîf (33x / 129x)",
            translation: "Wahai Dzat Yang Maha Lembut."
        }
    ]
};

if (typeof window !== 'undefined') {
    window.dataAmalan = dataAmalan;
}
