'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, PanInfo } from 'framer-motion';
import {
  Plus,
  Image,
  Link,
  Type,
  Square,
  Circle,
  ZoomIn,
  ZoomOut,
  Grid,
} from 'lucide-react';

interface MoodItem {
  id: string;
  type: 'image' | 'video' | 'audio' | 'file' | 'link' | 'text' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  opacity: number;
  fileId?: string;
  linkUrl?: string;
  textContent?: string;
  metadata?: {
    oEmbed?: any;
    fontSize?: number;
    shapeType?: 'rectangle' | 'circle' | 'line' | 'arrow';
    locked?: boolean;
    [key: string]: any;
  };
  comments?: Array<{
    id: string;
    userId: string;
    userName: string;
    text: string;
    createdAt: Date;
  }>;
  reactions?: Array<{
    emoji: string;
    userId: string;
    userName: string;
  }>;
}

interface MoodboardSettings {
  backgroundColor?: string;
  gridEnabled?: boolean;
  gridSize?: number;
  snapToGrid?: boolean;
  zoom?: number;
  viewX?: number;
  viewY?: number;
}

interface MoodboardCanvasProps {
  moodboardId: string;
  projectId: string;
  items: MoodItem[];
  settings: MoodboardSettings;
  onUpdateSettings: (settings: Partial<MoodboardSettings>) => void;
  onAddItem: (item: Partial<MoodItem>) => Promise<void>;
  onUpdateItem: (itemId: string, updates: Partial<MoodItem>) => Promise<void>;
  onBulkUpdateItems: (updates: Record<string, Partial<MoodItem>>) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  readOnly?: boolean;
}

