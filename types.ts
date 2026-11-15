export enum Gender {
    Male = 'ذكر',
    Female = 'أنثى',
}

export interface Patient {
    id: number;
    name: string;
    dob: string;
    gender: Gender;
    phone: string;
    registrationDate: string;
}

export enum TestStatus {
    Pending = 'قيد الانتظار',
    SampleCollected = 'تم سحب العينة',
    Completed = 'مكتمل',
    Approved = 'معتمدة',
    Delivered = 'تم تسليم النتيجة',
    Cancelled = 'ملغي',
}

export enum PaymentStatus {
    Unpaid = 'غير مدفوع',
    PartiallyPaid = 'مدفوع جزئياً',
    Paid = 'مدفوع بالكامل',
}

export enum TubeType {
    EDTA = 'EDTA ( بنفسجي )',
    Serum = 'Serum ( أحمر )',
    Citrate = 'Citrate ( أزرق سماوي )',
    Urine = 'Urine ( وعاء عينة )',
}

export interface TestOrder {
    id: number;
    patientId: number;
    patientName: string;
    testName: string;
    normalRange?: string;
    orderDate: string;
    status: TestStatus;
    result: string | null;
    totalPrice: number;
    discount: number;
    discountPercentage?: number;
    paidAmount: number;
    paymentStatus: PaymentStatus;
    isAutoApproved?: boolean;
    referringDoctor?: string;
    isProfile?: boolean;
    subTests?: { name: string; normalRange: string }[];
    notes?: string;
}

export type Page = 'dashboard' | 'patients' | 'orders' | 'tests' | 'settings' | 'sampleCollection' | 'results' | 'qualityControl' | 'statistics' | 'financials' | 'workflow' | 'reagents';

export interface GroundingChunk {
    web: {
        uri: string;
        title: string;
    };
}

export interface Test {
    name: string;
    abbreviation?: string;
    shortcut?: string;
    normalRange: string;
    price?: number;
    units?: number;
    tubeType?: TubeType;
}

export interface TestGroup {
    name: string;
    abbreviation?: string;
    shortcut?: string;
    tests: Test[];
    price?: number;
    units?: number;
    tubeType?: TubeType;
    isProfile?: boolean;
}

export interface TestCategory {
    category: string;
    groups: TestGroup[];
}

export interface HL7Settings {
    enabled: boolean;
    ipAddress: string;
    port: number;
}

export interface LabSettings {
    labName: string;
    address: string;
    phone: string;
    labDirector: string;
    accountantName: string;
    qcDoctor: string;
    technician: string;
    logoUrl?: string;
    headerColor: string;
    // New report design settings
    logoSize: number; // in pixels
    fontFamily: string;
    labNameFontSize: number; // in rem
    patientNameFontSize: number; // in rem
    resultsFontSize: number; // in rem
    showPreviousResults: boolean;
    unitPrice: number;
}

export interface FavoriteGroup {
    id: string;
    name: string;
    testNames: string[];
}

export interface Reagent {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    minQuantity: number;
    expiryDate: string;
    supplier: string;
    lastUpdated: string;
}
