
import React, { createContext, useState, useEffect, useContext, ReactNode, useMemo } from 'react';
import { Contract, Supplier, Expense, ReceivedPayment, SavedQuote, Worker, Subcontractor, SubcontractorAgreement, PaymentHistoryEntry } from '../core/types';
import { calculateQuoteTotals } from '../core/utils/calculations';

interface ContractContextType {
  contracts: Contract[];
  suppliers: Supplier[];
  workers: Worker[];
  subcontractors: Subcontractor[];
  subAgreements: SubcontractorAgreement[];
  expenses: Expense[];
  receivedPayments: ReceivedPayment[];
  
  // Actions
  createContractFromQuote: (quote: SavedQuote) => void;
  updateContractStatus: (id: string, status: Contract['status']) => void;
  updateContractDetails: (id: string, updates: Partial<Contract>) => void;
  
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  deleteSupplier: (id: string) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;

  addWorker: (worker: Omit<Worker, 'id'>) => void;
  deleteWorker: (id: string) => void;
  updateWorker: (id: string, updates: Partial<Worker>) => void;

  addSubcontractor: (sub: Omit<Subcontractor, 'id'>) => void;
  deleteSubcontractor: (id: string) => void;
  updateSubcontractor: (id: string, updates: Partial<Subcontractor>) => void;
  
  saveSubAgreement: (agreement: SubcontractorAgreement) => void;
  getSubAgreement: (contractId: string, subId: string) => SubcontractorAgreement | undefined;

  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  payPartialDebt: (originalExpense: Expense, amountToPay: number, paymentDate: number, attachmentUrl?: string) => void;
  
  addPayment: (payment: Omit<ReceivedPayment, 'id'>) => void;
  deletePayment: (id: string) => void;
  
