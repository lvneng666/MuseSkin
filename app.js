/* -------------------------------------------------------------
 * PEAFFEE - Interactive Logic & Translation Engine
 * ------------------------------------------------------------- */

// 全局集中配置项 (方便随时修改真实联系方式与后端 API)
const SITE_CONFIG = {
    email: "concierge@peaffee.com",
    phone: "+1 (234) 567-890",
    whatsapp: "+1 (234) 567-890",
    whatsappLink: "https://wa.me/1234567890",
    formspreeEndpoint: "https://formspree.io/f/placeholder" // 替换为真实的 Formspree Endpoint 如 "https://formspree.io/f/xxxx"
};

// Let Vite resolve and hash these source assets during production builds.
// Dynamic plain-string paths are not rewritten by Vite.
const SHOWCASE_IMAGES = {
    hero: new URL('./assets/hero.webp', import.meta.url).href,
    cream: new URL('./assets/cream.webp', import.meta.url).href,
    cleanser: new URL('./assets/cleanser.webp', import.meta.url).href
};

document.addEventListener('DOMContentLoaded', () => {

    // 12 款 Cult Classics 产品在中英文环境下的元数据明细（供 Quick View Modal 弹窗使用）
    const PRODUCT_DATA = {
        "The Active Serum": {
            en: {
                category: "Hydrate & Revitalize",
                title: "The Active Serum",
                price: "$88.00 USD",
                moq: "MOQ: 100 units",
                desc: "A highly concentrated botanical elixir infused with multi-molecular hyaluronic acid and green tea antioxidants to deeply hydrate and plump dermal layers.",
                actives: "Multi-Molecular Hyaluronic Acid (1.5%), Organic Green Tea Ferment, Bio-Ceramides",
                skin: "Dry, dehydrated, combination, or tired skin seeking barrier hydration.",
                usage: "Smooth 3-4 drops onto clean skin morning and evening prior to moisture seal."
            },
            cn: {
                category: "水润修护",
                title: "活力精华液",
                price: "$88.00 USD",
                moq: "起订量: 100 瓶",
                desc: "高浓度植萃水润精华，富含多重分子量的玻尿酸与绿茶抗氧因子，由内而外深层锁水充盈。",
                actives: "多重分子量玻尿酸 (1.5%)、有机绿茶发酵物、仿生神经酰胺",
                skin: "干性、缺水性、混合性及缺乏光泽的肌肤。",
                usage: "早晚洁面后，取 3-4 滴轻轻涂抹于面部与颈部，随后配合面霜锁水。"
            }
        },
        "The Luxury Cream": {
            en: {
                category: "Barrier Repair",
                title: "The Luxury Cream",
                price: "$95.00 USD",
                moq: "MOQ: 100 units",
                desc: "A velvet cushioning moisturizer engineered with skin-identical lipids to fortify the lipid barrier against environmental stressors.",
                actives: "Organic Ceramide NP/AP/EOP, Cold-pressed Jojoba Seed Butter, Squalane",
                skin: "Sensitized, barrier-compromised, or mature dry skin.",
                usage: "Warm a pea-sized amount between palms and press gently into face and neck."
            },
            cn: {
                category: "屏障修护",
                title: "奢华面霜",
                price: "$95.00 USD",
                moq: "起订量: 100 瓶",
                desc: "如丝绒般高能滋养的修护面霜，蕴含亲肤皮脂成分，强效固锁水份并抵御外界刺激。",
                actives: "有机神经酰胺复合物、冷压霍霍巴籽脂、植物角鲨烷",
                skin: "敏感肌、屏障受损及干性成熟肌肤。",
                usage: "取适量于掌心预热后，轻轻按压于面部及颈部直至吸收。"
            }
        },
        "The Gentle Cleanser": {
            en: {
                category: "Purify & Cleanse",
                title: "The Gentle Cleanser",
                price: "$45.00 USD",
                moq: "MOQ: 100 units",
                desc: "A low-foaming amino acid botanical milk that dissolves impurities without stripping moisture balances.",
                actives: "Coconut Amino Acid Surfactants, Chamomile Extract, Glycerin",
                skin: "All skin types, including highly sensitive skin.",
                usage: "Massage 1-2 pumps onto damp skin in circular motions, rinse thoroughly with tepid water."
            },
            cn: {
                category: "温和洁净",
                title: "温和洁面乳",
                price: "$45.00 USD",
                moq: "起订量: 100 瓶",
                desc: "氨基酸温和植物洁面乳，柔和净化油脂杂质，洗后水润不紧绷。",
                actives: "椰油酰氨基酸表面活性剂、洋甘菊提取物、高纯甘油",
                skin: "所有肤质，尤其适合极度敏感肌肤。",
                usage: "取 1-2 泵于湿润的掌心打出细腻泡沫，圆周按摩面部后用温水冲洗。"
            }
        },
        "The Balancing Toner": {
            en: {
                category: "Refine & Hydrate",
                title: "The Balancing Toner",
                price: "$55.00 USD",
                moq: "MOQ: 100 units",
                desc: "A botanical essence mist that refines pore texture and restores optimal pH balance after cleansing.",
                actives: "Rose Damascena Water, Niacinamide (2%), Witch Hazel hydrosol",
                skin: "Combination, oily, and enlarged pore textures.",
                usage: "Mist directly onto clean skin or press in with cotton pad before serum."
            },
            cn: {
                category: "平衡调理",
                title: "平衡爽肤水",
                price: "$55.00 USD",
                moq: "起订量: 100 瓶",
                desc: "细致毛孔的植物精华喷雾，迅速恢复肌底弱酸性 pH 平衡并二次补水。",
                actives: "大马士革玫瑰纯露、烟酰胺 (2%)、北美金缕梅提取物",
                skin: "混合性、油性及毛孔粗大肌肤。",
                usage: "洁面后直接喷于面部，或用棉片轻按浸润面部。"
            }
        },
        "The Eye Cream": {
            en: {
                category: "Eye Repair",
                title: "The Eye Cream",
                price: "$75.00 USD",
                moq: "MOQ: 100 units",
                desc: "Targeted peptide infusion designed to diminish dark circles, smooth fine expression lines, and reduce puffiness.",
                actives: "Acetyl Tetrapeptide-5, Caffeine Complex, Marine Collagen",
                skin: "Delicate eye contours with fine lines or fatigue.",
                usage: "Dab gently around the orbital bone with ring finger twice daily."
            },
            cn: {
                category: "眼部护理",
                title: "修护眼霜",
                price: "$75.00 USD",
                moq: "起订量: 100 瓶",
                desc: "高能多肽眼部修护霜，有效改善黑眼圈、淡化细纹并舒缓眼部浮肿。",
                actives: "乙基四肽-5、咖啡因活性复合物、深海胶原蛋白",
                skin: "眼周有细纹、暗沉及浮肿困扰的肌肤。",
                usage: "用无名指点涂于眼周骨骼周围，轻柔点按至完全吸收。"
            }
        },
        "The Protecting SPF": {
            en: {
                category: "UV Protection",
                title: "The Protecting SPF 50",
                price: "$48.00 USD",
                moq: "MOQ: 100 units",
                desc: "Invisible non-greasy mineral sunscreen providing broad-spectrum UVA/UVB shield with antioxidant benefits.",
                actives: "Non-Nano Zinc Oxide (18%), Vitamin E, Alpine Flower Complex",
                skin: "All skin types exposed to daily sunlight.",
                usage: "Apply generously 15 minutes before sun exposure as the final step of routine."
            },
            cn: {
                category: "日常防护",
                title: "清透防晒乳 SPF 50",
                price: "$48.00 USD",
                moq: "起订量: 100 瓶",
                desc: "轻薄隐形的物理防晒乳，提供全波段 UVA/UVB 防护，清爽抗氧化。",
                actives: "非纳米氧化锌 (18%)、维生素 E、高山雪绒花复合物",
                skin: "所有需要日光防护的肤质。",
                usage: "出门前 15 分钟均匀涂抹于面部及暴露部位，作为护肤最后一步。"
            }
        },
        "The Body Lotion": {
            en: {
                category: "Body Care",
                title: "The Restructuring Body Lotion",
                price: "$65.00 USD",
                moq: "MOQ: 100 units",
                desc: "Rich restructuring body milk with shea butter and lipid ceramides for long-lasting body hydration.",
                actives: "Organic Shea Butter, Sunflower Seed Oil, Ceramide NP",
                skin: "Dry or flaky body skin.",
                usage: "Smooth over warm body after shower or bath."
            },
            cn: {
                category: "身体护理",
                title: "倍润身体乳",
                price: "$65.00 USD",
                moq: "起订量: 100 瓶",
                desc: "富含乳木果油与神经酰胺的倍润身体乳，长效锁水，软化角质。",
                actives: "有机乳木果油、葵花籽油、神经酰胺 NP",
                skin: "全身干燥起皮及缺乏弹性的肌肤。",
                usage: "沐浴后取适量均匀涂抹于全身肌肤。"
            }
        },
        "The Clay Mask": {
            en: {
                category: "Detox & Purify",
                title: "The Clarifying Clay Mask",
                price: "$58.00 USD",
                moq: "MOQ: 100 units",
                desc: "Purifying Kaolin clay infused with botanical extracts to draw out impurities and regulate sebum.",
                actives: "White Kaolin Clay, Salicylic Acid (0.5%), Tea Tree Hydrosol",
                skin: "Congested, oily, or acne-prone skin.",
                usage: "Apply an even layer for 10-15 minutes, rinse before completely dry."
            },
            cn: {
                category: "深层净化",
                title: "矿物洁净泥膜",
                price: "$58.00 USD",
                moq: "起订量: 100 瓶",
                desc: "高岭土矿物净肤泥膜，深层吸附毛孔污垢，平衡油脂分泌。",
                actives: "高纯白高岭土、水杨酸 (0.5%)、茶树纯露",
                skin: "毛孔堵塞、油脂分泌旺盛及易长粉刺的肌肤。",
                usage: "敷于面部 10-15 分钟，在泥膜未完全干透前用温水洗净。"
            }
        },
        "The Botanical Essence": {
            en: {
                category: "Prebiotic Essence",
                title: "The Botanical Essence",
                price: "$62.00 USD",
                moq: "MOQ: 100 units",
                desc: "Prebiotic liquid essence that primes skin barrier and enhances absorption of active treatments.",
                actives: "Bifida Ferment Lysate, Centella Asiatica Extract",
                skin: "Sensitive and impaired barrier conditions.",
                usage: "Pat onto skin with clean palms."
            },
            cn: {
                category: "肌底养护",
                title: "植萃精华水",
                price: "$62.00 USD",
                moq: "起订量: 100 瓶",
                desc: "益生元调理精华水，舒缓肌肤并促进后续营养成分的高效吸收。",
                actives: "二裂酵母发酵产物溶胞物、积雪草提取物",
                skin: "屏障脆弱及吸收力不佳的肌肤。",
                usage: "取适量于掌心轻按至吸收。"
            }
        },
        "The Peptide Lift": {
            en: {
                category: "Firming Therapy",
                title: "The Peptide Lift",
                price: "$82.00 USD",
                moq: "MOQ: 100 units",
                desc: "Firming concentrate focused on contour definition across neck and jawline.",
                actives: "Palmitoyl Tripeptide-5, Copper Peptides",
                skin: "Sagging or aging neck & lower face skin.",
                usage: "Massage upwards along neck and jawline."
            },
            cn: {
                category: "紧致提拉",
                title: "多肽紧致护理",
                price: "$82.00 USD",
                moq: "起订量: 100 瓶",
                desc: "专注下颌线与颈部紧致的胜肽浓缩液，改善皮肤松弛状况。",
                actives: "棕榈酰三肽-5、蓝铜胜肽复合物",
                skin: "出现松弛纹路及轮廓减退的成熟肌。",
                usage: "沿颈部与下颌线由下向上按摩吸收。"
            }
        },
        "The Body Elixir": {
            en: {
                category: "Luxe Oil Care",
                title: "The Body Elixir",
                price: "$72.00 USD",
                moq: "MOQ: 100 units",
                desc: "Silky botanical body serum oil providing radiant sheen without greasy residue.",
                actives: "Rosehip Fruit Oil, Argan Kernel Oil, Vitamin E",
                skin: "Dull, very dry skin.",
                usage: "Massage onto clean damp skin."
            },
            cn: {
                category: "奢润体油",
                title: "身体精华乳",
                price: "$72.00 USD",
                moq: "起订量: 100 瓶",
                desc: "丝滑植物身体精华油，赋予皮肤亮泽质感，滋润不黏腻。",
                actives: "玫瑰果油、摩洛哥坚果油、天然维生素 E",
                skin: "暗沉、极度干枯的身体肌。",
                usage: "沐浴后趁微湿涂抹按摩。"
            }
        },
        "The Overnight Veil": {
            en: {
                category: "Overnight Repair",
                title: "The Overnight Veil",
                price: "$68.00 USD",
                moq: "MOQ: 100 units",
                desc: "Nourishing sleep mask that locks in nutrients all night long for glowy morning skin.",
                actives: "Squalane, Hyaluronic Acid, Lavender Oil",
                skin: "Dehydrated, stressed overnight care.",
                usage: "Apply as final nighttime step, rinse in morning."
            },
            cn: {
                category: "夜间修护",
                title: "夜间修护面膜",
                price: "$68.00 USD",
                moq: "起订量: 100 瓶",
                desc: "睡眠锁水面膜，在整夜休息中持续注入营养，清晨焕发丰润光采。",
                actives: "角鲨烷、玻尿酸、薰衣草植物精油",
                skin: "疲惫、熬夜及缺水肌。",
                usage: "夜间护肤最后一步涂抹薄层，次日清晨洗净。"
            }
        }
    };

    // --- Dynamically Apply SITE_CONFIG to all HTML DOM Elements ---
    const initSiteConfig = () => {
        // Update Mailto Links
        document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
            el.href = `mailto:${SITE_CONFIG.email}`;
            const textNode = el.querySelector('span');
            if (textNode && textNode.textContent.includes('@')) {
                textNode.textContent = SITE_CONFIG.email;
            }
        });

        // Update WhatsApp Links & Text
        document.querySelectorAll('a[href^="https://wa.me/"]').forEach(el => {
            el.href = SITE_CONFIG.whatsappLink;
            const textNode = el.querySelector('span');
            if (textNode && textNode.textContent.includes('WhatsApp')) {
                if (currentLang === 'cn') {
                    textNode.textContent = `WhatsApp 业务咨询: ${SITE_CONFIG.phone}`;
                } else {
                    textNode.textContent = `WhatsApp Consultation: ${SITE_CONFIG.phone}`;
                }
            }
        });

        // Update Form Action if non-placeholder & Attach Quick RFQ Submit Listener
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            if (SITE_CONFIG.formspreeEndpoint && !SITE_CONFIG.formspreeEndpoint.includes('placeholder')) {
                contactForm.action = SITE_CONFIG.formspreeEndpoint;
            }

            contactForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const formSuccess = document.getElementById('form-success');
                
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.style.opacity = '0.7';
                }

                const formData = new FormData(contactForm);
                const endpoint = contactForm.action;
                const isPlaceholder = !endpoint || endpoint.includes('placeholder');
                
                try {
                    if (!isPlaceholder) {
                        const response = await fetch(endpoint, {
                            method: 'POST',
                            body: formData,
                            headers: { 'Accept': 'application/json' }
                        });
                        if (response.ok) {
                            contactForm.reset();
                            if (formSuccess) formSuccess.style.display = 'block';
                            showToast(currentLang === 'cn' ? '询盘发送成功！我们将在 24 小时内联系您。' : 'Inquiry sent successfully! We will follow up within 24 hours.');
                            return;
                        }
                    }
                    
                    // Fallback state: if placeholder or endpoint offline, process & launch mailto prefilled link
                    const name = formData.get('name') || '';
                    const company = formData.get('company') || '';
                    const email = formData.get('email') || '';
                    const moq = formData.get('moq') || '';
                    const sample = formData.get('sample_request') ? 'Yes' : 'No';
                    const message = formData.get('message') || '';

                    const subject = encodeURIComponent(`[Quick RFQ] Peaffee OEM Inquiry - ${company || name}`);
                    const body = encodeURIComponent(
                        `Full Name: ${name}\nCompany: ${company}\nEmail: ${email}\nTarget MOQ: ${moq}\nSample Kit Requested: ${sample}\n\nRequirements:\n${message}`
                    );
                    
                    contactForm.reset();
                    if (formSuccess) formSuccess.style.display = 'block';
                    showToast(currentLang === 'cn' ? '询盘信息已捕获，正在准备客服邮件跟进...' : 'Inquiry captured! Launching direct concierge mail...');
                    
                    setTimeout(() => {
                        window.location.href = `mailto:${SITE_CONFIG.email}?subject=${subject}&body=${body}`;
                    }, 800);
                } catch (err) {
                    console.error('Form submission fallback:', err);
                    if (formSuccess) formSuccess.style.display = 'block';
                } finally {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.style.opacity = '1';
                    }
                }
            });
        }
    };

    // --- Translation Dictionary ---

    // --- Translation Dictionary ---
    const translations = {
        en: {
            // Nav & Header
            "nav-story": "Our Story",
            "nav-science": "R&D Science",
            "nav-ingredients": "Ingredients",
            "nav-customization": "Customization",
            "nav-packaging": "Packaging",
            "nav-rituals": "Rituals",
            "nav-quiz": "Formula Finder",
            "nav-quality": "Quality",
            "nav-connect": "Contact Us",
            "btn-inquire": "Inquire Now",
            
            // Slider / Hero
            "slider-subtitle": "Bespoke Skincare Solutions",
            "slider-cta-sample": "Order Sample",
            "slider-cta-consult": "Get Free Consultation",

            // Certifications Badges Bar
            "cert-bar-title": "Global Compliance & Quality Accreditations",
            "cert-iso9001-sub": "Quality Management System",
            "cert-iso14001-sub": "Environmental Assurance",
            "cert-gmpc-sub": "100k-Class Aseptic Facility",
            "cert-ecocert-sub": "100% Bio-activeness Standard",
            "cert-cruelty-sub": "Leaping Bunny Certified",
            "cert-sgs-sub": "Heavy Metal & Toxin Free",

            // Science Section
            "science-subtitle": "Formulation Chemistry",
            "science-title": "R&D Lab & Clinical Excellence",
            "science-desc": "Our 17-year R&D laboratory integrates gas chromatography mass spectrometry (GC-MS) with bio-fermentation tech to engineer barrier-compatible active skincare.",
            "science-1-title": "100,000-Class Aseptic Facility",
            "science-1-text": "Controlled positive pressure filtration systems guarantee zero microbial contamination during aseptic batch filling.",
            "science-2-title": "GC-MS Purity Profiling",
            "science-2-text": "Every batch of botanical oil and extract is fingerprinted for molecular purity and active potency prior to compounding.",
            "science-3-title": "Bio-compatible Lipid Mimicry",
            "science-3-text": "Formulas feature 3:1:1 lipid ratios (ceramides:cholesterol:fatty acids) engineered to integrate directly into human skin barriers.",
            "science-4-title": "3-Stage Accelerated Stability",
            "science-4-text": "Thermal shock (-10°C to 45°C), UV degradation, and centrifuge tests guarantee a 24-month unopened shelf life.",

            // Packaging Section
            "pack-subtitle": "Bespoke Aesthetics",
            "pack-title": "Luxury Packaging & Vessel Crafting",
            "pack-desc": "Elevate your skincare brand presence with custom glass bottles, eco-friendly pumps, UV-protective jars, and premium foil stamping.",
            "pack-1-title": "Luxury Glass Droppers",
            "pack-1-desc": "Heavy-base frosted glass bottles with custom metallic or soft-touch silicone bulbs for exact serum dosage.",
            "pack-2-title": "Airless Vacuum Pumps",
            "pack-2-desc": "Prevents formula oxidation and preserves 100% active botanical potency until the very last drop.",
            "pack-3-title": "Amber UV-Protect Jars",
            "pack-3-desc": "Filters harmful UV wavelengths to protect light-sensitive peptide and ceramide creams.",
            "pack-4-title": "Eco Aluminum Tubes",
            "pack-4-desc": "Minimalist, endlessly recyclable aluminum tubes ideal for cleansers, body milks, and masks.",
            "pack-5-title": "Sterile Monodose Ampoules",
            "pack-5-desc": "Hermetically sealed borosilicate glass ampoules to preserve ultra-fresh high-potency active serums.",
            "pack-6-title": "Refillable Eco Pods",
            "pack-6-desc": "Sustainable luxury compact containers with magnetic replaceable inner pods for eco-conscious rituals.",

            // Quiz Section
            "quiz-badge": "Interactive Selection",
            "quiz-title": "Bespoke Skincare Formulation Finder",
            "quiz-subtitle": "Answer 3 simple questions to discover your recommended botanical active formula & estimated MOQ parameters.",
            "quiz-lbl-1": "Skin Objective",
            "quiz-lbl-2": "Texture / Format",
            "quiz-lbl-3": "Target Volume",
            "quiz-q1-title": "What is your primary skincare target or brand focus?",
            "quiz-q1-o1": "Deep Hydration & Plumping",
            "quiz-q1-o2": "Barrier Repair & Soothing",
            "quiz-q1-o3": "Anti-Aging & Firming Peptide",
            "quiz-q1-o4": "Pore Refining & Clarifying",
            "quiz-q2-title": "Select your preferred product texture & format:",
            "quiz-q2-o1": "Concentrated Serum / Elixir",
            "quiz-q2-o2": "Velvet Cushion Cream",
            "quiz-q2-o3": "Botanical Cleanser / Mist",
            "quiz-q2-o4": "Overnight Mask / Clay Mask",
            "quiz-q3-title": "What is your planned first order quantity (MOQ)?",
            "quiz-q3-o1": "100 - 500 units (Standard Formula)",
            "quiz-q3-o2": "500 - 2,000 units (Custom Packaging)",
            "quiz-q3-o3": "2,000+ units (Bespoke OEM/ODM)",
            "quiz-result-label": "Recommended Formula Architecture",
            "quiz-result-actives": "Key Active Recommendation:",
            "quiz-btn-apply": "Apply to RFQ Inquiry",
            "quiz-btn-restart": "Retake Quiz",

            // Quick View Modal
            "modal-clinical": "Clinical Efficacy Test",
            "modal-disclaimer": "* Internal laboratory trial parameters. Formal SGS & COA reports supplied per custom order.",
            
            // Showcase tabs
            "tab-1": "Active Serum",
            "tab-2": "Luxury Cream",
            "tab-3": "Gentle Cleanser",
            
            // Stats Bar
            "stat-years": "Years Formulation R&D",
            "stat-formulas": "Proven Actives Formulas",
            "stat-countries": "Countries Exported",
            "stat-cert": "9001 & 14001 Certified",
            
            // Brand Story
            "story-subtitle": "The Science of Essence",
            "story-title": "Crafting botanical beauty with clinical precision.",
            "story-quote": "\"Your skin has its own natural intelligence. We formulate to honor and amplify it.\"",
            "story-text-1": "Founded in our state-of-the-art laboratory, Peaffee bridges the gap between pure organic botanicals and rigorous clinical research. Over the past 17 years, our experts have focused on high-efficacy, clean active complexes designed to nurture skin barriers.",
            "story-text-2": "Today, we are a trusted manufacturing partner for global skincare brands, offering high-fidelity OEM/ODM services, custom textures, and certified green formulations. Every drop of Peaffee is a testament to our dedication to purity, performance, and botanical science.",
            
            // Ingredients
            "ingr-subtitle": "Botanical Actives",
            "ingr-title": "Dermatology Meets Nature",
            "ingr-desc": "Our formulations are built around clean, bio-compatible key actives that deliver visible dermal improvements.",
            "ingr-1-title": "Hyaluronic Acid",
            "ingr-1-text": "Multi-molecular weights penetrate deep into dermal layers to bind moisture and plump cells instantly.",
            "ingr-2-title": "Organic Ceramides",
            "ingr-2-text": "Skin-identical lipids that reconstruct the lipid barrier, sealing in hydration and locking out irritants.",
            "ingr-3-title": "Bio-fermented Extracts",
            "ingr-3-text": "Probiotic enzymes and fair-trade green tea antioxidants that neutralize oxidative stressors.",

            // Customization Steps
            "cust-subtitle": "OEM & ODM Customization Services",
            "cust-title": "Your Bespoke Formulation Ritual",
            "cust-desc": "We leverage 17 years of skincare formulation research to provide professional custom manufacturing, packaging design, and ingredient curation tailored to your brand identity.",
            "step-badge": "Step",
            "step-1-title": "Submit Requirements",
            "step-1-text": "Share your skin types, target actives, packaging preferences, and desired budget criteria.",
            "step-2-title": "Formulation & Sampling",
            "step-2-text": "Our R&D team curates botanically active samples and mails them to your brand for trial.",
            "step-3-title": "Confirm Design & Specs",
            "step-3-text": "Finalize raw ingredients, texture viscosity, custom glass bottle specs, and branding labels.",
            "step-4-title": "Batch Production",
            "step-4-text": "Deposit clearance triggers automated aseptic filling, labelling, and high-performance sealing.",
            "step-5-title": "Rigorous Quality Testing",
            "step-5-text": "Every production batch undergoes 7 distinct stability and microbiological checks before release.",
            "step-6-title": "Global Express Logistics",
            "step-6-text": "Receive your premium inventory securely packaged and shipped directly with full custom clearance logs.",
            
            // Quality Section
            "quality-title-1": "Delivery & Eco Shipment",
            "quality-desc-1": "For standard formulations, we dispatch samples and batches within 5-10 business days. For customized OEM/ODM inventory, strict scheduling ensures shipping immediately upon final quality sign-off. We package only in protective, premium endlessly recyclable paper composites and luxury glass containers.",
            "quality-title-2": "Pure Ingredient Assurance",
            "quality-desc-2": "We operate clean, automated cosmetics manufacturing facilities with ISO9001 and ISO14001 certification. Every raw botanical extract is supplied by premium fair-trade farms and passes 7 distinct testing stages, guaranteeing toxin-free, cruelty-free, and dermatologically approved skincare products.",
            
            // Rituals / Classics
            "rituals-subtitle": "Rituals & Formulas",
            "rituals-title": "The Cult Classics",
            "prod-1-title": "The Active Serum",
            "prod-1-desc": "Plumps skin barrier and provides intense natural hydration.",
            "prod-2-title": "The Luxury Cream",
            "prod-2-desc": "Fortifies skin cells with bio-compatible organic ceramides.",
            "prod-3-title": "The Gentle Cleanser",
            "prod-3-desc": "Nourishes and purifies without removing natural oils.",
            "prod-4-title": "The Balancing Toner",
            "prod-4-desc": "Balancing and refining botanical mist to prime the skin.",
            "prod-5-title": "The Eye Cream",
            "prod-5-desc": "Targeted peptide therapy to reduce fine lines and puffiness.",
            "prod-6-title": "The Protecting SPF",
            "prod-6-desc": "Mineral UV defense with skin-nourishing antioxidants.",
            "prod-7-title": "The Body Lotion",
            "prod-7-desc": "Deeply restructuring body milk with shea butter and active ceramides.",
            "prod-8-title": "The Clay Mask",
            "prod-8-desc": "Kaolin clay and mineral actives to clarify pores and balance oil.",
            "prod-9-title": "The Botanical Essence",
            "prod-9-desc": "A prebiotic essence that restores softness and prepares skin for active care.",
            "prod-10-title": "The Peptide Lift",
            "prod-10-desc": "A targeted peptide treatment for the delicate eye and neck contour.",
            "prod-11-title": "The Body Elixir",
            "prod-11-desc": "A silky body serum with botanical oils, ceramides, and a quiet natural scent.",
            "prod-12-title": "The Overnight Veil",
            "prod-12-desc": "A cushioning overnight mask designed to replenish stressed, dry skin.",
            "filter-all": "All Formulas",
            "filter-hydrate": "Hydrate",
            "filter-repair": "Repair",
            "filter-protect": "Protect",
            "filter-body": "Body Rituals",
            "ritual-cta": "Inquire Formulation",

            // Testimonials
            "test-subtitle": "Trusted Partnerships",
            "test-title": "Endorsements from Leading Brands",
            "test-1-quote": "\"Partnering with Peaffee transformed our product line. Their R&D team brought active organic ingredients into a stable luxury texture that our customers absolutely adore.\"",
            "test-2-quote": "\"The OEM process was completely seamless. From formulation modifications to custom glass supply sourcing, their attention to details cut our time-to-market by half.\"",
            "test-3-quote": "\"Their strict quality testing and compliance documents made global export completely stress-free. Highly recommended for custom formulations.\"",

            // FAQ
            "faq-subtitle": "Common Inquiries",
            "faq-title": "Frequently Asked Questions",
            "faq-1-q": "What is your Minimum Order Quantity (MOQ)?",
            "faq-1-a": "For our signature standard formulations, we offer a flexible MOQ starting from just 100 units. Custom bespoke formulas requiring unique ingredient curation start at 1,000 units.",
            "faq-2-q": "Do you support international certifications?",
            "faq-2-a": "Yes. Our facilities run under strict ISO9001 and ISO14001 guidelines. We provide complete SGS, COA parameter analysis sheets, and MSDS safety documentation for customs clearance worldwide.",
            "faq-3-q": "What is the typical production timeline?",
            "faq-3-a": "Sample formulations are mixed and dispatched within 5-7 business days. Batch production ranges from 15 to 25 days depending on packaging custom specifications and ingredient volume.",
            "faq-4-q": "Can we provide our own packaging elements?",
            "faq-4-a": "Certainly. You may ship your pre-printed bottles, tubes, or boxes to our aseptic manufacturing facility, where our automated lines handle precise filling and sealing.",

            // CTA Banner
            "cta-banner-title": "Ready to Create Your Signature Skincare Line?",
            "cta-banner-desc": "Collaborate with our chemical scientists to design botanically advanced skincare formulations customized for your brand demographics.",
            "cta-banner-btn": "Get Started Now",
            
            // Connect section
            "connect-subtitle": "Skincare Consultation",
            "connect-title": "Begin Your Customized Skincare Journey",
            "connect-text": "Specify your skin objectives, brand goals, or sample requests. Our formulation experts will respond with tailored strategies and quotes within 24 hours.",
            "promise-1": "Dedicated aesthetician & formulator assigned to your request.",
            "promise-2": "Complete product parameter guides and certs delivered instantly.",
            "promise-3": "Free sample pack options for certified brands and wholesalers.",
            "whatsapp-connect": "WhatsApp Consultation: +1 (234) 567-890",
            
            // Form labels & Quick RFQ
            "form-label-name": "Full Name *",
            "form-label-company": "Company / Brand Name",
            "form-label-email": "Email Address *",
            "form-label-phone": "WhatsApp/Phone",
            "form-label-country": "Country or Area *",
            "form-label-moq": "Target Order Volume (MOQ)",
            "moq-opt-1": "100 - 500 units (Standard Formula)",
            "moq-opt-2": "500 - 2,000 units (Custom Packaging)",
            "moq-opt-3": "2,000+ units (Bespoke OEM/ODM Formulation)",
            "moq-opt-4": "Sample Testing First (< 100 units)",
            "form-label-sample-request": "Request a Free Botanical Sample Kit (Eligible for verified brands/distributors)",
            "form-label-interest": "Subject of Interest",
            "form-label-message": "Enter your needs, such as custom ingredients, volume, or timeline *",
            "form-btn-submit": "Send Quick RFQ Inquiry",
            "form-success-title": "Thank You",
            "form-success-text": "Your skincare requirements have been logged securely. A formulation expert will follow up within 24 hours.",
            
            // Dropdown options
            "interest-opt-1": "Bespoke Skincare Consultation",
            "interest-opt-2": "OEM/ODM Inquiry: The Active Serum",
            "interest-opt-3": "OEM/ODM Inquiry: The Luxury Cream",
            "interest-opt-4": "OEM/ODM Inquiry: The Gentle Cleanser",
            "interest-opt-6": "OEM/ODM Inquiry: The Balancing Toner",
            "interest-opt-7": "OEM/ODM Inquiry: The Eye Cream",
            "interest-opt-8": "OEM/ODM Inquiry: The Protecting SPF 50",
            "interest-opt-9": "OEM/ODM Inquiry: The Restructuring Body Lotion",
            "interest-opt-10": "OEM/ODM Inquiry: The Clarifying Clay Mask",
            "interest-opt-5": "Wholesale & Bulk Ingredients",
            
            // Footer
            "whatsapp-float-tooltip": "Chat on WhatsApp",
            "footer-tagline": "Formulated with 17 years of botanical science to honor your skin's intelligence."
        },
        cn: {
            // Nav & Header
            "nav-story": "品牌故事",
            "nav-science": "研发实验室",
            "nav-ingredients": "核心成分",
            "nav-customization": "定制服务",
            "nav-packaging": "奢华包材",
            "nav-rituals": "经典系列",
            "nav-quiz": "智能选型",
            "nav-quality": "卓越品质",
            "nav-connect": "联系我们",
            "btn-inquire": "立即咨询",

            // Certifications Badges Bar
            "cert-bar-title": "全球权威质量与合规认证资质墙",
            "cert-iso9001-sub": "ISO9001 质量体系认证",
            "cert-iso14001-sub": "ISO14001 环境管理体系",
            "cert-gmpc-sub": "10万级无菌 GMP 车间",
            "cert-ecocert-sub": "100% 绿色活性物标准",
            "cert-cruelty-sub": "零残忍国际认证",
            "cert-sgs-sub": "SGS 零重金属毒素检测",

            // Science Section
            "science-subtitle": "配方化学与科研实力",
            "science-title": "17年实验室科研与临床测试",
            "science-desc": "我们的中央研发实验室将气相色谱质谱联用仪（GC-MS）与生物发酵技术相结合，打造高亲肤性的屏障修护级护肤品。",
            "science-1-title": "10万级 GMPC 无菌车间",
            "science-1-text": "采用正压空气过滤与恒温恒湿控制系统，确保无菌罐装过程中全无微生物污染风险。",
            "science-2-title": "GC-MS 质谱分子级检测",
            "science-2-text": "每一批草本精油与发酵萃取物在投料前，均经过质谱检测，精准指纹印记纯度与活性成分含量。",
            "science-3-title": "仿生皮脂屏障契合技术",
            "science-3-text": "按照人体角质层 3:1:1 天然皮脂比例（神经酰胺:胆固醇:游离脂肪酸）配比，实现无缝融合与即刻修护。",
            "science-4-title": "3阶加速稳定性测试",
            "science-4-text": "经过 -10°C 至 45°C 冷热交替冷热冲击、UV 降解及高速离心测试，保障 24 个月未开封品质稳定。",

            // Packaging Section
            "pack-subtitle": "品牌奢华美学",
            "pack-title": "奢华容器与瓶器定制工艺展厅",
            "pack-desc": "精选高品质玻璃瓶、无气压泵、防紫外线避光罐及高精烫金工艺，为您的品牌建立高级视觉识别度。",
            "pack-1-title": "奢华滴管玻璃瓶",
            "pack-1-desc": "厚底磨砂玻璃瓶身，配以金属压泵或软触硅胶滴头，精准控制精华液定量给药。",
            "pack-2-title": "真空无气压泵瓶",
            "pack-2-desc": "阻绝空气接触与氧化反应，锁住最后一滴植物活性成分的极致效能。",
            "pack-3-title": "避光琥珀玻璃罐",
            "pack-3-desc": "阻隔有害紫外线波段，专为光敏感多肽与神经酰胺修护面霜设计。",
            "pack-4-title": "环保软质铝管",
            "pack-4-desc": "极简工业风、可无限回收的铝制软管，适合洁面乳、身体乳及涂抹式泥膜。",
            "pack-5-title": "无菌单剂安瓶",
            "pack-5-desc": "高硼硅玻璃熔封无菌安瓶，100% 锁扣微生态活性与高浓度极润原液。",
            "pack-6-title": "环保可替换芯容器",
            "pack-6-desc": "可持续奢华磁吸内胆容器，践行可持续环保护肤美学理念。",

            // Quiz Section
            "quiz-badge": "智能交互选型",
            "quiz-title": "专属护肤品配方智能匹配引擎",
            "quiz-subtitle": "仅需回答 3 个简单问题，系统将自动匹配最适合您品牌的活性成分架构与预计起订量方案。",
            "quiz-lbl-1": "护肤目标",
            "quiz-lbl-2": "质地形态",
            "quiz-lbl-3": "目标起订量",
            "quiz-q1-title": "您品牌或产品的核心诉求是什么？",
            "quiz-q1-o1": "深层补水与充盈锁水",
            "quiz-q1-o2": "屏障修护与退红舒缓",
            "quiz-q1-o3": "抗衰紧致与多肽抚纹",
            "quiz-q1-o4": "毛孔细致与油脂净化",
            "quiz-q2-title": "您偏好的产品质地与品类形态：",
            "quiz-q2-o1": "高浓缩精华液 / 精华油",
            "quiz-q2-o2": "丝绒修护面霜",
            "quiz-q2-o3": "植萃洁面乳 / 喷雾",
            "quiz-q2-o4": "夜间睡眠面膜 / 洁净泥膜",
            "quiz-q3-title": "您计划的首批订货量 (MOQ) 预算：",
            "quiz-q3-o1": "100 - 500 瓶 (成熟标准配方)",
            "quiz-q3-o2": "500 - 2,000 瓶 (专属包材定制)",
            "quiz-q3-o3": "2,000+ 瓶 (高端 OEM/ODM 深度定制)",
            "quiz-result-label": "系统智能推荐配方架构",
            "quiz-result-actives": "推荐核心活性物组合：",
            "quiz-btn-apply": "一键应用至询盘表单",
            "quiz-btn-restart": "重新测试",

            // Quick View Modal
            "modal-clinical": "临床功效测试数据",
            "modal-disclaimer": "* 结果基于实验室内部测试参数。定制批次可提供正式第三方 SGS & COA 检测报告。",
            
            "prod-9-title": "植萃精华水",
            "prod-9-desc": "富含益生元的精华水，柔润肌肤并为后续护理做好准备。",
            "prod-10-title": "多肽紧致护理",
            "prod-10-desc": "针对眼周与颈部的精细多肽护理，改善细纹与松弛。",
            "prod-11-title": "身体精华乳",
            "prod-11-desc": "融合植物油脂与神经酰胺的丝滑身体精华，温和滋养肌肤。",
            "prod-12-title": "夜间修护面膜",
            "prod-12-desc": "包裹干燥疲惫肌肤的夜间修护面膜，补充水分与屏障营养。",
            "filter-all": "全部配方",
            "filter-hydrate": "补水",
            "filter-repair": "修护",
            "filter-protect": "防护",
            "filter-body": "身体护理",
            "nav-ingredients": "核心成分",
            "nav-rituals": "经典系列",
            "nav-customization": "定制服务",
            "nav-quality": "卓越品质",
            "nav-connect": "联系我们",
            "btn-inquire": "立即咨询",
            
            // Slider / Hero
            "slider-subtitle": "专属护肤品定制方案",
            "slider-cta-sample": "申领样品",
            "slider-cta-consult": "获取免费咨询",
            
            // Showcase tabs
            "tab-1": "活力精华液",
            "tab-2": "奢华面霜",
            "tab-3": "温和洁面乳",
            
            // Stats Bar
            "stat-years": "载护肤品研发生产经验",
            "stat-formulas": "项临床验证活性配方储备",
            "stat-countries": "个全球国家与地区出口",
            "stat-cert": "与 14001 国际双重认证",
            
            // Brand Story
            "story-subtitle": "关于 Peaffee",
            "story-title": "用科学严谨之光，凝聚自然植萃原力。",
            "story-quote": "“肌肤拥有其独特的原生智慧。我们潜心配比，只为敬畏并唤醒这一本源。”",
            "story-text-1": "创立于我们的高标准实验室，Peaffee 致力于在纯净天然的草本植物和严苛的临床学测试之间架起一座桥梁。在过去的 17 年里，我们的配方研发专家心无旁骛，专注于开发能够深层修护肌肤屏障的高活性、纯净护肤复合物。",
            "story-text-2": "今天，我们已是众多全球知名护肤品牌的定制与生产合作伙伴。提供极具竞争力的 OEM/ODM 代工、定制质质地开发以及权威绿色生态配方认证。每一滴 Peaffee 产品，都是我们对纯净品质、卓越功效和植物科学热忱的见证。",
            
            // Ingredients
            "ingr-subtitle": "活性黄金成分",
            "ingr-title": "皮肤学科技与自然的交融",
            "ingr-desc": "我们的配方围绕高兼容、纯净的活性物展开，确保为肌肤带来肉眼可见的改善效果。",
            "ingr-1-title": "多重玻尿酸",
            "ingr-1-text": "复配大中小多种分子量，层层渗透至肌肤表层与深层，快速锁水并充盈表皮细胞。",
            "ingr-2-title": "仿生神经酰胺",
            "ingr-2-text": "补充肌肤同源脂质，主动修护受损屏障，牢牢锁住水分并抵御外界有害刺激物。",
            "ingr-3-title": "生物发酵滤液",
            "ingr-3-text": "富含活性微生态益生发酵产物与公平贸易绿茶茶多酚，中和自由基，延缓肌肤老化。",

            // Customization Steps
            "cust-subtitle": "OEM & ODM 贴牌定制服务",
            "cust-title": "您的专属配方定制仪式",
            "cust-desc": "我们依托 17 年的护肤品研发与生产经验，为您提供品牌定制、配方调制、包材开发及生产灌装一站式专业服务。",
            "step-badge": "步骤",
            "step-1-title": "提交定制需求",
            "step-1-text": "告知我们您的目标肤质、期望核心活性成分、包装视觉风格及预期成本预算。",
            "step-2-title": "实验室打样",
            "step-2-text": "我们的 R&D 研发中心为您精心调制活性样品，并快递寄送至贵司进行质地和功效测试。",
            "step-3-title": "确认设计规格",
            "step-3-text": "锁定核心原料成分配比、料体质地黏度、玻璃包材规格以及瓶身丝印标识设计。",
            "step-4-title": "批量上线生产",
            "step-4-text": "首期生产预付款到账即触发全自动无菌车间灌装、贴标及高标准封盖操作。",
            "step-5-title": "严格成品品质控制",
            "step-5-text": "每一批次出厂成品均须通过实验室理化指标、生物稳定测试等 7 道质检大关。",
            "step-6-title": "全球快速物流交付",
            "step-6-text": "高标准安全包箱装运，支持海空干线多式联运直接送达并协助处理通关文件。",
            
            // Quality Section
            "quality-title-1": "交期与环保包材保障",
            "quality-desc-1": "常规标准料体配方最快可于 5-10 个工作日内安排发货；个性化定制 OEM 订单严格按照合同排产并极速出货。我们始终选用环保可回收纸质外盒与厚壁避光奢华玻璃器皿，为您提供高档次且环境友好的双重包裹保护。",
            "quality-title-2": "纯净原料与工艺保障",
            "quality-desc-2": "我们运营配有十万级净化标准的无尘化妆品生产基地，通过 ISO9001 质量与 ISO14001 环境管理体系双重认证。所有天然植萃活性物皆直接源于高标准绿色农场，且投产前必须经由 7 大严苛指标复检，确保产品温和高效、零残忍（Cruelty-free）。",
            
            // Rituals / Classics
            "rituals-subtitle": "产品与配方仪式",
            "rituals-title": "明星经典单品",
            "prod-1-title": "活力精华液",
            "prod-1-desc": "深层补水，充盈受损皮肤屏障，焕发水润光泽。",
            "prod-2-title": "奢华面霜",
            "prod-2-desc": "注入仿生神经酰胺与天然有机油脂，深层滋养修复。",
            "prod-3-title": "温和洁面乳",
            "prod-3-desc": "氨基酸温和洁面，溶解多余油脂污垢且不紧绷干涩。",
            "prod-4-title": "平衡爽肤水",
            "prod-4-desc": "细致平衡的草本爽肤喷雾，帮助肌肤进入最佳吸收状态。",
            "prod-5-title": "修护眼霜",
            "prod-5-desc": "精准多肽修护，显著淡化细纹并改善眼部浮肿。",
            "prod-6-title": "清透防晒乳",
            "prod-6-desc": "物理防晒阻隔紫外线，协同抗氧养肤因子抵御老化。",
            "prod-7-title": "倍润身体乳",
            "prod-7-desc": "注入乳木果油与活性神经酰胺，深层重建全身屏障。",
            "prod-8-title": "矿物洁净泥膜",
            "prod-8-desc": "高岭土协同植物矿物成分，深层净化毛孔平衡油脂分泌。",
            "ritual-cta": "咨询该配方",

            // Testimonials
            "test-subtitle": "客户信任背书",
            "test-title": "全球卓越品牌之声",
            "test-1-quote": "“与妙肌的合作彻底重塑了我们的产品线。他们的 R&D 团队将顶级植物活性物融入极其稳定、高级的肤感质地中，我们的高端用户对此赞不绝口。”",
            "test-2-quote": "“代工定制的流程异常丝滑高效。从配方调制到提供定制玻璃包装供应链，他们对于每一个细节的严格掌控，让我们的产品上市时间直接缩短了一半。”",
            "test-3-quote": "“他们极度严苛的成品质量控制以及完备的国际出口合规资质，让我们的全球分销毫无后顾之忧。是高端定制配方的首选研发商。”",

            // FAQ
            "faq-subtitle": "解答您的疑虑",
            "faq-title": "常见问题解答",
            "faq-1-q": "你们的最小起订量（MOQ）是多少？",
            "faq-1-a": "对于我们成熟的现成标准配方，起订量非常灵活，仅需 100 瓶起。如果您需要根据独特品牌需求进行专属配方定制开发，起订量一般为 1,000 瓶起。",
            "faq-2-q": "你们支持哪些国际资质认证？",
            "faq-2-a": "我们的生产车间严格遵循 ISO9001 与 ISO14001 国际双重认证标准。我们可以提供全套产品质检报告（COA）、安全技术说明书（MSDS）及 SGS 检测资质，全力支持全球各港口通关。",
            "faq-3-q": "常规的样品和批量交期是多久？",
            "faq-3-a": "实验室样品开发及打样一般在 5-7 个工作日内寄出。大货量产周期视包材选定及订货量而定，常规在确认样品及包材设计后 15-25 个工作日内出货。",
            "faq-4-q": "我们能提供自己采购的包装瓶盒吗？",
            "faq-4-a": "完全支持。您可以直接将您采购的玻璃瓶、软管或外盒邮寄至我们的无菌灌装基地，我们的自动化生产流水线将完成精准灌装、贴标、喷码与封膜包装。",

            // CTA Banner
            "cta-banner-title": "准备好打造属于您的专属护肤品线了吗？",
            "cta-banner-desc": "与我们的皮肤学配方科学家面对面，为您的目标客群定制研发高活性、符合国际市场趋势的高端植物护肤品。",
            "cta-banner-btn": "立即开启定制咨询",
            
            // Connect section
            "connect-subtitle": "护肤方案咨询",
            "connect-title": "开启您的专属护肤定制之旅",
            "connect-text": "详细列出您的皮肤诉求、品牌愿景或打样需求。我们的配方开发工程师将在 24 小时内向您提供针对性报价与产品参数表。",
            "promise-1": "指派专业皮肤学顾问与资深配方师全程对接跟进您的项目。",
            "promise-2": "即刻提供相关成分的详细规格参数报告及行业质检资质认证书。",
            "promise-3": "针对优质采购客户及品牌批发商提供免费的样品测试包选项。",
            "whatsapp-connect": "WhatsApp 业务咨询: +1 (234) 567-890",
            
            // Form labels & Quick RFQ
            "form-label-name": "您的全名 *",
            "form-label-company": "公司 / 品牌名称",
            "form-label-email": "电子邮箱 *",
            "form-label-phone": "WhatsApp/联系电话",
            "form-label-country": "国家或地区 *",
            "form-label-moq": "预估采购量 (MOQ)",
            "moq-opt-1": "100 - 500 瓶 (现成标准配方)",
            "moq-opt-2": "500 - 2,000 瓶 (定制包装包材)",
            "moq-opt-3": "2,000+ 瓶 (专属 OEM/ODM 配方研制)",
            "moq-opt-4": "先进行打样测试 (< 100 瓶)",
            "form-label-sample-request": "申请免费植物护肤样品包（符合资质的品牌商/分销商可用）",
            "form-label-interest": "咨询主题",
            "form-label-message": "请输入您的需求，如定制成分、需求数量或交期等 *",
            "form-btn-submit": "发送快速询价 (Quick RFQ)",
            "form-success-title": "发送成功",
            "form-success-text": "您的护肤定制诉求已安全记录。配方开发经理将在 24 小时内与您取得联系。",
            
            // Dropdown options
            "interest-opt-1": "专属定制护肤咨询",
            "interest-opt-2": "OEM/ODM 咨询: 活力精华液",
            "interest-opt-3": "OEM/ODM 咨询: 奢华面霜",
            "interest-opt-4": "OEM/ODM 咨询: 温和洁面乳",
            "interest-opt-6": "OEM/ODM 咨询: 平衡爽肤水",
            "interest-opt-7": "OEM/ODM 咨询: 修护眼霜",
            "interest-opt-8": "OEM/ODM 咨询: 清透防晒乳",
            "interest-opt-9": "OEM/ODM 咨询: 倍润身体乳",
            "interest-opt-10": "OEM/ODM 咨询: 矿物洁净泥膜",
            "interest-opt-5": "大宗原料采购与批发",
            
            // Footer
            "whatsapp-float-tooltip": "在线咨询",
            "footer-tagline": "融合 17 年植物护肤科技，探寻自然美肌本源之力。"
        }
    };

    let currentLang = 'en';

    // Set Language Switcher Active Class & Text
    const switchLanguage = (lang) => {
        currentLang = lang;
        document.documentElement.setAttribute('lang', lang === 'cn' ? 'zh-CN' : 'en');
        document.getElementById('lang-current').textContent = lang.toUpperCase();
        
        // Toggle Active Class in Dropdown List
        document.querySelectorAll('.lang-opt').forEach(opt => {
            if (opt.getAttribute('data-lang') === lang) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }
        });

        // Translate elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    // Note: Handle placeholders dynamically if required, but label translation is cleaner
                } else {
                    el.textContent = translations[lang][key];
                }
            }
        });

        // Update Option Values in Selector
        const selectElement = document.getElementById('interest');
        if (selectElement) {
            const options = selectElement.options;
            for (let i = 0; i < options.length; i++) {
                const opt = options[i];
                const key = opt.getAttribute('data-i18n');
                if (key && translations[lang][key]) {
                    opt.text = translations[lang][key];
                }
            }
        }

        // Re-sync Showcase slider descriptions (handles dynamic elements without data-i18n)
        updateShowcaseData(lang);
        initSiteConfig();
    };

    // --- Dynamic Slider Showcase Data By Language ---
    let showcaseProducts = [];
    const updateShowcaseData = (lang) => {
        if (lang === 'cn') {
            showcaseProducts = [
                {
                    title: "活力精华液",
                    pill: "多重分子玻尿酸 + 绿茶抗氧",
                    desc: "高浓度植萃精华，富含多重玻尿酸与绿茶抗氧化因子，强力补水，令肌肤莹润充盈。",
                    img: SHOWCASE_IMAGES.hero,
                    target: "The Active Serum",
                    auraGlow: "radial-gradient(circle, rgba(184, 156, 126, 0.28) 0%, rgba(184, 156, 126, 0) 70%)"
                },
                {
                    title: "奢华面霜",
                    pill: "仿生神经酰胺 + 天然植物油",
                    desc: "如丝绒般细腻润泽的护肤面霜，富含神经酰胺和天然果脂，强化皮脂屏障，牢牢锁住水分。",
                    img: SHOWCASE_IMAGES.cream,
                    target: "The Luxury Cream",
                    auraGlow: "radial-gradient(circle, rgba(214, 185, 142, 0.32) 0%, rgba(214, 185, 142, 0) 70%)"
                },
                {
                    title: "温和洁面乳",
                    pill: "氨基酸温和洁面 + 屏障守护",
                    desc: "极致温和且不起泡的洁面乳霜，安全洗去日常彩妆、防晒及脏污，同时细心守护皮脂层。",
                    img: SHOWCASE_IMAGES.cleanser,
                    target: "The Gentle Cleanser",
                    auraGlow: "radial-gradient(circle, rgba(155, 178, 168, 0.3) 0%, rgba(155, 178, 168, 0) 70%)"
                }
            ];
        } else {
            showcaseProducts = [
                {
                    title: "The Active Serum",
                    pill: "Multi-Molecular Hyaluronic Acid",
                    desc: "A highly concentrated botanical elixir infused with multi-molecular hyaluronic acid and green tea antioxidants to deeply hydrate and plump the skin.",
                    img: SHOWCASE_IMAGES.hero,
                    target: "The Active Serum",
                    auraGlow: "radial-gradient(circle, rgba(184, 156, 126, 0.28) 0%, rgba(184, 156, 126, 0) 70%)"
                },
                {
                    title: "The Luxury Cream",
                    pill: "Organic Ceramide Lipid Complex",
                    desc: "A decadent, whipped facial cream featuring ceramides and botanical oils that mimic the skin’s natural lipid barrier to lock in intensive moisture.",
                    img: SHOWCASE_IMAGES.cream,
                    target: "The Luxury Cream",
                    auraGlow: "radial-gradient(circle, rgba(214, 185, 142, 0.32) 0%, rgba(214, 185, 142, 0) 70%)"
                },
                {
                    title: "The Gentle Cleanser",
                    pill: "Ultra-Gentle Amino Acid Care",
                    desc: "An ultra-gentle, non-foaming cream cleanser that lifts away makeup, SPF, and impurities while respecting the delicate moisture barrier of your skin.",
                    img: SHOWCASE_IMAGES.cleanser,
                    target: "The Gentle Cleanser",
                    auraGlow: "radial-gradient(circle, rgba(155, 178, 168, 0.3) 0%, rgba(155, 178, 168, 0) 70%)"
                }
            ];
        }

        const activeTab = document.querySelector('.slider-tab.active');
        const activeIndex = activeTab ? parseInt(activeTab.getAttribute('data-index')) : 0;
        const currentData = showcaseProducts[activeIndex];
        if (!currentData) return;

        // Quick crossfade for language switch (no stagger, just clean swap)
        const titleEl = document.getElementById('slider-title-display');
        const descEl = document.getElementById('slider-desc-display');
        const imageEl = document.getElementById('slider-image-display');
        const ctaBtn = document.getElementById('slider-cta-btn');
        const pillTextEl = document.getElementById('slider-pill-text');
        const auraEl = document.getElementById('slider-aura');

        // Fade out
        [titleEl, descEl, pillTextEl].forEach(el => {
            if (el) { el.style.opacity = '0'; el.style.transform = 'translateY(8px)'; }
        });

        setTimeout(() => {
            if (titleEl) titleEl.textContent = currentData.title;
            if (descEl) descEl.textContent = currentData.desc;
            if (pillTextEl && currentData.pill) pillTextEl.textContent = currentData.pill;
            if (auraEl && currentData.auraGlow) auraEl.style.background = currentData.auraGlow;
            if (imageEl) {
                imageEl.src = currentData.img;
                imageEl.alt = `MuseSkin ${currentData.title}`;
            }
            if (ctaBtn) ctaBtn.setAttribute('data-product', currentData.target);

            // Fade in
            [titleEl, descEl, pillTextEl].forEach((el, i) => {
                if (el) {
                    setTimeout(() => {
                        el.style.opacity = '1';
                        el.style.transform = 'translateY(0)';
                    }, i * 60);
                }
            });
        }, 250);
    };

    // Bind Click Events to Language Selectors
    document.querySelectorAll('.lang-opt').forEach(opt => {
        opt.addEventListener('click', (e) => {
            e.preventDefault();
            const selectedLang = opt.getAttribute('data-lang');
            switchLanguage(selectedLang);
        });
    });

    // --- 3. Showcase Interactive Slider Logic ---
    const sliderContainer = document.querySelector('.slider-container');
    const sliderTabs = document.querySelectorAll('.slider-tab');
    const sliderTitle = document.getElementById('slider-title-display');
    const sliderDesc = document.getElementById('slider-desc-display');
    const sliderImage = document.getElementById('slider-image-display');
    const sliderCtaBtn = document.getElementById('slider-cta-btn');
    const sliderPillDisplay = document.getElementById('slider-pill-display');
    const sliderPillText = document.getElementById('slider-pill-text');
    const sliderAura = document.getElementById('slider-aura');
    const sliderPrevBtn = document.getElementById('slider-prev-btn');
    const sliderNextBtn = document.getElementById('slider-next-btn');
    const sliderCurrentIndex = document.getElementById('slider-current-index');
    const sliderProgressBar = document.getElementById('slider-progress-bar');

    let currentSlideIndex = 0;
    let autoSlideTimer = null;
    let isSliderHovered = false;

    const resetProgressBar = (index = currentSlideIndex) => {
        if (sliderProgressBar) {
            sliderProgressBar.classList.remove('running');
            void sliderProgressBar.offsetWidth;
            sliderProgressBar.classList.add('running');
        }

        const tabFills = document.querySelectorAll('.tab-progress-fill');
        tabFills.forEach((fill, i) => {
            fill.classList.remove('running');
            void fill.offsetWidth;
            if (i === index) {
                fill.classList.add('running');
            }
        });
    };

    // Staggered fade-out/fade-in for luxury text transitions
    const slideTextEls = () => {
        const pill = document.querySelector('.slider-tag-pill');
        const sub = document.querySelector('.slider-subtitle');
        const title = document.getElementById('slider-title-display');
        const desc = document.getElementById('slider-desc-display');
        const actions = document.querySelector('.slider-actions');
        return [pill, sub, title, desc, actions].filter(Boolean);
    };

    const switchSlide = (index) => {
        if (index === currentSlideIndex || index < 0 || index >= showcaseProducts.length) return;

        const textEls = slideTextEls();
        const imageEl = document.getElementById('slider-image-display');
        const auraEl = document.getElementById('slider-aura');

        // Phase 1: Staggered fade-out (each element 40ms apart)
        textEls.forEach((el, i) => {
            setTimeout(() => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(14px)';
            }, i * 40);
        });
        if (imageEl) {
            imageEl.style.opacity = '0';
            imageEl.style.transform = 'scale(0.94) translateY(8px)';
        }

        // Phase 2: Swap content mid-transition
        const swapDelay = 320;
        setTimeout(() => {
            const data = showcaseProducts[index];
            if (data) {
                const titleEl = document.getElementById('slider-title-display');
                const descEl = document.getElementById('slider-desc-display');
                const pillTextEl = document.getElementById('slider-pill-text');
                const ctaBtn = document.getElementById('slider-cta-btn');

                if (titleEl) titleEl.textContent = data.title;
                if (descEl) descEl.textContent = data.desc;
                if (pillTextEl && data.pill) pillTextEl.textContent = data.pill;
                if (auraEl && data.auraGlow) auraEl.style.background = data.auraGlow;
                if (imageEl) {
                    imageEl.src = data.img;
                    imageEl.alt = `MuseSkin ${data.title}`;
                }
                if (ctaBtn) ctaBtn.setAttribute('data-product', data.target);
            }

            // Update tabs
            sliderTabs.forEach((tab, i) => {
                tab.classList.toggle('active', i === index);
            });

            // Phase 3: Staggered fade-in (each element 50ms apart, offset from bottom)
            const freshEls = slideTextEls();
            freshEls.forEach((el, i) => {
                setTimeout(() => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, i * 50);
            });
            if (imageEl) {
                setTimeout(() => {
                    imageEl.style.opacity = '1';
                    imageEl.style.transform = 'scale(1) translateY(0)';
                }, 80);
            }

            currentSlideIndex = index;
            if (sliderCurrentIndex) sliderCurrentIndex.textContent = String(index + 1).padStart(2, '0');
            resetProgressBar(index);
        }, swapDelay);
    };

    const startAutoSlide = () => {
        stopAutoSlide();
        autoSlideTimer = setInterval(() => {
            if (!isSliderHovered) {
                const nextIndex = (currentSlideIndex + 1) % showcaseProducts.length;
                switchSlide(nextIndex);
            }
        }, 5000);
    };

    const stopAutoSlide = () => {
        if (autoSlideTimer) {
            clearInterval(autoSlideTimer);
            autoSlideTimer = null;
        }
    };

    const handleUserInteraction = (action) => {
        stopAutoSlide();
        action();
        startAutoSlide();
    };

    const goToNextSlide = () => {
        handleUserInteraction(() => {
            const nextIndex = (currentSlideIndex + 1) % showcaseProducts.length;
            switchSlide(nextIndex);
        });
    };

    const goToPrevSlide = () => {
        handleUserInteraction(() => {
            const prevIndex = (currentSlideIndex - 1 + showcaseProducts.length) % showcaseProducts.length;
            switchSlide(prevIndex);
        });
    };

    sliderTabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            handleUserInteraction(() => {
                switchSlide(index);
            });
        });
    });

    if (sliderPrevBtn) sliderPrevBtn.addEventListener('click', goToPrevSlide);
    if (sliderNextBtn) sliderNextBtn.addEventListener('click', goToNextSlide);

    // Pause auto-slide when hovering over tabs, controls, or image area
    const pauseTargets = document.querySelectorAll('.slider-tabs, .slider-controls, .slide-image-side, .slide-text-side');
    pauseTargets.forEach(el => {
        el.addEventListener('mouseenter', () => { isSliderHovered = true; });
        el.addEventListener('mouseleave', () => { isSliderHovered = false; });
    });

    // Initialize Showcase slider data for the first time (sets currentLang to 'en')
    switchLanguage('en');
    startAutoSlide();
    resetProgressBar(0);

    // --- 2. Mobile Drawer Navigation ---
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mobileDrawer = document.querySelector('.mobile-drawer');
    const mobileLinks = document.querySelectorAll('.mobile-link, .btn-mobile-cta');

    const toggleDrawer = () => {
        mobileNavToggle.classList.toggle('active');
        mobileDrawer.classList.toggle('active');
        document.body.style.overflow = mobileDrawer.classList.contains('active') ? 'hidden' : '';
    };

    mobileNavToggle.addEventListener('click', toggleDrawer);

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileDrawer.classList.contains('active')) {
                toggleDrawer();
            }
        });
    });

    // --- 3b. Page Loading Overlay ---
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loadingOverlay.classList.add('hidden');
            }, 400);
        });
        // Fallback: hide after 3s even if load event fires late
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
        }, 3000);
    }

    // --- 3c. Nav Scroll Highlight ---
    const navLinks = document.querySelectorAll('.header .nav-link');
    const navSections = [];
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            const section = document.querySelector(href);
            if (section) {
                navSections.push({ link, section });
            }
        }
    });

    if (navSections.length > 0 && 'IntersectionObserver' in window) {
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(l => l.classList.remove('active'));
                    const activeLink = document.querySelector(`.header .nav-link[href="#${id}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-80px 0px -50% 0px'
        });

        navSections.forEach(({ section }) => navObserver.observe(section));
    }

    // --- 3d. Stats Counter Animation ---
    const statNumbers = document.querySelectorAll('.stats-bar-section .stat-number');
    let statsAnimated = false;

    const animateCounter = (el, target, suffix = '') => {
        const duration = 2000;
        const startTime = performance.now();

        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);
            el.textContent = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target + suffix;
            }
        };

        requestAnimationFrame(step);
    };

    if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
        const statsSection = document.querySelector('.stats-bar-section');
        if (statsSection) {
            const statsObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !statsAnimated) {
                        statsAnimated = true;
                        statNumbers.forEach(el => {
                            const text = el.textContent.trim();
                            const match = text.match(/^(\d+)(\+?)$/);
                            if (match) {
                                const target = parseInt(match[1], 10);
                                const suffix = match[2] || '';
                                animateCounter(el, target, suffix);
                            }
                            // "ISO" text stays as-is
                        });
                        statsObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });

            statsObserver.observe(statsSection);
        }
    }

    // --- 4. Editorial Scroll Reveal Animation ---
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    
    // Hide elements dynamically if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
        revealElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
        });
    }

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.classList.add('revealed');
                }, 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px -50px 0px'
    });

    if ('IntersectionObserver' in window) {
        revealElements.forEach(el => revealObserver.observe(el));
    }

    // --- 5. Product Inquiry Dynamic Selection & Scroll ---
    const productCtas = document.querySelectorAll('.ritual-cta-btn, #slider-cta-btn');
    const interestSelect = document.getElementById('interest');
    const connectSection = document.getElementById('connect');

    productCtas.forEach(cta => {
        cta.addEventListener('click', (e) => {
            e.preventDefault();
            const product = cta.getAttribute('data-product') || 'Bespoke Skincare Consultation';
            if (interestSelect) {
                interestSelect.value = product;
            }
            // Show toast feedback
            const toastMsg = currentLang === 'cn'
                ? `已为您选中「${product}」，请填写下方表单`
                : `Selected "${product}" — please complete the form below`;
            showToast(toastMsg);
            if (connectSection) {
                connectSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // --- 6. Contact Form Submission Handling ---
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');

    // --- 6b. Real-time Form Validation ---
    const validateField = (input) => {
        const value = input.value.trim();
        let isValid = true;
        let errorMsg = '';

        if (input.required && !value) {
            isValid = false;
            errorMsg = currentLang === 'cn' ? '此字段为必填项' : 'This field is required';
        } else if (input.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMsg = currentLang === 'cn' ? '请输入有效的邮箱地址' : 'Please enter a valid email address';
            }
        }

        // Find or create error message element
        let errorEl = input.parentElement.querySelector('.form-error-msg');
        if (!errorEl && !isValid) {
            errorEl = document.createElement('span');
            errorEl.className = 'form-error-msg';
            input.parentElement.appendChild(errorEl);
        }

        if (!isValid) {
            input.classList.add('is-invalid');
            input.classList.remove('is-valid');
            if (errorEl) {
                errorEl.textContent = errorMsg;
                errorEl.classList.add('visible');
            }
        } else if (value) {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
            if (errorEl) {
                errorEl.classList.remove('visible');
            }
        } else {
            input.classList.remove('is-invalid', 'is-valid');
            if (errorEl) {
                errorEl.classList.remove('visible');
            }
        }

        return isValid;
    };

    if (contactForm) {
        // Add blur validation to all inputs
        const formInputs = contactForm.querySelectorAll('.form-input, .form-textarea, .form-select');
        formInputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('is-invalid')) {
                    validateField(input);
                }
            });
        });

        contactForm.addEventListener('submit', async (e) => {
            const isPlaceholder = contactForm.getAttribute('action').includes('placeholder');

            // Validate all required fields before submission
            let allValid = true;
            formInputs.forEach(input => {
                if (!validateField(input)) {
                    allValid = false;
                }
            });

            if (!allValid) {
                e.preventDefault();
                // Scroll to first invalid field
                const firstInvalid = contactForm.querySelector('.is-invalid');
                if (firstInvalid) {
                    firstInvalid.focus();
                }
                return;
            }

            if (isPlaceholder) {
                e.preventDefault();

                const submitBtn = contactForm.querySelector('.btn-submit');
                const submitText = submitBtn.querySelector('span');
                const originalText = submitText.textContent;

                submitText.textContent = (currentLang === 'cn') ? '正在提交咨询...' : 'Sending Inquiry...';
                submitBtn.style.opacity = '0.7';
                submitBtn.style.pointerEvents = 'none';

                setTimeout(() => {
                    contactForm.style.display = 'none';
                    formSuccess.style.display = 'block';
                    formSuccess.style.opacity = '0';

                    // Add post-submit guidance
                    if (!formSuccess.querySelector('.success-guidance')) {
                        const guidance = document.createElement('div');
                        guidance.className = 'success-guidance';
                        guidance.innerHTML = `
                            <p class="success-guidance-title">${currentLang === 'cn' ? '更快速的联系方式' : 'Even faster ways to reach us'}</p>
                            <a href="${SITE_CONFIG.whatsappLink}" target="_blank" rel="noopener noreferrer" class="success-guidance-btn">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                                </svg>
                                ${currentLang === 'cn' ? 'WhatsApp 直接咨询' : 'Chat on WhatsApp'}
                            </a>
                        `;
                        formSuccess.appendChild(guidance);
                    }

                    setTimeout(() => {
                        formSuccess.style.transition = 'opacity 0.6s ease';
                        formSuccess.style.opacity = '1';
                    }, 50);

                    submitText.textContent = originalText;
                    submitBtn.style.opacity = '';
                    submitBtn.style.pointerEvents = '';
                    contactForm.reset();
                    // Clear validation states
                    formInputs.forEach(input => {
                        input.classList.remove('is-valid', 'is-invalid');
                    });
                }, 1200);
            }
        });
    }

    // --- 7. FAQ Accordion Interactive Logic ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const trigger = item.querySelector('.faq-trigger');
        const wrapper = item.querySelector('.faq-answer-wrapper');
        if (trigger && wrapper) {
            trigger.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all other open items first to make it a clean single-open accordion
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                        otherItem.querySelector('.faq-answer-wrapper').style.maxHeight = '0px';
                    }
                });

                if (isActive) {
                    item.classList.remove('active');
                    wrapper.style.maxHeight = '0px';
                } else {
                    item.classList.add('active');
                    // Set max-height dynamically to content height to support clean CSS transition
                    const height = wrapper.scrollHeight;
                    wrapper.style.maxHeight = height + 'px';
                }
            });
        }
    });

    // --- 8. Floating WhatsApp Scroll Visibility ---
    const whatsappFloatBtn = document.getElementById('whatsapp-float-btn');
    if (whatsappFloatBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                whatsappFloatBtn.classList.add('show');
            } else {
                whatsappFloatBtn.classList.remove('show');
            }
        });
    }

    // --- 8b. Back to Top Button ---
    const backToTopBtn = document.getElementById('back-to-top-btn');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 600) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- 8c. Toast Notification Helper ---
    const toastEl = document.getElementById('toast-notification');
    const toastTextEl = document.getElementById('toast-text');
    let toastTimer;

    const showToast = (message, duration = 3000) => {
        if (!toastEl || !toastTextEl) return;
        clearTimeout(toastTimer);
        toastTextEl.textContent = message;
        toastEl.classList.add('show');
        toastTimer = setTimeout(() => {
            toastEl.classList.remove('show');
        }, duration);
    };

    // --- 9. Reusable Touch Swipe Helper ---
    const addSwipeListener = (element, onSwipeLeft, onSwipeRight) => {
        let touchStartX = 0;
        let touchEndX = 0;
        
        element.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        element.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const threshold = 50; // swipe minimum distance in pixels
            if (touchStartX - touchEndX > threshold) {
                onSwipeLeft();
            } else if (touchEndX - touchStartX > threshold) {
                onSwipeRight();
            }
        }, { passive: true });
    };

    // Hero Slider Mobile Swipe Handlers
    const heroSliderGrid = document.querySelector('.slide-content-grid');
    if (heroSliderGrid) {
        addSwipeListener(
            heroSliderGrid,
            () => { goToNextSlide(); },
            () => { goToPrevSlide(); }
        );
    }

    // --- 10. Testimonials Carousel Controller ---
    const testTrack = document.querySelector('.testimonials-track');
    const testSlides = document.querySelectorAll('.testimonial-slide');
    const testDots = document.querySelectorAll('.test-dot');
    let currentTestIndex = 0;
    let testAutoTimer = null;
    let isTestHovered = false;

    const switchTestimonial = (index) => {
        if (!testTrack) return;
        currentTestIndex = index;
        testTrack.style.transform = `translateX(-${index * 100}%)`;
        
        testDots.forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    };

    const startTestAuto = () => {
        if (!testTrack || testSlides.length <= 1) return;
        stopTestAuto();
        testAutoTimer = setInterval(() => {
            if (!isTestHovered) {
                const nextIndex = (currentTestIndex + 1) % testSlides.length;
                switchTestimonial(nextIndex);
            }
        }, 6000);
    };

    const stopTestAuto = () => {
        if (testAutoTimer) {
            clearInterval(testAutoTimer);
            testAutoTimer = null;
        }
    };

    testDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopTestAuto();
            switchTestimonial(index);
            startTestAuto();
        });
    });

    startTestAuto();

    // Testimonials Mobile & Hover Handlers
    const testCarousel = document.querySelector('.testimonials-carousel');
    if (testCarousel) {
        testCarousel.addEventListener('mouseenter', () => { isTestHovered = true; });
        testCarousel.addEventListener('mouseleave', () => { isTestHovered = false; });

        addSwipeListener(
            testCarousel,
            () => { // Swipe Left -> Next
                stopTestAuto();
                const nextIndex = (currentTestIndex + 1) % testSlides.length;
                switchTestimonial(nextIndex);
                startTestAuto();
            },
            () => { // Swipe Right -> Prev
                stopTestAuto();
                const prevIndex = (currentTestIndex - 1 + testSlides.length) % testSlides.length;
                switchTestimonial(prevIndex);
                startTestAuto();
            }
        );
    }

    // --- 11. Continuous Product Marquee & Filter Controller ---
    const ritualsTrack = document.getElementById('rituals-track');
    const ritualsCarousel = document.querySelector('.rituals-carousel');
    const ritualPrevBtn = document.getElementById('ritual-prev-btn');
    const ritualNextBtn = document.getElementById('ritual-next-btn');
    const ritualFilters = document.querySelectorAll('.ritual-filter');

    if (ritualsTrack) {
        const originalSlides = Array.from(ritualsTrack.querySelectorAll('.ritual-card-slide'));

        // Extra cycles keep the marquee seamless even when a filter leaves only one product.
        for (let cycle = 0; cycle < 4; cycle += 1) {
            originalSlides.forEach(slide => {
                const clone = slide.cloneNode(true);
                clone.classList.add('is-clone');
                ritualsTrack.appendChild(clone);
            });
        }

        const allSlides = Array.from(ritualsTrack.querySelectorAll('.ritual-card-slide'));
        let activeCategory = 'all';
        let marqueeOffset = 0;
        let manualTarget = null;
        let loopWidth = 0;
        let cardWidth = 0;
        let lastFrameTime = 0;
        const marqueeSpeed = 22; // pixels per second

        const getColumns = () => {
            const value = getComputedStyle(ritualsCarousel).getPropertyValue('--ritual-columns');
            return Math.max(1, Number.parseInt(value, 10) || 1);
        };

        const getVisibleOriginals = () => originalSlides.filter(slide => slide.style.display !== 'none');

        const updateMeasurements = () => {
            cardWidth = ritualsTrack.parentElement.clientWidth / getColumns();
            ritualsCarousel.style.setProperty('--ritual-card-width', `${cardWidth}px`);
            loopWidth = getVisibleOriginals().length * cardWidth;
        };

        const normalizeOffset = () => {
            if (!loopWidth) return;
            while (marqueeOffset <= -loopWidth) marqueeOffset += loopWidth;
            while (marqueeOffset > 0) marqueeOffset -= loopWidth;
        };

        const renderMarquee = () => {
            ritualsTrack.style.transform = `translate3d(${marqueeOffset}px, 0, 0)`;
        };

        const nudgeByOneProduct = (direction) => {
            if (!cardWidth || !loopWidth) return;
            const baseTarget = manualTarget === null ? marqueeOffset : manualTarget;
            if (direction > 0 && baseTarget + cardWidth > 0) {
                marqueeOffset -= loopWidth;
                if (manualTarget !== null) manualTarget -= loopWidth;
            }
            manualTarget = (manualTarget === null ? marqueeOffset : manualTarget) + direction * cardWidth;
        };

        const marqueeLoop = (time) => {
            const delta = lastFrameTime ? Math.min(time - lastFrameTime, 50) : 0;
            lastFrameTime = time;

            if (!document.hidden) {
                if (manualTarget !== null) {
                    const distance = manualTarget - marqueeOffset;
                    marqueeOffset += distance * Math.min(1, delta / 140);
                    if (Math.abs(distance) < 0.5) {
                        marqueeOffset = manualTarget;
                        manualTarget = null;
                        normalizeOffset();
                    }
                } else {
                    marqueeOffset -= marqueeSpeed * (delta / 1000);
                    normalizeOffset();
                }
                renderMarquee();
            }

            window.requestAnimationFrame(marqueeLoop);
        };

        const applyFilter = (category) => {
            activeCategory = category;
            allSlides.forEach(slide => {
                const categories = slide.getAttribute('data-category') || '';
                slide.style.display = category === 'all' || categories.includes(category) ? '' : 'none';
            });
            marqueeOffset = 0;
            manualTarget = null;
            updateMeasurements();
            renderMarquee();
        };

        // Category filter buttons
        ritualFilters.forEach(filter => {
            filter.addEventListener('click', () => {
                ritualFilters.forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                const cat = filter.getAttribute('data-filter') || 'all';
                applyFilter(cat);
            });
        });

        if (ritualPrevBtn) {
            ritualPrevBtn.addEventListener('click', () => nudgeByOneProduct(1));
        }
        if (ritualNextBtn) {
            ritualNextBtn.addEventListener('click', () => nudgeByOneProduct(-1));
        }

        // Touch swipe support
        addSwipeListener(
            ritualsTrack.parentElement,
            () => nudgeByOneProduct(-1),
            () => nudgeByOneProduct(1)
        );

        if (ritualsCarousel) {
            ritualsCarousel.tabIndex = 0;
            ritualsCarousel.addEventListener('keydown', event => {
                if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    nudgeByOneProduct(1);
                }
                if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    nudgeByOneProduct(-1);
                }
            });
        }

        let resizeTimer;
        window.addEventListener('resize', () => {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(() => {
                marqueeOffset = 0;
                manualTarget = null;
                updateMeasurements();
                renderMarquee();
            }, 120);
        });

        applyFilter(activeCategory);
        window.requestAnimationFrame(marqueeLoop);
    }

    // --- 12. Image Skeleton Loading ---
    const initImageSkeletons = () => {
        const imageWrappers = document.querySelectorAll('.ritual-image-wrapper, .quality-image-wrapper, .story-image-frame, .slide-image-frame');
        imageWrappers.forEach(wrapper => {
            const img = wrapper.querySelector('img');
            if (!img) return;

            // Add skeleton class
            wrapper.classList.add('skeleton-wrapper');

            if (img.complete && img.naturalWidth > 0) {
                wrapper.classList.add('loaded');
            } else {
                img.addEventListener('load', () => {
                    wrapper.classList.add('loaded');
                });
                img.addEventListener('error', () => {
                    wrapper.classList.add('loaded');
                });
            }
        });
    };

    initImageSkeletons();

    // --- 13. URL Language Query Parameter Initializer ---
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    if (langParam === 'cn' || langParam === 'zh') {
        switchLanguage('cn');
    } else if (langParam === 'en') {
        switchLanguage('en');
    }

    // --- 14. Product Quick View Modal & Form Pre-fill Controller ---
    const productModal = document.getElementById('product-quick-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalInquireBtn = document.getElementById('modal-inquire-btn');
    let activeModalProductName = '';

    const openProductModal = (productKey) => {
        if (!productModal) return;
        const data = PRODUCT_DATA[productKey];
        if (!data) return;

        const langData = data[currentLang] || data['en'];
        activeModalProductName = productKey;

        // Populate modal fields
        document.getElementById('modal-product-category').textContent = langData.category;
        document.getElementById('modal-product-title').textContent = langData.title;
        document.getElementById('modal-product-price').textContent = langData.price;
        document.getElementById('modal-product-moq').textContent = langData.moq;
        document.getElementById('modal-product-desc').textContent = langData.desc;
        document.getElementById('modal-product-actives').textContent = langData.actives;
        const clinicalEl = document.getElementById('modal-product-clinical');
        if (clinicalEl) {
            clinicalEl.textContent = langData.clinical || (currentLang === 'cn' ? '+89% 皮肤屏障锁水提升（经过 28 天 20 受试者临床测试验证）。' : '+89% Dermal Moisture Retention after 28 days of usage (20-subject clinical trial).');
        }
        document.getElementById('modal-product-skin').textContent = langData.skin;
        document.getElementById('modal-product-usage').textContent = langData.usage;

        // Match image based on title
        const cardImg = document.querySelector(`.ritual-card-slide [data-product="${productKey}"]`)
                     ?.closest('.ritual-card')?.querySelector('.ritual-image');
        if (cardImg) {
            document.getElementById('modal-product-img').src = cardImg.src;
        }

        // Show modal
        productModal.classList.add('active');
        productModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closeProductModal = () => {
        if (!productModal) return;
        productModal.classList.remove('active');
        productModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeProductModal);
    }
    if (productModal) {
        productModal.addEventListener('click', (e) => {
            if (e.target === productModal) closeProductModal();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && productModal?.classList.contains('active')) {
            closeProductModal();
        }
    });

    // Helper: Form Pre-fill & Smooth Scroll to #connect
    const prefillFormAndScroll = (productName) => {
        const selectElement = document.getElementById('interest');
        if (selectElement && productName) {
            for (let i = 0; i < selectElement.options.length; i++) {
                if (selectElement.options[i].value.includes(productName) || selectElement.options[i].text.includes(productName)) {
                    selectElement.selectedIndex = i;
                    // Flash highlight on select
                    selectElement.classList.add('highlight-flash');
                    setTimeout(() => selectElement.classList.remove('highlight-flash'), 1500);
                    break;
                }
            }
        }
        // Smooth scroll to connect section
        const connectSection = document.getElementById('connect');
        if (connectSection) {
            connectSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Modal "Inquire Formulation" CTA click
    if (modalInquireBtn) {
        modalInquireBtn.addEventListener('click', () => {
            closeProductModal();
            prefillFormAndScroll(activeModalProductName);
        });
    }

    // Attach click listeners to product cards for Quick View
    document.querySelectorAll('.ritual-card').forEach(card => {
        const ctaBtn = card.querySelector('.ritual-cta-btn');
        const productName = ctaBtn ? ctaBtn.getAttribute('data-product') : '';

        // Card image or title click opens Quick View Modal
        const imgWrapper = card.querySelector('.ritual-image-wrapper');
        const titleEl = card.querySelector('.ritual-title');

        if (imgWrapper && productName) {
            imgWrapper.style.cursor = 'pointer';
            imgWrapper.addEventListener('click', () => openProductModal(productName));
        }
        if (titleEl && productName) {
            titleEl.style.cursor = 'pointer';
            titleEl.addEventListener('click', () => openProductModal(productName));
        }

        // CTA button directly scrolls and pre-fills form
        if (ctaBtn) {
            ctaBtn.addEventListener('click', (e) => {
                e.preventDefault();
                prefillFormAndScroll(productName);
            });
        }
    });

    // --- 15. Interactive Formulation Finder Quiz Controller ---
    const initFormulationQuiz = () => {
        const quizContainer = document.getElementById('quiz-container');
        if (!quizContainer) return;

        const quizSelections = { goal: null, texture: null, volume: null };
        const progressSteps = quizContainer.querySelectorAll('.quiz-progress-step');
        const stepPanes = quizContainer.querySelectorAll('.quiz-step-pane');
        const resultPane = document.getElementById('quiz-result-pane');
        const resTitle = document.getElementById('quiz-res-title');
        const resDesc = document.getElementById('quiz-res-desc');
        const resActives = document.getElementById('quiz-res-actives');
        const applyBtn = document.getElementById('quiz-apply-btn');
        const restartBtn = document.getElementById('quiz-restart-btn');

        const goToStep = (stepNumber) => {
            progressSteps.forEach(step => {
                const s = parseInt(step.getAttribute('data-step'));
                if (s <= stepNumber) step.classList.add('active');
                else step.classList.remove('active');
            });

            stepPanes.forEach(pane => pane.classList.remove('active'));
            if (resultPane) resultPane.style.display = 'none';

            if (stepNumber <= 3) {
                const targetPane = document.getElementById(`quiz-pane-${stepNumber}`);
                if (targetPane) targetPane.classList.add('active');
            } else {
                calculateResult();
            }
        };

        const calculateResult = () => {
            stepPanes.forEach(pane => pane.classList.remove('active'));
            if (resultPane) resultPane.style.display = 'block';

            let titleStr = '';
            let descStr = '';
            let activesStr = '';
            let targetFormValue = 'Bespoke Skincare Consultation';

            if (quizSelections.goal === 'hydrate') {
                titleStr = currentLang === 'cn' ? '多重玻尿酸极润精华架构 (The Active Serum)' : 'The Active Serum Architecture';
                descStr = currentLang === 'cn' ? '高亲肤性多重分子玻尿酸 + 绿茶发酵抗氧复合物，专为深层补水与极润充盈设计。' : 'High-affinity multi-molecular hyaluronic acid + green tea antioxidant complex designed for intense dermal plumping.';
                activesStr = currentLang === 'cn' ? '1.5% 多重玻尿酸、二裂酵母发酵物、仿生神经酰胺' : '1.5% Multi-Molecular HA, Bifida Ferment, Organic Ceramides';
                targetFormValue = 'The Active Serum';
            } else if (quizSelections.goal === 'repair') {
                titleStr = currentLang === 'cn' ? '有机神经酰胺屏障修护面霜架构 (The Luxury Cream)' : 'The Luxury Cream Architecture';
                descStr = currentLang === 'cn' ? '3:1:1 仿生皮脂神经酰胺复合物 + 霍霍巴脂，深度重建屏障并固锁营养。' : '3:1:1 skin-identical ceramide complex + cold-pressed jojoba butter for barrier fortification.';
                activesStr = currentLang === 'cn' ? '有机神经酰胺 NP/AP/EOP、植物角鲨烷、高山雪绒花萃取' : 'Organic Ceramide NP/AP/EOP, Squalane, Edelweiss Extract';
                targetFormValue = 'The Luxury Cream';
            } else if (quizSelections.goal === 'aging') {
                titleStr = currentLang === 'cn' ? '高能多肽紧致提拉配方架构 (The Peptide Lift)' : 'The Peptide Lift Architecture';
                descStr = currentLang === 'cn' ? '蓝铜胜肽与乙基四肽交联复合物，有效紧致下颌线与眼周纹理。' : 'Palmitoyl Tripeptide-5 and copper peptides engineered for neck contour and eye rejuvenation.';
                activesStr = currentLang === 'cn' ? '蓝铜胜肽、棕榈酰三肽-5、深海胶原蛋白' : 'Copper Peptides, Palmitoyl Tripeptide-5, Marine Collagen';
                targetFormValue = 'The Peptide Lift';
            } else {
                titleStr = currentLang === 'cn' ? '氨基酸温和净化平衡架构 (The Gentle Cleanser & Toner)' : 'The Gentle Botanical Cleanser Architecture';
                descStr = currentLang === 'cn' ? '椰油酰氨基酸表面活性剂 + 金缕梅纯露，温和净化毛孔油脂，维持弱酸平衡。' : 'Coconut amino acid surfactants + rose hydrosol designed to refine pores without moisture loss.';
                activesStr = currentLang === 'cn' ? '氨基酸表活、大马士革玫瑰纯露、烟酰胺 2%' : 'Amino Acid Surfactants, Rose Hydrosol, Niacinamide (2%)';
                targetFormValue = 'The Gentle Cleanser';
            }

            if (resTitle) resTitle.textContent = titleStr;
            if (resDesc) resDesc.textContent = descStr;
            if (resActives) resActives.textContent = activesStr;

            if (applyBtn) {
                applyBtn.setAttribute('data-recommended-product', targetFormValue);
                applyBtn.setAttribute('data-recommended-volume', quizSelections.volume || '');
            }
        };

        quizContainer.querySelectorAll('.quiz-opt-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.getAttribute('data-type');
                const val = btn.getAttribute('data-value');
                quizSelections[type] = val;

                if (type === 'goal') goToStep(2);
                else if (type === 'texture') goToStep(3);
                else if (type === 'volume') goToStep(4);
            });
        });

        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                const recProduct = applyBtn.getAttribute('data-recommended-product');
                const recVol = applyBtn.getAttribute('data-recommended-volume');
                
                const moqSelect = document.getElementById('moq');
                if (moqSelect && recVol) {
                    for (let i = 0; i < moqSelect.options.length; i++) {
                        if (moqSelect.options[i].value.includes(recVol)) {
                            moqSelect.selectedIndex = i;
                            break;
                        }
                    }
                }

                prefillFormAndScroll(recProduct);
                showToast(currentLang === 'cn' ? '匹配配方与订量已成功带入询盘表单！' : 'Matched formulation & volume applied to inquiry form!');
            });
        }

        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                quizSelections.goal = null;
                quizSelections.texture = null;
                quizSelections.volume = null;
                goToStep(1);
            });
        }
    };

    initFormulationQuiz();
});
