import React from 'react';
// FIX: Corrected import path for types
import { SavedQuote, CompanyInfo } from '../core/types';

// New Document Header
export const PrintLayoutHeader: React.FC<{ quote: SavedQuote; companyInfo: CompanyInfo }> = ({ quote, companyInfo }) => (
    <header className="doc-print-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '3mm', borderBottom: '2pt solid #000' }}>
        <div style={{ flex: '1' }}>
            {companyInfo.logoUrl && (
                <img src={companyInfo.logoUrl} alt="Company Logo" style={{ height: '15mm', marginBottom: '3mm', display: 'block' }} />
            )}
            <h1 style={{ fontWeight: 900, fontSize: '14pt', margin: 0 }}>{companyInfo.name}</h1>
            <p style={{ fontSize: '9pt', margin: '1mm 0 0 0', color: '#333' }}>{companyInfo.address} | {companyInfo.phone}</p>
        </div>
        <div style={{ textAlign: 'left', fontFamily: 'monospace', fontSize: '9pt', paddingTop: '2mm' }}>
            <p style={{ margin: 0 }}><strong>Ref:</strong> {quote.offerNumber}</p>
            <p style={{ margin: '1mm 0 0 0' }}><strong>Date:</strong> {new Date(quote.printedAt || Date.now()).toLocaleDateString('en-GB')}</p>
        </div>
    </header>
);


// New Document Footer with Signatures
export const PrintLayoutFooter: React.FC<{ employeeName: string }> = ({ employeeName }) => (
    <footer className="doc-print-footer">
        <div className="w-[45%]">
            <div className="w-full h-12 border-b border-black"></div>
            <p className="font-bold pt-1">توقيع المهندس: <span className="font-normal">{employeeName}</span></p>
        </div>
        <div className="w-[10%] text-center text-xs text-slate-500 page-number-container">
            {/* Page number is injected here via CSS counter */}
        </div>
        <div className="w-[45%] text-left">
            <div className="w-full h-12 border-b border-black"></div>
            <p className="font-bold pt-1">توقيع العميل:</p>
        </div>
    </footer>
);

// Section Title component
export const TitleBar: React.FC<{ title: string }> = ({ title }) => (
    <h2 className="doc-print-title-bar">{title}</h2>
);

// The main page container component
export const PrintPageLayout: React.FC<{ 
    quote: SavedQuote;
    companyInfo: CompanyInfo;
    children: React.ReactNode; 
}> = ({ quote, companyInfo, children }) => (
    <div className="doc-print-page">
        <PrintLayoutHeader quote={quote} companyInfo={companyInfo} />
        <main className="doc-print-content">
            {children}
        </main>
        {quote.printSettings.showFooter && <PrintLayoutFooter employeeName={quote.projectDetails.employeeName} />}
    </div>
);