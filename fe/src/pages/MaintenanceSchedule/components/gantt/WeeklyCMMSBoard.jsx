import React from 'react';

const WeeklyCMMSBoard = ({ assets = [], days = [], onEdit }) => {
  return (
    <div className="cmms-board">
      <div
        className="cmms-header"
        style={{
          gridTemplateColumns: `220px repeat(${days.length}, minmax(140px, 1fr))`,
        }}
      >
        <div className="cmms-asset-header">ASSET / EQUIPMENT</div>

        {days.map((day) => (
          <div key={day.key} className="cmms-day-header">
            {day.label}
          </div>
        ))}
      </div>

      {assets.map((asset) => (
        <div
          key={asset.id}
          className="cmms-row"
          style={{
            gridTemplateColumns: `220px repeat(${days.length}, minmax(140px, 1fr))`,
          }}
        >
          <div className="cmms-asset-cell">
            <div className="fw-bold">{asset.name}</div>
            <small>{asset.code}</small>
          </div>

          {days.map((day) => {
            const workOrder = asset.schedule?.find(
              (item) => item.date === day.key
            );

            return (
              <div key={day.key} className="cmms-slot-cell">
                {workOrder && (
                  <div
                    className={`wo-card ${workOrder.status}`}
                    onClick={() => onEdit?.(workOrder)}
                  >
                    <div className="fw-bold">{workOrder.type}</div>
                    <small>{workOrder.technician}</small>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default WeeklyCMMSBoard;