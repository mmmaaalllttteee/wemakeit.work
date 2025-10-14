'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Save, Send, Eye, X } from 'lucide-react';

interface ContractVariable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'email' | 'currency' | 'select';
  required: boolean;
  defaultValue?: any;
  options?: string[];
  placeholder?: string;
  helpText?: string;
}

interface ContractTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  content: string;
  variables: ContractVariable[];
}

interface ContractParty {
  id?: string;
  name: string;
  email: string;
  role: string;
}

interface ContractEditorProps {
  contractId?: string;
  templateId?: string;
  projectId?: string;
  onSave?: (contract: any) => void;
  onCancel?: () => void;
}

export default function ContractEditor({
  contractId,
  templateId,
  projectId,
  onSave,
  onCancel,
}: ContractEditorProps) {
  const [template, setTemplate] = useState<ContractTemplate | null>(null);
  const [title, setTitle] = useState('');
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [parties, setParties] = useState<ContractParty[]>([
    { name: '', email: '', role: 'Party 1' },
  ]);
  const [preview, setPreview] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load template if provided
  useEffect(() => {
    if (templateId) {
      fetchTemplate();
    } else if (contractId) {
      fetchContract();
    }
  }, [templateId, contractId]);

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`/api/v1/contracts/templates/${templateId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) {throw new Error('Failed to load template');}
      const data = await response.json();
      setTemplate(data);
      setTitle(data.name);

      // Initialize variables with default values
      const initialVars: Record<string, any> = {};
      data.variables.forEach((v: ContractVariable) => {
        initialVars[v.key] = v.defaultValue || '';
      });
      setVariables(initialVars);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load template');
    }
  };

  const fetchContract = async () => {
    try {
      const response = await fetch(`/api/v1/contracts/${contractId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) {throw new Error('Failed to load contract');}
      const data = await response.json();
      setTitle(data.title);
      setVariables(data.variables);
      setParties(data.parties);
      if (data.template) {
        setTemplate(data.template);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contract');
    }
  };

  const handleVariableChange = (key: string, value: any) => {
    setVariables((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddParty = () => {
    setParties([...parties, { name: '', email: '', role: `Party ${parties.length + 1}` }]);
  };

  const handleRemoveParty = (index: number) => {
    if (parties.length > 1) {
      setParties(parties.filter((_, i) => i !== index));
    }
  };

  const handlePartyChange = (index: number, field: keyof ContractParty, value: string) => {
    const updated = [...parties];
    updated[index] = { ...updated[index], [field]: value };
    setParties(updated);
  };

  const generatePreview = () => {
    if (!template) {return;}

    // Simple template replacement (in production, this should be done server-side)
    let {content} = template;
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });
    setPreview(content);
    setShowPreview(true);
  };

  const handleSave = async (sendForSignature = false) => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        templateId: template?.id,
        projectId,
        title,
        variables,
        parties: parties.map((p) => ({ name: p.name, email: p.email, role: p.role })),
      };

      const url = contractId ? `/api/v1/contracts/${contractId}` : '/api/v1/contracts';

      const method = contractId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {throw new Error('Failed to save contract');}
      const contract = await response.json();

      if (sendForSignature) {
        await sendForSignatures(contract.id);
      }

      onSave?.(contract);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save contract');
    } finally {
      setLoading(false);
    }
  };

  const sendForSignatures = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/contracts/${id}/send-for-signature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          partyIds: parties.map((p) => p.id).filter(Boolean),
          sendReminders: true,
        }),
      });

      if (!response.ok) {throw new Error('Failed to send for signature');}
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send for signature');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <FileText size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: '#1f2937' }}>
              {contractId ? 'Edit Contract' : 'New Contract'}
            </h1>
            {template && (
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                Based on: {template.name}
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              color: '#6b7280',
            }}
          >
            Cancel
          </button>
          <button
            onClick={generatePreview}
            disabled={!template}
            style={{
              padding: '10px 20px',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              cursor: template ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 500,
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: template ? 1 : 0.5,
            }}
          >
            <Eye size={16} />
            Preview
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: '#3b82f6',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: loading ? 0.7 : 1,
            }}
          >
            <Save size={16} />
            Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: loading ? 0.7 : 1,
            }}
          >
            <Send size={16} />
            Send for Signature
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '16px',
            background: '#fee2e2',
            borderRadius: '8px',
            marginBottom: '24px',
            color: '#dc2626',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left Column - Form */}
        <div>
          {/* Title */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            }}
          >
            <label
              style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}
            >
              Contract Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
              }}
              placeholder="e.g., Recording Contract - Artist Name"
            />
          </div>

          {/* Variables */}
          {template && template.variables.length > 0 && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
                Contract Details
              </h3>
              {template.variables.map((variable) => (
                <div key={variable.key} style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 500,
                      marginBottom: '6px',
                    }}
                  >
                    {variable.label}
                    {variable.required && <span style={{ color: '#ef4444' }}> *</span>}
                  </label>
                  {variable.type === 'select' ? (
                    <select
                      value={variables[variable.key] || ''}
                      onChange={(e) => handleVariableChange(variable.key, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    >
                      <option value="">Select...</option>
                      {variable.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={variable.type}
                      value={variables[variable.key] || ''}
                      onChange={(e) => handleVariableChange(variable.key, e.target.value)}
                      placeholder={variable.placeholder}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                  )}
                  {variable.helpText && (
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      {variable.helpText}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Parties */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            height: 'fit-content',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Parties</h3>
          {parties.map((party, index) => (
            <div
              key={index}
              style={{
                padding: '16px',
                background: '#f9fafb',
                borderRadius: '8px',
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <label style={{ fontSize: '14px', fontWeight: 600 }}>Party {index + 1}</label>
                {parties.length > 1 && (
                  <button
                    onClick={() => handleRemoveParty(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#ef4444',
                      padding: '4px',
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <input
                type="text"
                value={party.name}
                onChange={(e) => handlePartyChange(index, 'name', e.target.value)}
                placeholder="Full Name"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  marginBottom: '8px',
                }}
              />
              <input
                type="email"
                value={party.email}
                onChange={(e) => handlePartyChange(index, 'email', e.target.value)}
                placeholder="Email"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  marginBottom: '8px',
                }}
              />
              <input
                type="text"
                value={party.role}
                onChange={(e) => handlePartyChange(index, 'role', e.target.value)}
                placeholder="Role (e.g., Artist, Label)"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              />
            </div>
          ))}
          <button
            onClick={handleAddParty}
            style={{
              width: '100%',
              padding: '12px',
              background: 'white',
              border: '2px dashed #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              color: '#6b7280',
            }}
          >
            + Add Party
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowPreview(false)}
        >
          <div
            style={{
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                }}
              >
                <X size={24} />
              </button>
            </div>
            <div
              style={{
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#374151',
              }}
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
