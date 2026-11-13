import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import './DraggableVolunteerTab.css';

export function DraggableVolunteerTab({ volunteer, isIstAccount = false }) {
  const [activeVolunteer, setActiveVolunteer] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  function handleVolunteerDragStart(event) {
    if (!isIstAccount) {
      setActiveVolunteer(null);
      return;
    }

    setActiveVolunteer(event.active.data.current?.volunteer ?? volunteer);
  }

  function handleVolunteerDragEnd(event) {
    setActiveVolunteer(null);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleVolunteerDragStart}
      onDragEnd={handleVolunteerDragEnd}
      onDragCancel={handleVolunteerDragEnd}
    >
      <DraggableVolunteerTabItem
        volunteer={volunteer}
        isIstAccount={isIstAccount}
      />
      <DragOverlay dropAnimation={null}>
        {activeVolunteer ? (
          <div
            className="sar-volunteer-tab sar-volunteer-tab--overlay"
            aria-hidden="true"
          >
            {activeVolunteer.name}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function DraggableVolunteerTabItem({ volunteer, isIstAccount }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
  } = useDraggable({
    id: volunteer.id,
    disabled: !isIstAccount,
    data: { volunteer },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`sar-volunteer-tab${isDragging ? ' sar-volunteer-tab--dragging' : ''}`}
      aria-label={`Volunteer tab: ${volunteer.name}`}
      data-volunteer-id={volunteer.id}
      data-dragging={isDragging}
      tabIndex={isIstAccount ? 0 : -1}
    >
      {volunteer.name}
    </div>
  );
}
