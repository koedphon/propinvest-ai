import fs from 'fs';
import path from 'path';

export interface PaymentSettings {
  promptpayId: string; // Phone or Citizen ID (e.g. 0812345678)
  promptpayName: string; // Account Holder Name
  bankName: string; // Bank name (e.g. ธนาคารกสิกรไทย, ไทยพาณิชย์)
  bankAccountNumber: string; // Account Number
  bankAccountHolder: string; // Account Name
  enablePromptPay: boolean;
  enableStripe: boolean;
  standardPriceThb: number; // 150
  proPriceThb: number; // 299
  referralCommissionPercent: number; // 20%
}

export interface TransactionRecord {
  id: string;
  customerEmail: string;
  customerName: string;
  planTier: 'STANDARD' | 'PRO';
  amountThb: number;
  paymentMethod: 'STRIPE_CARD' | 'PROMPTPAY_QR' | 'BANK_TRANSFER';
  status: 'COMPLETED' | 'PENDING_VERIFICATION' | 'CANCELLED';
  slipImage?: string;
  referenceNo: string;
  createdAt: string;
  referrerEmail?: string;
  notes?: string;
}

export interface ContractorLead {
  id: string;
  contractorId: string;
  contractorName: string;
  customerName: string;
  customerPhone: string;
  customerLineId?: string;
  propertyLocation?: string;
  propertyType?: string;
  areaSizeSqWa?: number;
  scopeOfWork?: string;
  notes?: string;
  status: 'NEW' | 'CONTACTED' | 'IN_PROGRESS' | 'CLOSED';
  createdAt: string;
}

export interface SystemAnnouncement {
  enabled: boolean;
  message: string;
  level: 'info' | 'warning' | 'success';
  updatedAt: string;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  actor: string;
  details: string;
  timestamp: string;
}

export interface AppUserRecord {
  id: string;
  email: string;
  name: string;
  planTier: 'FREE' | 'STANDARD' | 'PRO' | 'VIP';
  quotaMonthly: number;
  scansUsed: number;
  joinedAt: string;
  status: 'ACTIVE' | 'SUSPENDED';
  isVip: boolean;
  totalSpentThb: number;
  notes?: string;
}

export interface RevenueData {
  settings: PaymentSettings;
  transactions: TransactionRecord[];
  users: AppUserRecord[];
  leads: ContractorLead[];
  announcement: SystemAnnouncement;
  logs: AdminAuditLog[];
}

const REVENUE_FILE = path.resolve(process.cwd(), 'server', 'revenue_store.json');

