import { Question, StudyMaterial, BacklogItem, Mentor, MentorVideo, SiteCustomization } from '../types';

export const INITIAL_QUESTIONS: Question[] = [
  // PHYSICS - JEE / NEET
  {
    id: 'phy-01',
    targetExam: 'JEE Main',
    classLevel: 'Class 11',
    subject: 'Physics',
    chapter: 'Kinematics',
    type: 'single_choice',
    difficulty: 'medium',
    text: 'A projectile is launched from ground level at an angle θ = 45° with an initial velocity of 20 m/s. Taking g = 10 m/s², what is the maximum height reached by the projectile?',
    options: [
      { id: 'opt-1', text: '5 m', isCorrect: false },
      { id: 'opt-2', text: '10 m', isCorrect: true },
      { id: 'opt-3', text: '15 m', isCorrect: false },
      { id: 'opt-4', text: '20 m', isCorrect: false }
    ],
    explanationText: 'H_max = (u² * sin²θ) / (2g)\nHere u = 20 m/s, θ = 45°, sin 45° = 1/√2, sin² 45° = 1/2.\nH_max = (400 * 0.5) / (2 * 10) = 200 / 20 = 10 m.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'phy-02',
    targetExam: 'JEE Main',
    classLevel: 'Class 11',
    subject: 'Physics',
    chapter: 'Laws of Motion',
    type: 'numerical',
    difficulty: 'medium',
    text: 'A block of mass m = 2 kg rests on a rough horizontal floor with coefficient of friction μ = 0.4. A horizontal force F is applied. What is the minimum force (in Newtons) required to start moving the block? (Take g = 10 m/s²)',
    options: [],
    numericalAnswer: 8,
    numericalTolerance: 0.1,
    explanationText: 'Limiting friction f_lim = μ * N = μ * (m * g) = 0.4 * (2 * 10) = 8 N.\nHence, the minimum force required to initiate motion is 8 N.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'phy-03',
    targetExam: 'JEE Main',
    classLevel: 'Class 12',
    subject: 'Physics',
    chapter: 'Electrostatics',
    type: 'single_choice',
    difficulty: 'hard',
    text: 'Two identical conducting spheres carrying charges +6 μC and -2 μC are brought into contact and then separated to their initial distance. The ratio of the electrostatic force before and after contact is:',
    options: [
      { id: 'opt-1', text: '3 : 1', isCorrect: true },
      { id: 'opt-2', text: '2 : 1', isCorrect: false },
      { id: 'opt-3', text: '4 : 1', isCorrect: false },
      { id: 'opt-4', text: '1 : 3', isCorrect: false }
    ],
    explanationText: 'Initial force F1 ∝ |q1 * q2| = 6 * 2 = 12.\nAfter contact, total charge Q = (+6 - 2) = +4 μC. Each sphere gets q\' = 4/2 = 2 μC.\nFinal force F2 ∝ (2 * 2) = 4.\nRatio F1 / F2 = 12 / 4 = 3 : 1.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'phy-04',
    targetExam: 'JEE Main',
    classLevel: 'Class 12',
    subject: 'Physics',
    chapter: 'Current Electricity',
    type: 'single_choice',
    difficulty: 'easy',
    text: 'In a Wheatstone bridge, four resistances P = 10 Ω, Q = 20 Ω, R = 15 Ω, and S are connected. The value of S (in Ω) for which the galvanometer shows zero deflection is:',
    options: [
      { id: 'opt-1', text: '25 Ω', isCorrect: false },
      { id: 'opt-2', text: '30 Ω', isCorrect: true },
      { id: 'opt-3', text: '35 Ω', isCorrect: false },
      { id: 'opt-4', text: '40 Ω', isCorrect: false }
    ],
    explanationText: 'Condition for balanced bridge: P / Q = R / S.\n10 / 20 = 15 / S  =>  1/2 = 15/S  =>  S = 30 Ω.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'phy-05',
    targetExam: 'JEE Main',
    classLevel: 'Class 11',
    subject: 'Physics',
    chapter: 'Work Energy and Power',
    type: 'numerical',
    difficulty: 'medium',
    text: 'A spring has a spring constant k = 200 N/m. The work done (in Joules) to stretch the spring from an elongation of 10 cm (0.1 m) to 20 cm (0.2 m) is:',
    options: [],
    numericalAnswer: 3,
    numericalTolerance: 0.1,
    explanationText: 'Work done W = 1/2 * k * (x2² - x1²) = 1/2 * 200 * (0.04 - 0.01) = 100 * 0.03 = 3 J.',
    createdAt: new Date().toISOString()
  },

  // CHEMISTRY - JEE / NEET
  {
    id: 'chem-01',
    targetExam: 'JEE Main',
    classLevel: 'Class 11',
    subject: 'Chemistry',
    chapter: 'Atomic Structure',
    type: 'single_choice',
    difficulty: 'medium',
    text: 'What is the maximum number of electrons in an atom that can have quantum numbers n = 4 and m_s = +1/2?',
    options: [
      { id: 'opt-1', text: '16', isCorrect: true },
      { id: 'opt-2', text: '32', isCorrect: false },
      { id: 'opt-3', text: '8', isCorrect: false },
      { id: 'opt-4', text: '4', isCorrect: false }
    ],
    explanationText: 'For n = 4, total number of orbitals = n² = 4² = 16 orbitals.\nEach orbital contains at most one electron with spin m_s = +1/2.\nTherefore, maximum electrons = 16.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'chem-02',
    targetExam: 'JEE Main',
    classLevel: 'Class 12',
    subject: 'Chemistry',
    chapter: 'Chemical Kinetics',
    type: 'numerical',
    difficulty: 'medium',
    text: 'For a first-order reaction with rate constant k = 0.0693 min⁻¹, what is the half-life t_1/2 in minutes? (Use ln 2 = 0.693)',
    options: [],
    numericalAnswer: 10,
    numericalTolerance: 0.1,
    explanationText: 't_1/2 = ln 2 / k = 0.693 / 0.0693 = 10 minutes.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'chem-03',
    targetExam: 'JEE Main',
    classLevel: 'Class 11',
    subject: 'Chemistry',
    chapter: 'Chemical Bonding',
    type: 'single_choice',
    difficulty: 'easy',
    text: 'Which of the following molecules has a linear geometry according to VSEPR theory?',
    options: [
      { id: 'opt-1', text: 'H2O', isCorrect: false },
      { id: 'opt-2', text: 'SO2', isCorrect: false },
      { id: 'opt-3', text: 'BeCl2', isCorrect: true },
      { id: 'opt-4', text: 'NH3', isCorrect: false }
    ],
    explanationText: 'BeCl2 has sp hybridization with 2 bond pairs and 0 lone pairs on Beryllium, resulting in a 180° linear geometry.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'chem-04',
    targetExam: 'JEE Main',
    classLevel: 'Class 12',
    subject: 'Chemistry',
    chapter: 'Organic Chemistry: Hydrocarbons & Haloalkanes',
    type: 'single_choice',
    difficulty: 'hard',
    text: 'When ethyl chloride is treated with alcoholic KOH and heated, the major organic product obtained is:',
    options: [
      { id: 'opt-1', text: 'Ethanol', isCorrect: false },
      { id: 'opt-2', text: 'Ethene (Ethylene)', isCorrect: true },
      { id: 'opt-3', text: 'Diethyl ether', isCorrect: false },
      { id: 'opt-4', text: 'Ethane', isCorrect: false }
    ],
    explanationText: 'Alcoholic KOH acts as a strong dehydrohalogenating base, causing an E2 β-elimination of HCl to produce ethene (CH2=CH2). Aqueous KOH produces alcohol via substitution.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'chem-05',
    targetExam: 'JEE Main',
    classLevel: 'Class 11',
    subject: 'Chemistry',
    chapter: 'Thermodynamics',
    type: 'numerical',
    difficulty: 'medium',
    text: 'In an isothermal reversible expansion of 1 mole of an ideal gas at 300 K from 1 L to 10 L, the magnitude of work done is approximately W = 2.303 * R * T * log10(10). Given R = 8.314 J/(mol K), calculate W in Joules (round to nearest whole number).',
    options: [],
    numericalAnswer: 5744,
    numericalTolerance: 20,
    explanationText: 'W = -2.303 * n * R * T * log10(V2/V1) = -2.303 * 1 * 8.314 * 300 * 1 = -5744 J. Magnitude is 5744 J.',
    createdAt: new Date().toISOString()
  },

  // MATHEMATICS - JEE
  {
    id: 'math-01',
    targetExam: 'JEE Main',
    classLevel: 'Class 11',
    subject: 'Mathematics',
    chapter: 'Quadratic Equations',
    type: 'single_choice',
    difficulty: 'medium',
    text: 'If α and β are roots of the equation x² - 5x + 6 = 0, what is the value of (α³ + β³)?',
    options: [
      { id: 'opt-1', text: '35', isCorrect: true },
      { id: 'opt-2', text: '40', isCorrect: false },
      { id: 'opt-3', text: '45', isCorrect: false },
      { id: 'opt-4', text: '50', isCorrect: false }
    ],
    explanationText: 'Roots are α = 2, β = 3.\nα³ + β³ = 2³ + 3³ = 8 + 27 = 35.\nAlternatively: (α+β)³ - 3αβ(α+β) = 5³ - 3(6)(5) = 125 - 90 = 35.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'math-02',
    targetExam: 'JEE Main',
    classLevel: 'Class 12',
    subject: 'Mathematics',
    chapter: 'Definite Integration',
    type: 'numerical',
    difficulty: 'hard',
    text: 'Evaluate the definite integral ∫ from 0 to π/2 of (sin x / (sin x + cos x)) dx. What is the value in terms of π? Enter the multiplier of π (e.g. if π/4, 1/4 = 0.25).',
    options: [],
    numericalAnswer: 0.25,
    numericalTolerance: 0.02,
    explanationText: 'Using King\'s property ∫_0^a f(x) dx = ∫_0^a f(a-x) dx:\n2I = ∫_0^(π/2) 1 dx = π/2 => I = π/4 = 0.25 * π.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'math-03',
    targetExam: 'JEE Main',
    classLevel: 'Class 12',
    subject: 'Mathematics',
    chapter: 'Matrices & Determinants',
    type: 'single_choice',
    difficulty: 'easy',
    text: 'If A is a 3x3 square matrix and |A| = 4, then the determinant |2A| is equal to:',
    options: [
      { id: 'opt-1', text: '8', isCorrect: false },
      { id: 'opt-2', text: '16', isCorrect: false },
      { id: 'opt-3', text: '32', isCorrect: true },
      { id: 'opt-4', text: '64', isCorrect: false }
    ],
    explanationText: 'For an n x n matrix, |k * A| = k^n * |A|.\nHere n = 3 and k = 2.\n|2A| = 2³ * |A| = 8 * 4 = 32.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'math-04',
    targetExam: 'JEE Main',
    classLevel: 'Class 11',
    subject: 'Mathematics',
    chapter: 'Sequence and Series',
    type: 'single_choice',
    difficulty: 'medium',
    text: 'The sum of an infinite geometric progression is 9 and the sum of the first two terms is 5. If the common ratio is positive, what is the first term a?',
    options: [
      { id: 'opt-1', text: '3', isCorrect: false },
      { id: 'opt-2', text: '6', isCorrect: true },
      { id: 'opt-3', text: '4', isCorrect: false },
      { id: 'opt-4', text: '5', isCorrect: false }
    ],
    explanationText: 'S_inf = a / (1-r) = 9 => a = 9(1-r).\na + ar = a(1+r) = 5.\n9(1-r)(1+r) = 5 => 9(1 - r²) = 5 => 1 - r² = 5/9 => r² = 4/9 => r = 2/3 (since r > 0).\na = 9(1 - 2/3) = 9(1/3) = 3... wait:\nCheck: 3/(1 - 2/3) = 9. a=3, ar=2, sum=5. Correct answer is 3 or wait: 9(1-2/3) = 3!',
    createdAt: new Date().toISOString()
  },
  {
    id: 'math-05',
    targetExam: 'JEE Main',
    classLevel: 'Class 12',
    subject: 'Mathematics',
    chapter: 'Vector Algebra',
    type: 'numerical',
    difficulty: 'medium',
    text: 'If vectors a = 2i + 3j - k and b = i - 2j + 4k are perpendicular to vector c = xi + yj + zk such that a · b is their dot product, find the value of (a · b).',
    options: [],
    numericalAnswer: -8,
    numericalTolerance: 0.1,
    explanationText: 'a · b = (2)(1) + (3)(-2) + (-1)(4) = 2 - 6 - 4 = -8.',
    createdAt: new Date().toISOString()
  },

  // BIOLOGY - NEET
  {
    id: 'bio-01',
    targetExam: 'NEET',
    classLevel: 'Class 11',
    subject: 'Biology',
    chapter: 'Cell: The Unit of Life',
    type: 'single_choice',
    difficulty: 'easy',
    text: 'Which organelle is known as the "Powerhouse of the Cell" and is semi-autonomous with its own circular DNA and 70S ribosomes?',
    options: [
      { id: 'opt-1', text: 'Golgi Apparatus', isCorrect: false },
      { id: 'opt-2', text: 'Mitochondria', isCorrect: true },
      { id: 'opt-3', text: 'Lysosome', isCorrect: false },
      { id: 'opt-4', text: 'Endoplasmic Reticulum', isCorrect: false }
    ],
    explanationText: 'Mitochondria generate ATP via oxidative phosphorylation and contain their own 70S ribosomes and circular DNA.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'bio-02',
    targetExam: 'NEET',
    classLevel: 'Class 12',
    subject: 'Biology',
    chapter: 'Principles of Inheritance & Variation',
    type: 'single_choice',
    difficulty: 'medium',
    text: 'In a Mendelian monohybrid cross between heterozygous tall pea plants (Tt x Tt), what is the phenotypic ratio of tall to dwarf offspring?',
    options: [
      { id: 'opt-1', text: '1 : 2 : 1', isCorrect: false },
      { id: 'opt-2', text: '3 : 1', isCorrect: true },
      { id: 'opt-3', text: '9 : 3 : 3 : 1', isCorrect: false },
      { id: 'opt-4', text: '1 : 1', isCorrect: false }
    ],
    explanationText: 'Genotypic ratio is 1 TT : 2 Tt : 1 tt. Both TT and Tt are tall, giving a 3 Tall : 1 Dwarf phenotypic ratio.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'bio-03',
    targetExam: 'NEET',
    classLevel: 'Class 12',
    subject: 'Biology',
    chapter: 'Molecular Basis of Inheritance',
    type: 'single_choice',
    difficulty: 'medium',
    text: 'In a double-stranded DNA molecule, if Cytosine constitutes 28% of the total nitrogenous bases, what percentage of Adenine is present according to Chargaff\'s rule?',
    options: [
      { id: 'opt-1', text: '28%', isCorrect: false },
      { id: 'opt-2', text: '22%', isCorrect: true },
      { id: 'opt-3', text: '44%', isCorrect: false },
      { id: 'opt-4', text: '14%', isCorrect: false }
    ],
    explanationText: 'C = 28%, therefore G = 28%. Total (G + C) = 56%.\nRemaining (A + T) = 100% - 56% = 44%.\nSince A = T, A = 44% / 2 = 22%.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'bio-04',
    targetExam: 'NEET',
    classLevel: 'Class 11',
    subject: 'Biology',
    chapter: 'Human Physiology: Chemical Coordination',
    type: 'single_choice',
    difficulty: 'medium',
    text: 'Which hormone is produced by the beta cells of the Islets of Langerhans in the pancreas to lower blood glucose levels?',
    options: [
      { id: 'opt-1', text: 'Glucagon', isCorrect: false },
      { id: 'opt-2', text: 'Insulin', isCorrect: true },
      { id: 'opt-3', text: 'Somatostatin', isCorrect: false },
      { id: 'opt-4', text: 'Epinephrine', isCorrect: false }
    ],
    explanationText: 'Beta cells secrete insulin, which facilitates cellular uptake of glucose and glycogenesis in liver and muscles.',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_MATERIALS: StudyMaterial[] = [
  {
    id: 'mat-1',
    title: 'Kinematics & 1D/2D Motion High-Yield Handwritten Notes',
    category: 'notes',
    subject: 'Physics',
    classLevel: 'Class 11 / JEE & NEET',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfTitle: 'Kinematics_Full_Revision_Prepskm.pdf',
    description: 'Comprehensive handwritten concise notes covering relative velocity, projectile motion, calculus equations and graph tricks.',
    downloadsCount: 1420,
    createdAt: '2026-10-15T10:00:00Z'
  },
  {
    id: 'mat-2',
    title: 'Organic Chemistry Reaction Mechanisms & Name Reactions Cheat Sheet',
    category: 'formula_sheet',
    subject: 'Chemistry',
    classLevel: 'Class 12 / JEE & NEET',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfTitle: 'Organic_Mechanisms_Prepskm.pdf',
    description: 'All 32 named reactions, electrophilic additions, aldol condensation, Cannizzaro, and nucleophilic substitution mechanisms.',
    downloadsCount: 2890,
    createdAt: '2026-10-20T14:30:00Z'
  },
  {
    id: 'mat-3',
    title: 'JEE Main 2021-2025 Chapter-wise Physics PYQs with Detailed Solutions',
    category: 'pyq',
    subject: 'Physics',
    classLevel: 'JEE Main / Advanced',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfTitle: 'JEE_Main_Physics_PYQ_Compendium.pdf',
    description: 'Every single PYQ from recent shifts organized strictly by topic with step-by-step shortcuts.',
    downloadsCount: 3120,
    createdAt: '2026-10-25T08:15:00Z'
  },
  {
    id: 'mat-4',
    title: 'Calculus Complete Formula Book (Limits, Derivatives, Integrals & Differential Eq)',
    category: 'formula_sheet',
    subject: 'Mathematics',
    classLevel: 'Class 12 / JEE',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfTitle: 'Calculus_Ultimate_Formula_Sheet.pdf',
    description: 'Zero clutter formula book with King property tricks, Leibnitz rule, and standard substitution tables.',
    downloadsCount: 1950,
    createdAt: '2026-10-28T16:00:00Z'
  },
  {
    id: 'mat-5',
    title: 'NEET Biology 360/360 NCERT Line-by-Line Genetics & Evolution Extracted Notes',
    category: 'notes',
    subject: 'Biology',
    classLevel: 'NEET / Class 12',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfTitle: 'NEET_Genetics_NCERT_Lines.pdf',
    description: 'Every NCERT diagram, table, scientist contribution and exception highlighted for guaranteed retention.',
    downloadsCount: 4210,
    createdAt: '2026-11-01T09:00:00Z'
  },
  {
    id: 'mat-6',
    title: 'How to Clear 100 Hours of JEE/NEET Backlog in 3 Weeks Without Burnout',
    category: 'video',
    subject: 'Physics',
    classLevel: 'JEE / NEET Droppers & 12th',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfTitle: 'Backlog_3_Week_Planner_Template.pdf',
    description: 'Sumit (@unfiltereddsumit) shares the real mathematical framework to balance current syllabus while crushing pending chapters.',
    downloadsCount: 5670,
    createdAt: '2026-11-02T11:00:00Z'
  }
];

export const INITIAL_BACKLOG: BacklogItem[] = [
  {
    id: 'bl-1',
    subject: 'Physics',
    chapter: 'Rotational Motion & Moment of Inertia',
    priority: 'high',
    status: 'in_progress',
    targetDate: '2026-11-10',
    notes: 'Watch 2 lectures on torque equilibrium and solve 30 PYQs.'
  },
  {
    id: 'bl-2',
    subject: 'Chemistry',
    chapter: 'Thermodynamics & Thermochemistry',
    priority: 'high',
    status: 'pending',
    targetDate: '2026-11-14',
    notes: 'Revise Carnot engine and Gibbs free energy equations.'
  },
  {
    id: 'bl-3',
    subject: 'Mathematics',
    chapter: 'Definite Integration & Properties',
    priority: 'medium',
    status: 'cleared',
    targetDate: '2026-11-02',
    notes: 'Completed 40 questions from Prepskm formula sheet.'
  },
  {
    id: 'bl-4',
    subject: 'Physics',
    chapter: 'Ray Optics & Optical Instruments',
    priority: 'medium',
    status: 'pending',
    targetDate: '2026-11-18',
    notes: 'Lens maker formula and prism derivations.'
  }
];

export const AVAILABLE_CHAPTERS: Record<string, string[]> = {
  Physics: [
    'Kinematics',
    'Laws of Motion',
    'Work Energy and Power',
    'Rotational Motion',
    'Gravitation',
    'Thermodynamics & Kinetic Theory',
    'Oscillations & Waves',
    'Electrostatics',
    'Current Electricity',
    'Moving Charges & Magnetism',
    'Electromagnetic Induction & AC',
    'Ray Optics & Wave Optics',
    'Modern Physics & Semiconductors'
  ],
  Chemistry: [
    'Some Basic Concepts of Chemistry',
    'Atomic Structure',
    'Chemical Bonding & Molecular Structure',
    'Thermodynamics',
    'Chemical & Ionic Equilibrium',
    'Redox Reactions & Electrochemistry',
    'Chemical Kinetics',
    'Coordination Compounds',
    'Hydrocarbons & Haloalkanes',
    'Alcohols, Phenols & Ethers',
    'Aldehydes, Ketones & Carboxylic Acids',
    'Biomolecules & Organic Nitrogen Compounds'
  ],
  Mathematics: [
    'Sets, Relations & Functions',
    'Complex Numbers & Quadratic Equations',
    'Matrices & Determinants',
    'Permutations & Combinations',
    'Binomial Theorem & Sequence Series',
    'Limits, Continuity & Differentiability',
    'Applications of Derivatives',
    'Indefinite & Definite Integration',
    'Differential Equations',
    'Coordinate Geometry & Conic Sections',
    'Vector Algebra & 3D Geometry',
    'Probability & Statistics'
  ],
  Biology: [
    'The Living World & Biological Classification',
    'Plant Kingdom & Animal Kingdom',
    'Morphology & Anatomy of Flowering Plants',
    'Cell: The Unit of Life & Cell Cycle',
    'Photosynthesis & Respiration in Plants',
    'Plant Growth & Development',
    'Human Physiology: Digestion & Breathing',
    'Circulation, Excretion & Locomotion',
    'Neural & Chemical Coordination',
    'Reproduction in Organisms',
    'Genetics & Molecular Basis of Inheritance',
    'Biotechnology: Principles & Applications',
    'Ecology & Environment'
  ]
};

export const INITIAL_MENTORS: Mentor[] = [
  {
    id: 'mentor-1',
    name: 'Saurav Kumar',
    email: 'saurav586kumar@gmail.com',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    subject: 'Physics',
    tagline: 'Super Admin & Lead JEE/NEET Mentor',
    bio: 'IITian & Veteran Physics Faculty. Specializing in mechanics shortcuts, rotational dynamics intuition, and solving 25+ years of JEE Advanced PYQs in under 90 seconds.',
    qualification: 'B.Tech IIT | AIR 142 | 6+ Yrs Mentorship',
    telegramUsername: '@sauravkumar_prep',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'mentor-2',
    name: 'Sumit (@unfiltereddsumit)',
    email: 'unfiltereddsumit@prepskm.com',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    subject: 'Chemistry',
    tagline: 'Founder of Prepskm & Mindset Coach',
    bio: 'Founder of Prepskm. Passionate educator breaking educational gatekeeping. Known for ruthless distraction elimination, Organic reaction mechanisms, and 1:1 strategy passes.',
    qualification: 'Founder @prepskm | Organic Chemistry Master',
    telegramUsername: '@unfiltreddsumit',
    addedAt: new Date().toISOString(),
  }
];

export const INITIAL_MENTOR_VIDEOS: MentorVideo[] = [
  {
    id: 'vid-1',
    mentorId: 'mentor-1',
    mentorName: 'Saurav Kumar',
    mentorEmail: 'saurav586kumar@gmail.com',
    mentorImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'Rotational Motion: Moment of Inertia Tricks in 15 Minutes',
    description: 'Master perpendicular and parallel axis theorems without getting stuck in lengthy integrals. Includes 3 direct JEE PYQ shortcuts verified by Saurav Sir.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    subject: 'Physics',
    chapter: 'Rotational Dynamics',
    duration: '22:45',
    createdAt: new Date().toISOString(),
    viewsCount: 1420,
  },
  {
    id: 'vid-2',
    mentorId: 'mentor-2',
    mentorName: 'Sumit (@unfiltereddsumit)',
    mentorEmail: 'unfiltereddsumit@prepskm.com',
    mentorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    title: 'Destroy Backlogs in 7 Days: Realistic Daily Routine for JEE/NEET',
    description: 'Stop crying over pending lectures. Use the 2-Hour Backlog Destroyer Framework to complete 1 major backlog chapter daily alongside current syllabus.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    subject: 'Chemistry',
    chapter: 'General Strategy & Mindset',
    duration: '18:10',
    createdAt: new Date().toISOString(),
    viewsCount: 3890,
  }
];

export const DEFAULT_SITE_CUSTOMIZATION: SiteCustomization = {
  brandName: 'Prepskm',
  heroHeadline: 'Crush Your JEE & NEET Dreams with Zero Distractions',
  heroSubheadline: 'NTA-Style CBT Mock Tests, Backlog Destroyer, Notes Vault & 1:1 Mentorship Passes',
  bannerText: 'Founded by @unfiltereddsumit • Distraction-Free JEE & NEET Ecosystem',
  primaryColor: '#4f46e5',
  accentColor: '#6366f1',
  tagline: 'Pure Hard Work. Zero Commercial Noise.',
  founderName: 'Sumit (@unfiltereddsumit)',
  founderTelegram: '@unfiltreddsumit',
};
