import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import '../DraggableVolunteerTab/DraggableVolunteerTab.css';

export function SortableVolunteerTab({ volunteer, isIstAccount = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(volunteer.id),
    disabled: !isIstAccount,
    data: { volunteer },
  });
  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`
      : undefined,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`sar-volunteer-tab${isDragging ? ' sar-volunteer-tab--dragging' : ''}`}
      style={style}
      aria-label={`Volunteer tab: ${volunteer.name}`}
      aria-disabled={!isIstAccount}
      data-volunteer-id={volunteer.id}
      data-dragging={isDragging}
      tabIndex={isIstAccount ? 0 : -1}
    >
      {volunteer.name}
    </div>
  );
}

export default SortableVolunteerTab;