const defaultRevenueData: RevenueData = {
  settings: {
    promptpayId: '081-234-5678',
    promptpayName: 'PropInvest Admin',
    bankName: 'ธนาคารกสิกรไทย (KBANK)',
    bankAccountNumber: '045-8-12345-6',
    bankAccountHolder: 'ชื่อบัญชีผู้รับเงิน (แก้ในหลังบ้าน)',
    enablePromptPay: true,
    enableStripe: true,
    standardPriceThb: 150,
    proPriceThb: 299,
    referralCommissionPercent: 20,
  },
  transactions: [
    {
      id: 'tx_demo_01',
      customerEmail: 'user1@example.com',
      customerName: 'สมหญิง อสังหาฯ พระราม 9',
      planTier: 'PRO',
      amountThb: 299,
      paymentMethod: 'STRIPE_CARD',
      status: 'COMPLETED',
      referenceNo: 'TXN-STRIPE-8921',
      createdAt: new Date(Date.now() - 86400000 * 2).toLocaleDateString('th-TH'),
    },
    {
      id: 'tx_demo_02',
      customerEmail: 'user2@example.com',
      customerName: 'วิทยา ที่ดินชลบุรี-ระยอง',
      planTier: 'STANDARD',
      amountThb: 150,
      paymentMethod: 'PROMPTPAY_QR',
      status: 'COMPLETED',
      referenceNo: 'TXN-PP-4512',
      createdAt: new Date(Date.now() - 86400000 * 1).toLocaleDateString('th-TH'),
    },
    {
      id: 'tx_demo_03',
      customerEmail: 'user3@example.com',
      customerName: 'ชุติมา Property Consultant',
      planTier: 'PRO',
      amountThb: 299,
      paymentMethod: 'PROMPTPAY_QR',
      status: 'COMPLETED',
      referenceNo: 'TXN-PP-9901',
      createdAt: new Date().toLocaleDateString('th-TH'),
    },
    {
      id: 'tx_demo_04',
      customerEmail: 'user4@example.com',
      customerName: 'ธีรวัฒน์ นายหน้ามือทอง',
      planTier: 'PRO',
      amountThb: 299,
      paymentMethod: 'PROMPTPAY_QR',
      status: 'PENDING_VERIFICATION',
      referenceNo: 'TXN-PP-1044',
      createdAt: new Date().toLocaleDateString('th-TH'),
      notes: 'แนบสลิปผ่านพร้อมเพย์ โอนยอด 299.00 บาท รอแอดมินยืนยัน',
    },
  ],
  users: [
    {
      id: 'usr_admin_01',
      email: 'user5@example.com',
      name: 'Super Admin & Owner',
      planTier: 'VIP',
      quotaMonthly: 999999,
      scansUsed: 142,
      joinedAt: '01/09/2569',
      status: 'ACTIVE',
      isVip: true,
      totalSpentThb: 0,
      notes: 'ผู้ก่อตั้งระบบ / เจ้าของสิทธิ์ไม่จำกัดตลอดชีพ',
    },
    {
      id: 'usr_admin_02',
      email: 'user6@example.com',
      name: '(Founder)',
      planTier: 'VIP',
      quotaMonthly: 999999,
      scansUsed: 88,
      joinedAt: '01/09/2569',
      status: 'ACTIVE',
      isVip: true,
      totalSpentThb: 0,
      notes: 'ผู้ก่อตั้งระบบ / บัญชีหลัก',
    },
    {
      id: 'usr_cust_01',
      email: 'user1@example.com',
      name: 'สมหญิง อสังหาฯ พระราม 9',
      planTier: 'PRO',
      quotaMonthly: 400,
      scansUsed: 189,
      joinedAt: '15/09/2569',
      status: 'ACTIVE',
      isVip: false,
      totalSpentThb: 897,
    },
    {
      id: 'usr_cust_02',
      email: 'user2@example.com',
      name: 'วิทยา ที่ดินชลบุรี-ระยอง',
      planTier: 'STANDARD',
      quotaMonthly: 100,
      scansUsed: 62,
      joinedAt: '28/09/2569',
      status: 'ACTIVE',
      isVip: false,
      totalSpentThb: 300,
    },
    {
      id: 'usr_cust_03',
      email: 'user3@example.com',
      name: 'ชุติมา Property Consultant',
      planTier: 'PRO',
      quotaMonthly: 500,
      scansUsed: 215,
      joinedAt: '02/10/2569',
      status: 'ACTIVE',
      isVip: false,
      totalSpentThb: 598,
    },
    {
      id: 'usr_cust_04',
      email: 'user4@example.com',
      name: 'ธีรวัฒน์ นายหน้ามือทอง',
      planTier: 'FREE',
      quotaMonthly: 10,
      scansUsed: 10,
      joinedAt: '10/10/2569',
      status: 'ACTIVE',
      isVip: false,
      totalSpentThb: 0,
      notes: 'โควตาฟรีหมดแล้ว อยู่ระหว่างรอตรวจสอบสลิป Pro',
    },
  ],
  leads: [
    {
      id: 'lead_01',
      contractorId: 'c1',
      contractorName: 'บริษัท ทีแอนด์พี โฮมบิวเดอร์ จำกัด',
      customerName: 'คุณภานุเดช',
      customerPhone: '081-445-6677',
      customerLineId: 'panudet.p',
      propertyLocation: 'กรุงเทพมหานคร ประเวศ',
      propertyType: 'บ้านเดี่ยว',
      areaSizeSqWa: 75,
      scopeOfWork: 'รีโนเวททั้งหลัง (Full Renovation)',
      notes: 'ต้องการปรับปรุงระบบท่อประปา ปูกระเบื้องใหม่ และทาสีทั้งหลัง',
      status: 'IN_PROGRESS',
      createdAt: '18/10/2569',
    },
    {
      id: 'lead_02',
      contractorId: 'c2',
      contractorName: 'สยามรีโนเวชั่น & ดีไซน์ สตูดิโอ',
      customerName: 'คุณวรัญญา',
      customerPhone: '089-223-1199',
      customerLineId: 'waranya.estate',
      propertyLocation: 'นนทบุรี บางกรวย',
      propertyType: 'ทาวน์โฮม',
      areaSizeSqWa: 28,
      scopeOfWork: 'ต่อเติมครัวหลังบ้านและหลังคาโรงรถ',
      notes: 'ลงเสาเข็มไมโครไพล์ I-18 ครัวหลังบ้าน',
      status: 'CONTACTED',
      createdAt: '19/10/2569',
    },
    {
      id: 'lead_03',
      contractorId: 'c3',
      contractorName: 'บริษัท บางกอก ซิวิล คอนสตรัคชั่น กรุ๊ป จำกัด',
      customerName: 'คุณเกียรติศักดิ์',
      customerPhone: '092-334-5566',
      customerLineId: 'kiat.prop',
      propertyLocation: 'กรุงเทพมหานคร วัฒนา',
      propertyType: 'คอนโดมิเนียม',
      areaSizeSqWa: 18,
      scopeOfWork: 'งานตกแต่งภายใน Built-in',
      notes: 'งานบิลท์อินห้องนอนและห้องรับแขก',
      status: 'NEW',
      createdAt: '20/10/2569',
    },
  ],
  announcement: {
    enabled: true,
    message: '✨ อัปเดตใหม่: เชื่อมต่อ AI Vision OCR สกัดข้อมูลป้ายอสังหาฯ และคำนวณสินเชื่อเปรียบเทียบ 5 ธนาคารชั้นนำอัตโนมัติ!',
    level: 'info',
    updatedAt: new Date().toLocaleDateString('th-TH'),
  },
  logs: [
    {
      id: 'log_01',
      action: 'ADMIN_LOGIN',
      actor: 'user5@example.com',
      details: 'เข้าสู่ระบบหลังร้าน Super Admin Dashboard เรียบร้อยแล้ว',
      timestamp: new Date().toLocaleTimeString('th-TH') + ' ' + new Date().toLocaleDateString('th-TH'),
    },
    {
      id: 'log_02',
      action: 'PAYMENT_RECEIVED',
      actor: 'user4@example.com',
      details: 'แจ้งชำระเงิน PromptPay QR ยอด 299 บาท (TXN-PP-1044)',
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString('th-TH') + ' ' + new Date().toLocaleDateString('th-TH'),
    },
    {
      id: 'log_03',
      action: 'OCR_SCAN',
      actor: 'user3@example.com',
      details: 'สแกนป้ายประกาศขายที่ดิน ย่านบางนา ด้วย Gemini 2.5 Flash',
      timestamp: new Date(Date.now() - 7200000).toLocaleTimeString('th-TH') + ' ' + new Date().toLocaleDateString('th-TH'),
    },
  ],
};

