import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import RiskFlagsCard from '../RiskFlagsCard';
import UploadModal from '../UploadModal';
import { LegalContext } from '../../context/LegalContext';
import { BrowserRouter } from 'react-router-dom';

const mockFlags = [
  {
    severity: 'HIGH',
    category: 'Indemnity',
    title: 'Section 5 Indemnity',
    clause_excerpt: 'Contractor assumes all risk.',
    analysis: 'Uncapped liability for contractor.',
    recommendation: 'Cap indemnification.'
  },
  {
    severity: 'LOW',
    category: 'Governing Law',
    title: 'Section 9 Jurisdiction',
    clause_excerpt: 'Delaware state courts.',
    analysis: 'Delaware state law applies.',
    recommendation: 'Standard governing law.'
  }
];

describe('RiskFlagsCard Accessibility & Display', () => {
  it('renders risk items and provides accessible severity badges with icons', () => {
    render(<RiskFlagsCard riskFlags={mockFlags} />);
    
    expect(screen.getByText(/Legal Risk Exposure/i)).toBeInTheDocument();
    expect(screen.getByText(/2 flagged risk factors/i)).toBeInTheDocument();

    const highBadge = screen.getByRole('status', { name: /Severity level: HIGH/i });
    expect(highBadge).toBeInTheDocument();
  });

  it('filters risks accurately when severity tab is selected', () => {
    render(<RiskFlagsCard riskFlags={mockFlags} />);
    
    const highTab = screen.getByRole('button', { name: /^HIGH$/ });
    fireEvent.click(highTab);

    expect(screen.getByText(/Section 5 Indemnity/i)).toBeInTheDocument();
    expect(screen.queryByText(/Section 9 Jurisdiction/i)).not.toBeInTheDocument();
  });
});

describe('UploadModal Accessibility', () => {
  const mockContextValue = {
    uploadFile: vi.fn(),
    uploading: false,
    uploadProgressStep: 0
  };

  it('renders with role="dialog", aria-modal="true", and responds to Escape key', () => {
    const handleClose = vi.fn();
    render(
      <BrowserRouter>
        <LegalContext.Provider value={mockContextValue}>
          <UploadModal isOpen={true} onClose={handleClose} />
        </LegalContext.Provider>
      </BrowserRouter>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
