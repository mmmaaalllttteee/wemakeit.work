'use client';

import React from 'react';
import { Calendar, Clock, Tag, ArrowLeft } from 'lucide-react';

interface BlogPostDetailProps {
  post: {
    id: string;
    attributes: {
      title: string;
      content: string;
      publishedAt: string;
      readTime?: number;
      featuredImage?: {
        data?: {
          attributes: {
            url: string;
          };
        };
      };
      author?: {
        data?: {
          attributes: {
            name: string;
            bio?: string;
            avatar?: any;
          };
        };
      };
      category?: {
        data?: {
          attributes: {
            name: string;
            slug: string;
          };
        };
      };
      tags?: {
        data?: Array<{
          attributes: {
            name: string;
            slug: string;
          };
        }>;
      };
    };
  };
  onBack?: () => void;
}

export default function BlogPostDetail({ post, onBack }: BlogPostDetailProps) {
  const { attributes } = post;
  const author = attributes.author?.data?.attributes;
  const category = attributes.category?.data?.attributes;
  const image = attributes.featuredImage?.data?.attributes;
  const tags = attributes.tags?.data || [];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            color: '#6b7280',
            marginBottom: '24px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
            e.currentTarget.style.color = '#3b82f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          <ArrowLeft size={18} />
          Back to Blog
        </button>
      )}

      {/* Article Container */}
      <article
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}
      >
        {/* Featured Image */}
        {image && (
          <div
            style={{
              width: '100%',
              height: '400px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <img
              src={image.url}
              alt={attributes.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {category && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  left: '24px',
                  padding: '8px 16px',
                  background: 'rgba(59, 130, 246, 0.9)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'white',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {category.name}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '48px' }}>
          {/* Title */}
          <h1
            style={{
              fontSize: '36px',
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: '24px',
              lineHeight: '1.2',
            }}
          >
            {attributes.title}
          </h1>

          {/* Meta Info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              paddingBottom: '24px',
              marginBottom: '32px',
              borderBottom: '2px solid rgba(0, 0, 0, 0.06)',
              flexWrap: 'wrap',
            }}
          >
            {author && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600,
                  }}
                >
                  {author.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>
                    {author.name}
                  </div>
                  {author.bio && (
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>{author.bio}</div>
                  )}
                </div>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                color: '#6b7280',
              }}
            >
              <Calendar size={16} />
              <span>{new Date(attributes.publishedAt).toLocaleDateString('de-DE')}</span>
            </div>

            {attributes.readTime && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  color: '#6b7280',
                }}
              >
                <Clock size={16} />
                <span>{attributes.readTime} min read</span>
              </div>
            )}
          </div>

          {/* Article Content */}
          <div
            style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#374151',
              marginBottom: '32px',
            }}
            dangerouslySetInnerHTML={{ __html: attributes.content }}
          />

          {/* Tags */}
          {tags.length > 0 && (
            <div
              style={{
                paddingTop: '32px',
                borderTop: '2px solid rgba(0, 0, 0, 0.06)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <Tag size={18} color="#6b7280" />
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#3b82f6',
                    }}
                  >
                    {tag.attributes.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