function loadRevenueData(): RevenueData {
  try {
    if (fs.existsSync(REVENUE_FILE)) {
      const raw = fs.readFileSync(REVENUE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        ...defaultRevenueData,
        ...parsed,
        settings: { ...defaultRevenueData.settings, ...(parsed.settings || {}) },
        transactions: parsed.transactions || defaultRevenueData.transactions,
        users: parsed.users || defaultRevenueData.users,
        leads: parsed.leads || defaultRevenueData.leads,
        announcement: parsed.announcement || defaultRevenueData.announcement,
        logs: parsed.logs || defaultRevenueData.logs,
      };
    }
  } catch (e) {
    console.warn('Could not read revenue_store.json, using defaults:', e);
  }
  return defaultRevenueData;
}

function saveRevenueData(data: RevenueData): void {
  try {
    fs.writeFileSync(REVENUE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write revenue_store.json:', e);
  }
}

let revenueState: RevenueData = loadRevenueData();

export const getPaymentSettings = (): PaymentSettings => {
  return revenueState.settings;
};

export const updatePaymentSettings = (newSettings: Partial<PaymentSettings>): PaymentSettings => {
  revenueState.settings = {
    ...revenueState.settings,
    ...newSettings,
  };
  addAuditLog('SETTINGS_UPDATE', 'admin', 'อัปเดตข้อมูลช่องทางรับเงินและการกำหนดราคา');
  saveRevenueData(revenueState);
  return revenueState.settings;
};

export const recordTransaction = (tx: Omit<TransactionRecord, 'id' | 'createdAt'>): TransactionRecord => {
  const newTx: TransactionRecord = {
    ...tx,
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toLocaleDateString('th-TH'),
  };
  revenueState.transactions.unshift(newTx);
  addAuditLog('TXN_CREATE', tx.customerEmail, `สร้างรายการชำระเงิน ${tx.planTier} ยอด ฿${tx.amountThb}`);
  saveRevenueData(revenueState);
  return newTx;
};

export const updateTransactionStatus = (
  id: string,
  status: 'COMPLETED' | 'PENDING_VERIFICATION' | 'CANCELLED',
  notes?: string
) => {
  const tx = revenueState.transactions.find((t) => t.id === id);
  if (!tx) return null;
  tx.status = status;
  if (notes) tx.notes = notes;

  // If approved to COMPLETED, ensure customer user account is upgraded
  if (status === 'COMPLETED') {
    const user = revenueState.users.find((u) => u.email.toLowerCase() === tx.customerEmail.toLowerCase());
    if (user) {
      user.planTier = tx.planTier;
      user.quotaMonthly = tx.planTier === 'PRO' ? 400 : 100;
      user.totalSpentThb += tx.amountThb;
    } else {
      revenueState.users.push({
        id: `usr_${Date.now()}`,
        email: tx.customerEmail,
        name: tx.customerName,
        planTier: tx.planTier,
        quotaMonthly: tx.planTier === 'PRO' ? 400 : 100,
        scansUsed: 0,
        joinedAt: new Date().toLocaleDateString('th-TH'),
        status: 'ACTIVE',
        isVip: false,
        totalSpentThb: tx.amountThb,
      });
    }
  }

  addAuditLog('TXN_STATUS', 'admin', `อัปเดตสถานะ ${tx.referenceNo} เป็น ${status}`);
  saveRevenueData(revenueState);
  return tx;
};

export const deleteTransaction = (id: string) => {
  revenueState.transactions = revenueState.transactions.filter((t) => t.id !== id);
  addAuditLog('TXN_DELETE', 'admin', `ลบรายการธุรกรรม ${id}`);
  saveRevenueData(revenueState);
  return true;
};

export const getAllUsers = (): AppUserRecord[] => {
  return revenueState.users;
};

export const updateUserRecord = (id: string, updates: Partial<AppUserRecord>): AppUserRecord | null => {
  const user = revenueState.users.find((u) => u.id === id || u.email.toLowerCase() === id.toLowerCase());
  if (!user) return null;
  Object.assign(user, updates);
  addAuditLog('USER_UPDATE', 'admin', `ปรับปรุงข้อมูลสมาชิก ${user.email} (${user.planTier})`);
  saveRevenueData(revenueState);
  return user;
};

export const getContractorLeads = (): ContractorLead[] => {
  return revenueState.leads;
};

export const addContractorLead = (lead: Omit<ContractorLead, 'id' | 'createdAt' | 'status'>): ContractorLead => {
  const newLead: ContractorLead = {
    ...lead,
    id: `lead_${Date.now()}`,
    status: 'NEW',
    createdAt: new Date().toLocaleDateString('th-TH'),
  };
  revenueState.leads.unshift(newLead);
  addAuditLog('LEAD_NEW', lead.customerName, `ส่งคำขอใบเสนอราคาถึง ${lead.contractorName}`);
  saveRevenueData(revenueState);
  return newLead;
};

export const updateContractorLeadStatus = (
  id: string,
  status: 'NEW' | 'CONTACTED' | 'IN_PROGRESS' | 'CLOSED'
): ContractorLead | null => {
  const lead = revenueState.leads.find((l) => l.id === id);
  if (!lead) return null;
  lead.status = status;
  addAuditLog('LEAD_STATUS', 'admin', `อัปเดตสถานะลีด ${lead.customerName} เป็น ${status}`);
  saveRevenueData(revenueState);
  return lead;
};

export const getAnnouncement = (): SystemAnnouncement => {
  return revenueState.announcement;
};

export const updateAnnouncement = (ann: Partial<SystemAnnouncement>): SystemAnnouncement => {
  revenueState.announcement = {
    ...revenueState.announcement,
    ...ann,
    updatedAt: new Date().toLocaleDateString('th-TH'),
  };
  addAuditLog('ANNOUNCE_UPDATE', 'admin', `อัปเดตประกาศระบบ: "${ann.message || ''}"`);
  saveRevenueData(revenueState);
  return revenueState.announcement;
};

export const getAuditLogs = (): AdminAuditLog[] => {
  return revenueState.logs;
};

export const addAuditLog = (action: string, actor: string, details: string) => {
  const newLog: AdminAuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    action,
    actor,
    details,
    timestamp: new Date().toLocaleTimeString('th-TH') + ' ' + new Date().toLocaleDateString('th-TH'),
  };
  revenueState.logs.unshift(newLog);
  if (revenueState.logs.length > 100) {
    revenueState.logs = revenueState.logs.slice(0, 100);
  }
};

export const getRevenueStats = () => {
  const totalRevenue = revenueState.transactions
    .filter((tx) => tx.status === 'COMPLETED')
    .reduce((sum, tx) => sum + tx.amountThb, 0);
  const completedTx = revenueState.transactions.filter((tx) => tx.status === 'COMPLETED');
  const proSubscribers = completedTx.filter((tx) => tx.planTier === 'PRO').length;
  const standardSubscribers = completedTx.filter((tx) => tx.planTier === 'STANDARD').length;
  const mrr = proSubscribers * revenueState.settings.proPriceThb + standardSubscribers * revenueState.settings.standardPriceThb;

  return {
    totalRevenue,
    mrr,
    proSubscribers,
    standardSubscribers,
    totalSubscribers: proSubscribers + standardSubscribers,
    transactions: revenueState.transactions,
    settings: revenueState.settings,
    users: revenueState.users,
    leads: revenueState.leads,
    announcement: revenueState.announcement,
    logs: revenueState.logs,
  };
};
