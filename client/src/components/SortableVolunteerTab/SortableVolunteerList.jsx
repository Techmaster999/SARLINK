import React, { useEffect, useState } from 'react';
import { useDndMonitor } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { saveVolunteerOrder } from '../../../app/src/api/team.js';
import { SortableVolunteerTab } from './SortableVolunteerTab.jsx';
import './SortableVolunteerList.css';

export function SortableVolunteerList({
  teamId,
  volunteers = [],
  isIstAccount = false,
}) {
  const [orderedVolunteers, setOrderedVolunteers] = useState(volunteers);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    setOrderedVolunteers(volunteers);
  }, [volunteers]);

  async function handleVolunteerReorder(event) {
    if (!isIstAccount || !event.over) return;

    const activeId = String(event.active.id);
    const overId = String(event.over.id);
    if (activeId === overId) return;

    const oldIndex = orderedVolunteers.findIndex(
      (volunteer) => String(volunteer.id) === activeId,
    );
    const newIndex = orderedVolunteers.findIndex(
      (volunteer) => String(volunteer.id) === overId,
    );
    if (oldIndex < 0 || newIndex < 0) return;

    const previousOrder = orderedVolunteers;
    const nextOrder = arrayMove(previousOrder, oldIndex, newIndex);
    setOrderedVolunteers(nextOrder);
    const orderedVolunteerIds = nextOrder.map((volunteer) => String(volunteer.id));

    try {
      await saveVolunteerOrder(teamId, orderedVolunteerIds);
      setSaveError('');
    } catch (error) {
      setOrderedVolunteers(previousOrder);
      setSaveError(error.message);
    }
  }

  useDndMonitor({ onDragEnd: handleVolunteerReorder });

  return (
    <>
      <SortableContext
        items={orderedVolunteers.map((volunteer) => String(volunteer.id))}
        strategy={verticalListSortingStrategy}
      >
        <div className="sar-sortable-volunteer-list">
          {orderedVolunteers.map((volunteer) => (
            <SortableVolunteerTab
              key={volunteer.id}
              volunteer={volunteer}
              isIstAccount={isIstAccount}
            />
          ))}
        </div>
      </SortableContext>
      {saveError && (
        <p className="sar-sortable-volunteer-list__error" role="alert">
          {saveError}
        </p>
      )}
    </>
  );
}
