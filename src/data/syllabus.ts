export interface SyllabusTopic {
    title: string;
    description?: string;
    subtopics: string[];
}

export interface SyllabusSubject {
    name: string;
    code?: string;
    topics: SyllabusTopic[];
}

export interface SyllabusCategory {
    category: string;
    subjects: SyllabusSubject[];
}

export const SYLLABUS_DATA: SyllabusCategory[] = [
    {
        category: "Section IA: Languages (13 Subjects)",
        subjects: [
            {
                name: "English",
                code: "101",
                topics: [
                    {
                        title: "Reading Comprehension",
                        subtopics: [
                            "Factual Passages (300-350 words)",
                            "Narrative Passages (300-350 words)",
                            "Literary Passages (300-350 words)"
                        ]
                    },
                    {
                        title: "Verbal Ability",
                        subtopics: [
                            "Logical ordering of ideas",
                            "Detecting inconsistencies in text"
                        ]
                    },
                    {
                        title: "Rearranging the Parts",
                        subtopics: ["Reconstructing jumbled segments into coherent sentences"]
                    },
                    {
                        title: "Choosing the Correct Word",
                        subtopics: [
                            "Fill-in-the-blanks",
                            "Sentence correction",
                            "Nouns, verbs, prepositions, conjunctions usage"
                        ]
                    },
                    {
                        title: "Synonyms and Antonyms",
                        subtopics: ["Matching words with similar or opposite meanings in context"]
                    },
                    {
                        title: "Vocabulary",
                        subtopics: ["Word definitions", "Idioms and phrases", "One-word substitutions"]
                    },
                    {
                        title: "Literary Aptitude",
                        subtopics: ["Appreciating literary devices (metaphors, similes, irony)"]
                    }
                ]
            },
            {
                name: "Hindi",
                code: "102",
                topics: [
                    {
                        title: "Bodh (Reading Comprehension)",
                        subtopics: ["Factual", "Narrative", "Literary passages"]
                    },
                    {
                        title: "Maukhik Abhikshamta (Verbal Ability)",
                        subtopics: ["Logical ordering"]
                    },
                    {
                        title: "Vakyansh Punaryojna",
                        subtopics: ["Rearranging parts"]
                    },
                    {
                        title: "Sahi Shabd Chayan",
                        subtopics: ["Choosing the correct word"]
                    },
                    {
                        title: "Paryayavachi aur Vilom",
                        subtopics: ["Synonyms and Antonyms"]
                    },
                    {
                        title: "Shabdavali",
                        subtopics: ["Vocabulary"]
                    }
                ]
            }
        ]
    },
    {
        category: "Section II: Science Domains",
        subjects: [
            {
                name: "Physics",
                code: "322",
                topics: [
                    {
                        title: "Electrostatics",
                        subtopics: [
                            "Electric charges & Coulomb's Law",
                            "Superposition principle",
                            "Continuous charge distribution",
                            "Electric field & Potential",
                            "Potential energy",
                            "Conductors and dielectrics",
                            "Capacitors (parallel plate) & Energy storage"
                        ]
                    },
                    {
                        title: "Current Electricity",
                        subtopics: [
                            "Drift velocity & Ohm's law",
                            "Temperature dependence of resistance",
                            "Kirchhoff's laws",
                            "Wheatstone bridge & Potentiometer"
                        ]
                    },
                    {
                        title: "Magnetic Effects of Current and Magnetism",
                        subtopics: [
                            "Biot-Savart law",
                            "Ampere's law",
                            "Lorentz force",
                            "Magnetic dipole moments",
                            "Magnetic materials (para-, dia-, ferro-magnetic)"
                        ]
                    },
                    {
                        title: "Electromagnetic Induction and AC",
                        subtopics: [
                            "Faraday's law & Lenz's Law",
                            "Eddy currents",
                            "Self and Mutual Induction",
                            "LCR series circuits & Resonance",
                            "Power in AC circuits"
                        ]
                    },
                    {
                        title: "Electromagnetic Waves",
                        subtopics: ["Displacement current", "EM waves characteristics & spectrum"]
                    },
                    {
                        title: "Optics",
                        subtopics: [
                            "Ray Optics: Reflection, Refraction, Lenses, Prisms, Optical instruments",
                            "Wave Optics: Huygens' principle, Interference, Diffraction, Polarization"
                        ]
                    },
                    {
                        title: "Dual Nature of Matter and Radiation",
                        subtopics: ["Photoelectric effect", "Einstein's equation", "de Broglie's hypothesis"]
                    },
                    {
                        title: "Atoms and Nuclei",
                        subtopics: [
                            "Alpha-particle scattering",
                            "Bohr model & Hydrogen spectrum",
                            "Radioactivity",
                            "Nuclear fission & fusion"
                        ]
                    },
                    {
                        title: "Electronic Devices",
                        subtopics: ["Energy bands", "Semiconductor diodes (I-V characteristics)", "Rectifiers", "Logic gates"]
                    }
                ]
            },
            {
                name: "Chemistry",
                code: "306",
                topics: [
                    {
                        title: "Physical Chemistry",
                        subtopics: [
                            "Solid State: Unit cells, Packing efficiency, Voids",
                            "Solutions: Raoult's law, Colligative properties",
                            "Electrochemistry: Nernst equation, Conductance, Corrosion",
                            "Chemical Kinetics: Rate laws, Order, Molecularity, Arrhenius equation",
                            "Surface Chemistry: Adsorption, Catalysis, Colloids"
                        ]
                    },
                    {
                        title: "Inorganic Chemistry",
                        subtopics: [
                            "Isolation of Elements: Concentration, Oxidation, Reduction, Refining",
                            "p-Block Elements: Groups 15-18 trends & properties",
                            "d- and f-Block Elements: Transition metals, Lanthanoids, Actinoids",
                            "Coordination Compounds: Werner's theory, VBT, CFT"
                        ]
                    },
                    {
                        title: "Organic Chemistry",
                        subtopics: [
                            "Haloalkanes and Haloarenes: Mechanism of substitution",
                            "Alcohols, Phenols, and Ethers: Acidity emphasizing phenols",
                            "Aldehydes, Ketones, Carboxylic Acids: Nucleophilic addition",
                            "Amines & Diazonium salts",
                            "Biomolecules: Carbohydrates, Proteins, Nucleic Acids",
                            "Polymers: Classification & Methods",
                            "Chemistry in Everyday Life: Medicines, Food, Cleansing agents"
                        ]
                    }
                ]
            },
            {
                name: "Mathematics",
                code: "319",
                topics: [
                    {
                        title: "Section A (Common)",
                        subtopics: [
                            "Matrices and Determinants",
                            "Higher-Order Derivatives",
                            "Maxima/Minima",
                            "Integration applications",
                            "Differential Equations",
                            "Probability Distributions"
                        ]
                    },
                    {
                        title: "Section B1 (Core Math)",
                        subtopics: [
                            "Relations and Functions (Inverse Trig)",
                            "Calculus (Tangents, Normals, Definite Integrals)",
                            "Vectors and 3D Geometry (Lines, Planes)",
                            "Linear Programming",
                            "Probability (Bayes' theorem)"
                        ]
                    },
                    {
                        title: "Section B2 (Applied Math)",
                        subtopics: [
                            "Modulo Arithmetic & Allegation",
                            "Numerical Applications (Boats/Streams)",
                            "Financial Math (Perpetuity, Sinking Funds, EMI, CAGR)",
                            "Statistics (Time Series, Index numbers)"
                        ]
                    }
                ]
            },
            {
                name: "Biology / Biotechnology",
                code: "304",
                topics: [
                    { title: "Reproduction", subtopics: ["Sexual reproduction in flowering plants", "Human reproduction", "Reproductive Health (IVF, ZIFT, GIFT)"] },
                    { title: "Genetics and Evolution", subtopics: ["Mendelian inheritance", "Chromosome theory", "Linkage", "DNA structure & replication", "Transcription, Translation", "Human Genome Project", "Darwinian theories"] },
                    { title: "Biology and Human Welfare", subtopics: ["Pathogens & Immunology", "Cancer & AIDS", "Food production enhancement", "Microbes in household/industry"] },
                    { title: "Biotechnology", subtopics: ["Principles (Genetic Engineering, rDNA)", "Applications (Health, Agriculture, Transgenic animals, Bioethics)"] },
                    { title: "Ecology and Environment", subtopics: ["Organisms and Populations", "Ecosystem structure & energy flow", "Biodiversity Conservation", "Environmental Issues"] }
                ]
            }
        ]
    },
    {
        category: "Section II: Commerce Domains",
        subjects: [
            {
                name: "Accountancy",
                code: "301",
                topics: [
                    { title: "Accounting for Partnership", subtopics: ["Partnership Deed", "Final Accounts", "Division of Profit"] },
                    { title: "Reconstitution of Partnership", subtopics: ["Change in profit-sharing", "Revaluation", "Admission, Retirement, Death"] },
                    { title: "Dissolution", subtopics: ["Settlement of accounts", "Realization Account"] },
                    { title: "Company Accounts", subtopics: ["Share Capital (Issue, Forfeiture, Re-issue)", "Debentures (Issue, Redemption)"] },
                    { title: "Analysis of Financial Statements", subtopics: ["Comparative/Common-size statements", "Ratios (Liquidity, Solvency, Activity, Profitability)", "Cash Flow Statements"] },
                    { title: "Computerized Accounting", subtopics: ["CAS overview", "Spreadsheets", "DBMS"] }
                ]
            },
            {
                name: "Business Studies",
                code: "305",
                topics: [
                    { title: "Management Principles", subtopics: ["Fayol & Taylor Principles", "Management Functions (Planning to Controlling)"] },
                    { title: "Business Environment", subtopics: ["PESTLE Analysis"] },
                    { title: "Business Finance", subtopics: ["Financial Planning", "Capital Structure", "Working Capital"] },
                    { title: "Financial Markets", subtopics: ["Money Market", "Capital Market", "Stock Exchanges", "SEBI"] },
                    { title: "Marketing", subtopics: ["Marketing Mix (4Ps)", "Branding", "Labeling", "Packaging"] },
                    { title: "Consumer Protection", subtopics: ["Rights", "Responsibilities", "Redressal mechanisms"] }
                ]
            },
            {
                name: "Economics",
                code: "309",
                topics: [
                    { title: "Microeconomics", subtopics: ["Consumer Behavior (Demand, Elasticity)", "Producer Behavior (Production, Cost, Supply)", "Market Forms (Perfect Competition)"] },
                    { title: "Macroeconomics", subtopics: ["National Income Aggregates", "Determination of Income and Employment (Multiplier)", "Money and Banking (Credit Creation, RBI)", "Government Budget (Deficits)", "Balance of Payments (Forex)"] },
                    { title: "Indian Economic Development", subtopics: ["(Check CBSE Class 12 Syllabus for specifics)"] }
                ]
            }
        ]
    },
    {
        category: "Section II: Humanities Domains",
        subjects: [
            {
                name: "History",
                code: "314",
                topics: [
                    { title: "Ancient India", subtopics: ["Harappan Archaeology", "Inscriptions (Mauryas)", "Social Histories (Mahabharata)", "Buddhism (Sanchi Stupa)"] },
                    { title: "Medieval India", subtopics: ["Agrarian Relations (Ain-i-Akbari)", "Mughal Court", "Hampi Architecture", "Bhakti-Sufi Traditions", "Travelers' Accounts"] },
                    { title: "Modern India", subtopics: ["Colonialism and Rural Society", "1857 Revolt", "Mahatma Gandhi", "Partition (Oral Sources)", "Making of Constitution"] }
                ]
            },
            {
                name: "Political Science",
                code: "323",
                topics: [
                    { title: "Politics in India", subtopics: ["One-Party Dominance", "Nation-Building", "Planned Development", "External Relations", "Emergency", "Regional Aspirations", "Recent Developments"] },
                    { title: "Contemporary World", subtopics: ["Cold War", "End of Bipolarity", "Alternative Power Centers", "South Asia", "UN & Organizations", "Security", "Globalization"] }
                ]
            },
            {
                name: "Geography",
                code: "313",
                topics: [
                    { title: "Human Geography", subtopics: ["Population patterns", "Human Activities (Primary to Quaternary)", "Transport & Communication"] },
                    { title: "India: People & Economy", subtopics: ["Population distribution", "Human Settlements", "Resources (Land, Water, Mineral)", "Sustainable Development", "Geographical issues (Pollution)"] }
                ]
            },
            {
                name: "Sociology",
                code: "326",
                topics: [
                    { title: "Indian Society", subtopics: ["Demography", "Social Institutions (Caste, Tribal, Family)", "Social Inequality", "Unity in Diversity"] },
                    { title: "Change and Development", subtopics: ["Structural Change (Colonialism)", "Cultural Change (Sanskritization)", "Rural & Industrial Society", "Social Movements"] }
                ]
            },
            {
                name: "Psychology",
                code: "324",
                topics: [
                    { title: "Attributes & Personality", subtopics: ["Intelligence", "Aptitude", "Self and Personality Theories", "Assessment"] },
                    { title: "Challenges & Disorders", subtopics: ["Stress Management", "Psychological Disorders", "Therapeutic Approaches"] },
                    { title: "Social Psychology", subtopics: ["Attitude and Social Cognition", "Social Influence", "Group Processes"] }
                ]
            },
            {
                name: "Anthropology",
                code: "303",
                topics: [
                    { title: "Physical Anthropology", subtopics: ["Human Evolution", "Primates", "Biological variation"] },
                    { title: "Prehistoric Archaeology", subtopics: ["Stone Age cultures"] },
                    { title: "Socio-Cultural Anthropology", subtopics: ["Family", "Marriage", "Kinship", "Religion"] },
                    { title: "Tribal India", subtopics: ["Classification", "Problems", "Development"] }
                ]
            },
            {
                name: "Home Science",
                code: "315",
                topics: [
                    { title: "Livelihood & Nutrition", subtopics: ["Entrepreneurship", "Clinical nutrition", "Food processing"] },
                    { title: "Human Development", subtopics: ["Early childhood care", "Special education"] },
                    { title: "Fabric and Resource", subtopics: ["Fashion merchandising", "HR management", "Event management"] }
                ]
            }
        ]
    },
    {
        category: "Section II: Vocational & Other Subjects",
        subjects: [
            {
                name: "Agriculture",
                code: "302",
                topics: [
                    { title: "Agrometeorology", subtopics: ["Weather", "Climate change"] },
                    { title: "Genetics & Plant Breeding", subtopics: ["Cell biology", "Mendelism", "Crop improvement"] },
                    { title: "Biochemistry & Microbiology", subtopics: ["Plant nutrients", "Soil microbiology"] },
                    { title: "Livestock & Crop Production", subtopics: ["Cattle/poultry management", "Cultivation practices"] },
                    { title: "Horticulture", subtopics: ["Fruit and vegetable production", "Landscaping"] }
                ]
            },
            {
                name: "Physical Education / NCC / Yoga",
                code: "321",
                topics: [
                    { title: "Health & Psychology", subtopics: ["Diseases", "Nutrition", "Motivation", "Leadership"] },
                    { title: "Bio-mechanics & Training", subtopics: ["Laws of motion", "Strength", "Endurance", "Speed"] },
                    { title: "Yoga", subtopics: ["Asanas", "Pranayama"] }
                ]
            },
            {
                name: "Environmental Science",
                code: "307",
                topics: [
                    { title: "Nature & Conservation", subtopics: ["Ecological thoughts", "Ecology", "Demography"] },
                    { title: "Pollution & Agriculture", subtopics: ["Air/Water/Soil analysis", "Organic farming"] },
                    { title: "Economics & Global Issues", subtopics: ["Resources", "Green GDP", "Global environmental issues"] }
                ]
            },
            {
                name: "Mass Media / Mass Communication",
                code: "318",
                topics: [
                    { title: "Communication & Journalism", subtopics: ["Models", "Theories", "Role", "Ethics", "Reporting"] },
                    { title: "Media Production", subtopics: ["TV/Radio Production", "Scriptwriting", "Cinema History"] },
                    { title: "New Media", subtopics: ["Internet", "Social Media dynamics"] }
                ]
            },
            {
                name: "Fine Arts / Visual Arts",
                code: "312",
                topics: [
                    { title: "Painting Schools", subtopics: ["Rajasthani", "Pahari", "Mughal", "Deccani"] },
                    { title: "Modern Art", subtopics: ["Bengal School", "Nationalism in art", "Contemporary Indian sculpture/painting"] }
                ]
            },
            {
                name: "Performing Arts",
                code: "320",
                topics: [
                    { title: "Music", subtopics: ["Vocal/Instrumental", "Ragas", "Talas", "History"] },
                    { title: "Dance & Drama", subtopics: ["Classical forms", "Folk dances", "Theatre history", "Acting techniques"] }
                ]
            },
            {
                name: "Sanskrit",
                code: "325",
                topics: [
                    { title: "Grammar", subtopics: ["Sandhi", "Samasa", "Karaka", "Vibhakti"] },
                    { title: "Literature", subtopics: ["Text comprehension", "History of Sanskrit literature"] }
                ]
            },
            {
                name: "Knowledge Tradition and Practices of India",
                code: "316",
                topics: [
                    { title: "Survey of Disciplines", subtopics: ["Agriculture", "Architecture", "Dance", "Education", "Ethics", "Martial Arts", "Math"] },
                    { title: "Primary Texts", subtopics: ["Excerpts from Vedas", "Upavedas", "Classical texts"] }
                ]
            }
        ]
    },
    {
        category: "Section III: General Test",
        subjects: [
            {
                name: "General Test",
                code: "501",
                topics: [
                    {
                        title: "General Knowledge & Current Affairs",
                        subtopics: [
                            "Current Affairs (Last 12-18 months): Awards, Sports, Sci-Tech, Geopolitics",
                            "Static GK: History (Freedom Struggle), Geography, Polity, Economy, General Science"
                        ]
                    },
                    {
                        title: "General Mental Ability",
                        subtopics: [
                            "Analogies (Letter, Number, Word)",
                            "Classification",
                            "Series Completion",
                            "Coding-Decoding",
                            "Visual Reasoning"
                        ]
                    },
                    {
                        title: "Numerical Ability",
                        subtopics: [
                            "Number System, HCF/LCM",
                            "Percentage, Profit & Loss",
                            "Ratio & Proportion",
                            "Simple & Compound Interest",
                            "Time & Work; Time, Speed & Distance",
                            "Averages"
                        ]
                    },
                    {
                        title: "Quantitative Reasoning",
                        subtopics: [
                            "Algebraic identities",
                            "Geometry (Triangles, Circles)",
                            "Mensuration (2D & 3D)",
                            "Statistics (Mean, Median, Mode)"
                        ]
                    },
                    {
                        title: "Logical Reasoning",
                        subtopics: [
                            "Syllogisms",
                            "Statement & Assumption/Conclusion",
                            "Blood Relations",
                            "Direction Sense",
                            "Seating Arrangements"
                        ]
                    }
                ]
            }
        ]
    }
];
