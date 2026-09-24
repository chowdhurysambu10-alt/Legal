import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import DocumentHistory from '../DocumentHistory';

describe('DocumentHistory Component State Validation', () => {
  it('renders clean empty state with icon and guidance when no documents exist', () => {
    render(
      <DocumentHistory
        documents={[]}
        activeDocId={null}
        onSelectDoc={vi.fn()}
        onDocDeleted={vi.fn()}
      />
    );

    expect(screen.getByText(/No documents yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload a contract or run a quick demo/i)).toBeInTheDocument();
  });

  it('renders list of contracts when documents array is populated', () => {
    const mockDocs = [
      {
        id: 'doc-alpha',
        filename: 'Alpha_Corp_MSA.pdf',
        file_size: 15420,
        page_count: 4,
        overall_risk_score: 'HIGH',
        upload_date: '2026-09-24T12:00:00Z'
      },
      {
        id: 'doc-beta',
        filename: 'Beta_Employment_Agreement.pdf',
        file_size: 8900,
        page_count: 2,
        overall_risk_score: 'LOW',
        upload_date: '2026-09-24T12:30:00Z'
      }
    ];

    render(
      <DocumentHistory
        documents={mockDocs}
        activeDocId="doc-alpha"
        onSelectDoc={vi.fn()}
        onDocDeleted={vi.fn()}
      />
    );

    expect(screen.getByText('Alpha_Corp_MSA.pdf')).toBeInTheDocument();
    expect(screen.getByText('Beta_Employment_Agreement.pdf')).toBeInTheDocument();
    expect(screen.getByText('HIGH RISK')).toBeInTheDocument();
  });

  it('triggers onSelectDoc callback when a contract item is clicked', () => {
    const onSelectMock = vi.fn();
    const mockDocs = [
      {
        id: 'doc-alpha',
        filename: 'Alpha_Corp_MSA.pdf',
        file_size: 15420,
        page_count: 4,
        overall_risk_score: 'MEDIUM',
        upload_date: '2026-09-24T12:00:00Z'
      }
    ];

    render(
      <DocumentHistory
        documents={mockDocs}
        activeDocId={null}
        onSelectDoc={onSelectMock}
        onDocDeleted={vi.fn()}
      />
    );

    const docButton = screen.getByText('Alpha_Corp_MSA.pdf').closest('div[role="button"]') || screen.getByText('Alpha_Corp_MSA.pdf');
    fireEvent.click(docButton);
    expect(onSelectMock).toHaveBeenCalledWith('doc-alpha');
  });
});
