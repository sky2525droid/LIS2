import { TestCategory, TubeType } from '../types';

export const testData: TestCategory[] = [
    {
        category: 'الكيمياء السريرية',
        groups: [
            {
                name: 'الشحوم (Lipid Profile)',
                price: 15000,
                tubeType: TubeType.Serum,
                tests: [
                    { name: 'Triglycerides', abbreviation: 'TG', normalRange: '< 150 mg/dL', price: 4000 },
                    { name: 'Total Cholesterol', abbreviation: 'TC', normalRange: '< 200 mg/dL', price: 4000 },
                    { name: 'HDL Cholesterol', normalRange: '> 40 mg/dL', price: 4500 },
                    { name: 'LDL Cholesterol', normalRange: '< 100 mg/dL', price: 4500 }
                ]
            },
            {
                name: 'وظائف الكلى (Kidney Function)',
                price: 22000,
                tubeType: TubeType.Serum,
                tests: [
                    { name: 'Urea', normalRange: '15-45 mg/dL', price: 5000 },
                    { name: 'Creatinine', normalRange: '0.6-1.2 mg/dL', price: 5000 },
                    { name: 'Uric Acid', normalRange: '3.5-7.2 mg/dL', price: 5000 },
                    { name: 'Sodium', abbreviation: 'Na', normalRange: '135-145 mEq/L', price: 4000 },
                    { name: 'Potassium', abbreviation: 'K', normalRange: '3.5-5.0 mEq/L', price: 4000 },
                ]
            },
            {
                name: 'وظائف الكبد (Liver Function)',
                price: 35000,
                tubeType: TubeType.Serum,
                tests: [
                    { name: 'Alanine Aminotransferase', abbreviation: 'ALT', normalRange: '7-56 U/L' },
                    { name: 'Aspartate Aminotransferase', abbreviation: 'AST', normalRange: '10-40 U/L' },
                    { name: 'Alkaline Phosphatase', abbreviation: 'ALP', normalRange: '44-147 U/L' },
                    { name: 'Total Bilirubin', normalRange: '0.1-1.2 mg/dL' },
                    { name: 'Direct Bilirubin', normalRange: '0.0-0.3 mg/dL' },
                    { name: 'Total Protein', normalRange: '6.0-8.3 g/dL' },
                    { name: 'Albumin', normalRange: '3.4-5.4 g/dL' },
                ]
            },
            {
                name: 'السكريات (Glucose)',
                tubeType: TubeType.Serum,
                tests: [
                    { name: 'Fasting Blood Sugar', abbreviation: 'FBS', normalRange: '70-99 mg/dL', price: 3500 },
                    { name: 'Postprandial Blood Sugar', abbreviation: 'PPBS', normalRange: '< 140 mg/dL', price: 3500 },
                    { name: 'HbA1c', normalRange: '4.0-5.6%', price: 12000, tubeType: TubeType.EDTA },
                    { name: 'Random Blood Sugar', abbreviation: 'RBS', normalRange: '70-125 mg/dL', price: 3500 },
                ]
            },
            {
                name: 'إنزيمات القلب (Cardiac Enzymes)',
                tubeType: TubeType.Serum,
                tests: [
                    { name: 'Creatine Kinase', abbreviation: 'CK-MB', normalRange: '5-25 IU/L' },
                    { name: 'Troponin I', normalRange: '< 0.04 ng/mL' },
                ]
            },
            {
                name: 'المعادن والإنزيمات (Minerals & Enzymes)',
                tubeType: TubeType.Serum,
                tests: [
                    { name: 'Calcium', normalRange: '8.6-10.3 mg/dL' },
                    { name: 'Magnesium', normalRange: '1.7-2.2 mg/dL' },
                    { name: 'Phosphorus', normalRange: '2.5-4.5 mg/dL' },
                    { name: 'Amylase', normalRange: '23-85 U/L' },
                    { name: 'Lipase', normalRange: '0-160 U/L' },
                ]
            }
        ]
    },
    {
        category: 'الدمويات (Hematology)',
        groups: [
            {
                name: 'تعداد الدم الكامل (CBC)',
                price: 9000,
                tubeType: TubeType.EDTA,
                isProfile: true,
                tests: [
                    { name: 'تعداد الكريات البيض (WBC)', abbreviation: 'WBC', normalRange: '4.0 - 11.0 x 10³/µL' },
                    { name: 'العدلات % (Neutrophils %)', abbreviation: 'NEUT%', normalRange: '40 - 75 %' },
                    { name: 'اللمفاويات % (Lymphocytes %)', abbreviation: 'LYMPH%', normalRange: '20 - 45 %' },
                    { name: 'الوحيدات % (Monocytes %)', abbreviation: 'MONO%', normalRange: '2 - 10 %' },
                    { name: 'الحمضات % (Eosinophils %)', abbreviation: 'EOS%', normalRange: '1 - 6 %' },
                    { name: 'القعدات % (Basophils %)', abbreviation: 'BASO%', normalRange: '0 - 1 %' },
                    { name: 'المحببات غير الناضجة % (IG%)', abbreviation: 'IG%', normalRange: '0 - 0.6 %' },
                    { name: 'عدد العدلات (Neutrophils Count)', abbreviation: 'NEUT#', normalRange: '1.8 - 7.7 x 10³/µL' },
                    { name: 'عدد اللمفاويات (Lymphocytes Count)', abbreviation: 'LYMPH#', normalRange: '1.0 - 4.8 x 10³/µL' },
                    { name: 'عدد الوحيدات (Monocytes Count)', abbreviation: 'MONO#', normalRange: '0.2 - 0.8 x 10³/µL' },
                    { name: 'عدد الحمضات (Eosinophils Count)', abbreviation: 'EOS#', normalRange: '0.02 - 0.5 x 10³/µL' },
                    { name: 'عدد القعدات (Basophils Count)', abbreviation: 'BASO#', normalRange: '0.01 - 0.1 x 10³/µL' },
                    { name: 'عدد المحببات غير الناضجة (IG#)', abbreviation: 'IG#', normalRange: '0 - 0.03 x 10³/µL' },
                    { name: 'تعداد الكريات الحمراء (RBC)', abbreviation: 'RBC', normalRange: '4.5 - 5.9 x 10⁶/µL' },
                    { name: 'الهيموغلوبين (HGB)', abbreviation: 'HGB', normalRange: '13.5 - 17.5 g/dL' },
                    { name: 'الهيماتوكريت (HCT)', abbreviation: 'HCT', normalRange: '41 - 53 %' },
                    { name: 'متوسط حجم الكرية (MCV)', abbreviation: 'MCV', normalRange: '80 - 100 fL' },
                    { name: 'متوسط هيموغلوبين الكرية (MCH)', abbreviation: 'MCH', normalRange: '27 - 32 pg' },
                    { name: 'تركيز هيموغلوبين الكرية (MCHC)', abbreviation: 'MCHC', normalRange: '32 - 36 g/dL' },
                    { name: 'سعة توزيع الكريات الحمراء (RDW-CV)', abbreviation: 'RDW-CV', normalRange: '11.5 - 14.5 %' },
                    { name: 'سعة توزيع الكريات الحمراء (RDW-SD)', abbreviation: 'RDW-SD', normalRange: '39 - 46 fL' },
                    { name: 'الصفيحات الدموية (PLT)', abbreviation: 'PLT', normalRange: '150 - 450 x 10³/µL' },
                    { name: 'متوسط حجم الصفيحات (MPV)', abbreviation: 'MPV', normalRange: '7.4 - 10.4 fL' },
                    { name: 'سعة توزيع الصفيحات (PDW)', abbreviation: 'PDW', normalRange: '9.0 - 17.0 fL' },
                    { name: 'الهيماتوكريت الصفيحي (PCT)', abbreviation: 'PCT', normalRange: '0.15 - 0.40 %' },
                    { name: 'نسبة الخلايا الصفيحية الكبيرة (P-LCR)', abbreviation: 'P-LCR', normalRange: '13 - 43 %' },
                    { name: 'عدد الخلايا الصفيحية الكبيرة (P-LCC)', abbreviation: 'P-LCC', normalRange: '30 - 90 x 10³/µL' },
                ]
            },
            {
                name: 'تخثر الدم (Coagulation)',
                tubeType: TubeType.Citrate,
                tests: [
                    { name: 'Prothrombin Time', abbreviation: 'PT', normalRange: '11-13.5 sec' },
                    { name: 'Partial Thromboplastin Time', abbreviation: 'PTT', normalRange: '25-35 sec' },
                    { name: 'INR', normalRange: '0.8-1.1' },
                ]
            },
            {
                name: 'فصيلة الدم',
                tubeType: TubeType.EDTA,
                tests: [
                    { name: 'Blood Grouping', abbreviation: 'ABO & Rh', normalRange: 'N/A', price: 8000 },
                ]
            },
            {
                name: 'مؤشرات الالتهاب',
                 tubeType: TubeType.EDTA,
                 tests: [
                    { name: 'Erythrocyte Sedimentation Rate', abbreviation: 'ESR', normalRange: '0-22 mm/hr' },
                ]
            }
        ]
    },
    {
        category: 'الهرمونات (Hormones)',
        groups: [
            {
                name: 'وظائف الغدة الدرقية (Thyroid)',
                price: 28000,
                tubeType: TubeType.Serum,
                tests: [
                    { name: 'Thyroid-Stimulating Hormone', abbreviation: 'TSH', normalRange: '0.4-4.0 mIU/L' },
                    { name: 'Free Triiodothyronine', abbreviation: 'FT3', normalRange: '2.0-4.4 pg/mL' },
                    { name: 'Free Thyroxine', abbreviation: 'FT4', normalRange: '0.8-1.8 ng/dL' }
                ]
            },
            {
                name: 'الهرمونات التناسلية (Reproductive)',
                tubeType: TubeType.Serum,
                tests: [
                    { name: 'Follicle-Stimulating Hormone', abbreviation: 'FSH', normalRange: 'Varies (mIU/mL)' },
                    { name: 'Luteinizing Hormone', abbreviation: 'LH', normalRange: 'Varies (mIU/mL)' },
                    { name: 'Progesterone', normalRange: 'Varies (ng/mL)' },
                    { name: 'Estradiol', abbreviation: 'E2', normalRange: 'Varies (pg/mL)' },
                    { name: 'Testosterone', normalRange: 'Varies (ng/dL)' },
                    { name: 'Prolactin', normalRange: '< 20 ng/mL' },
                ]
            }
        ]
    },
    {
        category: 'المناعيات والأمصال',
        groups: [
            {
                name: 'علامات الالتهاب (Inflammation)',
                tubeType: TubeType.Serum,
                tests: [
                    { name: 'C-Reactive Protein', abbreviation: 'CRP', normalRange: '< 1.0 mg/dL' },
                    { name: 'Rheumatoid Factor', abbreviation: 'RF', normalRange: '< 14 IU/mL' }
                ]
            },
            {
                name: 'الفيروسات (Virology)',
                tubeType: TubeType.Serum,
                tests: [
                    { name: 'Hepatitis B Surface Antigen', abbreviation: 'HBsAg', normalRange: 'Negative' },
                    { name: 'Hepatitis C Virus Antibodies', abbreviation: 'HCV Ab', normalRange: 'Negative' },
                    { name: 'HIV 1/2 Antibodies', normalRange: 'Negative' },
                ]
            },
             {
                name: 'علامات الأورام (Tumor Markers)',
                tubeType: TubeType.Serum,
                tests: [
                    { name: 'Prostate-Specific Antigen', abbreviation: 'PSA', normalRange: '< 4.0 ng/mL' },
                    { name: 'Carcinoembryonic Antigen', abbreviation: 'CEA', normalRange: '< 5.0 ng/mL' },
                ]
            }
        ]
    },
    {
        category: 'تحليل البول (Urine Analysis)',
        groups: [
            {
                name: 'الفحص الروتيني',
                abbreviation: 'Urine R/E',
                price: 4000,
                tubeType: TubeType.Urine,
                isProfile: true,
                tests: [
                    { name: 'Color', normalRange: 'Yellow' },
                    { name: 'Appearance', normalRange: 'Clear' },
                    { name: 'pH', normalRange: '4.5-8.0' },
                    { name: 'Specific Gravity', normalRange: '1.005-1.030' },
                    { name: 'Protein', normalRange: 'Negative (<15 mg/dL)' },
                    { name: 'Glucose', normalRange: 'Negative (<30 mg/dL)' },
                    { name: 'Ketones', normalRange: 'Negative (<5 mg/dL)' },
                    { name: 'Blood', normalRange: 'Negative (0-2 RBCs/HPF)' },
                    { name: 'Leukocytes (WBCs)', normalRange: 'Negative (0-5 WBCs/HPF)'},
                ]
            }
        ]
    }
];
