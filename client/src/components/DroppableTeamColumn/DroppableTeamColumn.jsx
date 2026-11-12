import React, { useState } from 'react';
import { useDndMonitor, useDroppable } from '@dnd-kit/core';
import './DroppableTeamColumn.css';

export function DroppableTeamColumn({
  team,
  children,
  currentVolunteerTeamId,
  activeVolunteer,
}) {
  const [isVolunteerOver, setIsVolunteerOver] = useState(false);
  const droppableId = `team-${team.id}`;
  const isCurrentTeam =
    currentVolunteerTeamId != null &&
    String(currentVolunteerTeamId) === String(team.id);
  const { isOver, setNodeRef } = useDroppable({
    id: droppableId,
    disabled: isCurrentTeam || !activeVolunteer,
    data: { team },
  });

  function handleVolunteerDragOver(event) {
    setIsVolunteerOver(
      event.over?.id === droppableId && !isCurrentTeam && Boolean(activeVolunteer),
    );
  }

  function clearVolunteerDragOver() {
    setIsVolunteerOver(false);
  }

  useDndMonitor({
    onDragOver: handleVolunteerDragOver,
    onDragEnd: clearVolunteerDragOver,
    onDragCancel: clearVolunteerDragOver,
  });

  const isHighlighted =
    isOver && isVolunteerOver && !isCurrentTeam && Boolean(activeVolunteer);

  return (
    <div
      ref={setNodeRef}
      className={`sar-team-column${isHighlighted ? ' sar-team-column--drop-target' : ''}`}
      role="group"
      aria-label={`${team.name} team`}
      data-team-id={team.id}
      data-drop-target={isHighlighted}
      style={{
        '--team-tint': team.tint,
        '--team-accent': team.accent,
        '--team-active-tint': `${team.accent}12`,
        '--team-active-border': `${team.accent}60`,
      }}
    >
      {children}
      {isHighlighted && (
        <div className="sar-team-column__drop-placeholder">
          Drop to assign here
        </div>
      )}
    </div>
  );
}
