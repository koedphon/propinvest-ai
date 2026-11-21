import React, { useState, useEffect } from 'react';
import { authFetch } from '../services/firebase';
import {
  X,
  TrendingUp,
  DollarSign,
  Users,
  CreditCard,
  QrCode,
  Share2,
  Copy,
  Check,
  Settings,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  Megaphone,
  Clock,
  Phone,
  MessageSquare,
  Wrench,
  ExternalLink,
  ChevronRight,
  Zap,
  Save,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { isAdminUser } from '../utils/vip';

interface AdminBackendModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  onShowNotification?: (msg: string, type?: 'success' | 'error') => void;
  onUserPlanUpdated?: () => void;
}

export const AdminBackendModal: React.FC<AdminBackendModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  onShowNotification,
  onUserPlanUpdated,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'transactions' | 'users' | 'leads' | 'settings' | 'announcement' | 'marketing'
  >('overview');

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [txFilter, setTxFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [previewSlipImage, setPreviewSlipImage] = useState<string | null>(null);

  // User editing modal
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editUserTier, setEditUserTier] = useState<string>('FREE');
  const [editUserQuota, setEditUserQuota] = useState<number>(10);
  const [editUserStatus, setEditUserStatus] = useState<string>('ACTIVE');
  const [editUserNotes, setEditUserNotes] = useState<string>('');
  const [isSavingUser, setIsSavingUser] = useState(false);

  // Settings form
  const [formPromptpayId, setFormPromptpayId] = useState('');
  const [formPromptpayName, setFormPromptpayName] = useState('');
  const [formBankName, setFormBankName] = useState('');
  const [formBankAccountNumber, setFormBankAccountNumber] = useState('');
  const [formBankAccountHolder, setFormBankAccountHolder] = useState('');
  const [formStandardPrice, setFormStandardPrice] = useState(150);
  const [formProPrice, setFormProPrice] = useState(299);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Announcement form
  const [annEnabled, setAnnEnabled] = useState(true);
  const [annMessage, setAnnMessage] = useState('');
  const [annLevel, setAnnLevel] = useState<'info' | 'warning' | 'success'>('info');
  const [isSavingAnn, setIsSavingAnn] = useState(false);

  // Copy helper
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      const res = await authFetch('/api/admin/overview');
      const json = await res.json();
      if (!res.ok || !json.success) {
        setAuthError(json.error || `ไม่สามารถโหลดข้อมูลหลังบ้านได้ (HTTP ${res.status})`);
      }
      if (json.success) {
        setAuthError(null);
        setData(json);
        if (json.settings) {
          setFormPromptpayId(json.settings.promptpayId || '');
          setFormPromptpayName(json.settings.promptpayName || '');
          setFormBankName(json.settings.bankName || '');
          setFormBankAccountNumber(json.settings.bankAccountNumber || '');
          setFormBankAccountHolder(json.settings.bankAccountHolder || '');
          setFormStandardPrice(json.settings.standardPriceThb || 150);
          setFormProPrice(json.settings.proPriceThb || 299);
        }
        if (json.announcement) {
          setAnnEnabled(json.announcement.enabled ?? true);
          setAnnMessage(json.announcement.message || '');
          setAnnLevel(json.announcement.level || 'info');
        }
      }
    } catch (e) {
      console.warn('Failed to load admin overview:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
    if (onShowNotification) onShowNotification(t('copySuccess', 'คัดลอกข้อความสำเร็จ!'), 'success');
  };

  // Transaction Status Action
  const handleUpdateTxStatus = async (
    txId: string,
    status: 'COMPLETED' | 'PENDING_VERIFICATION' | 'CANCELLED',
    notes?: string
  ) => {
    try {
      const res = await authFetch(`/api/admin/transactions/${txId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        if (onShowNotification) onShowNotification(resJson.message, 'success');
        fetchAdminData();
        if (onUserPlanUpdated) onUserPlanUpdated();
      } else {
        throw new Error(resJson.error || 'Update failed');
      }
    } catch (err: any) {
      if (onShowNotification) onShowNotification(err.message || 'เกิดข้อผิดพลาดในการอัปเดต', 'error');
    }
  };

  // Delete Transaction
  const handleDeleteTx = async (txId: string) => {
    if (!window.confirm('คุณต้องการลบรายการธุรกรรมนี้หรือไม่?')) return;
    try {
      const res = await authFetch(`/api/admin/transactions/${txId}`, { method: 'DELETE' });
      const resJson = await res.json();
      if (resJson.success) {
        if (onShowNotification) onShowNotification('ลบรายการสำเร็จ', 'success');
        fetchAdminData();
      }
    } catch (err: any) {
      if (onShowNotification) onShowNotification(err.message || 'ลบไม่สำเร็จ', 'error');
    }
  };

  // Update Contractor Lead Status
  const handleUpdateLeadStatus = async (leadId: string, status: string) => {
    try {
      const res = await authFetch(`/api/admin/leads/${leadId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        if (onShowNotification) onShowNotification('อัปเดตสถานะลีดสำเร็จ', 'success');
        fetchAdminData();
      }
    } catch (err: any) {
      if (onShowNotification) onShowNotification(err.message || 'อัปเดตลีดไม่สำเร็จ', 'error');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await authFetch('/api/revenue/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptpayId: formPromptpayId,
          promptpayName: formPromptpayName,
          bankName: formBankName,
          bankAccountNumber: formBankAccountNumber,
          bankAccountHolder: formBankAccountHolder,
          standardPriceThb: Number(formStandardPrice),
          proPriceThb: Number(formProPrice),
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        if (onShowNotification) onShowNotification('บันทึกการตั้งค่าช่องทางรับเงินสำเร็จเรียบร้อย!', 'success');
        fetchAdminData();
      }
    } catch (err: any) {
      if (onShowNotification) onShowNotification(err.message || 'บันทึกไม่สำเร็จ', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Save Announcement
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAnn(true);
    try {
      const res = await authFetch('/api/admin/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: annEnabled,
          message: annMessage,
          level: annLevel,
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        if (onShowNotification) onShowNotification('บันทึกประกาศระบบสำเร็จ', 'success');
        fetchAdminData();
      }
    } catch (err: any) {
      if (onShowNotification) onShowNotification(err.message || 'บันทึกประกาศไม่สำเร็จ', 'error');
    } finally {
      setIsSavingAnn(false);
    }
  };

  // Open User Edit Modal
  const openEditUser = (u: any) => {
    setEditingUser(u);
    setEditUserTier(u.planTier);
    setEditUserQuota(u.quotaMonthly);
    setEditUserStatus(u.status || 'ACTIVE');
    setEditUserNotes(u.notes || '');
  };

  // Save User Edit
  const handleSaveUser = async () => {
    if (!editingUser) return;
    setIsSavingUser(true);
    try {
      const res = await authFetch(`/api/admin/users/${editingUser.id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planTier: editUserTier,
          quotaMonthly: Number(editUserQuota),
          status: editUserStatus,
          notes: editUserNotes,
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        if (onShowNotification) onShowNotification(`อัปเดตสมาชิก ${editingUser.email} สำเร็จ`, 'success');
        setEditingUser(null);
        fetchAdminData();
        if (onUserPlanUpdated) onUserPlanUpdated();
      }
    } catch (err: any) {
      if (onShowNotification) onShowNotification(err.message || 'บันทึกข้อมูลสมาชิกไม่สำเร็จ', 'error');
    } finally {
      setIsSavingUser(false);
    }
  };

  // Filtered transactions
  const filteredTransactions = (data?.transactions || []).filter((tx: any) => {
    if (txFilter === 'ALL') return true;
    if (txFilter === 'PENDING') return tx.status === 'PENDING_VERIFICATION';
    if (txFilter === 'COMPLETED') return tx.status === 'COMPLETED';
    if (txFilter === 'CANCELLED') return tx.status === 'CANCELLED';
    return true;
  });

  // Filtered users
  const filteredUsers = (data?.users || []).filter((u: any) => {
    if (!searchUserQuery) return true;
    const q = searchUserQuery.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q) ||
      u.planTier.toLowerCase().includes(q)
    );
  });

  const pendingTxCount = (data?.transactions || []).filter(
    (tx: any) => tx.status === 'PENDING_VERIFICATION'
  ).length;

  const publicAppUrl = window.location.origin;

  const facebookPostCopy = `🚀 นายหน้าและนักลงทุนอสังหาฯ ต้องลอง! เลิกจดป้ายข้างทางด้วยมือได้แล้ว
.
วันนี้ผมใช้ "PropInvest AI" เครื่องมือใหม่ล่าสุดสำหรับคนทำอสังหาฯ 
📱 แค่ยื่นมือถือถ่ายรูปป้ายประกาศขายที่ดิน/บ้านข้างทาง 
✨ AI สกัดข้อมูลเบอร์โทร, ราคา, ขนาดที่ดิน, พิกัด 
📊 เด้งบันทึกลงตาราง Google Sheets ของเราทันทีใน 3 วินาที!
📈 พร้อมระบบวิเคราะห์ราคาประเมินและผลตอบแทนการลงทุนให้อัตโนมัติ
.
👉 เข้าใช้งานได้เลยที่: ${publicAppUrl}
(ทดลองใช้ฟรี 10 ทรัพย์แรก ไม่ต้องติดตั้งแอป สมัครด้วย Gmail ใช้งานได้ทันทีครับ!)`;

  const linePostCopy = `🏢 แนะนำเครื่องมือทุ่นเวลานายหน้าอสังหาฯ ครับ!
ถ่ายรูปป้ายขายที่ดินข้างทาง AI ดึงข้อมูลลง Google Sheet ให้อัตโนมัติ ไม่ต้องพิมพ์เอง
ทดลองใช้ฟรีที่นี่เลยครับ 👉 ${publicAppUrl}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] rounded-3xl max-w-6xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-[#EAE3D9] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#24211D] via-[#362F28] to-[#24211D] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-[#C86A39] flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-2 ring-amber-300/40 shrink-0">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-editorial text-lg sm:text-2xl font-bold tracking-tight">
                  {t('superAdminTitle', 'ระบบหลังบ้านผู้ดูแลระบบ (Super Admin Dashboard)')}
                </h3>
                <span className="text-[10px] sm:text-xs font-bold bg-amber-400/25 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin: {userEmail}</span>
                </span>
                {pendingTxCount > 0 && (
                  <span className="text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                    {pendingTxCount} สลิปรอตรวจสอบ
                  </span>
                )}
              </div>
              <p className="text-xs text-[#EAE3D9]/80 mt-1 flex items-center gap-2">
                <span>จัดการรายได้ • ตรวจสอบสลิปโอนเงิน • ปรับโควตา AI สมาชิก • ตั้งค่าช่องทางรับเงิน</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchAdminData}
              disabled={isLoading}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer active:scale-95"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer active:scale-95"
              title={t('closeModal', 'ปิดหน้าต่าง')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-3 sm:px-6 pt-2 border-b border-[#EAE3D9] bg-white overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#C86A39] text-[#C86A39]'
                : 'border-transparent text-[#767067] hover:text-[#24211D]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>1. ภาพรวมการเงิน & สถิติ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap relative ${
              activeTab === 'transactions'
                ? 'border-[#C86A39] text-[#C86A39]'
                : 'border-transparent text-[#767067] hover:text-[#24211D]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>2. จัดการธุรกรรม & สลิปโอน</span>
            {pendingTxCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2.5 right-1" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-[#C86A39] text-[#C86A39]'
                : 'border-transparent text-[#767067] hover:text-[#24211D]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>3. สมาชิก & โควตา AI</span>
            <span className="text-[10px] font-semibold bg-[#FAF8F5] border border-[#EAE3D9] px-1.5 py-0.2 rounded-full text-[#767067]">
              {data?.users?.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('leads')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'leads'
                ? 'border-[#C86A39] text-[#C86A39]'
                : 'border-transparent text-[#767067] hover:text-[#24211D]'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>4. ลีดผู้รับเหมา</span>
            <span className="text-[10px] font-semibold bg-[#E8F5E9] text-[#2E7D32] px-1.5 py-0.2 rounded-full">
              {data?.leads?.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-[#C86A39] text-[#C86A39]'
                : 'border-transparent text-[#767067] hover:text-[#24211D]'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>5. ตั้งค่าบัญชีรับเงิน & ราคา</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('announcement')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'announcement'
                ? 'border-[#C86A39] text-[#C86A39]'
                : 'border-transparent text-[#767067] hover:text-[#24211D]'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>6. ประกาศ & บันทึกการทำงาน</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('marketing')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'marketing'
                ? 'border-[#C86A39] text-[#C86A39]'
                : 'border-transparent text-[#767067] hover:text-[#24211D]'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>7. สื่อโปรโมท</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: OVERVIEW & REVENUE DASHBOARD */}
          {authError && (
            <div className="mb-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-medium">
              🔒 {authError}
            </div>
          )}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Financial KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white border border-[#EAE3D9] p-4 rounded-2xl shadow-2xs">
                  <span className="text-[11px] text-[#767067] block font-medium">รายได้รวมสะสม (Total Revenue)</span>
                  <div className="font-editorial text-2xl sm:text-3xl font-bold text-[#24211D] mt-1">
                    ฿{(data?.totalRevenue || 0).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-[#2E7D32] font-semibold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#2E7D32]" />
                    <span>เงินโอนเข้าบัญชีโดยตรง</span>
                  </span>
                </div>

                <div className="bg-white border border-[#EAE3D9] p-4 rounded-2xl shadow-2xs">
                  <span className="text-[11px] text-[#767067] block font-medium">รายได้ประจำรายเดือน (MRR)</span>
                  <div className="font-editorial text-2xl sm:text-3xl font-bold text-[#C86A39] mt-1">
                    ฿{(data?.mrr || 0).toLocaleString()} <span className="text-xs text-[#767067]">/ด.</span>
                  </div>
                  <span className="text-[10px] text-[#767067] mt-1 block">
                    จาก {data?.totalSubscribers || 0} ผู้สมัครสมาชิก
                  </span>
                </div>

                <div className="bg-white border border-[#EAE3D9] p-4 rounded-2xl shadow-2xs">
                  <span className="text-[11px] text-[#767067] block font-medium">แพ็กเกจ Pro (299 บ./ด.)</span>
                  <div className="font-editorial text-2xl sm:text-3xl font-bold text-[#24211D] mt-1">
                    {data?.proSubscribers || 0} <span className="text-xs text-[#767067]">ทีม</span>
                  </div>
                  <span className="text-[10px] text-[#C86A39] font-medium mt-1 block">
                    ฿{((data?.proSubscribers || 0) * (data?.settings?.proPriceThb || 299)).toLocaleString()} /ด.
                  </span>
                </div>

                <div className="bg-white border border-[#EAE3D9] p-4 rounded-2xl shadow-2xs">
                  <span className="text-[11px] text-[#767067] block font-medium">แพ็กเกจ Standard (150 บ./ด.)</span>
                  <div className="font-editorial text-2xl sm:text-3xl font-bold text-[#24211D] mt-1">
                    {data?.standardSubscribers || 0} <span className="text-xs text-[#767067]">คน</span>
                  </div>
                  <span className="text-[10px] text-[#767067] font-medium mt-1 block">
                    ฿{((data?.standardSubscribers || 0) * (data?.settings?.standardPriceThb || 150)).toLocaleString()} /ด.
                  </span>
                </div>
              </div>

              {/* Status Summary & Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-[#2D221B] to-[#3D2D23] text-white p-5 rounded-2xl shadow-md flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-300">👑 ผู้ดูแลระบบสูงสุด (Super Admin)</span>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">VIP Active</span>
                    </div>
                    <h4 className="font-editorial text-xl font-bold mt-2">{userEmail || "Super Admin"}</h4>
                    <p className="text-xs text-white/80 mt-1">
                      บัญชีผู้ดูแลระบบ ได้รับสิทธิ์ใช้งานไม่จำกัดตลอดชีพ และมีสิทธิ์บริหารจัดการระบบหลังบ้านเต็มรูปแบบ
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-amber-200">
                    <span>โควตา AI: ไม่จำกัด (Unlimited)</span>
                    <span>สิทธิ์: Super Admin</span>
                  </div>
                </div>

                <div className="bg-white border border-[#EAE3D9] p-5 rounded-2xl shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-[#24211D]">สถานะการชำระเงิน</h4>
                    <button
                      type="button"
                      onClick={() => setActiveTab('transactions')}
                      className="text-xs text-[#C86A39] font-bold hover:underline flex items-center gap-1"
                    >
                      ดูทั้งหมด <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5]">
                      <span className="text-[#767067]">สลิปโอนรอตรวจสอบ</span>
                      <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                        pendingTxCount > 0 ? 'bg-rose-100 text-rose-700 font-bold' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {pendingTxCount} รายการ
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5]">
                      <span className="text-[#767067]">รายการชำระสำเร็จแล้ว</span>
                      <span className="font-bold text-[#2E7D32]">
                        {(data?.transactions || []).filter((t: any) => t.status === 'COMPLETED').length} รายการ
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5]">
                      <span className="text-[#767067]">สัดส่วนจ่ายผ่าน PromptPay</span>
                      <span className="font-bold text-[#24211D]">
                        {(data?.transactions || []).filter((t: any) => t.paymentMethod === 'PROMPTPAY_QR').length} รายการ (~75%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#EAE3D9] p-5 rounded-2xl shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-[#24211D]">สมาชิก & ความต้องการช่าง</h4>
                    <button
                      type="button"
                      onClick={() => setActiveTab('users')}
                      className="text-xs text-[#C86A39] font-bold hover:underline flex items-center gap-1"
                    >
                      จัดการ <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5]">
                      <span className="text-[#767067]">จำนวนสมาชิกในระบบ</span>
                      <span className="font-bold text-[#24211D]">{data?.users?.length || 0} บัญชี</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5]">
                      <span className="text-[#767067]">คำขอลีดผู้รับเหมาทั้งหมด</span>
                      <span className="font-bold text-[#2E7D32]">{data?.leads?.length || 0} คำขอ</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5]">
                      <span className="text-[#767067]">สถานะช่องทางรับเงิน</span>
                      <span className="font-bold text-[#2E7D32]">
                        ✓ พร้อมเพย์ {data?.settings?.promptpayId ? 'เปิดใช้งาน' : 'ยังไม่ระบุ'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Transactions Snippet */}
              <div className="bg-white border border-[#EAE3D9] rounded-2xl overflow-hidden shadow-2xs">
                <div className="p-4 bg-[#FAF8F5] border-b border-[#EAE3D9] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#C86A39]" />
                    <h4 className="font-editorial text-sm font-bold text-[#24211D]">
                      ประวัติการชำระเงินล่าสุด ({data?.transactions?.length || 0} รายการ)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('transactions')}
                    className="text-xs text-[#C86A39] font-bold hover:underline"
                  >
                    ดูและอนุมัติทั้งหมด →
                  </button>
                </div>

                <div className="divide-y divide-[#EAE3D9]">
                  {(data?.transactions || []).slice(0, 4).map((tx: any) => (
                    <div key={tx.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#FAF8F5] text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#FAF5F0] border border-[#EAE3D9] flex items-center justify-center font-bold text-sm text-[#C86A39] shrink-0">
                          {tx.paymentMethod === 'STRIPE_CARD' ? '💳' : '📱'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#24211D]">{tx.customerName}</span>
                            <span className="text-[10px] bg-[#FAF8F5] border border-[#EAE3D9] px-1.5 py-0.2 rounded-full text-[#767067] font-semibold">
                              {tx.planTier}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                              tx.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : tx.status === 'PENDING_VERIFICATION'
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {tx.status === 'COMPLETED' ? 'อนุมัติแล้ว' : tx.status === 'PENDING_VERIFICATION' ? 'รอตรวจสลิป' : 'ยกเลิก'}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#767067]">{tx.customerEmail} • {tx.referenceNo}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-bold text-sm text-[#2E7D32]">+฿{tx.amountThb}</span>
                          <span className="text-[10px] text-[#767067] block">
                            {tx.paymentMethod === 'STRIPE_CARD' ? 'บัตรเครดิต' : 'PromptPay QR'}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#767067] hidden sm:inline">{tx.createdAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRANSACTIONS & SLIPS APPROVAL */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-[#EAE3D9]">
                  {(['ALL', 'PENDING', 'COMPLETED', 'CANCELLED'] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setTxFilter(filter)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        txFilter === filter
                          ? 'bg-[#C86A39] text-white shadow-2xs'
                          : 'text-[#767067] hover:text-[#24211D]'
                      }`}
                    >
                      {filter === 'ALL' && `ทั้งหมด (${data?.transactions?.length || 0})`}
                      {filter === 'PENDING' && `รอตรวจสอบ (${pendingTxCount})`}
                      {filter === 'COMPLETED' && 'อนุมัติแล้ว'}
                      {filter === 'CANCELLED' && 'ยกเลิก'}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-[#767067]">
                  💡 <strong>ระบบอนุมัติทันที:</strong> กดปุ่ม "อนุมัติ" ระบบจะปรับแพ็กเกจและเพิ่มโควตา AI ให้ลูกค้าทันที
                </div>
              </div>

              {/* Transactions List */}
              <div className="bg-white border border-[#EAE3D9] rounded-2xl overflow-hidden shadow-2xs divide-y divide-[#EAE3D9]">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx: any) => (
                    <div key={tx.id} className="p-4 hover:bg-[#FAF8F5] transition-colors space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#FAF5F0] border border-[#EAE3D9] flex items-center justify-center font-bold text-base text-[#C86A39] shrink-0 mt-0.5">
                            {tx.paymentMethod === 'STRIPE_CARD' ? '💳' : '📱'}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-[#24211D]">{tx.customerName}</span>
                              <span className="text-xs text-[#767067]">({tx.customerEmail})</span>
                              <span className="text-[10px] font-bold bg-[#FAF8F5] border border-[#EAE3D9] px-2 py-0.5 rounded-full text-[#C86A39]">
                                {tx.planTier} Plan
                              </span>
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                tx.status === 'COMPLETED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : tx.status === 'PENDING_VERIFICATION'
                                  ? 'bg-amber-100 text-amber-800 animate-pulse'
                                  : 'bg-rose-100 text-rose-800'
                              }`}>
                                {tx.status === 'COMPLETED' ? '✓ อนุมัติสำเร็จ' : tx.status === 'PENDING_VERIFICATION' ? '⏳ รอแอดมินตรวจสลิป' : '✕ ยกเลิกแล้ว'}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-[#767067] mt-1 flex-wrap">
                              <span>รหัสอ้างอิง: <strong>{tx.referenceNo}</strong></span>
                              <span>•</span>
                              <span>วันที่: {tx.createdAt}</span>
                              <span>•</span>
                              <span>ช่องทาง: {tx.paymentMethod === 'STRIPE_CARD' ? 'บัตร Stripe' : 'PromptPay QR โอนตรง'}</span>
                            </div>

                            {tx.notes && (
                              <p className="text-xs text-[#8C4A26] bg-[#FDF6F0] p-2 rounded-xl mt-2 border border-[#F0DFD1]">
                                📝 {tx.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center sm:items-end flex-col gap-1 shrink-0">
                          <span className="font-editorial text-xl font-bold text-[#2E7D32]">
                            ฿{Number(tx.amountThb).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-[#767067]">ยอดที่ชำระ</span>
                        </div>
                      </div>

                      {/* Action Bar for this Transaction */}
                      <div className="pt-2 border-t border-[#F0DFD1]/60 flex items-center justify-between flex-wrap gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          {tx.slipImage ? (
                            <button
                              type="button"
                              onClick={() => setPreviewSlipImage(tx.slipImage)}
                              className="px-2.5 py-1.5 bg-[#FAF8F5] hover:bg-[#F4EFEB] text-[#24211D] border border-[#EAE3D9] rounded-xl font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#C86A39]" />
                              <span>ดูรูปสลิป</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#767067] italic">ไม่มีสลิปแนบ (สแกน QR โอนตรง)</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {tx.status !== 'COMPLETED' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateTxStatus(tx.id, 'COMPLETED')}
                              className="px-3 py-1.5 bg-[#2E7D32] hover:bg-[#256829] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>อนุมัติ & เปิดโควตา AI</span>
                            </button>
                          )}

                          {tx.status !== 'CANCELLED' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateTxStatus(tx.id, 'CANCELLED')}
                              className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-medium cursor-pointer"
                            >
                              ปฏิเสธ
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteTx(tx.id)}
                            className="p-1.5 text-[#767067] hover:text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                            title="ลบรายการนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-[#767067]">
                    ไม่พบรายการชำระเงินตามเงื่อนไขที่เลือก
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: USERS & AI QUOTA MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-[#767067] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchUserQuery}
                    onChange={(e) => setSearchUserQuery(e.target.value)}
                    placeholder="ค้นหาชื่อ, อีเมล หรือแพ็กเกจ..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-[#EAE3D9] rounded-xl text-xs text-[#24211D] focus:border-[#C86A39] outline-none"
                  />
                </div>

                <div className="text-xs text-[#767067]">
                  มีสมาชิกทั้งหมด <strong>{filteredUsers.length}</strong> บัญชี (คลิก "แก้ไข" เพื่อปรับโควตา AI หรือเปลี่ยนระดับแพ็กเกจ)
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white border border-[#EAE3D9] rounded-2xl overflow-hidden shadow-2xs divide-y divide-[#EAE3D9]">
                {filteredUsers.map((u: any) => (
                  <div key={u.id} className="p-4 hover:bg-[#FAF8F5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm text-white shrink-0 ${
                        u.isVip || isAdminUser(u.email)
                          ? 'bg-gradient-to-br from-amber-500 to-[#C86A39] shadow-xs'
                          : u.planTier === 'PRO'
                          ? 'bg-[#C86A39]'
                          : u.planTier === 'STANDARD'
                          ? 'bg-blue-600'
                          : 'bg-[#767067]'
                      }`}>
                        {u.isVip || isAdminUser(u.email) ? '👑' : u.name?.[0]?.toUpperCase() || 'U'}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-[#24211D]">{u.name}</span>
                          <span className="text-[#767067]">({u.email})</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            u.isVip || isAdminUser(u.email)
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : u.planTier === 'PRO'
                              ? 'bg-[#FDF6F0] text-[#C86A39] border border-[#F0DFD1]'
                              : u.planTier === 'STANDARD'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {u.isVip || isAdminUser(u.email) ? '👑 Super Admin VIP' : `${u.planTier} Plan`}
                          </span>

                          <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                            u.status === 'SUSPENDED' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {u.status === 'SUSPENDED' ? 'ระงับการใช้งาน' : 'ปกติ'}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-[#767067] flex-wrap">
                          <span>โควตารายเดือน: <strong>{u.quotaMonthly >= 999999 ? 'ไม่จำกัด (Unlimited)' : `${u.quotaMonthly} ครั้ง`}</strong></span>
                          <span>สแกนแล้ว: <strong>{u.scansUsed || 0} ครั้ง</strong></span>
                          <span>ยอดชำระสะสม: <strong>฿{(u.totalSpentThb || 0).toLocaleString()}</strong></span>
                          <span>สมัครเมื่อ: {u.joinedAt || '2569'}</span>
                        </div>

                        {u.notes && (
                          <div className="text-[11px] text-[#8C4A26] bg-[#FDF6F0] px-2 py-0.5 rounded-md inline-block">
                            📌 {u.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => openEditUser(u)}
                        className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F4EFEB] border border-[#EAE3D9] text-[#24211D] rounded-xl font-bold flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#C86A39]" />
                        <span>แก้ไขโควตา & สิทธิ์</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CONTRACTOR LEADS */}
          {activeTab === 'leads' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-editorial text-base font-bold text-[#24211D]">
                    คำขอใบเสนอราคาและปรึกษารีโนเวท ({data?.leads?.length || 0} รายการ)
                  </h4>
                  <p className="text-xs text-[#767067]">
                    ข้อมูลที่นักลงทุนหรือเจ้าของบ้านส่งถึง 5 บริษัทผู้รับเหมาในระบบ
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(data?.leads || []).map((lead: any) => (
                  <div key={lead.id} className="bg-white border border-[#EAE3D9] rounded-2xl p-4 shadow-2xs space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#24211D]">{lead.customerName}</span>
                      <select
                        value={lead.status}
                        onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                          lead.status === 'NEW'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : lead.status === 'CONTACTED'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : lead.status === 'IN_PROGRESS'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        <option value="NEW">สถานะ: ใหม่ (NEW)</option>
                        <option value="CONTACTED">สถานะ: ติดต่อแล้ว (CONTACTED)</option>
                        <option value="IN_PROGRESS">สถานะ: กำลังประเมิน (IN PROGRESS)</option>
                        <option value="CLOSED">สถานะ: ปิดการขาย (CLOSED)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 text-[#524B43]">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-3.5 h-3.5 text-[#C86A39]" />
                        <span>ผู้รับเหมาที่เลือก: <strong>{lead.contractorName}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#2E7D32]" />
                        <span>เบอร์ติดต่อ: <a href={`tel:${lead.customerPhone}`} className="text-[#C86A39] font-bold hover:underline">{lead.customerPhone}</a></span>
                        {lead.customerLineId && <span className="text-[#767067]">• LINE: {lead.customerLineId}</span>}
                      </div>
                      {lead.propertyLocation && (
                        <div>ทำเล: <strong>{lead.propertyLocation}</strong> ({lead.propertyType || 'บ้าน'})</div>
                      )}
                      {lead.scopeOfWork && (
                        <div>ขอบเขตงาน: <strong>{lead.scopeOfWork}</strong></div>
                      )}
                      {lead.notes && (
                        <div className="p-2 bg-[#FAF8F5] rounded-lg border border-[#EAE3D9] text-[#767067]">
                          "{lead.notes}"
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#EAE3D9] flex items-center justify-between text-[11px] text-[#767067]">
                      <span>รหัสคำขอ: {lead.id}</span>
                      <span>วันที่ส่ง: {lead.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PAYMENT SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="bg-[#FAF8F5] border border-[#EAE3D9] rounded-2xl p-4 text-xs text-[#524B43]">
                💡 <strong>คำแนะนำระบบรับเงิน:</strong> เมื่อคุณแก้ไขข้อมูลเบอร์พร้อมเพย์ ชื่อบัญชี หรือราคาแพ็กเกจ ข้อมูลจะอัปเดตไปยังหน้าต่างสแกน QR Code สำหรับลูกค้าทั่วประเทศทันที
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#24211D] block mb-1">
                    เบอร์พร้อมเพย์ หรือ เลขบัตรประชาชน (PromptPay ID)
                  </label>
                  <input
                    type="text"
                    value={formPromptpayId}
                    onChange={(e) => setFormPromptpayId(e.target.value)}
                    placeholder="เช่น 0812345678 หรือ 1100400123456"
                    className="w-full bg-white border border-[#EAE3D9] focus:border-[#C86A39] rounded-xl px-3.5 py-2.5 text-xs text-[#24211D] font-medium outline-none"
                    required
                  />
                  <span className="text-[10px] text-[#767067] mt-1 block">
                    เบอร์ที่ผูกพร้อมเพย์ไว้สำหรับสร้าง QR รับเงินเข้าบัญชีของคุณ
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#24211D] block mb-1">
                    ชื่อบัญชีพร้อมเพย์ (Account Name)
                  </label>
                  <input
                    type="text"
                    value={formPromptpayName}
                    onChange={(e) => setFormPromptpayName(e.target.value)}
                    placeholder="เช่น นายสมชาย ใจดี"
                    className="w-full bg-white border border-[#EAE3D9] focus:border-[#C86A39] rounded-xl px-3.5 py-2.5 text-xs text-[#24211D] font-medium outline-none"
                    required
                  />
                  <span className="text-[10px] text-[#767067] mt-1 block">
                    ชื่อบัญชีที่จะปรากฏบนหน้าจอให้ลูกค้าตรวจความถูกต้องตอนโอน
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#24211D] block mb-1">
                    ธนาคาร (Bank Name)
                  </label>
                  <input
                    type="text"
                    value={formBankName}
                    onChange={(e) => setFormBankName(e.target.value)}
                    placeholder="เช่น ธนาคารกสิกรไทย, ธนาคารไทยพาณิชย์"
                    className="w-full bg-white border border-[#EAE3D9] focus:border-[#C86A39] rounded-xl px-3.5 py-2.5 text-xs text-[#24211D] font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#24211D] block mb-1">
                    เลขที่บัญชีธนาคาร (Bank Account Number)
                  </label>
                  <input
                    type="text"
                    value={formBankAccountNumber}
                    onChange={(e) => setFormBankAccountNumber(e.target.value)}
                    placeholder="เช่น 045-8-12345-6"
                    className="w-full bg-white border border-[#EAE3D9] focus:border-[#C86A39] rounded-xl px-3.5 py-2.5 text-xs text-[#24211D] font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#24211D] block mb-1">
                    ราคาแพ็กเกจ Standard (บาท/เดือน)
                  </label>
                  <input
                    type="number"
                    value={formStandardPrice}
                    onChange={(e) => setFormStandardPrice(Number(e.target.value))}
                    className="w-full bg-white border border-[#EAE3D9] focus:border-[#C86A39] rounded-xl px-3.5 py-2.5 text-xs text-[#24211D] font-medium outline-none"
                  />
                  <span className="text-[10px] text-[#767067] mt-1 block">
                    ค่าบริการรายเดือนสำหรับแพ็กเกจ 100 ครั้ง (ค่าเริ่มต้น: 150 บาท)
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#24211D] block mb-1">
                    ราคาแพ็กเกจ Pro (บาท/เดือน)
                  </label>
                  <input
                    type="number"
                    value={formProPrice}
                    onChange={(e) => setFormProPrice(Number(e.target.value))}
                    className="w-full bg-white border border-[#EAE3D9] focus:border-[#C86A39] rounded-xl px-3.5 py-2.5 text-xs text-[#24211D] font-medium outline-none"
                  />
                  <span className="text-[10px] text-[#767067] mt-1 block">
                    ค่าบริการรายเดือนสำหรับแพ็กเกจ 400 ครั้ง + แชร์ทีม (ค่าเริ่มต้น: 299 บาท)
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#EAE3D9]">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-6 py-2.5 bg-[#C86A39] hover:bg-[#B55B2C] text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingSettings ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าการรับเงิน'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 6: ANNOUNCEMENT & AUDIT LOGS */}
          {activeTab === 'announcement' && (
            <div className="space-y-6">
              {/* Broadcast Announcement */}
              <form onSubmit={handleSaveAnnouncement} className="bg-white border border-[#EAE3D9] rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-[#C86A39]" />
                    <h4 className="font-editorial text-base font-bold text-[#24211D]">
                      ประกาศแบนเนอร์แจ้งเตือนสมาชิกทั้งระบบ (System Announcement)
                    </h4>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={annEnabled}
                      onChange={(e) => setAnnEnabled(e.target.checked)}
                      className="rounded text-[#C86A39] focus:ring-[#C86A39]"
                    />
                    <span>เปิดแสดงประกาศแบนเนอร์</span>
                  </label>
                </div>

                <div>
                  <label className="text-xs text-[#767067] block mb-1">
                    ข้อความประกาศ (จะแสดงแถบด้านบนสุดของแอปให้ผู้ใช้ทุกคนเห็น)
                  </label>
                  <textarea
                    value={annMessage}
                    onChange={(e) => setAnnMessage(e.target.value)}
                    rows={2}
                    placeholder="เช่น ✨ อัปเดตใหม่: รองรับการสแกนป้ายและโอนผ่าน PromptPay ทันที!"
                    className="w-full bg-[#FAF8F5] border border-[#EAE3D9] focus:border-[#C86A39] rounded-xl p-3 text-xs text-[#24211D] outline-none"
                  />
                </div>

                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#767067]">โทนสี:</span>
                    {(['info', 'warning', 'success'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setAnnLevel(lvl)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          annLevel === lvl
                            ? lvl === 'info'
                              ? 'bg-blue-600 text-white'
                              : lvl === 'warning'
                              ? 'bg-amber-500 text-white'
                              : 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {lvl === 'info' ? 'ข้อมูล (ฟ้า)' : lvl === 'warning' ? 'แจ้งเตือน (ส้ม)' : 'สำเร็จ (เขียว)'}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingAnn}
                    className="px-5 py-2 bg-[#C86A39] hover:bg-[#B55B2C] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    {isSavingAnn ? 'กำลังบันทึก...' : 'บันทึกและเผยแพร่ประกาศ'}
                  </button>
                </div>
              </form>

              {/* Audit Logs */}
              <div className="bg-white border border-[#EAE3D9] rounded-2xl overflow-hidden shadow-2xs">
                <div className="p-4 bg-[#FAF8F5] border-b border-[#EAE3D9] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#C86A39]" />
                    <h4 className="font-editorial text-sm font-bold text-[#24211D]">
                      บันทึกความปลอดภัยและการทำงาน (Admin Audit Trail)
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#767067]">ล่าสุด 100 รายการ</span>
                </div>

                <div className="divide-y divide-[#EAE3D9] max-h-72 overflow-y-auto">
                  {(data?.logs || []).map((log: any) => (
                    <div key={log.id} className="p-3 text-xs flex items-center justify-between gap-3 hover:bg-[#FAF8F5]">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#EAE3D9] text-[#767067]">
                          {log.action}
                        </span>
                        <span className="text-[#24211D]">{log.details}</span>
                        <span className="text-[#767067] italic">({log.actor})</span>
                      </div>
                      <span className="text-[10px] text-[#767067] shrink-0">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: MARKETING KIT */}
          {activeTab === 'marketing' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#EAE3D9] rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-editorial text-sm font-bold text-[#24211D]">
                    ข้อความโพสต์โปรโมทใน Facebook & กลุ่มนายหน้า
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleCopy(facebookPostCopy, 'fb')}
                    className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F4EFEB] border border-[#EAE3D9] text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'fb' ? <Check className="w-3.5 h-3.5 text-[#2E7D32]" /> : <Copy className="w-3.5 h-3.5 text-[#C86A39]" />}
                    <span>{copiedKey === 'fb' ? 'คัดลอกแล้ว!' : 'คัดลอกโพสต์ FB'}</span>
                  </button>
                </div>
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE3D9] text-xs whitespace-pre-line leading-relaxed text-[#24211D] select-all">
                  {facebookPostCopy}
                </div>
              </div>

              <div className="bg-white border border-[#EAE3D9] rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-editorial text-sm font-bold text-[#24211D]">
                    ข้อความแชร์ใน LINE กลุ่มนายหน้าและเพื่อนร่วมงาน
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleCopy(linePostCopy, 'line')}
                    className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F4EFEB] border border-[#EAE3D9] text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'line' ? <Check className="w-3.5 h-3.5 text-[#2E7D32]" /> : <Copy className="w-3.5 h-3.5 text-[#C86A39]" />}
                    <span>{copiedKey === 'line' ? 'คัดลอกแล้ว!' : 'คัดลอกข้อความ LINE'}</span>
                  </button>
                </div>
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE3D9] text-xs whitespace-pre-line leading-relaxed text-[#24211D] select-all">
                  {linePostCopy}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#EAE3D9] flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-[#767067]">
            <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
            <span>สิทธิ์เข้าถึงเฉพาะ Super Admin: บัญชีเจ้าของระบบ</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#FAF8F5] hover:bg-[#F4EFEB] text-[#24211D] border border-[#EAE3D9] rounded-xl font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            {t('closeModal', 'ปิดหน้าต่าง')}
          </button>
        </div>
      </div>

      {/* Slip Image Preview Modal */}
      {previewSlipImage && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[#24211D]">รูปสลิปการโอนเงิน</h4>
              <button
                type="button"
                onClick={() => setPreviewSlipImage(null)}
                className="p-1 text-[#767067] hover:text-[#24211D]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-xl border border-[#EAE3D9] flex items-center justify-center bg-black/5">
              <img src={previewSlipImage} alt="Payment Slip" className="max-w-full max-h-[60vh] object-contain" />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewSlipImage(null)}
                className="px-4 py-2 bg-[#24211D] text-white rounded-xl text-xs font-bold"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#EAE3D9]">
            <div className="flex items-center justify-between border-b border-[#EAE3D9] pb-3">
              <div>
                <h4 className="font-editorial text-base font-bold text-[#24211D]">
                  แก้ไขโควตา & สิทธิ์สมาชิก
                </h4>
                <p className="text-xs text-[#767067]">{editingUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 text-[#767067] hover:text-[#24211D]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#24211D] block mb-1">แพ็กเกจ (Plan Tier)</label>
                <select
                  value={editUserTier}
                  onChange={(e) => {
                    const tier = e.target.value;
                    setEditUserTier(tier);
                    if (tier === 'FREE') setEditUserQuota(10);
                    else if (tier === 'STANDARD') setEditUserQuota(100);
                    else if (tier === 'PRO') setEditUserQuota(400);
                    else if (tier === 'VIP') setEditUserQuota(999999);
                  }}
                  className="w-full bg-[#FAF8F5] border border-[#EAE3D9] rounded-xl p-2.5 font-medium outline-none focus:border-[#C86A39]"
                >
                  <option value="FREE">แบบฟรี (Free - 10 ครั้ง/เดือน)</option>
                  <option value="STANDARD">Standard (150 บ. - 100 ครั้ง/เดือน)</option>
                  <option value="PRO">Pro (299 บ. - 400 ครั้ง/เดือน + ทีม)</option>
                  <option value="VIP">👑 VIP Super Admin (ไม่จำกัดตลอดชีพ)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#24211D] block mb-1">โควตารายเดือน (จำนวนครั้งสแกน AI)</label>
                <input
                  type="number"
                  value={editUserQuota}
                  onChange={(e) => setEditUserQuota(Number(e.target.value))}
                  className="w-full bg-[#FAF8F5] border border-[#EAE3D9] rounded-xl p-2.5 font-medium outline-none focus:border-[#C86A39]"
                />
                <span className="text-[10px] text-[#767067] mt-1 block">
                  ระบุ 999999 สำหรับไม่จำกัดจำนวนครั้ง
                </span>
              </div>

              <div>
                <label className="font-bold text-[#24211D] block mb-1">สถานะบัญชี</label>
                <select
                  value={editUserStatus}
                  onChange={(e) => setEditUserStatus(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EAE3D9] rounded-xl p-2.5 font-medium outline-none focus:border-[#C86A39]"
                >
                  <option value="ACTIVE">ปกติ (ACTIVE)</option>
                  <option value="SUSPENDED">ระงับการใช้งานชั่วคราว (SUSPENDED)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#24211D] block mb-1">บันทึกช่วยจำแอดมิน (Admin Notes)</label>
                <textarea
                  value={editUserNotes}
                  onChange={(e) => setEditUserNotes(e.target.value)}
                  rows={2}
                  placeholder="เช่น ลูกค้าโอนผ่านพร้อมเพย์แล้ว หรือ VIP พาร์ทเนอร์"
                  className="w-full bg-[#FAF8F5] border border-[#EAE3D9] rounded-xl p-2.5 outline-none focus:border-[#C86A39]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#EAE3D9]">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#24211D] rounded-xl text-xs font-bold"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveUser}
                disabled={isSavingUser}
                className="px-5 py-2 bg-[#C86A39] hover:bg-[#B55B2C] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                {isSavingUser ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