export default function MoodboardCanvas({
  items,
  settings,
  onUpdateSettings,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  readOnly = false,
}: MoodboardCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(settings.zoom || 1);
  const [viewX, setViewX] = useState(settings.viewX || 0);
  const [viewY, setViewY] = useState(settings.viewY || 0);
  const [isPanning, setIsPanning] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [draggedItems, setDraggedItems] = useState<Record<string, { x: number; y: number }>>({});
  const [showGrid, setShowGrid] = useState(settings.gridEnabled ?? true);
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Sync zoom and view position with settings
  useEffect(() => {
    if (settings.zoom !== undefined && settings.zoom !== zoom) {
      setZoom(settings.zoom);
    }
    if (settings.viewX !== undefined && settings.viewX !== viewX) {
      setViewX(settings.viewX);
    }
    if (settings.viewY !== undefined && settings.viewY !== viewY) {
      setViewY(settings.viewY);
    }
  }, [settings]);

  // Save view position when changed
  const saveViewPosition = useCallback(() => {
    onUpdateSettings({ zoom, viewX, viewY });
  }, [zoom, viewX, viewY, onUpdateSettings]);

  // Zoom controls
  const handleZoomIn = () => {
    const newZoom = Math.min(zoom * 1.2, 3);
    setZoom(newZoom);
    onUpdateSettings({ zoom: newZoom });
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom / 1.2, 0.1);
    setZoom(newZoom);
    onUpdateSettings({ zoom: newZoom });
  };

  const handleResetView = () => {
    setZoom(1);
    setViewX(0);
    setViewY(0);
    onUpdateSettings({ zoom: 1, viewX: 0, viewY: 0 });
  };

  // Canvas panning
  const handleCanvasPan = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isPanning) {return;}
    const newViewX = viewX + info.delta.x / zoom;
    const newViewY = viewY + info.delta.y / zoom;
    setViewX(newViewX);
    setViewY(newViewY);
  };

  const handleCanvasPanEnd = () => {
    setIsPanning(false);
    saveViewPosition();
  };

  // Item dragging
  const handleItemDragStart = (itemId: string) => {
    if (readOnly) {return;}
    setDraggedItems((prev) => ({
      ...prev,
      [itemId]: { x: 0, y: 0 },
    }));
  };

  const handleItemDrag = (itemId: string, info: PanInfo) => {
    if (readOnly) {return;}
    setDraggedItems((prev) => ({
      ...prev,
      [itemId]: {
        x: (prev[itemId]?.x || 0) + info.delta.x / zoom,
        y: (prev[itemId]?.y || 0) + info.delta.y / zoom,
      },
    }));
  };

  const handleItemDragEnd = async (itemId: string) => {
    if (readOnly) {return;}
    const delta = draggedItems[itemId];
    if (!delta) {return;}

    const item = items.find((i) => i.id === itemId);
    if (!item) {return;}

    let newX = item.x + delta.x;
    let newY = item.y + delta.y;

    // Snap to grid if enabled
    if (settings.snapToGrid && settings.gridSize) {
      newX = Math.round(newX / settings.gridSize) * settings.gridSize;
      newY = Math.round(newY / settings.gridSize) * settings.gridSize;
    }

    await onUpdateItem(itemId, { x: newX, y: newY });
    setDraggedItems((prev) => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
  };

  // Item selection
  const handleItemClick = (itemId: string, event: React.MouseEvent) => {
    if (readOnly) {return;}
    event.stopPropagation();

    if (event.shiftKey || event.metaKey || event.ctrlKey) {
      // Multi-select
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(itemId)) {
          newSet.delete(itemId);
        } else {
          newSet.add(itemId);
        }
        return newSet;
      });
    } else {
      // Single select
      setSelectedItems(new Set([itemId]));
    }
  };

  const handleCanvasClick = () => {
    setSelectedItems(new Set());
  };

  // Delete selected items
  const handleDeleteSelected = async () => {
    if (readOnly || selectedItems.size === 0) {return;}
    for (const itemId of selectedItems) {
      await onDeleteItem(itemId);
    }
    setSelectedItems(new Set());
  };

  // Toggle grid
  const handleToggleGrid = () => {
    const newShowGrid = !showGrid;
    setShowGrid(newShowGrid);
    onUpdateSettings({ gridEnabled: newShowGrid });
  };

  // Add item handlers
  const handleAddImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {return;}

      // TODO: Upload file using FileUpload component or API
      // For now, create placeholder
      await onAddItem({
        type: 'image',
        x: -viewX + 100,
        y: -viewY + 100,
        width: 300,
        height: 200,
        rotation: 0,
        zIndex: items.length,
      });
    };
    input.click();
    setShowAddMenu(false);
  };

  const handleAddText = async () => {
    await onAddItem({
      type: 'text',
      x: -viewX + 100,
      y: -viewY + 100,
      width: 400,
      height: 100,
      rotation: 0,
      zIndex: items.length,
      textContent: 'Double-click to edit',
      metadata: { fontSize: 24 },
    });
    setShowAddMenu(false);
  };

  const handleAddShape = async (shapeType: 'rectangle' | 'circle') => {
    await onAddItem({
      type: 'shape',
      x: -viewX + 100,
      y: -viewY + 100,
      width: 200,
      height: 200,
      rotation: 0,
      zIndex: items.length,
      metadata: { shapeType },
    });
    setShowAddMenu(false);
  };

  const handleAddLink = async () => {
    const url = prompt('Enter URL:');
    if (!url) {return;}

    await onAddItem({
      type: 'link',
      x: -viewX + 100,
      y: -viewY + 100,
      width: 400,
      height: 300,
      rotation: 0,
      zIndex: items.length,
      linkUrl: url,
    });
    setShowAddMenu(false);
  };

  // Render item based on type
  const renderItem = (item: MoodItem) => {
    const delta = draggedItems[item.id] || { x: 0, y: 0 };
    const x = item.x + delta.x;
    const y = item.y + delta.y;
    const isSelected = selectedItems.has(item.id);

    const itemStyle = {
      position: 'absolute' as const,
      left: x,
      top: y,
      width: item.width,
      height: item.height,
      transform: `rotate(${item.rotation}deg)`,
      opacity: item.opacity,
      zIndex: item.zIndex,
      cursor: readOnly ? 'default' : 'move',
      border: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
    };

    return (
      <motion.div
        key={item.id}
        style={itemStyle}
        drag={!readOnly && !item.metadata?.locked}
        dragMomentum={false}
        dragElastic={0}
        onDragStart={() => handleItemDragStart(item.id)}
        onDrag={(e, info) => handleItemDrag(item.id, info)}
        onDragEnd={() => handleItemDragEnd(item.id)}
        onClick={(e) => handleItemClick(item.id, e)}
        whileHover={!readOnly ? { scale: 1.02 } : undefined}
      >
        {item.type === 'image' && item.fileId && (
          <img
            src={`/api/v1/files/${item.fileId}/download`}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
          />
        )}

        {item.type === 'text' && (
          <div
            style={{
              padding: '16px',
              fontSize: item.metadata?.fontSize || 24,
              fontWeight: 500,
              color: '#1f2937',
              overflow: 'hidden',
              wordWrap: 'break-word',
            }}
          >
            {item.textContent || 'Text'}
          </div>
        )}

        {item.type === 'shape' && item.metadata?.shapeType === 'rectangle' && (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '6px',
            }}
          />
        )}

        {item.type === 'shape' && item.metadata?.shapeType === 'circle' && (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '50%',
            }}
          />
        )}

        {item.type === 'link' && (
          <div style={{ padding: '16px', overflow: 'hidden' }}>
            {item.metadata?.oEmbed?.thumbnail_url && (
              <img
                src={item.metadata.oEmbed.thumbnail_url}
                alt={item.metadata.oEmbed.title}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  marginBottom: '12px',
                }}
              />
            )}
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
              {item.metadata?.oEmbed?.title || item.linkUrl}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              {item.metadata?.oEmbed?.provider_name || new URL(item.linkUrl || '').hostname}
            </div>
          </div>
        )}

        {/* Reactions */}
        {item.reactions && item.reactions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '-10px',
              right: '-10px',
              display: 'flex',
              gap: '4px',
              padding: '4px 8px',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            {item.reactions.slice(0, 3).map((reaction, idx) => (
              <span key={idx} style={{ fontSize: '14px' }}>
                {reaction.emoji}
              </span>
            ))}
            {item.reactions.length > 3 && (
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                +{item.reactions.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Comments indicator */}
        {item.comments && item.comments.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              background: '#3b82f6',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            {item.comments.length}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div
      ref={canvasRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        background: settings.backgroundColor || '#1a1a1a',
        userSelect: 'none',
      }}
      onClick={handleCanvasClick}
    >
      {/* Grid */}
      {showGrid && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: `${(settings.gridSize || 20) * zoom}px ${(settings.gridSize || 20) * zoom}px`,
            backgroundPosition: `${viewX * zoom}px ${viewY * zoom}px`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Canvas workspace */}
      <motion.div
        drag={isPanning}
        dragMomentum={false}
        dragElastic={0}
        onPan={handleCanvasPan}
        onPanEnd={handleCanvasPanEnd}
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${zoom}) translate(${viewX}px, ${viewY}px)`,
          transformOrigin: '0 0',
          cursor: isPanning ? 'grabbing' : 'grab',
        }}
      >
        {items.map(renderItem)}
      </motion.div>

      {/* Toolbar */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '12px',
          padding: '12px 16px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
        }}
      >
        {!readOnly && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              style={{
                padding: '8px 16px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              <Plus size={18} />
              Add
            </button>

            {showAddMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '8px',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  padding: '8px',
                  minWidth: '180px',
                  zIndex: 1001,
                }}
              >
                {[
                  { icon: Image, label: 'Image', onClick: handleAddImage },
                  { icon: Link, label: 'Link', onClick: handleAddLink },
                  { icon: Type, label: 'Text', onClick: handleAddText },
                  { icon: Square, label: 'Rectangle', onClick: () => handleAddShape('rectangle') },
                  { icon: Circle, label: 'Circle', onClick: () => handleAddShape('circle') },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={item.onClick}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '14px',
                      color: '#1f2937',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ width: '1px', background: '#e5e7eb' }} />

        <button
          onClick={handleZoomOut}
          style={{
            padding: '8px',
            background: 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: '#6b7280',
          }}
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>

        <button
          onClick={handleResetView}
          style={{
            padding: '8px 12px',
            background: 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            color: '#6b7280',
          }}
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          onClick={handleZoomIn}
          style={{
            padding: '8px',
            background: 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: '#6b7280',
          }}
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </button>

        <div style={{ width: '1px', background: '#e5e7eb' }} />

        <button
          onClick={handleToggleGrid}
          style={{
            padding: '8px',
            background: showGrid ? '#f3f4f6' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: '#6b7280',
          }}
          title="Toggle Grid"
        >
          <Grid size={18} />
        </button>

        {!readOnly && selectedItems.size > 0 && (
          <>
            <div style={{ width: '1px', background: '#e5e7eb' }} />
            <button
              onClick={handleDeleteSelected}
              style={{
                padding: '8px 16px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Delete ({selectedItems.size})
            </button>
          </>
        )}
      </div>

      {/* Pan mode hint */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '8px 16px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          borderRadius: '8px',
          fontSize: '12px',
          opacity: isPanning ? 1 : 0,
          transition: 'opacity 0.2s',
          pointerEvents: 'none',
        }}
      >
        Hold Space to pan canvas
      </div>

      {/* Keyboard shortcuts listener */}
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' && !isPanning) {
            e.preventDefault();
            setIsPanning(true);
          }
          if (
            (e.key === 'Delete' || e.key === 'Backspace') &&
            selectedItems.size > 0 &&
            !readOnly
          ) {
            e.preventDefault();
            handleDeleteSelected();
          }
        }}
        onKeyUp={(e) => {
          if (e.key === ' ' && isPanning) {
            setIsPanning(false);
            saveViewPosition();
          }
        }}
        style={{ position: 'absolute', inset: 0, outline: 'none' }}
      />
    </div>
  );
}
