import { useState, useRef, useEffect } from 'react';
import LeadModal from './modal';
import { DragDropContext } from '@hello-pangea/dnd';
import Column from './Column';
import { useNavigate } from "react-router-dom";


const config = require("../../Apiconfig");

const getInitialColumns = () => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonthIndex = new Date().getMonth();
  const columns = {};

  for (let i = 0; i < 4; i++) {
    const monthIndex = (currentMonthIndex + i) % 12;
    const monthName = monthNames[monthIndex];
    columns[monthName.toLowerCase()] = {
      name: monthName,
      items: []
    };
  }

  return columns;
};

const initialData = {
  columns: getInitialColumns()
};


export default function CRMBoard() {
  const [data, setData] = useState(initialData);
  const [modalShow, setModalShow] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState('');
  const [editingLead, setEditingLead] = useState(null);
  const [addingToColumn, setAddingToColumn] = useState('');
  const [companyData, setCompanyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const popupRef = useRef(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);

  const filterOptions = [
    "My Pipeline",
    "Active",
    "Inactive",
    "Won",
    "Lost"
  ];

  const dateFilterOptions = [
    "Created On",
    "Expected Closing",
    "Date Closed"
  ];

  const groupByOptions = [
    "Company or Person",
    "Email",
    "Company Name",
    "Phone No",
    "GSTIN",
    "Tags",
    "Stage",
    "Address 1",
    "Address 2",
    "Address 3",
    "City",
    "Zip Code",
    "State",
    "Country",
    "Notes",
    "Status",
    "Person Name",
  ];

  const startAddLead = (columnId) => {
    setAddingToColumn(columnId);
    setSelectedColumnId('');
  };

  const cancelAddLead = () => {
    setAddingToColumn('');
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceCol = data.columns[source.droppableId];
    const destCol = data.columns[destination.droppableId];

    if (source.droppableId === destination.droppableId) {
      const items = Array.from(sourceCol.items);
      const [removed] = items.splice(source.index, 1);
      items.splice(destination.index, 0, removed);

      setData((prev) => ({
        columns: {
          ...prev.columns,
          [source.droppableId]: {
            ...sourceCol,
            items
          }
        }
      }));
    } else {
      const sourceItems = Array.from(sourceCol.items);
      const destItems = Array.from(destCol.items);

      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);

      setData((prev) => ({
        columns: {
          ...prev.columns,
          [source.droppableId]: {
            ...sourceCol,
            items: sourceItems
          },
          [destination.droppableId]: {
            ...destCol,
            items: destItems
          }
        }
      }));
    }
  };

  const openModal = (columnId, lead = null) => {
    setSelectedColumnId(columnId);
    setEditingLead(lead);
    setModalShow(true);
    setAddingToColumn('');
  };

  const handleSaveLead = (newLead) => {
    const colId = selectedColumnId || addingToColumn;
    const col = data.columns[colId];

    const updatedItems = editingLead
      ? col.items.map((item) => (item.id === newLead.id ? newLead : item))
      : [...col.items, newLead];

    setData((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [colId]: {
          ...col,
          items: updatedItems
        }
      }
    }));

    setModalShow(false);
    setEditingLead(null);
    setAddingToColumn('');
  };

  const handleDeleteLead = (columnId, leadId) => {
    const col = data.columns[columnId];
    const updatedItems = col.items.filter((item) => item.id !== leadId);

    setData((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [columnId]: {
          ...col,
          items: updatedItems
        }
      }
    }));
  };
  const navigate = useNavigate();
  const columnRefs = useRef({});
  const [highlightedColumn, setHighlightedColumn] = useState(null);


  const handleNavigate = () => {
    navigate("/crmlistpage"); // Pass selectedRows as props to the Input component
  };
  const handleNavigate1 = () => {
    navigate("/RChart"); // Pass selectedRows as props to the Input component
  };

  const handleNavigateKanban = () => {
    navigate("/Forcast"); // Pass selectedRows as props to the Input component
  };

  const handleNavigate6 = () => {
    navigate("/Rpivot"); // Pass selectedRows as props to the Input component
  };


  const handleDeleteColumn = (columnId) => {
    const confirmed = window.confirm("Are you sure you want to delete this month column?");
    if (!confirmed) return;

    setData((prev) => {
      const newColumns = { ...prev.columns };
      delete newColumns[columnId];
      return {
        ...prev,
        columns: newColumns
      };
    });

    // ✅ Fix this line
    delete columnRefs.current[columnId];
  };

  useEffect(() => {
    const fetchCompanyMonthData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${config.apiBaseUrl}/GetCompanyMonth`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const leads = await response.json();

        // Extract unique months from backend data
        const monthOrder = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];

        // Filter out leads with null MonthName and sort by month order
        const validLeads = leads.filter(lead => lead.MonthName);
        const uniqueMonths = [...new Set(validLeads.map(lead => lead.MonthName))];
        const sortedMonths = uniqueMonths.sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));

        // Build columns object dynamically
        const columns = {};
        sortedMonths.forEach(month => {
          columns[month.toLowerCase()] = {
            name: month,
            items: validLeads.filter(lead => lead.MonthName === month).map(lead => ({
              id: lead.OpportunityName + '_' + lead.Contact, // Unique ID
              title: lead.OpportunityName,
              company: lead.Company,
              contact: lead.Contact,
              phone: lead.ContactPhone,
              email: lead.Email_id,
              investment: lead.ExpectedRevenue,
              payment: lead.Payment
            }))
          };
        });

        setData({ columns });
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyMonthData();
  }, []);


  const addNewMonthColumn = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const existingMonths = Object.values(data.columns).map(col => col.name);
    const baseMonthIndex = new Date().getMonth();

    for (let i = 1; i <= 12; i++) {
      const nextMonthIndex = (baseMonthIndex + i) % 12;
      const monthName = monthNames[nextMonthIndex];
      const lowerCaseKey = monthName.toLowerCase();

      if (!existingMonths.includes(monthName)) {
        setData(prev => {
          const updated = {
            ...prev,
            columns: {
              ...prev.columns,
              [lowerCaseKey]: {
                name: monthName,
                items: []
              }
            }
          };

          // Timeout lets React render before scrolling
          setTimeout(() => {
            columnRefs.current[lowerCaseKey]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);


          return updated;
        });

        break;
      }
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowPopup(true);
  };

  const handleSelect = (item) => {
    let tagToSet = item;
    if (item.startsWith("Search ")) {
      const parts = item.split(" for: ");
      const field = parts[0].replace("Search ", "");
      const query = parts[1];
      tagToSet = `${field}: ${query}`;
    }

    if (!selectedTags.includes(tagToSet)) {
      setSelectedTags([...selectedTags, tagToSet]);
    }
    setOpenDropdown(null);
    setShowPopup(false);
    setSearchQuery("");
  };

  const handleRemove = (item) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== item));
  };

  return (
    <>
      <div className="container-fluid Topnav-screen">
        <div className="shadow-lg p-3 mb-2 bg-white rounded">
    <div className="d-flex justify-content-between align-items-center flex-wrap">
        <div className="flex-shrink-0 me-3">
            <h1 className="fs-2 fw-bold mb-0" style={{ textShadow: "1px 1px 2px #ccc" }}>
                Forecast
            </h1>
        </div>

        <div className="flex-grow-1">
            <div className="input-group position-relative" style={{ maxWidth: "950px", margin: "auto" }}>
                <div className="form-control border-start-1 d-flex flex-wrap align-items-center">
                    {selectedTags.map((tag, index) => (
                        <span
                            key={index}
                            className="badge bg-primary me-1"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleRemove(tag)}
                        >
                            {tag} <i className="bi bi-x"></i>
                        </span>
                    ))}
                    <input
                        type="text"
                        className="border-0 p-0 flex-grow-1"
                        placeholder="Search"
                        style={{
                            fontSize: "0.9rem",
                            minWidth: "50px",
                        }}
                        onFocus={() => setShowPopup(true)}
                        onChange={handleSearchChange}
                        value={searchQuery}
                    />
                    <span
                        className="input-group-text bg-white border-end-1"
                        style={{ cursor: "pointer" }}
                    >
                        <i className="bi bi-search"></i>
                    </span>
                </div>
            </div>
        </div>

        <div className="d-flex align-items-center flex-shrink-0 ms-3">
            <addbutton className="btn ms-2 p-1" onClick={handleNavigateKanban}>
                <i className="bi bi-kanban text-dark fs-5"></i>
            </addbutton>

            <addbutton className="btn ms-2 p-1" onClick={handleNavigate}>
                <i className="bi bi-card-list text-dark fs-5"></i>
            </addbutton>

            <addbutton className="btn ms-2 p-1" onClick={handleNavigate1}>
                <i className="bi bi-bar-chart-fill text-dark fs-5"></i>
            </addbutton>

            <addbutton className="btn ms-2 p-1 text-success" onClick={addNewMonthColumn}>
                <i className="bi bi-plus-square fs-5"></i>
            </addbutton>

            <addbutton className="btn ms-2 p-1 text-danger" onClick={() => handleDeleteColumn()}>
                <i className="bi bi-trash fs-5"></i>
            </addbutton>

            <addbutton className="btn ms-2 p-1 text-success" onClick={handleNavigate6}>
                <i className="bi bi-table fs-5"></i>
            </addbutton>
        </div>
    </div>

    {/* Popup Menu (Needs dynamic positioning for robust layout) */}
    {showPopup && (
        <div
            ref={popupRef}
            className="popup-menu shadow ms-3 bg-white border"
            tabIndex="-1"
            style={{
                position: "absolute",
                top: "140px", 
                left: "550px", 
                width: "600px",
                zIndex: 1000,
                padding: "15px",
            }}
        >
            {/* ... (Popup content remains the same) ... */}
            {searchQuery.length > 0 ? (
                <div>
                    <h6 className="fw-bold mb-3">Search for: {searchQuery}</h6>
                    <ul className="list-unstyled">
                        {groupByOptions.map((option, index) => (
                            <li
                                key={index}
                                className="p-1"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSelect(`Search ${option} for: ${searchQuery}`)}
                            >
                                Search {option} for: <strong>{searchQuery}</strong>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="d-flex">
                    <div className="flex-fill border-end pe-3">
                        <h6 className="fw-bold mb-3">Filters</h6>
                        <ul className="list-unstyled">
                            {filterOptions.map((item) => (
                                <li
                                    key={item}
                                    className={`p-1 ${selectedTags.includes(item) ? "bg-light fw-bold" : ""
                                        }`}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleSelect(item)}
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <ul className="list-unstyled mt-3">
                            {dateFilterOptions.map((item) => (
                                <li
                                    key={item}
                                    className="p-1"
                                    style={{ cursor: "pointer", position: "relative" }}
                                    onClick={() =>
                                        setOpenDropdown(openDropdown === item ? null : item)
                                    }
                                >
                                    {item} <i className="bi bi-caret-right"></i>
                                    {openDropdown === item && (
                                        <ul
                                            className="list-unstyled shadow bg-white border rounded mt-1 p-2"
                                            style={{
                                                position: "absolute",
                                                left: "100%",
                                                top: 0,
                                                zIndex: 2000,
                                                minWidth: "180px",
                                            }}
                                        >
                                            {[
                                                "Today",
                                                "This Week",
                                                "This Month",
                                                "Last 30 Days",
                                                "Custom Date",
                                            ].map((subItem) => (
                                                <li
                                                    key={subItem}
                                                    className="p-1"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => handleSelect(`${item}: ${subItem}`)}
                                                >
                                                    {subItem}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <ul className="list-unstyled mt-3">
                            <li>Archived</li>
                            <li className="text-primary">+ Add Custom Filter</li>
                        </ul>
                    </div>
                    <div className="flex-fill border-end px-3">
                        <h6 className="fw-bold mb-3">Group By</h6>
                        <ul className="list-unstyled">
                            {groupByOptions.map((item) => (
                                <li
                                    key={item}
                                    className={`p-1 ${selectedTags.includes(item) ? "bg-light fw-bold" : ""
                                        }`}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleSelect(item)}
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <ul className="list-unstyled mt-3">
                            <li><i className="bi bi-x text-danger"></i> Clear all</li>
                        </ul>
                    </div>
                    <div className="flex-fill ps-3">
                        <h6 className="fw-bold mb-3">Favorites</h6>
                        <ul className="list-unstyled">
                            {["Save current search"].map((item) => (
                                <li
                                    key={item}
                                    className={`p-1 ${selectedTags.includes(item) ? "bg-light fw-bold" : ""
                                        }`}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleSelect(item)}
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    )}
</div>
        <div
          className="shadow-lg p-3 bg-white rounded crm-column-wrapper"
          style={{ overflowX: "auto", whiteSpace: "nowrap" }}
        >
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="d-flex justify-content-between flex-wrap p-1">
              {Object.entries(data.columns).map(([id, column]) => (
                <div
                  key={id}
                  ref={(el) => {
                    if (el) columnRefs.current[id] = el;
                  }}
                  onMouseDown={() => {
                    columnRefs.current.longPressTimeout = setTimeout(() => {
                      setHighlightedColumn(id);
                    }, 2000);
                  }}
                  onMouseUp={() => {
                    clearTimeout(columnRefs.current.longPressTimeout);
                  }}
                  onMouseLeave={() => {
                    clearTimeout(columnRefs.current.longPressTimeout);
                  }}
                  style={{
                    flex: "0 0 300px",
                    marginRight: "16px",
                    backgroundColor:
                      highlightedColumn === id ? "#fff3cd" : "transparent",
                    border:
                      highlightedColumn === id ? "2px solid #ffc107" : "none",
                    borderRadius: "8px",
                    transition: "background-color 0.3s, border 0.3s",
                  }}
                >
                  <Column
                    droppableId={id}
                    column={column}
                    onAddLead={() => startAddLead(id)}
                    onCancelAddLead={cancelAddLead}
                    onSubmitAddLead={handleSaveLead}
                    onEditLead={(lead) => openModal(id, lead)}
                    onDeleteLead={(leadId) => handleDeleteLead(id, leadId)}
                    onDeleteColumn={() => handleDeleteColumn(id)}
                    highlightedColumn={highlightedColumn}
                  />
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>
      </div>

      {modalShow && (
        <LeadModal
          show={modalShow}
          onHide={() => {
            setModalShow(false);
            setEditingLead(null);
          }}
          initialData={editingLead}
          onSubmit={handleSaveLead}
        />
      )}
    </>
  );
}
