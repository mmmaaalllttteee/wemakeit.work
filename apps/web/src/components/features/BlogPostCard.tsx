'use client';

import React from 'react';
import { Calendar, User, Clock, ArrowRight } from 'lucide-react';

interface BlogPostCardProps {
  post: {
    id: string;
    attributes: {
      title: string;
      slug: string;
      excerpt: string;
      publishedAt: string;
      readTime?: number;
      featuredImage?: {
        data?: {
          attributes: {
            url: string;
            formats?: any;
          };
        };
      };
      author?: {
        data?: {
          attributes: {
            name: string;
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
    };
  };
  onPostClick?: (slug: string) => void;
}

export default function BlogPostCard({ post, onPostClick }: BlogPostCardProps) {
  const { attributes } = post;
  const author = attributes.author?.data?.attributes;
  const category = attributes.category?.data?.attributes;
  const image = attributes.featuredImage?.data?.attributes;

  const handleClick = () => {
    if (onPostClick) {
      onPostClick(attributes.slug);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        cursor: onPostClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        if (onPostClick) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)';
        }
      }}
      onMouseLeave={(e) => {
        if (onPostClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
        }
      }}
    >
      {/* Featured Image */}
      {image && (
        <div
          style={{
            width: '100%',
            height: '220px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <img
            src={image.formats?.medium?.url || image.url}
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
                top: '16px',
                left: '16px',
                padding: '6px 12px',
                background: 'rgba(59, 130, 246, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '6px',
                fontSize: '12px',
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
      <div style={{ padding: '24px' }}>
        <h3
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#1f2937',
            marginBottom: '12px',
            lineHeight: '1.4',
          }}
        >
          {attributes.title}
        </h3>

        <p
          style={{
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: '1.6',
            marginBottom: '16px',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {attributes.excerpt}
        </p>

        {/* Meta Info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '13px',
            color: '#9ca3af',
            flexWrap: 'wrap',
          }}
        >
          {author && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} />
              <span>{author.name}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} />
            <span>{new Date(attributes.publishedAt).toLocaleDateString('de-DE')}</span>
          </div>

          {attributes.readTime && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} />
              <span>{attributes.readTime} min read</span>
            </div>
          )}
        </div>

        {onPostClick && (
          <div
            style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(0, 0, 0, 0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#3b82f6',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Read More
            <ArrowRight size={16} />
          </div>
        )}
      </div>
    </div>
  );
}
