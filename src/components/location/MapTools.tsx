import React, { useState, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  MapPin,
  Circle,
  Square,
  Layers,
  X,
  Save,
  Trash2
} from 'lucide-react';
import L from 'leaflet';

interface MapToolsProps {
  onSaveDrawing?: (data: any) => void;
  onClearDrawing?: () => void;
}

export const MapTools: React.FC<MapToolsProps> = ({
  onSaveDrawing,
  onClearDrawing
}) => {
  const map = useMap();
  const [drawingMode, setDrawingMode] = useState<'marker' | 'circle' | 'rectangle' | null>(null);
  const [drawingLayer, setDrawingLayer] = useState<L.Layer | null>(null);
  const [startPoint, setStartPoint] = useState<L.LatLng | null>(null);

  const handleToolClick = useCallback((mode: 'marker' | 'circle' | 'rectangle' | null) => {
    setDrawingMode(mode);
    if (drawingLayer) {
      map.removeLayer(drawingLayer);
      setDrawingLayer(null);
    }
    setStartPoint(null);
  }, [map, drawingLayer]);

  const handleMapClick = useCallback((e: L.LeafletMouseEvent) => {
    if (!drawingMode) return;

    if (!startPoint) {
      setStartPoint(e.latlng);
      return;
    }

    switch (drawingMode) {
      case 'marker':
        const marker = L.marker(e.latlng);
        setDrawingLayer(marker);
        marker.addTo(map);
        break;
      case 'circle':
        const circle = L.circle(startPoint, {
          radius: startPoint.distanceTo(e.latlng)
        });
        setDrawingLayer(circle);
        circle.addTo(map);
        break;
      case 'rectangle':
        const bounds = L.latLngBounds([startPoint, e.latlng]);
        const rectangle = L.rectangle(bounds);
        setDrawingLayer(rectangle);
        rectangle.addTo(map);
        break;
    }

    setStartPoint(null);
  }, [map, drawingMode, startPoint]);

  const handleSave = useCallback(() => {
    if (drawingLayer) {
      const data = drawingLayer.toGeoJSON();
      onSaveDrawing?.(data);
    }
  }, [drawingLayer, onSaveDrawing]);

  const handleClear = useCallback(() => {
    if (drawingLayer) {
      map.removeLayer(drawingLayer);
      setDrawingLayer(null);
    }
    onClearDrawing?.();
  }, [map, drawingLayer, onClearDrawing]);

  React.useEffect(() => {
    if (drawingMode) {
      map.on('click', handleMapClick);
    } else {
      map.off('click', handleMapClick);
    }
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, drawingMode, handleMapClick]);

  return (
    <Card className="absolute top-4 right-4 p-2 z-[1000] flex flex-col gap-2">
      <Button
        variant={drawingMode === 'marker' ? 'default' : 'outline'}
        size="icon"
        onClick={() => handleToolClick(drawingMode === 'marker' ? null : 'marker')}
      >
        <MapPin className="h-4 w-4" />
      </Button>
      <Button
        variant={drawingMode === 'circle' ? 'default' : 'outline'}
        size="icon"
        onClick={() => handleToolClick(drawingMode === 'circle' ? null : 'circle')}
      >
        <Circle className="h-4 w-4" />
      </Button>
      <Button
        variant={drawingMode === 'rectangle' ? 'default' : 'outline'}
        size="icon"
        onClick={() => handleToolClick(drawingMode === 'rectangle' ? null : 'rectangle')}
      >
        <Square className="h-4 w-4" />
      </Button>
      {drawingLayer && (
        <>
          <Button
            variant="outline"
            size="icon"
            onClick={handleSave}
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleClear}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
    </Card>
  );
};