  // Helpers
  getContractExpenses: (contractId: string) => Expense[];
  getContractPayments: (contractId: string) => ReceivedPayment[];
  getSupplierBalance: (supplierId: string) => number;
  getWorkerBalance: (workerId: string) => number;
  getSubcontractorBalance: (subId: string) => number;
  getContractFinancials: (contractId: string) => { totalReceived: number; totalSpent: number; profit: number; progress: number };
  getGlobalFinancials: () => { totalReceived: number; totalCashSpent: number; totalDebt: number };
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

const CONTRACTS_KEY = 'mb_contracts';
const SUPPLIERS_KEY = 'mb_suppliers';
const WORKERS_KEY = 'mb_workers';
const SUBCONTRACTORS_KEY = 'mb_subcontractors';
const SUB_AGREEMENTS_KEY = 'mb_sub_agreements';
const EXPENSES_KEY = 'mb_expenses';
const PAYMENTS_KEY = 'mb_payments';

export const ContractProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [subAgreements, setSubAgreements] = useState<SubcontractorAgreement[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [receivedPayments, setReceivedPayments] = useState<ReceivedPayment[]>([]);

  // Load Data
  useEffect(() => {
    try {
        const lContracts = localStorage.getItem(CONTRACTS_KEY);
        const lSuppliers = localStorage.getItem(SUPPLIERS_KEY);
        const lWorkers = localStorage.getItem(WORKERS_KEY);
        const lSubs = localStorage.getItem(SUBCONTRACTORS_KEY);
        const lSubAgreements = localStorage.getItem(SUB_AGREEMENTS_KEY);
        const lExpenses = localStorage.getItem(EXPENSES_KEY);
        const lPayments = localStorage.getItem(PAYMENTS_KEY);

        if (lContracts) setContracts(JSON.parse(lContracts));
        if (lSuppliers) setSuppliers(JSON.parse(lSuppliers));
        if (lWorkers) setWorkers(JSON.parse(lWorkers));
        if (lSubs) setSubcontractors(JSON.parse(lSubs));
        if (lSubAgreements) setSubAgreements(JSON.parse(lSubAgreements));
        if (lExpenses) setExpenses(JSON.parse(lExpenses));
        if (lPayments) setReceivedPayments(JSON.parse(lPayments));
    } catch (e) {
        console.error("Error loading contract data", e);
    }
  }, []);

  // Save Data
  useEffect(() => localStorage.setItem(CONTRACTS_KEY, JSON.stringify(contracts)), [contracts]);
  useEffect(() => localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(suppliers)), [suppliers]);
  useEffect(() => localStorage.setItem(WORKERS_KEY, JSON.stringify(workers)), [workers]);
  useEffect(() => localStorage.setItem(SUBCONTRACTORS_KEY, JSON.stringify(subcontractors)), [subcontractors]);
  useEffect(() => localStorage.setItem(SUB_AGREEMENTS_KEY, JSON.stringify(subAgreements)), [subAgreements]);
  useEffect(() => localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses)), [expenses]);
  useEffect(() => localStorage.setItem(PAYMENTS_KEY, JSON.stringify(receivedPayments)), [receivedPayments]);

  const generateContractNumber = () => {
      const year = new Date().getFullYear();
      const prefix = `MB-CNT-${year}`;
      const existingInYear = contracts.filter(c => c.contractNumber && c.contractNumber.startsWith(prefix)).length;
      const sequence = (existingInYear + 1).toString().padStart(4, '0');
      return `${prefix}-${sequence}`;
  };

  const createContractFromQuote = (quote: SavedQuote) => {
    if (contracts.some(c => c.quoteId === quote.id)) return;

    const totals = calculateQuoteTotals(quote.categories, quote.selections, quote.projectDetails, quote.quoteType);

    const newContract: Contract = {
        id: `cnt-${Date.now()}`,
        contractNumber: generateContractNumber(),
        quoteId: quote.id,
        offerNumber: quote.offerNumber,
        quoteDate: quote.projectDetails.date,
        projectDetails: quote.projectDetails,
        totalContractValue: totals.grandTotal,
        status: 'Active',
        startDate: Date.now(),
        paymentSchedule: quote.paymentSchedule || [],
    };

    setContracts(prev => [...prev, newContract]);
  };

  const updateContractStatus = (id: string, status: Contract['status']) => {
      setContracts(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const updateContractDetails = (id: string, updates: Partial<Contract>) => {
      setContracts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  // --- Suppliers ---
  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    setSuppliers(prev => [...prev, { ...supplier, id: `sup-${Date.now()}` }]);
  };
  const deleteSupplier = (id: string) => {
    if (expenses.some(e => e.supplierId === id)) { alert("لا يمكن الحذف لوجود حركات مالية"); return; }
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };
  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
      setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // --- Workers ---
  const addWorker = (worker: Omit<Worker, 'id'>) => {
    setWorkers(prev => [...prev, { ...worker, id: `wrk-${Date.now()}` }]);
  };
  const deleteWorker = (id: string) => {
    if (expenses.some(e => e.workerId === id)) { alert("لا يمكن الحذف لوجود حركات مالية"); return; }
    setWorkers(prev => prev.filter(w => w.id !== id));
  };
  const updateWorker = (id: string, updates: Partial<Worker>) => {
      setWorkers(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  // --- Subcontractors ---
  const addSubcontractor = (sub: Omit<Subcontractor, 'id'>) => {
    setSubcontractors(prev => [...prev, { ...sub, id: `sub-${Date.now()}` }]);
  };
  const deleteSubcontractor = (id: string) => {
    if (expenses.some(e => e.subcontractorId === id)) { alert("لا يمكن الحذف لوجود حركات مالية"); return; }
    setSubcontractors(prev => prev.filter(s => s.id !== id));
  };
  const updateSubcontractor = (id: string, updates: Partial<Subcontractor>) => {
      setSubcontractors(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const saveSubAgreement = (agreement: SubcontractorAgreement) => {
      setSubAgreements(prev => {
          const index = prev.findIndex(a => a.contractId === agreement.contractId && a.subcontractorId === agreement.subcontractorId);
          if (index >= 0) {
              const newArr = [...prev];
              newArr[index] = agreement;
              return newArr;
          }
          return [...prev, agreement];
      });
  };

  const getSubAgreement = (contractId: string, subId: string) => {
      return subAgreements.find(a => a.contractId === contractId && a.subcontractorId === subId);
  };

  // --- Expenses ---
  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = { ...expenseData, id: `exp-${Date.now()}` };
    setExpenses(prev => [...prev, newExpense]);
  };
  const updateExpense = (id: string, updates: Partial<Expense>) => {
      setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };
  const deleteExpense = (id: string) => {
      setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const payPartialDebt = (originalExpense: Expense, amountToPay: number, paymentDate: number, attachmentUrl?: string) => {
      setExpenses(prev => prev.map(e => {
          if (e.id === originalExpense.id) {
              const currentPaid = e.paidAmount || 0;
              const newPaid = Math.min(e.amount, currentPaid + amountToPay);
              
              const newHistoryItem: PaymentHistoryEntry = {
                  id: `hist-${Date.now()}`,
                  date: paymentDate,
                  amount: amountToPay,
                  attachmentUrl: attachmentUrl
              };

              return {
                  ...e,
                  paidAmount: newPaid,
                  paymentHistory: [...(e.paymentHistory || []), newHistoryItem]
              };
          }
          return e;
      }));
  };

  // --- Payments ---
  const addPayment = (paymentData: Omit<ReceivedPayment, 'id'>) => {
      const newPayment: ReceivedPayment = { ...paymentData, id: `rcv-${Date.now()}` };
      setReceivedPayments(prev => [...prev, newPayment]);
  };
  const deletePayment = (id: string) => {
    setReceivedPayments(prev => prev.filter(p => p.id !== id));
  };
  
  // --- Helpers ---
  const getContractExpenses = (contractId: string) => {
    return expenses.filter(e => e.contractId === contractId);
  };
  
  const getContractPayments = (contractId: string) => {
    return receivedPayments.filter(p => p.contractId === contractId);
  };

  const getSupplierBalance = (supplierId: string) => {
    const supplierExpenses = expenses.filter(e => e.supplierId === supplierId);
    const totalOwed = supplierExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalPaid = supplierExpenses.reduce((sum, e) => sum + (e.paidAmount || (e.paymentMethod === 'Cash' ? e.amount : 0)), 0);
    return totalOwed - totalPaid;
  };
  
  const getWorkerBalance = (workerId: string) => {
    const workerExpenses = expenses.filter(e => e.workerId === workerId);
    const totalOwed = workerExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalPaid = workerExpenses.reduce((sum, e) => sum + (e.paidAmount || (e.paymentMethod === 'Cash' ? e.amount : 0)), 0);
    return totalOwed - totalPaid;
  };

  const getSubcontractorBalance = (subId: string) => {
    const subExpenses = expenses.filter(e => e.subcontractorId === subId);
    const totalOwed = subExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalPaid = subExpenses.reduce((sum, e) => sum + (e.paidAmount || (e.paymentMethod === 'Cash' ? e.amount : 0)), 0);
    return totalOwed - totalPaid;
  };

  const getContractFinancials = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return { totalReceived: 0, totalSpent: 0, profit: 0, progress: 0 };

    const payments = getContractPayments(contractId);
    const contractExpenses = getContractExpenses(contractId);
    
    const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalSpent = contractExpenses.reduce((sum, e) => sum + e.amount, 0);
    const profit = totalReceived - totalSpent;
    const progress = contract.totalContractValue > 0 ? (totalReceived / contract.totalContractValue) * 100 : 0;
    
    return { totalReceived, totalSpent, profit, progress };
  };

  const getGlobalFinancials = () => {
    const totalReceived = receivedPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalCashSpent = expenses.filter(e => e.paymentMethod === 'Cash').reduce((sum, e) => sum + e.amount, 0);
    const creditExpenses = expenses.filter(e => e.paymentMethod === 'Credit');
    const totalDebt = creditExpenses.reduce((sum, e) => sum + (e.amount - (e.paidAmount || 0)), 0);

    return { totalReceived, totalCashSpent, totalDebt };
  };

  const value = {
      contracts, suppliers, workers, subcontractors, subAgreements, expenses, receivedPayments,
      createContractFromQuote, updateContractStatus, updateContractDetails,
      addSupplier, deleteSupplier, updateSupplier,
      addWorker, deleteWorker, updateWorker,
      addSubcontractor, deleteSubcontractor, updateSubcontractor,
      saveSubAgreement, getSubAgreement,
      addExpense, updateExpense, deleteExpense, payPartialDebt,
      addPayment, deletePayment,
      getContractExpenses, getContractPayments,
      getSupplierBalance, getWorkerBalance, getSubcontractorBalance,
      getContractFinancials, getGlobalFinancials,
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};

export const useContract = () => {
    const context = useContext(ContractContext);
    if (context === undefined) {
        throw new Error('useContract must be used within a ContractProvider');
    }
    return context;
};
