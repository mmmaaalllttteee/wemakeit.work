'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, FileText, PenTool, Type, Upload } from 'lucide-react';

interface SignatureFlowProps {
  contractId: string;
  partyId: string;
  partyName: string;
  contractTitle: string;
  contractContent: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function SignatureFlow({
  contractId,
  partyId,
  partyName,
  contractTitle,
  contractContent,
  onComplete,
  onCancel,
}: SignatureFlowProps) {
  const [step, setStep] = useState<'review' | 'sign' | 'complete'>('review');
  const [signatureMethod, setSignatureMethod] = useState<'drawn' | 'typed' | 'uploaded'>('drawn');
  const [signatureData, setSignatureData] = useState<string>('');
  const [typedName, setTypedName] = useState(partyName);
  const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAgreed, setHasAgreed] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Initialize canvas for drawing
  useEffect(() => {
    if (canvasRef.current && signatureMethod === 'drawn') {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;

      const context = canvas.getContext('2d');
      if (context) {
        context.scale(2, 2);
        context.lineCap = 'round';
        context.strokeStyle = '#000';
        context.lineWidth = 2;
        contextRef.current = context;
      }
    }
  }, [signatureMethod]);

  // Drawing handlers
  const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = nativeEvent;
    if (contextRef.current) {
      contextRef.current.beginPath();
      contextRef.current.moveTo(offsetX, offsetY);
      setIsDrawing(true);
    }
  };

  const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current) {return;}
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (contextRef.current) {
      contextRef.current.closePath();
      setIsDrawing(false);

      // Save signature as base64
      if (canvasRef.current) {
        setSignatureData(canvasRef.current.toDataURL('image/png'));
      }
    }
  };

  const clearSignature = () => {
    if (canvasRef.current && contextRef.current) {
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setSignatureData('');
    }
  };

  // Generate typed signature
  const generateTypedSignature = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.font = '36px "Dancing Script", cursive';
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedName, 200, 50);
      setSignatureData(canvas.toDataURL('image/png'));
    }
  };

  useEffect(() => {
    if (signatureMethod === 'typed' && typedName) {
      generateTypedSignature();
    }
  }, [typedName, signatureMethod]);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSignatureData(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit signature
  const handleSubmit = async () => {
    if (!signatureData) {
      setError('Please provide a signature');
      return;
    }

    if (!hasAgreed) {
      setError('You must agree to the terms to sign');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/contracts/${contractId}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          partyId,
          signatureData,
          method: signatureMethod,
        }),
      });

      if (!response.ok) {throw new Error('Failed to sign contract');}

      setStep('complete');
      setTimeout(() => {
        onComplete?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign contract');
    } finally {
      setLoading(false);
    }
  };

  // Render steps
  if (step === 'complete') {
    return (
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '48px 24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <Check size={40} color="white" />
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>
          Contract Signed!
        </h2>
        <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>
          Your signature has been recorded. You will receive a copy via email.
        </p>
      </div>
    );
  }

  if (step === 'sign') {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Sign Contract</h2>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>{contractTitle}</p>
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

        {/* Signature Method Selection */}
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
            style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}
          >
            Signature Method
          </label>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            {[
              { method: 'drawn', icon: PenTool, label: 'Draw' },
              { method: 'typed', icon: Type, label: 'Type' },
              { method: 'uploaded', icon: Upload, label: 'Upload' },
            ].map((option) => (
              <button
                key={option.method}
                onClick={() => {
                  setSignatureMethod(option.method as any);
                  setSignatureData('');
                }}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: signatureMethod === option.method ? '#3b82f6' : 'white',
                  color: signatureMethod === option.method ? 'white' : '#6b7280',
                  border: `2px solid ${signatureMethod === option.method ? '#3b82f6' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                <option.icon size={20} />
                {option.label}
              </button>
            ))}
          </div>

          {/* Draw Signature */}
          {signatureMethod === 'drawn' && (
            <div>
              <div
                style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  marginBottom: '12px',
                }}
              >
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  style={{
                    width: '100%',
                    height: '200px',
                    cursor: 'crosshair',
                    background: 'white',
                  }}
                />
              </div>
              <button
                onClick={clearSignature}
                style={{
                  padding: '8px 16px',
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#6b7280',
                }}
              >
                Clear
              </button>
            </div>
          )}

          {/* Type Signature */}
          {signatureMethod === 'typed' && (
            <div>
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Type your full name"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginBottom: '16px',
                }}
              />
              {signatureData && (
                <div
                  style={{
                    padding: '24px',
                    background: 'white',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <img
                    src={signatureData}
                    alt="Signature preview"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Upload Signature */}
          {signatureMethod === 'uploaded' && (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="signature-upload"
              />
              <label
                htmlFor="signature-upload"
                style={{
                  display: 'block',
                  padding: '48px',
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  marginBottom: '16px',
                }}
              >
                <Upload size={32} style={{ margin: '0 auto 12px', color: '#9ca3af' }} />
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  Click to upload signature image
                </p>
              </label>
              {signatureData && (
                <div
                  style={{
                    padding: '16px',
                    background: 'white',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <img
                    src={signatureData}
                    alt="Uploaded signature"
                    style={{ maxWidth: '100%', maxHeight: '150px' }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Agreement Checkbox */}
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
            style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}
          >
            <input
              type="checkbox"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              style={{ marginTop: '4px' }}
            />
            <span style={{ fontSize: '14px', color: '#374151' }}>
              I agree that by signing this document electronically, I am legally bound by this
              contract as if I had signed a physical copy. I confirm that I have read and understood
              the terms and conditions.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setStep('review')}
            style={{
              padding: '12px 24px',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              color: '#6b7280',
            }}
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !signatureData || !hasAgreed}
            style={{
              padding: '12px 24px',
              background:
                loading || !signatureData || !hasAgreed
                  ? '#9ca3af'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              borderRadius: '8px',
              cursor: loading || !signatureData || !hasAgreed ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              color: 'white',
            }}
          >
            {loading ? 'Signing...' : 'Sign Contract'}
          </button>
        </div>
      </div>
    );
  }

  // Review Step
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
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
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <FileText size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Review Contract</h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              {contractTitle}
            </p>
          </div>
        </div>
      </div>

      {/* Contract Content */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          maxHeight: '500px',
          overflowY: 'auto',
        }}
      >
        <div
          style={{ fontSize: '14px', lineHeight: '1.6', color: '#374151' }}
          dangerouslySetInnerHTML={{ __html: contractContent }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '12px 24px',
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
          onClick={() => setStep('sign')}
          style={{
            padding: '12px 24px',
            background: '#3b82f6',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <PenTool size={16} />
          Proceed to Sign
        </button>
      </div>
    </div>
  );
}
