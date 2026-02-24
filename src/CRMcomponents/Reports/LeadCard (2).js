import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

export default function LeadCard({ item, index, onDoubleClick , onDeleteLead }) {
  const iconStyle = { width: '18px', marginRight: '6px', color: '#0d6efd' };

  return (
    <Draggable draggableId={item.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="card mb-2 shadow-sm p-3"
          style={{
            userSelect: "none",
            background: snapshot.isDragging ? "#e9ecef" : "white",
            width: '100%',
            height:"240px",
            boxSizing: 'border-box',
            ...provided.draggableProps.style,
          }}
        >
          <div className="card-body p-0" onDoubleClick={onDoubleClick}>
            <div className="mb-2 d-flex align-items-center">
              <h6 className="mb-0 fw-bold flex-grow-1">{item.title}</h6>
            </div>

            {item.company && <div className="col-12 mb-1 d-flex align-items-center">
              <i className="bi bi-building" style={iconStyle}></i>
              <span>{item.company}</span>
            </div>}

            {item.contact && <div className="col-12 mb-1 d-flex align-items-center">
              <i className="bi bi-person" style={iconStyle}></i>
              <span>{item.contact}</span>
            </div>}

            {item.email && <div className="col-12 mb-1 d-flex align-items-center">
              <i className="bi bi-envelope" style={iconStyle}></i>
              <span > {item.email}</span>
            </div>}

            {item.phone && <div className="col-12 mb-1 d-flex align-items-center">
              <i className="bi bi-telephone" style={iconStyle}></i>
              <span> {item.phone}</span>
            </div>}

            {item.investment && <div className="col-12 mb-1 d-flex align-items-center">
              <i className="bi bi-cash" style={iconStyle}></i>
              <span> ₹{item.investment}</span>
            </div>}

            {item.payment && <div className="col-12 mb-1 d-flex align-items-center">
              <i className="bi bi-currency-dollar" style={iconStyle}></i>
              <span> ₹{item.payment}</span>
            </div>}

            {/* <span
              className="text-danger d-flex justify-content-end"
              onClick={() => onDeleteLead(item.id)}
            >
              <i className="bi bi-trash" style={{ fontSize: "1.5rem" }}></i>
            </span> */}
          </div>
        </div>
      )}
    </Draggable>
  );
}
